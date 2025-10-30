"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchQuestions } from "@/lib/data";
import type { Question } from "@/lib/types";
import { useGameStore } from "@/lib/store";
import * as a from "@/styles/atoms.css";
import { useToast } from "@/lib/toast";

// ---------- helpers ----------
function csvToQuestions(csv: string): Question[] {
  // Expect rows: prompt,answer,points  (supports # comments and blank lines)
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#"));

  const groups = new Map<string, { text: string; points: number }[]>();

  for (const line of lines) {
    const [promptRaw, answerRaw, pointsRaw = "0"] = line
      .split(",")
      .map((s) => s.trim());
    if (!promptRaw || !answerRaw) continue;

    const points = Number(pointsRaw) || 0;
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
        .map((x) => ({ ...x, revealed: false, awarded: false })),
    });
  }
  return out;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #2a3b86",
  background: "#0a1236",
  color: "white",
};

// ---------- page ----------
export default function SetupPage() {
  const router = useRouter();
  const { toast, Toast } = useToast();

  const {
    teams,
    setTeamName,
    setScore,
    resetScoresAndStrikes,
    loadQuestions,
    questions,
    resetAll,
  } = useGameStore();

  const [paste, setPaste] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loadingImport, setLoadingImport] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load default questions once if none loaded yet
  useEffect(() => {
    async function load() {
      try {
        setLoadingDefault(true);
        const q = await fetchQuestions();
        loadQuestions(q);
        setStatus(`Loaded ${q.length} questions (default)`);
      } catch (e) {
        setStatus("Failed to load default questions");
      } finally {
        setLoadingDefault(false);
      }
    }
    if (questions.length === 0) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  const preview = useMemo(() => {
    if (questions.length === 0) return null;
    const first = questions[0]; // ✅ fix off-by-one
    const total = questions.reduce((acc, q) => acc + q.answers.length, 0);
    return { count: questions.length, totalAnswers: total, first };
  }, [questions]);

  async function handleImportJSON(text: string) {
    try {
      setLoadingImport(true);
      const arr = JSON.parse(text) as Question[];
      if (!Array.isArray(arr))
        throw new Error("JSON must be an array of questions");
      if (arr.length === 0) throw new Error("No questions found");

      loadQuestions(
        arr.map((q, i) => ({
          id: q.id || `json-${i + 1}`,
          prompt: q.prompt,
          answers: q.answers.map((a) => ({
            ...a,
            revealed: a.revealed ?? false,
            awarded: a.awarded ?? false,
          })),
        }))
      );
      setStatus(`✅ Loaded ${arr.length} questions from JSON`);
      toast(`✅ Loaded ${arr.length} questions (JSON)`);
    } catch (e: any) {
      const msg = `JSON parse error: ${e?.message ?? e}`;
      setStatus(msg);
      toast(msg);
    } finally {
      setLoadingImport(false);
    }
  }

  function handleImportCSV(text: string) {
    setLoadingImport(true);
    try {
      const parsed = csvToQuestions(text);
      if (parsed.length === 0) {
        const msg =
          "CSV parse error: no valid rows (expect prompt,answer,points)";
        setStatus(msg);
        toast(msg);
        return;
      }
      loadQuestions(parsed);
      const msg = `✅ Loaded ${parsed.length} questions from CSV`;
      setStatus(msg);
      toast(msg);
    } finally {
      setLoadingImport(false);
    }
  }

  function handleDetectAndImport() {
    const text = paste.trim();
    if (!text) return;
    if (text.startsWith("[")) handleImportJSON(text);
    else handleImportCSV(text);
  }

  async function handleFileUpload(file: File) {
    const text = await file.text();
    file.name.endsWith(".json")
      ? handleImportJSON(text)
      : handleImportCSV(text);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleFileUpload(file);
  }

  return (
    <main className={a.container}>
      <h1 className={a.h1}>🎬 Game Setup</h1>
      <p className={a.muted}>Prepare team names and load a question set.</p>

      <div className={a.buttonsRow} style={{ marginTop: 4 }}>
        <button
          onClick={() => router.push("/faceoff")}
          className={a.button({ variant: "flavorGold", size: "lg" })}
          title="Start with a face-off round"
        >
          ⚡ Start Face-Off →
        </button>
        <button
          onClick={() => router.push("/game")}
          className={a.button({ variant: "primary", size: "lg" })}
          title="Skip to game board"
        >
          🎲 Open Game →
        </button>
      </div>

      {/* Teams */}
      <section className={a.card({ tone: "accent" })} style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>👥 Teams</h2>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {/* Team A */}
          <div className={a.card()}>
            <label style={{ display: "block", marginBottom: 6 }}>Team A</label>
            <input
              value={teams[0].name}
              onChange={(e) => setTeamName(0, e.target.value)}
              placeholder="Team A name"
              style={inputStyle}
            />
            <div style={{ marginTop: 8 }}>
              <label>Score:&nbsp;</label>
              <input
                type="number"
                value={teams[0].score}
                onChange={(e) => setScore(0, Number(e.target.value))}
                style={{ ...inputStyle, width: 140, borderRadius: 8 }}
              />
            </div>
          </div>

          {/* Team B */}
          <div className={a.card()}>
            <label style={{ display: "block", marginBottom: 6 }}>Team B</label>
            <input
              value={teams[1].name}
              onChange={(e) => setTeamName(1, e.target.value)}
              placeholder="Team B name"
              style={inputStyle}
            />
            <div style={{ marginTop: 8 }}>
              <label>Score:&nbsp;</label>
              <input
                type="number"
                value={teams[1].score}
                onChange={(e) => setScore(1, Number(e.target.value))}
                style={{ ...inputStyle, width: 140, borderRadius: 8 }}
              />
            </div>
          </div>
        </div>

        <div className={a.buttonsRow} style={{ marginTop: 12 }}>
          <button
            onClick={resetScoresAndStrikes}
            className={a.button({ variant: "ghost" })}
            title="Zero scores and clear strikes"
          >
            🧹 Reset scores & strikes
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  "Reset EVERYTHING? Teams and questions will be cleared."
                )
              ) {
                resetAll();
                setStatus("Game reset.");
                toast("🔄 Full game reset");
              }
            }}
            className={a.button({ variant: "secondary" })}
            title="Full reset: teams + questions"
          >
            🔄 Full game reset
          </button>
        </div>
      </section>

      {/* Questions */}
      <section className={a.card()} style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>🧩 Questions</h2>
        <p className={a.muted} style={{ marginTop: 4 }}>
          Import JSON or CSV, or use the default set.
        </p>

        <div className={a.buttonsRow} style={{ marginTop: 8 }}>
          <button
            onClick={async () => {
              try {
                setLoadingDefault(true);
                const q = await fetchQuestions();
                loadQuestions(q);
                const msg = `✅ Loaded ${q.length} questions (default)`;
                setStatus(msg);
                toast(msg);
              } catch {
                setStatus("Failed to load default questions");
                toast("❌ Failed to load default");
              } finally {
                setLoadingDefault(false);
              }
            }}
            className={a.button({ variant: "primary" })}
            disabled={loadingDefault}
          >
            {loadingDefault ? "Loading…" : "Load default (questions.json)"}
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

        <div className={a.card()} style={{ marginTop: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>
            Paste JSON (array of questions) or CSV (
            <code>prompt,answer,points</code>)
          </label>
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder='[{"id":"q1","prompt":"...","answers":[{"text":"...","points":10}]},{"id":"q2",...}]'
            style={{
              ...inputStyle,
              minHeight: 140,
              borderRadius: 12,
              resize: "vertical",
            }}
          />
          <div className={a.buttonsRow} style={{ marginTop: 8 }}>
            <button
              onClick={handleDetectAndImport}
              className={a.button({ variant: "flavorGreen" })}
              disabled={loadingImport || paste.trim().length === 0}
            >
              {loadingImport ? "Importing…" : "Import from paste"}
            </button>
            {loadingImport && (
              <span className={a.muted} style={{ fontStyle: "italic" }}>
                ⏳ Processing…
              </span>
            )}
          </div>

          {!!status && (
            <p className={a.muted} style={{ marginTop: 8 }}>
              {status}
            </p>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div className={a.card({ tone: "gold" })} style={{ marginTop: 12 }}>
            <strong>{preview.count}</strong> questions loaded (
            <strong>{preview.totalAnswers}</strong> total answers).
            <br />
            First: <em>{preview.first.prompt}</em>
          </div>
        )}
      </section>

      {/* Go buttons */}
      <section className={a.buttonsRow} style={{ marginTop: 20 }}>
        <button
          onClick={() => router.push("/host")}
          className={a.button({ variant: "secondary", size: "lg" })}
        >
          🎛️ Open Host →
        </button>
        <button
          onClick={() => router.push("/game")}
          className={a.button({ variant: "primary", size: "lg" })}
        >
          🎲 Open Game →
        </button>
      </section>

      {Toast}
    </main>
  );
}
