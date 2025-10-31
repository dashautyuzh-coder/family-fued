// lib/data.ts
import type { Question, RoundFile } from "@/lib/types";

import round1 from "./data/round1.json";
import round2 from "./data/round2.json";
import round3 from "./data/round3.json";
import round4 from "./data/round4.json";

const rounds = [round1, round2, round3, round4] as RoundFile[];


export async function fetchQuestions(roundNum?: number) {
  // if roundNum is provided, return that round’s data
  if (roundNum && roundNum >= 1 && roundNum <= rounds.length) {
    const r = rounds[roundNum - 1];
    return {
      category: r.category ?? `Round ${roundNum}`,
      title: r.title ?? `Round ${roundNum}`,
      questions: r.questions.map((q, i) => ({
        ...q,
        index: i,
        category: r.category,
        answers: q.answers.map((a) => ({
          ...a,
          revealed: a.revealed ?? false,
          awarded: a.awarded ?? false,
        })),
      })),
    };
  }

  // fallback (old single-file format)
  const data = await import("./data/questions.json").then((m) => m.default);
  return {
    category: "Default",
    questions: data.map((q, i) => ({
      ...q,
      index: i,
      category: "Default",
    })),
  };
}

export async function fetchFaceoffQuestions(): Promise<Question[]> {
  const res = await fetch("/faceoff-questions.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load face-off questions");
  const data = (await res.json()) as Question[];
  return data.map((q) => ({
    ...q,
    answers: q.answers.map((a) => ({
      ...a,
      revealed: a.revealed ?? false,
      awarded: a.awarded ?? false,
    })),
  }));
}
