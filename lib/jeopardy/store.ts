// lib/jeopardy/store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Board, BoardTheme, ClueRef, Team } from "./types";
import { syncStoreAcrossTabs } from "@/lib/shared/crossTabSync";

interface JeopardyStore {
  board: Board | null;
  loadBoard: (board: Board) => void;

  // Which board is picked on the setup screen, before a board is loaded.
  selectedTheme: BoardTheme;
  setSelectedTheme: (theme: BoardTheme) => void;

  teams: [Team, Team];
  setTeamName: (idx: 0 | 1, name: string) => void;

  activeTeam: 0 | 1 | null;
  setActiveTeam: (idx: 0 | 1 | null) => void;

  // Whoever answers a clue correctly picks the next one — shown on the
  // board so the host knows who to call on before opening a tile.
  pickerTeam: 0 | 1 | null;
  setPickerTeam: (idx: 0 | 1 | null) => void;

  activeClue: ClueRef | null;
  // Whether the correct answer has been revealed for the open clue — kept
  // hidden until the host/player clicks "Reveal Answer", so a single shared
  // board can be used without spoiling the answer the instant a clue opens.
  answerRevealed: boolean;
  openClue: (categoryIndex: number, clueIndex: number) => void;
  revealAnswer: () => void;
  closeClue: () => void;
  resolveClue: (outcome: "correct" | "incorrect" | "skip") => void;

  resetAll: () => void;
}

const defaultTeams: [Team, Team] = [
  { name: "Team A", score: 0 },
  { name: "Team B", score: 0 },
];

export const useJeopardyStore = create<JeopardyStore>()(
  persist(
    (set, get) => ({
      board: null,
      loadBoard: (board) => set({ board, activeClue: null, pickerTeam: 0 }),

      selectedTheme: "ag1",
      setSelectedTheme: (theme) => set({ selectedTheme: theme }),

      teams: defaultTeams,
      setTeamName: (idx, name) =>
        set((s) => {
          const teams = [...s.teams] as [Team, Team];
          teams[idx] = { ...teams[idx], name };
          return { teams };
        }),

      activeTeam: null,
      setActiveTeam: (idx) => set({ activeTeam: idx }),

      pickerTeam: 0,
      setPickerTeam: (idx) => set({ pickerTeam: idx }),

      activeClue: null,
      answerRevealed: false,
      openClue: (categoryIndex, clueIndex) =>
        set({
          activeClue: { categoryIndex, clueIndex },
          answerRevealed: false,
          // Buzzing in is per-clue — never carry the last winner forward.
          activeTeam: null,
        }),
      revealAnswer: () => set({ answerRevealed: true }),
      closeClue: () => set({ activeClue: null, answerRevealed: false }),

      resolveClue: (outcome) => {
        const { board, activeClue, activeTeam, teams } = get();
        if (!board || !activeClue) return;

        const { categoryIndex, clueIndex } = activeClue;
        const category = board.categories[categoryIndex];
        const clue = category?.clues[clueIndex];
        if (!category || !clue) return;

        const updatedCategories = [...board.categories];
        const updatedClues = [...category.clues];
        updatedClues[clueIndex] = { ...clue, revealed: true, answered: true };
        updatedCategories[categoryIndex] = {
          ...category,
          clues: updatedClues,
        };

        let updatedTeams = teams;
        if (activeTeam !== null && outcome !== "skip") {
          const delta = outcome === "correct" ? clue.value : -clue.value;
          const nextTeams = [...teams] as [Team, Team];
          nextTeams[activeTeam] = {
            ...nextTeams[activeTeam],
            score: nextTeams[activeTeam].score + delta,
          };
          updatedTeams = nextTeams;
        }

        // A correct answer hands clue-picking privilege to that team; a
        // miss or skip leaves it with whoever already had it.
        const nextPicker =
          outcome === "correct" && activeTeam !== null
            ? activeTeam
            : get().pickerTeam;

        set({
          board: { ...board, categories: updatedCategories },
          teams: updatedTeams,
          activeClue: null,
          answerRevealed: false,
          activeTeam: null,
          pickerTeam: nextPicker,
        });
      },

      resetAll: () =>
        set({
          board: null,
          teams: defaultTeams,
          activeTeam: null,
          pickerTeam: 0,
          activeClue: null,
          answerRevealed: false,
        }),
    }),
    {
      name: "jeopardy-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

syncStoreAcrossTabs<JeopardyStore>(
  "jeopardy-state",
  useJeopardyStore.setState
);

/** True once every clue on the board has been resolved. */
export function isBoardComplete(board: Board | null): boolean {
  if (!board) return false;
  return board.categories.every((c) => c.clues.every((clue) => clue.answered));
}
