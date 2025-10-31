// lib/types.ts

/** An individual answer for a Family Feud question */
export interface Answer {
  /** The visible answer text shown when revealed */
  text: string;
  /** The point value assigned to this answer */
  points: number;
  /** Whether the answer has been revealed on the board */
  revealed: boolean;
  awarded: boolean;
}

/** A single Family Feud–style question */
export interface Question {
  /** Optional index or ordering number */
  index?: number;
  /** Optional unique ID */
  id?: string;
  /** The prompt shown to the players */
  prompt: string;
  /** All possible answers for this question */
  answers: Answer[];
  /** Optional category name shown during the round */
  category?: string;
  title?: string;
}

/** A full round of questions (from your JSON) */
export interface RoundData {
  /** Round title (e.g. “Round 1: Warm-Up Round”) */
  title: string;
  /** Round category (e.g. “Team Habits”) */
  category: string;
  /** The questions belonging to this round */
  questions: Question[];
}

export type RoundFile = {
  category?: string;
  title?: string;
  questions: Array<{
    id?: string | number;
    prompt: string;
    answers: Array<{
      text: string;
      points: number;
      // NOTE: round JSONs may omit the flags
      revealed?: boolean;
      awarded?: boolean;
    }>;
  }>;
};

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
