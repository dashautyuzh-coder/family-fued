"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import * as a from "@/styles/atoms.css";

export default function RulesPage() {
  return (
    <main
      className={a.container}
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background */}
      <motion.div
        aria-hidden
        animate={{ opacity: [0.18, 0.32, 0.18], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: "-20%",
          background:
            "radial-gradient(1200px 700px at 50% -10%, #0e1b47, #020817 70%)",
          filter: "blur(0px)",
          zIndex: 0,
        }}
      />

      <section
        className={a.card({ tone: "accent" })}
        style={{
          width: "min(900px, 92vw)",
          padding: 22,
          background: "rgba(4,16,42,0.65)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(8px)",
          borderRadius: 16,
          zIndex: 1,
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <h1 style={{ margin: 0 }}>Game Rules</h1>
          <Link href="/" className={a.button({ variant: "ghost" })}>
            ← Home
          </Link>
        </header>

        <div style={{ height: 12 }} />

        <ol style={{ lineHeight: 1.6, margin: 0, paddingLeft: 18 }}>
          <li>
            <strong>Objective:</strong> Teams guess the most popular survey
            answers to earn points.
          </li>
          <li>
            <strong>Face-Off:</strong> One player from each team buzzes in. Host
            selects who goes first. Winner’s team plays the board.
          </li>
          <li>
            <strong>Playing the Board:</strong> Team guesses answers on the
            board. Correct guesses reveal points. Three strikes ends control.
          </li>
          <li>
            <strong>Steal:</strong> Opposing team gets one chance to name a
            remaining answer. Correct → they steal the round points; wrong →
            original team keeps them.
          </li>
          <li>
            <strong>Scoring:</strong> Round points equal the sum of revealed
            answers for that question.
          </li>
          <li>
            <strong>Rounds:</strong> Play through your set (or first to your
            target score). Final totals decide the winner.
          </li>
          <li>
            <strong>Ties:</strong> Use a quick extra face-off with a single
            question.
          </li>
        </ol>

        <div style={{ height: 16 }} />

        <div
          className={a.card()}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Host Controls & Shortcuts</h3>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
            <li>
              <strong>Face-Off:</strong> Pick buzz winner → type guesses →
              Evaluate → Choose winner.
            </li>
            <li>
              <strong>Game Board:</strong> Click tiles to reveal; press{" "}
              <kbd>X</kbd> / strike button for strikes.
            </li>
            <li>
              <strong>Shortcuts:</strong> <kbd>Space</kbd> (evaluate),{" "}
              <kbd>Enter</kbd> (continue), <kbd>R</kbd> (roll), <kbd>Esc</kbd>{" "}
              (cancel auto-advance).
            </li>
            <li>
              <strong>Audio:</strong> Sounds play on countdown, ding, strikes,
              fireworks.
            </li>
          </ul>
        </div>

        <div style={{ height: 14 }} />

        <footer
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/onboarding"
            className={a.button({ variant: "flavorGold" })}
          >
            Start Onboarding →
          </Link>
          <Link href="/faceoff" className={a.button({ variant: "secondary" })}>
            Go to Face-Off
          </Link>
        </footer>
      </section>
    </main>
  );
}
