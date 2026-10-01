import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-400/25 dark:bg-brand-400/10 dark:text-brand-200",
        success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300",
        warning: "border-gold-300 bg-gold-50 text-gold-800 dark:border-gold-400/30 dark:bg-gold-400/10 dark:text-gold-300",
        danger: "border-red-200 bg-red-50 text-red-800 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-300",
        outline: "border-slate-300 text-slate-600 dark:border-white/15 dark:text-slate-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
