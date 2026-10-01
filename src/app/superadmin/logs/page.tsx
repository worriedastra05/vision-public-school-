import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { activityLogs, users } from "@/db/schema";
import { requireRole } from "@/lib/guards";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollText, Search, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

const ACTION_STYLE: Record<string, string> = {
  "admin.create": "bg-emerald-100 text-emerald-700",
  "admin.activate": "bg-emerald-100 text-emerald-700",
  "admin.deactivate": "bg-rose-100 text-rose-700",
  "admin.reset-password": "bg-amber-100 text-amber-700",
  "settings.update": "bg-indigo-100 text-indigo-700",
  "student.create": "bg-sky-100 text-sky-700",
  "student.update": "bg-sky-100 text-sky-700",
  "student.deactivate": "bg-rose-100 text-rose-700",
  "fee.payment": "bg-emerald-100 text-emerald-700",
  "fee.payment.delete": "bg-rose-100 text-rose-700",
  "exam.create": "bg-violet-100 text-violet-700",
  "exam.publish": "bg-violet-100 text-violet-700",
};

export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  await requireRole("SUPERADMIN");

  const query = (q ?? "").trim();
  const rows = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      details: activityLogs.details,
      createdAt: activityLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
      userRole: users.role,
    })
    .from(activityLogs)
    .leftJoin(users, eq(users.id, activityLogs.userId))
    .where(
      query
        ? and(or(ilike(activityLogs.action, `%${query}%`), ilike(activityLogs.details, `%${query}%`)))
        : undefined
    )
    .orderBy(desc(activityLogs.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <ScrollText className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Activity Logs</h1>
              <p className="text-sm text-slate-500">Who did what, and when — the complete audit trail (latest 200).</p>
            </div>
          </div>
          <form className="flex gap-2">
            <Input name="q" defaultValue={query} placeholder="Search action / details…" className="w-56" />
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {query ? `${rows.length} results for "${query}"` : `${rows.length} recent entries`}
            </CardTitle>
            <CardDescription>Every important action is recorded here — it is never deleted.</CardDescription>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
                <Inbox className="h-8 w-8 text-slate-300" />
                {query ? "Nothing found for this search" : "No activity yet — everything will appear here once work begins"}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <div key={r.id} className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-center sm:gap-4">
                    <span className="w-36 shrink-0 text-xs tabular-nums text-slate-400">
                      {r.createdAt.toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span
                      className={`w-fit shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                        ACTION_STYLE[r.action] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {r.action}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-600">{r.details ?? "—"}</span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                      {r.userName ?? "System"}
                      <Badge variant="outline" className="text-[10px]">
                        {r.userRole ?? "—"}
                      </Badge>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
