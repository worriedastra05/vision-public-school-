import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { requireRole, logActivity } from "@/lib/guards";

export const dynamic = "force-dynamic";

/**
 * 📦 Full database backup — sirf SUPERADMIN.
 * Saare tables ka JSON dump download hota hai.
 */
export async function GET() {
  const session = await requireRole("SUPERADMIN");

  const tables: Record<string, unknown[]> = {
    users: await db.query.users.findMany(),
    students: await db.query.students.findMany(),
    teachers: await db.query.teachers.findMany(),
    classes: await db.query.classes.findMany(),
    sections: await db.query.sections.findMany(),
    subjects: await db.query.subjects.findMany(),
    attendance: await db.query.attendance.findMany(),
    academicSessions: await db.query.academicSessions.findMany(),
    exams: await db.query.exams.findMany(),
    marks: await db.query.marks.findMany(),
    feeStructures: await db.query.feeStructures.findMany(),
    feePayments: await db.query.feePayments.findMany(),
    notices: await db.query.notices.findMany(),
    settings: await db.query.settings.findMany(),
    activityLogs: await db.query.activityLogs.findMany(),
  };
  void schema;

  const totalRows = Object.values(tables).reduce((s, t) => s + t.length, 0);
  // Password hashes backup me hain — restore ke liye zaroori, par file ko SAFE rakhna!
  const payload = {
    meta: {
      school: "Vision Public School",
      exportedAt: new Date().toISOString(),
      exportedBy: session.user.email,
      tableCount: Object.keys(tables).length,
      totalRows,
      note: "CONFIDENTIAL — isme password hashes hain. File ko safe jagah rakho.",
    },
    tables,
  };

  await logActivity(session.user.id, "backup.export", `Full backup download kiya (${totalRows} rows, ${Object.keys(tables).length} tables)`);

  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="vps-backup-${stamp}.json"`,
    },
  });
}
