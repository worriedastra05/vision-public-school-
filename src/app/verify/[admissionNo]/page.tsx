import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { students } from "@/db/schema";
import { StudentIdCardFront } from "@/components/id-card/student-id-card";
import { getCardData, getSchoolInfo, validThrough } from "@/lib/idcard-data";
import { GraduationCap, ShieldCheck, ShieldX } from "lucide-react";

export const dynamic = "force-dynamic";

/** PUBLIC verify page — QR scan se yahin aata hai (login nahi chahiye) */
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b16] px-4 py-10">
      <div className="pointer-events-none absolute left-1/4 top-0 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-2.5 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-lg shadow-brand-600/40">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="text-left leading-tight">
            <p className="text-sm font-bold">{school.name}</p>
            <p className="text-[10px] tracking-widest text-slate-400">ID CARD VERIFICATION</p>
          </div>
        </div>

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
              Ye record <span className="font-semibold text-slate-300">{school.name}</span> ke
              live database se hai. Valid through{" "}
              <span className="font-semibold text-slate-300">{validThrough(school.session)}</span>.
              Mismatch mile to school office se contact karein.
            </p>
          </>
        ) : (
          <div className="w-full rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 backdrop-blur">
            <ShieldX className="mx-auto h-10 w-10 text-rose-400" />
            <p className="mt-3 text-lg font-bold text-rose-300">Invalid Card</p>
            <p className="mt-1 text-sm text-rose-200/70">
              Admission No. <span className="font-mono">{decodeURIComponent(admissionNo)}</span>{" "}
              humare records me nahi mila — ye card FARZI ho sakta hai.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
