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
            <p className="text-sm text-slate-500">Sab jagah kaam aayega — file me print karke laminate karwao</p>
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
                Koi bhi QR scan karke aapke card ki validity confirm kar sakta hai — direct school
                ke live records par le jaata hai.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Camera className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Photo add karwana hai?</p>
              <p className="text-xs leading-relaxed text-slate-500">
                Agar photo nahi dikhi to school office me passport-size photo jama karwao —
                admin admission form me upload karega.
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
                Print karte waqt <strong>Actual size / 100%</strong> scale rakho — card CR80 size
                (credit card size) ka banta hai.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
