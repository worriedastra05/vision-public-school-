"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/** 🌙☀️ Oxford theme toggle — saved to localStorage, survives reloads */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);

  // Deferred to the next frame: keeps the SSR/mount neutral icon (no hydration
  // mismatch) and avoids a synchronous setState inside the effect body.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("vps-theme", next ? "dark" : "light");
    } catch {
      // ignored in private mode
    }
  }

  // Neutral icon before SSR/mount (avoids hydration mismatch)
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Light mode" : "Dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-gold-400/60 hover:text-gold-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-gold-300 ${className}`}
    >
      {dark === null ? (
        <span className="h-4 w-4" />
      ) : dark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
