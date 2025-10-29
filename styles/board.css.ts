// styles/board.css.ts
import { style, styleVariants, keyframes } from "@vanilla-extract/css";
import { vars } from "./theme.css";

/* ========== Animations ========== */
const pulse = keyframes({
  "0%": { transform: "scale(1)", boxShadow: "none" },
  "50%": { transform: "scale(1.01)" },
  "100%": { transform: "scale(1)", boxShadow: "none" },
});

const glowSweep = keyframes({
  "0%": { opacity: 0, transform: "translateX(-40%)" },
  "50%": { opacity: 0.7 },
  "100%": { opacity: 0, transform: "translateX(120%)" },
});

const popIn = keyframes({
  "0%": { transform: "scale(0.8)", opacity: 0 },
  "60%": { transform: "scale(1.06)", opacity: 1 },
  "100%": { transform: "scale(1)", opacity: 1 },
});

const strikePop = keyframes({
  "0%": { transform: "scale(0.6) rotate(-10deg)", opacity: 0 },
  "60%": { transform: "scale(1.15) rotate(3deg)", opacity: 1 },
  "100%": { transform: "scale(1) rotate(0deg)", opacity: 1 },
});

const strikeEnter = keyframes({
  "0%": {
    transform: "scale(6) rotate(-15deg)",
    opacity: 0,
    filter: "blur(6px)",
  },
  "40%": {
    transform: "scale(3.5) rotate(10deg)",
    opacity: 1,
    filter: "blur(0)",
  },
  "70%": {
    transform: "scale(1.6) rotate(0deg)",
  },
  "100%": {
    transform: "scale(1) rotate(0deg)",
  },
});

export const strikeBig = style({
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: "16rem", // huge X
  fontWeight: 900,
  color: vars.color.negative,
  textShadow: "0 0 50px rgba(239,68,68,0.8)",
  zIndex: 1000,
  animation: `${strikeEnter} 0.8s cubic-bezier(0.23, 1, 0.32, 1)`,
  pointerEvents: "none",
});

/* ========== Layout ========== */
export const stage = style({
  maxWidth: 1100,
  margin: "0 auto",
  padding: `${vars.space[8]} ${vars.space[4]} ${vars.space[10]}`,
});

export const title = style({
  fontFamily: vars.font.display,
  fontSize: "40px",
  fontWeight: 800,
  letterSpacing: ".4px",
  marginBottom: vars.space[2],
});

export const subtitle = style({
  color: vars.color.muted,
  marginBottom: vars.space[6],
});

/* ========== Board ========== */
export const board = style({
  position: "relative",
  borderRadius: "22px",
  padding: vars.space[6],
  background: `linear-gradient(180deg, ${vars.color.panel}, ${vars.color.surface})`,
  border: `1px solid ${vars.color.border}`,
  boxShadow: `${vars.shadow.md}, inset 0 0 0 1px color-mix(in oklab, ${vars.color.border} 40%, #000 60%)`,
  overflow: "hidden",
});

export const promptRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[3],
  marginBottom: vars.space[4],
});

export const prompt = style({
  fontFamily: vars.font.display,
  fontSize: "24px",
  fontWeight: 700,
});

export const topCount = style({
  padding: "4px 10px",
  borderRadius: "999px",
  border: `1px solid ${vars.color.border}`,
  background: `color-mix(in oklab, ${vars.color.surface} 85%, #000 15%)`,
  color: vars.color.accent,
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
});

/* ========== Answers Grid ========== */
export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0,1fr))",
  gap: vars.space[3],
  "@media": { "(max-width: 820px)": { gridTemplateColumns: "1fr" } },
});

export const tile = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 64,
  padding: `${vars.space[3]} ${vars.space[4]}`,
  borderRadius: "14px",
  border: `1px solid ${vars.color.border}`,
  background: `linear-gradient(180deg, #0f1735, #0b1230)`,
  boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.04)",
  fontWeight: 800,
  overflow: "hidden",
  color: vars.color.text,
});

export const tileRevealed = style({
  background: `linear-gradient(180deg, #0f2a3a, #0e2a55)`,
  borderColor: "#1a4a70",
  boxShadow: `inset 0 0 0 1px #1a4a70`,
  animation: `${pulse} 900ms ease-out`,
  selectors: {
    "&::after": {
      content: "''",
      position: "absolute",
      top: 0,
      bottom: 0,
      left: "-20%",
      width: "40%",
      background:
        "linear-gradient(90deg, rgba(255,255,255,0.0), rgba(255,255,255,0.24), rgba(255,255,255,0))",
      filter: "blur(6px)",
      animation: `${glowSweep} 900ms ease-out`,
      pointerEvents: "none",
    },
  },
});

export const num = style({
  opacity: 0.6,
  marginRight: vars.space[2],
});

export const answerText = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const points = style({
  fontWeight: 900,
  fontVariantNumeric: "tabular-nums",
  color: vars.color.gold,
});

/* ========== Footer / Teams / Strikes ========== */
export const footer = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: vars.space[4],
  color: vars.color.muted,
});

export const teamBox = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderRadius: "12px",
  background: `color-mix(in oklab, ${vars.color.surface} 80%, #000 20%)`,
  border: `1px solid ${vars.color.border}`,
  boxShadow: vars.shadow.sm,
});

export const teamGlow = styleVariants({
  flavorGreen: {
    boxShadow: `0 0 0 2px ${vars.color.flavorGreen}, 0 8px 28px rgba(0,0,0,.35)`,
  },
  flavorPink: {
    boxShadow: `0 0 0 2px ${vars.color.flavorPink}, 0 8px 28px rgba(0,0,0,.35)`,
  },
  flavorBrown: {
    boxShadow: `0 0 0 2px #8F7A71, 0 8px 28px rgba(0,0,0,.35)`,
    background: vars.color.flavorGradientAgz,
    color: "black",
  },
  flavorGold: {
    boxShadow: `0 0 0 2px #FFC93A, 0 8px 28px rgba(0,0,0,.35)`,
    background: vars.color.flavorGradientAg1,
    color: "black",
  },
});

export const score = style({
  fontFamily: vars.font.display,
  fontWeight: 900,
  fontSize: "28px",
});

export const strike = style({
  color: vars.color.negative,
  fontWeight: 900,
  fontSize: "28px",
  animation: `${strikePop} 380ms ease-out`,
});

/* ========== Toasts (Points/Reveal) ========== */
export const toast = style({
  position: "absolute",
  top: -10,
  right: 12,
  padding: `6px 10px`,
  borderRadius: "10px",
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
  color: "black",
  background: vars.color.gold,
  border: "1px solid rgba(0,0,0,.15)",
  boxShadow: vars.shadow.md,
  animation: `${popIn} 260ms ease-out`,
  selectors: {
    [`${tileRevealed} &`]: { top: -12 },
  },
});

export const toastFlavor = styleVariants({
  flavorGreen: { background: vars.color.flavorGreen, color: "black" },
  flavorPink: { background: vars.color.flavorPink, color: "black" },
  flavorBrown: { background: vars.color.flavorGradientAg1, color: "black" },
  flavorGold: { background: vars.color.flavorGradientAgz, color: "black" },
});
