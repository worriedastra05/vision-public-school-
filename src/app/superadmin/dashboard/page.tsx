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
    settingRows.find((s) => s.key === "school_name")?.value ?? "Vision Public School";

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-white/10 bg-ink-950 p-6 shadow-[0_20px_50px_-24px_rgba(19,31,54,0.5)]">
          <div className="glow-ring flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-ink-900">
            <Crown className="h-6 w-6 text-gold-400" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">Welcome back, Super Admin</h2>
            <div className="gold-rule mt-2 w-16" />
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              You are in the main control panel of{" "}
              <span className="font-semibold text-gold-300">{schoolName}</span>. Admins, settings,
              backups and the entire system are managed from here.
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
            <CardDescription>Everything below is live and ready to use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Admin accounts: create / reset / deactivate",
                "System settings (school info, session, grade formula)",
                "Activity logs — who did what, and when",
                "Database backup & restore",
                "Full access to every admin feature",
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
