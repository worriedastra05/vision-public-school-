"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
    >
      <Printer className="h-4 w-4" /> Print / PDF
    </button>
  );
}
