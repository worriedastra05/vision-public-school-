import { headers } from "next/headers";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { academicSessions, settings, students } from "@/db/schema";
import type { IdCardStudent } from "@/components/id-card/student-id-card";

/** Card rendering ke liye data bundle */
export async function getCardData(s: typeof students.$inferSelect & {
  user: { name: string };
  class: { name: string };
  section: { name: string } | null;
}): Promise<IdCardStudent> {
  return {
    name: s.user.name,
    admissionNo: s.admissionNo,
    className: s.class.name,
    sectionName: s.section?.name ?? null,
    rollNo: s.rollNo,
    dob: s.dob
      ? s.dob.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
      : null,
    bloodGroup: s.bloodGroup,
    parentPhone: s.parentPhone,
    address: s.address,
    photo: s.photo,
  };
}

export async function getSchoolInfo() {
  const [nameRow, tagRow, sessionRow] = await Promise.all([
    db.query.settings.findFirst({ where: eq(settings.key, "school_name") }),
    db.query.settings.findFirst({ where: eq(settings.key, "school_tagline") }),
    db.query.academicSessions.findFirst({ where: eq(academicSessions.isActive, true) }),
  ]);
  return {
    name: nameRow?.value ?? "Vision Public School",
    tagline: tagRow?.value ?? "Excellence in Education",
    session: sessionRow ?? null,
  };
}

/** Current request ka origin (QR encode ke liye — phone se khul sake) */
export async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

/** Card validity = active session ka end */
export function validThrough(session: { endDate: Date } | null): string {
  if (!session) return "—";
  return session.endDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}
