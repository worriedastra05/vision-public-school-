import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { academicSessions, feePayments, feeStructures, students } from "@/db/schema";
import { requireRole } from "@/lib/guards";
import { expectedForSession, inr } from "@/lib/fees-calcs";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CollectForm } from "@/components/fees/collect-form";
import { ArrowLeft, Wallet, XCircle, AlertTriangle } from "lucide-react";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function CollectStudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { studentId } = await params;
  const { err } = await searchParams;

  const student = await db.query.students.findFirst({
    where: eq(students.id, studentId),
    with: { user: true, class: true, section: true },
  });
  if (!student) notFound();

  const [structureRows, [paid], activeSession] = await Promise.all([
    db.query.feeStructures.findMany({
      where: eq(feeStructures.classId, student.classId),
      orderBy: (s, { asc }) => [asc(s.type)],
    }),
    db
      .select({ total: sql<string>`coalesce(sum(${feePayments.amount}::numeric),0)` })
      .from(feePayments)
      .where(eq(feePayments.studentId, student.id)),
    db.query.academicSessions.findFirst({ where: eq(academicSessions.isActive, true) }),
  ]);

  const expected = expectedForSession(structureRows, activeSession?.startDate ?? null, student.admissionDate);
  const paidAmt = Number(paid.total);
  const pending = structureRows.length > 0 ? Math.max(0, expected - paidAmt) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Reveal>
        <div className="flex items-center gap-3">
          <Link href="/admin/fees/collect">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Collect Fees</h2>
            <p className="text-sm text-slate-500">{student.class.name} ki structure ke basis par</p>
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

      {/* Student header */}
      <Reveal delay={60}>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-emerald-600/[0.07] to-teal-600/[0.07] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30">
              {student.user.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-900">{student.user.name}</p>
              <p className="font-mono text-xs text-slate-500">
                {student.admissionNo} • {student.class.name}
                {student.section ? ` ${student.section.name}` : ""}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Session {activeSession?.name}</p>
            <p className="text-xs text-slate-500">
              Expected {inr(expected)} • Paid {inr(paidAmt)}
            </p>
            {pending !== null && (
              <p className={`flex items-center justify-end gap-1 text-sm font-bold ${pending > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                {pending > 0 && <AlertTriangle className="h-3.5 w-3.5" />}
                {pending > 0 ? `Due ${inr(pending)}` : "All clear ✓"}
              </p>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delay={110}>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-5 w-5 text-emerald-600" /> Payment Details
            </CardTitle>
            <CardDescription>Type tick karo, amount adjust karo, mode chuno — receipt turant banegi</CardDescription>
          </CardHeader>
          <CardContent>
            <CollectForm
              studentId={student.id}
              structures={structureRows.map((s) => ({
                id: s.id,
                type: s.type,
                amount: Number(s.amount),
                frequency: s.frequency,
              }))}
              pending={pending}
            />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
