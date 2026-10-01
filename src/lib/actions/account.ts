"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { requireUser, logActivity } from "@/lib/guards";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "Password kam se kam 8 characters ka hona chahiye"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword);

/** Koi bhi role apna password change kar sakta hai (current password verify karke) */
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
