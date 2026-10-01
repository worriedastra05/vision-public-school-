import Link from "next/link";
import { db } from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";
import { attendance, classes, feePayments, notices, students, subjects, teachers } from "@/db/schema";
import { inr } from "@/lib/fees-calcs";
import { StatCard } from "@/components/dashboard/stat-card";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  BookOpen,
  ClipboardCheck,
  Bell,
  Wallet,
  UserPlus,
  CalendarCheck,
  IndianRupee,
} from "lucide-react";

export default async function AdminDashboard() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

  const [studentCount, teacherCount, classCount, noticeCount, subjectCount, classList, markedToday, presentToday, [fees]] =
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
      db.$count(attendance, eq(attendance.date, today)),
      db.$count(attendance, and(eq(attendance.date, today), eq(attendance.status, "PRESENT"))),
      db.select({ total: sql<string>`coalesce(sum(${feePayments.amount}::numeric),0)` }).from(feePayments),
    ]);

  return (
    <div className="space-y-6">
      <Reveal>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">School Overview</h2>
          <p className="text-sm text-slate-500">Today at a glance</p>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Students" value={studentCount} icon={GraduationCap} accent="indigo" delay={100} />
        <StatCard label="Total Teachers" value={teacherCount} icon={Users} accent="sky" delay={180} />
        <StatCard label="Classes" value={classCount} icon={BookOpen} accent="amber" delay={260} />
        <StatCard
          label="Present Today"
          value={presentToday}
          icon={ClipboardCheck}
          accent="emerald"
          hint={markedToday > 0 ? `${markedToday} marked • ${subjectCount} subjects` : "Attendance not marked yet"}
          delay={340}
        />
        <StatCard label="Notices Posted" value={noticeCount} icon={Bell} accent="rose" delay={420} />
        <StatCard
          label="Fee Collection"
          value={inr(Number(fees.total))}
          icon={Wallet}
          accent="sky"
          hint="Total received"
          delay={500}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={550}>
          <Card className="card-hover h-full">
            <CardHeader>
              <CardTitle>Class-wise Strength</CardTitle>
              <CardDescription>Students and sections in every class</CardDescription>
            </CardHeader>
            <CardContent>
              {classList.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No classes yet — create your first class from the Classes page.
                </p>
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
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Day-to-day tasks, one tap away</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                <Link
                  href="/admin/students/new"
                  className="group flex items-center gap-3 rounded-lg border border-transparent bg-slate-50 px-4 py-3 text-sm transition-all duration-200 hover:border-brand-200 hover:bg-brand-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-gold-300">
                    <UserPlus className="h-4 w-4" />
                  </span>
                  <span className="font-medium text-slate-700 group-hover:text-brand-700">New Admission</span>
                  <span className="ml-auto text-xs text-slate-400">admits a student instantly</span>
                </Link>
                <Link
                  href="/admin/attendance"
                  className="group flex items-center gap-3 rounded-lg border border-transparent bg-slate-50 px-4 py-3 text-sm transition-all duration-200 hover:border-brand-200 hover:bg-brand-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-gold-300">
                    <CalendarCheck className="h-4 w-4" />
                  </span>
                  <span className="font-medium text-slate-700 group-hover:text-brand-700">Mark Attendance</span>
                  <span className="ml-auto text-xs text-slate-400">class rosters</span>
                </Link>
                <Link
                  href="/admin/fees/collect"
                  className="group flex items-center gap-3 rounded-lg border border-transparent bg-slate-50 px-4 py-3 text-sm transition-all duration-200 hover:border-brand-200 hover:bg-brand-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-gold-300">
                    <IndianRupee className="h-4 w-4" />
                  </span>
                  <span className="font-medium text-slate-700 group-hover:text-brand-700">Collect Fees</span>
                  <span className="ml-auto text-xs text-slate-400">instant receipts</span>
                </Link>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <Link href="/admin/students/new">
                  <Button size="sm" className="w-full">
                    <UserPlus className="h-4 w-4" /> Start a New Admission
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
