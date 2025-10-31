"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchQuestions } from "@/lib/data";
import { useGameStore } from "@/lib/store";
import * as b from "@/styles/board.css";
import { vars } from "@/styles/theme.css";
import { motion, AnimatePresence } from "framer-motion";

export default function GamePage() {
  const router = useRouter();
  const [showBigX, setShowBigX] = useState(false);
  const [roundInfo, setRoundInfo] = useState<{
    title?: string;
    category?: string;
  } | null>(null);
  const mountedRef = useRef(false);
  const endTriggeredRef = useRef(false);

  const {
    questions,
    current,
    loadQuestions,
    toggleReveal,
    strikes,
    teams,
    currentRound,
    clearStrikes,
  } = useGameStore();

  // ── Load round data ──────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    clearStrikes();
    let ignore = false;

    (async () => {
      try {
        const round = await fetchQuestions(currentRound);
        if (ignore) return;

        const withMeta = (round?.questions ?? []).map((q: any, i: number) => ({
          ...q,
          index: i,
          category: round?.category ?? `Round ${currentRound}`,
        }));

        loadQuestions(withMeta);
        setRoundInfo({
          title: round?.title ?? `Round ${currentRound}`,
          category: round?.category ?? "General Knowledge",
        });
        endTriggeredRef.current = false;
      } catch (err) {
        console.error(
          "❌ Failed to load questions for round",
          currentRound,
          err
        );
        setRoundInfo({
          title: `Round ${currentRound}`,
          category: "Unavailable",
        });
        loadQuestions([]);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [currentRound, loadQuestions, clearStrikes]);

  // ── Handle Strike animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mountedRef.current) return;
    if (strikes > 0) {
      queueMicrotask(() => setShowBigX(true));
      const t = setTimeout(() => setShowBigX(false), 900);
      return () => clearTimeout(t);
    }
  }, [strikes]);

  // ── Determine progress ───────────────────────────────────────────────────────
  const currentIndex = current?.index ?? 0;
  const totalQuestions = questions?.length ?? 0;
  const isLastQuestion =
    totalQuestions > 0 && currentIndex === totalQuestions - 1;

  const allRevealed = useMemo(
    () => current?.answers?.every((a: any) => !!a.revealed) ?? false,
    [current]
  );

  // ── End of round ─────────────────────────────────────────────────────────────
  const handleEndOfRound = async () => {
    router.push("/round-outro");
  };

  // ── Loading fallback ─────────────────────────────────────────────────────────
  if (!current || !questions.length)
    return (
      <div className={b.stage}>
        <p>Loading round {currentRound}…</p>
      </div>
    );

  // ── Totals ───────────────────────────────────────────────────────────────────
  const totalRevealed =
    current.answers
      ?.filter((a: any) => a.revealed)
      .reduce((sum: number, a: any) => sum + (a.points ?? 0), 0) ?? 0;

  // ── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className={b.stage}>
      <h1 className={b.title}>AG1 Family Feud 💥</h1>

      {/* Round info + progress */}
      <p className={b.subtitle}>
        ✨ {roundInfo?.title || `Round ${currentRound}`} ✨ —{" "}
        {roundInfo?.category || "General Knowledge"}
      </p>

      {/* Question progress */}
      <div
        style={{
          marginBottom: "1rem",
          textAlign: "center",
          color: "#A7B8C8",
          fontSize: "0.95rem",
          letterSpacing: "0.2px",
        }}
      >
        Question{" "}
        <strong style={{ color: vars.color.gold }}>{currentIndex + 1}</strong>{" "}
        of <strong style={{ color: vars.color.gold }}>{totalQuestions}</strong>
        {isLastQuestion && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              marginLeft: 8,
              color: vars.color.flavorPink,
              fontWeight: 700,
            }}
          >
            🔥 FINAL QUESTION!
          </motion.span>
        )}
      </div>

      {/* Question prompt */}
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <motion.h2
          key={current.id}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: "1.75rem",
            fontWeight: 600,
            color: vars.color.gold,
            textShadow: "0 0 15px rgba(255,255,150,0.6)",
            letterSpacing: "0.5px",
          }}
        >
          {current.prompt}
        </motion.h2>
      </div>

      {/* Answer grid */}
      <div className={b.grid}>
        {current.answers.map((a: any, i: number) => (
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

      {/* Footer: teams + strikes */}
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

      {/* Revealed points */}
      <div style={{ marginTop: 8, color: "#A7B8C8" }}>
        Revealed on board:&nbsp;
        <strong style={{ color: "#F7C948" }}>{totalRevealed}</strong>
      </div>

      {/* Big “X” overlay */}
      {showBigX && <div className={b.strikeBig}>X</div>}

      {/* Final question CTA  */}
      {isLastQuestion && allRevealed && (
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <AnimatePresence>
            <motion.div
              key="roundDone"
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              aria-live="polite"
            >
              <span
                style={{
                  fontWeight: 700,
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ✨ Round complete
              </span>

              <motion.button
                onClick={() => {
                  if (endTriggeredRef.current) return;
                  endTriggeredRef.current = true;
                  handleEndOfRound();
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  letterSpacing: "0.04em",
                  fontWeight: 800,
                }}
                title="Press Enter to continue"
              >
                Next →
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Round animation footer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRound}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: "center",
            marginBottom: "1rem",
            color: "#F7C948",
            textShadow: "0 0 20px rgba(255,255,150,0.8)",
          }}
        >
          <h2>✨ {roundInfo?.title || `Round ${currentRound}`} ✨</h2>
          <p style={{ color: "#A7B8C8" }}>
            Category: {roundInfo?.category || "General Knowledge"}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}