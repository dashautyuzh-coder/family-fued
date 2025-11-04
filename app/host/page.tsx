"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchQuestions } from "@/lib/data";
import { useGameStore } from "@/lib/store";
import * as a from "@/styles/atoms.css";
import { playSound, sound } from "@/lib/sounds";
import { useToast } from "@/lib/toast";

// ---- helpers --------------------------------------------------------------

/** Sum revealed-but-NOT-yet-awarded points */
function sumRevealed<
  T extends { revealed?: boolean; points?: number; awarded?: boolean }
>(items: T[] = []) {
  return items.reduce(
    (acc, x) => (!x.awarded && x.revealed ? acc + (x.points ?? 0) : acc),
    0
  );
}

/** Safely mark currently revealed answers as awarded (or hide/reset them). */
function clearOrLockPot(opts: {
  mode: "hide" | "lock"; // "hide" = reveal=false; "lock" = keep revealed but mark awarded=true
}) {
  const state = useGameStore.getState();
  const cur = state.current;
  if (!cur || !Array.isArray(cur.answers) || cur.answers.length === 0) return;

  const updatedAnswers =
    opts.mode === "hide"
      ? cur.answers.map((a) => ({ ...a, revealed: false, awarded: false }))
      : cur.answers.map((a) => ({
          ...a,
          awarded: a.revealed ? true : a.awarded,
        }));

  const updatedQuestions = [...state.questions];
  updatedQuestions[state.currentIndex] = {
    ...cur,
    answers: updatedAnswers,
  };

  useGameStore.setState({
    questions: updatedQuestions,
    current: { ...cur, answers: updatedAnswers },
  });
}

// ---- component ------------------------------------------------------------

type RoundInfo = { title?: string; category?: string } | null;

export default function HostPage() {
  const router = useRouter();
  const { toast, Toast } = useToast();

  const {
    questions,
    current,
    currentIndex,
    loadQuestions,
    nextQuestion,
    prevQuestion,
    toggleReveal,
    resetReveals,
    addStrike,
    clearStrikes,
    strikes,
    teams,
    setActiveTeam,
    activeTeam,
    currentRound,
  } = useGameStore();

  const awardingRef = useRef(false);
  const [roundInfo, setRoundInfo] = useState<RoundInfo>(null);

  // ✅ Load questions for the current round (safe/fallbacks)
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const round = await fetchQuestions(currentRound); // { title?, category?, questions? }
        if (ignore) return;

        const list = Array.isArray(round?.questions) ? round!.questions : [];
        const withMeta = list.map((q: any, i: number) => ({
          ...q,
          index: i,
          category: round?.category ?? `Round ${currentRound}`,
        }));

        loadQuestions(withMeta);
        setRoundInfo({
          title: round?.title ?? `Round ${currentRound}`,
          category: round?.category ?? "General Knowledge",
        });
      } catch (err) {
        console.error(
          "❌ Failed to load host questions for round",
          currentRound,
          err
        );
        loadQuestions([]);
        setRoundInfo({
          title: `Round ${currentRound}`,
          category: "Unavailable",
        });
      }
    })();

    return () => {
      ignore = true;
    };
  }, [currentRound, loadQuestions]);

  // ✅ Derived total of revealed-but-unawarded points
  const revealedTotal = useMemo(
    () => (current ? sumRevealed(current.answers) : 0),
    [current]
  );

  // ✅ Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const state = useGameStore.getState();
      const cur = state.current;
      if (!cur) return;

      // 1–9 toggles answer
      if (e.key >= "1" && e.key <= "9") {
        const idx = Number(e.key) - 1;
        if (idx < (cur.answers?.length ?? 0)) {
          e.preventDefault();
          const wasRevealed = !!cur.answers[idx]?.revealed;
          toggleReveal(idx);
          if (!wasRevealed) {
            sound.play("correct:random");
          }
        }
        return;
      }

      switch (e.key) {
        case "ArrowLeft": {
          e.preventDefault();
          if (state.currentIndex > 0) prevQuestion();
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          if (state.currentIndex < state.questions.length - 1) {
            resetReveals();
            prevSafeClearPot("hide"); // optional: clear pot on next q
            nextQuestion();
          }
          break;
        }
        case " ": {
          // Space = strike
          e.preventDefault();
          addStrike();
          sound.play("strike");
          sound.play("wrong:random");
          toast("❌ Strike added!");
          break;
        }
        case "r":
        case "R": {
          e.preventDefault();
          resetReveals();
          // Also clear awarded flags so you can re-award later if re-revealed
          clearOrLockPot({ mode: "hide" });
          break;
        }
        case "a":
        case "A": {
          // Award current pot to active team (no double-dip)
          e.preventDefault();
          if (awardingRef.current) return;
          const teamIdx = state.activeTeam;
          const pot = sumRevealed(state.current?.answers ?? []);
          if (teamIdx === null || pot <= 0) return;

          awardingRef.current = true;
          state.addPointsToTeam(teamIdx as 0 | 1, pot);
          sound.play("award");
          toast(`🏆 +${pot} points to ${state.teams[teamIdx].name}!`);

          // Mark those revealed answers as awarded (so pot = 0 now)
          clearOrLockPot({ mode: "lock" });

          setTimeout(() => (awardingRef.current = false), 500);
          break;
        }
        case "t":
        case "T": {
          // Swap active team AND clear the pot to prevent accumulation
          e.preventDefault();
          if (state.activeTeam === null) return;
          const newIdx = state.activeTeam === 0 ? 1 : 0;
          setActiveTeam(newIdx as 0 | 1);
          toast(`🎯 Now controlling: ${state.teams[newIdx].name}`);

          // 🔒 Prevent the next team from re-awarding the same reveals:
          // Choose one of these behaviors; "hide" is more Feud-like.
          clearOrLockPot({ mode: "hide" }); // hide reveals and reset awarded flags
          break;
        }
      }
    }

    // small helper to clear pot before moving to next question
    function prevSafeClearPot(mode: "hide" | "lock") {
      try {
        clearOrLockPot({ mode });
      } catch {
        /* noop */
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    addStrike,
    prevQuestion,
    nextQuestion,
    resetReveals,
    toggleReveal,
    setActiveTeam,
    toast,
  ]);

  if (!current)
    return (
      <div className={a.container}>
        Loading host controls for round {currentRound}…{Toast}
      </div>
    );

  // ---- UI -----------------------------------------------------------------

  return (
    <div className={a.container}>
      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(2,6,23,0.9)",
          backdropFilter: "blur(6px)",
          padding: "12px 12px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20 }}>
            🎤 Host Controls — {roundInfo?.title || `Round ${currentRound}`}
          </h1>

          {/* Active team toggles */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {teams.map((team, i) => (
              <button
                key={i}
                onClick={() => setActiveTeam(i as 0 | 1)}
                className={a.button({
                  variant: activeTeam === i ? "flavorGold" : "ghost",
                  size: "sm",
                })}
                title={`Set active team: ${team.name}`}
              >
                {team.name} · {team.score}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            justifyContent: "space-between",
            color: "#9aa6b2",
            fontSize: 13,
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          <span>
            Question {Math.min(currentIndex + 1, Math.max(questions.length, 1))}{" "}
            of {questions.length || 0}
          </span>
          <span>
            Category:{" "}
            <strong style={{ color: "#F7C948" }}>
              {roundInfo?.category || "General Knowledge"}
            </strong>
          </span>
          <span>
            Revealed total:{" "}
            <strong style={{ color: "#F7C948" }}>{revealedTotal}</strong>
          </span>
        </div>

        {/* Keyboard helper text */}
        <div
          style={{
            marginTop: 6,
            color: "#808da0",
            fontSize: 12,
            textAlign: "right",
            fontStyle: "italic",
          }}
        >
          ⌨️ Shortcuts: 1–9 toggle • ←/→ navigate • Space = strike • A = award •
          T = swap teams • R = reset
        </div>
      </div>

      {/* Question prompt */}
      <div style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 8, lineHeight: 1.25 }}>
          {current.prompt || "Untitled Question"}
        </h2>
      </div>

      {/* Answers */}
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {(current.answers ?? []).map((ans, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto auto",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: ans.revealed ? "rgba(47,197,94,0.15)" : "transparent",
            }}
          >
            <span style={{ width: 28, textAlign: "right", opacity: 0.7 }}>
              {i + 1}
            </span>
            <span style={{ fontWeight: 600, opacity: ans.revealed ? 1 : 0.7 }}>
              {ans.text ?? "(blank)"}
            </span>
            <span
              style={{
                width: 60,
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                opacity: ans.revealed ? 1 : 0.6,
              }}
              title={ans.awarded ? "Already awarded" : undefined}
            >
              {ans.points ?? 0}
            </span>
            <button
              onClick={() => {
                toggleReveal(i);
                // sound.play("correct:random");
              }}
              className={a.button({
                variant: ans.revealed ? "ghost" : "primary",
                size: "sm",
              })}
              title={ans.revealed ? "Hide answer" : "Reveal answer"}
            >
              {ans.revealed ? "Hide" : "Reveal"}
            </button>
          </div>
        ))}
      </div>

      {/* Strikes & host tools */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3>❌ Strikes</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {Array.from({ length: Math.max(0, strikes) }).map((_, i) => (
            <span key={i} style={{ fontSize: 28, color: "#EF4444" }}>
              X
            </span>
          ))}
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            marginTop: 16,
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={() => {
              addStrike();
              sound.play("strike");
              sound.play("wrong:random");
              toast("❌ Strike added!");
            }}
            className={a.button({ variant: "secondary", size: "sm" })}
          >
            ❌ Add Strike
          </button>

          <button
            onClick={clearStrikes}
            className={a.button({ variant: "ghost", size: "sm" })}
          >
            🧹 Clear Strikes
          </button>

          <button
            onClick={() => {
              const state = useGameStore.getState();
              if (state.activeTeam === null) return;
              const pot = sumRevealed(state.current?.answers ?? []);
              if (pot <= 0) return;

              state.addPointsToTeam(state.activeTeam, pot);
              sound.play("award");
              sound.play("points:random");

              toast(`🏆 +${pot} points to ${teams[state.activeTeam].name}!`);

              // prevent re-award
              clearOrLockPot({ mode: "lock" });
            }}
            disabled={activeTeam === null || revealedTotal === 0}
            className={a.button({ variant: "flavorGreen", size: "sm" })}
            title={
              revealedTotal > 0
                ? `Award +${revealedTotal} pts`
                : "Nothing to award"
            }
          >
            🏆 Award {revealedTotal > 0 ? `+${revealedTotal} pts` : ""}
          </button>

          {/* Active team display */}
          <div
            style={{
              marginLeft: "auto",
              fontSize: 14,
              opacity: 0.8,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>🎯 Active Team:</span>
            {activeTeam !== null ? (
              <strong
                style={{
                  color:
                    activeTeam === 0
                      ? "var(--color-flavorGreen, #77C19A)"
                      : "var(--color-flavorPink, #E5657E)",
                }}
              >
                {teams[activeTeam].name}
              </strong>
            ) : (
              <em style={{ color: "#9aa6b2" }}>None</em>
            )}
          </div>
        </div>
      </div>

      {/* Footer navigation */}
      <section
        className={a.buttonsRow}
        style={{
          marginTop: 32,
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={() => router.push("/setup")}
          className={a.button({ variant: "secondary", size: "lg" })}
        >
          Setup →
        </button>
        <button
          onClick={() => router.push("/game")}
          className={a.button({ variant: "primary", size: "lg" })}
        >
          Game →
        </button>
        <button
          onClick={() => router.push("/end-game")}
          className={a.button({ variant: "secondary", size: "lg" })}
        >
          End Game →
        </button>
      </section>

      {Toast}
    </div>
  );
}
