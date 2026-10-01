import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

export type DB = PostgresJsDatabase<typeof schema>;

/**
 * Database connection strategy:
 *
 *  - Production (Vercel/Neon):  DATABASE_URL set hai → postgres-js se connect
 *  - Local dev (no setup):      DATABASE_URL nahi hai → PGlite (embedded Postgres,
 *                               data ./.pglite folder me persist hota hai)
 *
 * Production me aapko SIRF ek env var (DATABASE_URL = Neon ka connection string)
 * set karni hai — code me koi change nahi!
 */
function createDb(): DB {
  if (process.env.DATABASE_URL) {
    // Supabase transaction pooler ke liye prepare: false zaroori hai
    // (Supabase docs ka recommended setting — Neon/direct Postgres par bhi safe hai)
    return drizzlePg(postgres(process.env.DATABASE_URL, { prepare: false }), { schema });
  }
  const client = new PGlite("./.pglite");
  return drizzlePglite(client, { schema }) as unknown as DB;
}

const globalForDb = globalThis as unknown as { db?: DB };

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
