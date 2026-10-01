import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { students } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { changePassword } from "@/lib/actions/account";
import { DashboardShell } from "@/components/dashboard/shell";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  ShieldCheck,
  CalendarDays,
  UserRound,
  KeyRound,
  GraduationCap,
  Crown,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const ROLE_META = {
  SUPERADMIN: { label: "Super Admin", variant: "warning" as const, icon: Crown },
  ADMIN: { label: "Admin", variant: "success" as const, icon: ShieldCheck },
  STUDENT: { label: "Student", variant: "default" as const, icon: GraduationCap },
  TEACHER: { label: "Teacher", variant: "default" as const, icon: GraduationCap },
};

const pwdMessages: Record<string, { ok: boolean; text: string }> = {
  ok: { ok: true, text: "Password successfully change ho gaya!" },
  wrong: { ok: false, text: "Current password galat hai." },
  mismatch: { ok: false, text: "Naya password aur confirm password match nahi kar rahe." },
  invalid: { ok: false, text: "Naya password kam se kam 8 characters ka hona chahiye." },
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ pwd?: string }>;
}) {
  const session = await requireUser();
  const { pwd } = await searchParams;

  // Student ho to uska academic profile bhi dikhao
  const student =
    session.user.role === "STUDENT"
      ? await db.query.students.findFirst({
          where: eq(students.userId, session.user.id),
          with: { class: true, section: true },
        })
      : null;

  const meta = ROLE_META[session.user.role] ?? ROLE_META.STUDENT;
  const RoleIcon = meta.icon;
  const pwdMsg = pwd ? pwdMessages[pwd] : null;

  return (
    <DashboardShell
      role={session.user.role === "SUPERADMIN" ? "SUPERADMIN" : session.user.role === "ADMIN" ? "ADMIN" : "STUDENT"}
      userName={session.user.name ?? "User"}
      userEmail={session.user.email ?? ""}
      roleBadge={meta.label}
      roleBadgeVariant={meta.variant}
      pageTitle="My Profile"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {pwdMsg && (
          <Reveal>
            <div
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
                pwdMsg.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {pwdMsg.ok ? <CheckCircle2 className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
              {pwdMsg.text}
            </div>
          </Reveal>
        )}

        {/* Account card */}
        <Reveal>
          <Card className="card-hover overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-brand-600 via-violet-600 to-brand-600 bg-[length:200%_auto] animate-gradient-x" />
            <CardContent className="-mt-12 flex flex-col items-start gap-4 px-6 pb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-brand-500 to-violet-600 text-3xl font-bold text-white shadow-lg shadow-brand-600/30">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{session.user.name}</h2>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  <RoleIcon className="h-3.5 w-3.5" /> {meta.label}
                </span>
              </div>
              <div className="grid w-full gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{session.user.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Account Active
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        {/* Student academic info */}
        {student && (
          <Reveal delay={100}>
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-brand-600" /> Academic Details
                </CardTitle>
                <CardDescription>School dwara assign ki gayi jaankari (edit karne ke liye office se milein)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { k: "Admission No.", v: student.admissionNo },
                    { k: "Class", v: student.class.name },
                    { k: "Section", v: student.section?.name ?? "—" },
                    { k: "Roll No.", v: student.rollNo?.toString() ?? "—" },
                    { k: "Blood Group", v: student.bloodGroup ?? "—" },
                    { k: "Parent Phone", v: student.parentPhone ?? "—" },
                  ].map((f) => (
                    <div key={f.k} className="rounded-lg bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{f.k}</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800">{f.v}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        )}

        {/* Change password */}
        <Reveal delay={160}>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-brand-600" /> Change Password
              </CardTitle>
              <CardDescription>Security ke liye strong password rakhein (min 8 characters)</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={changePassword} className="grid max-w-md gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
                </div>
                <div>
                  <Button type="submit" className="mt-1">
                    <KeyRound className="h-4 w-4" /> Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Reveal>

        <p className="flex items-center gap-2 pb-4 text-xs text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" /> Session 2026-27 • Vision Public School
        </p>
      </div>
    </DashboardShell>
  );
}

// TS helper: user import consistency
export const dynamic = "force-dynamic";
