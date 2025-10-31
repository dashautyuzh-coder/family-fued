"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

import { useGameStore } from "@/lib/store";
import { fetchFaceoffQuestions } from "@/lib/data";
import { bestMatch } from "@/lib/fuzzy";

import * as a from "@/styles/atoms.css";
import * as f from "@/styles/faceoff.css";
import * as b from "@/styles/board.css";
import { vars } from "@/styles/theme.css";
import { playSound } from "@/lib/sounds";
import FaceoffSplash from "@/components/FaceoffSplash";

type Phase = "awaitBuzz" | "input" | "evaluated" | "result";

function shuffle<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function FaceoffPage() {
  const router = useRouter();
  const {
    teams,
    setFaceoffWinner, // sets activeTeam in store
    resetFaceoff,
    clearStrikes, // clear leftover strikes before game board
    faceoffQuestion,
    setFaceoffQuestion,
  } = useGameStore();

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("awaitBuzz");
  const [buzzedBy, setBuzzedBy] = useState<0 | 1 | null>(null);

  const [answers, setAnswers] = useState(["", ""]);
  const [matchPct, setMatchPct] = useState<number[]>([0, 0]);
  const [advancingTeam, setAdvancingTeam] = useState<0 | 1 | null>(null);
  const [faceoffPool, setFaceoffPool] = useState<any[]>([]);
  const [flashColor, setFlashColor] = useState<string | null>(null);

  // pick a different random question and reset the phase
  const pickRandomFaceoff = useCallback(() => {
    if (!faceoffPool.length) return;

    let next = faceoffPool[Math.floor(Math.random() * faceoffPool.length)];
    // avoid repeating the same prompt if possible
    if (faceoffQuestion && faceoffPool.length > 1) {
      let guard = 0;
      while (next.prompt === faceoffQuestion.prompt && guard++ < 10) {
        next = faceoffPool[Math.floor(Math.random() * faceoffPool.length)];
      }
    }

    setFaceoffQuestion(next);
    setPhase("awaitBuzz");
    setBuzzedBy(null);
    setAnswers(["", ""]);
    setMatchPct([0, 0]);
    setAdvancingTeam(null);
    playSound?.("shuffle"); // any name works with your extensible playSound; else map to 'ding'
  }, [
    faceoffPool,
    faceoffQuestion,
    setFaceoffQuestion,
    setPhase,
    setBuzzedBy,
    setAdvancingTeam,
    setMatchPct,
    setAnswers,
  ]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        resetFaceoff();
        clearStrikes();
        const q = await fetchFaceoffQuestions(); // ← array
        if (ignore) return;
        setFaceoffPool(q); // ← keep the pool
        const [first] = shuffle(q);
        setFaceoffQuestion(first);
      } catch (err) {
        console.error("Failed to load faceoff question", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [resetFaceoff, setFaceoffQuestion, clearStrikes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "n" && phase !== "result") {
        e.preventDefault();
        pickRandomFaceoff();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, pickRandomFaceoff]);

  // Button brand colors (A / B)
  const BUZZ_COLORS = ["#2BB673", "#FF5FA2"] as const;

  function buzz(idx: 0 | 1) {
    // Play different sounds per team for easy audio recognition
    // Make sure you have these sounds registered in your sounds lib
    // e.g. buzzA.mp3, buzzB.mp3
    playSound?.(idx === 0 ? "buzzA" : "buzzB");

    // Flash screen their color for a quick dramatic strobe
    setFlashColor(BUZZ_COLORS[idx]);
    setTimeout(() => setFlashColor(null), 450);

    // Continue your existing flow
    handleChooseBuzzWinner(idx);
  }

  const handleSplashComplete = () => setReady(true);

  // 🔁 Load a single face-off question on mount
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        resetFaceoff(); // reset store
        clearStrikes(); // ensure no stray Xs
        const q = await fetchFaceoffQuestions();
        if (ignore) return;
        const [first] = shuffle(q);
        setFaceoffQuestion(first);
      } catch (err) {
        console.error("Failed to load faceoff question", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [resetFaceoff, setFaceoffQuestion, clearStrikes]);

  // 🔔 Choose who buzzed first
  const handleChooseBuzzWinner = (team: 0 | 1) => {
    setBuzzedBy(team);
    playSound("ding");
    setPhase("input");
  };

  // 🔍 Live match preview
  const liveMatch = useMemo(() => {
    if (!faceoffQuestion) return [0, 0] as [number, number];
    const correct = faceoffQuestion.answers.map((a) => a.text);
    return (answers as [string, string]).map((ans) =>
      Math.round(bestMatch(ans, correct).score * 100)
    ) as [number, number];
  }, [answers, faceoffQuestion]);

  // 🎯 Evaluate — reveals all possible answers subtly, no winner yet
  const evaluate = useCallback(() => {
    if (!faceoffQuestion) return;
    const correct = faceoffQuestion.answers.map((a) => a.text);
    const bothPct = answers.map((ans) =>
      Math.round(bestMatch(ans, correct).score * 100)
    );
    setMatchPct(bothPct);
    setPhase("evaluated");
    playSound("award");
  }, [answers, faceoffQuestion]);

  // Spacebar shortcut to evaluate
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase === "input" && e.key === " ") {
        e.preventDefault();
        evaluate();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, evaluate]);

  // ✅ Host picks winner manually
  const handleSelectWinner = (team: 0 | 1) => {
    setAdvancingTeam(team);
    setFaceoffWinner(team); // store activeTeam for /game
    setPhase("result");

    confetti({
      particleCount: 260,
      spread: 100,
      origin: { y: 0.7, x: team === 0 ? 0.2 : 0.8 },
      colors: [
        team === 0 ? vars.color.flavorGreen : vars.color.flavorPink,
        vars.color.flavorGold,
      ],
    });
    playSound("fireworks");
  };

  // 🚀 Move to game board
  const goToBoard = () => router.push("/game");
  // Winner theme color
  const teamAccent =
    advancingTeam === 0 ? vars.color.flavorGreen : vars.color.flavorPink;

  // Auto-advance (you can tweak or disable)
  const AUTO_ADVANCE_MS = 5000;
  const [autoAdvance, setAutoAdvance] = useState(true);

  useEffect(() => {
    if (phase !== "result" || !autoAdvance) return;
    const t = setTimeout(goToBoard, AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [phase, autoAdvance, goToBoard]);

  // Enter to continue (already suggested before; keep)
  useEffect(() => {
    if (phase !== "result") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        goToBoard();
      } else if (e.key.toLowerCase() === "escape") {
        setAutoAdvance(false); // ESC cancels auto-advance
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, goToBoard]);

  // ─────────────────────────────────────────────────────────────────────────────
  // UI RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  if (!ready) return <FaceoffSplash onComplete={handleSplashComplete} />;
  if (loading || !faceoffQuestion)
    return <main className={f.stage}>Loading face-off question…</main>;

  return (
    <main
      className={f.stage}
      style={{
        background: "radial-gradient(1000px 600px at 50% 0%, #0e1b47, #030712)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient light beams */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -80,
          left: "12%",
          width: 240,
          height: 440,
          background: "linear-gradient(180deg, #f7c94855, transparent)",
          filter: "blur(6px)",
          transform: "rotate(-12deg)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -80,
          right: "12%",
          width: 240,
          height: 440,
          background: "linear-gradient(180deg, #2bb67355, transparent)",
          filter: "blur(6px)",
          transform: "rotate(12deg)",
          pointerEvents: "none",
        }}
      />

      {/* Question prompt */}
      {/* Question prompt + reroll */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <motion.h1
          className={f.question}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ margin: 0 }}
        >
          ⚡ {faceoffQuestion.prompt}
        </motion.h1>

        {/* tiny dice/shuffle button */}
        <motion.button
          onClick={pickRandomFaceoff}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          title="Random question (N)"
          aria-label="Random question"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.18)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
            color: "#fff",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          🎲
        </motion.button>
      </div>

      {/* --- replace your existing `awaitBuzz` block with this --- */}
      {phase === "awaitBuzz" && (
        <AnimatePresence mode="wait">
          <motion.div
            key="buzz"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              zIndex: 50,
              padding: 16,
            }}
          >
            {/* Floating headline with shimmer */}
            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: [0, -6, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "mirror",
              }}
              style={{
                fontSize: "3rem",
                fontWeight: 900,
                marginBottom: 36,
                letterSpacing: "0.06em",
                background: "linear-gradient(90deg, #F7C948, #fff, #F7C948)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow:
                  "0 0 18px rgba(247,201,72,0.5), 0 0 36px rgba(43,182,115,0.35)",
              }}
            >
              Who buzzed first?
            </motion.div>

            {/* Buzz buttons */}
            <div
              style={{
                display: "flex",
                gap: 40,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {/* Team A */}
              <motion.button
                onClick={() => buzz(0)}
                whileHover={{ scale: 1.08 }}
                whileTap={{
                  scale: 0.96,
                  y: 2,
                  boxShadow: "inset 0 0 24px rgba(0,0,0,0.35)",
                  background: "linear-gradient(135deg, #1e8b56, #145b39)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(0,0,0,0)",
                    "0 0 24px rgba(43,182,115,0.55)",
                    "0 0 0px rgba(0,0,0,0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  fontSize: "2.4rem",
                  padding: "1.4rem 2.8rem",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  color: "white",
                  background: "linear-gradient(135deg, #2BB673, #1e8b56)",
                  textShadow: "0 0 8px rgba(0,0,0,0.4)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {teams[0].name || "Team A"}
                {/* soft pulse aura */}
                <motion.span
                  aria-hidden
                  animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{
                    position: "absolute",
                    inset: -20,
                    borderRadius: 20,
                    background:
                      "radial-gradient(circle, rgba(43,182,115,0.18), transparent 60%)",
                    zIndex: -1,
                  }}
                />
              </motion.button>

              {/* Team B */}
              <motion.button
                onClick={() => buzz(1)}
                whileHover={{ scale: 1.08 }}
                whileTap={{
                  scale: 0.96,
                  y: 2,
                  boxShadow: "inset 0 0 24px rgba(0,0,0,0.35)",
                  background: "linear-gradient(135deg, #c92d6f, #8f1e4c)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(0,0,0,0)",
                    "0 0 24px rgba(255,95,162,0.6)",
                    "0 0 0px rgba(0,0,0,0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                style={{
                  fontSize: "2.4rem",
                  padding: "1.4rem 2.8rem",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  color: "white",
                  background: "linear-gradient(135deg, #FF5FA2, #c92d6f)",
                  textShadow: "0 0 8px rgba(0,0,0,0.4)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {teams[1].name || "Team B"}
                <motion.span
                  aria-hidden
                  animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{
                    position: "absolute",
                    inset: -20,
                    borderRadius: 20,
                    background:
                      "radial-gradient(circle, rgba(255,95,162,0.18), transparent 60%)",
                    zIndex: -1,
                  }}
                />
              </motion.button>
            </div>

            {/* Ambient floor glow */}
            <motion.div
              aria-hidden
              animate={{ opacity: [0.12, 0.28, 0.12], scale: [0.9, 1.05, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: "20%",
                width: 520,
                height: 320,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(247,201,72,0.25), transparent 70%)",
                filter: "blur(110px)",
                zIndex: -1,
              }}
            />
          </motion.div>

          {/* Screen flash overlay when a team buzzes */}
          {flashColor && (
            <motion.div
              key="flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.85, 0] }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: flashColor,
                mixBlendMode: "screen",
                pointerEvents: "none",
                zIndex: 9999,
              }}
            />
          )}
        </AnimatePresence>
      )}

      {/* 2️⃣ Phase: Input */}
      {phase === "input" && (
        <>
          <div
            className={f.podiums}
            style={{ marginTop: 36, position: "relative" }}
          >
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className={`${f.podium} ${
                  buzzedBy === i ? f.podiumActive : ""
                }`}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <h2
                  style={{
                    color:
                      i === 0 ? vars.color.flavorGreen : vars.color.flavorPink,
                  }}
                >
                  {teams[i].name}
                </h2>
                <input
                  className={f.answerInput}
                  placeholder={
                    buzzedBy === i ? "Their first guess…" : "Opponent guess…"
                  }
                  value={answers[i]}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                />
                {answers[i].trim() && (
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 8,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.06)",
                      color: "#A7B8C8",
                      fontSize: 12,
                    }}
                  >
                    🔍 Match: <strong>{liveMatch[i]}%</strong>
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Centered Evaluate Button */}
          <div style={{ display: "grid", placeItems: "center", marginTop: 24 }}>
            <motion.button
              onClick={evaluate}
              disabled={!answers[0].trim() && !answers[1].trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              animate={{
                boxShadow: [
                  "0 0 0 rgba(247,201,72,0.0)",
                  "0 0 28px rgba(247,201,72,0.55)",
                  "0 0 0 rgba(247,201,72,0.0)",
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.6,
                ease: "easeInOut",
              }}
              style={{
                width: 170,
                height: 170,
                borderRadius: "50%",
                border: "4px solid #F7C948",
                background:
                  "radial-gradient(circle at 30% 30%, #F7C948, #b4840e)",
                color: "#021",
                fontWeight: 900,
                fontSize: "1.35rem",
                cursor: "pointer",
                textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                opacity: !answers[0].trim() && !answers[1].trim() ? 0.6 : 1,
              }}
              title="Space also evaluates"
            >
              Evaluate
            </motion.button>
            <div style={{ marginTop: 8, fontSize: 12, color: "#A7B8C8" }}>
              Tip: press <kbd>Space</kbd> to evaluate
            </div>
          </div>
        </>
      )}

      {/* 3️⃣ Phase: Evaluated (shows answers + pick winner) */}
      {phase === "evaluated" && (
        <div className={f.resultText}>
          <div className={b.winnerGlow}>Survey says…</div>

          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            {faceoffQuestion.answers.map((ans, i) => (
              <motion.div
                key={i}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ delay: i * 0.12, type: "spring", stiffness: 120 }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  transformOrigin: "bottom",
                }}
              >
                <span>{ans.text}</span>
                <span style={{ color: vars.color.gold }}>{ans.points} pts</span>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: 18, color: "#A7B8C8" }}>
            {[0, 1].map((i) => (
              <p key={i}>
                {teams[i].name}:{" "}
                <strong style={{ color: "#fff" }}>{answers[i] || "—"}</strong> (
                {matchPct[i]}% match)
              </p>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 16,
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => handleSelectWinner(0)}
              className={a.button({ variant: "flavorGreen", size: "lg" })}
            >
              ✅ {teams[0].name} Wins
            </button>
            <button
              onClick={() => handleSelectWinner(1)}
              className={a.button({ variant: "flavorPink", size: "lg" })}
            >
              ✅ {teams[1].name} Wins
            </button>
          </div>
        </div>
      )}

      {/* 4️⃣ Phase: Result */}
      {phase === "result" && advancingTeam !== null && (
        <AnimatePresence mode="wait">
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{
              position: "relative",
              display: "grid",
              placeItems: "center",
              gap: 12,
              textAlign: "center",
              padding: "10px 16px",
            }}
          >
            {/* Winner pill */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 14 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 999,
                background: `linear-gradient(135deg, ${teamAccent}, ${teamAccent}55)`,
                boxShadow: `0 0 18px ${teamAccent}44`,
                color: "#fff",
              }}
            >
              <motion.span
                initial={{ rotate: -8 }}
                animate={{ rotate: [0, -6, 0, 6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{ fontSize: "1.4rem" }}
                aria-hidden
              >
                🏆
              </motion.span>
              <span style={{ fontWeight: 800 }}>
                {teams[advancingTeam].name} advances
              </span>
            </motion.div>

            {/* Subheadline (muted, smaller) */}
            <div style={{ fontSize: 13, color: "#A7B8C8" }}>
              Active team set to{" "}
              <strong style={{ color: "#fff" }}>
                {teams[advancingTeam].name}
              </strong>
            </div>

            {/* CTA block */}
            <div
              style={{ display: "grid", gap: 10, marginTop: 6, minWidth: 320 }}
            >
              <motion.button
                onClick={goToBoard}
                whileHover={{ scale: 1.05, rotate: 0.4 }}
                whileTap={{ scale: 0.95, rotate: -0.4 }}
                animate={{
                  boxShadow: [
                    `0 0 0px ${teamAccent}00`,
                    `0 0 26px ${teamAccent}66`,
                    `0 0 0px ${teamAccent}00`,
                  ],
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={a.button({ variant: "flavorGold", size: "lg" })}
                style={{
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  fontSize: "1.1rem",
                  padding: "1.1rem 1.6rem",
                  borderRadius: 16,
                  border: "none",
                  textTransform: "uppercase",
                  background:
                    "linear-gradient(120deg, #F7C948, #FFD700, #F7C948, #FFED9E, #F7C948)",
                  backgroundSize: "260% 260%",
                  color: "#061015",
                  position: "relative",
                  overflow: "hidden",
                }}
                title="Press Enter to continue"
              >
                <motion.span
                  aria-hidden
                  animate={{ x: ["-140%", "140%"], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    repeatDelay: 1.1,
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))",
                    transform: "skewX(-20deg)",
                    filter: "blur(2px)",
                    pointerEvents: "none",
                  }}
                />
                GO TO GAME BOARD →
              </motion.button>

              {/* Secondary: Rematch */}
              <div
                style={{ display: "flex", gap: 8, justifyContent: "center" }}
              >
                <button
                  onClick={() => {
                    setAutoAdvance(false);
                    // quickly reload a fresh face-off flow without leaving page
                    setPhase("awaitBuzz");
                  }}
                  className={a.button({ variant: "ghost" })}
                  style={{ fontSize: 13 }}
                >
                  ↺ Rematch Face-Off
                </button>
                <button
                  onClick={() => setAutoAdvance((v) => !v)}
                  className={a.button({ variant: "ghost" })}
                  style={{ fontSize: 13 }}
                >
                  {autoAdvance
                    ? "✕ Cancel Auto-advance"
                    : "▶ Enable Auto-advance"}
                </button>
              </div>

              {/* Auto-advance progress bar */}
              {autoAdvance && (
                <div
                  style={{
                    height: 6,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    key="progress"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: AUTO_ADVANCE_MS / 1000,
                      ease: "linear",
                    }}
                    style={{
                      height: "100%",
                      background: `linear-gradient(90deg, ${teamAccent}, ${vars.color.flavorGold})`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Subtle ambience (smaller, less busy) */}
            <motion.div
              aria-hidden
              animate={{
                opacity: [0.08, 0.2, 0.08],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: "18%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 520,
                height: 300,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${teamAccent}26, transparent 70%)`,
                filter: "blur(90px)",
                zIndex: -1,
              }}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Helper ribbon */}
      <div
        style={{
          position: "fixed",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 999,
          padding: "6px 12px",
          fontSize: 12,
          color: "#A7B8C8",
        }}
      >
        Flow: Pick buzz winner → type guesses → Evaluate → Choose winner → Board
      </div>
    </main>
  );
}
