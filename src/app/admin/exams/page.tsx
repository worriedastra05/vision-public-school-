import Link from "next/link";
import { desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { exams, marks } from "@/db/schema";
import { createExam, toggleExamPublished, deleteExam } from "@/lib/actions/exams";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmit } from "@/components/forms/confirm-submit";
import {
  FileText,
  Plus,
  PenLine,
  BarChart3,
  Globe,
  EyeOff,
  Trash2,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; deleted?: string; pub?: string; unpub?: string; err?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { created, deleted, pub, unpub, err } = await searchParams;

  const [classRows, examRows, activeSession] = await Promise.all([
    db.query.classes.findMany({ orderBy: (c, { asc }) => [asc(c.name)], with: { students: { columns: { id: true } } } }),
    db.query.exams.findMany({
      orderBy: [desc(exams.id)],
      with: { class: { with: { students: { columns: { id: true } } } }, session: true },
    }),
    db.query.academicSessions.findFirst({ where: (s, { eq }) => eq(s.isActive, true) }),
  ]),
    markRows = examRows.length
      ? await db
          .select({ examId: marks.examId, studentId: marks.studentId, subjectId: marks.subjectId })
          .from(marks)
          .where(inArray(marks.examId, examRows.map((e) => e.id)))
      : [];

  // per-exam stats: subjects-with-marks coverage + students marked count
  const stats = new Map<string, { markedStudents: number; entries: number }>();
  for (const m of markRows) {
    const s = stats.get(m.examId) ?? { markedStudents: 0, entries: 0 };
    s.entries += 1;
    stats.set(m.examId, s);
  }
  const studentsMarked = new Map<string, number>();
  for (const e of examRows) {
    studentsMarked.set(e.id, new Set(markRows.filter((m) => m.examId === e.id).map((m) => m.studentId)).size);
  }

  const banner = err
    ? { ok: false, text: err }
    : created
      ? { ok: true, text: `Exam "${created}" created — enter marks, then publish` }
      : deleted
        ? { ok: true, text: `Exam "${deleted}" deleted` }
        : pub
          ? { ok: true, text: `"${pub}" PUBLISHED — students can now see their report cards!` }
          : unpub
            ? { ok: true, text: `"${unpub}" unpublished (hidden from students)` }
            : null;

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Exams & Results</h2>
            <p className="text-sm text-slate-500">
              {examRows.length} exams • session {activeSession?.name ?? "—"}
            </p>
          </div>
          {/* Create exam inline */}
          <form action={createExam} className="flex flex-wrap items-end gap-2 rounded-2xl border border-brand-100 bg-brand-50/60 p-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">Exam name</label>
              <Input name="name" placeholder="e.g. Half Yearly" className="w-40 bg-white" required minLength={2} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">Class</label>
              <Select name="classId" required defaultValue="" className="w-36 bg-white">
                <option value="" disabled>
                  Select...
                </option>
                {classRows.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">Start</label>
              <Input name="startDate" type="date" className="w-36 bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">End</label>
              <Input name="endDate" type="date" className="w-36 bg-white" />
            </div>
            <Button type="submit">
              <Plus className="h-4 w-4" /> Create
            </Button>
          </form>
        </div>
      </Reveal>

      {banner && (
        <Reveal>
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
              banner.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {banner.ok ? <CheckCircle2 className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
            {banner.text}
          </div>
        </Reveal>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {examRows.map((exam, i) => {
          const strength = exam.class.students.length;
          const marked = studentsMarked.get(exam.id) ?? 0;
          const entries = stats.get(exam.id)?.entries ?? 0;
          return (
            <Reveal key={exam.id} delay={90 + i * 70}>
              <Card className="card-hover h-full">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{exam.name}</CardTitle>
                      <CardDescription>
                        {exam.class.name} {exam.session ? `• ${exam.session.name}` : ""}
                        {(exam.startDate || exam.endDate) &&
                          ` • ${exam.startDate ? exam.startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}${
                            exam.endDate ? " – " + exam.endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""
                          }`}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={exam.isPublished ? "success" : "warning"}
                    className="border-0"
                  >
                    {exam.isPublished ? "Published" : "Draft"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  {/* Stats chips */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                      <Users className="h-3 w-3" /> {marked}/{strength} marked
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                      <PenLine className="h-3 w-3" /> {entries} entries
                    </span>
                    {(exam.startDate || exam.endDate) && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                        <CalendarDays className="h-3 w-3" />
                        {exam.startDate?.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                        {exam.endDate?.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5">
                    <Link href={`/admin/exams/${exam.id}/marks`}>
                      <Button size="sm">
                        <PenLine className="h-3.5 w-3.5" /> Marks Entry
                      </Button>
                    </Link>
                    <Link href={`/admin/exams/${exam.id}/results`}>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-3.5 w-3.5" /> Results
                      </Button>
                    </Link>
                    <form action={toggleExamPublished} className="inline">
                      <input type="hidden" name="examId" value={exam.id} />
                      <Button size="sm" variant={exam.isPublished ? "outline" : "default"}>
                        {exam.isPublished ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> Unpublish
                          </>
                        ) : (
                          <>
                            <Globe className="h-3.5 w-3.5" /> Publish
                          </>
                        )}
                      </Button>
                    </form>
                    <form action={deleteExam} className="inline">
                      <input type="hidden" name="examId" value={exam.id} />
                      <ConfirmSubmit
                        message={`Delete "${exam.name}"? All its marks entries will also be deleted.`}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </ConfirmSubmit>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>

      {examRows.length === 0 && (
        <Reveal delay={120}>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              No exams yet — create your first exam above (e.g. &quot;Half Yearly&quot;)
            </p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
