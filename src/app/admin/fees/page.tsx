import Link from "next/link";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { feePayments, students, users } from "@/db/schema";
import { deletePayment } from "@/lib/actions/fees";
import { requireRole } from "@/lib/guards";
import { inr, parseRemarks } from "@/lib/fees-calcs";
import { Reveal } from "@/components/motion";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmit } from "@/components/forms/confirm-submit";
import {
  Wallet, IndianRupee, CalendarDays, TrendingUp, Users, Plus, Settings2,
  ReceiptText, Trash2, CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { deleted } = await searchParams;

  const now = new Date();
  const todayIST = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
  const monthStart = `${todayIST.slice(0, 7)}-01`;

  const [rows, [{ todayTotal }], [{ monthTotal }], [{ allTotal }], studentCount] = await Promise.all([
    db.query.feePayments.findMany({
      orderBy: [desc(feePayments.date)],
      limit: 15,
      with: { student: { with: { user: true, class: true } } },
    }),
    db
      .select({ todayTotal: sql<string>`coalesce(sum(${feePayments.amount}::numeric),0)` })
      .from(feePayments)
      .where(gte(feePayments.date, new Date(todayIST + "T00:00:00+05:30"))),
    db
      .select({ monthTotal: sql<string>`coalesce(sum(${feePayments.amount}::numeric),0)` })
      .from(feePayments)
      .where(gte(feePayments.date, new Date(monthStart + "T00:00:00+05:30"))),
    db
      .select({ allTotal: sql<string>`coalesce(sum(${feePayments.amount}::numeric),0)` })
      .from(feePayments),
    db.$count(students),
  ]);
  void and; void eq; void users;

  const fmt = (s: string) => inr(Number(s));

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Fees & Receipts</h2>
            <p className="text-sm text-slate-500">Collections ka poora hisaab — receipts auto-generate hoti hain</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/fees/structure">
              <Button variant="outline">
                <Settings2 className="h-4 w-4" /> Fee Structure
              </Button>
            </Link>
            <Link href="/admin/fees/collect">
              <Button>
                <Plus className="h-4 w-4" /> Collect Payment
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>

      {deleted && (
        <Reveal>
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4.5 w-4.5" /> Payment delete ho gaya
          </div>
        </Reveal>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Collection" value={fmt(todayTotal)} icon={IndianRupee} accent="emerald" delay={80} />
        <StatCard label="This Month" value={fmt(monthTotal)} icon={CalendarDays} accent="sky" delay={160} />
        <StatCard label="Total Collected" value={fmt(allTotal)} icon={TrendingUp} accent="indigo" delay={240} />
        <StatCard label="Students" value={studentCount} icon={Users} accent="amber" hint="fee payers" delay={320} />
      </div>

      <Reveal delay={280}>
        <Card className="card-hover overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5">
            <ReceiptText className="h-4.5 w-4.5 text-brand-600" />
            <h3 className="font-semibold text-slate-800">Recent Payments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Receipt</th>
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-5 py-3 font-semibold">Items</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Mode</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((p) => {
                  const { items, note } = parseRemarks(p.remarks);
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-brand-50/60">
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-brand-700">{p.receiptNo}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{p.student.user.name}</p>
                        <p className="font-mono text-[10px] text-slate-400">{p.student.admissionNo}</p>
                      </td>
                      <td className="max-w-56 px-5 py-3">
                        <p className="truncate text-xs text-slate-600" title={items.map((i) => i.label).join(", ")}>
                          {items.length > 0 ? items.map((i) => i.label.split(" (")[0]).join(", ") : note || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3 font-mono font-bold text-slate-800">{inr(Number(p.amount))}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className="border-slate-200 bg-slate-50">{p.mode}</Badge>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {p.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        <span className="text-slate-400"> {p.date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/receipt/${p.receiptNo}`}>
                            <Button size="sm" variant="outline">
                              <ReceiptText className="h-3.5 w-3.5" /> Receipt
                            </Button>
                          </Link>
                          <form action={deletePayment} className="inline">
                            <input type="hidden" name="id" value={p.id} />
                            <ConfirmSubmit
                              message={`Receipt ${p.receiptNo} (${inr(Number(p.amount))}) delete karein?`}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </ConfirmSubmit>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <div className="p-12 text-center">
              <Wallet className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                Abhi koi payment nahi — pehli payment collect karo, receipt turant banegi!
              </p>
            </div>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
