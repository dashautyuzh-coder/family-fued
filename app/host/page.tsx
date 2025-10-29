"use client";
import { useEffect } from "react";
import { fetchQuestions } from "@/lib/data";
import { useGameStore } from "@/lib/store";
import * as a from "@/styles/atoms.css";
import { useRouter } from "next/navigation";

export default function HostPage() {
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

  useEffect(() => {
    async function load() {
      const q = await fetchQuestions();
      loadQuestions(q);
    }
    if (questions.length === 0) load();
  }, [questions.length, loadQuestions]);

  const router = useRouter();

  if (!current)
    return <div className={a.container}>Loading host controls…</div>;

  return (
    <div className={a.container}>
      <h1>🎤 Host Controls</h1>
      <div style={{ marginTop: 24 }}>
        <h3>🎯 Active Team</h3>
        <div style={{ display: "flex", gap: 12 }}>
          {teams.map((team, i) => (
            <button
              key={i}
              onClick={() => setActiveTeam(i as 0 | 1)}
              className={a.button({
                variant: activeTeam === i ? "flavorGold" : "secondary",
                size: "sm",
              })}
            >
              {team.name}
            </button>
          ))}
        </div>
      </div>
      <p style={{ color: "#9aa6b2" }}>
        Question {currentIndex + 1} of {questions.length}
      </p>
      <h2 style={{ marginTop: 12 }}>{current.prompt}</h2>

      <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
        {current.answers.map((ans, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              borderRadius: 8,
              background: ans.revealed ? "#2BB67333" : "rgba(255,255,255,0.05)",
            }}
          >
            <span style={{ flex: 1, fontWeight: 600 }}>
              {i + 1}. {ans.text}
            </span>
            <span style={{ width: 60, textAlign: "right" }}>{ans.points}</span>
            <button
              onClick={() => toggleReveal(i)}
              className={a.button({
                variant: ans.revealed ? "flavorGAgz" : "secondary",
                size: "sm",
              })}
            >
              {ans.revealed ? "Hide" : "Reveal"}
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button
          onClick={prevQuestion}
          className={a.button({ variant: "secondary" })}
        >
          ← Prev
        </button>
        <button
          onClick={resetReveals}
          className={a.button({ variant: "ghost" })}
        >
          Reset
        </button>
        <button
          onClick={nextQuestion}
          className={a.button({ variant: "primary" })}
        >
          Next →
        </button>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3>❌ Strikes</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {Array.from({ length: strikes }).map((_, i) => (
            <span key={i} style={{ fontSize: 28, color: "#EF4444" }}>
              X
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            onClick={addStrike}
            className={a.button({ variant: "secondary", size: "sm" })}
          >
            Add X
          </button>
          <button
            onClick={clearStrikes}
            className={a.button({ variant: "ghost", size: "sm" })}
          >
            Clear
          </button>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <h3>🏆 Award Points</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((val) => (
            <button
              key={val}
              onClick={() => addPointsToActiveTeam(val)}
              className={a.button({ variant: "flavorGreen", size: "sm" })}
            >
              +{val}
            </button>
          ))}
        </div>
      </div>
      {/* Go buttons */}
      <section className={a.buttonsRow} style={{ marginTop: 28 }}>
        <button
          onClick={() => router.push("/setup")}
          className={a.button({ variant: "secondary", size: "lg" })}
        >
          Open Setup →
        </button>
        <button
          onClick={() => router.push("/game")}
          className={a.button({ variant: "primary", size: "lg" })}
        >
          Open Game →
        </button>
      </section>
    </div>
  );
}
