import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { runSeed } from "@/lib/seed-core";
import { runMigrations } from "@/lib/migrate";

/**
 * 🚀 One-time production bootstrap — DEPLOY ke baad sirf Ek baar open karo:
 *
 *   https://<app>.vercel.app/api/setup?secret=<AUTH_SECRET>
 *
 * Kya hota hai:
 *  1. Database tables ban jaati hain (runtime migrations — idempotent)
 *  2. Demo users + school data seed ho jata hai (agar users nahi hain)
 *
 * Security: sirf wahi chala sakta hai jiske paas AUTH_SECRET hai.
 */
async function handler(req: Request) {
  const url = new URL(req.url);
  const secret = req.headers.get("x-setup-secret") ?? url.searchParams.get("secret");

  if (!process.env.AUTH_SECRET || secret !== process.env.AUTH_SECRET) {
    return Response.json(
      { error: "Forbidden — galat ya missing secret. URL me ?secret=<AUTH_SECRET> lagao." },
      { status: 403 }
    );
  }

  try {
    // 1) Tables (idempotent)
    const migrations = await runMigrations();

    // 2) Seed (sirf jab users nahi hain)
    const existingUsers = await db.$count(users);
    let seedSteps: string[] = [];
    let seedMessage = "Database pehle se populated hai — seed skip (safe).";
    if (existingUsers === 0) {
      const { steps } = await runSeed();
      seedSteps = steps;
      seedMessage = "Seed complete! Demo users ban gaye.";
    }

    return Response.json({
      ok: true,
      message: "Setup complete — ab /login par jaao!",
      migrations: {
        applied: migrations.applied,
        alreadyApplied: migrations.skipped,
        statements: migrations.statements,
      },
      seed: { message: seedMessage, users: existingUsers || seedSteps.length, steps: seedSteps },
      next: "Login: superadmin@visionpublicschool.edu / Super@123",
    });
  } catch (err) {
    // Setup ke liye asli error dikhana OK hai (sirf secret-holder ko dikhta hai)
    return Response.json(
      { error: "Setup failed", details: String((err as Error)?.message ?? err) },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST };
