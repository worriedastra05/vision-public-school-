import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { activityLogs, type Role } from "@/db/schema";

/**
 * 🛡️ Server-side role guard — har server action / page par role DOBARA verify.
 * "Frontend me button chhupana == security" — NAHI. Ye asli security hai.
 */
export async function requireRole(...roles: Role[]) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!roles.includes(session.user.role)) {
    redirect("/"); // apne dashboard par wapas
  }
  return session;
}

/** Student/Admin/Superadmin — koi bhi logged-in user */
export async function requireUser() {
  const session = await auth();
  if (!session) redirect("/login");
  return session;
}

/** Superadmin ke Activity Logs me entry — kabhi flow ko break nahi karta */
export async function logActivity(userId: string | null, action: string, details?: string) {
  try {
    await db.insert(activityLogs).values({ userId, action, details: details ?? null });
  } catch {
    // logging failure se user flow kabhi nahi tootna chahiye
  }
}
