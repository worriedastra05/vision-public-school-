import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { requireRole } from "@/lib/guards";
import { createAdmin, toggleAdminActive, resetAdminPassword } from "@/lib/actions/admins";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserPlus, KeyRound, Power, PowerOff } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { ok, err } = await searchParams;
  await requireRole("SUPERADMIN");

  const admins = await db.query.users.findMany({
    where: eq(users.role, "ADMIN"),
    orderBy: [desc(users.createdAt)],
  });

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25">
            <ShieldCheck className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Admin Accounts</h1>
            <p className="text-sm text-slate-500">
              School ke staff-admins yahan banao, access on/off karo, password reset karo.
            </p>
          </div>
        </div>
      </Reveal>

      {ok && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {ok}
        </div>
      )}
      {err && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {err}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* ── Naya Admin ── */}
        <Reveal delay={100}>
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-rose-50 to-pink-50">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4.5 w-4.5 text-rose-600" /> Naya Admin Banao
              </CardTitle>
              <CardDescription>Credentials admin ko personally dena — password dobara nahi dikhega.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form action={createAdmin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Poora naam</Label>
                  <Input id="name" name="name" placeholder="e.g. Rakesh Kumar" required minLength={2} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email (login ID)</Label>
                  <Input id="email" name="email" type="email" placeholder="admin2@school.edu" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="text" placeholder="Min 8 characters" required minLength={8} />
                  <p className="text-xs text-slate-400">Text rakha hai taki aap copy kar sakte — uske baad admin khud change kar le.</p>
                </div>
                <Button type="submit" className="w-full">
                  <UserPlus className="h-4 w-4" /> Admin Banayo
                </Button>
              </form>
            </CardContent>
          </Card>
        </Reveal>

        {/* ── Admin List ── */}
        <Reveal delay={180}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Admin Accounts ({admins.length})</CardTitle>
              <CardDescription>Deactivate karte hi admin ka login turant band. Data safe rehta hai.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {admins.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                  Abhi koi admin nahi — left se pehla banayo.
                </p>
              )}
              {admins.map((a) => (
                <div
                  key={a.id}
                  className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                    a.isActive ? "border-slate-200 bg-white" : "border-rose-100 bg-rose-50/40 opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                        a.isActive ? "bg-gradient-to-br from-rose-500 to-pink-600" : "bg-slate-300"
                      }`}
                    >
                      {(a.name ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-semibold text-slate-800">
                        {a.name}
                        <Badge variant={a.isActive ? "default" : "danger"} className="text-[10px]">
                          {a.isActive ? "ACTIVE" : "DISABLED"}
                        </Badge>
                      </p>
                      <p className="truncate text-xs text-slate-500">{a.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Password reset */}
                    <form action={resetAdminPassword} className="flex items-center gap-1.5">
                      <input type="hidden" name="adminId" value={a.id} />
                      <Input
                        name="newPassword"
                        placeholder="Naya password"
                        required
                        minLength={8}
                        className="h-8 w-36 text-xs"
                      />
                      <Button type="submit" variant="outline" size="sm" title="Password reset">
                        <KeyRound className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                    {/* Toggle active */}
                    <form action={toggleAdminActive}>
                      <input type="hidden" name="adminId" value={a.id} />
                      <Button
                        type="submit"
                        variant={a.isActive ? "danger" : "default"}
                        size="sm"
                      >
                        {a.isActive ? (
                          <>
                            <PowerOff className="h-3.5 w-3.5" /> Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="h-3.5 w-3.5" /> Activate
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
