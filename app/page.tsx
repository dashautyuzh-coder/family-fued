"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import * as atoms from "@/styles/shared/atoms.css";

const GAMES = [
  {
    href: "/family-feud",
    emoji: "🎉",
    name: "Family Feud",
    tagline: "Survey says… name your teams and host the board.",
    tone: "green" as const,
  },
  {
    href: "/jeopardy",
    emoji: "🧠",
    name: "AG1opardy",
    tagline: "Pick a category, buzz in, and judge the board.",
    tone: "gold" as const,
  },
];

export default function GamePickerPage() {
  return (
    <main
      className={atoms.container}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <motion.div
        aria-hidden
        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: "-10%",
          background:
            "radial-gradient(900px 600px at 50% 20%, rgba(43,182,115,0.18), transparent 80%), radial-gradient(600px 400px at 50% 80%, rgba(247,201,72,0.2), transparent 80%)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />

      <h1
        className={atoms.h1}
        style={{ textAlign: "center", marginBottom: 8, zIndex: 1 }}
      >
        AG1 Game Night
      </h1>
      <p
        className={atoms.muted}
        style={{
          textAlign: "center",
          marginBottom: 32,
          color: "#A7B8C8",
          zIndex: 1,
        }}
      >
        Pick a game to host.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          width: "min(700px, 92vw)",
          zIndex: 1,
        }}
      >
        {GAMES.map((game) => (
          <motion.div
            key={game.href}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={game.href}
              className={atoms.card({ tone: game.tone, clickable: true })}
              style={{
                display: "block",
                padding: 24,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 8 }}>
                {game.emoji}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>
                {game.name}
              </div>
              <div
                className={atoms.muted}
                style={{ marginTop: 6, fontSize: 14 }}
              >
                {game.tagline}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
