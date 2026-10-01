import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { addFeeStructure, deleteFeeStructure } from "@/lib/actions/fees";
import { requireRole } from "@/lib/guards";
import { inr } from "@/lib/fees-calcs";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmSubmit } from "@/components/forms/confirm-submit";
import { ArrowLeft, Plus, Trash2, IndianRupee, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const FREQ_LABEL: Record<string, string> = { MONTHLY: " monthly", TERM: " per term", ONE_TIME: " one-time" };

export default async function FeeStructurePage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string; deleted?: string; err?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { added, deleted, err } = await searchParams;

  const classRows = await db.query.classes.findMany({
    with: { feeStructures: true },
    orderBy: (c, { asc: a }) => [a(c.name)],
  });
  void asc;

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex items-center gap-3">
          <Link href="/admin/fees">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Fee Structure</h2>
            <p className="text-sm text-slate-500">Har class ke fee types — collect par yahi options dikhenge</p>
          </div>
        </div>
      </Reveal>

      {(added || deleted || err) && (
        <Reveal>
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
              err ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {err ? <XCircle className="h-4.5 w-4.5" /> : <CheckCircle2 className="h-4.5 w-4.5" />}
            {err ?? (added ? `"${added}" add hua` : "Structure delete hua")}
          </div>
        </Reveal>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {classRows.map((cls, i) => (
          <Reveal key={cls.id} delay={80 + i * 70}>
            <Card className="card-hover h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5 text-base">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30">
                    <IndianRupee className="h-4.5 w-4.5" />
                  </span>
                  {cls.name}
                </CardTitle>
                <CardDescription>{cls.feeStructures.length} fee types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  {cls.feeStructures.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3.5 py-2.5"
                    >
                      <div>
                        <span className="text-sm font-semibold text-slate-700">{s.type}</span>
                        <span className="ml-2 text-xs text-slate-400">{FREQ_LABEL[s.frequency]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-bold text-slate-800">{inr(Number(s.amount))}</span>
                        <form action={deleteFeeStructure} className="inline">
                          <input type="hidden" name="id" value={s.id} />
                          <ConfirmSubmit
                            message={`"${s.type}" structure delete karein?`}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </ConfirmSubmit>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Add type inline */}
                <form action={addFeeStructure} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
                  <input type="hidden" name="classId" value={cls.id} />
                  <Input name="type" placeholder="Tuition" className="h-9 w-28" required minLength={2} />
                  <Input name="amount" type="number" min={1} placeholder="₹1200" className="h-9 w-24" required />
                  <Select name="frequency" defaultValue="MONTHLY" className="h-9 w-32">
                    <option value="MONTHLY">Monthly</option>
                    <option value="TERM">Per Term</option>
                    <option value="ONE_TIME">One-time</option>
                  </Select>
                  <Button type="submit" size="sm" className="h-9">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      {classRows.length === 0 && (
        <Reveal delay={100}>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Pehle classes banao (Classes page se)
          </div>
        </Reveal>
      )}
    </div>
  );
}
