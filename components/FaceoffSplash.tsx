"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { playSound } from "@/lib/sounds";

const TICK_MS = 800;
const LOGO_SHOW_MS = 2000;
const LOGO_EXIT_MS = 1200;

export default function FaceoffSplash({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [count, setCount] = useState(3);
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    const introTimer = setTimeout(() => {
      setShowLogo(false); // triggers exit animation

      // wait for exit to finish before starting countdown
      const afterExitTimer = setTimeout(() => {
        playSound("countdown");
        timer = setInterval(() => {
          setCount((prev) => {
            if (prev > 1) return prev - 1;
            clearInterval(timer!);
            setTimeout(() => onComplete(), 900);
            return 0;
          });
        }, TICK_MS);
      }, LOGO_EXIT_MS);

      // cleanup nested timeout too
      return () => clearTimeout(afterExitTimer);
    }, LOGO_SHOW_MS);

    return () => {
      if (timer) clearInterval(timer);
      clearTimeout(introTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(1200px 800px at 50% -10%, #0e1b47, #020817 80%)",
        color: "white",
        zIndex: 9999,
      }}
    >
      {/* Ambient motion background */}
      <motion.div
        aria-hidden
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "mirror",
        }}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(43,182,115,0.25), rgba(247,201,72,0.25), rgba(25,64,175,0.25))",
          filter: "blur(80px)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Spotlights */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -100,
          left: "10%",
          width: 300,
          height: 600,
          background: "linear-gradient(180deg, #2bb67355, transparent)",
          transform: "rotate(-15deg)",
          filter: "blur(10px)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -100,
          right: "10%",
          width: 300,
          height: 600,
          background: "linear-gradient(180deg, #f7c94855, transparent)",
          transform: "rotate(15deg)",
          filter: "blur(10px)",
        }}
      />

      <AnimatePresence mode="wait">
        {showLogo && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.6, rotate: -5 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
              filter: "drop-shadow(0 0 40px rgba(247,201,72,0.5))",
            }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Image
              src="/ag1-ff-logo.png"
              alt="Family Feud AG1"
              width={400}
              height={400}
              style={{
                objectFit: "contain",
                filter:
                  "drop-shadow(0 0 20px rgba(255,255,150,0.5)) drop-shadow(0 0 40px rgba(43,182,115,0.3))",
              }}
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                color: "#A7B8C8",
                fontSize: 18,
                marginTop: 10,
                letterSpacing: "0.05em",
              }}
            >
              Get ready for the showdown...
            </motion.p>
          </motion.div>
        )}

        {!showLogo && count > 0 && (
          <motion.h1
            key={count}
            initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
            animate={{
              opacity: 1,
              scale: [1.2, 1],
              rotate: [10, 0],
            }}
            exit={{ opacity: 0, scale: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              fontSize: "10rem",
              fontWeight: 900,
              color: "#F7C948",
              textShadow:
                "0 0 40px rgba(255,255,150,0.9), 0 0 60px rgba(43,182,115,0.5)",
            }}
          >
            {count}
          </motion.h1>
        )}

        {count <= 0 && (
          <motion.h1
            key="go"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: 1,
              scale: [1.2, 1.4, 1],
              rotate: [0, 10, 0],
            }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{
              fontSize: "7rem",
              fontWeight: 900,
              color: "#2BB673",
              textShadow:
                "0 0 60px rgba(43,182,115,1), 0 0 90px rgba(247,201,72,0.6)",
            }}
          >
            GO!
          </motion.h1>
        )}
      </AnimatePresence>

      {/* Subtle floor reflection glow */}
      <motion.div
        aria-hidden
        animate={{
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ repeat: Infinity, duration: 3 }}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "200px",
          background:
            "radial-gradient(ellipse at center, rgba(247,201,72,0.3), transparent 80%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
