import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { attendance, students } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardCheck, Check, X, CalendarOff, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const META: Record<string, { label: string; chip: string; dot: string }> = {
  PRESENT: { label: "Present", chip: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  ABSENT: { label: "Absent", chip: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  LEAVE: { label: "Leave", chip: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  HALF_DAY: { label: "Half Day", chip: "bg-sky-100 text-sky-700", dot: "bg-sky-500" },
};

export default async function StudentAttendancePage() {
  const session = await requireUser();
  if (session.user.role !== "STUDENT") redirect("/");

  const student = await db.query.students.findFirst({
    where: eq(students.userId, session.user.id),
  });
  if (!student) redirect("/student/dashboard");

  const rows = await db.query.attendance.findMany({
    where: eq(attendance.studentId, student.id),
    orderBy: [desc(attendance.date)],
    limit: 120,
  });

  const total = rows.length;
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const present = count("PRESENT");
  const halfDay = count("HALF_DAY");
  // Half day = 0.5 weight
  const pct = total > 0 ? Math.round(((present + halfDay * 0.5) / total) * 100) : null;

  // ── Calendar: current month (IST)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const byDate = new Map(rows.map((r) => [r.date, r.status]));
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);

  const cells: ({ day: number; date: string; status: string | null } | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
      return { day: i + 1, date, status: byDate.get(date) ?? null };
    }),
  ];

  const statCards = [
    { label: "Attendance", value: pct === null ? "—" : `${pct}%`, grad: "from-indigo-500 to-violet-600", icon: TrendingUp, sub: `${total} days marked` },
    { label: "Present", value: present, grad: "from-emerald-500 to-teal-600", icon: Check, sub: "full days" },
    { label: "Absent", value: count("ABSENT"), grad: "from-rose-500 to-red-600", icon: X, sub: "days" },
    { label: "Leave / Half", value: `${count("LEAVE")} / ${halfDay}`, grad: "from-amber-500 to-orange-600", icon: CalendarOff, sub: "days" },
  ];

  return (
    <div className="space-y-6">
      <Reveal>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">My Attendance</h2>
          <p className="text-sm text-slate-500">School ke marked records ke basis par (live)</p>
        </div>
      </Reveal>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c, i) => (
          <Reveal key={c.label} delay={70 + i * 70}>
            <div className="card-hover relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className={`absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-[0.12] blur-xl ${c.grad}`} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{c.label}</p>
                  <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">{c.value}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{c.sub}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${c.grad}`}>
                  <c.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Calendar */}
        <Reveal delay={120} className="lg:col-span-3">
          <Card className="card-hover h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="h-5 w-5 text-brand-600" />
                {now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </CardTitle>
              <CardDescription>Is mahine ka calendar view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="pb-1">{d}</div>
                ))}
                {cells.map((cell, i) =>
                  cell === null ? (
                    <div key={`e${i}`} />
                  ) : (
                    <div
                      key={cell.date}
                      title={cell.status ? META[cell.status].label : "Not marked"}
                      className={cn(
                        "flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition-all",
                        cell.status ? "text-white shadow-sm" : "text-slate-400 hover:bg-slate-50",
                        cell.status === "PRESENT" && "bg-emerald-500",
                        cell.status === "ABSENT" && "bg-rose-500",
                        cell.status === "LEAVE" && "bg-amber-500",
                        cell.status === "HALF_DAY" && "bg-sky-500",
                        cell.date === todayStr && "ring-2 ring-brand-500 ring-offset-1"
                      )}
                    >
                      {cell.day}
                    </div>
                  )
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
                {Object.values(META).map((m) => (
                  <span key={m.label} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${m.dot}`} /> {m.label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>

        {/* Recent list */}
        <Reveal delay={180} className="lg:col-span-2">
          <Card className="card-hover h-full">
            <CardHeader>
              <CardTitle className="text-base">Recent Records</CardTitle>
              <CardDescription>Latest {Math.min(10, rows.length)} marks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rows.slice(0, 10).map((r) => {
                  const m = META[r.status];
                  const d = new Date(r.date + "T00:00:00");
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3.5 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="h-3.5 w-3.5 text-slate-300" />
                        <span className="text-sm text-slate-700">
                          {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${m.chip}`}>{m.label}</span>
                    </div>
                  );
                })}
                {rows.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-400">
                    Abhi tak koi attendance mark nahi hui — school mark karega to yahan dikhegi
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
