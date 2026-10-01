"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { attendance, students } from "@/db/schema";
import { requireRole, logActivity } from "@/lib/guards";

const recordSchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "LEAVE", "HALF_DAY"]),
});

const payloadSchema = z.object({
  classId: z.string().min(1),
  sectionId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  records: z.array(recordSchema).min(1),
});

/** Bulk attendance save — ek class+section+date ka poora sheet ek saath.
 *  Idempotent: us class/date ke purane records delete + fresh insert (transaction).
 *  Sirf usi class/section ke students accept hote hain (server-side verify). */
export async function saveAttendance(formData: FormData) {
  const session = await requireRole("ADMIN", "SUPERADMIN");

  let recordsJson: unknown;
  try {
    recordsJson = JSON.parse(String(formData.get("records") ?? "[]"));
  } catch {
    recordsJson = null;
  }

  const parsed = payloadSchema.safeParse({
    classId: formData.get("classId"),
    sectionId: formData.get("sectionId") || undefined,
    date: formData.get("date"),
    records: recordsJson,
  });

  const back = (extra: string) =>
    redirect(
      `/admin/attendance?${new URLSearchParams({
        date: String(formData.get("date") ?? ""),
        classId: String(formData.get("classId") ?? ""),
        sectionId: String(formData.get("sectionId") ?? ""),
        ...JSON.parse(extra),
      }).toString()}`
    );

  if (!parsed.success) return back('{"err":"Data sahi nahi hai"}');

  const { classId, sectionId, date, records } = parsed.data;

  // ── Server-side VERIFY: records ke student sirf is class/section ke hain
  const roster = await db
    .select({ id: students.id })
    .from(students)
    .where(
      sectionId
        ? and(eq(students.classId, classId), eq(students.sectionId, sectionId))
        : eq(students.classId, classId)
    );
  const validIds = new Set(roster.map((r) => r.id));
  const clean = records.filter((r) => validIds.has(r.studentId));
  if (clean.length === 0) return back('{"err":"Koi valid student nahi mila"}');

  // ── Idempotent save: purana delete + naya insert (ek transaction me)
  await db.transaction(async (tx) => {
    const ids = clean.map((r) => r.studentId);
    await tx
      .delete(attendance)
      .where(and(eq(attendance.classId, classId), eq(attendance.date, date), inArray(attendance.studentId, ids)));
    await tx.insert(attendance).values(
      clean.map((r) => ({
        studentId: r.studentId,
        classId,
        date,
        status: r.status,
        markedById: session.user.id,
      }))
    );
  });

  await logActivity(
    session.user.id,
    "ATTENDANCE_SAVED",
    `Attendance saved for class ${classId} on ${date} (${clean.length} students)`
  );

  revalidatePath("/admin/attendance");
  revalidatePath("/admin/dashboard");
  revalidatePath("/student/attendance");
  revalidatePath("/student/dashboard");
  return back(`{"saved":"${clean.length}"}`);
}
