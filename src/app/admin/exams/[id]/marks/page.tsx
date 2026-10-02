import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { exams, marks, students, subjects, users } from "@/db/schema";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarksSheet } from "@/components/exams/marks-sheet";
import { ArrowLeft, PenLine, BookOpen, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MarksEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { id } = await params;
  const { saved, err } = await searchParams;

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, id),
    with: { class: true, session: true },
  });
  if (!exam) notFound();

  const [roster, subjectRows, markRows] = await Promise.all([
    db
      .select({ id: students.id, name: users.name, rollNo: students.rollNo, admissionNo: students.admissionNo })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.classId, exam.classId))
      .orderBy(asc(students.rollNo), asc(students.admissionNo)),
    db.query.subjects.findMany({
      where: eq(subjects.classId, exam.classId),
      orderBy: (s, { asc }) => [asc(s.name)],
    }),
    db.query.marks.findMany({ where: eq(marks.examId, exam.id) }),
  ]);

  const existing = Object.fromEntries(
    markRows.map((m) => [`${m.studentId}:${m.subjectId}`, String(Number(m.marksObtained))])
  );
  const defaultMax = markRows.length > 0 ? Number(markRows[0].maxMarks) : 100;

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
                <PenLine className="h-5 w-5 text-brand-600" /> {exam.name} — Marks Entry
              </h2>
              <p className="text-sm text-slate-500">
                {exam.class.name} {exam.session ? `• ${exam.session.name}` : ""} • {roster.length} students •{" "}
                {subjectRows.length} subjects
              </p>
            </div>
          </div>
          <Badge variant={exam.isPublished ? "success" : "warning"} className="border-0 px-3 py-1">
            {exam.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </Reveal>

      {(saved || err) && (
        <Reveal>
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
              err ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {err ? <XCircle className="h-4.5 w-4.5" /> : <CheckCircle2 className="h-4.5 w-4.5" />}
            {err ?? `${saved} marks entries saved!`}
          </div>
        </Reveal>
      )}

      {exam.isPublished && (
        <Reveal>
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            The result is <strong>PUBLISHED</strong> and visible to students. To edit, first{" "}
            <strong>Unpublish</strong> it from the Exams page.
          </div>
        </Reveal>
      )}

      {subjectRows.length === 0 ? (
        <Reveal delay={80}>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              {exam.class.name} has no subjects — first{" "}
              <Link href="/admin/classes" className="font-semibold text-brand-600 hover:underline">
                add subjects from the Classes page
              </Link>
            </p>
          </div>
        </Reveal>
      ) : roster.length === 0 ? (
        <Reveal delay={80}>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">{exam.class.name} has no students</p>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={80}>
          <MarksSheet
            examId={exam.id}
            roster={roster}
            subjects={subjectRows.map((s) => ({ id: s.id, name: s.name }))}
            existing={existing}
            defaultMax={defaultMax}
            locked={exam.isPublished}
          />
        </Reveal>
      )}
    </div>
  );
}
