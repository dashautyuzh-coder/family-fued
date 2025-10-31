"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

import { useGameStore } from "@/lib/store";
import * as a from "@/styles/atoms.css";
import { vars } from "@/styles/theme.css";

const TOTAL_ROUNDS = 4;

export default function RoundOutro() {
  const router = useRouter();
  const { teams, currentRound, setRound } = useGameStore();

  const isFinal = currentRound >= TOTAL_ROUNDS;
  const subtitle = useMemo(
    () =>
      isFinal ? "Final round complete!" : `Round ${currentRound} complete!`,
    [currentRound, isFinal]
  );

  // Determine leader (for crown)
  const leader =
    teams[0].score === teams[1].score
      ? null
      : teams[0].score > teams[1].score
      ? 0
      : 1;

  // Small confetti pop on mount
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.72 },
      colors: [
        vars.color.flavorGold,
        vars.color.flavorGreen,
        vars.color.flavorPink,
      ],
    });
  }, []);

  // Keyboard shortcut: Enter/Space to continue
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinal, currentRound]);

  const handleNext = () => {
    if (isFinal) {
      router.push("/end-game");
    } else {
      setRound(currentRound + 1);
      router.push("/round-intro");
    }
  };

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
      <div
        style={{
          width: "min(980px, 92vw)",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
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
          🎉 {subtitle}
        </motion.h1>

        {/* Scoreboard card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className={a.card({ tone: "gold" })}
          style={{
            display: "inline-grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            minWidth: 420,
            padding: 18,
          }}
        >
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.12 + i * 0.05 }}
              style={{
                border: `1px solid ${
                  i === 0 ? vars.color.flavorGreen : vars.color.flavorPink
                }`,
                borderRadius: 12,
                padding: "10px 12px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                {leader === i && <span>👑</span>}
                <span
                  style={{
                    color:
                      i === 0 ? vars.color.flavorGreen : vars.color.flavorPink,
                  }}
                >
                  {teams[i].name}
                </span>
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontVariantNumeric: "tabular-nums",
                  fontSize: 22,
                  color: "#fff",
                }}
              >
                {teams[i].score} pts
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Giant circular CTA */}
        <div style={{ display: "grid", placeItems: "center", marginTop: 26 }}>
          <motion.button
            onClick={handleNext}
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
              color: "#e4f1eaff",
              fontWeight: 900,
              fontSize: "1.35rem",
              letterSpacing: 0.3,
              cursor: "pointer",
              position: "relative",
              textShadow: "0 1px 2px rgba(0,0,0,0.25)",
            }}
          >
            {isFinal ? "🏁 End Game" : "Next Round"}
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
            Press <kbd>Enter</kbd> to continue
          </motion.div>
        </div>

        {/* Tiny footer label */}
        <AnimatePresence>
          <motion.div
            key={isFinal ? "final" : "more"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.9, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            style={{ marginTop: 14, color: "#8ea2b4", fontSize: 13 }}
          >
            {isFinal
              ? "Next: Winner ceremony 🎊"
              : `Up next: Round ${currentRound + 1}`}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
