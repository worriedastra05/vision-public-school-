import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(19,31,54,0.04)] transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-ink-800 dark:text-slate-100 dark:focus:border-gold-500/60",
        className
      )}
      {...props}
    />
  );
}
