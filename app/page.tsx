"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import * as atoms from "@/styles/atoms.css";

export default function Home() {
  return (
    <>
      {/* ── Main Content ─────────────────────────────── */}
      <main
        className={atoms.container}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <motion.div
          aria-hidden
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: "-10%",
            background:
              "radial-gradient(900px 600px at 50% 20%, rgba(43,182,115,0.18), transparent 80%), radial-gradient(600px 400px at 50% 80%, rgba(247,201,72,0.2), transparent 80%)",
            filter: "blur(80px)",
            zIndex: 0,
          }}
        />
        <Image
          src="/ag1ff.png"
          alt="AG1 Family Feud"
          width={420}
          height={250}
          priority
          style={{
            objectFit: "contain",
            filter:
              "drop-shadow(0 0 20px rgba(255,255,180,0.4)) drop-shadow(0 0 40px rgba(43,182,115,0.3))",
          }}
        />

        {/* Title */}
        <h1
          className={atoms.h1}
          style={{
            textAlign: "center",
            marginBottom: 8,
            zIndex: 1,
          }}
        >
          Family Feud
        </h1>
        <p
          className={atoms.muted}
          style={{
            textAlign: "center",
            marginBottom: 24,
            color: "#A7B8C8",
            zIndex: 1,
          }}
        >
          Set up teams, then host the board.
        </p>

        {/* Hero Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ zIndex: 1 }}
        >
          <Link
            href="/onboarding"
            className={atoms.button({ variant: "flavorGold", size: "lg" })}
            style={{
              fontWeight: 900,
              fontSize: "1.5rem",
              padding: "1.4rem 3rem",
              borderRadius: 999,
              letterSpacing: "0.06em",
            }}
          >
            Start →
          </Link>
        </motion.div>

        {/* ── Footer nav links (less attention-grabbing) ── */}
        <nav
          style={{
            position: "absolute",
            bottom: 20,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 14,
            fontSize: 14,
            opacity: 0.7,
          }}
        >
          <Link
            href="/host"
            className={atoms.card({ tone: "accent", clickable: true })}
            style={{ padding: "8px 14px" }}
          >
            Host Controls
          </Link>
          <Link
            href="/setup"
            className={atoms.card({ tone: "gold", clickable: true })}
            style={{ padding: "8px 14px" }}
          >
            Classic Setup
          </Link>
          <Link
            href="/faceoff"
            className={atoms.card({ tone: "green", clickable: true })}
            style={{ padding: "8px 14px" }}
          >
            Face-Off
          </Link>
          <Link
            href="/game"
            className={atoms.card({ tone: "pink", clickable: true })}
            style={{ padding: "8px 14px" }}
          >
            Game Board
          </Link>
          <Link
            href="/rules"
            className={atoms.card({ tone: "blue", clickable: true })}
            style={{ padding: "8px 14px" }}
          >
            Game Rules
          </Link>
        </nav>
      </main>
    </>
  );
}
