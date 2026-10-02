import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/db/schema";

/**
 * Edge-safe auth config — NO database / bcrypt imports here.
 * proxy.ts (the route guard) uses this; providers are added in auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  /**
   * Preview iframes / embedded contexts block third-party cookies
   * (SameSite=Lax never survives a POST → MissingCSRF). SameSite=None + Secure
   * works in both iframe and Vercel contexts (everything is https).
   */
  cookies: {
    sessionToken: {
      name: "__Secure-authjs.session-token",
      options: { httpOnly: true, sameSite: "none" as const, path: "/", secure: true },
    },
    callbackUrl: {
      name: "__Secure-authjs.callback-url",
      options: { sameSite: "none" as const, path: "/", secure: true },
    },
    csrfToken: {
      name: "__Host-authjs.csrf-token",
      options: { httpOnly: true, sameSite: "none" as const, path: "/", secure: true },
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  providers: [], // The Credentials provider is added in auth.ts (Node runtime)
} satisfies NextAuthConfig;
