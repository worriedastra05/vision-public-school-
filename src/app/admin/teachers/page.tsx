import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { teachers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { toggleTeacherActive, deleteTeacher } from "@/lib/actions/teachers";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmit } from "@/components/forms/confirm-submit";
import { Users, Plus, CheckCircle2, Power, Trash2, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { created } = await searchParams;

  const rows = await db
    .select({
      id: teachers.id,
      employeeId: teachers.employeeId,
      qualification: teachers.qualification,
      phone: teachers.phone,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .orderBy(desc(teachers.employeeId));

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Teachers</h2>
            <p className="text-sm text-slate-500">{rows.length} faculty members</p>
          </div>
          <Link href="/admin/teachers/new">
            <Button>
              <Plus className="h-4 w-4" /> Add Teacher
            </Button>
          </Link>
        </div>
      </Reveal>

      {created && (
        <Reveal>
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4.5 w-4.5" /> &quot;{created}&quot; added successfully!
          </div>
        </Reveal>
      )}

      <Reveal delay={70}>
        <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
          A teacher <strong>login portal is coming in a future update</strong> — until then accounts
          remain <strong>inactive</strong> (nobody can sign in). Records are fully managed here.
        </div>
      </Reveal>

      <Reveal delay={120}>
        <Card className="card-hover overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5 font-semibold">Teacher</th>
                  <th className="px-5 py-3.5 font-semibold">Employee ID</th>
                  <th className="px-5 py-3.5 font-semibold">Qualification</th>
                  <th className="px-5 py-3.5 font-semibold">Phone</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-brand-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 text-xs font-bold text-white">
                          {row.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{row.name}</p>
                          <p className="text-[11px] text-slate-400">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{row.employeeId}</td>
                    <td className="px-5 py-3 text-slate-600">{row.qualification ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{row.phone ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge variant={row.isActive ? "success" : "outline"} className="border-0">
                        {row.isActive ? "Login Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <form action={toggleTeacherActive}>
                          <input type="hidden" name="id" value={row.id} />
                          <button
                            type="submit"
                            title={row.isActive ? "Disable login" : "Enable login"}
                            className={`rounded-lg p-2 transition-colors ${
                              row.isActive
                                ? "text-emerald-500 hover:bg-emerald-50"
                                : "text-slate-400 hover:bg-slate-100 hover:text-emerald-500"
                            }`}
                          >
                            <Power className="h-4 w-4" />
                          </button>
                        </form>
                        <form action={deleteTeacher}>
                          <input type="hidden" name="id" value={row.id} />
                          <ConfirmSubmit
                            message={`DELETE ${row.name}? This action cannot be undone.`}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </ConfirmSubmit>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="p-12 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No teachers yet — add your first teacher!</p>
            </div>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
