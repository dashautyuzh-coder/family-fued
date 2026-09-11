"use client";
import { useEffect, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 2000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const Toast = message ? (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: "rgba(10, 18, 54, 0.9)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "white",
        padding: "12px 20px",
        borderRadius: 10,
        fontWeight: 600,
        fontSize: "0.95rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        zIndex: 2000,
        animation: "fadein 0.3s ease",
      }}
    >
      {message}
    </div>
  ) : null;

  return { toast: (msg: string) => setMessage(msg), Toast };
}
