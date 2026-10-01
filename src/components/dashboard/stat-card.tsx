import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CountUp } from "./count-up";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "indigo" | "emerald" | "amber" | "rose" | "sky";
  hint?: string;
  delay?: number;
}

const accents = {
  indigo: "from-indigo-500 to-violet-600 shadow-indigo-500/30",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
  amber: "from-amber-500 to-orange-600 shadow-amber-500/30",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/30",
  sky: "from-sky-500 to-cyan-600 shadow-sky-500/30",
};

/**
 * SERVER component (icon prop sirf server side render hota hai).
 * Count-up animation alag chhote client component me — production RSC-safe.
 */
export function StatCard({ label, value, icon: Icon, accent = "indigo", hint, delay = 0 }: StatCardProps) {
  return (
    <div className="animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <Card className="card-hover">
        <CardContent className="flex items-center gap-4 p-5">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
              accents[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tracking-tight text-slate-900">
              {typeof value === "number" ? <CountUp target={value} /> : value}
            </p>
            <p className="truncate text-sm text-slate-500">{label}</p>
            {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
