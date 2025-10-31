"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { fetchQuestions, fetchFaceoffQuestions } from "@/lib/data";
import type { Question } from "@/lib/types";
import * as a from "@/styles/atoms.css";

// Update if you add more rounds
const ROUND_NUMBERS = [1, 2, 3, 4];

type RoundBlock = {
  kind: "round";
  round: number;
  title?: string;
  category?: string;
  questions: Question[];
};

type FaceoffBlock = {
  kind: "faceoff";
  title?: string;
  questions: Question[];
};

type Block = RoundBlock | FaceoffBlock;

export default function AllQuestionsByRoundPage() {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [includeFaceoff, setIncludeFaceoff] = useState(true);

  // Per-round filters (apply to what you see inside a round)
  const [q, setQ] = useState("");
  const [onlyWithNAnswers, setOnlyWithNAnswers] = useState<number | 0>(0);

  // Round pagination index (which block is visible)
  const [pageIdx, setPageIdx] = useState(0);

  // ── Load rounds + faceoff ───────────────────────────────────────────────────
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const roundBlocks: RoundBlock[] = await Promise.all(
          ROUND_NUMBERS.map(async (n) => {
            const r = await fetchQuestions(n);
            return {
              kind: "round" as const,
              round: n,
              title: r.title,
              category: r.category,
              questions: r.questions as Question[],
            };
          })
        );
        const faceoffQs = await fetchFaceoffQuestions();
        const faceoff: FaceoffBlock = {
          kind: "faceoff",
          title: "Face-Off",
          questions: faceoffQs,
        };
        if (!ignore) setBlocks([...roundBlocks, faceoff]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // ── Visible block list (include/exclude faceoff) ─────────────────────────────
  const visibleBlocks = useMemo(() => {
    return blocks.filter((b) => (b.kind === "faceoff" ? includeFaceoff : true));
  }, [blocks, includeFaceoff]);

  // Keep pageIdx valid when filters or list change
  useEffect(() => {
    setPageIdx((i) =>
      Math.min(Math.max(i, 0), Math.max(0, visibleBlocks.length - 1))
    );
  }, [visibleBlocks.length]);

  // Current block (the “page”)
  const block = visibleBlocks[pageIdx];

  // ── Apply in-round filtering/search (only affects current page’s list) ──────
  const filteredQuestions = useMemo(() => {
    if (!block) return [];
    const query = q.trim().toLowerCase();
    return block.questions.filter((question) => {
      const textMatch =
        query.length === 0 ||
        question.prompt.toLowerCase().includes(query) ||
        question.answers.some((a) => a.text.toLowerCase().includes(query));
      const lenMatch =
        onlyWithNAnswers === 0 ||
        question.answers.length === Number(onlyWithNAnswers);
      return textMatch && lenMatch;
    });
  }, [block, q, onlyWithNAnswers]);

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const goPrevRound = useCallback(
    () => setPageIdx((i) => Math.max(i - 1, 0)),
    []
  );
  const goNextRound = useCallback(
    () =>
      setPageIdx((i) => Math.min(i + 1, Math.max(0, visibleBlocks.length - 1))),
    [visibleBlocks.length]
  );
  const goFirstRound = useCallback(() => setPageIdx(0), []);
  const goLastRound = useCallback(
    () => setPageIdx(Math.max(0, visibleBlocks.length - 1)),
    [visibleBlocks.length]
  );

  // Keyboard: ←/→ navigate between rounds
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNextRound();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrevRound();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNextRound, goPrevRound]);

  // ── Export/Copy (current round or all rounds) ───────────────────────────────
  const exportCSV = (scope: "current" | "all") => {
    const rows: string[] = [];
    rows.push(
      [
        "Type",
        "Round",
        "Title",
        "Category",
        "Q#",
        "Prompt",
        "Answer#",
        "Answer",
        "Points",
      ]
        .map(csvEscape)
        .join(",")
    );

    const emitBlock = (b: Block, qs: Question[]) => {
      if (b.kind === "round") {
        qs.forEach((q, qi) =>
          q.answers.forEach((a, ai) =>
            rows.push(
              [
                "Round",
                b.round,
                b.title ?? "",
                b.category ?? "",
                qi + 1,
                q.prompt,
                ai + 1,
                a.text,
                a.points,
              ]
                .map(csvEscape)
                .join(",")
            )
          )
        );
      } else {
        qs.forEach((q, qi) =>
          q.answers.forEach((a, ai) =>
            rows.push(
              [
                "FaceOff",
                "",
                "Face-Off",
                "Face-Off",
                qi + 1,
                q.prompt,
                ai + 1,
                a.text,
                a.points,
              ]
                .map(csvEscape)
                .join(",")
            )
          )
        );
      }
    };

    if (scope === "current" && block) {
      emitBlock(block, filteredQuestions);
    } else {
      visibleBlocks.forEach((b) => {
        // Use per-block local filter for consistency with UI? Keep unfiltered for “all”.
        emitBlock(b, b.questions);
      });
    }

    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement("a");
    aEl.href = url;
    aEl.download =
      scope === "current"
        ? `ag1-questions-round-${pageIdx + 1}.csv`
        : "ag1-questions-all-rounds.csv";
    document.body.appendChild(aEl);
    aEl.click();
    aEl.remove();
    URL.revokeObjectURL(url);
  };

  const copyPlain = async (scope: "current" | "all") => {
    const lines: string[] = [];
    const work = scope === "current" && block ? [block] : visibleBlocks;

    work.forEach((b) => {
      if (b.kind === "round") {
        lines.push(`Round ${b.round}: ${b.title ?? b.category ?? ""}`.trim());
      } else {
        lines.push("Face-Off");
      }

      const qs =
        scope === "current" && block === b ? filteredQuestions : b.questions;

      qs.forEach((q, i) => {
        lines.push(`  Q${i + 1}. ${q.prompt}`);
        q.answers.forEach((a, j) => {
          lines.push(`    ${j + 1}) ${a.text} — ${a.points}`);
        });
      });
      lines.push("");
    });

    await navigator.clipboard.writeText(lines.join("\n"));
  };

  // ── UI ───────────────────────────────────────────────────────────────────────
  return (
    <main
      className={a.container}
      style={{
        minHeight: "100svh",
        color: "white",
        position: "relative",
        paddingBottom: 72,
      }}
    >
      {/* Header */}
      <header style={{ display: "grid", gap: 6 }}>
        <h1 className={a.h1} style={{ marginBottom: 0 }}>
          All Questions (By Round)
        </h1>
        <p className={a.muted} style={{ marginTop: 0 }}>
          {loading
            ? "Loading…"
            : `${visibleBlocks.length} page${
                visibleBlocks.length === 1 ? "" : "s"
              } • Use ← / → to switch rounds`}
        </p>

        {/* Global controls */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              color: "#A7B8C8",
            }}
          >
            <input
              type="checkbox"
              checked={includeFaceoff}
              onChange={(e) => setIncludeFaceoff(e.target.checked)}
            />
            Include Face-Off as a page
          </label>

          <button
            onClick={() => exportCSV("all")}
            className={a.button({ variant: "secondary" })}
          >
            ⬇️ Export ALL CSV
          </button>
          <button
            onClick={() => copyPlain("all")}
            className={a.button({ variant: "ghost" })}
          >
            📋 Copy ALL
          </button>
          <button
            onClick={() => window.print()}
            className={a.button({ variant: "ghost" })}
          >
            🖨️ Print
          </button>
        </div>
      </header>

      {/* Current page: block header + per-block filters + list */}
      <section style={{ marginTop: 16 }}>
        {loading && (
          <div className={a.card()} aria-busy>
            Loading…
          </div>
        )}

        {!loading && !block && (
          <div className={a.card()} style={{ color: "#A7B8C8" }}>
            No pages to display. (Try enabling Face-Off or check data.)
          </div>
        )}

        {!loading && block && (
          <motion.div
            key={
              (block.kind === "round" ? `round-${block.round}` : "faceoff") +
              `-page`
            }
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={a.card({
              tone: block.kind === "round" ? "accent" : "gold",
            })}
            style={{ overflow: "hidden" }}
          >
            {/* Block heading */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "baseline",
                marginBottom: 8,
              }}
            >
              <h2 style={{ margin: 0 }}>
                {block.kind === "round" ? `Round ${block.round}` : "Face-Off"}{" "}
                <span
                  style={{ color: "#A7B8C8", fontWeight: 400, fontSize: 14 }}
                >
                  {block.kind === "round"
                    ? block.title || block.category
                    : "All Face-Off Questions"}
                </span>
              </h2>
              <div style={{ color: "#A7B8C8", fontSize: 13 }}>
                Page {pageIdx + 1} of {visibleBlocks.length}
              </div>
            </div>

            {/* Per-page (round) controls */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search within this page…"
                style={inputStyle}
              />
              <select
                value={String(onlyWithNAnswers)}
                onChange={(e) => setOnlyWithNAnswers(Number(e.target.value))}
                style={selectStyle}
                title="Filter by number of answers"
              >
                <option value={0}>Any # of answers</option>
                <option value={4}>Exactly 4 answers</option>
                <option value={5}>Exactly 5 answers</option>
                <option value={6}>Exactly 6 answers</option>
                <option value={7}>Exactly 7 answers</option>
                <option value={8}>Exactly 8 answers</option>
              </select>

              <button
                onClick={() => exportCSV("current")}
                className={a.button({ variant: "secondary" })}
              >
                ⬇️ Export CSV (Page)
              </button>
              <button
                onClick={() => copyPlain("current")}
                className={a.button({ variant: "ghost" })}
              >
                📋 Copy (Page)
              </button>
            </div>

            {/* Questions list for this block */}
            <QuestionsList questions={filteredQuestions} />
          </motion.div>
        )}
      </section>

      {/* Footer round pagination */}
      <footer
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background:
            "linear-gradient(180deg, rgba(2,8,23,0), rgba(2,8,23,0.85) 30%)",
          backdropFilter: "blur(6px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={goFirstRound}
          disabled={pageIdx <= 0}
          className={a.button({ variant: "ghost" })}
          title="First page"
        >
          « First
        </button>
        <button
          onClick={goPrevRound}
          disabled={pageIdx <= 0}
          className={a.button({ variant: "secondary" })}
          title="Prev (←)"
        >
          ← Prev
        </button>

        <div style={{ minWidth: 260, textAlign: "center", color: "#A7B8C8" }}>
          {block ? (
            <>
              <strong style={{ color: "#fff" }}>
                {block.kind === "round" ? `Round ${block.round}` : "Face-Off"}
              </strong>{" "}
              &nbsp;•&nbsp; Page{" "}
              <strong style={{ color: "#fff" }}>{pageIdx + 1}</strong> /{" "}
              {visibleBlocks.length}
            </>
          ) : (
            "—"
          )}
        </div>

        <button
          onClick={goNextRound}
          disabled={pageIdx >= visibleBlocks.length - 1}
          className={a.button({ variant: "secondary" })}
          title="Next (→)"
        >
          Next →
        </button>
        <button
          onClick={goLastRound}
          disabled={pageIdx >= visibleBlocks.length - 1}
          className={a.button({ variant: "ghost" })}
          title="Last page"
        >
          Last »
        </button>
      </footer>

      {/* Print: print current page only */}
      <style>{printCSS}</style>
    </main>
  );
}

// — Components ————————————————————————————————————————————————————————————————
function QuestionsList({ questions }: { questions: Question[] }) {
  if (questions.length === 0) {
    return (
      <div className={a.card()} style={{ color: "#A7B8C8" }}>
        No questions match the filters on this page.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {questions.map((q, i) => (
        <div
          key={`${q.id ?? q.prompt}-${i}`}
          className={a.card()}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 8,
            }}
          >
            <strong style={{ color: "#fff" }}>
              Q{i + 1}. {q.prompt}
            </strong>
            <span style={{ color: "#A7B8C8", fontSize: 12 }}>
              {q.answers.length} answers
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 8,
              marginTop: 8,
            }}
          >
            {q.answers.map((aItem, ai) => (
              <div key={ai} style={{ display: "contents" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    padding: "6px 10px",
                  }}
                >
                  {ai + 1}. {aItem.text}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    color: "#F7C948",
                    fontWeight: 800,
                    padding: "6px 0",
                  }}
                >
                  {aItem.points}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// — Helpers ————————————————————————————————————————————————————————————————
const inputStyle: React.CSSProperties = {
  width: "min(380px, 92vw)",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #2a3b86",
  background: "#0a1236",
  color: "white",
};

const selectStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #2a3b86",
  background: "#0a1236",
  color: "white",
};

function csvEscape(v: unknown) {
  const s = String(v ?? "");
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const printCSS = `
@media print {
  body { background: white; }
  main { padding: 0 !important; }
  header, footer { display: none !important; }
  [class*="card"] {
    background: white !important;
    border: 1px solid #ddd !important;
    color: #000 !important;
    box-shadow: none !important;
  }
  h1, h2, strong, span { color: #000 !important; text-shadow: none !important; }
}
`;
