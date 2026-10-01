import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "btn-shine bg-brand-800 text-white shadow-[0_1px_2px_rgba(19,31,54,0.25),inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600",
        gold:
          "bg-gold-500 font-semibold text-ink-950 shadow-[0_1px_2px_rgba(165,120,46,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] hover:bg-gold-400",
        outline:
          "border border-slate-300 bg-white text-slate-700 shadow-[0_1px_2px_rgba(19,31,54,0.05)] hover:border-brand-400 hover:text-brand-800 dark:border-white/15 dark:bg-transparent dark:text-slate-200 dark:hover:border-gold-500/50 dark:hover:text-gold-300",
        ghost:
          "text-slate-600 hover:bg-brand-50 hover:text-brand-800 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-gold-300",
        danger:
          "bg-red-700 text-white shadow-[0_1px_2px_rgba(127,29,29,0.35)] hover:bg-red-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
