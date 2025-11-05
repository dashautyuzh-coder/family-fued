// lib/store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Question, Team } from "./types";
import { ROSTER, type Name } from "./roster";

interface GameStore {
  // Questions / board state
  questions: Question[];
  currentIndex: number;
  current: Question | null;

  // Teams (names/scores shown on UI)
  teams: [Team, Team];

  // Core actions
  loadQuestions: (q: Question[]) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  toggleReveal: (index: number) => void;
  resetReveals: () => void;

  // Team actions
  setTeamName: (idx: 0 | 1, name: string) => void;
  setScore: (idx: 0 | 1, score: number) => void;
  resetScoresAndStrikes: () => void;

  // Strikes
  strikes: number;
  addStrike: () => void;
  clearStrikes: () => void;

  // Active team
  activeTeam: 0 | 1 | null;
  setActiveTeam: (idx: 0 | 1) => void;
  addPointsToActiveTeam: (points: number) => void;
  addPointsToTeam: (teamIdx: 0 | 1, points: number) => void;

  // Faceoff state
  faceoffDone: boolean;
  faceoffWinner: 0 | 1 | null;
  setFaceoffWinner: (team: 0 | 1 | null) => void;
  resetFaceoff: () => void;

  // Faceoff question
  faceoffQuestion: Question | null;
  setFaceoffQuestion: (q: Question | null) => void;

  // Rounds
  currentRound: number;
  setRound: (currentRound: number) => void;

  // Score deltas per round
  roundBaselineScores: [number, number];
  setRoundBaseline: () => void;
  getRoundDeltas: () => [number, number];

  // 🔹 Team generator state
  teamSize: number; // default 5
  teamMembers: [Name[], Name[]]; // members assigned for this round
  playerAppearances: Record<Name, number>; // appearances per player
  teamsGeneratedForRound: number | null; // which round teamMembers correspond to

  // 🔹 Team generator actions
  generateTeamsForCurrentRound: () => void;
  setTeamSize: (n: number) => void;
  resetTeamAssignments: () => void;

  // Reset all
  resetAll: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // ── Board state ───────────────────────────────────────────────
      questions: [],
      currentIndex: 0,
      current: null,

      // Default teams shown on UI (names/scores)
      teams: [
        { name: "Ctrl+Alt+Defeat", score: 0, strikes: 0 },
        { name: "Lettuce Win", score: 0, strikes: 0 },
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

      // ── Team actions (names/scores) ───────────────────────────────
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

      // ── Strikes ──────────────────────────────────────────────────
      strikes: 0,
      addStrike: () => set((s) => ({ strikes: Math.min(s.strikes + 1, 3) })),
      clearStrikes: () => set({ strikes: 0 }),

      // ── Active team ───────────────────────────────────────────────
      activeTeam: null,
      setActiveTeam: (idx) => set({ activeTeam: idx }),

      addPointsToTeam: (teamIdx, points) => {
        const { teams } = get();
        const updated = [...teams] as [Team, Team];
        updated[teamIdx] = {
          ...updated[teamIdx],
          score: updated[teamIdx].score + Math.max(0, points),
        };
        set({ teams: updated });
      },

      addPointsToActiveTeam: (points) => {
        const { activeTeam } = get();
        if (activeTeam === null) return;
        get().addPointsToTeam(activeTeam, points);
      },

      // ── Faceoff state ─────────────────────────────────────────────
      faceoffDone: false,
      faceoffWinner: null,
      setFaceoffWinner: (team) =>
        set({ faceoffWinner: team, faceoffDone: true, activeTeam: team }),

      resetFaceoff: () =>
        set({ faceoffDone: false, faceoffWinner: null, activeTeam: null }),

      // ── Faceoff question ──────────────────────────────────────────
      faceoffQuestion: null,
      setFaceoffQuestion: (q) => set({ faceoffQuestion: q }),

      // ── Rounds & deltas ───────────────────────────────────────────
      currentRound: 1,
      setRound: (r) => set({ currentRound: r }),

      roundBaselineScores: [0, 0],
      setRoundBaseline: () => {
        const { teams } = get();
        set({ roundBaselineScores: [teams[0].score, teams[1].score] });
      },
      getRoundDeltas: () => {
        const { teams, roundBaselineScores } = get();
        return [
          Math.max(0, teams[0].score - (roundBaselineScores?.[0] ?? 0)),
          Math.max(0, teams[1].score - (roundBaselineScores?.[1] ?? 0)),
        ];
      },

      // ── Team generator state ───────────────────────────────────────
      teamSize: 5,
      teamMembers: [[], []],
      playerAppearances: Object.fromEntries(
        ROSTER.map((n) => [n, 0])
      ) as Record<Name, number>,
      teamsGeneratedForRound: null,

      setTeamSize: (n) => set({ teamSize: Math.max(1, Math.floor(n)) }),

      resetTeamAssignments: () =>
        set({
          teamMembers: [[], []],
          playerAppearances: Object.fromEntries(
            ROSTER.map((n) => [n, 0])
          ) as Record<Name, number>,
          teamsGeneratedForRound: null,
        }),

      generateTeamsForCurrentRound: () => {
        const {
          currentRound,
          teamSize,
          playerAppearances,
          teamsGeneratedForRound,
        } = get();
        const need = teamSize * 2;

        // avoid regenerating for same round
        if (teamsGeneratedForRound === currentRound) return;

        const neverPlayed = ROSTER.filter((n) => playerAppearances[n] === 0);
        const alreadyPlayed = ROSTER.filter(
          (n) => playerAppearances[n] > 0
        ).sort((a, b) => playerAppearances[a] - playerAppearances[b]); // fewest first

        const shuffle = <T>(arr: T[]) => {
          const a = [...arr];
          for (let i = a.length - 1; i > 0; i--) {
            const buf = new Uint32Array(1);
            crypto.getRandomValues(buf);
            const j = Number(buf[0] % (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
          }
          return a;
        };

        const selection: Name[] = [];
        if (neverPlayed.length >= need) {
          selection.push(...shuffle(neverPlayed).slice(0, need));
        } else {
          // take all never-played first
          selection.push(...shuffle(neverPlayed));
          let remaining = need - selection.length;

          // fill with lowest-appearance tiers (only when we must)
          const byTier: Record<number, Name[]> = {};
          for (const n of alreadyPlayed) {
            const a = playerAppearances[n];
            (byTier[a] ||= []).push(n);
          }
          const tiers = Object.keys(byTier)
            .map(Number)
            .sort((a, b) => a - b);

          for (const t of tiers) {
            if (remaining <= 0) break;
            const tier = shuffle(byTier[t]).filter(
              (n) => !selection.includes(n)
            );
            for (const n of tier) {
              if (remaining <= 0) break;
              selection.push(n);
              remaining--;
            }
          }

          // if still short (tiny roster vs large team size), wrap
          if (remaining > 0) {
            const wrapPool = shuffle(
              ROSTER.filter((n) => !selection.includes(n))
            );
            for (const n of wrapPool) {
              if (remaining <= 0) break;
              selection.push(n);
              remaining--;
            }
          }
        }

        // split into A/B and hard-cap team size
        const half = Math.ceil(selection.length / 2);
        const teamA = selection.slice(0, half) as Name[];
        const teamB = selection.slice(half, half + teamSize) as Name[];
        const teamA2 = teamA.slice(0, teamSize);
        const teamB2 = teamB.slice(0, teamSize);

        // bump appearances
        const nextAppearances = { ...playerAppearances };
        for (const n of [...teamA2, ...teamB2]) {
          nextAppearances[n] = (nextAppearances[n] ?? 0) + 1;
        }

        set({
          teamMembers: [teamA2, teamB2],
          playerAppearances: nextAppearances,
          teamsGeneratedForRound: currentRound,
        });
      },

      // ── Reset all ─────────────────────────────────────────────────
      resetAll: () => {
        set({
          questions: [],
          roundBaselineScores: [0, 0],
          currentIndex: 0,
          current: null,
          strikes: 0,
          activeTeam: null,
          faceoffDone: false,
          faceoffWinner: null,
          faceoffQuestion: null,
          currentRound: 1,
          teams: [
            { name: "Ctrl+Alt+Defeat", score: 0, strikes: 0 },
            { name: "Lettuce Win", score: 0, strikes: 0 },
          ],

          // generator bits reset too
          teamSize: 5,
          teamMembers: [[], []],
          playerAppearances: Object.fromEntries(
            ROSTER.map((n) => [n, 0])
          ) as Record<Name, number>,
          teamsGeneratedForRound: null,
        });
      },
    }),
    {
      name: "feud-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "feud-state" && event.newValue) {
      const newState = JSON.parse(event.newValue).state;
      useGameStore.setState(newState);
    }
  });
}
