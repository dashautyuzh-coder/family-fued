"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import * as atoms from "@/styles/atoms.css";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {/* ── Splash Intro ─────────────────────────────── */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={dismiss}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "grid",
              placeItems: "center",
              background:
                "radial-gradient(1200px 800px at 50% -10%, #0e1b47, #020817 85%)",
              color: "white",
              cursor: "pointer",
              overflow: "hidden",
            }}
            title="Press Enter or click to continue"
          >
            {/* Subtle ambient wash */}
            <motion.div
              aria-hidden
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{
                duration: 12,
                repeat: Infinity,
                repeatType: "mirror",
              }}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(43,182,115,0.25), rgba(247,201,72,0.22), rgba(25,64,175,0.2))",
                filter: "blur(90px)",
                mixBlendMode: "overlay",
                pointerEvents: "none",
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: "center" }}
            >
              <Image
                src="/ag1-ff-logo.png"
                alt="AG1 Family Feud"
                width={420}
                height={420}
                priority
                style={{
                  objectFit: "contain",
                  filter:
                    "drop-shadow(0 0 20px rgba(255,255,180,0.4)) drop-shadow(0 0 40px rgba(43,182,115,0.3))",
                }}
              />
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  color: "#A7B8C8",
                  marginTop: 8,
                  letterSpacing: "0.05em",
                }}
              >
                Get ready for the showdown…
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
