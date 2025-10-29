"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { fetchQuestions } from "@/lib/data";
import * as a from "@/styles/atoms.css";
import { vars } from "@/styles/theme.css";
import { useEffect, useState } from "react";
import * as b from "@/styles/board.css";
import confetti from "canvas-confetti";

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
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load the first question
  useEffect(() => {
    async function load() {
      const q = await fetchQuestions();
      setFaceoffQuestion(q[0]);
      setLoading(false);
    }
    load();
    resetFaceoff();
  }, [resetFaceoff, setFaceoffQuestion]);

  // 🎉 Fire confetti when a winner is set
  useEffect(() => {
    if (faceoffWinner !== null) {
      // small delay to ensure the DOM updates before running confetti
      const timer = setTimeout(() => {
        confetti({
          particleCount: 250,
          spread: 100,
          origin: { y: 0.7 },
          colors: [
            faceoffWinner === 0
              ? vars.color.flavorGreen
              : vars.color.flavorPink,
            vars.color.accent,
          ],
        });
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [faceoffWinner]);

  if (loading || !faceoffQuestion)
    return <main className={a.container}>Loading face-off question...</main>;

  const evaluateAnswers = () => {
    const topAnswers = faceoffQuestion.answers.map((a) => a.text.toLowerCase());
    const points = faceoffQuestion.answers.map((a) => a.points);

    const scores = answers.map((ans) => {
      const idx = topAnswers.findIndex((t) => ans.toLowerCase().includes(t));
      return idx >= 0 ? points[idx] : 0;
    });

    const winner =
      scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1;

    if (winner !== null) {
      setFaceoffWinner(winner);
      setResult(
        `${teams[winner].name} wins control (${scores[winner]} points)!`
      );
      setTimeout(() => router.push("/host"), 1500);
    } else {
      setResult("It's a tie! Try again!");
    }
  };

  return (
    <main className={a.container}>
      <h1>⚡ Face-Off: {faceoffQuestion.prompt}</h1>

      <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            className={a.card()}
            style={{
              flex: 1,
              borderColor:
                faceoffWinner === i ? vars.color.gold : vars.color.border,
            }}
          >
            <h2>{teams[i].name}</h2>
            <input
              placeholder="Type your answer"
              value={answers[i]}
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[i] = e.target.value;
                setAnswers(newAnswers);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #2a3b86",
                background: "#0a1236",
                color: "white",
              }}
            />
          </div>
        ))}
      </div>

      <div className={a.buttonsRow} style={{ marginTop: 32 }}>
        <button
          onClick={evaluateAnswers}
          className={a.button({ variant: "flavorGold", size: "lg" })}
        >
          Evaluate
        </button>
      </div>
      {faceoffWinner !== null && (
        <div
          style={{
            textAlign: "center",
            marginTop: 40,
            color: vars.color.gold,
            fontSize: "2rem",
            fontWeight: 800,
            textShadow: "0 0 20px rgba(255,255,100,0.4)",
          }}
        >
          <h2 className={b.winnerGlow}>
            🏆 {teams[faceoffWinner].name} takes control! 🏆
          </h2>
          <div style={{ marginTop: 24 }}>
            <button
              onClick={() => router.push("/game")}
              className={a.button({ variant: "flavorGold", size: "lg" })}
              style={{
                padding: "14px 28px",
                fontSize: "1.2rem",
                borderRadius: 12,
                boxShadow: "0 0 20px rgba(255,255,255,0.2)",
              }}
            >
              Go to Game Board →
            </button>
          </div>
        </div>
      )}

      {result && (
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <h2>{result}</h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginTop: 20,
            }}
          >
            {[0, 1].map((i) => (
              <button
                key={i}
                onClick={() => {
                  setFaceoffWinner(i as 0 | 1);
                }}
                className={a.button({
                  variant: i === 0 ? "flavorGreen" : "flavorPink",
                  size: "lg",
                })}
                style={{
                  minWidth: 180,
                  padding: "14px 24px",
                  fontSize: "1.2rem",
                  borderRadius: 12,
                }}
              >
                ✅ {teams[i].name} Wins
              </button>
            ))}
          </div>
          <div className={b.revealBoard}>
            {faceoffQuestion.answers.map((ans, i) => (
              <div
                key={i}
                className={`${b.revealTile} ${
                  answers.some((a) =>
                    a.toLowerCase().includes(ans.text.toLowerCase())
                  )
                    ? b.correct
                    : ""
                }`}
                style={{
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                {ans.text} — {ans.points}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
