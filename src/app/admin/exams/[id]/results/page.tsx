import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { exams, students, subjects, users } from "@/db/schema";
import { requireRole } from "@/lib/guards";
import { gradeColor } from "@/lib/grades";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExamResultsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { id } = await params;

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, id),
    with: {
      class: true,
      session: true,
      marks: { with: { student: { with: { user: true } }, subject: true } },
    },
  });
  if (!exam) notFound();

  const subjectRows = await db.query.subjects.findMany({
    where: eq(subjects.classId, exam.classId),
    orderBy: (s, { asc }) => [asc(s.name)],
  });

  void asc; void students; void subjects; void users;

  // Group marks by student
  const byStudent = new Map<string, { name: string; admissionNo: string; cells: Map<string, { marks: number; max: number; grade: string | null }> }>();
  for (const m of exam.marks) {
    const g = byStudent.get(m.studentId) ?? {
      name: m.student.user.name,
      admissionNo: m.student.admissionNo,
      cells: new Map(),
    };
    g.cells.set(m.subjectId, { marks: Number(m.marksObtained), max: Number(m.maxMarks), grade: m.grade });
    byStudent.set(m.studentId, g);
  }

  const rows = [...byStudent.entries()].map(([sid, g]) => {
    let total = 0;
    let maxTotal = 0;
    for (const c of g.cells.values()) {
      total += c.marks;
      maxTotal += c.max;
    }
    const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
    return { sid, ...g, total, maxTotal, pct };
  });
  rows.sort((a, b) => b.pct - a.pct);

  const topper = rows[0];
  const avgPct = rows.length > 0 ? rows.reduce((s, r) => s + r.pct, 0) / rows.length : 0;

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/exams">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
            <div>
              <h2 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900">
                <BarChart3 className="h-5 w-5 text-brand-600" /> {exam.name} — Results
              </h2>
              <p className="text-sm text-slate-500">
                {exam.class.name} {exam.session ? `• ${exam.session.name}` : ""}
              </p>
            </div>
          </div>
          <Badge variant={exam.isPublished ? "success" : "warning"} className="border-0 px-3 py-1">
            {exam.isPublished ? "Published (visible to students)" : "Draft (hidden from students)"}
          </Badge>
        </div>
      </Reveal>

      {topper && (
        <Reveal delay={60}>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Class Topper</p>
              <p className="font-bold text-slate-900">
                {topper.name} <span className="font-mono text-xs text-slate-400">({topper.admissionNo})</span>
              </p>
            </div>
            <span className="ml-auto font-mono text-lg font-bold text-amber-700">{topper.pct.toFixed(1)}%</span>
            <span className="text-xs text-slate-500">• class avg {avgPct.toFixed(1)}%</span>
          </div>
        </Reveal>
      )}

      <Reveal delay={110}>
        <Card className="card-hover overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Marks Matrix (ranked)</CardTitle>
            <CardDescription>Marks of {rows.length} students</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left font-semibold">Rank</th>
                  <th className="sticky left-0 z-10 min-w-44 bg-slate-50 px-4 py-3 text-left font-semibold">Student</th>
                  {subjectRows.map((s) => (
                    <th key={s.id} className="min-w-24 px-2 py-3 text-center font-semibold">{s.name}</th>
                  ))}
                  <th className="min-w-20 px-3 py-3 text-center font-semibold">Total</th>
                  <th className="min-w-16 px-3 py-3 text-center font-semibold">%</th>
                  <th className="min-w-16 px-3 py-3 text-center font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={r.sid} className="transition-colors hover:bg-brand-50/50">
                    <td className="px-4 py-2.5 text-center font-mono text-xs text-slate-400">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5">
                      <p className="truncate text-sm font-medium text-slate-800">{r.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">{r.admissionNo}</p>
                    </td>
                    {subjectRows.map((s) => {
                      const c = r.cells.get(s.id);
                      return (
                        <td key={s.id} className="px-2 py-2.5 text-center">
                          {c ? (
                            <span className="font-mono text-sm font-semibold text-slate-700">
                              {c.marks}
                              <span className="text-[10px] text-slate-400">/{c.max}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 text-center font-mono text-sm font-bold text-slate-800">
                      {r.total}
                      <span className="text-[10px] font-normal text-slate-400">/{r.maxTotal}</span>
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-center font-mono text-sm font-bold",
                        r.pct >= 75 ? "text-emerald-600" : r.pct >= 40 ? "text-amber-600" : "text-rose-600"
                      )}
                    >
                      {r.pct.toFixed(1)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {(() => {
                        const g = r.pct >= 90 ? "A+" : r.pct >= 75 ? "A" : r.pct >= 60 ? "B" : r.pct >= 50 ? "C" : r.pct >= 40 ? "D" : r.pct >= 33 ? "E" : "F";
                        return (
                          <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold", gradeColor(g))}>{g}</span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <CardContent className="p-12 text-center">
              <p className="text-sm text-slate-400">No marks yet — enter marks first</p>
            </CardContent>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
