import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

export type DB = PostgresJsDatabase<typeof schema>;

/**
 * Database connection strategy:
 *
 *  - Production (Vercel/Neon):  DATABASE_URL is set → connect via postgres-js
 *  - Local dev (no setup):      no DATABASE_URL → PGlite (embedded Postgres,
 *                               data persists in ./.pglite)
 *
 * IMPORTANT — LAZY singleton: the connection is created on the FIRST query only.
 * Creating it at module-import time would let `next build` open PGlite too
 * (route modules get imported) → two processes, corrupt data dir.
 */
function createDb(): DB {
  if (process.env.DATABASE_URL) {
    // prepare: false is required for transaction-mode poolers (Supabase/Neon).
    // Pool tuned for serverless: modest ceiling, quick idle recycle, fast
    // connection timeout so cold starts fail fast instead of hanging.
    return drizzlePg(
      postgres(process.env.DATABASE_URL, {
        prepare: false,
        max: 20, // max connections in the pool
        idle_timeout: 20, // seconds an idle connection lives before closing
        connect_timeout: 10, // seconds to wait while acquiring a connection
      }),
      { schema }
    );
  }
  const client = new PGlite("./.pglite");
  return drizzlePglite(client, { schema }) as unknown as DB;
}

const globalForDb = globalThis as unknown as { db?: DB };

function getDb(): DB {
  if (!globalForDb.db) globalForDb.db = createDb();
  return globalForDb.db;
}

/** Lazy proxy — `db.query...` / `db.transaction...` initialise on first call */
export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
