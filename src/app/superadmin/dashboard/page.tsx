import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { activityLogs, classes, notices, settings, students, teachers, users } from "@/db/schema";
import { StatCard } from "@/components/dashboard/stat-card";
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
      <div className="flex items-start gap-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
          <Crown className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Welcome back, Boss 👑</h2>
          <p className="text-sm text-slate-600">
            Aap {schoolName} ke main control panel me hain. Yahan se admins, settings,
            backups aur poora system manage hota hai.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Students" value={studentCount} icon={GraduationCap} accent="indigo" />
        <StatCard label="Total Teachers" value={teacherCount} icon={Users} accent="sky" />
        <StatCard label="Classes" value={classCount} icon={BookOpen} accent="amber" />
        <StatCard label="Admin Accounts" value={adminCount} icon={ShieldCheck} accent="rose" />
        <StatCard label="Notices Posted" value={noticeCount} icon={Bell} accent="emerald" />
        <StatCard label="Activity Logs" value={logCount} icon={ScrollText} accent="indigo" />
      </div>

      <Card>
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
              <div key={power} className="flex items-center gap-2.5 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                {power}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
