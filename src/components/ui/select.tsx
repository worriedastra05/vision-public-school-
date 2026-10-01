import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white bg-no-repeat px-3.5 pr-9 text-sm text-slate-900 shadow-[0_1px_2px_rgba(19,31,54,0.04)] transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-ink-800 dark:text-slate-100",
        className
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.7rem center",
      }}
      {...props}
    >
      {children}
    </select>
  );
}
