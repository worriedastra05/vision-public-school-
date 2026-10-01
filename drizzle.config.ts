import { defineConfig } from "drizzle-kit";

const useRemoteDb = !!process.env.DATABASE_URL;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  ...(useRemoteDb
    ? {
        // Production: Neon / koi bhi hosted Postgres
        dbCredentials: { url: process.env.DATABASE_URL! },
      }
    : {
        // Local dev: embedded Postgres (koi server install karne ki zaroorat nahi)
        driver: "pglite",
        dbCredentials: { url: "./.pglite" },
      }),
});
