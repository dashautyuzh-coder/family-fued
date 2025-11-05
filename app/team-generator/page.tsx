"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { ROSTER, type Name } from "@/lib/roster";
import * as s from "@/styles/teamRoulette.css";

type Phase = "idle" | "shuffling" | "revealing";

export default function TeamRoulettePage() {
  const {
    currentRound,
    teamSize,
    teamMembers,
    generateTeamsForCurrentRound,
    teamsGeneratedForRound,
  } = useGameStore();

  const [phase, setPhase] = useState<Phase>("idle");
  const [positions, setPositions] = useState<
    Record<Name, { x: number; y: number }>
  >({});
  const [arenaSize, setArenaSize] = useState({ w: 0, h: 0 });
  const [captains, setCaptains] = useState<[Name | null, Name | null]>([
    null,
    null,
  ]);

  const arenaRef = useRef<HTMLDivElement | null>(null);

  // track layout size
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

  // initial scatter positions
  useEffect(() => {
    if (!arenaSize.w) return;
    const w = arenaSize.w * 0.9;
    const h = arenaSize.h * 0.7;
    const next: Record<Name, { x: number; y: number }> = {} as any;
    for (const n of ROSTER) {
      next[n] = {
        x: randBetween(-w / 2, w / 2),
        y: randBetween(-h / 2, h / 2),
      };
    }
    setPositions(next);
  }, [arenaSize.w, arenaSize.h]);

  const startShuffle = useCallback(() => {
    setPhase("shuffling");

    // slowly drift around for ~5 seconds
    let ticks = 0;
    const interval = setInterval(() => {
      setPositions((prev) => {
        const next: Record<Name, { x: number; y: number }> = {} as any;
        for (const n of ROSTER) {
          const cur = prev[n];
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
      if (ticks >= 10) {
        clearInterval(interval);

        // generate two teams of 5
        if (teamsGeneratedForRound !== currentRound) {
          generateTeamsForCurrentRound();
        }

        const left = useGameStore.getState().teamMembers[0] as Name[];
        const right = useGameStore.getState().teamMembers[1] as Name[];
        const pick = (arr: Name[]) =>
          arr[Math.floor(Math.random() * arr.length)];
        setCaptains([pick(left), pick(right)]);
        setPhase("revealing");
      }
    }, 500);
  }, [currentRound, generateTeamsForCurrentRound, teamsGeneratedForRound]);

  return (
    <main className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>Family Feud — Team Generator</h1>
        <button className={s.goldBtn} onClick={startShuffle}>
          {phase === "shuffling" ? "Shuffling..." : "GENERATE TEAMS"}
        </button>
      </header>

      <section ref={arenaRef} className={s.arena}>
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
            const side = (teamMembers[0] as Name[]).includes(name)
              ? 0
              : (teamMembers[1] as Name[]).includes(name)
              ? 1
              : -1;
            const isCaptain = captains.includes(name);

            return (
              <motion.div
                key={name}
                animate={
                  phase === "revealing"
                    ? side === 0
                      ? {
                          x: -arenaSize.w / 3,
                          y:
                            (teamMembers[0] as Name[]).indexOf(name) * 50 - 100,
                        }
                      : side === 1
                      ? {
                          x: arenaSize.w / 3,
                          y:
                            (teamMembers[1] as Name[]).indexOf(name) * 50 - 100,
                        }
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
