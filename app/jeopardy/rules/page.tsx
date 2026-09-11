"use client";

import Link from "next/link";
import * as b from "@/styles/jeopardy/board.css";
import { useJeopardyStore } from "@/lib/jeopardy/store";

export default function JeopardyRulesPage() {
  const { selectedTheme: theme } = useJeopardyStore();

  return (
    <main className={b.pageBg({ theme })}>
      <section className={b.panel({ theme })} style={{ width: "min(900px, 92vw)" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <h1 style={{ margin: 0 }}>
            {theme === "sprinkle" ? "The Fourth Prince Rules 🌸" : "AG1opardy Rules"}
          </h1>
          <Link href="/jeopardy" className={b.navButton({ theme, tone: "default" })}>
            ← Home
          </Link>
        </header>

        <div style={{ height: 12 }} />

        <ol style={{ lineHeight: 1.6, margin: 0, paddingLeft: 18 }}>
          <li>
            <strong>The board:</strong> 5 categories × 5 clues each, with
            dollar values from $100 to $500.
          </li>
          <li>
            <strong>Picking a clue:</strong> The board shows which team picks
            next (🎲) — they choose any clue, and it&apos;s shown to everyone.
          </li>
          <li>
            <strong>Buzzing in:</strong> Whichever team buzzes in first gets
            to answer; mark them as the active team. This resets for every
            clue, so mark it fresh each time.
          </li>
          <li>
            <strong>Revealing:</strong> Click 👀 Reveal Answer once a team has
            answered — it stays hidden until then, so nobody sees it early.
          </li>
          <li>
            <strong>Judging:</strong> Once revealed, mark it ✅ Correct (adds
            the dollar value to their score) or ❌ Incorrect (subtracts it).
            If nobody answers, hit ⏭ Skip before revealing — no score change.
            A correct answer also hands that team the next pick; a miss or
            skip leaves picking with whoever already had it.
          </li>
          <li>
            <strong>Winning:</strong> Once every clue on the board has been
            played, whichever team has the higher score wins.
          </li>
        </ol>

        <div style={{ height: 16 }} />

        <div className={b.panelInset({ theme })}>
          <h3 style={{ marginTop: 0 }}>Controls & Shortcuts</h3>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
            <li>Click a value tile to open that clue.</li>
            <li>
              <kbd>1</kbd> / <kbd>2</kbd> set the active team,{" "}
              <kbd>Space</kbd> reveals the answer, <kbd>C</kbd> / <kbd>X</kbd>{" "}
              / <kbd>S</kbd> judge correct / incorrect / skip, <kbd>Esc</kbd>{" "}
              backs out of a clue without scoring it.
            </li>
          </ul>
        </div>

        <div style={{ height: 14 }} />

        <footer
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <Link href="/jeopardy" className={b.navButton({ theme, tone: "gold" })}>
            Start a Game →
          </Link>
        </footer>
      </section>
    </main>
  );
}
