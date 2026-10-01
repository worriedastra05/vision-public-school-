import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  academicSessions,
  classes,
  notices,
  sections,
  settings,
  students,
  subjects,
  users,
} from "@/db/schema";

/**
 * Idempotent seed — jitni baar chalao, data duplicate nahi hoga.
 * scripts/seed.ts (local) aur /api/setup (production first-run) dono isko use karte hain.
 */
export async function runSeed(): Promise<{ steps: string[] }> {
  const steps: string[] = [];

  // ── School Settings ──
  const settingsData: Record<string, string> = {
    school_name: "Vision Public School",
    school_address: "Main Road, Patna, Bihar 800001",
    school_phone: "+91 98765 43210",
    school_email: "info@visionpublicschool.edu",
    school_tagline: "Education • Discipline • Excellence",
    gradeFormula: "A+:90,A:80,B:70,C:60,D:40,F:0",
  };
  for (const [key, value] of Object.entries(settingsData)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
  steps.push("settings");

  // ── Academic Session ──
  const existingSession = await db.query.academicSessions.findFirst({
    where: eq(academicSessions.name, "2026-27"),
  });
  if (!existingSession) {
    await db.insert(academicSessions).values({
      name: "2026-27",
      isActive: true,
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
    });
    steps.push("session:2026-27");
  }

  // ── Users ──
  async function ensureUser(
    name: string,
    email: string,
    password: string,
    role: "SUPERADMIN" | "ADMIN" | "STUDENT"
  ) {
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) return existing;
    const [created] = await db
      .insert(users)
      .values({ name, email, password: await bcrypt.hash(password, 10), role })
      .returning();
    steps.push(`user:${role}`);
    return created;
  }

  const superadmin = await ensureUser(
    "Super Admin",
    "superadmin@visionpublicschool.edu",
    "Super@123",
    "SUPERADMIN"
  );
  await ensureUser("School Admin", "admin@visionpublicschool.edu", "Admin@123", "ADMIN");
  const studentUser = await ensureUser(
    "Demo Student",
    "student@visionpublicschool.edu",
    "Student@123",
    "STUDENT"
  );

  // ── Class structure ──
  let class1 = await db.query.classes.findFirst({ where: eq(classes.name, "Class 1") });
  if (!class1) {
    [class1] = await db.insert(classes).values({ name: "Class 1" }).returning();
    steps.push("class:Class 1");
  }

  let sectionA = await db.query.sections.findFirst({
    where: (s, { and, eq }) => and(eq(s.classId, class1.id), eq(s.name, "A")),
  });
  if (!sectionA) {
    [sectionA] = await db.insert(sections).values({ name: "A", classId: class1.id }).returning();
    steps.push("section:A");
  }

  for (const subjectName of ["Hindi", "English", "Mathematics", "EVS"]) {
    const existing = await db.query.subjects.findFirst({
      where: (s, { and, eq }) => and(eq(s.classId, class1.id), eq(s.name, subjectName)),
    });
    if (!existing) await db.insert(subjects).values({ name: subjectName, classId: class1.id });
  }

  // ── Demo student profile ──
  const existingStudent = await db.query.students.findFirst({
    where: eq(students.admissionNo, "VPS20260001"),
  });
  if (!existingStudent) {
    await db.insert(students).values({
      userId: studentUser.id,
      admissionNo: "VPS20260001",
      classId: class1.id,
      sectionId: sectionA.id,
      rollNo: 1,
      dob: new Date("2018-05-15"),
      gender: "MALE",
      bloodGroup: "B+",
      fatherName: "Demo Father",
      motherName: "Demo Mother",
      parentPhone: "+91 99999 88888",
      address: "Patna, Bihar",
    });
    steps.push("student:VPS20260001");
  }

  // ── Welcome notice ──
  const existingNotice = await db.query.notices.findFirst({
    where: (n, { like }) => like(n.title, "Welcome%"),
  });
  if (!existingNotice) {
    await db.insert(notices).values({
      title: "Welcome to Vision Public School Portal 🎉",
      body: "School Management System Phase 1 is live! Login karke apna dashboard dekhein.",
      createdById: superadmin.id,
    });
    steps.push("notice:welcome");
  }

  return { steps };
}
