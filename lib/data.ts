import type { Question } from "./types";

/**
 * Server-side loader for questions.json
 * (use this in getStaticProps or React server components)
 */
// export async function getQuestions(): Promise<Question[]> {
//   const res = await import("/questions.json");
//   return res.default as Question[];
// }

/**
 * Client-side loader (fetch from /lib/questions.json)
 * use this inside a useEffect() in client components.
 */
export async function fetchQuestions(): Promise<Question[]> {
  const res = await fetch("/questions.json");
  if (!res.ok) throw new Error("Failed to load questions");
  return res.json();
}
