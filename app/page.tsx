import Link from "next/link";
import * as atoms from "@/styles/atoms.css";

export default function Home() {
  return (
    <main className={atoms.container}>
      <h1 className={atoms.h1}>AG1 Family Feud</h1>
      <p className={atoms.muted}>
        Set up teams & questions, then host the board.
      </p>

      <div className={atoms.grid} style={{ marginTop: 16 }}>
        <Link
          href="/setup"
          className={atoms.card({ tone: "accent", clickable: true })}
        >
          <strong>Setup →</strong>
          <br />
          Add teams and import CSV
        </Link>
        <Link href="/host" className={atoms.card({ clickable: true })}>
          <strong>Host Controls →</strong>
          <br />
          Reveal answers, strikes, points
        </Link>
        <Link
          href="/game"
          className={atoms.card({ tone: "gold", clickable: true })}
        >
          <strong>Play Board →</strong>
          <br />
          Display for players/spectators
        </Link>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link
          href="/setup"
          className={atoms.button({ variant: "flavorGold", size: "lg" })}
        >
          Get Started
        </Link>
        <Link href="/host" className={atoms.button({ variant: "ghost" })}>
          Open Host Controls
        </Link>
      </div>
    </main>
  );
}
