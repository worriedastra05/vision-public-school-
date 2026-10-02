import Link from "next/link";
import { createTeacher } from "@/lib/actions/teachers";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserPlus, XCircle, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewTeacherPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { err } = await searchParams;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Reveal>
        <div className="flex items-center gap-3">
          <Link href="/admin/teachers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Add Teacher</h2>
            <p className="text-sm text-slate-500">Creates the faculty record + auto-generates an employee ID</p>
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

      <Reveal delay={80}>
        <Card className="card-hover">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-md shadow-sky-500/30">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Teacher Details</CardTitle>
                <CardDescription>The system assigns the employee ID (TCH-001...)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={createTeacher} className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" placeholder="e.g. Priya Sharma" required minLength={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" name="qualification" placeholder="e.g. M.Sc. Mathematics, B.Ed" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="+91 ..." maxLength={15} />
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-500">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                The teacher account stays <strong>inactive</strong> for now — it will be activated when the teacher portal ships.
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" size="lg">
                  <UserPlus className="h-4 w-4" /> Add Teacher
                </Button>
                <Link href="/admin/teachers">
                  <Button type="button" variant="ghost" size="lg">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
