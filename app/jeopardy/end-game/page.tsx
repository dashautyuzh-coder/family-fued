"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { useJeopardyStore } from "@/lib/jeopardy/store";
import * as b from "@/styles/jeopardy/board.css";
import { themeColors } from "@/lib/jeopardy/theme";

export default function JeopardyEndGamePage() {
  const router = useRouter();
  const { teams, board, resetAll } = useJeopardyStore();
  const theme = board?.theme ?? "ag1";
  const colors = themeColors(theme);

  // Compute winner
  const [winner, loser] = [...teams].sort((a, c) => c.score - a.score);

  useEffect(() => {
    const duration = 2500;
    const end = Date.now() + duration;
    const colors =
      theme === "sprinkle"
        ? [b.SPRINKLE_CELL_TOP, b.SPRINKLE_GOLD]
        : [b.AG1_CELL_TOP, b.AG1_GOLD];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 75,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 75,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [theme]);

  return (
    <main
      className={b.pageBg({ theme })}
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        padding: 32,
      }}
    >
      <motion.h1
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          fontSize: "4rem",
          fontWeight: 900,
          color: colors.accent,
          textShadow:
            theme === "sprinkle"
              ? "0 0 40px rgba(232,119,158,0.4)"
              : "0 0 40px rgba(255,213,74,0.6)",
        }}
      >
        {theme === "sprinkle" ? "🌸" : "🏆"} {winner.name} Wins!{" "}
        {theme === "sprinkle" ? "🌸" : "🏆"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ fontSize: "1.5rem", marginTop: 20 }}
      >
        Final Score: <strong>${winner.score}</strong> — ${loser.score}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        style={{ marginTop: 48, display: "flex", gap: 16, justifyContent: "center" }}
      >
        <button
          className={b.navButton({ theme, tone: "gold" })}
          onClick={() => {
            resetAll();
            router.push("/jeopardy");
          }}
        >
          🔄 Play Again
        </button>
        <button
          className={b.navButton({ theme, tone: "default" })}
          onClick={() => router.push("/")}
        >
          🏠 Main Menu
        </button>
      </motion.div>
    </main>
  );
}
