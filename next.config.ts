import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sandbox preview host (https://<port>-<sandbox>.e2b.app) ke cross-origin
  // dev requests allow karne ke liye
  allowedDevOrigins: ["*.e2b.app"],

  // Database drivers ko Next bundler se bahar rakhte hain — ye native
  // fs/URL APIs use karte hain jo bundling me toot jaati hain
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
};

export default nextConfig;
