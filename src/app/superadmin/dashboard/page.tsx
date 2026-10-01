import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { activityLogs, classes, notices, settings, students, teachers, users } from "@/db/schema";
import { StatCard } from "@/components/dashboard/stat-card";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  BookOpen,
  ShieldCheck,
  Bell,
  ScrollText,
  Crown,
  CheckCircle2,
} from "lucide-react";

export default async function SuperAdminDashboard() {
  const [studentCount, teacherCount, classCount, adminCount, noticeCount, logCount, settingRows] =
    await Promise.all([
      db.$count(students),
      db.$count(teachers),
      db.$count(classes),
      db.$count(users, eq(users.role, "ADMIN")),
      db.$count(notices),
      db.$count(activityLogs),
      db.select().from(settings),
    ]);

  const schoolName =
    settingRows.find((s) => s.key === "schoolName")?.value ?? "Vision Public School";

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-6 shadow-sm">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="animate-float flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-3 shadow-lg shadow-amber-500/30">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Welcome back, Boss 👑</h2>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
              Aap <span className="font-semibold text-slate-800">{schoolName}</span> ke main control
              panel me hain. Yahan se admins, settings, backups aur poora system manage hota hai.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Students" value={studentCount} icon={GraduationCap} accent="indigo" delay={100} />
        <StatCard label="Total Teachers" value={teacherCount} icon={Users} accent="sky" delay={180} />
        <StatCard label="Classes" value={classCount} icon={BookOpen} accent="amber" delay={260} />
        <StatCard label="Admin Accounts" value={adminCount} icon={ShieldCheck} accent="rose" delay={340} />
        <StatCard label="Notices Posted" value={noticeCount} icon={Bell} accent="emerald" delay={420} />
        <StatCard label="Activity Logs" value={logCount} icon={ScrollText} accent="indigo" delay={500} />
      </div>

      <Reveal delay={550}>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Super Admin Powers</CardTitle>
            <CardDescription>Phase 1 foundation ready — ye modules next phases me activate honge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Admin accounts create / edit / deactivate",
                "System settings (school info, session, grade formula)",
                "Activity logs — kisne kab kya kiya",
                "Database backup & restore",
                "Sab admin features ka full access",
                "Roles & permissions control",
              ].map((power) => (
                <div key={power} className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 transition-transform duration-200 group-hover:scale-110" />
                  {power}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
