import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { students } from "@/db/schema";
import { updateStudent, resetStudentPassword, toggleStudentActive } from "@/lib/actions/students";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmit } from "@/components/forms/confirm-submit";
import {
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserRound,
  Power,
  Save,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ temp?: string; new?: string; reset?: string; updated?: string; err?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { id } = await params;
  const { temp, new: isNew, reset, updated, err } = await searchParams;

  const student = await db.query.students.findFirst({
    where: eq(students.id, id),
    with: { user: true, class: true, section: true },
  });
  if (!student) notFound();

  const [classRows, sectionRows] = await Promise.all([
    db.query.classes.findMany({ orderBy: (c, { asc }) => [asc(c.name)] }),
    db.query.sections.findMany({
      where: eq(students.classId, student.classId),
      orderBy: (s, { asc }) => [asc(s.name)],
    }),
  ]);
  // filter sections of student's class
  const classSections = await db.query.sections.findMany({
    where: (s, { and, eq }) => and(eq(s.classId, student.classId)),
    orderBy: (s, { asc }) => [asc(s.name)],
  });
  void sectionRows;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Reveal>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/students">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">{student.user.name}</h2>
              <p className="font-mono text-xs text-slate-500">{student.admissionNo}</p>
            </div>
          </div>
          <Badge variant={student.user.isActive ? "success" : "danger"} className="border-0 px-3 py-1">
            {student.user.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </Reveal>

      {/* 🔑 Temporary credentials — SIRF EK BAAR dikhta hai */}
      {temp && (
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-lg shadow-amber-500/10">
            <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-amber-300/25 blur-3xl" />
            <div className="flex items-start gap-3.5">
              <div className="animate-float flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                <KeyRound className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">
                  {isNew ? "Admission ho gaya!" : "🔑 Password reset ho gaya!"} Login Details
                </h3>
                <p className="mt-0.5 text-xs text-amber-700">
                  Ye details <strong>sirf abhi</strong> dikh rahi hain — abhi note kar lein aur parent ko de dein.
                </p>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                  <div className="rounded-lg bg-white/70 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Admission No.</p>
                    <p className="font-mono text-sm font-bold text-slate-800">{student.admissionNo}</p>
                  </div>
                  <div className="rounded-lg bg-white/70 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Login Email</p>
                    <p className="break-all font-mono text-xs font-bold text-slate-800">{student.user.email}</p>
                  </div>
                  <div className="rounded-lg border-2 border-amber-400 bg-white p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Temp Password</p>
                    <p className="font-mono text-base font-bold text-amber-700">{temp}</p>
                  </div>
                </div>
                <p className="mt-2.5 text-xs text-slate-500">
                  Student login page par <strong>admission number</strong> ya <strong>email</strong> — dono se login kar sakta hai.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {(updated || reset || err) && !temp && (
        <Reveal>
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
              err ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {err ? <XCircle className="h-4.5 w-4.5" /> : <CheckCircle2 className="h-4.5 w-4.5" />}
            {err ?? (updated ? "Profile update ho gaya!" : "Password reset ho gaya!")}
          </div>
        </Reveal>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left: summary card */}
        <Reveal delay={80}>
          <Card className="card-hover h-full">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              {student.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={student.photo}
                  alt={student.user.name}
                  className="h-24 w-24 rounded-2xl border border-slate-200 object-cover shadow-md"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-3xl font-bold text-white shadow-lg shadow-brand-600/30">
                  {student.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-slate-900">{student.user.name}</p>
                <p className="text-xs text-slate-500">
                  {student.class.name}
                  {student.section ? ` • Section ${student.section.name}` : ""}
                  {student.rollNo ? ` • Roll ${student.rollNo}` : ""}
                </p>
              </div>
              <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-left text-sm">
                {[
                  { k: "Blood Group", v: student.bloodGroup },
                  { k: "DOB", v: student.dob?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                  { k: "Parent Phone", v: student.parentPhone },
                  { k: "Father", v: student.fatherName },
                  { k: "Mother", v: student.motherName },
                ].map((f) => (
                  <div key={f.k} className="flex justify-between gap-3">
                    <span className="text-slate-400">{f.k}</span>
                    <span className="text-right font-medium text-slate-700">{f.v ?? "—"}</span>
                  </div>
                ))}
                {student.address && (
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Address</span>
                    <span className="text-right font-medium text-slate-700">{student.address}</span>
                  </div>
                )}
              </div>

              {/* Account actions */}
              <div className="flex w-full flex-col gap-2 border-t border-slate-100 pt-4">
                <form action={resetStudentPassword}>
                  <input type="hidden" name="id" value={student.id} />
                  <ConfirmSubmit
                    message={`${student.user.name} ka password RESET karein? Naya temporary password banega.`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                  >
                    <KeyRound className="h-4 w-4" /> Reset Password
                  </ConfirmSubmit>
                </form>
                <form action={toggleStudentActive}>
                  <input type="hidden" name="id" value={student.id} />
                  <ConfirmSubmit
                    message={`${student.user.name} ka login ${student.user.isActive ? "DISABLE" : "ENABLE"} karein?`}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      student.user.isActive
                        ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                        : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    <Power className="h-4 w-4" />
                    {student.user.isActive ? "Disable Login" : "Enable Login"}
                  </ConfirmSubmit>
                </form>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        {/* Right: edit form */}
        <Reveal delay={140} className="lg:col-span-2">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="h-5 w-5 text-brand-600" /> Edit Student Details
              </CardTitle>
              <CardDescription>Changes save hote hi portal par update ho jayenge</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateStudent} className="grid gap-4">
                <input type="hidden" name="id" value={student.id} />
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" defaultValue={student.user.name} required minLength={2} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="classId">Class *</Label>
                    <Select id="classId" name="classId" defaultValue={student.classId} required>
                      {classRows.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sectionId">Section</Label>
                    <Select id="sectionId" name="sectionId" defaultValue={student.sectionId ?? ""}>
                      <option value="">No section</option>
                      {classSections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                    <p className="flex items-start gap-1 text-[10px] leading-tight text-slate-400">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> Class badalne par section dobara choose karein
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rollNo">Roll No.</Label>
                    <Input id="rollNo" name="rollNo" type="number" min={1} defaultValue={student.rollNo ?? ""} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father&apos;s Name</Label>
                    <Input id="fatherName" name="fatherName" defaultValue={student.fatherName ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherName">Mother&apos;s Name</Label>
                    <Input id="motherName" name="motherName" defaultValue={student.motherName ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Parent Phone</Label>
                    <Input id="parentPhone" name="parentPhone" defaultValue={student.parentPhone ?? ""} maxLength={15} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      defaultValue={student.dob ? student.dob.toISOString().slice(0, 10) : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select id="gender" name="gender" defaultValue={student.gender ?? ""}>
                      <option value="">Select...</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Input id="bloodGroup" name="bloodGroup" defaultValue={student.bloodGroup ?? ""} maxLength={5} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" name="address" defaultValue={student.address ?? ""} />
                </div>
                <div>
                  <Button type="submit">
                    <Save className="h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
