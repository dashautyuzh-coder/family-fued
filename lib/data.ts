// lib/data.ts
import type { Question } from "@/lib/types";

export async function fetchQuestions(): Promise<Question[]> {
  const res = await fetch("/questions.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load questions");
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
