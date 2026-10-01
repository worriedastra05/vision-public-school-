"use client";

import { useState } from "react";
import { recordPayment } from "@/lib/actions/fees";
import { Wallet, IndianRupee, IndianRupee as PaidAll } from "lucide-react";

interface StructItem {
  id: string;
  type: string;
  amount: number;
  frequency: string;
}

export function CollectForm({
  studentId,
  structures,
  pending,
}: {
  studentId: string;
  structures: StructItem[];
  pending: number | null;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [amounts, setAmounts] = useState<Record<string, number>>(
    Object.fromEntries(structures.map((s) => [s.id, s.amount]))
  );
  const [mode, setMode] = useState("CASH");

  const selected = structures.filter((s) => checked[s.id]);
  const total = selected.reduce((sum, s) => sum + (amounts[s.id] || 0), 0);
  const items = selected.map((s) => ({ label: `${s.type} (${s.frequency === "MONTHLY" ? "monthly" : s.frequency === "TERM" ? "term" : "one-time"})`, amount: amounts[s.id] || 0 }));

  return (
    <form action={recordPayment} className="space-y-5">
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      {/* Structure checkboxes */}
      <div className="space-y-2.5">
        {structures.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Is class ki fee structure nahi bani — pehle{" "}
            <a href="/admin/fees/structure" className="font-semibold text-brand-600 hover:underline">
              Fee Structure
            </a>{" "}
            set karo
          </p>
        )}
        {structures.map((s) => (
          <label
            key={s.id}
            className={`flex cursor-pointer items-center gap-3.5 rounded-xl border-2 p-3.5 transition-all ${
              checked[s.id]
                ? "border-brand-400 bg-brand-50/70 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={!!checked[s.id]}
              onChange={(e) => setChecked((c) => ({ ...c, [s.id]: e.target.checked }))}
              className="h-4.5 w-4.5 shrink-0 accent-brand-600"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-800">{s.type}</span>
              <span className="text-[11px] text-slate-400">
                {s.frequency === "MONTHLY" ? "har mahine" : s.frequency === "TERM" ? "per term" : "ek baar"}
              </span>
            </span>
            <span className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
              <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="number"
                min={1}
                value={amounts[s.id] || ""}
                disabled={!checked[s.id]}
                onChange={(e) => setAmounts((a) => ({ ...a, [s.id]: Number(e.target.value) }))}
                className="w-20 text-center text-sm font-bold outline-none disabled:opacity-40"
                placeholder={String(s.amount)}
              />
            </span>
          </label>
        ))}
      </div>

      {/* Mode + note */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="mode" className="text-sm font-medium text-slate-700">Payment Mode</label>
          <div className="flex flex-wrap gap-2">
            {["CASH", "UPI", "CHEQUE", "ONLINE"].map((m) => (
              <label
                key={m}
                className={`cursor-pointer rounded-xl border-2 px-3.5 py-2 text-sm font-semibold transition-all ${
                  mode === m
                    ? "border-brand-500 bg-brand-600 text-white shadow-md shadow-brand-600/25"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value={m}
                  checked={mode === m}
                  onChange={() => setMode(m)}
                  className="hidden"
                />
                {m}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="note" className="text-sm font-medium text-slate-700">Note (optional)</label>
          <input
            id="note"
            name="note"
            maxLength={120}
            placeholder="e.g. October month fees"
            className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Total + submit */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Total Collect</p>
          <p className="font-mono text-2xl font-bold text-slate-900">₹{total.toLocaleString("en-IN")}</p>
          {pending !== null && pending > 0 && (
            <p className="mt-0.5 text-xs text-amber-700">Pending dues: ₹{pending.toLocaleString("en-IN")}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={total <= 0}
          className="btn-shine inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-[length:200%_100%] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:shadow-xl hover:shadow-emerald-600/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <Wallet className="h-4.5 w-4.5" /> Collect ₹{total.toLocaleString("en-IN")}
        </button>
      </div>
      <PaidAll className="hidden" />
    </form>
  );
}
