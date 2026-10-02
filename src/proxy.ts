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
 * 🛡️ Route Guard (Next.js 16 proxy convention — former middleware.ts)
 *
 * Every request is role-verified:
 *  - /superadmin/*  → SUPERADMIN only
 *  - /admin/*       → ADMIN or SUPERADMIN (a super admin can do everything)
 *  - /student/*     → STUDENT only
 *  - /login         → logged-in users are redirected to their dashboard
 *
 * Typing a URL with the wrong role never grants access —
 * the user is simply sent back to their own dashboard.
 */
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const role = session?.user?.role;
  const home = role ? (ROLE_HOME[role] ?? "/login") : "/login";

  // Login page: already signed in? Send them to their dashboard
  if (nextUrl.pathname === "/login") {
    if (session) return NextResponse.redirect(new URL(home, nextUrl));
    return NextResponse.next();
  }

  // No session = login page
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
