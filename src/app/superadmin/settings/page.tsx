import { db } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { saveSettings } from "@/lib/actions/settings";
import { SETTING_KEYS } from "@/lib/settings-keys";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const DEFAULTS: Record<string, string> = {
  school_name: "Vision Public School",
  school_tagline: "Education • Discipline • Excellence",
  school_address: "Main Road, Patna, Bihar 800001",
  school_phone: "+91 98765 43210",
  school_email: "info@visionpublicschool.edu",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { ok, err } = await searchParams;
  await requireRole("SUPERADMIN");

  const rows = await db.query.settings.findMany();
  const get = (key: string) => rows.find((r) => r.key === key)?.value ?? DEFAULTS[key] ?? "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Reveal>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-lg shadow-slate-500/25">
            <Settings className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">School Settings</h1>
            <p className="text-sm text-slate-500">
              Ye details ID cards, receipts aur poore portal me live hoti hain.
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

      <Reveal delay={120}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">School Ki Jankari</CardTitle>
            <CardDescription>
              Save karte hi ID Cards, Fee Receipts aur Verify page sab par turant reflect hoga.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <form action={saveSettings} className="space-y-4">
              {SETTING_KEYS.map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={key}>{label}</Label>
                  <Input id={key} name={key} defaultValue={get(key)} />
                </div>
              ))}
              <Button type="submit" className="w-full sm:w-auto">
                <Save className="h-4 w-4" /> Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={200}>
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-5">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-800">Tip:</span> Session year jaisi cheezein{" "}
            <span className="font-medium">Classes section</span> ke academic session se aati hain — ID card ki
            &quot;Valid Through&quot; date session ke end se banti hai.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
