import { style, keyframes } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const pulse = keyframes({
  "0%": { boxShadow: "0 0 15px rgba(255,255,255,0.2)" },
  "100%": { boxShadow: "0 0 40px rgba(255,255,255,0.6)" },
});

export const stage = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  textAlign: "center",
  minHeight: "100vh",
  padding: "4rem 2rem",
  background: `radial-gradient(circle at 50% 30%, ${vars.color.backgroundSoft}, #020617)`,
  color: "white",
});

export const question = style({
  fontSize: "2.4rem",
  fontWeight: 800,
  marginBottom: vars.space[6],
  textShadow: "0 0 20px rgba(255,255,255,0.4)",
});

export const podiums = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: vars.space[5],
  width: "100%",
  maxWidth: 900,
});

export const podium = style({
  borderRadius: 16,
  padding: "1.5rem",
  transition: "all 0.3s ease",
  border: `2px solid ${vars.color.border}`,
  background: vars.color.surface,
  textAlign: "center",
});

export const podiumActive = style({
  animation: `${pulse} 1.3s ease-in-out infinite alternate`,
  borderColor: vars.color.gold,
  transform: "scale(1.04)",
});

export const answerInput = style({
  width: "100%",
  fontSize: "1.2rem",
  padding: "12px 16px",
  marginTop: vars.space[3],
  borderRadius: 12,
  border: `1px solid ${vars.color.border}`,
  background: "#0b1236",
  color: "white",
  outline: "none",
  ":focus": { borderColor: vars.color.gold },
});

export const evaluateBtn = style({
  marginTop: vars.space[6],
});

export const resultText = style({
  marginTop: vars.space[6],
  color: vars.color.flavorGold,
  fontWeight: 700,
  fontSize: "1.4rem",
});

export const winnerSection = style({
  textAlign: "center",
  marginTop: vars.space[8],
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space[4],
});

export const revealBoard = style({
  marginTop: vars.space[6],
  display: "grid",
  gap: vars.space[2],
  textAlign: "left",
  maxWidth: 600,
  width: "100%",
  marginInline: "auto",
});

export const revealTile = style({
  padding: "0.8rem 1rem",
  borderRadius: 10,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  fontWeight: 700,
  transition: "all 0.2s ease",
  selectors: {
    "&:hover": {
      background: vars.color.brandSoft,
    },
  },
});
