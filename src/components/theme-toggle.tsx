"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/** 🌙☀️ Oxford theme toggle — localStorage me save, reload par bhi same rahe */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("vps-theme", next ? "dark" : "light");
    } catch {
      // private mode me ignore
    }
  }

  // SSR/mount se pehle neutral icon (hydration mismatch avoid)
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
