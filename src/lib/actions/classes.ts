"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { classes, sections, students, subjects } from "@/db/schema";
import { requireRole, logActivity } from "@/lib/guards";

const MANAGERS: ("ADMIN" | "SUPERADMIN")[] = ["ADMIN", "SUPERADMIN"];

function errUrl(msg: string) {
  return "/admin/classes?err=" + encodeURIComponent(msg);
}

/** 🏫 Class banana (e.g. "Class 1" ... "Class 12") */
export async function createClass(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const name = z.string().min(1).max(40).safeParse(formData.get("name"));
  if (!name.success) redirect(errUrl("Class ka naam daalein"));

  const existing = await db.query.classes.findFirst({ where: eq(classes.name, name.data.trim()) });
  if (existing) redirect(errUrl(`"${name.data}" pehle se maujood hai`));

  await db.insert(classes).values({ name: name.data.trim() });
  await logActivity(session.user.id, "CLASS_CREATED", name.data);
  revalidatePath("/admin/classes");
  redirect("/admin/classes?ok=" + encodeURIComponent(`Class "${name.data}" ban gayi`));
}

export async function addSection(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const classId = String(formData.get("classId") ?? "");
  const name = z.string().min(1).max(5).safeParse(formData.get("name"));
  if (!classId || !name.success) redirect(errUrl("Section ka naam daalein"));

  const existing = await db.query.sections.findFirst({
    where: (s, { and, eq }) => and(eq(s.classId, classId), eq(s.name, name.data.trim().toUpperCase())),
  });
  if (existing) redirect(errUrl(`Section "${name.data}" us class me pehle se hai`));

  await db.insert(sections).values({ classId, name: name.data.trim().toUpperCase() });
  await logActivity(session.user.id, "SECTION_ADDED", `Section ${name.data}`);
  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function addSubject(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const classId = String(formData.get("classId") ?? "");
  const name = z.string().min(1).max(60).safeParse(formData.get("name"));
  if (!classId || !name.success) redirect(errUrl("Subject ka naam daalein"));

  const existing = await db.query.subjects.findFirst({
    where: (s, { and, eq }) => and(eq(s.classId, classId), eq(s.name, name.data.trim())),
  });
  if (existing) redirect(errUrl(`Subject "${name.data}" us class me pehle se hai`));

  await db.insert(subjects).values({ classId, name: name.data.trim() });
  await logActivity(session.user.id, "SUBJECT_ADDED", name.data);
  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function deleteClass(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const classId = String(formData.get("classId") ?? "");

  const studentCount = await db.$count(students, eq(students.classId, classId));
  if (studentCount > 0) {
    redirect(errUrl(`Is class me ${studentCount} students hain — pehle unhe shift karein, delete nahi hoga`));
  }

  await db.delete(classes).where(eq(classes.id, classId)); // sections/subjects cascade
  await logActivity(session.user.id, "CLASS_DELETED", classId);
  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function deleteSection(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const id = String(formData.get("id") ?? "");
  const studentCount = await db.$count(students, eq(students.sectionId, id));
  if (studentCount > 0) redirect(errUrl(`Is section me ${studentCount} students hain — delete nahi hoga`));

  await db.delete(sections).where(eq(sections.id, id));
  await logActivity(session.user.id, "SECTION_DELETED", id);
  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function deleteSubject(formData: FormData) {
  const session = await requireRole(...MANAGERS);
  const id = String(formData.get("id") ?? "");
  await db.delete(subjects).where(eq(subjects.id, id));
  await logActivity(session.user.id, "SUBJECT_DELETED", id);
  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}
