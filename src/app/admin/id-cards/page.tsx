import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { students, users } from "@/db/schema";
import { requireRole } from "@/lib/guards";
import { qrSvg } from "@/lib/qrcode";
import { getCardData, getOrigin, getSchoolInfo, validThrough } from "@/lib/idcard-data";
import { StudentIdCardFront, StudentIdCardBack } from "@/components/id-card/student-id-card";
import { PrintButton } from "@/components/print-button";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { IdCard, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminIdCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  await requireRole("ADMIN", "SUPERADMIN");
  const { classId } = await searchParams;

  const [classRows, school, origin] = await Promise.all([
    db.query.classes.findMany({ orderBy: (c, { asc: a }) => [a(c.name)] }),
    getSchoolInfo(),
    getOrigin(),
  ]);
  void users;

  let roster: (typeof students.$inferSelect & {
    user: { name: string };
    class: { name: string };
    section: { name: string } | null;
  })[] = [];

  if (classId) {
    roster = await db.query.students.findMany({
      where: eq(students.classId, classId),
      with: { user: true, class: true, section: true },
      orderBy: (s, { asc: a }) => [a(s.rollNo), a(s.admissionNo)],
    });
  }
  void asc;

  const selClass = classRows.find((c) => c.id === classId);

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">ID Cards</h2>
            <p className="text-sm text-slate-500">Choose a class — all cards render together and print in one go (fronts, then backs)</p>
          </div>
          <div className="flex items-center gap-2.5">
            <form method="get" className="flex items-center gap-2">
              <Select name="classId" defaultValue={classId ?? ""} className="w-44">
                <option value="">Select class...</option>
                {classRows.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="outline">
                Load
              </Button>
            </form>
            {roster.length > 0 && <PrintButton />}
          </div>
        </div>
      </Reveal>

      {!classId && (
        <Reveal delay={80}>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center print:hidden">
            <IdCard className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">Choose a class above — the cards will be built here</p>
          </div>
        </Reveal>
      )}

      {classId && roster.length === 0 && (
        <Reveal delay={80}>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center print:hidden">
            <Users className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">{selClass?.name} has no students</p>
          </div>
        </Reveal>
      )}

      {roster.length > 0 && (
        <>
          {/* Fronts */}
          <Reveal delay={100}>
            <div className="print:hidden">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">
                {selClass?.name} — FRONT ({roster.length} cards)
              </h3>
            </div>
            <div className="flex flex-wrap items-start gap-5">
              {await Promise.all(
                roster.map(async (s) => (
                  <StudentIdCardFront
                    key={s.id}
                    student={await getCardData(s)}
                    schoolName={school.name}
                    sessionName={school.session?.name ?? ""}
                  />
                ))
              )}
            </div>
          </Reveal>

          {/* Page break for print */}
          <div className="page-break" />

          {/* Backs */}
          <Reveal delay={150}>
            <div className="print:hidden">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">BACK</h3>
            </div>
            <div className="flex flex-wrap items-start gap-5">
              {await Promise.all(
                roster.map(async (s) => {
                  const cardData = await getCardData(s);
                  const qr = await qrSvg(`${origin}/verify/${s.admissionNo}`, 88);
                  return (
                    <StudentIdCardBack
                      key={s.id}
                      student={cardData}
                      schoolName={school.name}
                      qrSvgMarkup={qr}
                      validThrough={validThrough(school.session)}
                    />
                  );
                })
              )}
            </div>
          </Reveal>
        </>
      )}

      <p className="text-xs text-slate-400 print:hidden">
        Print tip: keep the scale at <strong>Actual size</strong> on A4 — fronts first, backs on the next page. Do get the cards laminated.
      </p>
    </div>
  );
}
