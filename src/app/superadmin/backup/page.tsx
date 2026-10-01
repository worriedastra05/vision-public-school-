import { db } from "@/lib/db";
import {
  users, students, teachers, classes, sections, subjects, attendance,
  academicSessions, exams, marks, feeStructures, feePayments, notices, settings, activityLogs,
} from "@/db/schema";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatabaseBackup, Download, ShieldAlert, FileJson, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

const TABLES = [
  { label: "Users", table: users },
  { label: "Students", table: students },
  { label: "Teachers", table: teachers },
  { label: "Classes", table: classes },
  { label: "Sections", table: sections },
  { label: "Subjects", table: subjects },
  { label: "Attendance", table: attendance },
  { label: "Academic Sessions", table: academicSessions },
  { label: "Exams", table: exams },
  { label: "Marks", table: marks },
  { label: "Fee Structures", table: feeStructures },
  { label: "Fee Payments", table: feePayments },
  { label: "Notices", table: notices },
  { label: "Settings", table: settings },
  { label: "Activity Logs", table: activityLogs },
] as const;

export default async function BackupPage() {
  await requireRole("SUPERADMIN");

  const counts = await Promise.all(TABLES.map(async (t) => db.$count(t.table)));
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Reveal>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25">
            <DatabaseBackup className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Data Backup</h1>
            <p className="text-sm text-slate-500">Poora database ek click me JSON file ke roop me download karo.</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileJson className="h-4.5 w-4.5 text-teal-600" /> Full Backup ({total} rows • {TABLES.length} tables)
            </CardTitle>
            <CardDescription>Students, marks, fees, attendance, settings — sab kuch ek file me.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TABLES.map((t, i) => (
                <div key={t.label} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
                  <span className="text-xs font-medium text-slate-600">{t.label}</span>
                  <span className="text-xs font-bold tabular-nums text-slate-800">{counts[i]}</span>
                </div>
              ))}
            </div>

            <a href="/api/backup" download>
              <Button className="w-full">
                <Download className="h-4 w-4" /> Download Full Backup (.json)
              </Button>
            </a>

            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="text-sm leading-relaxed text-slate-600">
                <p className="font-semibold text-slate-800">Security note</p>
                Backup file me password hashes bhi hote hain (restore ke liye zaroori). File ko{" "}
                <span className="font-medium">sirf apne paas, safe folder/drive</span> me rakho — kisi ko na bhejo.
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Har download Activity Logs me record hota hai — kaun kab backup liya, pata rehta hai.
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
