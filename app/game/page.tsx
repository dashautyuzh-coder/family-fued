"use client";
import { useEffect, useState } from "react";
import { fetchQuestions } from "@/lib/data";
import { useGameStore } from "@/lib/store";
import * as b from "@/styles/board.css";
import { vars } from "@/styles/theme.css";

export default function GamePage() {
  const [showBigX, setShowBigX] = useState(false);

  const {
    questions,
    current,
    loadQuestions,
    toggleReveal,
    strikes,
    faceoffUsed,
    teams,
  } = useGameStore();

  useEffect(() => {
    async function load() {
      const q = await fetchQuestions();

      // Skip first question if face-off used
      const filtered = faceoffUsed ? q.slice(1) : q;
      loadQuestions(filtered);
    }

    if (questions.length === 0) load();
  }, [questions.length, loadQuestions, faceoffUsed]);

  // 🔹 Whenever strikes changes, flash big X
  useEffect(() => {
    if (strikes > 0) {
      setShowBigX(true);
      const timeout = setTimeout(() => setShowBigX(false), 900);
      return () => clearTimeout(timeout);
    }
  }, [strikes]);

  if (!current)
    return (
      <div className={b.stage}>
        <p>Loading questions…</p>
      </div>
    );

  // 🔹 Calculate revealed total
  const totalRevealed = current.answers
    .filter((a) => a.revealed)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className={b.stage}>
      <h1 className={b.title}>Design Token Showdown 💥</h1>
      <p className={b.subtitle}>{current.prompt}</p>

      <section className={b.board}>
        <div className={b.grid}>
          {current.answers.map((a, i) => (
            <button
              key={i}
              onClick={() => toggleReveal(i)}
              className={`${b.tile} ${a.revealed ? b.tileRevealed : ""}`}
              style={{ textAlign: "left", cursor: "pointer" }}
              aria-pressed={a.revealed}
            >
              <span>{a.revealed ? `${i + 1}. ${a.text}` : `#${i + 1}`}</span>
              <span className={b.points}>{a.revealed ? a.points : "—"}</span>
            </button>
          ))}
        </div>

        {/* 🔻 Footer with dynamic teams & strikes */}
        <div className={b.footer}>
          <div
            className={b.teamBox}
            style={{
              background: vars.color.flavorGreen,
              color: "black",
            }}
          >
            <strong>{teams[0].name}</strong>
            <span className={b.score}>{teams[0].score}</span>
          </div>

          <div aria-label="Strikes">
            {Array.from({ length: strikes }).map((_, i) => (
              <span key={i} className={b.strike}>
                X
              </span>
            ))}
          </div>

          <div
            className={b.teamBox}
            style={{
              background: vars.color.flavorPink,
              color: "black",
            }}
          >
            <strong>{teams[1].name}</strong>
            <span className={b.score}>{teams[1].score}</span>
          </div>
        </div>

        <div style={{ marginTop: 8, color: "#A7B8C8" }}>
          Revealed on board:&nbsp;
          <strong style={{ color: "#F7C948" }}>{totalRevealed}</strong>
        </div>

        {/* 👇 Big animated X overlay */}
        {showBigX && <div className={b.strikeBig}>X</div>}
      </section>
    </div>
  );
}
