import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { runSeed } from "@/lib/seed-core";

/**
 * 🚀 One-time production bootstrap.
 *
 * Vercel par pehli deploy ke baad sirf Ek baar open karo (browser ya curl):
 *   GET  https://<app>.vercel.app/api/setup?secret=<AUTH_SECRET>
 *   POST https://<app>.vercel.app/api/setup   (header: x-setup-secret: <AUTH_SECRET>)
 *
 * - Secret (AUTH_SECRET) match nahi hua to 403
 * - Idempotent: users already hain to kuch nahi badlega
 * - Demo users banata hai: superadmin / admin / student
 */
async function handler(req: Request) {
  const url = new URL(req.url);
  const secret = req.headers.get("x-setup-secret") ?? url.searchParams.get("secret");

  if (!process.env.AUTH_SECRET || secret !== process.env.AUTH_SECRET) {
    return Response.json({ error: "Forbidden — galat ya missing secret" }, { status: 403 });
  }

  const existingUsers = await db.$count(users);
  if (existingUsers > 0) {
    return Response.json({
      ok: true,
      message: "Database pehle se seeded hai — kuch change nahi kiya.",
      users: existingUsers,
    });
  }

  const { steps } = await runSeed();
  return Response.json({
    ok: true,
    message: "Seed complete! Ab login kar sakte ho (demo creds README me).",
    steps,
  });
}

export { handler as GET, handler as POST };
