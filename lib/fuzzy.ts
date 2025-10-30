// lib/fuzzy.ts
function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Standard Levenshtein distance similarity
function levenshtein(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  if (m === 0 && n === 0) return 1;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const maxLen = Math.max(m, n);
  return 1 - dp[m][n] / maxLen; // value 0–1
}

// Word overlap bonus: shared keywords / total unique words
function wordOverlap(a: string, b: string) {
  const aWords = new Set(a.split(" "));
  const bWords = new Set(b.split(" "));
  let overlap = 0;
  aWords.forEach((w) => {
    if (bWords.has(w)) overlap++;
  });
  const total = new Set([...aWords, ...bWords]).size;
  return total === 0 ? 0 : overlap / total;
}

export function bestMatch(input: string, candidates: string[]) {
  const normInput = normalize(input);
  let bestIdx = -1;
  let bestScore = 0;

  candidates.forEach((c, i) => {
    const normC = normalize(c);

    // Base similarity from edit distance
    const lev = levenshtein(normInput, normC);

    // Add semantic overlap bonus
    const overlap = wordOverlap(normInput, normC);

    // Weighted combo (tune weights)
    const score = lev * 0.6 + overlap * 0.4;

    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  });

  return { index: bestIdx, score: bestScore };
}
