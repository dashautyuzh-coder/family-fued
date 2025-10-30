"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { playSound } from "@/lib/sounds";

const TICK_MS = 1000;

export default function FaceoffSplash({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [count, setCount] = useState(3);
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Start countdown after logo hides
    const hideLogoTimer = setTimeout(() => {
      setShowLogo(false);

      // Play first beep and show "3"
      playSound("countdown");

      timer = setInterval(() => {
        setCount((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(timer);
            setTimeout(() => onComplete(), 800);
            return 0;
          }
        });
      }, TICK_MS);
    }, TICK_MS);

    return () => {
      clearInterval(timer);
      clearTimeout(hideLogoTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(circle at center, #021, #000)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        zIndex: 9999,
      }}
    >
      <AnimatePresence>
        {showLogo && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Image
              src="/ag1-ff-logo.png"
              alt="Design Token Showdown"
              width={300}
              height={300}
              style={{ objectFit: "contain" }}
            />
          </motion.div>
        )}

        {!showLogo && count > 0 && (
          <motion.h1
            key={count}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.3 }}
            exit={{ opacity: 0, scale: 0.2 }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: "8rem",
              fontWeight: 900,
              color: "#F7C948",
              textShadow: "0 0 30px rgba(255,255,150,0.8)",
            }}
          >
            {count}
          </motion.h1>
        )}

        {count <= 0 && (
          <motion.h1
            key="go"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: "6rem",
              fontWeight: 900,
              color: "#2BB673",
              textShadow: "0 0 40px rgba(43,182,115,0.8)",
            }}
          >
            Go!
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
}
