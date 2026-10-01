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
 * IMPORTANT — LAZY singleton: connection SIRF pehli query par banta hai.
 * Agar module import par banaya to `next build` bhi PGlite open kar leta
 * (route modules import hote hain) → do processes, corrupt data dir.
 */
function createDb(): DB {
  if (process.env.DATABASE_URL) {
    // Supabase transaction pooler ke liye prepare: false zaroori hai
    return drizzlePg(postgres(process.env.DATABASE_URL, { prepare: false }), { schema });
  }
  const client = new PGlite("./.pglite");
  return drizzlePglite(client, { schema }) as unknown as DB;
}

const globalForDb = globalThis as unknown as { db?: DB };

function getDb(): DB {
  if (!globalForDb.db) globalForDb.db = createDb();
  return globalForDb.db;
}

/** Lazy proxy — `db.query...` / `db.transaction...` sab pehli call par init karta hai */
export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
