// lib/jeopardy/types.ts

/** Which board is loaded — drives which visual skin renders. */
export type BoardTheme = "ag1" | "sprinkle";

/** A single clue on the board. */
export interface Clue {
  /** The clue shown to everyone once opened. */
  text: string;
  /** The correct response — shown to the host only. */
  response: string;
  /** Jeopardy-style question-form prefix for the response, e.g. "Who is" or "What is". */
  prefix: string;
  /** Dollar value awarded (or deducted) for this clue. */
  value: number;
  /** Whether this clue has been opened at least once. */
  revealed: boolean;
  /** Whether this clue has been fully resolved (correct/incorrect/skip). */
  answered: boolean;
}

/** A column on the board: a category name plus its five clues. */
export interface Category {
  name: string;
  clues: Clue[];
}

/** A full board (one game's worth of categories). */
export interface Board {
  title?: string;
  theme: BoardTheme;
  categories: Category[];
}

/** Raw JSON shape for a board data file, before revealed/answered flags are applied. */
export type BoardFile = {
  title?: string;
  theme: BoardTheme;
  categories: Array<{
    name: string;
    clues: Array<{
      text: string;
      response: string;
      prefix: string;
      value: number;
    }>;
  }>;
};

/** Team state used by both host and board views. */
export interface Team {
  name: string;
  score: number;
}

/** Points to a specific clue on the board. */
export interface ClueRef {
  categoryIndex: number;
  clueIndex: number;
}
