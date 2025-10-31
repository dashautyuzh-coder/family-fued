"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fetchQuestions } from "@/lib/data";
import { useGameStore } from "@/lib/store";
import * as a from "@/styles/atoms.css";
import { useToast } from "@/lib/toast";
import { playSound } from "@/lib/sounds";

type TeamColor = "#2BB673" | "#F7C948" | "#1940AF" | "#E23B3B" | "#9B59B6";
const SWATCHES: TeamColor[] = [
  "#2BB673",
  "#F7C948",
  "#1940AF",
  "#E23B3B",
  "#9B59B6",
];

const EMOJIS = ["🦊", "🐯", "🐼", "🦁", "🐨", "🐵", "🦄", "🐸", "🐙", "🐧"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #2a3b86",
  background: "#0a1236",
  color: "white",
  outline: "none",
};

function useKeybinds(handlers: Record<string, (e: KeyboardEvent) => void>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (handlers[key]) handlers[key](e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers]);
}

// --- tiny confetti made of emojis (no deps) ---
function ConfettiBurst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: 10000,
          }}
        >
          {Array.from({ length: 28 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 0.25;
            const rotate = (Math.random() - 0.5) * 90;
            const emoji = ["✨", "🎉", "⭐", "💥", "🟡", "🟢"][i % 6];
            return (
              <motion.div
                key={i}
                initial={{ y: -40, x: 0, opacity: 0 }}
                animate={{
                  y: ["-10vh", "110vh"],
                  x: [0, (Math.random() - 0.5) * 200],
                  opacity: [0, 1, 1, 0],
                  rotate: [0, rotate],
                }}
                transition={{ duration: 1.6 + Math.random(), delay }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${left}%`,
                  fontSize: 24 + Math.random() * 14,
                }}
              >
                {emoji}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const { toast, Toast } = useToast();

  const {
    teams,
    setTeamName,
    setScore,
    resetScoresAndStrikes,
    loadQuestions,
    questions,
    resetAll,
  } = useGameStore();

  const [status, setStatus] = useState<string>("");
  const [mascots, setMascots] = useState<string[]>(["🦊", "🐯"]);
  const [colors, setColors] = useState<TeamColor[]>(["#2BB673", "#F7C948"]);
  const [burst, setBurst] = useState(false);
  const readyRef = useRef(false);

  // Load default questions on first visit
  useEffect(() => {
    async function load() {
      try {
        const q = await fetchQuestions();
         const list = Array.isArray(q?.questions) ? q!.questions : [];
         const withMeta = list.map((q: any, i: number) => ({
           ...q,
           index: i,
           category: q?.category,
         }));
         loadQuestions(withMeta);
        setStatus(`Loaded ${q.questions.length} questions (default)`);
      } catch {
        setStatus("Failed to load default questions");
      }
    }
    if (questions.length === 0) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  // Derived preview + completion
  const preview = useMemo(() => {
    if (questions.length === 0) return null;
    const first = questions[0];
    const total = questions.reduce((acc, q) => acc + q.answers.length, 0);
    return { count: questions.length, totalAnswers: total, first };
  }, [questions]);

  const completion = useMemo(() => {
    let score = 0;
    if (teams[0].name.trim()) score += 1;
    if (teams[1].name.trim()) score += 1;
    if (questions.length > 0) score += 1;
    return { score, total: 3, pct: (score / 3) * 100 };
  }, [teams, questions.length]);

  // Keybinds
  useKeybinds({
    enter: (e) => {
      e.preventDefault();
      handleStartFaceoff();
    },
    r: () => randomizeTeams(),
  });

  // Randomizers
  const randomName = () => {
    const prefixes = [
      "Mighty",
      "Sneaky",
      "Golden",
      "Turbo",
      "Electric",
      "Brave",
    ];
    const nouns = [
      "Avocados",
      "Koalas",
      "Wizards",
      "Sharks",
      "Pixels",
      "Rockets",
    ];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const n = nouns[Math.floor(Math.random() * nouns.length)];
    return `${p} ${n}`;
  };
  const randomizeTeams = () => {
    setTeamName(0, randomName());
    setTeamName(1, randomName());
    setScore(0, 0);
    setScore(1, 0);
    setMascots([
      EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    ]);
    setColors([
      SWATCHES[Math.floor(Math.random() * SWATCHES.length)],
      SWATCHES[Math.floor(Math.random() * SWATCHES.length)],
    ]);
    toast("🎲 Randomized teams!");
  };

  // Start flow
  const handleStartFaceoff = () => {
    if (!teams[0].name.trim() || !teams[1].name.trim()) {
      toast("⚠️ Give both teams a name first");
      return;
    }
    if (questions.length === 0) {
      toast("📦 Load a question pack first");
      return;
    }
    // fun burst + sound then route
    if (!readyRef.current) {
      readyRef.current = true;
      setBurst(true);
      playSound?.("ready");
      setTimeout(() => {
        setBurst(false);
        router.push("/faceoff");
      }, 1000);
    }
  };

  // Drag & drop JSON loader (alternate to fetchQuestions)
  const onDrop: React.DragEventHandler<HTMLLabelElement> = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const q = Array.isArray(parsed?.questions) ? parsed.questions : parsed;
      if (!Array.isArray(q)) throw new Error("Bad format");
      loadQuestions(q);
      setStatus(`Loaded ${q.length} questions from ${file.name}`);
      toast("✅ Custom question pack loaded");
    } catch {
      toast("❌ Could not parse that JSON");
    }
  };

  const preventDefaults: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <main className={a.container} style={{ position: "relative" }}>
      {/* Sparkly header */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 1.2 }}
          style={{
            position: "absolute",
            inset: -2,
            background:
              "radial-gradient(1200px 800px at 50% -10%, #0e1b47, #020817 75%)",
            zIndex: -1,
          }}
        />
        <motion.h1
          className={a.h1}
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          ✨ Game Setup
          <motion.span
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: [1, 1.1, 1], rotate: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🪩
          </motion.span>
        </motion.h1>
        <p className={a.muted} style={{ marginTop: -6 }}>
          Name your teams, pick a vibe, and load questions. Press <kbd>R</kbd>{" "}
          to randomize, <kbd>Enter</kbd> to start.
        </p>

        {/* Progress pill */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={a.card({ tone: "gold" })}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginTop: 10,
          }}
        >
          <div
            style={{
              width: 180,
              height: 8,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #2BB673, #F7C948, #1940AF)",
              }}
              animate={{ width: `${completion.pct}%` }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
            />
          </div>
          <strong>
            {completion.score}/{completion.total} Ready
          </strong>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className={a.buttonsRow} style={{ marginTop: 12 }}>
        <button
          onClick={handleStartFaceoff}
          className={a.button({ variant: "flavorGold", size: "lg" })}
          title="Start with a face-off round"
        >
          ⚡ Start Face-Off →
        </button>
        <button
          onClick={() => router.push("/game")}
          className={a.button({ variant: "primary", size: "lg" })}
          title="Skip to game board"
        >
          🎲 Open Game →
        </button>
        <button
          onClick={randomizeTeams}
          className={a.button({ variant: "ghost" })}
          title="Surprise me"
        >
          🎲 Randomize
        </button>
      </div>

      {/* Teams */}
      <section className={a.card({ tone: "accent" })} style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>👥 Teams</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {[0, 1].map((idx) => (
            <motion.div
              key={idx}
              className={a.card()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <label style={{ display: "block", marginBottom: 6 }}>
                Team {idx === 0 ? "A" : "B"}
              </label>

              {/* Name + mascot row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                }}
              >
                <input
                  value={teams[idx].name}
                  onChange={(e) => setTeamName(idx as 1 | 0, e.target.value)}
                  placeholder={idx === 0 ? "Team A name" : "Team B name"}
                  style={{
                    ...inputStyle,
                    borderColor: teams[idx].name ? "#2a3b86" : "#E23B3B55",
                  }}
                />
                <button
                  className={a.button({ variant: "ghost" })}
                  onClick={() => {
                    const next =
                      EMOJIS[
                        (EMOJIS.indexOf(mascots[idx]) + 1) % EMOJIS.length
                      ];
                    setMascots((m) => {
                      const copy = [...m];
                      copy[idx] = next;
                      return copy;
                    });
                  }}
                  title="Change mascot"
                >
                  {mascots[idx]} Change
                </button>
              </div>

              {/* Color swatches */}
              <div style={{ marginTop: 8 }}>
                <span className={a.muted}>Team color:</span>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  {SWATCHES.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        setColors((clrs) => {
                          const copy = [...clrs] as TeamColor[];
                          copy[idx] = c;
                          return copy;
                        })
                      }
                      aria-label={`Pick color ${c}`}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: c,
                        outline:
                          colors[idx] === c
                            ? "2px solid white"
                            : "1px solid rgba(255,255,255,0.25)",
                        boxShadow:
                          colors[idx] === c
                            ? "0 0 12px rgba(255,255,200,0.6)"
                            : "none",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Score */}
              <div style={{ marginTop: 10 }}>
                <label>Score:&nbsp;</label>
                <input
                  type="number"
                  value={teams[idx].score}
                  onChange={(e) =>
                    setScore(idx as 1 | 0, Number(e.target.value))
                  }
                  style={{ ...inputStyle, width: 140, borderRadius: 8 }}
                />
              </div>

              {/* Preview card vibe */}
              <motion.div
                style={{
                  marginTop: 10,
                  borderRadius: 12,
                  padding: 10,
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(0,0,0,0)",
                    `0 0 24px ${colors[idx]}44`,
                    "0 0 0px rgba(0,0,0,0)",
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity }}
              >
                <span style={{ fontSize: 24 }}>{mascots[idx]}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {teams[idx].name || "— Untitled Team —"}
                  </div>
                  <div className={a.muted} style={{ fontSize: 12 }}>
                    Vibe preview • {colors[idx]}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className={a.buttonsRow} style={{ marginTop: 12 }}>
          <button
            onClick={resetScoresAndStrikes}
            className={a.button({ variant: "ghost" })}
            title="Zero scores and clear strikes"
          >
            🧹 Reset scores & strikes
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  "Reset EVERYTHING? Teams and questions will be cleared."
                )
              ) {
                resetAll();
                setStatus("Game reset.");
                setMascots(["🦊", "🐯"]);
                setColors(["#2BB673", "#F7C948"]);
                toast("🔄 Full game reset");
              }
            }}
            className={a.button({ variant: "secondary" })}
            title="Full reset: teams + questions"
          >
            🔄 Full game reset
          </button>
        </div>
      </section>

      {/* Questions */}
      <section className={a.card()} style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>🧩 Questions</h2>
        {!!status && (
          <p className={a.muted} style={{ marginTop: 8 }}>
            {status}
          </p>
        )}

        {preview && (
          <motion.div
            className={a.card({ tone: "gold" })}
            style={{ marginTop: 12 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <strong>{preview.count}</strong> questions loaded (
            <strong>{preview.totalAnswers}</strong> total answers).
            <br />
            First: <em>{preview.first.prompt}</em>
          </motion.div>
        )}

        {/* Drag & Drop / Upload */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 12,
            marginTop: 12,
          }}
        >
          <label
            onDrop={onDrop}
            onDragOver={preventDefaults}
            onDragEnter={preventDefaults}
            onDragLeave={preventDefaults}
            className={a.card({ tone: "accent" })}
            style={{
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: 20,
              cursor: "pointer",
              border: "1px dashed rgba(255,255,255,0.2)",
            }}
            title="Drop a JSON file with a `questions` array"
          >
            <div>
              <div style={{ fontSize: 22 }}>📥 Drop a JSON pack</div>
              <div className={a.muted} style={{ marginTop: 4 }}>
                or click to choose a file
              </div>
              <input
                type="file"
                accept="application/json"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const text = await f.text();
                    const parsed = JSON.parse(text);
                    const q = Array.isArray(parsed?.questions)
                      ? parsed.questions
                      : parsed;
                    if (!Array.isArray(q)) throw new Error("Bad format");
                    loadQuestions(q);
                    setStatus(`Loaded ${q.length} questions from ${f.name}`);
                    toast("✅ Custom question pack loaded");
                  } catch {
                    toast("❌ Could not parse that JSON");
                  }
                }}
              />
            </div>
          </label>

          <div className={a.card()} style={{ padding: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Tips</div>
            <ul className={a.muted} style={{ margin: 0, paddingLeft: 18 }}>
              <li>
                Press <kbd>R</kbd> to roll fun team names
              </li>
              <li>
                Press <kbd>Enter</kbd> to start Face-Off
              </li>
              <li>
                Drag a JSON file with a <code>questions</code> array
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Go buttons */}
      <section className={a.buttonsRow} style={{ marginTop: 20 }}>
        <button
          onClick={() => router.push("/host")}
          className={a.button({ variant: "secondary", size: "lg" })}
        >
          🎛️ Open Host →
        </button>
        <button
          onClick={() => router.push("/game")}
          className={a.button({ variant: "primary", size: "lg" })}
        >
          🎲 Open Game →
        </button>
        <button
          onClick={() => router.push("/questions")}
          className={a.button({ variant: "ghost", size: "lg" })}
        >
          Questions →
        </button>
      </section>

      <ConfettiBurst show={burst} />
      {Toast}
    </main>
  );
}
