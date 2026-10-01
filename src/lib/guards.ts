import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { activityLogs, type Role } from "@/db/schema";

/**
 * 🛡️ Server-side role guard — the role is re-verified on every server action / page.
 * "Hiding a button on the frontend == security" — NO. This is the real security.
 */
export async function requireRole(...roles: Role[]) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!roles.includes(session.user.role)) {
    redirect("/"); // back to their own dashboard
  }
  return session;
}

/** Student/Admin/Superadmin — any logged-in user */
export async function requireUser() {
  const session = await auth();
  if (!session) redirect("/login");
  return session;
}

/** Writes an entry to the super admin Activity Logs — never breaks the flow */
export async function logActivity(userId: string | null, action: string, details?: string) {
  try {
    await db.insert(activityLogs).values({ userId, action, details: details ?? null });
  } catch {
    // a logging failure must never break the user flow
  }
}
