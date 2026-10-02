import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { exams, students } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { gradeColor, gradeFor, isPass } from "@/lib/grades";
import { Reveal } from "@/components/motion";
import { PrintButton } from "@/components/print-button";
import { FileText, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportCardPage() {
  const session = await requireUser();
  if (session.user.role !== "STUDENT") redirect("/");

  const student = await db.query.students.findFirst({
    where: eq(students.userId, session.user.id),
    with: { class: true, section: true },
  });
  if (!student) redirect("/student/dashboard");

  // Only PUBLISHED exams + own marks
  const examRows = await db.query.exams.findMany({
    where: (e, { and, eq }) => and(eq(e.classId, student.classId), eq(e.isPublished, true)),
    orderBy: [desc(exams.id)],
    with: {
      session: true,
      marks: {
        where: (m, { eq }) => eq(m.studentId, student.id),
        with: { subject: true },
      },
    },
  });

  const withMarks = examRows.filter((e) => e.marks.length > 0);

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">My Report Card</h2>
            <p className="text-sm text-slate-500">
              {student.class.name}
              {student.section ? ` • Section ${student.section.name}` : ""} — published results
            </p>
          </div>
          {withMarks.length > 0 && <PrintButton />}
        </div>
      </Reveal>

      {withMarks.length === 0 && (
        <Reveal delay={100}>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              No results published yet — they will appear here once school publishes them
            </p>
          </div>
        </Reveal>
      )}

      {withMarks.map((exam, i) => {
        const total = exam.marks.reduce((s, m) => s + Number(m.marksObtained), 0);
        const maxTotal = exam.marks.reduce((s, m) => s + Number(m.maxMarks), 0);
        const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
        const grade = gradeFor(pct);
        const pass = isPass(pct);

        return (
          <Reveal key={exam.id} delay={100 + i * 90}>
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-lg">
              {/* Header */}
              <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-brand-600/[0.06] to-violet-600/[0.06] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/30">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{exam.name}</h3>
                    <p className="text-xs text-slate-500">
                      {exam.session?.name ?? ""}
                      {exam.startDate &&
                        ` • ${exam.startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-bold",
                    pass ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  )}
                >
                  {pass ? "PASS ✓" : "FAIL"}
                </span>
              </div>

              {/* Subjects table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-6 py-2.5 text-left font-semibold">Subject</th>
                      <th className="px-4 py-2.5 text-center font-semibold">Marks</th>
                      <th className="px-4 py-2.5 text-center font-semibold">Out of</th>
                      <th className="px-4 py-2.5 text-center font-semibold">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {exam.marks
                      .sort((a, b) => a.subject.name.localeCompare(b.subject.name))
                      .map((m) => (
                        <tr key={m.id} className="transition-colors hover:bg-brand-50/50">
                          <td className="px-6 py-3 font-medium text-slate-700">{m.subject.name}</td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                            {Number(m.marksObtained)}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-slate-500">{Number(m.maxMarks)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold", gradeColor(m.grade))}>
                              {m.grade ?? gradeFor((Number(m.marksObtained) / Number(m.maxMarks)) * 100)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    {/* Total row */}
                    <tr className="bg-slate-50/80 font-bold">
                      <td className="px-6 py-3 text-slate-900">TOTAL</td>
                      <td className="px-4 py-3 text-center font-mono text-slate-900">{total}</td>
                      <td className="px-4 py-3 text-center font-mono text-slate-500">{maxTotal}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px]", gradeColor(grade))}>
                          {grade}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer strip */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-3 text-white">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 opacity-80" /> Overall Percentage
                </span>
                <span className="font-mono text-lg font-bold">{pct.toFixed(2)}%</span>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
