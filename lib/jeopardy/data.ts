// lib/jeopardy/data.ts
import type { Board, BoardFile, BoardTheme } from "./types";
import board1 from "./data/board1.json";
import board2 from "./data/board2.json";

const boards: Record<BoardTheme, BoardFile> = {
  ag1: board1 as BoardFile,
  sprinkle: board2 as BoardFile,
};

export async function fetchBoard(theme: BoardTheme = "ag1"): Promise<Board> {
  const b = boards[theme] ?? boards.ag1;
  return {
    title: b.title,
    theme: b.theme,
    categories: b.categories.map((c) => ({
      name: c.name,
      clues: c.clues.map((clue) => ({
        ...clue,
        revealed: false,
        answered: false,
      })),
    })),
  };
}
