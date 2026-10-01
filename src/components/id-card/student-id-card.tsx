import { GraduationCap, Phone, MapPin, Droplets, CalendarDays } from "lucide-react";

export interface IdCardStudent {
  name: string;
  admissionNo: string;
  className: string;
  sectionName: string | null;
  rollNo: number | null;
  dob: string | null;
  bloodGroup: string | null;
  parentPhone: string | null;
  address: string | null;
  photo: string | null;
}

/**
 * CR80-style ID card — FRONT + BACK (QR on the back only).
 * On-screen: 340×214px premium design. Prints at actual card size.
 */
export function StudentIdCardFront({
  student,
  schoolName,
  sessionName,
}: {
  student: IdCardStudent;
  schoolName: string;
  sessionName: string;
}) {
  return (
    <div className="id-card relative h-[214px] w-[340px] shrink-0 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200 print:shadow-none">
      {/* Header strip */}
      <div className="flex h-12 items-center gap-2 bg-gradient-to-r from-brand-700 via-brand-600 to-violet-700 px-3 text-white">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-bold tracking-tight">{schoolName}</p>
          <p className="text-[8px] tracking-widest text-white/70">STUDENT IDENTITY CARD</p>
        </div>
      </div>

      <div className="flex gap-3 p-3">
        {/* Photo */}
        <div className="shrink-0">
          {student.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={student.photo}
              alt={student.name}
              className="h-24 w-20 rounded-lg border-2 border-brand-100 object-cover"
            />
          ) : (
            <div className="flex h-24 w-20 items-center justify-center rounded-lg border-2 border-brand-100 bg-gradient-to-br from-brand-50 to-violet-50 text-3xl font-bold text-brand-300">
              {student.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold leading-tight text-slate-900">{student.name}</h3>
          <p className="mt-0.5 font-mono text-[9px] text-slate-500">{student.admissionNo}</p>
          <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-widest text-slate-400">Class</p>
              <p className="text-[11px] font-bold text-slate-800">
                {student.className}
                {student.sectionName ? `-${student.sectionName}` : ""}
              </p>
            </div>
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-widest text-slate-400">Roll No</p>
              <p className="text-[11px] font-bold text-slate-800">{student.rollNo ?? "—"}</p>
            </div>
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-widest text-slate-400">DOB</p>
              <p className="text-[11px] font-bold text-slate-800">{student.dob ?? "—"}</p>
            </div>
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-widest text-slate-400">Blood</p>
              <p className="text-[11px] font-bold text-slate-800">{student.bloodGroup ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-3 py-1.5">
        <p className="flex items-center gap-1 text-[8px] text-slate-500">
          <Phone className="h-2.5 w-2.5" /> {student.parentPhone ?? "—"}
        </p>
        <p className="text-[8px] font-bold tracking-wide text-brand-600">Session {sessionName}</p>
      </div>
    </div>
  );
}

export function StudentIdCardBack({
  student,
  schoolName,
  qrSvgMarkup,
  validThrough,
}: {
  student: IdCardStudent;
  schoolName: string;
  qrSvgMarkup: string;
  validThrough: string;
}) {
  return (
    <div className="id-card relative h-[214px] w-[340px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-brand-700 via-brand-800 to-violet-900 text-white shadow-lg ring-1 ring-slate-200 print:shadow-none">
      <div className="pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -right-10 h-44 w-44 rounded-full bg-fuchsia-400/10 blur-2xl" />

      <div className="flex h-full gap-3 p-3.5">
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/70">{schoolName}</p>
          <h3 className="mt-1 text-[14px] font-bold leading-tight">{student.name}</h3>
          <p className="font-mono text-[9px] text-white/60">{student.admissionNo}</p>

          <div className="mt-2.5 space-y-1.5 text-[9px] leading-relaxed text-white/80">
            <p className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 shrink-0 text-white/50" /> {student.parentPhone ?? "—"}
            </p>
            <p className="flex items-center gap-1.5">
              <Droplets className="h-3 w-3 shrink-0 text-white/50" /> Blood Group: {student.bloodGroup ?? "—"}
            </p>
            <p className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-white/50" />
              <span className="line-clamp-2">{student.address ?? "See school records"}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3 shrink-0 text-white/50" /> Valid through: {validThrough}
            </p>
          </div>

          <p className="mt-auto rounded-md bg-white/10 px-2 py-1 text-[7px] leading-tight text-white/70 backdrop-blur">
            This card is school property — if found, please return it to the school office. Scan the QR code to verify validity.
          </p>
        </div>

        {/* QR */}
        <div className="flex shrink-0 flex-col items-center justify-center gap-1.5">
          <div
            className="rounded-lg bg-white p-2 shadow-inner"
            dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
          />
          <p className="text-[7px] font-semibold tracking-widest text-white/60">SCAN TO VERIFY</p>
        </div>
      </div>
    </div>
  );
}
