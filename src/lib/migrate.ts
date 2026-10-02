import fs from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/**
 * 🗄️ Runtime migrations — apply tables in production without drizzle-kit.
 *
 * How it works:
 *  - `drizzle/0000_*.sql` files are split on `--> statement-breakpoint`
 *  - Every statement runs via `db.execute(sql.raw(...))`
 *    (production postgres-js `prepare: false` → simple query protocol)
 *  - `42P07 / 42710 / already exists` errors are ignored — idempotent
 *  - Applied files are recorded in the `_vps_migrations` table — never re-run
 *
 * On Vercel serverless the drizzle/ folder is bundled into the function via
 * `outputFileTracingIncludes` (next.config.ts).
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

/** Run migration files that have not been applied yet. */
export async function runMigrations(): Promise<MigrateResult> {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  // Tracking table — itself idempotent
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
