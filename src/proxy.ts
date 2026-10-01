import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const ROLE_HOME: Record<string, string> = {
  SUPERADMIN: "/superadmin/dashboard",
  ADMIN: "/admin/dashboard",
  STUDENT: "/student/dashboard",
};

/**
 * 🛡️ Route Guard (Next.js 16 proxy convention — purana middleware.ts)
 *
 * Har request par role verify hota hai:
 *  - /superadmin/*  → sirf SUPERADMIN
 *  - /admin/*       → ADMIN ya SUPERADMIN (superadmin sab kar sakta hai)
 *  - /student/*     → sirf STUDENT
 *  - /login         → logged-in user ko uske dashboard par redirect
 *
 * Galat role se URL type karne par bhi access nahi milega —
 * user ko apne dashboard par wapas bhej diya jata hai.
 */
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const role = session?.user?.role;
  const home = role ? (ROLE_HOME[role] ?? "/login") : "/login";

  // Login page: already logged-in ho to apne dashboard bhejo
  if (nextUrl.pathname === "/login") {
    if (session) return NextResponse.redirect(new URL(home, nextUrl));
    return NextResponse.next();
  }

  // Bina login = login page par
  if (!session) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control (RBAC)
  if (nextUrl.pathname.startsWith("/superadmin") && role !== "SUPERADMIN") {
    return NextResponse.redirect(new URL(home, nextUrl));
  }
  if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.redirect(new URL(home, nextUrl));
  }
  if (nextUrl.pathname.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL(home, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/superadmin/:path*", "/admin/:path*", "/student/:path*", "/login"],
};
