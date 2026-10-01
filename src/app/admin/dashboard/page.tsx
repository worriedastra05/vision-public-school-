import { db } from "@/lib/db";
import { classes, notices, students, subjects, teachers } from "@/db/schema";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  BookOpen,
  ClipboardCheck,
  Bell,
  Wallet,
  Clock,
} from "lucide-react";

export default async function AdminDashboard() {
  const [studentCount, teacherCount, classCount, noticeCount, subjectCount, classList] =
    await Promise.all([
      db.$count(students),
      db.$count(teachers),
      db.$count(classes),
      db.$count(notices),
      db.$count(subjects),
      db.query.classes.findMany({
        with: {
          students: { columns: { id: true } },
          sections: { columns: { id: true } },
        },
        orderBy: (c, { asc }) => [asc(c.name)],
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">School Overview</h2>
        <p className="text-sm text-slate-500">Aaj ka school ek nazar me</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Students" value={studentCount} icon={GraduationCap} accent="indigo" />
        <StatCard label="Total Teachers" value={teacherCount} icon={Users} accent="sky" />
        <StatCard label="Classes" value={classCount} icon={BookOpen} accent="amber" />
        <StatCard label="Subjects" value={subjectCount} icon={ClipboardCheck} accent="emerald" />
        <StatCard label="Notices Posted" value={noticeCount} icon={Bell} accent="rose" />
        <StatCard label="Fee Collection" value="Phase 6" icon={Wallet} accent="sky" hint="Coming soon" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class-wise Strength</CardTitle>
            <CardDescription>Har class me kitne students hain</CardDescription>
          </CardHeader>
          <CardContent>
            {classList.length === 0 ? (
              <p className="text-sm text-slate-400">Abhi koi class nahi bani. Phase 3 me classes add hongi.</p>
            ) : (
              <div className="space-y-2.5">
                {classList.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm"
                  >
                    <span className="font-medium text-slate-700">{cls.name}</span>
                    <span className="text-slate-500">
                      {cls.students.length} students • {cls.sections.length} sections
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Modules</CardTitle>
            <CardDescription>Next phases me ye features activate honge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {[
                { name: "Phase 3 — Students, teachers & classes management", done: false },
                { name: "Phase 4 — Exams, marks entry & report cards", done: false },
                { name: "Phase 5 — QR-based ID card generator", done: false },
                { name: "Phase 6 — Fees, receipts & due list", done: false },
                { name: "Phase 1 — Auth, RBAC & dashboards ✅", done: true },
              ].map((m) => (
                <div
                  key={m.name}
                  className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-4 py-2.5 text-sm"
                >
                  {m.done ? (
                    <ClipboardCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                  <span className={m.done ? "font-medium text-emerald-700" : "text-slate-600"}>
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
