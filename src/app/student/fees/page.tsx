import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { academicSessions, feePayments, feeStructures, students } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { expectedForSession, inr, parseRemarks } from "@/lib/fees-calcs";
import { Reveal } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, IndianRupee, ReceiptText, TrendingUp, AlertTriangle, BadgeCheck, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentFeesPage() {
  const session = await requireUser();
  if (session.user.role !== "STUDENT") redirect("/");

  const student = await db.query.students.findFirst({
    where: eq(students.userId, session.user.id),
    with: { class: true },
  });
  if (!student) redirect("/student/dashboard");

  const [structureRows, payments, [paid], activeSession] = await Promise.all([
    db.query.feeStructures.findMany({ where: eq(feeStructures.classId, student.classId) }),
    db.query.feePayments.findMany({
      where: eq(feePayments.studentId, student.id),
      orderBy: [desc(feePayments.date)],
    }),
    db
      .select({ total: sql<string>`coalesce(sum(${feePayments.amount}::numeric),0)` })
      .from(feePayments)
      .where(eq(feePayments.studentId, student.id)),
    db.query.academicSessions.findFirst({ where: eq(academicSessions.isActive, true) }),
  ]);

  const expected = expectedForSession(structureRows, activeSession?.startDate ?? null, student.admissionDate);
  const paidAmt = Number(paid.total);
  const due = Math.max(0, expected - paidAmt);

  const cards = [
    { label: `Expected (${activeSession?.name ?? "Session"})`, value: inr(expected), grad: "from-sky-500 to-cyan-600", icon: TrendingUp },
    { label: "Paid", value: inr(paidAmt), grad: "from-emerald-500 to-teal-600", icon: BadgeCheck },
    { label: "Due", value: due > 0 ? inr(due) : "₹0", grad: due > 0 ? "from-amber-500 to-orange-600" : "from-emerald-500 to-teal-600", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <Reveal>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">My Fees</h2>
          <p className="text-sm text-slate-500">{student.class.name} ki fee structure ke basis par</p>
        </div>
      </Reveal>

      {/* Status banner — Oxford navy + gold */}
      <Reveal delay={60}>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-950 p-5 text-white shadow-[0_20px_50px_-24px_rgba(19,31,54,0.5)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="glow-ring flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/40 bg-ink-900">
                <Wallet className="h-5.5 w-5.5 text-gold-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">
                  {due > 0 ? "Aapki fees pending hai" : "Sab fees clear hai!"}
                </p>
                <p className={`font-display text-2xl font-bold tracking-tight ${due > 0 ? "text-gold-400" : "text-emerald-400"}`}>
                  {due > 0 ? `${inr(due)} due` : "No dues"}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Session {activeSession?.name} • {payments.length} payment{payments.length !== 1 ? "s" : ""} made
            </p>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={100 + i * 70}>
            <div className="card-hover relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(19,31,54,0.04)] dark:border-white/10 dark:bg-ink-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{c.label}</p>
                  <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{c.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-800 text-gold-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <c.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Payment history */}
      <Reveal delay={180}>
        <Card className="card-hover overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5">
            <ReceiptText className="h-4.5 w-4.5 text-brand-600" />
            <h3 className="font-semibold text-slate-800">Payment History</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {payments.map((p) => {
              const { items, note } = parseRemarks(p.remarks);
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-brand-50/60">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <IndianRupee className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-bold text-slate-800">{p.receiptNo}</p>
                      <p className="max-w-64 truncate text-xs text-slate-400">
                        {items.length > 0 ? items.map((i) => i.label.split(" (")[0]).join(", ") : note || "Fee payment"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono font-bold text-slate-900">{inr(Number(p.amount))}</p>
                      <p className="text-[11px] text-slate-400">
                        {p.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}{" "}
                        <Badge variant="outline" className="ml-1 border-slate-200 py-0 text-[9px]">{p.mode}</Badge>
                      </p>
                    </div>
                    <Link
                      href={`/receipt/${p.receiptNo}`}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                    >
                      Receipt
                    </Link>
                  </div>
                </div>
              );
            })}
            {payments.length === 0 && (
              <div className="p-10 text-center">
                <ReceiptText className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">Abhi koi payment nahi — school office me jama karo to yahan dikhegi</p>
              </div>
            )}
          </div>
        </Card>
      </Reveal>

      <Reveal delay={220}>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Fees sirf school office / counter par jama hoti hai — online payment feature future phase me aayega.
          Receipt download karke apne paas rakh lein.
        </p>
      </Reveal>
    </div>
  );
}
