"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { eq, like, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { teachers, users } from "@/db/schema";
import { requireRole, logActivity } from "@/lib/guards";

const MANAGERS: ("ADMIN" | "SUPERADMIN")[] = ["ADMIN", "SUPERADMIN"];

const teacherSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(15).optional().or(z.literal("")),
  qualification: z.string().max(120).optional().or(z.literal("")),
});

async function nextEmployeeId(): Promise<string> {
  const existing = await db.query.teachers.findMany({
    where: like(teachers.employeeId, "TCH-%"),
    columns: { employeeId: true },
    orderBy: [desc(teachers.employeeId)],
    limit: 1,
  });
  const last = existing[0]?.employeeId;
  const nextNum = last ? parseInt(last.slice(4), 10) + 1 : 1;
  return `TCH-${String(nextNum).padStart(3, "0")}`;
}

/**
 * Add a teacher — creates the record + a LOGIN-DISABLED account for now.
 * Once the teacher portal ships, an admin can activate the login.
 */
export async function createTeacher(formData: FormData) {
  const session = await requireRole(...MANAGERS);

  const parsed = teacherSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect("/admin/teachers/new?err=" + encodeURIComponent("The form data is invalid"));
  }
  const d = parsed.data;

  const employeeId = await nextEmployeeId();
  const email = `${employeeId.toLowerCase().replace("-", "")}@teacher.visionpublicschool.com`;

  try {
    await db.transaction(async (tx) => {
      // random password (nobody knows it; the account stays inactive)
      const [user] = await tx
        .insert(users)
        .values({
          name: d.name.trim(),
          email,
          password: await bcrypt.hash(crypto.randomUUID(), 10),
          role: "TEACHER",
          isActive: false, // activated later when the teacher portal ships
        })
        .returning();

      await tx.insert(teachers).values({
        userId: user.id,
        employeeId,
        qualification: d.qualification || null,
        phone: d.phone || null,
      });
    });
  } catch (e) {
    console.error("createTeacher failed:", e);
    redirect("/admin/teachers/new?err=" + encodeURIComponent("The teacher could not be added. Please try again."));
  }

  await logActivity(session.user.id, "TEACHER_ADDED", `${d.name} → ${employeeId}`);
  revalidatePath("/admin/teachers");
  redirect("/admin/teachers?created=" + encodeURIComponent(d.name));
}

export async function toggleTeacherActive(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const teacherId = String(formData.get("id") ?? "");
  const teacher = await db.query.teachers.findFirst({
    where: eq(teachers.id, teacherId),
    with: { user: true },
  });
  if (!teacher) redirect("/admin/teachers");

  await db
    .update(users)
    .set({ isActive: !teacher.user.isActive, updatedAt: new Date() })
    .where(eq(users.id, teacher.userId));

  await logActivity(
    session.user.id,
    teacher.user.isActive ? "TEACHER_DEACTIVATED" : "TEACHER_ACTIVATED",
    teacher.employeeId
  );
  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}

export async function deleteTeacher(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const teacherId = String(formData.get("id") ?? "");
  const teacher = await db.query.teachers.findFirst({ where: eq(teachers.id, teacherId) });
  if (!teacher) redirect("/admin/teachers");

  // Deleting the user cascade-deletes the teacher record
  await db.delete(users).where(eq(users.id, teacher.userId));
  await logActivity(session.user.id, "TEACHER_DELETED", teacher.employeeId);
  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}
