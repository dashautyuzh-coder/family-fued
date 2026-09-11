// styles/jeopardy/board.css.ts
//
// Every color-bearing piece is a `theme`-variant recipe so the page can
// render either the classic AG1opardy navy/gold skin or a cute pastel
// "Sprinkle" skin (Lily's baby shower board) depending on which board is
// loaded.
import { style, keyframes } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "@/styles/shared/theme.css";

/* ========== Palettes ========== */

// AG1opardy — the real Jeopardy blue/gold, so it reads as unmistakably
// "Jeopardy" rather than the AG1 brand theme.
export const AG1_FRAME = "#02040f";
export const AG1_HEADER_TOP = "#1c2f7a";
export const AG1_HEADER_BOTTOM = "#111f5e";
export const AG1_CELL_TOP = "#2647c9";
export const AG1_CELL_MID = "#122478";
export const AG1_CELL_BOTTOM = "#081142";
export const AG1_GOLD = "#FFD54A";
export const AG1_TEXT = "#F5F7FF";
export const AG1_MUTED = "#A9B6E8";

// Sprinkle — soft, flowery baby-shower pastels: blush pink, cream, and a
// dusty rose accent standing in for "gold."
export const SPRINKLE_FRAME = "#FFF6F8";
export const SPRINKLE_HEADER_TOP = "#FDB9CD";
export const SPRINKLE_HEADER_BOTTOM = "#F98CB0";
export const SPRINKLE_CELL_TOP = "#FFE3ED";
export const SPRINKLE_CELL_MID = "#FFCADD";
export const SPRINKLE_CELL_BOTTOM = "#FFB0CB";
export const SPRINKLE_GOLD = "#E8779E"; // the "accent" role gold plays for ag1
export const SPRINKLE_TEXT = "#5B3A52";
export const SPRINKLE_MUTED = "#A9718F";

/* ========== Layout ========== */
export const stage = style({
  maxWidth: 1200,
  margin: "0 auto",
  padding: `${vars.space[8]} ${vars.space[4]} ${vars.space[10]}`,
});

// Lily's actual family photo, used as the full-page backdrop for the
// host/board screen — Sprinkle only, so the AG1 game (and every other
// page) keeps the plain dark theme background from the body.
export const hostPageBg = recipe({
  base: {
    minHeight: "100svh",
    width: "100%",
  },
  variants: {
    theme: {
      ag1: {},
      sprinkle: {
        // This photo is pre-composed with the family on the left and open
        // space on the right/center for the board to sit over — cover +
        // left-anchored position keeps them fully in frame.
        backgroundImage: `linear-gradient(180deg, rgba(255,246,248,0.5), rgba(255,214,230,0.6)), url('/jeopardy/bg-lily-2.png')`,
        backgroundSize: "cover",
        backgroundPosition: "left 65%",
        backgroundRepeat: "no-repeat",
      },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const title = recipe({
  base: {
    fontFamily: vars.font.display,
    fontSize: "40px",
    fontWeight: 800,
    letterSpacing: ".4px",
    marginBottom: vars.space[2],
    textAlign: "center",
  },
  variants: {
    theme: {
      ag1: { color: AG1_TEXT },
      sprinkle: { color: SPRINKLE_TEXT },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const subtitle = recipe({
  base: {
    marginBottom: vars.space[6],
    textAlign: "center",
  },
  variants: {
    theme: {
      ag1: { color: AG1_MUTED },
      sprinkle: { color: SPRINKLE_MUTED },
    },
  },
  defaultVariants: { theme: "ag1" },
});

/* ========== Board grid ========== */

export const board = recipe({
  base: {
    position: "relative",
    borderRadius: "20px",
    padding: "10px",
    overflow: "hidden",
  },
  variants: {
    theme: {
      ag1: {
        background: AG1_FRAME,
        border: "1px solid #000",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.04)",
      },
      sprinkle: {
        // Lily's family photo sits behind the grid — answered cells turn
        // transparent (see cellAnswered) so the picture reveals itself
        // piece by piece as the board is played.
        backgroundImage: `url('/jeopardy/lilybg.PNG')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: SPRINKLE_FRAME,
        border: `1px solid ${SPRINKLE_HEADER_BOTTOM}22`,
        boxShadow:
          "0 20px 60px rgba(233,140,176,0.25), inset 0 0 0 1px rgba(255,255,255,0.6)",
      },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const grid = style({
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: "4px",
  "@media": { "(max-width: 900px)": { gridTemplateColumns: "1fr" } },
});

export const categoryHeader = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    minHeight: 76,
    padding: "8px 10px",
    borderRadius: "4px",
    fontFamily: vars.font.display,
    fontWeight: 800,
    fontSize: "0.9rem",
    lineHeight: 1.25,
    textTransform: "uppercase",
    letterSpacing: ".03em",
  },
  variants: {
    theme: {
      ag1: {
        background: `linear-gradient(180deg, ${AG1_HEADER_TOP}, ${AG1_HEADER_BOTTOM})`,
        color: AG1_TEXT,
        textShadow: "0 2px 3px rgba(0,0,0,0.55)",
      },
      sprinkle: {
        borderRadius: "16px",
        background: `linear-gradient(180deg, ${SPRINKLE_HEADER_TOP}, ${SPRINKLE_HEADER_BOTTOM})`,
        color: "#FFF7FA",
        textShadow: "0 1px 2px rgba(180,60,110,0.35)",
      },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const cell = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 84,
    border: "none",
    fontFamily: vars.font.display,
    fontWeight: 900,
    fontSize: "1.7rem",
    cursor: "pointer",
    transition:
      "transform 140ms ease, box-shadow 140ms ease, filter 140ms ease",
    selectors: {
      "&:hover": { transform: "translateY(-2px)" },
      "&:disabled": { cursor: "default" },
    },
  },
  variants: {
    theme: {
      ag1: {
        borderRadius: "4px",
        background: `radial-gradient(circle at 50% 25%, ${AG1_CELL_TOP} 0%, ${AG1_CELL_MID} 60%, ${AG1_CELL_BOTTOM} 100%)`,
        color: AG1_GOLD,
        textShadow: "0 2px 0 rgba(0,0,0,0.55), 0 5px 12px rgba(0,0,0,0.35)",
        selectors: {
          "&:hover": {
            filter: "brightness(1.12)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
          },
        },
      },
      sprinkle: {
        borderRadius: "18px",
        background: `radial-gradient(circle at 50% 25%, ${SPRINKLE_CELL_TOP} 0%, ${SPRINKLE_CELL_MID} 60%, ${SPRINKLE_CELL_BOTTOM} 100%)`,
        color: "#8A3B5C",
        textShadow: "0 1px 0 rgba(255,255,255,0.6)",
        selectors: {
          "&:hover": {
            filter: "brightness(1.06)",
            boxShadow: "0 8px 20px rgba(233,140,176,0.4)",
          },
        },
      },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const cellAnswered = recipe({
  base: {
    color: "transparent",
    textShadow: "none",
    cursor: "default",
    boxShadow: "none",
    selectors: {
      "&:hover": { transform: "none", boxShadow: "none", filter: "none" },
    },
  },
  variants: {
    theme: {
      ag1: { background: AG1_FRAME },
      // Transparent, not opaque — lets the board's photo behind it show
      // through where this clue has been cleared.
      sprinkle: { background: "transparent" },
    },
  },
  defaultVariants: { theme: "ag1" },
});

/* ========== Clue panel ========== */
const clueIn = keyframes({
  "0%": { opacity: 0, transform: "translateY(-8px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

export const clueSection = style({
  marginTop: vars.space[6],
  animation: `${clueIn} 220ms ease-out`,
});

export const clueCard = recipe({
  base: {
    width: "100%",
    borderRadius: "20px",
    padding: vars.space[8],
    textAlign: "center",
  },
  variants: {
    theme: {
      ag1: {
        background: `linear-gradient(180deg, ${AG1_HEADER_TOP}, ${AG1_CELL_BOTTOM})`,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        color: AG1_TEXT,
      },
      sprinkle: {
        background: `linear-gradient(180deg, #FFFFFF, ${SPRINKLE_CELL_TOP})`,
        border: `1px solid ${SPRINKLE_HEADER_BOTTOM}33`,
        boxShadow: "0 12px 40px rgba(233,140,176,0.3)",
        color: SPRINKLE_TEXT,
      },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const clueCategory = recipe({
  base: {
    fontWeight: 700,
    letterSpacing: ".05em",
    textTransform: "uppercase",
    marginBottom: vars.space[2],
  },
  variants: {
    theme: {
      ag1: { color: AG1_MUTED },
      sprinkle: { color: SPRINKLE_MUTED },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const clueValue = recipe({
  base: {
    fontFamily: vars.font.display,
    fontWeight: 900,
    fontSize: "1.5rem",
    marginBottom: vars.space[4],
  },
  variants: {
    theme: {
      ag1: {
        color: AG1_GOLD,
        textShadow: "0 2px 0 rgba(0,0,0,0.5)",
      },
      sprinkle: {
        color: SPRINKLE_GOLD,
        textShadow: "0 1px 0 rgba(255,255,255,0.6)",
      },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const clueText = style({
  fontFamily: vars.font.display,
  fontSize: "1.75rem",
  fontWeight: 700,
  lineHeight: 1.35,
});

export const clueResponse = recipe({
  base: {
    marginTop: vars.space[6],
    paddingTop: vars.space[4],
    fontSize: "1.1rem",
    fontWeight: 700,
  },
  variants: {
    theme: {
      ag1: { borderTop: `1px dashed ${vars.color.border}` },
      sprinkle: { borderTop: `1px dashed ${SPRINKLE_HEADER_BOTTOM}55` },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const clueResponseLabel = recipe({
  base: {
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: ".05em",
    marginBottom: vars.space[1],
  },
  variants: {
    theme: {
      ag1: { color: AG1_MUTED },
      sprinkle: { color: SPRINKLE_MUTED },
    },
  },
  defaultVariants: { theme: "ag1" },
});

// The Jeopardy-style "Who is"/"What is" prefix — set apart from the actual
// answer text so the two read as visually distinct pieces.
export const cluePrefix = recipe({
  base: { marginRight: "0.35em" },
  variants: {
    theme: {
      ag1: { color: AG1_GOLD },
      sprinkle: { color: SPRINKLE_GOLD },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const clueAnswerText = recipe({
  base: {},
  variants: {
    theme: {
      ag1: { color: vars.color.flavorGreen },
      sprinkle: { color: SPRINKLE_TEXT },
    },
  },
  defaultVariants: { theme: "ag1" },
});

/* ========== Footer / scoreboard ========== */
export const footer = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: vars.space[6],
  },
  variants: {
    theme: {
      ag1: { color: AG1_MUTED },
      sprinkle: { color: SPRINKLE_MUTED },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const teamBox = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    gap: vars.space[2],
    padding: `${vars.space[2]} ${vars.space[4]}`,
    borderRadius: "12px",
  },
  variants: {
    theme: {
      ag1: {
        background: `linear-gradient(180deg, ${AG1_HEADER_TOP}, ${AG1_CELL_BOTTOM})`,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
        color: AG1_TEXT,
      },
      sprinkle: {
        background: `linear-gradient(180deg, #FFFFFF, ${SPRINKLE_CELL_TOP})`,
        border: `1px solid ${SPRINKLE_HEADER_BOTTOM}33`,
        boxShadow: "0 6px 18px rgba(233,140,176,0.3)",
        color: SPRINKLE_TEXT,
      },
    },
    active: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: { theme: "ag1", active: true },
      style: { boxShadow: `0 0 0 2px ${AG1_GOLD}, 0 8px 24px rgba(0,0,0,.45)` },
    },
    {
      variants: { theme: "sprinkle", active: true },
      style: {
        boxShadow: `0 0 0 2px ${SPRINKLE_GOLD}, 0 8px 24px rgba(233,140,176,.35)`,
      },
    },
  ],
  defaultVariants: { theme: "ag1", active: false },
});

export const score = recipe({
  base: {
    fontFamily: vars.font.display,
    fontWeight: 900,
    fontSize: "28px",
  },
  variants: {
    theme: {
      ag1: { color: AG1_GOLD },
      sprinkle: { color: SPRINKLE_GOLD },
    },
  },
  defaultVariants: { theme: "ag1" },
});

/* ========== Buttons ========== */

export const teamToggle = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: vars.space[2],
    padding: "8px 16px",
    borderRadius: "999px",
    fontFamily: vars.font.display,
    fontWeight: 800,
    fontSize: "0.95rem",
    border: "2px solid rgba(255,255,255,0.15)",
    cursor: "pointer",
    transition:
      "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
    selectors: {
      "&:hover": { transform: "translateY(-1px)" },
    },
  },
  variants: {
    theme: {
      ag1: {
        background: `linear-gradient(180deg, ${AG1_CELL_TOP}, ${AG1_CELL_BOTTOM})`,
        color: AG1_TEXT,
      },
      sprinkle: {
        background: `linear-gradient(180deg, ${SPRINKLE_CELL_TOP}, ${SPRINKLE_CELL_BOTTOM})`,
        color: SPRINKLE_TEXT,
        border: "2px solid rgba(255,255,255,0.6)",
      },
    },
    active: { true: {}, false: {} },
  },
  compoundVariants: [
    {
      variants: { theme: "ag1", active: true },
      style: {
        borderColor: AG1_GOLD,
        boxShadow: `0 0 0 1px ${AG1_GOLD}, 0 6px 18px rgba(0,0,0,.4)`,
        color: AG1_GOLD,
      },
    },
    {
      variants: { theme: "sprinkle", active: true },
      style: {
        borderColor: SPRINKLE_GOLD,
        boxShadow: `0 0 0 1px ${SPRINKLE_GOLD}, 0 6px 18px rgba(233,140,176,.4)`,
        color: "#B04A78",
      },
    },
  ],
  defaultVariants: { theme: "ag1", active: false },
});

export const navButton = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: vars.space[2],
    padding: `${vars.space[3]} ${vars.space[5]}`,
    borderRadius: vars.radius.md,
    fontFamily: vars.font.display,
    fontWeight: 800,
    fontSize: "1rem",
    border: "2px solid rgba(255,255,255,0.15)",
    cursor: "pointer",
    transition: "transform 120ms ease, box-shadow 120ms ease",
    selectors: {
      "&:hover": { transform: "translateY(-1px)" },
      "&:disabled": { opacity: 0.5, cursor: "not-allowed", transform: "none" },
    },
  },
  variants: {
    theme: {
      ag1: {
        background: `linear-gradient(180deg, ${AG1_CELL_TOP}, ${AG1_CELL_BOTTOM})`,
        color: AG1_TEXT,
      },
      sprinkle: {
        background: `linear-gradient(180deg, ${SPRINKLE_CELL_TOP}, ${SPRINKLE_CELL_BOTTOM})`,
        color: SPRINKLE_TEXT,
        border: "2px solid rgba(255,255,255,0.6)",
      },
    },
    tone: {
      default: {},
      gold: {},
    },
  },
  compoundVariants: [
    {
      variants: { theme: "ag1", tone: "gold" },
      style: {
        background: `linear-gradient(180deg, #FFE07A, ${AG1_GOLD})`,
        color: "#0a1140",
        border: "none",
      },
    },
    {
      variants: { theme: "sprinkle", tone: "gold" },
      style: {
        background: `linear-gradient(180deg, #FFD3E4, ${SPRINKLE_GOLD})`,
        color: "#FFFFFF",
        border: "none",
      },
    },
  ],
  defaultVariants: { theme: "ag1", tone: "default" },
});

export const judgeButton = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: vars.space[2],
    padding: `${vars.space[3]} ${vars.space[5]}`,
    borderRadius: vars.radius.md,
    fontFamily: vars.font.display,
    fontWeight: 800,
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    transition: "transform 120ms ease, box-shadow 120ms ease",
    selectors: {
      "&:hover": { transform: "translateY(-1px)" },
    },
  },
  variants: {
    tone: {
      correct: { background: "#2FB86E", color: "#04170c" },
      incorrect: { background: "#E5484D", color: "#2a0505" },
      neutral: { background: "transparent" },
    },
    theme: {
      ag1: {},
      sprinkle: {},
    },
  },
  compoundVariants: [
    {
      variants: { theme: "ag1", tone: "neutral" },
      style: { color: AG1_TEXT, border: "2px solid rgba(255,255,255,0.2)" },
    },
    {
      variants: { theme: "sprinkle", tone: "neutral" },
      style: {
        color: SPRINKLE_TEXT,
        border: `2px solid ${SPRINKLE_HEADER_BOTTOM}55`,
      },
    },
  ],
  defaultVariants: { theme: "ag1", tone: "neutral" },
});

/* ========== Shared panel/card + input, used on setup/rules/end-game ========== */

export const pageBg = recipe({
  base: {
    minHeight: "100svh",
    display: "grid",
    placeItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  variants: {
    theme: {
      ag1: {
        color: AG1_TEXT,
        background: `radial-gradient(1200px 700px at 50% -10%, ${AG1_HEADER_TOP}, ${AG1_FRAME} 70%)`,
      },
      sprinkle: {
        color: SPRINKLE_TEXT,
        background: `radial-gradient(1200px 700px at 50% -10%, #FFE3ED, ${SPRINKLE_FRAME} 70%)`,
      },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const panel = recipe({
  base: {
    position: "relative",
    borderRadius: "20px",
    padding: vars.space[6],
    zIndex: 1,
  },
  variants: {
    theme: {
      ag1: {
        background: `linear-gradient(180deg, ${AG1_HEADER_TOP}, ${AG1_CELL_BOTTOM})`,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        color: AG1_TEXT,
      },
      sprinkle: {
        background: `linear-gradient(180deg, #FFFFFF, ${SPRINKLE_CELL_TOP})`,
        border: `1px solid ${SPRINKLE_HEADER_BOTTOM}33`,
        boxShadow: "0 20px 60px rgba(233,140,176,0.3)",
        color: SPRINKLE_TEXT,
      },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const panelInset = recipe({
  base: {
    borderRadius: "14px",
    padding: vars.space[4],
  },
  variants: {
    theme: {
      ag1: {
        background: "rgba(2,4,15,0.45)",
        border: "1px solid rgba(255,255,255,0.08)",
      },
      sprinkle: {
        background: "rgba(255,255,255,0.55)",
        border: `1px solid ${SPRINKLE_HEADER_BOTTOM}33`,
      },
    },
  },
  defaultVariants: { theme: "ag1" },
});

export const inputField = recipe({
  base: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    outline: "none",
    fontFamily: vars.font.body,
  },
  variants: {
    theme: {
      ag1: {
        border: "1px solid rgba(255,255,255,0.15)",
        background: AG1_FRAME,
        color: AG1_TEXT,
      },
      sprinkle: {
        border: `1px solid ${SPRINKLE_HEADER_BOTTOM}55`,
        background: "#FFFFFF",
        color: SPRINKLE_TEXT,
      },
    },
  },
  defaultVariants: { theme: "ag1" },
});

/* ========== Board-theme picker (setup screen only) ========== */

export const themeOption = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "14px 10px",
    borderRadius: 14,
    cursor: "pointer",
    fontFamily: vars.font.display,
    fontWeight: 700,
    fontSize: "0.85rem",
    border: "2px solid transparent",
    transition: "transform 120ms ease, border-color 120ms ease",
    selectors: {
      "&:hover": { transform: "translateY(-1px)" },
    },
  },
  variants: {
    selected: {
      true: {},
      false: { opacity: 0.7 },
    },
  },
  defaultVariants: { selected: false },
});
