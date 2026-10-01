"use client";

import { useMemo, useState } from "react";
import { saveMarks } from "@/lib/actions/exams";
import { Save, AlertTriangle, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface RosterStudent {
  id: string;
  name: string;
  rollNo: number | null;
  admissionNo: string;
}
interface SubjectCol {
  id: string;
  name: string;
}

export function MarksSheet({
  examId,
  roster,
  subjects,
  existing,
  defaultMax,
  locked,
}: {
  examId: string;
  roster: RosterStudent[];
  subjects: SubjectCol[];
  existing: Record<string, string>; // key `${studentId}:${subjectId}`
  defaultMax: number;
  locked: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(existing);
  const [max, setMax] = useState(String(defaultMax));
  const maxNum = Number(max) || 0;

  const records = useMemo(() => {
    const out: { studentId: string; subjectId: string; marks: number }[] = [];
    for (const [key, raw] of Object.entries(values)) {
      const v = raw.trim();
      if (v === "") continue;
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) continue;
      const [studentId, subjectId] = key.split(":");
      out.push({ studentId, subjectId, marks: Math.min(n, 999) });
    }
    return out;
  }, [values]);

  const rowTotal = (sid: string) =>
    subjects.reduce((sum, sub) => {
      const v = Number(values[`${sid}:${sub.id}`]);
      return sum + (Number.isFinite(v) ? v : 0);
    }, 0);

  const overLimit = (v: string) => v.trim() !== "" && Number(v) > maxNum;

  function setCell(sid: string, sub: string, v: string) {
    setValues((m) => ({ ...m, [`${sid}:${sub}`]: v }));
  }

  return (
    <form action={saveMarks} className="space-y-4" onSubmit={(e) => (locked ? e.preventDefault() : undefined)}>
      <input type="hidden" name="examId" value={examId} />
      <input type="hidden" name="maxMarks" value={maxNum > 0 ? String(maxNum) : "100"} />
      <input type="hidden" name="records" value={JSON.stringify(records)} />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2">
          <span className="text-xs font-semibold text-slate-500">Max Marks (har subject)</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-bold outline-none focus:border-brand-400"
          />
        </label>
        <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
          {records.length} entries filled
        </span>
        {locked && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" /> Published — edit band hai
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <th className="sticky left-0 z-10 min-w-52 bg-slate-50 px-4 py-3 text-left font-semibold">Student</th>
              {subjects.map((s) => (
                <th key={s.id} className="min-w-28 px-2 py-3 text-center font-semibold">
                  {s.name}
                </th>
              ))}
              <th className="min-w-20 px-3 py-3 text-center font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roster.map((st, idx) => (
              <tr key={st.id} className="transition-colors hover:bg-brand-50/50">
                <td className="sticky left-0 z-10 bg-white px-4 py-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-center font-mono text-[11px] text-slate-400">
                      {st.rollNo ?? idx + 1}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-[10px] font-bold text-white">
                      {st.name.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-800">{st.name}</span>
                      <span className="block font-mono text-[10px] text-slate-400">{st.admissionNo}</span>
                    </span>
                  </div>
                </td>
                {subjects.map((sub) => {
                  const v = values[`${st.id}:${sub.id}`] ?? "";
                  return (
                    <td key={sub.id} className="px-2 py-2 text-center">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.5"
                        disabled={locked}
                        value={v}
                        onChange={(e) => setCell(st.id, sub.id, e.target.value)}
                        placeholder="—"
                        className={cn(
                          "h-9 w-full rounded-lg border px-2 text-center text-sm font-semibold outline-none transition-all",
                          overLimit(v)
                            ? "border-rose-300 bg-rose-50 text-rose-700"
                            : "border-slate-200 bg-slate-50/60 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-500/15",
                          locked && "cursor-not-allowed opacity-60"
                        )}
                      />
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center">
                  <span className="font-mono text-sm font-bold text-slate-700">
                    {rowTotal(st.id) > 0 ? rowTotal(st.id) : "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <UserRound className="h-3.5 w-3.5" /> Blank = absent/skip • red cell = max se zyada
        </p>
        {!locked && (
          <button
            type="submit"
            className="btn-shine inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-violet-600 to-brand-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-all hover:shadow-xl hover:shadow-brand-600/40 active:scale-[0.98]"
          >
            <Save className="h-4 w-4" /> Save Marks ({records.length})
          </button>
        )}
      </div>
    </form>
  );
}
