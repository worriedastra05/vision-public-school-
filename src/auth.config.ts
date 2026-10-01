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
