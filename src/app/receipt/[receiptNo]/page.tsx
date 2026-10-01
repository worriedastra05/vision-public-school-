import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { feePayments, settings } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { amountInWords, inr, parseRemarks } from "@/lib/fees-calcs";
import { PrintButton } from "@/components/print-button";
import { ArrowLeft, BadgeCheck, GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

const MODE_STYLE: Record<string, string> = {
  CASH: "bg-amber-100 text-amber-800 border-amber-200",
  UPI: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CHEQUE: "bg-sky-100 text-sky-800 border-sky-200",
  ONLINE: "bg-violet-100 text-violet-800 border-violet-200",
};

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ receiptNo: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const session = await requireUser();
  const { receiptNo } = await params;
  const { new: isNew } = await searchParams;

  const payment = await db.query.feePayments.findFirst({
    where: eq(feePayments.receiptNo, decodeURIComponent(receiptNo)),
    with: {
      student: { with: { user: true, class: true, section: true } },
      receivedBy: true,
    },
  });
  if (!payment) notFound();

  // Ownership: admin/superadmin see everything; students only their own
  if (session.user.role === "STUDENT") {
    if (payment.student.userId !== session.user.id) redirect("/student/fees");
  }

  const { items, note } = parseRemarks(payment.remarks);
  const [schoolNameRow, schoolTagRow] = await Promise.all([
    db.query.settings.findFirst({ where: eq(settings.key, "school_name") }),
    db.query.settings.findFirst({ where: eq(settings.key, "school_tagline") }),
  ]);
  const schoolName = schoolNameRow?.value ?? "Vision Public School";

  const backHref = session.user.role === "STUDENT" ? "/student/fees" : "/admin/fees";
  const amount = Number(payment.amount);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      {/* New payment celebration */}
      {isNew && (
        <div className="mx-auto mb-4 flex max-w-2xl animate-fade-up items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 print:hidden">
          <BadgeCheck className="h-4.5 w-4.5" /> Payment recorded! Your receipt is ready below — you can Print/PDF it.
        </div>
      )}

      <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between print:hidden">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <PrintButton />
      </div>

      {/* ═══ THE RECEIPT ═══ */}
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-300/60 ring-1 ring-slate-200 print:shadow-none print:ring-slate-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-violet-700 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">{schoolName}</h1>
                <p className="text-xs text-white/70">{schoolTagRow?.value ?? "Excellence in Education"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Fee Receipt</p>
              <p className="font-mono text-sm font-bold">{payment.receiptNo}</p>
            </div>
          </div>
        </div>

        {/* Watermark paid stamp */}
        <div className="relative">
          <div className="pointer-events-none absolute right-6 top-6 rotate-[8deg] rounded-lg border-[3px] border-emerald-500/60 px-3 py-1 text-xl font-black uppercase tracking-widest text-emerald-500/60">
            PAID
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-3 gap-4 border-b border-dashed border-slate-200 px-8 py-5 text-sm">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Date</p>
              <p className="mt-0.5 font-semibold text-slate-800">
                {payment.date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-xs text-slate-400">
                {payment.date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Mode</p>
              <span className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${MODE_STYLE[payment.mode]}`}>
                {payment.mode}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Received By</p>
              <p className="mt-0.5 font-semibold text-slate-800">{payment.receivedBy?.name ?? "—"}</p>
            </div>
          </div>

          {/* Student */}
          <div className="border-b border-dashed border-slate-200 px-8 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Received From</p>
            <p className="mt-1 text-base font-bold text-slate-900">{payment.student.user.name}</p>
            <p className="text-sm text-slate-500">
              Adm. No. <span className="font-mono font-semibold">{payment.student.admissionNo}</span> •{" "}
              {payment.student.class.name}
              {payment.student.section ? ` — Section ${payment.student.section.name}` : ""}
              {payment.student.rollNo ? ` • Roll ${payment.student.rollNo}` : ""}
            </p>
          </div>

          {/* Items */}
          <div className="px-8 py-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-slate-400">
                  <th className="pb-2 font-semibold">Description</th>
                  <th className="pb-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(items.length > 0 ? items : [{ label: note || "Fee payment", amount }]).map((item, i) => (
                  <tr key={i}>
                    <td className="py-2.5 text-slate-700">{item.label}</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-slate-800">
                      {inr(item.amount)}
                    </td>
                  </tr>
                ))}
                {note && items.length > 0 && (
                  <tr>
                    <td colSpan={2} className="py-2 text-xs italic text-slate-400">
                      Note: {note}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-800">
                  <td className="py-3 text-base font-bold text-slate-900">TOTAL</td>
                  <td className="py-3 text-right font-mono text-lg font-bold text-emerald-600">{inr(amount)}</td>
                </tr>
              </tfoot>
            </table>
            <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-xs italic text-slate-500">
              {amountInWords(amount)}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between border-t border-dashed border-slate-200 px-8 py-5">
            <p className="max-w-56 text-[10px] leading-relaxed text-slate-400">
              This is a computer generated receipt — no signature required. For queries, contact the school office.
            </p>
            <div className="text-center">
              <div className="h-10 w-36 border-b border-slate-300" />
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Authorised Signatory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
