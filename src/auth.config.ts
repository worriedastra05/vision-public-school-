import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/db/schema";

/**
 * Edge-safe auth config — NO database / bcrypt imports here.
 * proxy.ts (route guard) isko use karta hai; providers auth.ts me add hote hain.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  /**
   * Preview iframe / embedded contexts me third-party cookies block hoti hain
   * (SameSite=Lax POST par nahi jaati → MissingCSRF). SameSite=None + Secure
   * iframe/Vercel dono jagah kaam karta hai (sab https hai).
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
  providers: [], // Credentials provider auth.ts me (Node runtime) jata hai
} satisfies NextAuthConfig;
