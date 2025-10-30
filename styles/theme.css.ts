// styles/theme.css.ts
import {
  createGlobalTheme,
  createTheme,
  createThemeContract,
  globalStyle,
} from "@vanilla-extract/css";

// Design tokens contract (typed keys used across themes)
export const vars = createThemeContract({
  color: {
    bg: null,
    surface: null,
    panel: null,
    border: null,
    text: null,
    muted: null,

    brand: null, // AG1 primary green
    brandSoft: null,
    accent: null, // secondary accent for highlights
    positive: null,
    negative: null,
    warning: null,
    gold: null, // “feud board” points highlight
    flavorGreen: null,
    flavorPink: null,
    flavorBrown: null,
    flavorGold: null,
  },
  space: {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    8: null,
    10: null,
    12: null,
  },
  radius: { sm: null, md: null, lg: null, xl: null },
  shadow: { sm: null, md: null, lg: null },
  font: { body: null, display: null, mono: null },
});

// Global (non-theme) defaults for spacing, radius, fonts, shadows
createGlobalTheme(":root", {
  [vars.space as any]: {
    0: "0",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
  },
  [vars.radius as any]: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
  },
  [vars.shadow as any]: {
    sm: "0 2px 10px rgba(0,0,0,.18)",
    md: "0 6px 24px rgba(0,0,0,.24)",
    lg: "0 10px 40px rgba(0,0,0,.28)",
  },
  [vars.font as any]: {
    body: "var(--font-inter)",
    display: "var(--font-poppins)",
    mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
});

// -------------------------------
// Themes
// AG1-inspired Family Feud Dark
// -------------------------------
export const ag1DarkTheme = createTheme(vars, {
  color: {
    bg: "#0b1020",
    surface: "#0f152e",
    panel: "#023D3D",
    border: "#edebe5",
    text: "#E9F2ED",
    muted: "#A9BAC6",
    brand: "#2BB673",
    brandSoft: "#20A064",
    accent: "#7DD3FC",
    positive: "#10B981",
    negative: "#EF4444",
    warning: "#F59E0B",
    gold: "#F7C948",
    flavorGreen: "#77C19A",
    flavorPink: "#E5657E",
    flavorBrown:
      "conic-gradient(from 87deg at 50% 150%, #AA8263 11deg, #5C4E63 87deg, #60D998 203deg, #E5657E 283deg, #AA8263 371deg)",
    flavorGold:
      "conic-gradient(from 87deg at 50% 150%, #FFE800 11deg, #FFA400 87deg, #FFE800 203deg, #FFA400 283deg, #F101B7 371deg)",
  },
  space: {
    0: "0",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
  },
  radius: {
    sm: "10px",
    md: "14px",
    lg: "18px",
    xl: "24px",
  },
  shadow: {
    sm: "0 2px 12px rgba(0,0,0,.18)",
    md: "0 10px 30px rgba(0,0,0,.28)",
    lg: "0 18px 60px rgba(0,0,0,.35)",
  },
  font: {
    body: "var(--font-inter)",
    display: "var(--font-poppins)",
    mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
});

// Optional light theme if you ever want to switch
export const ag1LightTheme = createTheme(vars, {
  color: {
    bg: "#F7FAF9",
    surface: "#FFFFFF",
    panel: "#F2F6F9",
    border: "#D5E2EA",
    text: "#0E1B12",
    muted: "#4E6A57",

    brand: "#1E8E57",
    brandSoft: "#CDEDDD",
    accent: "#2563EB",
    positive: "#0F766E",
    negative: "#B91C1C",
    warning: "#B45309",
    gold: "#B08400",
    flavorGreen: "#77C19A",
    flavorPink: "#E5657E",
    flavorBrown:
      "conic-gradient(from 87deg at 50% 150%, #AA8263 11deg, #5C4E63 87deg, #60D998 203deg, #E5657E 283deg, #AA8263 371deg)",
    flavorGold:
      "conic-gradient(from 87deg at 50% 150%, #FFE800 11deg, #FFA400 87deg, #FFE800 203deg, #FFA400 283deg, #F101B7 371deg)",
  },
  space: {
    0: "0",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
  },
  radius: {
    sm: "10px",
    md: "14px",
    lg: "18px",
    xl: "24px",
  },
  shadow: {
    sm: "0 2px 12px rgba(0,0,0,.18)",
    md: "0 10px 30px rgba(0,0,0,.28)",
    lg: "0 18px 60px rgba(0,0,0,.35)",
  },
  font: {
    body: "var(--font-inter)",
    display: "var(--font-poppins)",
    mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
});

// Global element resets tied to the *applied* theme class
globalStyle(`.${ag1DarkTheme}, .${ag1LightTheme}`, {
  minHeight: "100dvh",
  color: vars.color.text,
  background: `radial-gradient(1200px 420px at 50% -220px, #1b2a66, ${vars.color.bg} 60%)`,
  fontFamily: vars.font.body,
});

globalStyle("a", { color: "inherit", textDecoration: "none" });
globalStyle("*", { boxSizing: "border-box" });
globalStyle("button, input, select, textarea", { font: "inherit" });
