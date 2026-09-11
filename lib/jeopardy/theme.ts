// lib/jeopardy/theme.ts
//
// Plain (non-vanilla-extract) helper for theme-driven inline styles —
// kept out of board.css.ts because .css.ts files may only export
// serializable style values, not functions.
import * as b from "@/styles/jeopardy/board.css";
import type { BoardTheme } from "./types";

export function themeColors(theme: BoardTheme) {
  return theme === "sprinkle"
    ? { text: b.SPRINKLE_TEXT, muted: b.SPRINKLE_MUTED, accent: b.SPRINKLE_GOLD }
    : { text: b.AG1_TEXT, muted: b.AG1_MUTED, accent: b.AG1_GOLD };
}
