"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as b from "@/styles/jeopardy/board.css";
import { useJeopardyStore } from "@/lib/jeopardy/store";
import { fetchBoard } from "@/lib/jeopardy/data";
import type { BoardTheme } from "@/lib/jeopardy/types";
import { themeColors } from "@/lib/jeopardy/theme";
import { useToast } from "@/lib/shared/toast";

const BOARD_OPTIONS: Array<{
  id: BoardTheme;
  emoji: string;
  label: string;
  hint: string;
}> = [
  { id: "ag1", emoji: "🧠", label: "AG1", hint: "Game Night edition" },
  { id: "sprinkle", emoji: "🌸", label: "Sprinkle", hint: "Lily's Baby Shower" },
];

export default function JeopardyHomePage() {
  const router = useRouter();
  const { toast, Toast } = useToast();
  const {
    teams,
    setTeamName,
    resetAll,
    loadBoard,
    selectedTheme,
    setSelectedTheme,
  } = useJeopardyStore();
  const [starting, setStarting] = useState(false);
  const colors = themeColors(selectedTheme);

  const startGame = async () => {
    if (!teams[0].name.trim() || !teams[1].name.trim()) {
      toast("⚠️ Give both teams a name first");
      return;
    }
    setStarting(true);
    const board = await fetchBoard(selectedTheme);
    loadBoard(board);
    router.push("/jeopardy/host");
  };

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      startGame();
    }
  };

  return (
    <main className={b.pageBg({ theme: selectedTheme })}>
      <section
        className={b.panel({ theme: selectedTheme })}
        style={{ width: "min(640px, 92vw)", textAlign: "center" }}
      >
        <h1 className={b.title({ theme: selectedTheme })} style={{ marginTop: 0, marginBottom: 8 }}>
          {selectedTheme === "sprinkle" ? "🌸 The Fourth Prince" : "🧠 AG1opardy"}
        </h1>
        <p style={{ color: colors.muted }}>
          Name your two teams, then hit the board. Open a clue, buzz in,
          reveal the answer, and mark it right or wrong.
        </p>

        <div style={{ marginTop: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              color: colors.muted,
              fontSize: 13,
            }}
          >
            Board
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {BOARD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedTheme(opt.id)}
                className={b.themeOption({ selected: selectedTheme === opt.id })}
                style={{
                  color: colors.text,
                  borderColor:
                    selectedTheme === opt.id ? colors.accent : "transparent",
                  background:
                    opt.id === "sprinkle"
                      ? "linear-gradient(180deg, #FFE3ED, #FFB0CB)"
                      : "linear-gradient(180deg, #2647c9, #081142)",
                }}
              >
                <span style={{ fontSize: 26 }}>{opt.emoji}</span>
                <span style={{ color: opt.id === "sprinkle" ? "#5B3A52" : "#F5F7FF" }}>
                  {opt.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: opt.id === "sprinkle" ? "#A9718F" : "#A9B6E8",
                  }}
                >
                  {opt.hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 20,
          }}
        >
          {[0, 1].map((idx) => (
            <div key={idx}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  color: colors.muted,
                  fontSize: 13,
                }}
              >
                Team {idx === 0 ? "A" : "B"}
              </label>
              <input
                value={teams[idx as 0 | 1].name}
                onChange={(e) => setTeamName(idx as 0 | 1, e.target.value)}
                onKeyDown={onEnter}
                placeholder={idx === 0 ? "Team A name" : "Team B name"}
                className={b.inputField({ theme: selectedTheme })}
              />
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
            justifyContent: "center",
          }}
        >
          <button
            onClick={startGame}
            disabled={starting}
            className={b.navButton({ theme: selectedTheme, tone: "gold" })}
          >
            {starting ? "Loading board…" : "🎯 Start Game →"}
          </button>
          <button
            onClick={() => {
              resetAll();
              toast("🔄 Reset");
            }}
            className={b.navButton({ theme: selectedTheme, tone: "default" })}
          >
            🧹 Reset
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <Link
            href="/jeopardy/rules"
            style={{ color: colors.muted, textDecoration: "underline" }}
          >
            How to play →
          </Link>
        </div>
      </section>

      {Toast}
    </main>
  );
}
