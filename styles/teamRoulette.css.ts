// styles/teamRoulette.css.ts
import { style, keyframes } from "@vanilla-extract/css";
import { vars } from "./theme.css";

/* tiny pop-in for labels */
const pop = keyframes({
  "0%": { opacity: 0, transform: "translateY(-6px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

export const page = style({
  minHeight: "100dvh",
  padding: `${vars.space[6]} ${vars.space[4]}`,
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gap: vars.space[4],
  background: `radial-gradient(1300px 600px at 50% -140px, #0e1b47, ${vars.color.bg})`,
});

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[3],
  flexWrap: "wrap",
});

export const title = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontWeight: 900,
  letterSpacing: ".02em",
  fontSize: "28px",
});

export const goldBtn = style({
  border: "none",
  borderRadius: 999,
  padding: `${vars.space[3]} ${vars.space[6]}`,
  fontWeight: 900,
  letterSpacing: ".08em",
  fontSize: "0.9rem",
  cursor: "pointer",
  color: "#061015",
  background:
    "linear-gradient(120deg, #F7C948, #FFD700, #F7C948, #FFED9E, #F7C948)",
  backgroundSize: "260% 260%",
  boxShadow: "0 6px 18px rgba(0,0,0,.35)",
});

export const arena = style({
  position: "relative",
  borderRadius: vars.radius.xl,
  overflow: "hidden",
  background:
    "radial-gradient(1200px 800px at 50% 10%, rgba(255,255,255,.04), transparent 60%)",
});

export const labelA = style({
  position: "absolute",
  left: 24,
  top: 16,
  color: vars.color.flavorGreen,
  textTransform: "uppercase",
  letterSpacing: ".18em",
  fontWeight: 900,
  fontSize: 13,
  textShadow: "0 0 18px rgba(119,193,154,.65)",
  animation: `${pop} .35s ease both`,
});
export const labelB = style({
  position: "absolute",
  right: 24,
  top: 16,
  color: vars.color.flavorPink,
  textTransform: "uppercase",
  letterSpacing: ".18em",
  fontWeight: 900,
  fontSize: 13,
  textShadow: "0 0 18px rgba(229,101,126,.65)",
  animation: `${pop} .35s .05s ease both`,
});

/* Big text-only name with colorful glow */
export const name = style({
  position: "relative",
  fontFamily: vars.font.display,
  fontWeight: 800,
  letterSpacing: ".02em",
  fontSize: "clamp(22px, 3.8vw, 46px)",
  userSelect: "none",
  whiteSpace: "nowrap",
  textAlign: "center",
  color: "#fff",
  // subtle neon fade around each name
  textShadow: `
    0 0 12px rgba(255,255,255,0.25),
    0 0 24px rgba(255,255,255,0.15)
  `,
  transition: "color .4s ease, text-shadow .4s ease, opacity .4s ease",
});

/* color accents for team sides (applied inline) */
export const teamAColor = style({
  color: vars.color.flavorGreen,
  textShadow: `
    0 0 14px rgba(119,193,154,.8),
    0 0 30px rgba(119,193,154,.4)
  `,
});

export const teamBColor = style({
  color: vars.color.flavorPink,
  textShadow: `
    0 0 14px rgba(229,101,126,.8),
    0 0 30px rgba(229,101,126,.4)
  `,
});

/* captain highlight (gold glow) */
export const captain = style({
  color: vars.color.gold,
  textShadow: `
    0 0 18px rgba(247,201,72,.9),
    0 0 40px rgba(247,201,72,.6)
  `,
});

/* non-selected fade out */
export const dim = style({
  opacity: 0.25,
  filter: "blur(0.3px)",
});

/* invisible targets to line up team stacks */
export const stackGhost = style({
  width: "min(46vw, 560px)",
  height: "clamp(30px, 4vw, 50px)",
  opacity: 0,
  pointerEvents: "none",
});

export const footer = style({
  textAlign: "center",
  color: vars.color.muted,
  fontSize: 12,
  opacity: 0.95,
});
