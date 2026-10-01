import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { students } from "@/db/schema";
import { StudentIdCardFront } from "@/components/id-card/student-id-card";
import { getCardData, getSchoolInfo, validThrough } from "@/lib/idcard-data";
import { GraduationCap, ShieldCheck, ShieldX } from "lucide-react";

export const dynamic = "force-dynamic";

/** PUBLIC verify page — QR scans land here (no login required) */
export default async function VerifyPage({
  params,
}: {
  params: Promise<{ admissionNo: string }>;
}) {
  const { admissionNo } = await params;

  const student = await db.query.students.findFirst({
    where: eq(students.admissionNo, decodeURIComponent(admissionNo).toUpperCase()),
    with: { user: true, class: true, section: true },
  });

  const school = await getSchoolInfo();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4 py-10">
      {/* Oxford damask texture + gold hairlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5l7 12-7 12-7-12zM30 31l7 12-7 12-7-12z' fill='none' stroke='%23ddbd68' stroke-width='0.8'/%3E%3C/svg%3E\")",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-3 text-white">
          <div className="glow-ring flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 bg-ink-900">
            <GraduationCap className="h-5 w-5 text-gold-400" />
          </div>
          <div className="text-left leading-tight">
            <p className="font-display text-[15px] font-bold">{school.name}</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold-500/90">
              ID Card Verification
            </p>
          </div>
        </div>
        <div className="gold-rule w-24" />

        {student ? (
          <>
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
                student.user.isActive
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                  : "border-rose-400/40 bg-rose-500/10 text-rose-300"
              }`}
            >
              {student.user.isActive ? (
                <ShieldCheck className="h-4.5 w-4.5" />
              ) : (
                <ShieldX className="h-4.5 w-4.5" />
              )}
              {student.user.isActive ? "VALID — Active Student" : "INACTIVE — Card Blocked"}
            </div>

            <StudentIdCardFront
              student={await getCardData(student)}
              schoolName={school.name}
              sessionName={school.session?.name ?? ""}
            />

            <p className="text-xs leading-relaxed text-slate-400">
              This record comes straight from the live database of{" "}
              <span className="font-semibold text-slate-300">{school.name}</span>. Valid through{" "}
              <span className="font-semibold text-slate-300">{validThrough(school.session)}</span>.
              If something does not match, please contact the school office.
            </p>
          </>
        ) : (
          <div className="w-full rounded-2xl border border-red-400/25 bg-ink-900 p-8">
            <ShieldX className="mx-auto h-10 w-10 text-red-400" />
            <p className="font-display mt-3 text-lg font-bold text-red-300">Invalid Card</p>
            <p className="mt-1 text-sm text-slate-400">
              Admission No. <span className="font-mono">{decodeURIComponent(admissionNo)}</span>{" "}
              was not found in our records — this card may be FAKE.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
