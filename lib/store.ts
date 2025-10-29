// lib/store.ts (additions marked ✅)
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Question, Team } from "./types";

interface GameStore {
  questions: Question[];
  currentIndex: number;
  current: Question | null;

  // ✅ teams state
  teams: [Team, Team];

  loadQuestions: (q: Question[]) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  toggleReveal: (index: number) => void;
  resetReveals: () => void;

  // ✅ team actions
  setTeamName: (idx: 0 | 1, name: string) => void;
  setScore: (idx: 0 | 1, score: number) => void;
  resetScoresAndStrikes: () => void;

  // existing strikes controls
  strikes: number;
  addStrike: () => void;
  clearStrikes: () => void;
  activeTeam: 0 | 1 | null;
  setActiveTeam: (idx: 0 | 1) => void;
  addPointsToActiveTeam: (points: number) => void;

  faceoffDone: boolean;
  faceoffWinner: 0 | 1 | null;
  setFaceoffWinner: (team: 0 | 1) => void;
  resetFaceoff: () => void;

  faceoffQuestion: Question | null;
  setFaceoffQuestion: (q: Question | null) => void;
  faceoffUsed: boolean;
  setFaceoffUsed: (used: boolean) => void;
  resetAll: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      questions: [],
      currentIndex: 0,
      current: null,

      // ✅ init teams
      teams: [
        { name: "Team A", score: 0, strikes: 0 },
        { name: "Team B", score: 0, strikes: 0 },
      ],

      loadQuestions: (q) =>
        set({ questions: q, currentIndex: 0, current: q[0] }),

      nextQuestion: () => {
        const { questions, currentIndex } = get();
        const next = Math.min(currentIndex + 1, questions.length - 1);
        set({ currentIndex: next, current: questions[next] });
      },

      prevQuestion: () => {
        const { questions, currentIndex } = get();
        const prev = Math.max(currentIndex - 1, 0);
        set({ currentIndex: prev, current: questions[prev] });
      },

      toggleReveal: (index) => {
        const { current, questions, currentIndex } = get();
        if (!current) return;

        const updatedCurrent = {
          ...current,
          answers: current.answers.map((a, i) =>
            i === index ? { ...a, revealed: !a.revealed } : a
          ),
        };

        const updatedQuestions = [...questions];
        updatedQuestions[currentIndex] = updatedCurrent;

        set({ current: updatedCurrent, questions: updatedQuestions });
      },

      resetReveals: () => {
        const { current, questions, currentIndex } = get();
        if (!current) return;
        const resetCurrent = {
          ...current,
          answers: current.answers.map((a) => ({ ...a, revealed: false })),
        };
        const updatedQuestions = [...questions];
        updatedQuestions[currentIndex] = resetCurrent;
        set({ current: resetCurrent, questions: updatedQuestions });
      },

      // ✅ team actions
      setTeamName: (idx, name) =>
        set((s) => {
          const teams = [...s.teams] as [Team, Team];
          teams[idx] = { ...teams[idx], name };
          return { teams };
        }),

      setScore: (idx, score) =>
        set((s) => {
          const teams = [...s.teams] as [Team, Team];
          teams[idx] = { ...teams[idx], score: Math.max(0, Math.floor(score)) };
          return { teams };
        }),

      resetScoresAndStrikes: () =>
        set((s) => ({
          teams: s.teams.map((t) => ({ ...t, score: 0, strikes: 0 })) as [
            Team,
            Team
          ],
          strikes: 0,
        })),

      // existing strikes
      strikes: 0,
      addStrike: () => set((s) => ({ strikes: Math.min(s.strikes + 1, 3) })),
      clearStrikes: () => set({ strikes: 0 }),

      activeTeam: null,

      setActiveTeam: (idx) => set({ activeTeam: idx }),

      addPointsToActiveTeam: (points) => {
        const { teams, activeTeam } = get();
        if (activeTeam === null) return;
        const updated = [...teams] as [Team, Team];
        updated[activeTeam] = {
          ...updated[activeTeam],
          score: updated[activeTeam].score + points,
        };
        set({ teams: updated });
      },

      faceoffDone: false,
      faceoffWinner: null,

      setFaceoffWinner: (team) =>
        set({ faceoffWinner: team, faceoffDone: true, activeTeam: team }),

      resetFaceoff: () =>
        set({ faceoffDone: false, faceoffWinner: null, activeTeam: null }),

      faceoffQuestion: null,
      setFaceoffQuestion: (q) => set({ faceoffQuestion: q }),
      faceoffUsed: false,
      setFaceoffUsed: (used) => set({ faceoffUsed: used }),

      resetAll: () => {
        set({
          questions: [],
          currentIndex: 0,
          current: null,
          strikes: 0,
          activeTeam: null,
          faceoffDone: false,
          faceoffWinner: null,
          faceoffQuestion: null,
          faceoffUsed: false,
          teams: [
            { name: "Team A", score: 0, strikes: 0 },
            { name: "Team B", score: 0, strikes: 0 },
          ],
        });
      },
    }),
    {
      name: "feud-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// cross-tab sync (keep this)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "feud-state" && event.newValue) {
      const newState = JSON.parse(event.newValue).state;
      useGameStore.setState(newState);
    }
  });
}
