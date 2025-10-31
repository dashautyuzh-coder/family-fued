"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { useGameStore } from "@/lib/store";
import * as a from "@/styles/atoms.css";
import { vars } from "@/styles/theme.css";

const TOTAL_ROUNDS = 4;

export default function RoundIntro() {
  const router = useRouter();
  const { currentRound, clearStrikes, resetFaceoff } = useGameStore();

  // Clean slate for each round
  useEffect(() => {
    clearStrikes();
    resetFaceoff();
  }, [clearStrikes, resetFaceoff]);

  const isFinal = currentRound >= TOTAL_ROUNDS;
  const title = useMemo(
    () => (isFinal ? "Final Round" : `Round ${currentRound}`),
    [currentRound, isFinal]
  );

  const goToFaceoff = () => router.push("/faceoff");

  // Keyboard shortcut: Enter/Space to start face-off
  const wired = useRef(false);
  useEffect(() => {
    if (wired.current) return;
    wired.current = true;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToFaceoff();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background:
          "radial-gradient(1200px 700px at 50% -10%, #0e1b47, #030712)",
        textAlign: "center",
      }}
    >
      {/* Ambient stage lights */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -120,
          left: "12%",
          width: 260,
          height: 540,
          background: "linear-gradient(180deg, #f7c94855, transparent)",
          filter: "blur(10px)",
          transform: "rotate(-14deg)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -120,
          right: "12%",
          width: 260,
          height: 540,
          background: "linear-gradient(180deg, #2bb67355, transparent)",
          filter: "blur(10px)",
          transform: "rotate(14deg)",
          pointerEvents: "none",
        }}
      />

      {/* Content column */}
      <div style={{ width: "min(980px, 92vw)", margin: "0 auto" }}>
        {/* Progress pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 12px",
            borderRadius: 999,
            border: `1px solid ${vars.color.border}`,
            background: "rgba(255,255,255,0.05)",
            color: "#A7B8C8",
            fontSize: 13,
            marginBottom: 10,
          }}
        >
          <span>
            Round {Math.min(currentRound, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}
          </span>
          {isFinal && (
            <>
              <span>•</span>
              <strong style={{ color: vars.color.gold }}>FINAL</strong>
            </>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          className={a.h1}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            marginTop: 6,
            marginBottom: 12,
            textShadow: "0 0 18px rgba(255,255,150,0.35)",
          }}
        >
          ✨ {title} ✨
        </motion.h1>

        {/* Lead */}
        <motion.p
          className={a.lead}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          style={{ marginBottom: 18 }}
        >
          Get ready for the face-off! One player from each team at the buzzer.
        </motion.p>

        {/* Giant circular CTA */}
        <div style={{ display: "grid", placeItems: "center", marginTop: 8 }}>
          <motion.button
            onClick={goToFaceoff}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              boxShadow: [
                "0 0 0px rgba(247,201,72,0)",
                "0 0 34px rgba(247,201,72,0.55)",
                "0 0 0px rgba(247,201,72,0)",
              ],
            }}
            whileHover={{ scale: 1.06, rotate: 0.5 }}
            whileTap={{ scale: 0.93 }}
            transition={{
              duration: 0.35,
              boxShadow: { repeat: Infinity, duration: 1.7 },
            }}
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "5px solid " + vars.color.flavorGold,
              background:
                "radial-gradient(circle at 30% 30%, " +
                vars.color.flavorGold +
                ", #b4840e 70%)",
              color: "#e1efe7ff",
              fontWeight: 900,
              fontSize: "1.35rem",
              letterSpacing: 0.3,
              cursor: "pointer",
              position: "relative",
              textShadow: "0 1px 2px rgba(0,0,0,0.25)",
            }}
          >
            ⚡ Start Face-Off
            {/* sheen */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background:
                  "radial-gradient(120px 60px at 30% 20%, rgba(255,255,255,0.45), transparent 60%)",
                pointerEvents: "none",
                mixBlendMode: "screen",
              }}
            />
            {/* ring pulse */}
            <motion.span
              aria-hidden
              initial={{ opacity: 0.35, scale: 1 }}
              animate={{ opacity: [0.35, 0, 0.35], scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                border: "3px solid rgba(247,201,72,0.6)",
                filter: "blur(1px)",
              }}
            />
          </motion.button>

          {/* Helper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.4 }}
            style={{ marginTop: 10, fontSize: 12, color: "#A7B8C8" }}
          >
            Press <kbd>Enter</kbd> to start
          </motion.div>
        </div>

        {/* Tiny footer label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={{ marginTop: 14, color: "#8ea2b4", fontSize: 13 }}
        >
          Winner of the face-off controls the board.
        </motion.div>
      </div>
    </main>
  );
}
