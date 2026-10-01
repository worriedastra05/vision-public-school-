import { db } from "@/lib/db";
import { classes, notices, students, subjects, teachers } from "@/db/schema";
import { StatCard } from "@/components/dashboard/stat-card";
import { Reveal } from "@/components/motion";
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
      <Reveal>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">School Overview</h2>
          <p className="text-sm text-slate-500">Aaj ka school ek nazar me</p>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Students" value={studentCount} icon={GraduationCap} accent="indigo" delay={100} />
        <StatCard label="Total Teachers" value={teacherCount} icon={Users} accent="sky" delay={180} />
        <StatCard label="Classes" value={classCount} icon={BookOpen} accent="amber" delay={260} />
        <StatCard label="Subjects" value={subjectCount} icon={ClipboardCheck} accent="emerald" delay={340} />
        <StatCard label="Notices Posted" value={noticeCount} icon={Bell} accent="rose" delay={420} />
        <StatCard label="Fee Collection" value="Phase 6" icon={Wallet} accent="sky" hint="Coming soon" delay={500} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={550}>
          <Card className="card-hover h-full">
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
                      className="group flex items-center justify-between rounded-lg border border-transparent bg-slate-50 px-4 py-2.5 text-sm transition-all duration-200 hover:border-brand-200 hover:bg-brand-50"
                    >
                      <span className="font-medium text-slate-700 group-hover:text-brand-700">{cls.name}</span>
                      <span className="text-slate-500">
                        {cls.students.length} students • {cls.sections.length} sections
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={630}>
          <Card className="card-hover h-full">
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
                    className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-4 py-2.5 text-sm transition-colors hover:bg-brand-50"
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
        </Reveal>
      </div>
    </div>
  );
}
