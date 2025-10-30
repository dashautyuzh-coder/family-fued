"use client";

import { useEffect, useState } from "react";
import { fetchQuestions } from "@/lib/data";
import { useGameStore } from "@/lib/store";
import * as b from "@/styles/board.css";
import { vars } from "@/styles/theme.css";

export default function GamePage() {
  const [showBigX, setShowBigX] = useState(false);
  const { questions, current, loadQuestions, toggleReveal, strikes, teams } =
    useGameStore();

  useEffect(() => {
    async function load() {
      const q = await fetchQuestions();
      loadQuestions(q);
    }
    if (questions.length === 0) load();
  }, [questions.length, loadQuestions]);

  useEffect(() => {
    if (strikes > 0) {
      queueMicrotask(() => setShowBigX(true));
      const timer = setTimeout(() => setShowBigX(false), 900);
      return () => clearTimeout(timer);
    }
  }, [strikes]);

  if (!current)
    return (
      <div className={b.stage}>
        <p>Loading questions…</p>
      </div>
    );

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

        <div className={b.footer}>
          <div
            className={b.teamBox}
            style={{ background: vars.color.flavorGreen, color: "black" }}
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
            style={{ background: vars.color.flavorPink, color: "black" }}
          >
            <strong>{teams[1].name}</strong>
            <span className={b.score}>{teams[1].score}</span>
          </div>
        </div>

        <div style={{ marginTop: 8, color: "#A7B8C8" }}>
          Revealed on board:&nbsp;
          <strong style={{ color: "#F7C948" }}>{totalRevealed}</strong>
        </div>

        {showBigX && <div className={b.strikeBig}>X</div>}
      </section>
    </div>
  );
}
