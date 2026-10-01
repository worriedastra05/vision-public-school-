import Link from "next/link";
import { db } from "@/lib/db";
import { createStudent } from "@/lib/actions/students";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PhotoPicker } from "@/components/forms/photo-picker";
import { ArrowLeft, GraduationCap, Info, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewAdmissionPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { err } = await searchParams;

  const [classRows, sectionRows] = await Promise.all([
    db.query.classes.findMany({ orderBy: (c, { asc }) => [asc(c.name)] }),
    db.query.sections.findMany({
      with: { class: { columns: { name: true } } },
      orderBy: (s, { asc }) => [asc(s.name)],
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Reveal>
        <div className="flex items-center gap-3">
          <Link href="/admin/students">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">New Student Admission</h2>
            <p className="text-sm text-slate-500">The student&apos;s login is created automatically on submit</p>
          </div>
        </div>
      </Reveal>

      {err && (
        <Reveal>
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <XCircle className="h-4.5 w-4.5" /> {err}
          </div>
        </Reveal>
      )}

      {classRows.length === 0 ? (
        <Reveal delay={80}>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              Create a class first —{" "}
              <Link href="/admin/classes" className="font-semibold text-brand-600 hover:underline">
                Manage classes
              </Link>
            </p>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={80}>
          <Card className="card-hover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Admission Form</CardTitle>
                  <CardDescription>(Fields marked * are required)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form action={createStudent} className="grid gap-5">
                {/* Photo */}
                <PhotoPicker />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">Student&apos;s Full Name *</Label>
                    <Input id="name" name="name" placeholder="e.g. Aarav Kumar" required minLength={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father&apos;s Name</Label>
                    <Input id="fatherName" name="fatherName" placeholder="Father name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherName">Mother&apos;s Name</Label>
                    <Input id="motherName" name="motherName" placeholder="Mother name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Parent Phone</Label>
                    <Input id="parentPhone" name="parentPhone" placeholder="+91 ..." maxLength={15} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" name="dob" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select id="gender" name="gender" defaultValue="">
                      <option value="">Select...</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Input id="bloodGroup" name="bloodGroup" placeholder="e.g. B+" maxLength={5} />
                  </div>
                </div>

                <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="classId">Class *</Label>
                      <Select id="classId" name="classId" required defaultValue="">
                        <option value="" disabled>
                          Select class...
                        </option>
                        {classRows.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sectionId">Section</Label>
                      <Select id="sectionId" name="sectionId" defaultValue="">
                        <option value="">No section</option>
                        {sectionRows.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.class.name} — {s.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNo">Roll No.</Label>
                      <Input id="rollNo" name="rollNo" type="number" min={1} placeholder="e.g. 12" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" name="address" placeholder="Full address" />
                </div>

                <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-500">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                  <span>
                    On submit the system generates an <strong>Admission Number</strong> (e.g. VPS20260042) and a{" "}
                    <strong>temporary password</strong> — shown <strong>only once</strong> on the next page.{" "}
                    Please share those details with the parent. Students can sign in with either their
                    admission number or email.
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Button type="submit" size="lg">
                    <GraduationCap className="h-4.5 w-4.5" /> Submit Admission
                  </Button>
                  <Link href="/admin/students">
                    <Button type="button" variant="ghost" size="lg">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </Reveal>
      )}
    </div>
  );
}
