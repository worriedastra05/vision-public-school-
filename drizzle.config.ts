import { defineConfig } from "drizzle-kit";

// Migrations ke liye DIRECT_URL (session pooler, port 5432) best hai —
// DDL statements transaction pooler par kabhi-kabhi atak jaati hain.
const remoteUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  ...(remoteUrl
    ? {
        // Hosted Postgres (Supabase/Neon)
        dbCredentials: { url: remoteUrl },
      }
    : {
        // Local dev fallback: embedded Postgres
        driver: "pglite",
        dbCredentials: { url: "./.pglite" },
      }),
});
