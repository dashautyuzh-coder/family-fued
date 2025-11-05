"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { ROSTER, type Name } from "@/lib/roster";
import * as s from "@/styles/teamRoulette.css";

type Phase = "idle" | "shuffling" | "revealing";
type XY = { x: number; y: number };

export default function TeamRoulettePage() {
  const {
    currentRound,
    teamMembers,
    generateTeamsForCurrentRound,
    teamsGeneratedForRound,
  } = useGameStore();

  const [phase, setPhase] = useState<Phase>("idle");
  const [positions, setPositions] = useState<Partial<Record<Name, XY>>>({});
  const [arenaSize, setArenaSize] = useState({ w: 0, h: 0 });
  const [captains, setCaptains] = useState<[Name | null, Name | null]>([
    null,
    null,
  ]);

  // ⏱ countdown seconds shown on screen while shuffling (5 → 0)
  const [countdown, setCountdown] = useState<number | null>(null);

  const arenaRef = useRef<HTMLDivElement | null>(null);

  // Track layout size
  useEffect(() => {
    const setRect = () => {
      const r = arenaRef.current?.getBoundingClientRect();
      if (!r) return;
      setArenaSize({ w: r.width, h: r.height });
    };
    setRect();
    const obs = new ResizeObserver(setRect);
    if (arenaRef.current) obs.observe(arenaRef.current);
    window.addEventListener("resize", setRect);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", setRect);
    };
  }, []);

  // Initial scatter positions (once we know the arena size)
  useEffect(() => {
    if (!arenaSize.w || !arenaSize.h) return;
    const w = arenaSize.w * 0.9;
    const h = arenaSize.h * 0.7;
    const next: Partial<Record<Name, XY>> = {};
    for (const n of ROSTER) {
      next[n] = {
        x: randBetween(-w / 2, w / 2),
        y: randBetween(-h / 2, h / 2),
      };
    }
    setPositions(next);
  }, [arenaSize.w, arenaSize.h]);

  const startShuffle = useCallback(() => {
    if (!arenaSize.w || !arenaSize.h) return;
    if (phase === "shuffling") return; // prevent double starts
    setPhase("shuffling");
    setCountdown(5); // ~5s total

    // Slowly drift around for ~5 seconds (10 ticks @ 500ms)
    let ticks = 0;
    const interval = setInterval(() => {
      setPositions((prev) => {
        const prevSafe = prev ?? {};
        const next: Partial<Record<Name, XY>> = {};
        for (const n of ROSTER) {
          const cur = prevSafe[n] ?? { x: 0, y: 0 };
          const tx = cur.x + randBetween(-40, 40);
          const ty = cur.y + randBetween(-25, 25);
          next[n] = {
            x: cur.x + (tx - cur.x) * 0.1,
            y: cur.y + (ty - cur.y) * 0.1,
          };
        }
        return next;
      });

      ticks++;

      // Update countdown every full second (every 2 ticks)
      const secsLeft = Math.max(0, 5 - Math.floor(ticks / 2));
      setCountdown(secsLeft);

      if (ticks >= 10) {
        clearInterval(interval);
        setCountdown(0);

        // Generate two teams of 5 if not already done this round
        if (teamsGeneratedForRound !== currentRound) {
          generateTeamsForCurrentRound(); // no force
        }

        const state = useGameStore.getState();
        const left = (state.teamMembers?.[0] ?? []) as Name[];
        const right = (state.teamMembers?.[1] ?? []) as Name[];
        const pick = (arr: Name[]) =>
          arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

        setCaptains([pick(left), pick(right)]);
        setPhase("revealing");
      }
    }, 500);
  }, [
    arenaSize.w,
    arenaSize.h,
    phase,
    currentRound,
    generateTeamsForCurrentRound,
    teamsGeneratedForRound,
  ]);

  const teamA = ((teamMembers?.[0] ?? []) as Name[]) || [];
  const teamB = ((teamMembers?.[1] ?? []) as Name[]) || [];

  return (
    <main className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>Family Feud — Team Generator</h1>
        <button
          className={s.goldBtn}
          onClick={startShuffle}
          disabled={phase === "shuffling"}
          aria-disabled={phase === "shuffling"}
        >
          {phase === "shuffling" ? "Shuffling…" : "GENERATE TEAMS"}
        </button>
      </header>

      <section ref={arenaRef} className={s.arena}>
        {/* Big center countdown overlay */}
        <AnimatePresence>
          {phase === "shuffling" && countdown !== null && (
            <motion.div
              key={`cd-${countdown}`}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.45 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 900,
                  fontSize: "min(18vw, 180px)",
                  letterSpacing: ".03em",
                  color: "#fff",
                  textShadow:
                    "0 0 24px rgba(247,201,72,0.65), 0 0 48px rgba(43,182,115,0.45)",
                }}
              >
                {countdown}
              </div>
              <div
                style={{
                  marginTop: -14,
                  fontSize: 14,
                  color: "#A7B8C8",
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                }}
              >
                Shuffling teams…
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "revealing" && (
            <>
              <motion.div className={s.labelA}>TEAM A</motion.div>
              <motion.div className={s.labelB}>TEAM B</motion.div>
            </>
          )}
        </AnimatePresence>

        <div style={{ position: "absolute", inset: 0 }}>
          {ROSTER.map((name) => {
            const side = teamA.includes(name)
              ? 0
              : teamB.includes(name)
              ? 1
              : -1;
            const isCaptain =
              (captains[0] && name === captains[0]) ||
              (captains[1] && name === captains[1]);

            const revealY =
              side === 0
                ? teamA.indexOf(name) * 50 - 100
                : teamB.indexOf(name) * 50 - 100;

            return (
              <motion.div
                key={name}
                animate={
                  phase === "revealing"
                    ? side === 0
                      ? { x: -arenaSize.w / 3, y: revealY }
                      : side === 1
                      ? { x: arenaSize.w / 3, y: revealY }
                      : { opacity: 0.2 }
                    : { x: positions[name]?.x ?? 0, y: positions[name]?.y ?? 0 }
                }
                transition={{
                  duration: phase === "shuffling" ? 0.8 : 1.2,
                  ease: "easeOut",
                }}
                className={[
                  s.name,
                  isCaptain
                    ? s.captain
                    : side === 0
                    ? s.teamAColor
                    : side === 1
                    ? s.teamBColor
                    : "",
                  phase === "revealing" && side === -1 ? s.dim : "",
                ].join(" ")}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  translateX: "-50%",
                  translateY: "-50%",
                }}
              >
                {name}
                {isCaptain && " ⭐"}
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

/* utils */
function randBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
