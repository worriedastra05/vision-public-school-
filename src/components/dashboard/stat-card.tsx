import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "indigo" | "emerald" | "amber" | "rose" | "sky";
  hint?: string;
}

const accents = {
  indigo: "bg-indigo-100 text-indigo-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
  sky: "bg-sky-100 text-sky-600",
};

export function StatCard({ label, value, icon: Icon, accent = "indigo", hint }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="truncate text-sm text-slate-500">{label}</p>
          {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
