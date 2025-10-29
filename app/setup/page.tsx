"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchQuestions } from "@/lib/data";
import type { Question } from "@/lib/types";
import { useGameStore } from "@/lib/store";
import * as a from "@/styles/atoms.css";

// CSV parser → Question[]
function csvToQuestions(csv: string): Question[] {
  // Expect lines: prompt,answer,points
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#")); // allow comments

  const groups = new Map<string, { text: string; points: number }[]>();
  for (const line of lines) {
    const [promptRaw, answerRaw, pointsRaw] = line
      .split(",")
      .map((s) => s.trim());
    if (!promptRaw || !answerRaw) continue;
    const points = Number(pointsRaw ?? 0) || 0;
    const arr = groups.get(promptRaw) ?? [];
    arr.push({ text: answerRaw, points });
    groups.set(promptRaw, arr);
  }

  let i = 1;
  const out: Question[] = [];
  for (const [prompt, answers] of groups) {
    out.push({
      id: `csv-${i++}`,
      prompt,
      answers: answers
        .sort((a, b) => b.points - a.points)
        .map((x) => ({ ...x, revealed: false })),
    });
  }
  return out;
}

export default function SetupPage() {
  const router = useRouter();

  const {
    teams,
    setTeamName,
    setScore,
    resetScoresAndStrikes,
    loadQuestions,
    questions,
    current,
  } = useGameStore();

  const [paste, setPaste] = useState("");
  const [status, setStatus] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  // load default questions once if none loaded yet
  useEffect(() => {
    async function load() {
      const q = await fetchQuestions(); // from public/questions.json
      loadQuestions(q);
    }
    if (questions.length === 0) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  const preview = useMemo(() => {
    if (questions.length === 0) return null;
    const first = questions[0];
    const total = questions.reduce((acc, q) => acc + q.answers.length, 0);
    return { count: questions.length, totalAnswers: total, first };
  }, [questions]);

  async function handleImportJSON(text: string) {
    try {
      const arr = JSON.parse(text) as Question[];
      if (!Array.isArray(arr))
        throw new Error("JSON must be an array of questions");
      if (arr.length === 0) throw new Error("No questions found");
      loadQuestions(
        arr.map((q, i) => ({
          id: q.id || `json-${i + 1}`,
          prompt: q.prompt,
          answers: q.answers.map((a) => ({ ...a, revealed: false })),
        }))
      );
      setStatus(`Loaded ${arr.length} questions from JSON`);
    } catch (e: any) {
      setStatus(`JSON parse error: ${e?.message ?? e}`);
    }
  }

  function handleImportCSV(text: string) {
    const parsed = csvToQuestions(text);
    if (parsed.length === 0) {
      setStatus("CSV parse error: no valid rows (expect prompt,answer,points)");
      return;
    }
    loadQuestions(parsed);
    setStatus(`Loaded ${parsed.length} questions from CSV`);
  }

  function handleDetectAndImport() {
    const text = paste.trim();
    if (!text) return;
    if (text.startsWith("[")) {
      handleImportJSON(text);
    } else {
      handleImportCSV(text);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isJSON = file.name.endsWith(".json");
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      if (isJSON) handleImportJSON(text);
      else handleImportCSV(text);
    };
    reader.readAsText(file);
  }

  return (
    <main className={a.container}>
      <h1>Setup</h1>
      <p className={a.muted}>
        Name your teams and load a question set (JSON or CSV).
      </p>

      {/* Teams */}
      <section style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <h2>Teams</h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div className={a.card()}>
            <label style={{ display: "block", marginBottom: 6 }}>Team A</label>
            <input
              value={teams[0].name}
              onChange={(e) => setTeamName(0, e.target.value)}
              placeholder="Team A name"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #2a3b86",
                background: "#0a1236",
                color: "white",
              }}
            />
            <div style={{ marginTop: 8 }}>
              <label>Score:&nbsp;</label>
              <input
                type="number"
                value={teams[0].score}
                onChange={(e) => setScore(0, Number(e.target.value))}
                style={{
                  width: 120,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #2a3b86",
                  background: "#0a1236",
                  color: "white",
                }}
              />
            </div>
          </div>

          <div className={a.card()}>
            <label style={{ display: "block", marginBottom: 6 }}>Team B</label>
            <input
              value={teams[1].name}
              onChange={(e) => setTeamName(1, e.target.value)}
              placeholder="Team B name"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #2a3b86",
                background: "#0a1236",
                color: "white",
              }}
            />
            <div style={{ marginTop: 8 }}>
              <label>Score:&nbsp;</label>
              <input
                type="number"
                value={teams[1].score}
                onChange={(e) => setScore(1, Number(e.target.value))}
                style={{
                  width: 120,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #2a3b86",
                  background: "#0a1236",
                  color: "white",
                }}
              />
            </div>
          </div>
        </div>

        <div className={a.buttonsRow}>
          <button
            onClick={resetScoresAndStrikes}
            className={a.button({ variant: "ghost" })}
          >
            Reset scores & strikes
          </button>
        </div>
      </section>

      {/* Questions */}
      <section style={{ display: "grid", gap: 12, marginTop: 28 }}>
        <h2>Questions</h2>
        <div className={a.buttonsRow}>
          <button
            onClick={async () => {
              const q = await fetchQuestions();
              loadQuestions(q);
              setStatus(`Loaded ${q.length} questions (default)`);
            }}
            className={a.button({ variant: "primary" })}
          >
            Load default (questions.json)
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFile}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className={a.button({ variant: "secondary" })}
          >
            Import file (.json / .csv)
          </button>
        </div>

        <div className={a.card()}>
          <label style={{ display: "block", marginBottom: 6 }}>
            Paste JSON (array of questions) or CSV (
            <code>prompt,answer,points</code>)
          </label>
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder='[{"id":"q1","prompt":"...","answers":[{"text":"...","points":10}]},{"id":"q2",...}]'
            style={{
              width: "100%",
              minHeight: 140,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #2a3b86",
              background: "#0a1236",
              color: "white",
            }}
          />
          <div className={a.buttonsRow}>
            <button
              onClick={handleDetectAndImport}
              className={a.button({ variant: "flavorGreen" })}
            >
              Import from paste
            </button>
          </div>
          {!!status && (
            <p className={a.muted} style={{ marginTop: 8 }}>
              {status}
            </p>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div className={a.card({ tone: "gold" })}>
            <strong>{preview.count}</strong> questions loaded (
            <strong>{preview.totalAnswers}</strong> total answers).
            <br />
            First: <em>{preview.first.prompt}</em>
          </div>
        )}
      </section>

      {/* Go buttons */}
      <section className={a.buttonsRow} style={{ marginTop: 28 }}>
        <button
          onClick={() => router.push("/host")}
          className={a.button({ variant: "secondary", size: "lg" })}
        >
          Open Host →
        </button>
        <button
          onClick={() => router.push("/game")}
          className={a.button({ variant: "primary", size: "lg" })}
        >
          Open Game →
        </button>
      </section>
    </main>
  );
}
