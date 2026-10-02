import Link from "next/link";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { classes, students, users } from "@/db/schema";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowLeft, Search, Wallet, GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CollectFinderPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classId?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { q, classId } = await searchParams;
  const query = q?.trim();

  const [classRows, rows] = await Promise.all([
    db.query.classes.findMany({ orderBy: (c, { asc }) => [asc(c.name)] }),
    db
      .select({
        id: students.id,
        admissionNo: students.admissionNo,
        className: classes.name,
        name: users.name,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(classes, eq(students.classId, classes.id))
      .where(
        and(
          query ? or(ilike(users.name, `%${query}%`), ilike(students.admissionNo, `%${query}%`)) : undefined,
          classId ? eq(students.classId, classId) : undefined
        )
      )
      .orderBy(asc(classes.name), asc(students.rollNo), asc(students.admissionNo))
      .limit(30),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Reveal>
        <div className="flex items-center gap-3">
          <Link href="/admin/fees">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Collect Payment</h2>
            <p className="text-sm text-slate-500">Find a student first, then take the payment</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={70}>
        <form method="get" className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input name="q" defaultValue={query} placeholder="Name or Admission No..." className="pl-10" />
          </div>
          <Select name="classId" defaultValue={classId ?? ""} className="w-44">
            <option value="">All Classes</option>
            {classRows.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4" /> Find
          </Button>
        </form>
      </Reveal>

      <Reveal delay={120}>
        <Card className="card-hover overflow-hidden">
          <div className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-brand-50/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                    {row.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{row.name}</p>
                    <p className="font-mono text-[11px] text-slate-400">
                      {row.admissionNo} • {row.className}
                    </p>
                  </div>
                </div>
                <Link href={`/admin/fees/collect/${row.id}`}>
                  <Button size="sm">
                    <Wallet className="h-3.5 w-3.5" /> Collect
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          {rows.length === 0 && (
            <div className="p-12 text-center">
              <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                {query ? `No students found for "${query}"` : "No students found"}
              </p>
            </div>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
