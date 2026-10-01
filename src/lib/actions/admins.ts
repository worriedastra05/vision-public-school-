"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { requireRole, logActivity } from "@/lib/guards";

const adminSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 letters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

/** The super admin creates a new ADMIN account */
export async function createAdmin(formData: FormData) {
  const session = await requireRole("SUPERADMIN");

  const parsed = adminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect(`/superadmin/admins?err=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }
  const { name, email, password } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    redirect("/superadmin/admins?err=" + encodeURIComponent("This email is already registered"));
  }

  const hashed = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email, password: hashed, role: "ADMIN", isActive: true });

  await logActivity(session.user.id, "admin.create", `Admin created: ${name} <${email}>`);
  revalidatePath("/superadmin/admins");
  redirect(`/superadmin/admins?ok=${encodeURIComponent(`Admin "${name}" created — please share the credentials`)}`);
}

/** Activate / deactivate (soft-disable) an admin */
export async function toggleAdminActive(formData: FormData) {
  const session = await requireRole("SUPERADMIN");
  const id = String(formData.get("adminId") ?? "");

  const admin = await db.query.users.findFirst({
    where: and(eq(users.id, id), eq(users.role, "ADMIN")),
  });
  if (!admin) redirect("/superadmin/admins?err=" + encodeURIComponent("Admin not found"));

  const next = !admin.isActive;
  await db.update(users).set({ isActive: next }).where(eq(users.id, id));

  await logActivity(
    session.user.id,
    next ? "admin.activate" : "admin.deactivate",
    `${admin.name} <${admin.email}> — ${next ? "activated" : "DEACTIVATED"}`
  );
  revalidatePath("/superadmin/admins");
  redirect(
    `/superadmin/admins?ok=${encodeURIComponent(
      next ? `${admin.name} is active again` : `Access disabled for ${admin.name}`
    )}`
  );
}

/** Reset an admin password — the new password is shown once */
export async function resetAdminPassword(formData: FormData) {
  const session = await requireRole("SUPERADMIN");
  const id = String(formData.get("adminId") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (newPassword.length < 8) {
    redirect("/superadmin/admins?err=" + encodeURIComponent("New password must be at least 8 characters"));
  }

  const admin = await db.query.users.findFirst({
    where: and(eq(users.id, id), eq(users.role, "ADMIN")),
  });
  if (!admin) redirect("/superadmin/admins?err=" + encodeURIComponent("Admin not found"));

  const password = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ password }).where(eq(users.id, id));

  await logActivity(session.user.id, "admin.reset-password", `Password reset for ${admin.name} <${admin.email}>`);
  revalidatePath("/superadmin/admins");
  redirect(`/superadmin/admins?ok=${encodeURIComponent(`Password reset for ${admin.name}`)}`);
}
