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

export default function FaceoffPage() {
  const router = useRouter();
  const {
    teams,
    setFaceoffWinner,
    resetFaceoff,
    faceoffWinner,
    faceoffQuestion,
    setFaceoffQuestion,
  } = useGameStore();

  const [answers, setAnswers] = useState(["", ""]);
  const [scores, setScores] = useState<number[]>([0, 0]);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const handleSplashComplete = () => {
    setReady(true);
  };

  // Load all questions into store
  useEffect(() => {
    async function loadAll() {
      const q = await fetchFaceoffQuestions();
      useGameStore.getState().loadQuestions(q);
      setFaceoffQuestion(q[0]);
      setLoading(false);
    }
    resetFaceoff();
    loadAll();
  }, [resetFaceoff, setFaceoffQuestion]);

  // Confetti when winner is set
  useEffect(() => {
    if (faceoffWinner !== null) {
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
  }, [faceoffWinner]);

  if (!ready) {
    return <FaceoffSplash onComplete={handleSplashComplete} />;
  }

  if (loading || !faceoffQuestion)
    return <main className={f.stage}>Loading face-off question…</main>;

  // Evaluate similarity but don't automatically pick winner
  const evaluateAnswers = () => {
    const correctAnswers = faceoffQuestion.answers.map((a) => a.text);
    const points = faceoffQuestion.answers.map((a) => a.points);

    const teamScores = answers.map((ans) => {
      const { index, score } = bestMatch(ans, correctAnswers);
      const earned = index >= 0 && score >= 0.45 ? points[index] : 0;
      return Math.round(score * 100); // show match % for host
    });

    setScores(teamScores);
    setResult("Answers evaluated! Host, decide who takes control.");
  };

  const handleNextQuestion = () => {
    const { nextQuestion, questions, currentIndex } = useGameStore.getState();
    if (questions.length > 0 && currentIndex < questions.length - 1) {
      nextQuestion();
      const nextQ = questions[currentIndex + 1];
      setFaceoffQuestion(nextQ);
      setAnswers(["", ""]);
      setScores([0, 0]);
      setFaceoffWinner(null);
      setResult(null);
    } else {
      setResult("No more face-off questions left!");
    }
  };

  const handleChooseWinner = (teamIndex: 0 | 1) => {
    setFaceoffWinner(teamIndex);
    setResult(`${teams[teamIndex].name} wins control!`);
    setTimeout(() => router.push("/game"), 2500);
  };

  return (
    <main className={f.stage}>
      <h1 className={f.question}>⚡ {faceoffQuestion.prompt}</h1>

      {/* Podiums */}
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
              }}
            >
              {teams[i].name}
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

      {result && (
        <div className={f.resultText}>
          <h2>{result}</h2>

          {/* Reveal correct answers for the host */}
          <div className={f.revealBoard}>
            {faceoffQuestion.answers.map((ans, i) => (
              <div key={i} className={f.revealTile}>
                {i + 1}. {ans.text} — {ans.points} pts
              </div>
            ))}
          </div>

          {/* Host controls */}
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              marginTop: 24,
            }}
          >
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
            <button
              onClick={handleNextQuestion}
              className={a.button({ variant: "secondary", size: "lg" })}
            >
              ⏭ Next Question
            </button>
          </div>
        </div>
      )}

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
