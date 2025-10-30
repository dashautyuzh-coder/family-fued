"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

import { useGameStore } from "@/lib/store";
import { fetchFaceoffQuestions } from "@/lib/data";
import { bestMatch } from "@/lib/fuzzy";

import * as f from "@/styles/faceoff.css";
import * as a from "@/styles/atoms.css";
import * as b from "@/styles/board.css";
import { vars } from "@/styles/theme.css";
import { playSound } from "@/lib/sounds";
import FaceoffSplash from "@/components/FaceoffSplash";

function shuffle<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function FaceoffPage() {
  const router = useRouter();
  const {
    teams,
    setFaceoffWinner,
    resetFaceoff,
    faceoffWinner,
    faceoffQuestion,
    setFaceoffQuestion,
    faceoffDone,
  } = useGameStore();

  const [answers, setAnswers] = useState(["", ""]);
  const [scores, setScores] = useState<number[]>([0, 0]); // match %
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [awardedAny, setAwardedAny] = useState(false);
  const [evalSummary, setEvalSummary] = useState<string | null>(null);

  // ephemeral "+pts" flash near team name
  const [awardFlash, setAwardFlash] = useState<{
    team: 0 | 1;
    pts: number;
  } | null>(null);

  const handleSplashComplete = () => setReady(true);

  useEffect(() => {
    if (faceoffQuestion) {
      setRevealed(Array(faceoffQuestion.answers.length).fill(false));
      setEvalSummary(null);
      setAwardedAny(false);
    }
  }, [faceoffQuestion]);

  // Load all questions
  useEffect(() => {
    async function loadAll() {
      const q = await fetchFaceoffQuestions();
      const shuffled = shuffle(q);
      useGameStore.getState().loadQuestions(shuffled);
      setFaceoffQuestion(shuffled[0]);
      setLoading(false);
    }
    resetFaceoff();
    loadAll();
  }, [resetFaceoff, setFaceoffQuestion]);

  // Confetti when winner is set
  useEffect(() => {
    if (faceoffDone && faceoffWinner !== null) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 250,
          spread: 100,
          origin: { y: 0.7, x: faceoffWinner === 0 ? 0.2 : 0.8 },
          colors: [
            faceoffWinner === 0
              ? vars.color.flavorGreen
              : vars.color.flavorPink,
            vars.color.flavorGold,
          ],
        });
      }, 300);
      playSound("fireworks");
      return () => clearTimeout(timer);
    }
  }, [faceoffDone, faceoffWinner]);

  if (!ready) return <FaceoffSplash onComplete={handleSplashComplete} />;
  if (loading || !faceoffQuestion)
    return <main className={f.stage}>Loading face-off question…</main>;

  // Evaluate similarity (no points here)
  const evaluateAnswers = () => {
    const correctAnswers = faceoffQuestion.answers.map((a) => a.text);
    const points = faceoffQuestion.answers.map((a) => a.points);

    const teamResults = answers.map((ans) => {
      const { index, score } = bestMatch(ans, correctAnswers);
      const earned = index >= 0 && score >= 0.45 ? points[index] : 0;
      return { match: Math.round(score * 100), earned };
    });

    setScores(teamResults.map((r) => r.match));
    setEvalSummary(
      `Matches — ${teams[0].name}: ${teamResults[0].match}% (could earn up to ${teamResults[0].earned} pts) • ` +
        `${teams[1].name}: ${teamResults[1].match}% (could earn up to ${teamResults[1].earned} pts). ` +
        `Pick a winner, then click tiles to award.`
    );
  };

  const handleNextQuestion = () => {
    const { nextQuestion, questions, currentIndex } = useGameStore.getState();
    if (questions.length > 0 && currentIndex < questions.length - 1) {
      nextQuestion();
      const nextQ = questions[currentIndex + 1];
      setFaceoffQuestion(nextQ);
      setRevealed(Array(nextQ.answers.length).fill(false));
      setAnswers(["", ""]);
      setScores([0, 0]);
      setAwardedAny(false);
      setEvalSummary(null);
      setFaceoffWinner(null);
    } else {
      setEvalSummary("No more face-off questions left!");
    }
  };

  const handleChooseWinner = (teamIndex: 0 | 1) => {
    setFaceoffWinner(teamIndex);
    playSound("award");
  };

  const handleRevealAnswer = (idx: number) => {
    if (!faceoffQuestion) return;
    if (revealed[idx]) return;

    if (faceoffWinner === null) {
      playSound("strike");
      setEvalSummary("Choose a winner to enable scoring.");
      return;
    }

    // reveal locally
    setRevealed((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });

    // award
    const pts = faceoffQuestion.answers[idx].points;
    const { addPointsToTeam } = useGameStore.getState();
    addPointsToTeam(faceoffWinner, pts);
    setAwardedAny(true);
    playSound("award");

    // flash +pts by winner name for 1.2s
    setAwardFlash({ team: faceoffWinner, pts });
    setTimeout(
      () =>
        setAwardFlash((cur) =>
          cur?.team === faceoffWinner && cur?.pts === pts ? null : cur
        ),
      1200
    );
  };

  return (
    <main className={f.stage}>
      <h1 className={f.question}>⚡ {faceoffQuestion.prompt}</h1>

      {/* Podiums with running totals + ephemeral "+pts" */}
      <div className={f.podiums}>
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`${f.podium} ${
              faceoffWinner === i ? f.podiumActive : ""
            }`}
          >
            <h2
              style={{
                color: i === 0 ? vars.color.flavorGreen : vars.color.flavorPink,
                position: "relative",
              }}
            >
              {teams[i].name} — {teams[i].score} pts
              {awardFlash && awardFlash.team === i && (
                <span style={{ marginLeft: 8, fontWeight: 700 }}>
                  +{awardFlash.pts}
                </span>
              )}
            </h2>
            <input
              className={f.answerInput}
              placeholder="Type your answer..."
              value={answers[i]}
              onChange={(e) => {
                const next = [...answers];
                next[i] = e.target.value;
                setAnswers(next);
              }}
              disabled={faceoffWinner !== null}
            />
            {scores[i] > 0 && (
              <p style={{ marginTop: 8, color: vars.color.gold }}>
                🔍 Match: {scores[i]}%
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className={f.evaluateBtn}>
        <button
          onClick={evaluateAnswers}
          className={a.button({ variant: "flavorGold", size: "lg" })}
        >
          Evaluate
        </button>
        <button
          onClick={handleNextQuestion}
          className={a.button({ variant: "secondary", size: "lg" })}
        >
          ⏭ Next Question
        </button>
      </div>

      {/* Evaluation summary (after Evaluate) */}
      {evalSummary && <p>{evalSummary}</p>}

      {/* Winner panel + reveal board */}
      <div className={f.resultText}>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {faceoffWinner === null ? (
            <>
              <div className={b.winnerGlow}>Choose the face-off winner</div>
              <button
                onClick={() => handleChooseWinner(0)}
                className={a.button({ variant: "flavorGreen", size: "lg" })}
              >
                ✅ {teams[0].name} Wins
              </button>
              <button
                onClick={() => handleChooseWinner(1)}
                className={a.button({ variant: "flavorPink", size: "lg" })}
              >
                ✅ {teams[1].name} Wins
              </button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className={b.winnerGlow}>
                🏅 Winner: {teams[faceoffWinner].name}
              </span>
              <button
                onClick={() => setFaceoffWinner(null)}
                disabled={awardedAny}
                className={a.button({ variant: "secondary", size: "sm" })}
                title={
                  awardedAny
                    ? "Winner locked after points were awarded"
                    : "Change winner"
                }
              >
                {awardedAny ? "Locked" : "Change"}
              </button>
            </div>
          )}
        </div>

        {/* Reveal board */}
        <div className={f.revealBoard}>
          {faceoffQuestion.answers.map((ans, i) => {
            const isRevealed = revealed[i];
            const clickable = !isRevealed && faceoffWinner !== null;
            return (
              <button
                key={i}
                onClick={() => clickable && handleRevealAnswer(i)}
                className={f.revealTile}
                disabled={!clickable}
                style={{
                  cursor: clickable ? "pointer" : "not-allowed",
                  opacity: isRevealed ? 0.6 : faceoffWinner === null ? 0.5 : 1,
                  border:
                    faceoffWinner !== null && !isRevealed
                      ? `2px dashed ${vars.color.flavorGold}`
                      : "2px solid transparent",
                }}
                aria-pressed={isRevealed}
                title={
                  faceoffWinner === null
                    ? "Choose a winner first to bank points"
                    : isRevealed
                    ? "Already awarded"
                    : "Click to award points to the winning team"
                }
              >
                {i + 1}. {ans.text} — {ans.points} pts {isRevealed ? "✅" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {faceoffWinner !== null && (
        <div className={f.winnerSection}>
          <h2 className={b.winnerGlow}>
            🏆 {teams[faceoffWinner].name} takes control! 🏆
          </h2>
          <button
            onClick={() => router.push("/game")}
            className={a.button({ variant: "flavorGold", size: "lg" })}
          >
            Go to Game Board →
          </button>
        </div>
      )}
    </main>
  );
}
