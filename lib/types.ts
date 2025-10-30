// lib/types.ts

/** An individual answer for a Family Feud question */
export interface Answer {
  /** The visible answer text shown when revealed */
  text: string;
  /** The point value assigned to this answer */
  points: number;
  /** Whether the answer has been revealed on the board */
  revealed?: boolean;
  awarded?: boolean;
}

/** A single Family Feud–style question */
export interface Question {
  /** A unique ID string (e.g. "q1") */
  id: string;
  /** The question prompt shown to the players */
  prompt: string;
  /** The list of possible answers (max 8 typical) */
  answers: Answer[];
}

/** Team state used by both host and game views */
export interface Team {
  name: string;
  score: number;
  strikes: number;
}

/** Root game state shape (used if you set up Zustand or context) */
export interface GameState {
  teams: [Team, Team];
  roundIndex: number;
  roundMultiplier: number;
  questions: Question[];
  currentQuestion: Question | null;
  isFastMoney: boolean;
}
