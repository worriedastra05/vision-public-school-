import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  attendance, classes, exams, feePayments, students, subjects, teachers,
} from "@/db/schema";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScrollText, GraduationCap, Users, BookOpen, Wallet, ClipboardCheck, FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requireRole("SUPERADMIN");

  const today = new Date().toISOString().slice(0, 10);

  const [
    studentCount, teacherCount, classCount, subjectCount, examCount, receiptCount,
    perClass, monthlyFees, totalFees, todayAtt,
  ] = await Promise.all([
    db.$count(students),
    db.$count(teachers),
    db.$count(classes),
    db.$count(subjects),
    db.$count(exams),
    db.$count(feePayments),
    // Students per class
    db
      .select({ classId: students.classId, n: sql<number>`count(*)::int` })
      .from(students)
      .groupBy(students.classId),
    // Fee collection per month (last 6)
    db
      .select({
        month: sql<string>`to_char(${feePayments.date}, 'YYYY-MM')`,
        total: sql<string>`coalesce(sum(${feePayments.amount}), 0)`,
        n: sql<number>`count(*)::int`,
      })
      .from(feePayments)
      .groupBy(sql`to_char(${feePayments.date}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${feePayments.date}, 'YYYY-MM') desc`)
      .limit(6),
    // All-time fee collection
    db
      .select({ total: sql<string>`coalesce(sum(${feePayments.amount}), 0)` })
      .from(feePayments),
    // Today's attendance
    db
      .select({
        status: attendance.status,
        n: sql<number>`count(*)::int`,
      })
      .from(attendance)
      .where(eq(attendance.date, today))
      .groupBy(attendance.status),
  ]);

  const classRows = await db.query.classes.findMany({ orderBy: (c, { asc: a }) => [a(c.name)] });
  const className = (id: string) => classRows.find((c) => c.id === id)?.name ?? "?";
  const maxPerClass = Math.max(1, ...perClass.map((c) => c.n));

  const feesByMonth = [...monthlyFees].reverse();
  const maxMonth = Math.max(1, ...feesByMonth.map((m) => Number(m.total)));
  const collected = Number(totalFees[0]?.total ?? 0);

  const present = todayAtt.find((t) => t.status === "PRESENT")?.n ?? 0;
  const absent = todayAtt.find((t) => t.status === "ABSENT")?.n ?? 0;
  const attTotal = present + absent;
  const attPct = attTotal ? Math.round((present / attTotal) * 100) : null;

  const published = await db.$count(exams, eq(exams.isPublished, true));

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25">
            <ScrollText className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">System Reports</h1>
            <p className="text-sm text-slate-500">Poore school ki health ek nazar me — live database se.</p>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={studentCount} icon={GraduationCap} accent="indigo" delay={50} />
        <StatCard label="Teachers" value={teacherCount} icon={Users} accent="sky" delay={100} />
        <StatCard label="Classes / Subjects" value={`${classCount} / ${subjectCount}`} icon={BookOpen} accent="amber" delay={150} />
        <StatCard
          label="Total Fee Collected"
          value={`₹${collected.toLocaleString("en-IN")}`}
          icon={Wallet}
          accent="emerald"
          delay={200}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Students per class ── */}
        <Reveal delay={260}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4.5 w-4.5 text-indigo-500" /> Students per Class
              </CardTitle>
              <CardDescription>Har class me kitne bachche admission liye hue hain.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {perClass.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                  Abhi koi student nahi.
                </p>
              )}
              {perClass.map((c) => (
                <div key={c.classId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{className(c.classId)}</span>
                    <span className="font-bold tabular-nums text-slate-900">{c.n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                      style={{ width: `${(c.n / maxPerClass) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>

        {/* ── Fee collection by month ── */}
        <Reveal delay={320}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-4.5 w-4.5 text-emerald-500" /> Fee Collection (recent months)
              </CardTitle>
              <CardDescription>{receiptCount} receipts all-time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {feesByMonth.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                  Abhi koi payment nahi hui.
                </p>
              )}
              {feesByMonth.map((m) => {
                const label = new Date(m.month + "-01").toLocaleDateString("en-IN", { month: "short", year: "numeric" });
                return (
                  <div key={m.month} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        {label} <span className="text-slate-400">({m.n} receipts)</span>
                      </span>
                      <span className="font-bold tabular-nums text-emerald-700">
                        ₹{Number(m.total).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                        style={{ width: `${(Number(m.total) / maxMonth) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </Reveal>

        {/* ── Attendance today ── */}
        <Reveal delay={380}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="h-4.5 w-4.5 text-sky-500" /> Aaj ki Attendance
              </CardTitle>
              <CardDescription>
                {attTotal === 0 ? "Aaj abhi mark nahi hui." : `${attTotal} students mark hue.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attTotal === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                  Admin Attendance section se roz mark karta hai.
                </p>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="relative flex h-28 w-28 items-center justify-center">
                    <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" className="stroke-slate-100" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none" strokeWidth="3.5" strokeLinecap="round"
                        className="stroke-emerald-500 transition-all duration-1000"
                        strokeDasharray={`${attPct ?? 0} 100`}
                      />
                    </svg>
                    <span className="absolute text-xl font-bold text-slate-900">{attPct}%</span>
                  </div>
                  <div className="space-y-2">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Present: {present}</Badge>
                    <br />
                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Absent: {absent}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>

        {/* ── Exams overview ── */}
        <Reveal delay={440}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4.5 w-4.5 text-amber-500" /> Exams & Results
              </CardTitle>
              <CardDescription>Publish hokkar hi students ke report card me dikhte hain.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <span className="text-sm font-medium text-slate-600">Total exams created</span>
                <span className="text-lg font-bold tabular-nums text-slate-900">{examCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                <span className="text-sm font-medium text-emerald-700">Published (students ko dikh rahe)</span>
                <span className="text-lg font-bold tabular-nums text-emerald-700">{published}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                <span className="text-sm font-medium text-amber-700">Unpublished (draft)</span>
                <span className="text-lg font-bold tabular-nums text-amber-700">{examCount - published}</span>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
