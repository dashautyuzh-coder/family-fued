"use client";

import { useEffect, useMemo, useRef } from "react";
import { fetchQuestions } from "@/lib/data";
import { useGameStore } from "@/lib/store";
import * as a from "@/styles/atoms.css";
import { useRouter } from "next/navigation";
import { playSound } from "@/lib/sounds";
import { useToast } from "@/lib/toast";

// helper to sum revealed points
function sumRevealed<
  T extends { revealed?: boolean; points: number; awarded?: boolean }
>(items: T[]) {
  return items.reduce(
    (acc, x) => (!x.awarded && x.revealed ? acc + x.points : acc),
    0
  );
}

export default function HostPage() {
  const router = useRouter();
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
    addPointsToActiveTeam,
  } = useGameStore();

  const { toast, Toast } = useToast();
  const awardingRef = useRef(false); // debounce guard

  // load questions once
  useEffect(() => {
    async function load() {
      const q = await fetchQuestions();
      loadQuestions(q);
    }
    if (questions.length === 0) load();
  }, [questions.length, loadQuestions]);

  // derived totals
  const revealedTotal = useMemo(
    () => (current ? sumRevealed(current.answers) : 0),
    [current]
  );

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return;

      // numbers 1..9 → toggle that answer
      if (e.key >= "1" && e.key <= "9") {
        const idx = Number(e.key) - 1;
        if (idx < current.answers.length) {
          e.preventDefault();
          toggleReveal(idx);
        }
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          prevQuestion();
          break;
        case "ArrowRight":
          e.preventDefault();
          resetReveals(); // optional: auto reset on next
          nextQuestion();
          break;
        case " ":
          // Space = add strike
          e.preventDefault();
          addStrike();
          playSound("strike");
          toast("❌ Strike added!");
          break;
        case "r":
        case "R":
          e.preventDefault();
          resetReveals();
          break;
        case "a":
        case "A":
          e.preventDefault();
          if (awardingRef.current) return;
          const state = useGameStore.getState();
          const teamIdx = state.activeTeam;
          const pot = sumRevealed(state.current?.answers ?? []);
          if (teamIdx === null || pot <= 0) return;

          awardingRef.current = true;
          state.addPointsToTeam(teamIdx as 0 | 1, pot);
          playSound("award");
          toast(`🏆 +${pot} points to ${state.teams[teamIdx].name}!`);
          state.resetReveals();
          setTimeout(() => (awardingRef.current = false), 500);
          break;
        case "t":
        case "T":
          e.preventDefault();
          if (activeTeam === null) return;
          setActiveTeam((activeTeam === 0 ? 1 : 0) as 0 | 1);
          toast(
            `🎯 Switched to ${
              teams[activeTeam === 0 ? 1 : 0].name
            } as active team`
          );
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    current,
    nextQuestion,
    prevQuestion,
    toggleReveal,
    resetReveals,
    addStrike,
    addPointsToActiveTeam,
    activeTeam,
    setActiveTeam,
    revealedTotal,
    teams,
    toast,
  ]);

  if (!current)
    return <div className={a.container}>Loading host controls…</div>;

  return (
    <div className={a.container}>
      {/* Sticky header with progress + active team */}
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
          <h1 style={{ margin: 0, fontSize: 20 }}>🎤 Host Controls</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {teams.map((team, i) => (
              <button
                key={i}
                onClick={() => setActiveTeam(i as 0 | 1)}
                className={a.button({
                  variant: activeTeam === i ? "flavorGold" : "ghost",
                  size: "sm",
                })}
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
          }}
        >
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>
            Revealed total:{" "}
            <strong style={{ color: "#F7C948" }}>{revealedTotal}</strong>
          </span>
          <span style={{ opacity: 0.9 }}>
            ⌨️ Shortcuts: 1–9 toggle • ←/→ nav • Space strike • A award • T swap
          </span>
        </div>
      </div>

      {/* Question */}
      <div style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 8, lineHeight: 1.25 }}>{current.prompt}</h2>
      </div>

      {/* Answers list */}
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {current.answers.map((ans, i) => (
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
              {ans.text}
            </span>
            <span
              style={{
                width: 60,
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                opacity: ans.revealed ? 1 : 0.6,
              }}
            >
              {ans.points}
            </span>
            <button
              onClick={() => toggleReveal(i)}
              className={a.button({
                variant: ans.revealed ? "ghost" : "primary",
                size: "sm",
              })}
            >
              {ans.revealed ? "Hide" : "Reveal"}
            </button>
          </div>
        ))}
      </div>

      {/* Strikes */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3>❌ Strikes</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {Array.from({ length: strikes }).map((_, i) => (
            <span key={i} style={{ fontSize: 28, color: "#EF4444" }}>
              X
            </span>
          ))}
        </div>
        {/* 🎮 Host Actions */}
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
          <h3 style={{ margin: "0 8px 0 0", fontSize: 15, opacity: 0.8 }}>
            🎮 Host Controls:
          </h3>

          {/* ❌ Strike */}
          <button
            onClick={() => {
              addStrike();
              playSound("strike");
              toast("❌ Strike added!");
            }}
            className={a.button({ variant: "secondary", size: "sm" })}
            title="Add a strike (Space key)"
          >
            ❌ Add Strike
          </button>

          {/* 🧹 Clear Strikes */}
          <button
            onClick={clearStrikes}
            className={a.button({ variant: "ghost", size: "sm" })}
            title="Remove all strikes"
          >
            🧹 Clear Strikes
          </button>

          {/* 🏆 Award Points */}
          <button
            onClick={() => {
              if (activeTeam === null || revealedTotal <= 0) return;

              // Capture state *right now* (no stale closure)
              const state = useGameStore.getState();
              if (!state.current) return;
              const teamIdx = state.activeTeam;
              const pot = sumRevealed(state.current?.answers ?? []);

              if (teamIdx === null || pot <= 0) return;

              // ✅ Award points, but DO NOT reset reveals
              state.addPointsToTeam(teamIdx, pot);

              playSound("award");
              toast(`🏆 +${pot} points to ${state.teams[teamIdx].name}!`);

              // Instead of resetting, zero out the pot for this round:
              // Mark those answers as already awarded
              const updatedAnswers = state.current?.answers.map((a) => ({
                ...a,
                // add a new property "awarded" to prevent re-awarding
                awarded: a.revealed ? true : a.awarded,
              }));

              if (updatedAnswers) {
                state.current.answers = updatedAnswers;
                const updatedQuestions = [...state.questions];
                updatedQuestions[state.currentIndex] = {
                  ...state.current,
                  answers: updatedAnswers,
                };
                useGameStore.setState({ questions: updatedQuestions });
              }
            }}
            disabled={activeTeam === null || revealedTotal === 0}
            className={a.button({ variant: "flavorGreen", size: "sm" })}
            title="Award revealed points to the active team (A key)"
          >
            🏆 Award{" "}
            {revealedTotal > 0 ? `+${revealedTotal} pts` : "Revealed Points"}
          </button>

          {/* 🎯 Active Team Display */}
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

      {/* Footer buttons */}
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
