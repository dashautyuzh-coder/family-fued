"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as b from "@/styles/jeopardy/board.css";
import * as a from "@/styles/shared/atoms.css";
import { useJeopardyStore, isBoardComplete } from "@/lib/jeopardy/store";
import { themeColors } from "@/lib/jeopardy/theme";
import { useToast } from "@/lib/shared/toast";
import { sound } from "@/lib/shared/sounds";
import { isTypingTarget } from "@/lib/shared/keyboard";

export default function JeopardyBoardPage() {
  const router = useRouter();
  const { toast, Toast } = useToast();
  const {
    board,
    teams,
    activeTeam,
    pickerTeam,
    activeClue,
    answerRevealed,
    setActiveTeam,
    openClue,
    revealAnswer,
    closeClue,
    resolveClue,
  } = useJeopardyStore();

  const complete = useMemo(() => isBoardComplete(board), [board]);
  const theme = board?.theme ?? "ag1";
  const colors = themeColors(theme);

  const openCategory =
    activeClue !== null ? board?.categories[activeClue.categoryIndex] : null;
  const openClueData =
    openCategory && activeClue !== null
      ? openCategory.clues[activeClue.clueIndex]
      : null;

  // What to show in the clue box after judging, instead of it going blank —
  // the category/value/answer plus the outcome, until the next clue opens.
  const [lastResult, setLastResult] = useState<{
    category: string;
    value: number;
    prefix: string;
    response: string;
    outcome: "correct" | "incorrect" | "skip";
    teamName: string | null;
  } | null>(null);

  const reveal = () => {
    revealAnswer();
    sound.play("ding");
  };

  const judge = (outcome: "correct" | "incorrect" | "skip") => {
    if (!openClueData || !openCategory) return;
    if (outcome !== "skip" && activeTeam === null) {
      toast("🎯 Pick an active team first");
      return;
    }
    const teamName = activeTeam !== null ? teams[activeTeam].name : null;
    if (outcome === "correct") {
      sound.play("award");
      if (teamName) toast(`✅ +$${openClueData.value} to ${teamName}`);
    } else if (outcome === "incorrect") {
      sound.play("wrong:random");
      if (teamName) toast(`❌ -$${openClueData.value} from ${teamName}`);
    }
    setLastResult({
      category: openCategory.name,
      value: openClueData.value,
      prefix: openClueData.prefix,
      response: openClueData.response,
      outcome,
      teamName,
    });
    resolveClue(outcome);
  };

  // Keyboard shortcuts — no text inputs on this page, but guard anyway.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (e.key === "1") setActiveTeam(0);
      if (e.key === "2") setActiveTeam(1);
      if (!openClueData) return;
      if (e.key === "Escape") closeClue();
      if (e.key === " " && !answerRevealed) reveal();
      if (!answerRevealed) return;
      if (e.key.toLowerCase() === "c") judge("correct");
      if (e.key.toLowerCase() === "x") judge("incorrect");
      if (e.key.toLowerCase() === "s") judge("skip");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openClueData, answerRevealed, activeTeam, teams]);

  if (!board) {
    return (
      <div className={b.hostPageBg({ theme })}>
        <div className={b.stage}>
          <p style={{ textAlign: "center" }}>
            No board loaded.{" "}
            <a href="/jeopardy" style={{ textDecoration: "underline" }}>
              Go set up teams first →
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={b.hostPageBg({ theme })}>
      <div className={b.stage}>
        <h1 className={b.title({ theme })}>
          {theme === "sprinkle" ? "🌸 The Fourth Prince" : "🧠 AG1opardy"}
        </h1>
        <p className={b.subtitle({ theme })}>{board.title}</p>

        {/* Active team toggles */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {teams.map((team, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveTeam(i as 0 | 1);
                sound.play("ding");
              }}
              className={b.teamToggle({ theme, active: activeTeam === i })}
            >
              🎯 {team.name} · ${team.score}
            </button>
          ))}
        </div>

        {!openClueData && pickerTeam !== null && (
          <p
            style={{
              textAlign: "center",
              color: colors.muted,
              marginTop: -8,
              marginBottom: 16,
            }}
          >
            🎲 <strong style={{ color: colors.text }}>{teams[pickerTeam].name}</strong>{" "}
            picks the next clue
          </p>
        )}

        <div className={b.board({ theme })}>
          <div className={b.grid}>
            {board.categories.map((cat, ci) => (
              <div key={ci} className={b.categoryHeader({ theme })}>
                {cat.name}
              </div>
            ))}
            {Array.from({ length: 5 }).map((_, clueIdx) =>
              board.categories.map((cat, ci) => {
                const clue = cat.clues[clueIdx];
                return (
                  <button
                    key={`${ci}-${clueIdx}`}
                    onClick={() => {
                      setLastResult(null);
                      openClue(ci, clueIdx);
                      sound.play("ding");
                    }}
                    disabled={clue.answered}
                    className={`${b.cell({ theme })} ${
                      clue.answered ? b.cellAnswered({ theme }) : ""
                    }`}
                  >
                    {clue.answered ? "" : `$${clue.value}`}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        {/* Clue panel — inline below the board. Answer stays hidden until
          "Reveal Answer" is clicked, so one shared board works for everyone
          without spoiling anything the moment a clue opens. Once judged, it
          switches to a short recap instead of going blank. */}
        {openClueData ? (
          <div className={b.clueSection}>
            <div className={b.clueCard({ theme })}>
              <div className={b.clueCategory({ theme })}>
                {openCategory?.name}
              </div>
              <div className={b.clueValue({ theme })}>
                ${openClueData.value}
              </div>
              <div className={b.clueText} style={{ color: colors.text }}>
                {openClueData.text}
              </div>

              {answerRevealed ? (
                <>
                  <div className={b.clueResponse({ theme })}>
                    <div className={b.clueResponseLabel({ theme })}>Answer</div>
                    <span className={b.cluePrefix({ theme })}>
                      {openClueData.prefix}
                    </span>
                    <span className={b.clueAnswerText({ theme })}>
                      {openClueData.response}?
                    </span>
                  </div>

                  <div
                    className={a.buttonsRow}
                    style={{ marginTop: 24, justifyContent: "center" }}
                  >
                    <button
                      onClick={() => judge("correct")}
                      className={b.judgeButton({ theme, tone: "correct" })}
                      title="C"
                    >
                      ✅ Correct
                    </button>
                    <button
                      onClick={() => judge("incorrect")}
                      className={b.judgeButton({ theme, tone: "incorrect" })}
                      title="X"
                    >
                      ❌ Incorrect
                    </button>
                    <button
                      onClick={() => judge("skip")}
                      className={b.judgeButton({ theme, tone: "neutral" })}
                      title="S"
                    >
                      ⏭ Skip
                    </button>
                  </div>
                </>
              ) : (
                <div
                  className={a.buttonsRow}
                  style={{ marginTop: 24, justifyContent: "center" }}
                >
                  <button
                    onClick={reveal}
                    className={b.navButton({ theme, tone: "gold" })}
                    title="Space"
                  >
                    👀 Reveal Answer
                  </button>
                  <button
                    onClick={closeClue}
                    className={b.judgeButton({ theme, tone: "neutral" })}
                    title="Esc"
                  >
                    ← Back
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          lastResult && (
            <div className={b.clueSection}>
              <div className={b.clueCard({ theme })}>
                <div className={b.clueCategory({ theme })}>
                  {lastResult.category}
                </div>
                <div className={b.clueValue({ theme })}>
                  ${lastResult.value}
                </div>

                <div
                  className={b.clueResponse({ theme })}
                  style={{ marginTop: 0, borderTop: "none", paddingTop: 0 }}
                >
                  <div className={b.clueResponseLabel({ theme })}>
                    {lastResult.outcome === "correct" && "✅ Correct"}
                    {lastResult.outcome === "incorrect" && "❌ Incorrect"}
                    {lastResult.outcome === "skip" && "⏭ Skipped"}
                    {lastResult.teamName && lastResult.outcome !== "skip" && (
                      <>
                        {" — "}
                        {lastResult.outcome === "correct" ? "+" : "-"}$
                        {lastResult.value}{" "}
                        {lastResult.outcome === "correct" ? "to" : "from"}{" "}
                        {lastResult.teamName}
                      </>
                    )}
                  </div>
                  <span className={b.cluePrefix({ theme })}>
                    {lastResult.prefix}
                  </span>
                  <span className={b.clueAnswerText({ theme })}>
                    {lastResult.response}?
                  </span>
                </div>
              </div>
            </div>
          )
        )}

        {/* Footer scoreboard */}
        <div className={b.footer({ theme })}>
          {teams.map((team, i) => (
            <div
              key={i}
              className={b.teamBox({ theme, active: activeTeam === i })}
            >
              <strong>{team.name}</strong>
              <span className={b.score({ theme })}>${team.score}</span>
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div
          className={a.buttonsRow}
          style={{ marginTop: 28, justifyContent: "center" }}
        >
          <button
            onClick={() => router.push("/jeopardy")}
            className={b.navButton({ theme, tone: "default" })}
          >
            Setup →
          </button>
          {complete && (
            <button
              onClick={() => router.push("/jeopardy/end-game")}
              className={b.navButton({ theme, tone: "gold" })}
            >
              🏁 End Game →
            </button>
          )}
        </div>

        {Toast}
      </div>
    </div>
  );
}
