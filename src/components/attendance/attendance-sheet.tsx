"use client";

import { useState } from "react";
import { saveAttendance } from "@/lib/actions/attendance";
import { Check, X, CalendarOff, Clock, Save, CheckCheck, RotateCcw, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "PRESENT" | "ABSENT" | "LEAVE" | "HALF_DAY";

interface RosterStudent {
  id: string;
  name: string;
  rollNo: number | null;
  admissionNo: string;
  photo: string | null;
}

const STATUS_META: Record<Status, { short: string; label: string; active: string; icon: typeof Check }> = {
  PRESENT: { short: "P", label: "Present", active: "bg-emerald-500 text-white shadow-md shadow-emerald-500/30", icon: Check },
  ABSENT: { short: "A", label: "Absent", active: "bg-rose-500 text-white shadow-md shadow-rose-500/30", icon: X },
  LEAVE: { short: "L", label: "Leave", active: "bg-amber-500 text-white shadow-md shadow-amber-500/30", icon: CalendarOff },
  HALF_DAY: { short: "H", label: "Half Day", active: "bg-sky-500 text-white shadow-md shadow-sky-500/30", icon: Clock },
};
const ORDER: Status[] = ["PRESENT", "ABSENT", "LEAVE", "HALF_DAY"];

export function AttendanceSheet({
  roster,
  existing,
  classId,
  sectionId,
  date,
}: {
  roster: RosterStudent[];
  existing: Record<string, Status>;
  classId: string;
  sectionId: string;
  date: string;
}) {
  // Default: existing record, warna sab PRESENT
  const [marks, setMarks] = useState<Record<string, Status>>(() =>
    Object.fromEntries(roster.map((s) => [s.id, existing[s.id] ?? "PRESENT"]))
  );
  const markedCount = Object.keys(existing).length;

  const counts = ORDER.reduce(
    (acc, st) => ({ ...acc, [st]: Object.values(marks).filter((m) => m === st).length }),
    {} as Record<Status, number>
  );

  function cycle(id: string, status: Status) {
    setMarks((m) => ({ ...m, [id]: status }));
  }
  function allPresent() {
    setMarks(Object.fromEntries(roster.map((s) => [s.id, "PRESENT"])) as Record<string, Status>);
  }
  function reset() {
    setMarks(Object.fromEntries(roster.map((s) => [s.id, existing[s.id] ?? "PRESENT"])) as Record<string, Status>);
  }

  return (
    <form action={saveAttendance} className="space-y-4">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="sectionId" value={sectionId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="records" value={JSON.stringify(Object.entries(marks).map(([studentId, status]) => ({ studentId, status })))} />

      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-2">
        {ORDER.map((st) => {
          const Meta = STATUS_META[st];
          return (
            <span
              key={st}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all",
                Meta.active
              )}
            >
              <Meta.icon className="h-3.5 w-3.5" /> {counts[st]} {Meta.label}
            </span>
          );
        })}
        <span className="ml-auto flex items-center gap-2">
          {markedCount > 0 && (
            <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-medium text-brand-700">
              {markedCount} pehle se marked — save karne par update hoga
            </span>
          )}
          <button
            type="button"
            onClick={allPresent}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Sabko Present
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </span>
      </div>

      {/* Roster */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-100">
          {roster.map((s, idx) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-brand-50/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-6 text-center font-mono text-xs text-slate-400">{s.rollNo ?? idx + 1}</span>
                {s.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photo} alt={s.name} className="h-8 w-8 rounded-full border border-slate-200 object-cover" />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-[11px] font-bold text-white">
                    {s.name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{s.name}</p>
                  <p className="font-mono text-[10px] text-slate-400">{s.admissionNo}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {ORDER.map((st) => {
                  const Meta = STATUS_META[st];
                  const isActive = marks[s.id] === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      title={Meta.label}
                      onClick={() => cycle(s.id, st)}
                      className={cn(
                        "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xs font-bold transition-all",
                        isActive
                          ? cn(Meta.active, "scale-105 ring-2 ring-white/60")
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                      )}
                    >
                      {Meta.short}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <UserRound className="h-3.5 w-3.5" /> {roster.length} students • tap P/A/L/H to change
        </p>
        <button
          type="submit"
          className="btn-shine inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-violet-600 to-brand-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-all hover:shadow-xl hover:shadow-brand-600/40 active:scale-[0.98]"
        >
          <Save className="h-4 w-4" /> Save Attendance
        </button>
      </div>
    </form>
  );
}
