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
  name: z.string().trim().min(2, "Naam kam az kam 2 letters ka ho").max(80),
  email: z.string().trim().toLowerCase().email("Sahi email likho"),
  password: z.string().min(8, "Password kam az kam 8 characters ka ho").max(100),
});

/** Superadmin naya ADMIN account banata hai */
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
    redirect("/superadmin/admins?err=" + encodeURIComponent("Ye email pehle se registered hai"));
  }

  const hashed = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email, password: hashed, role: "ADMIN", isActive: true });

  await logActivity(session.user.id, "admin.create", `Naya admin banaya: ${name} <${email}>`);
  revalidatePath("/superadmin/admins");
  redirect(`/superadmin/admins?ok=${encodeURIComponent(`Admin "${name}" ban gaya — credentials bhej dijiye`)}`);
}

/** Admin ko activate / deactivate (soft-disable) karo */
export async function toggleAdminActive(formData: FormData) {
  const session = await requireRole("SUPERADMIN");
  const id = String(formData.get("adminId") ?? "");

  const admin = await db.query.users.findFirst({
    where: and(eq(users.id, id), eq(users.role, "ADMIN")),
  });
  if (!admin) redirect("/superadmin/admins?err=" + encodeURIComponent("Admin nahi mila"));

  const next = !admin.isActive;
  await db.update(users).set({ isActive: next }).where(eq(users.id, id));

  await logActivity(
    session.user.id,
    next ? "admin.activate" : "admin.deactivate",
    `${admin.name} <${admin.email}> — ${next ? "activate" : "DEACTIVATE"} kiya`
  );
  revalidatePath("/superadmin/admins");
  redirect(
    `/superadmin/admins?ok=${encodeURIComponent(
      next ? `${admin.name} phir se active hai` : `${admin.name} ka access band kar diya`
    )}`
  );
}

/** Admin ka password reset — naya password ek baar dikhata hai */
export async function resetAdminPassword(formData: FormData) {
  const session = await requireRole("SUPERADMIN");
  const id = String(formData.get("adminId") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (newPassword.length < 8) {
    redirect("/superadmin/admins?err=" + encodeURIComponent("Naya password kam az kam 8 characters ka ho"));
  }

  const admin = await db.query.users.findFirst({
    where: and(eq(users.id, id), eq(users.role, "ADMIN")),
  });
  if (!admin) redirect("/superadmin/admins?err=" + encodeURIComponent("Admin nahi mila"));

  const password = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ password }).where(eq(users.id, id));

  await logActivity(session.user.id, "admin.reset-password", `${admin.name} <${admin.email}> ka password reset kiya`);
  revalidatePath("/superadmin/admins");
  redirect(`/superadmin/admins?ok=${encodeURIComponent(`${admin.name} ka password reset ho gaya`)}`);
}
