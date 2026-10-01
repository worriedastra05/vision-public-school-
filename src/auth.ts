import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";
import { students, users, type Role } from "@/db/schema";

const credentialsSchema = z
  .object({
    identifier: z.string().optional(),
    email: z.string().optional(), // purane cached login page ke liye backward-compat
    password: z.string().min(1),
  })
  .refine((d) => (d.identifier ?? d.email ?? "").trim().length >= 3);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email ya Admission No", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const identifier = (parsed.data.identifier ?? parsed.data.email ?? "").trim();

        // ── Identifier EMAIL hai ya ADMISSION NUMBER? dono se login!
        // Student: "VPS20260001"  |  Admin/Superadmin: email
        let user:
          | { id: string; name: string; email: string; password: string; role: Role; isActive: boolean }
          | undefined;

        if (identifier.includes("@")) {
          user = await db.query.users.findFirst({
            where: eq(users.email, identifier.toLowerCase()),
          });
        } else {
          const student = await db.query.students.findFirst({
            where: eq(students.admissionNo, identifier.toUpperCase()),
          });
          if (student) {
            user = await db.query.users.findFirst({ where: eq(users.id, student.userId) });
          }
        }

        if (!user || !user.isActive) return null;

        const passwordValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!passwordValid) return null;

        // Session me role jayega (jwt callback ke through)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
