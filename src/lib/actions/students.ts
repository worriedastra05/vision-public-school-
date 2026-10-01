"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq, like, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { classes, sections, students, users } from "@/db/schema";
import { requireRole, logActivity } from "@/lib/guards";

const MANAGERS: ("ADMIN" | "SUPERADMIN")[] = ["ADMIN", "SUPERADMIN"];

const admissionSchema = z.object({
  name: z.string().min(2).max(80),
  fatherName: z.string().max(80).optional().or(z.literal("")),
  motherName: z.string().max(80).optional().or(z.literal("")),
  parentPhone: z.string().max(15).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
  bloodGroup: z.string().max(5).optional().or(z.literal("")),
  classId: z.string().min(1, "Class select karna zaroori hai"),
  sectionId: z.string().optional().or(z.literal("")),
  rollNo: z.string().optional().or(z.literal("")),
  photo: z.string().optional().or(z.literal("")),
});

/** Next admission number: VPS<sessionYear><4-digit counter> */
async function nextAdmissionNo(): Promise<string> {
  const year = "2026"; // active session year (Phase 8 me dynamic hoga)
  const prefix = `VPS${year}`;
  const existing = await db.query.students.findMany({
    where: like(students.admissionNo, `${prefix}%`),
    columns: { admissionNo: true },
    orderBy: [desc(students.admissionNo)],
    limit: 1,
  });
  const last = existing[0]?.admissionNo;
  const nextNum = last ? parseInt(last.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}

/**
 * 🎓 Student Admission — ek form se DO cheezein banti hain:
 * 1. Student profile
 * 2. Student ka LOGIN (email = system-generated, temp password = ek baar dikhta hai)
 */
export async function createStudent(formData: FormData) {
  const session = await requireRole(...MANAGERS);

  const parsed = admissionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect("/admin/students/new?err=" + encodeURIComponent("Form data sahi nahi hai — sab fields check karein"));
  }
  const d = parsed.data;

  // Section apni hi class ka hona chahiye
  if (d.sectionId) {
    const sec = await db.query.sections.findFirst({ where: eq(sections.id, d.sectionId) });
    if (!sec || sec.classId !== d.classId) {
      redirect("/admin/students/new?err=" + encodeURIComponent("Section us class ka nahi hai"));
    }
  }

  const classRow = await db.query.classes.findFirst({ where: eq(classes.id, d.classId) });
  if (!classRow) redirect("/admin/students/new?err=" + encodeURIComponent("Class nahi mili"));

  const admissionNo = await nextAdmissionNo();
  const email = `${admissionNo.toLowerCase()}@student.visionpublicschool.edu`;
  const tempPassword = `Vps@${crypto.randomInt(1000, 9999)}`;

  let studentId = "";
  try {
    studentId = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          name: d.name.trim(),
          email,
          password: await bcrypt.hash(tempPassword, 10),
          role: "STUDENT",
        })
        .returning();

      const [stu] = await tx
        .insert(students)
        .values({
          userId: user.id,
          admissionNo,
          classId: d.classId,
          sectionId: d.sectionId || null,
          rollNo: d.rollNo ? parseInt(d.rollNo, 10) : null,
          dob: d.dob ? new Date(d.dob) : null,
          gender: (d.gender || null) as "MALE" | "FEMALE" | "OTHER" | null,
          bloodGroup: d.bloodGroup || null,
          photo: d.photo || null,
          address: d.address || null,
          fatherName: d.fatherName || null,
          motherName: d.motherName || null,
          parentPhone: d.parentPhone || null,
        })
        .returning();
      return stu.id;
    });
  } catch (e) {
    console.error("createStudent failed:", e);
    redirect("/admin/students/new?err=" + encodeURIComponent("Admission fail ho gaya. Dobara try karein."));
  }

  await logActivity(session.user.id, "STUDENT_ADMITTED", `${d.name} → ${admissionNo} (${classRow.name})`);
  revalidatePath("/admin/students");
  // tempPassword sirf is ek redirect ke through ek baar dikhta hai
  redirect(`/admin/students/${studentId}?temp=${encodeURIComponent(tempPassword)}&new=1`);
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(80),
  classId: z.string().min(1),
  sectionId: z.string().optional().or(z.literal("")),
  rollNo: z.string().optional().or(z.literal("")),
  parentPhone: z.string().max(15).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  fatherName: z.string().max(80).optional().or(z.literal("")),
  motherName: z.string().max(80).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
  bloodGroup: z.string().max(5).optional().or(z.literal("")),
});

export async function updateStudent(formData: FormData) {
  await requireRole(...MANAGERS);
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/students?err=" + encodeURIComponent("Update data invalid hai"));
  const d = parsed.data;

  if (d.sectionId) {
    const sec = await db.query.sections.findFirst({ where: eq(sections.id, d.sectionId) });
    if (!sec || sec.classId !== d.classId) {
      redirect(`/admin/students/${d.id}?err=` + encodeURIComponent("Section us class ka nahi hai"));
    }
  }

  const student = await db.query.students.findFirst({ where: eq(students.id, d.id) });
  if (!student) redirect("/admin/students");

  await db.transaction(async (tx) => {
    await tx.update(users).set({ name: d.name.trim(), updatedAt: new Date() }).where(eq(users.id, student.userId));
    await tx
      .update(students)
      .set({
        classId: d.classId,
        sectionId: d.sectionId || null,
        rollNo: d.rollNo ? parseInt(d.rollNo, 10) : null,
        parentPhone: d.parentPhone || null,
        address: d.address || null,
        fatherName: d.fatherName || null,
        motherName: d.motherName || null,
        dob: d.dob ? new Date(d.dob) : null,
        gender: (d.gender || null) as "MALE" | "FEMALE" | "OTHER" | null,
        bloodGroup: d.bloodGroup || null,
      })
      .where(eq(students.id, d.id));
  });

  revalidatePath("/admin/students");
  redirect(`/admin/students/${d.id}?updated=1`);
}

/** 🔑 Student ka password reset — naya temp password ek baar dikhta hai */
export async function resetStudentPassword(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const studentId = String(formData.get("id") ?? "");
  const student = await db.query.students.findFirst({ where: eq(students.id, studentId) });
  if (!student) redirect("/admin/students");

  const tempPassword = `Vps@${crypto.randomInt(1000, 9999)}`;
  await db
    .update(users)
    .set({ password: await bcrypt.hash(tempPassword, 10), updatedAt: new Date() })
    .where(eq(users.id, student.userId));

  await logActivity(session.user.id, "STUDENT_PWD_RESET", `Password reset → ${student.admissionNo}`);
  redirect(`/admin/students/${studentId}?temp=${encodeURIComponent(tempPassword)}&reset=1`);
}

/** Student login enable/disable (delete nahi — safe deactivate) */
export async function toggleStudentActive(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const studentId = String(formData.get("id") ?? "");
  const student = await db.query.students.findFirst({
    where: eq(students.id, studentId),
    with: { user: true },
  });
  if (!student) redirect("/admin/students");

  await db
    .update(users)
    .set({ isActive: !student.user.isActive, updatedAt: new Date() })
    .where(eq(users.id, student.userId));

  await logActivity(
    session.user.id,
    student.user.isActive ? "STUDENT_DEACTIVATED" : "STUDENT_ACTIVATED",
    student.admissionNo
  );
  revalidatePath("/admin/students");
  redirect(`/admin/students/${studentId}`);
}
