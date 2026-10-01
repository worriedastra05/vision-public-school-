import { and, desc, eq, isNull, or } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { exams, notices, students } from "@/db/schema";
import { gradeFor } from "@/lib/grades";
import { StatCard } from "@/components/dashboard/stat-card";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  // Latest published result (student's class ke published exams me apne marks)
  const latestExam = student
    ? await db.query.exams.findFirst({
        where: and(eq(exams.classId, student.classId), eq(exams.isPublished, true)),
        orderBy: [desc(exams.id)],
        with: { marks: { where: (m, { eq: e }) => e(m.studentId, student.id) } },
      })
    : null;

  let latestResult: { label: string; hint: string } = { label: "—", hint: "Koi result publish nahi hua" };
  if (latestExam && latestExam.marks.length > 0) {
    const t = latestExam.marks.reduce((s, m) => s + Number(m.marksObtained), 0);
    const mx = latestExam.marks.reduce((s, m) => s + Number(m.maxMarks), 0);
    const pct = mx > 0 ? (t / mx) * 100 : 0;
    latestResult = { label: `${pct.toFixed(1)}%`, hint: `${latestExam.name} • Grade ${gradeFor(pct)}` };
  }

  return (
    <div className="space-y-6">
      {/* Animated gradient profile banner */}
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-violet-600 to-brand-600 bg-[length:220%_auto] animate-gradient-x p-1 shadow-xl shadow-brand-600/25">
          <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-5 rounded-[14px] p-5 md:p-6">
            <div className="animate-float flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold text-white shadow-inner backdrop-blur">
              {session!.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                Namaste, {session!.user.name} 👋
              </h2>
              {student ? (
                <p className="mt-1 text-sm text-white/80">
                  {student.class.name}
                  {student.section ? ` • Section ${student.section.name}` : ""}
                  {student.rollNo ? ` • Roll No. ${student.rollNo}` : ""} • Adm. No.{" "}
                  <span className="font-mono font-medium">{student.admissionNo}</span>
                </p>
              ) : (
                <p className="mt-1 text-sm text-white/70">
                  Aapka student profile abhi admin dwara link nahi hua hai.
                </p>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <GraduationCap className="h-3.5 w-3.5" /> Session 2026-27
            </span>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Attendance"
          value={attendancePct !== null ? `${attendancePct}%` : "—"}
          icon={ClipboardCheck}
          accent="emerald"
          hint={totalDays > 0 ? `${presentDays}/${totalDays} days present` : "No records yet"}
          delay={100}
        />
        <StatCard
          label="Latest Result"
          value={latestResult.label}
          icon={FileText}
          accent="indigo"
          hint={latestResult.hint}
          delay={180}
        />
        <StatCard label="Pending Fees" value="Phase 6" icon={Wallet} accent="amber" hint="Coming soon" delay={260} />
        <StatCard label="Notices" value={noticeRows.length} icon={Bell} accent="rose" delay={340} />
      </div>

      <Reveal delay={420}>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Latest Notices</CardTitle>
            <CardDescription>School ki taaza announcements</CardDescription>
          </CardHeader>
          <CardContent>
            {noticeRows.length === 0 ? (
              <p className="text-sm text-slate-400">Abhi koi notice nahi hai.</p>
            ) : (
              <div className="space-y-3">
                {noticeRows.map((notice, i) => (
                  <div
                    key={notice.id}
                    className="animate-fade-up rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 transition-all duration-200 hover:border-brand-200 hover:shadow-md hover:shadow-brand-600/10"
                    style={{ animationDelay: `${450 + i * 90}ms` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-800">{notice.title}</p>
                      <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-600">
                        {notice.createdAt.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{notice.body}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
