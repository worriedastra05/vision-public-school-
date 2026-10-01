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

/** Oxford calm: icon flat ink tile me, gold micro-rule number ke neeche */
const tileStyles = {
  indigo: "bg-brand-800 text-gold-300",
  emerald: "bg-brand-800 text-gold-300",
  amber: "bg-brand-800 text-gold-300",
  rose: "bg-brand-800 text-gold-300",
  sky: "bg-brand-800 text-gold-300",
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
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
              tileStyles[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-[26px] font-bold leading-none tracking-tight text-slate-900 dark:text-slate-100">
              {typeof value === "number" ? <CountUp target={value} /> : value}
            </p>
            <div className="mt-1.5 h-px w-6 bg-gold-500/70" />
            <p className="mt-1.5 truncate text-[13px] text-slate-500 dark:text-slate-400">{label}</p>
            {hint && <p className="truncate text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
