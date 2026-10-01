import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { attendance, students, users } from "@/db/schema";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AttendanceSheet } from "@/components/attendance/attendance-sheet";
import { ClipboardCheck, CheckCircle2, CalendarDays, Users } from "lucide-react";

export const dynamic = "force-dynamic";

function todayIST() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; classId?: string; sectionId?: string; saved?: string; err?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { date, classId, sectionId, saved, err } = await searchParams;

  const selDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIST();
  const classRows = await db.query.classes.findMany({ orderBy: (c, { asc: a }) => [a(c.name)] });
  const sectionRows = classId
    ? await db.query.sections.findMany({
        where: (s, { eq: e }) => e(s.classId, classId),
        orderBy: (s, { asc: a }) => [a(s.name)],
      })
    : [];

  // Roster + existing marks (jab class selected ho)
  let roster: {
    id: string; name: string; rollNo: number | null; admissionNo: string; photo: string | null;
  }[] = [];
  let existing: Record<string, "PRESENT" | "ABSENT" | "LEAVE" | "HALF_DAY"> = {};

  if (classId) {
    roster = await db
      .select({
        id: students.id,
        name: users.name,
        rollNo: students.rollNo,
        admissionNo: students.admissionNo,
        photo: students.photo,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(
        sectionId
          ? and(eq(students.classId, classId), eq(students.sectionId, sectionId))
          : eq(students.classId, classId)
      )
      .orderBy(asc(students.rollNo), asc(students.admissionNo));

    if (roster.length > 0) {
      const rows = await db
        .select({ studentId: attendance.studentId, status: attendance.status })
        .from(attendance)
        .where(
          and(
            eq(attendance.classId, classId),
            eq(attendance.date, selDate),
            inArray(attendance.studentId, roster.map((r) => r.id))
          )
        );
      existing = Object.fromEntries(rows.map((r) => [r.studentId, r.status]));
    }
  }

  const selClass = classRows.find((c) => c.id === classId);
  const selSection = sectionRows.find((s) => s.id === sectionId);

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Attendance</h2>
            <p className="text-sm text-slate-500">Class-wise daily attendance mark karo — dubara save karne par update hota hai</p>
          </div>
        </div>
      </Reveal>

      {(saved || err) && (
        <Reveal>
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
              err ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <CheckCircle2 className="h-4.5 w-4.5" />
            {err ? err : `Attendance saved — ${saved} students marked!`}
          </div>
        </Reveal>
      )}

      {/* Filters */}
      <Reveal delay={70}>
        <Card className="card-hover">
          <CardContent className="p-4">
            <form method="get" className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Date</label>
                <Input type="date" name="date" defaultValue={selDate} max={todayIST()} className="w-44" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Class</label>
                <Select name="classId" defaultValue={classId ?? ""} className="w-44" required>
                  <option value="" disabled>
                    Select class...
                  </option>
                  {classRows.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Section (optional)</label>
                <Select name="sectionId" defaultValue={sectionId ?? ""} className="w-44">
                  <option value="">All sections</option>
                  {sectionRows.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit">
                <CalendarDays className="h-4 w-4" /> Load Roster
              </Button>
            </form>
          </CardContent>
        </Card>
      </Reveal>

      {/* Sheet */}
      {classId &&
        (roster.length > 0 ? (
          <Reveal delay={130}>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-brand-600/10 to-violet-600/10 px-4 py-3">
                <CalendarDays className="h-4.5 w-4.5 text-brand-600" />
                <p className="text-sm font-semibold text-slate-700">
                  {selClass?.name}
                  {selSection ? ` — Section ${selSection.name}` : ""} •{" "}
                  {new Date(selDate + "T00:00:00").toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <AttendanceSheet
                roster={roster}
                existing={existing}
                classId={classId}
                sectionId={sectionId ?? ""}
                date={selDate}
              />
            </div>
          </Reveal>
        ) : (
          <Reveal delay={130}>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                Is class/section me koi student nahi hai — pehle admission karein
              </p>
            </div>
          </Reveal>
        ))}

      {!classId && (
        <Reveal delay={120}>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <ClipboardCheck className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">Class choose karo, phir "Load Roster" dabaao</p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
