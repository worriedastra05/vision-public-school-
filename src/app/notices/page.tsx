import { eq, isNull, or, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { notices, students } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { DashboardShell } from "@/components/dashboard/shell";
import { Reveal } from "@/components/motion";
import { Bell, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ROLE_META = {
  SUPERADMIN: { label: "Super Admin", variant: "warning" as const },
  ADMIN: { label: "Admin", variant: "success" as const },
  STUDENT: { label: "Student", variant: "default" as const },
};

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const session = await requireUser();
  const role = session.user.role;

  // Student ho to uski class ke target notices bhi include karo
  let studentClassId: string | null = null;
  if (role === "STUDENT") {
    const student = await db.query.students.findFirst({
      where: eq(students.userId, session.user.id),
    });
    studentClassId = student?.classId ?? null;
  }

  const rows = await db.query.notices.findMany({
    where:
      role === "STUDENT"
        ? or(
            isNull(notices.targetRole),
            eq(notices.targetRole, "STUDENT"),
            ...(studentClassId ? [eq(notices.targetClassId, studentClassId)] : [])
          )
        : undefined, // admin / superadmin sab dekhte hain
    with: {
      createdBy: { columns: { name: true } },
      targetClass: { columns: { name: true } },
    },
    orderBy: [desc(notices.createdAt)],
    limit: 50,
  });

  const meta = ROLE_META[role as keyof typeof ROLE_META] ?? ROLE_META.STUDENT;

  return (
    <DashboardShell
      role={role === "SUPERADMIN" ? "SUPERADMIN" : role === "ADMIN" ? "ADMIN" : "STUDENT"}
      userName={session.user.name ?? "User"}
      userEmail={session.user.email ?? ""}
      roleBadge={meta.label}
      roleBadgeVariant={meta.variant}
      pageTitle="Notice Board"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <Reveal>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Notice Board</h2>
              <p className="text-sm text-slate-500">
                {rows.length} announcement{rows.length === 1 ? "" : "s"}
                {role === "STUDENT" ? " — aapke liye" : " — poori school ki"}
              </p>
            </div>
          </div>
        </Reveal>

        {rows.length === 0 ? (
          <Reveal delay={100}>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Bell className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">Abhi koi notice nahi hai.</p>
            </div>
          </Reveal>
        ) : (
          rows.map((notice, i) => (
            <Reveal key={notice.id} delay={90 + i * 70}>
              <article className="card-hover rounded-2xl border border-slate-200 bg-white p-5 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{notice.title}</h3>
                  <div className="flex items-center gap-2">
                    {notice.targetClass && (
                      <Badge variant="default" className="border-0">{notice.targetClass.name}</Badge>
                    )}
                    {notice.targetRole && (
                      <Badge variant="warning" className="border-0">{notice.targetRole}</Badge>
                    )}
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                      {notice.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{notice.body}</p>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-brand-500">
                  — {notice.createdBy.name}
                </p>
              </article>
            </Reveal>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
