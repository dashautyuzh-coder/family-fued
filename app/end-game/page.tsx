"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { vars } from "@/styles/theme.css";
import * as a from "@/styles/atoms.css";

export default function EndGamePage() {
  const router = useRouter();
  const { teams, resetAll } = useGameStore();

  // Compute winner
  const [winner, loser] = [...teams].sort((a, b) => b.score - a.score);

  useEffect(() => {
    // fire confetti when page mounts
    const duration = 2500;
    const end = Date.now() + duration;
    const colors = [vars.color.flavorGreen, vars.color.flavorGold];

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
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at center, #021, #000)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
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
          color: vars.color.flavorGold,
          textShadow: "0 0 40px rgba(255,255,200,0.8)",
        }}
      >
        🏆 {winner.name} Wins! 🏆
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ fontSize: "1.5rem", marginTop: 20 }}
      >
        Final Score: <strong>{winner.score}</strong> — {loser.score}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        style={{ marginTop: 48, display: "flex", gap: 16 }}
      >
        <button
          className={a.button({ variant: "flavorGold", size: "lg" })}
          onClick={() => {
            resetAll();
            router.push("/faceoff");
          }}
        >
          🔄 Play Again
        </button>
        <button
          className={a.button({ variant: "secondary", size: "lg" })}
          onClick={() => router.push("/")}
        >
          🏠 Main Menu
        </button>
      </motion.div>
    </main>
  );
}
