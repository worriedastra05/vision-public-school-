import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { runSeed } from "@/lib/seed-core";
import { runMigrations } from "@/lib/migrate";

/**
 * 🚀 One-time production bootstrap — open exactly ONCE after deploying:
 *
 *   https://<app>.vercel.app/api/setup?secret=<AUTH_SECRET>
 *
 * What happens:
 *  1. Database tables are created (runtime migrations — idempotent)
 *  2. Seed users + school data are inserted (only if no users exist)
 *
 * Security: only someone holding AUTH_SECRET can run this.
 */
async function handler(req: Request) {
  const url = new URL(req.url);
  const secret = req.headers.get("x-setup-secret") ?? url.searchParams.get("secret");

  if (!process.env.AUTH_SECRET || secret !== process.env.AUTH_SECRET) {
    return Response.json(
      { error: "Forbidden — wrong or missing secret. Add ?secret=<AUTH_SECRET> to the URL." },
      { status: 403 }
    );
  }

  try {
    // 1) Tables (idempotent)
    const migrations = await runMigrations();

    // 2) Seed (only when no users exist)
    const existingUsers = await db.$count(users);
    let seedSteps: string[] = [];
    let seedMessage = "Database is already populated — seed skipped (safe).";
    if (existingUsers === 0) {
      const { steps } = await runSeed();
      seedSteps = steps;
      seedMessage = "Seed complete! Default users created.";
    }

    return Response.json({
      ok: true,
      message: "Setup complete — head to /login!",
      migrations: {
        applied: migrations.applied,
        alreadyApplied: migrations.skipped,
        statements: migrations.statements,
      },
      seed: { message: seedMessage, users: existingUsers || seedSteps.length, steps: seedSteps },
      next: "Sign in: superadmin@visionpublicschool.com / Super@123",
    });
  } catch (err) {
    // Showing the real error here is fine (only the secret holder sees it)
    return Response.json(
      { error: "Setup failed", details: String((err as Error)?.message ?? err) },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST };
