import fs from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/**
 * 🗄️ Runtime migrations — production me drizzle-kit ke bina tables apply.
 *
 * Kaise kaam karta hai:
 *  - `drizzle/0000_*.sql` file ko `--> statement-breakpoint` par split karta hai
 *  - Har statement `db.execute(sql.raw(...))` se chalta hai
 *    (production postgres-js `prepare: false` → simple query protocol)
 *  - `42P07 / 42710 / already exists` errors ignore — idempotent
 *  - Applied files `_vps_migrations` table me record — dobara nahi chalte
 *
 * Vercel serverless me drizzle/ folder `outputFileTracingIncludes` se
 * function bundle me aata hai (next.config.ts).
 */

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

const IGNORE_ERRORS = [
  "42P07", // duplicate_table
  "42710", // duplicate_object (type/enum)
  "23505", // unique_violation (seed safety)
  "already exists",
  "duplicate key value",
];

function shouldIgnore(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message ?? err);
  return IGNORE_ERRORS.some((pat) => msg.includes(pat));
}

export interface MigrateResult {
  applied: string[];
  skipped: string[];
  statements: number;
}

/** Migration files run karo (jo pehle applied nahi hain). */
export async function runMigrations(): Promise<MigrateResult> {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  // Tracking table — khud idempotent
  await db.execute(sql.raw(
    `CREATE TABLE IF NOT EXISTS "_vps_migrations" (
      "name" text PRIMARY KEY,
      "appliedAt" timestamp DEFAULT now() NOT NULL
    )`
  ));

  const done = (await db.execute(sql.raw(`SELECT "name" FROM "_vps_migrations"`))) as unknown;
  // postgres-js: RowList(array-like) • pglite: { rows }
  const doneRows: Array<{ name: string }> = Array.isArray(done)
    ? (done as Array<{ name: string }>)
    : ((done as { rows?: Array<{ name: string }> }).rows ?? []);
  const doneNames = new Set(doneRows.map((r) => r.name));

  const applied: string[] = [];
  const skipped: string[] = [];
  let statements = 0;

  for (const file of files) {
    if (doneNames.has(file)) {
      skipped.push(file);
      continue;
    }

    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    const stmts = content
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const stmt of stmts) {
      try {
        await db.execute(sql.raw(stmt));
        statements++;
      } catch (err) {
        if (shouldIgnore(err)) {
          statements++;
          continue;
        }
        throw new Error(`Migration "${file}" failed on: ${stmt.slice(0, 120)}... — ${String(err)}`);
      }
    }

    try {
      await db.execute(
        sql.raw(`INSERT INTO "_vps_migrations" ("name") VALUES ('${file}')`)
      );
    } catch (err) {
      if (!shouldIgnore(err)) throw err;
    }
    applied.push(file);
  }

  return { applied, skipped, statements };
}
