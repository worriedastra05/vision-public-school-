import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { students } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { qrSvg } from "@/lib/qrcode";
import { getCardData, getOrigin, getSchoolInfo, validThrough } from "@/lib/idcard-data";
import { StudentIdCardFront, StudentIdCardBack } from "@/components/id-card/student-id-card";
import { PrintButton } from "@/components/print-button";
import { Reveal } from "@/components/motion";
import { IdCard, Camera, QrCode } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyIdCardPage() {
  const session = await requireUser();
  if (session.user.role !== "STUDENT") redirect("/");

  const student = await db.query.students.findFirst({
    where: eq(students.userId, session.user.id),
    with: { user: true, class: true, section: true },
  });
  if (!student) redirect("/student/dashboard");

  const [school, origin] = await Promise.all([getSchoolInfo(), getOrigin()]);
  const verifyUrl = `${origin}/verify/${student.admissionNo}`;
  const qr = await qrSvg(verifyUrl, 88);
  const cardData = await getCardData(student);

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">My ID Card</h2>
            <p className="text-sm text-slate-500">Valid everywhere — print it using the button and get it laminated</p>
          </div>
          <PrintButton />
        </div>
      </Reveal>

      <div className="flex flex-wrap items-start gap-6">
        <Reveal delay={80}>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 print:hidden">Front</p>
            <StudentIdCardFront
              student={cardData}
              schoolName={school.name}
              sessionName={school.session?.name ?? ""}
            />
          </div>
        </Reveal>
        <Reveal delay={160}>
          <div className="space-y-2 print:page-break">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 print:hidden">Back</p>
            <StudentIdCardBack
              student={cardData}
              schoolName={school.name}
              qrSvgMarkup={qr}
              validThrough={validThrough(school.session)}
            />
          </div>
        </Reveal>
      </div>

      <Reveal delay={220}>
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <QrCode className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">QR Code Verification</p>
              <p className="text-xs leading-relaxed text-slate-500">
                Anyone can scan the QR code to confirm your card&apos;s validity — it leads
                straight to the school&apos;s live records.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Camera className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Want to change your photo?</p>
              <p className="text-xs leading-relaxed text-slate-500">
                Upload a passport-size photo yourself from the Profile page, or ask the
                school office to do it — the card updates instantly.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <IdCard className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Print tip</p>
              <p className="text-xs leading-relaxed text-slate-500">
                While printing keep the scale at <strong>Actual size / 100%</strong> — the card
                is CR80 sized (credit-card size).
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
