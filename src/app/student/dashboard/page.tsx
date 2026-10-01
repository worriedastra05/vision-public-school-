import { eq, isNull, or } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notices, students } from "@/db/schema";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Wallet, FileText, Bell, GraduationCap } from "lucide-react";

export default async function StudentDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  // Student sirf APNA data fetch karta hai — userId session se aata hai,
  // koi bhi dusre ka data is query se nahi mil sakta
  const student = await db.query.students.findFirst({
    where: eq(students.userId, userId),
    with: { class: true, section: true, attendance: true },
  });

  const noticeRows = await db.query.notices.findMany({
    where: or(
      isNull(notices.targetRole),
      eq(notices.targetRole, "STUDENT"),
      ...(student ? [eq(notices.targetClassId, student.classId)] : [])
    ),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit: 3,
  });

  const totalDays = student?.attendance.length ?? 0;
  const presentDays = student?.attendance.filter((a) => a.status === "PRESENT").length ?? 0;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null;

  return (
    <div className="space-y-6">
      {/* Profile summary */}
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg">
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
            {session!.user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">Namaste, {session!.user.name} 👋</h2>
            {student ? (
              <p className="mt-0.5 text-sm text-indigo-100">
                {student.class.name}
                {student.section ? ` • Section ${student.section.name}` : ""}
                {student.rollNo ? ` • Roll No. ${student.rollNo}` : ""} • Adm. No. {student.admissionNo}
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-indigo-200">
                Aapka student profile abhi admin dwara link nahi hua hai.
              </p>
            )}
          </div>
          <Badge className="border-0 bg-white/15 text-white">
            <GraduationCap className="mr-1 h-3.5 w-3.5" /> Session 2026-27
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Attendance"
          value={attendancePct !== null ? `${attendancePct}%` : "—"}
          icon={ClipboardCheck}
          accent="emerald"
          hint={totalDays > 0 ? `${presentDays}/${totalDays} days present` : "No records yet"}
        />
        <StatCard label="Report Card" value="Phase 4" icon={FileText} accent="indigo" hint="Coming soon" />
        <StatCard label="Pending Fees" value="Phase 6" icon={Wallet} accent="amber" hint="Coming soon" />
        <StatCard label="Notices" value={noticeRows.length} icon={Bell} accent="rose" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Notices</CardTitle>
          <CardDescription>School ki taaza announcements</CardDescription>
        </CardHeader>
        <CardContent>
          {noticeRows.length === 0 ? (
            <p className="text-sm text-slate-400">Abhi koi notice nahi hai.</p>
          ) : (
            <div className="space-y-3">
              {noticeRows.map((notice) => (
                <div key={notice.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-800">{notice.title}</p>
                    <span className="shrink-0 text-xs text-slate-400">
                      {notice.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{notice.body}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
