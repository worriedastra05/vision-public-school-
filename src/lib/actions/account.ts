"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { students, users } from "@/db/schema";
import { requireUser, logActivity } from "@/lib/guards";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword);

/** Any role can change their own password (current password is verified first) */
export async function changePassword(formData: FormData) {
  const session = await requireUser();

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) redirect("/profile?pwd=invalid");

  const { currentPassword, newPassword, confirmPassword } = parsed.data;
  if (newPassword !== confirmPassword) redirect("/profile?pwd=mismatch");

  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  if (!user) redirect("/login");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) redirect("/profile?pwd=wrong");

  await db
    .update(users)
    .set({ password: await bcrypt.hash(newPassword, 10), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  await logActivity(session.user.id, "PASSWORD_CHANGED", "User changed own password");
  redirect("/profile?pwd=ok");
}

/** Photo data URL — 350KB file ⇒ ~480k chars once base64-encoded. */
const photoSchema = z.string().max(500_000);

/**
 * Student self-service: update ONLY their own ID-card photo.
 * Session-guarded, role = STUDENT, and the record is looked up from the
 * session user id — a student can never touch anyone else's record.
 */
export async function updateMyPhoto(formData: FormData) {
  const session = await requireUser();
  if (session.user.role !== "STUDENT") redirect("/profile");

  const parsed = photoSchema.safeParse(formData.get("photo") ?? "");
  if (!parsed.success) redirect("/profile?photo=invalid");
  const photo = parsed.data.trim();
  if (photo && !/^data:image\/[a-z0-9.+-]+;base64,/i.test(photo)) {
    redirect("/profile?photo=invalid");
  }

  const student = await db.query.students.findFirst({
    where: eq(students.userId, session.user.id),
  });
  if (!student) redirect("/profile");

  await db
    .update(students)
    .set({ photo: photo || null })
    .where(eq(students.id, student.id));

  await logActivity(session.user.id, "STUDENT_PHOTO_UPDATED", student.admissionNo);
  revalidatePath("/profile");
  revalidatePath("/student/id-card");
  revalidatePath("/student/dashboard");
  redirect("/profile?photo=ok");
}
