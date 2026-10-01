"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { academicSessions, exams, marks, students, subjects } from "@/db/schema";
import { requireRole, logActivity } from "@/lib/guards";
import { gradeFor } from "@/lib/grades";

const MANAGERS = ["ADMIN", "SUPERADMIN"] as const;

const examSchema = z.object({
  name: z.string().trim().min(2).max(60),
  classId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
});

/** Naya exam create (draft state me; marks entry ke baad publish) */
export async function createExam(formData: FormData) {
  const session = await requireRole(...MANAGERS);

  const parsed = examSchema.safeParse({
    name: formData.get("name"),
    classId: formData.get("classId"),
    startDate: formData.get("startDate") || "",
    endDate: formData.get("endDate") || "",
  });
  if (!parsed.success) redirect("/admin/exams?err=Details sahi nahi hain");
  const { name, classId, startDate, endDate } = parsed.data;

  // Duplicate check (same class + similar name)
  const existing = await db.query.exams.findMany({ where: eq(exams.classId, classId) });
  if (existing.some((e) => e.name.trim().toLowerCase() === name.toLowerCase())) {
    redirect("/admin/exams?err=Is class me is naam ka exam pehle se hai");
  }

  // Active session auto-attach
  const active = await db.query.academicSessions.findFirst({ where: eq(academicSessions.isActive, true) });

  await db.insert(exams).values({
    name,
    classId,
    sessionId: active?.id ?? null,
    startDate: startDate ? new Date(startDate + "T00:00:00") : null,
    endDate: endDate ? new Date(endDate + "T00:00:00") : null,
    isPublished: false,
  });

  await logActivity(session.user.id, "EXAM_CREATED", `Exam "${name}" created`);
  revalidatePath("/admin/exams");
  redirect(`/admin/exams?created=${encodeURIComponent(name)}`);
}

/** Publish / unpublish result (students ko tabhi dikhta hai) */
export async function toggleExamPublished(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const id = String(formData.get("examId") ?? "");

  const exam = await db.query.exams.findFirst({ where: eq(exams.id, id) });
  if (!exam) redirect("/admin/exams?err=Exam nahi mila");

  await db.update(exams).set({ isPublished: !exam.isPublished }).where(eq(exams.id, id));
  await logActivity(session.user.id, exam.isPublished ? "RESULT_UNPUBLISHED" : "RESULT_PUBLISHED", `Exam "${exam.name}"`);
  revalidatePath("/admin/exams");
  revalidatePath("/student/report-card");
  revalidatePath("/student/dashboard");
  redirect(`/admin/exams?${exam.isPublished ? "unpub" : "pub"}=${encodeURIComponent(exam.name)}`);
}

/** Exam delete (marks bhi cascade delete honge) */
export async function deleteExam(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const id = String(formData.get("examId") ?? "");
  const exam = await db.query.exams.findFirst({ where: eq(exams.id, id) });
  if (!exam) redirect("/admin/exams?err=Exam nahi mila");

  await db.delete(exams).where(eq(exams.id, id));
  await logActivity(session.user.id, "EXAM_DELETED", `Exam "${exam.name}" deleted`);
  revalidatePath("/admin/exams");
  redirect(`/admin/exams?deleted=${encodeURIComponent(exam.name)}`);
}

// ── Marks entry ─────────────────────────────────────────────────────
const markRecord = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  marks: z.number().min(0),
});

/** Bulk marks save — ek exam ki poori sheet. Idempotent (delete+insert transaction).
 *  Student class ke hain ya nahi, subject class ke hain ya nahi — server verify. */
export async function saveMarks(formData: FormData) {
  const session = await requireRole(...MANAGERS);

  const examId = String(formData.get("examId") ?? "");
  const maxMarks = Number(formData.get("maxMarks") ?? "100");
  let raw: unknown = null;
  try {
    raw = JSON.parse(String(formData.get("records") ?? "[]"));
  } catch {
    raw = null;
  }

  if (!examId || !Number.isFinite(maxMarks) || maxMarks <= 0 || maxMarks > 1000) {
    redirect(`/admin/exams/${examId}/marks?err=Max marks sahi nahi hai`);
  }
  const recordsParsed = z.array(markRecord).safeParse(raw ?? []);
  if (!recordsParsed.success || recordsParsed.data.length === 0) {
    redirect(`/admin/exams/${examId}/marks?err=Koi marks nahi mile — kam se kam 1 entry karo`);
  }

  const exam = await db.query.exams.findFirst({
    where: eq(exams.id, examId),
    with: { class: { with: { students: { columns: { id: true } } } } },
  });
  if (!exam) redirect("/admin/exams?err=Exam nahi mila");
  if (exam.isPublished) redirect(`/admin/exams/${examId}/marks?err=Result PUBLISHED hai — edit ke liye pehle unpublish karo`);

  // Server-side verify: student isi class ke & subject isi class ke
  const validStudents = new Set(exam.class.students.map((s) => s.id));
  const classSubjects = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(eq(subjects.classId, exam.classId));
  const validSubjects = new Set(classSubjects.map((s) => s.id));

  const clean = recordsParsed.data.filter(
    (r) => validStudents.has(r.studentId) && validSubjects.has(r.subjectId) && r.marks <= maxMarks
  );
  if (clean.length === 0) {
    redirect(`/admin/exams/${examId}/marks?err=Valid entries nahi mili (marks ≤ ${maxMarks} check karo)`);
  }

  await db.transaction(async (tx) => {
    const sids = [...new Set(clean.map((r) => r.studentId))];
    const subids = [...new Set(clean.map((r) => r.subjectId))];
    await tx
      .delete(marks)
      .where(
        and(eq(marks.examId, examId), inArray(marks.studentId, sids), inArray(marks.subjectId, subids))
      );
    await tx.insert(marks).values(
      clean.map((r) => ({
        examId,
        studentId: r.studentId,
        subjectId: r.subjectId,
        marksObtained: String(r.marks),
        maxMarks: String(maxMarks),
        grade: gradeFor((r.marks / maxMarks) * 100),
      }))
    );
  });

  await logActivity(
    session.user.id,
    "MARKS_SAVED",
    `Marks saved for "${exam.name}" (${clean.length} entries)`
  );
  revalidatePath(`/admin/exams/${examId}/marks`);
  revalidatePath("/admin/exams");
  revalidatePath("/student/report-card");
  revalidatePath("/student/dashboard");
  redirect(`/admin/exams/${examId}/marks?saved=${clean.length}`);
}

/** Admin result view helper — subjects desc for stable columns */
export async function _noop() {
  void desc;
}
