import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
  academicSessions,
  classes,
  notices,
  sections,
  settings,
  students,
  subjects,
  users,
} from "../src/db/schema";

async function main() {
  console.log("🌱 Seeding database...");

  // ── School Settings (Super Admin control) ──
  const settingsData: Record<string, string> = {
    schoolName: "Vision Public School",
    schoolAddress: "Main Road, Patna, Bihar 800001",
    schoolPhone: "+91 98765 43210",
    schoolEmail: "info@visionpublicschool.edu",
    schoolTagline: "Education • Discipline • Excellence",
    gradeFormula: "A+:90,A:80,B:70,C:60,D:40,F:0",
  };
  for (const [key, value] of Object.entries(settingsData)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }

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
  }

  // ── Users (3 roles) ──
  async function ensureUser(name: string, email: string, password: string, role: "SUPERADMIN" | "ADMIN" | "STUDENT") {
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) return existing;
    const [created] = await db
      .insert(users)
      .values({ name, email, password: await bcrypt.hash(password, 10), role })
      .returning();
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

  // ── Demo class structure ──
  let class1 = await db.query.classes.findFirst({ where: eq(classes.name, "Class 1") });
  if (!class1) {
    [class1] = await db.insert(classes).values({ name: "Class 1" }).returning();
  }

  let sectionA = await db.query.sections.findFirst({
    where: (s, { and, eq }) => and(eq(s.classId, class1.id), eq(s.name, "A")),
  });
  if (!sectionA) {
    [sectionA] = await db.insert(sections).values({ name: "A", classId: class1.id }).returning();
  }

  for (const subjectName of ["Hindi", "English", "Mathematics", "EVS"]) {
    const existing = await db.query.subjects.findFirst({
      where: (s, { and, eq }) => and(eq(s.classId, class1.id), eq(s.name, subjectName)),
    });
    if (!existing) {
      await db.insert(subjects).values({ name: subjectName, classId: class1.id });
    }
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
  }

  console.log("✅ Seed complete!");
  console.log("   👑 Super Admin : superadmin@visionpublicschool.edu / Super@123");
  console.log("   🛡️  Admin       : admin@visionpublicschool.edu / Admin@123");
  console.log("   🎓 Student     : student@visionpublicschool.edu / Student@123");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
