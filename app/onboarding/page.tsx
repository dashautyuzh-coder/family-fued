"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { vars } from "@/styles/theme.css";
import * as a from "@/styles/atoms.css";
import { sound } from "@/lib/sounds";

// --- Brand word banks ---
const WORDS_AG1 = [
  "Tropical",
  "Vibrant",
  "Crisp",
  "Zesty",
  "Green",
  "Daily",
  "Bright",
  "Pure",
  "Balanced",
  "Radiant",
  "Revive",
  "Minty",
];
const WORDS_AGZ = [
  "Chocolate",
  "Velvet",
  "Fudgy",
  "Creamy",
  "Toasty",
  "Caramel",
  "Mocha",
  "Cookie",
  "Brownie",
  "Silky",
  "Swirl",
  "Truffle",
];

type Step = "team1" | "team2" | "review";
type Brand = "AG1" | "AGZ";

function sampleTwo(bank: string[]) {
  const a = bank[Math.floor(Math.random() * bank.length)];
  let b = bank[Math.floor(Math.random() * bank.length)];
  let guard = 0;
  while (b === a && guard++ < 10)
    b = bank[Math.floor(Math.random() * bank.length)];
  return [a, b];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { setTeamName, resetScoresAndStrikes, teams } = useGameStore();

  const [step, setStep] = useState<Step>("team1");
  const [brand1, setBrand1] = useState<Brand>("AG1");
  const [brand2, setBrand2] = useState<Brand>("AGZ");

  const [w1, setW1] = useState<[string, string] | null>(null);
  const [w2, setW2] = useState<[string, string] | null>(null);

  // Helpers
  const roll1 = useCallback(() => {
    const [a, b] = sampleTwo(brand1 === "AG1" ? WORDS_AG1 : WORDS_AGZ);
    setW1([a, b]);
    sound.play?.("award");
  }, [brand1]);

  const roll2 = useCallback(() => {
    const [a, b] = sampleTwo(brand2 === "AG1" ? WORDS_AG1 : WORDS_AGZ);
    setW2([a, b]);
    sound.play?.("award");
  }, [brand2]);

  const next = useCallback(() => {
    sound.play?.("winner");
    setStep((s) =>
      s === "team1" ? "team2" : s === "team2" ? "review" : "review"
    );
  }, []);

  const back = useCallback(() => {
    setStep((s) =>
      s === "review" ? "team2" : s === "team2" ? "team1" : "team1"
    );
  }, []);

  const startFaceoff = useCallback(() => {
    const name1 = w1?.join(" ").trim() || teams[0].name || "Team 1";
    const name2 = w2?.join(" ").trim() || teams[1].name || "Team 2";
    setTeamName(0, name1);
    setTeamName(1, name2);
    resetScoresAndStrikes();
    sound.play?.("faceoff:random");
    router.push("/faceoff");
  }, [w1, w2, setTeamName, resetScoresAndStrikes, router, teams]);

  // Keyboard: Enter=next/start • R=roll • Backspace/Esc=back (except when typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea";
      if (isTyping) return;

      const k = e.key.toLowerCase();
      if (k === "r") {
        if (step === "team1") roll1();
        if (step === "team2") roll2();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (step === "review") startFaceoff();
        else next();
      } else if (e.key === "Backspace" || k === "escape") {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, next, back, roll1, roll2, startFaceoff]);

  // Visual tokens
  const accent1 =
    brand1 === "AG1" ? vars.color.flavorGreen : vars.color.flavorPink;
  const accent2 =
    brand2 === "AG1" ? vars.color.flavorGreen : vars.color.flavorPink;

  // Reusable UI
  const Slot = ({
    value,
    onChange,
    accent,
    big,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    accent: string;
    big?: boolean;
    placeholder?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "relative",
        borderRadius: 18,
        padding: big ? "18px 18px" : "14px 14px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        minWidth: big ? 220 : 200,
      }}
    >
      <motion.div
        aria-hidden
        animate={{ opacity: [0.12, 0.24, 0.12] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 18,
          boxShadow: `inset 0 0 0 1px ${accent}33, inset 0 0 24px ${accent}22`,
          pointerEvents: "none",
        }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Word"}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#fff",
          fontWeight: 900,
          letterSpacing: "0.02em",
          fontSize: big ? "1.5rem" : "1.25rem",
          textAlign: "center",
        }}
      />
    </motion.div>
  );

  const StepHeader = ({
    title,
    subtitle,
    accent,
    right,
  }: {
    title: string;
    subtitle?: string;
    accent?: string;
    right?: React.ReactNode;
  }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: accent || "#fff" }}>{title}</h2>
        {subtitle && (
          <div style={{ color: "#A7B8C8", fontSize: 14 }}>{subtitle}</div>
        )}
      </div>
      {right}
    </div>
  );

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <section
      className={a.card({ tone: "accent" })}
      style={{
        width: "min(960px, 92vw)",
        padding: 20,
        background: "rgba(4,16,42,0.65)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(8px)",
        borderRadius: 16,
        zIndex: 2,
      }}
    >
      {children}
    </section>
  );

  // Page
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background */}
      <motion.div
        aria-hidden
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 16, repeat: Infinity, repeatType: "mirror" }}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(1400px 800px at 50% -10%, #0e1b47, #020817 70%)",
          zIndex: 0,
        }}
      />
      <motion.div
        aria-hidden
        animate={{ opacity: [0.18, 0.35, 0.18], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: "-20%",
          background:
            "conic-gradient(from 0deg at 30% 20%, rgba(43,182,115,0.18), transparent 40%, rgba(247,201,72,0.18), transparent 70%)",
          filter: "blur(90px)",
          zIndex: 0,
        }}
      />

      <AnimatePresence mode="wait">
        {/* Team 1 */}
        {step === "team1" && (
          <motion.div
            key="team1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            style={{
              width: "100%",
              display: "grid",
              placeItems: "center",
              zIndex: 2,
            }}
          >
            <Shell>
              <StepHeader
                title="Team 1"
                subtitle="Pick two words (or edit) • Press R to roll"
                accent={accent1}
                right={
                  <select
                    value={brand1}
                    onChange={(e) => setBrand1(e.target.value as Brand)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                      borderRadius: 10,
                      padding: "6px 8px",
                    }}
                    aria-label="Brand"
                  >
                    <option value="AG1">AG1</option>
                    <option value="AGZ">AGZ</option>
                  </select>
                }
              />

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                <Slot
                  value={w1?.[0] ?? ""}
                  onChange={(v) => setW1([v, w1?.[1] ?? ""])}
                  accent={accent1}
                  big
                  placeholder="First word"
                />
                <motion.span
                  aria-hidden
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ color: "#A7B8C8" }}
                >
                  +
                </motion.span>
                <Slot
                  value={w1?.[1] ?? ""}
                  onChange={(v) => setW1([w1?.[0] ?? "", v])}
                  accent={accent1}
                  big
                  placeholder="Second word"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                  marginTop: 14,
                }}
              >
                <button
                  onClick={roll1}
                  className={a.button({ variant: "secondary" })}
                >
                  🎲 Roll
                </button>
                <button
                  onClick={next}
                  disabled={!w1 || !w1[0] || !w1[1]}
                  className={a.button({ variant: "flavorGold" })}
                  title="Enter to continue"
                >
                  Continue →
                </button>
              </div>
            </Shell>
          </motion.div>
        )}

        {/* Team 2 */}
        {step === "team2" && (
          <motion.div
            key="team2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            style={{
              width: "100%",
              display: "grid",
              placeItems: "center",
              zIndex: 2,
            }}
          >
            <Shell>
              <StepHeader
                title="Team 2"
                subtitle="Pick two words (or edit) • Press R to roll"
                accent={accent2}
                right={
                  <select
                    value={brand2}
                    onChange={(e) => setBrand2(e.target.value as Brand)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                      borderRadius: 10,
                      padding: "6px 8px",
                    }}
                    aria-label="Brand"
                  >
                    <option value="AG1">AG1</option>
                    <option value="AGZ">AGZ</option>
                  </select>
                }
              />

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                <Slot
                  value={w2?.[0] ?? ""}
                  onChange={(v) => setW2([v, w2?.[1] ?? ""])}
                  accent={accent2}
                  big
                  placeholder="First word"
                />
                <motion.span
                  aria-hidden
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ color: "#A7B8C8" }}
                >
                  +
                </motion.span>
                <Slot
                  value={w2?.[1] ?? ""}
                  onChange={(v) => setW2([w2?.[0] ?? "", v])}
                  accent={accent2}
                  big
                  placeholder="Second word"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                  marginTop: 14,
                }}
              >
                <button
                  onClick={roll2}
                  className={a.button({ variant: "secondary" })}
                >
                  🎲 Roll
                </button>
                <button
                  onClick={next}
                  disabled={!w2 || !w2[0] || !w2[1]}
                  className={a.button({ variant: "flavorGold" })}
                  title="Enter to continue"
                >
                  Continue →
                </button>
              </div>
            </Shell>
          </motion.div>
        )}

        {/* Review */}
        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            style={{
              width: "100%",
              display: "grid",
              placeItems: "center",
              zIndex: 2,
            }}
          >
            <Shell>
              <StepHeader title="Review" subtitle="Lock it in and play" />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: accent1,
                      fontWeight: 900,
                      fontSize: "1.4rem",
                    }}
                  >
                    {w1?.join(" ") || teams[0].name || "Team 1"}
                  </div>
                  <button
                    onClick={() => setStep("team1")}
                    className={a.button({ variant: "ghost" })}
                    style={{ marginTop: 8, fontSize: 12 }}
                  >
                    Edit Team 1
                  </button>
                </div>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: accent2,
                      fontWeight: 900,
                      fontSize: "1.4rem",
                    }}
                  >
                    {w2?.join(" ") || teams[1].name || "Team 2"}
                  </div>
                  <button
                    onClick={() => setStep("team2")}
                    className={a.button({ variant: "ghost" })}
                    style={{ marginTop: 8, fontSize: 12 }}
                  >
                    Edit Team 2
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 18,
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={startFaceoff}
                  className={a.button({ variant: "flavorGold", size: "lg" })}
                  title="Enter to start"
                >
                  Start Face-Off →
                </button>
                <button
                  onClick={back}
                  className={a.button({ variant: "secondary" })}
                >
                  Back
                </button>
              </div>
            </Shell>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
