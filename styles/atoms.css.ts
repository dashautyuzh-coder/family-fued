// styles/atoms.css.ts
import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "./theme.css";

// Layout helpers
export const container = style({
  maxWidth: 1100,
  margin: "0 auto",
  padding: `${vars.space[8]} ${vars.space[4]} ${vars.space[10]}`,
});

export const lead = style({
  color: vars.color.muted,
  fontSize: "20px",
  marginTop: vars.space[2],
  marginBottom: vars.space[6],
});

export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0,1fr))",
  gap: vars.space[4],
  "@media": {
    "(max-width: 900px)": { gridTemplateColumns: "1fr" },
  },
});

// 🔔 Animations
const pulseGlow = keyframes({
  "0%": { boxShadow: `0 0 0px rgba(0,0,0,0)` },
  "50%": { boxShadow: `0 0 28px rgba(255,255,255,0.20)` },
  "100%": { boxShadow: `0 0 0px rgba(0,0,0,0)` },
});

const ding = keyframes({
  "0%": { transform: "translateY(0) scale(1)" },
  "40%": { transform: "translateY(-2px) scale(1.08)" },
  "100%": { transform: "translateY(0) scale(1)" },
});

const sheen = keyframes({
  "0%": { transform: "translateX(-120%) rotate(20deg)" },
  "100%": { transform: "translateX(220%) rotate(20deg)" },
});

// Cards
export const card = recipe({
  base: {
    background: `linear-gradient(180deg, ${vars.color.panel}, ${vars.color.surface})`,
    border: `1px solid ${vars.color.border}`,
    borderRadius: vars.radius.lg,
    padding: vars.space[5],
    boxShadow: vars.shadow.sm,
    transition:
      "transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease",
    selectors: {
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: vars.shadow.md,
        borderColor: vars.color.accent,
        cursor: "pointer",
      },
    },
  },
  variants: {
    tone: {
      default: {},
      accent: {
        background: `linear-gradient(180deg, #0f2a3a, #0e2a55)`,
        borderColor: "#1a4a70",
      },
      gold: {
        background: `linear-gradient(180deg, rgba(247,201,72,.16), transparent)`,
        borderColor: vars.color.gold,
      },
      green: {
        background: `linear-gradient(180deg, rgba(95, 232, 211, 0.16), transparent)`,
        borderColor: vars.color.brand,
      },
      pink: {
        background: `linear-gradient(180deg, rgba(185, 28, 217, 0.16), transparent)`,
        borderColor: vars.color.flavorPink,
      },
      blue: {
        background: `linear-gradient(180deg, rgba(82, 10, 96, 0.16), transparent)`,
        borderColor: vars.color.accent,
      },
    },
    clickable: {
      true: { cursor: "pointer", display: "block" },
      false: {},
    },
  },
  defaultVariants: { tone: "default", clickable: false },
});

// Buttons
export const button = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: vars.space[2],
    padding: `${vars.space[2]} ${vars.space[4]}`,
    borderRadius: vars.radius.md,
    border: `1px solid ${vars.color.border}`,
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: vars.shadow.sm,
    transition:
      "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease, background 120ms ease",
    selectors: {
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: vars.shadow.md,
        borderColor: vars.color.accent,
        cursor: "pointer",
      },
      "&:active": { transform: "translateY(0)" },
      "&:disabled, &[aria-disabled='true']": {
        opacity: 0.5,
        cursor: "not-allowed",
        transform: "none",
        boxShadow: "none",
        filter: "grayscale(40%)",
      },
    },
  },
  variants: {
    variant: {
      primary: {
        background: `linear-gradient(90deg, ${vars.color.brand}, ${vars.color.brandSoft})`,
        color: "#07140B",
        border: "none",
      },
      secondary: {
        background: vars.color.panel,
        color: vars.color.text,
      },
      ghost: {
        background: "transparent",
        color: vars.color.text,
      },
      flavorGreen: {
        background: vars.color.flavorGreen,
        color: "black",
        border: "none",
      },
      flavorPink: {
        background: vars.color.flavorPink,
        color: "black",
        border: "none",
      },
      flavorBrown: {
        background: vars.color.flavorBrown,
        color: "black",
        border: "none",
      },
      flavorGold: {
        background: vars.color.flavorGold,
        color: "black",
        border: "none",
      },
    },
    size: {
      sm: { padding: `${vars.space[1]} ${vars.space[3]}` },
      md: { padding: `${vars.space[2]} ${vars.space[4]}` },
      lg: { padding: `${vars.space[3]} ${vars.space[5]}` },
      xl: { padding: `${vars.space[4]} ${vars.space[8]}` },
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

// Headings
export const h1 = style({
  fontFamily: vars.font.display,
  fontWeight: 800,
  fontSize: "42px",
  letterSpacing: ".5px",
  margin: `${vars.space[4]} 0 ${vars.space[2]}`,
});

export const muted = style({
  color: vars.color.muted,
});

export const buttonsRow = style({
  display: "flex",
  gap: vars.space[3],
  flexWrap: "wrap",
  alignItems: "center",
});

// 🟡 Generic buzzer pill (mix with your recipe)
export const buzzer = style({
  position: "relative",
  overflow: "hidden",
  borderRadius: 9999,
  letterSpacing: ".2px",
  textTransform: "none",
  paddingInline: vars.space[10],
  minHeight: 64,
  fontSize: "1.15rem",
  gap: vars.space[3],
  // subtle breathing glow
  selectors: {
    "&:not(:disabled):hover": {
      animation: `${pulseGlow} 2s ease-in-out infinite`,
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.gold}`,
      outlineOffset: 2,
    },
    // ✨ Sheen sweep
    "&::before": {
      content: "",
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(120deg, transparent 0%, rgba(255,255,255,.25) 15%, transparent 30%)",
      transform: "translateX(-120%) rotate(20deg)",
      pointerEvents: "none",
    },
    "&:hover::before": {
      animation: `${sheen} 950ms ease`,
    },
  },
});

// Color-tuned outer glow per team
export const buzzerGreen = style({
  boxShadow: `0 8px 30px rgba(43, 182, 115, 0.25)`,
});
export const buzzerPink = style({
  boxShadow: `0 8px 30px rgba(229, 101, 126, 0.25)`,
});

// Bigger bell + tiny bounce on hover
export const btnEmoji = style({
  fontSize: "1.35em",
  lineHeight: 1,
  display: "inline-block",
  selectors: {
    [`${buzzer}:hover &`]: {
      animation: `${ding} 450ms cubic-bezier(.2,.9,.2,1)`,
    },
  },
});
