"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { GraduationCap, LogOut, Crown } from "lucide-react";
import { NAV_ITEMS, findNavItem } from "./nav-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface ShellProps {
  role: "SUPERADMIN" | "ADMIN" | "STUDENT";
  userName: string;
  userEmail: string;
  roleBadge: string;
  roleBadgeVariant: "default" | "success" | "warning";
  pageTitle: string;
  children: React.ReactNode;
}

// Oxford calm: ek hi treatment, sirf crown superadmin ko
const roleBadgeStylesLight = {
  default: "border border-brand-200 bg-brand-50 text-brand-800",
  success: "border border-brand-200 bg-brand-50 text-brand-800",
  warning: "border border-gold-300 bg-gold-50 text-gold-800",
};

export function DashboardShell({
  role,
  userName,
  userEmail,
  roleBadge,
  roleBadgeVariant,
  pageTitle,
  children,
}: ShellProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] ?? [];
  const currentTitle = findNavItem(role, pathname)?.label ?? pageTitle;

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950">
      {/* ── Sidebar — deep academic navy, hairline gold detail ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink-950 text-slate-300 md:flex">
        {/* School crest */}
        <div className="border-b border-white/[0.07] px-5 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <div className="glow-ring flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 bg-ink-900">
              <GraduationCap className="h-5.5 w-5.5 text-gold-400" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-[15px] font-bold tracking-tight text-white">
                Vision Public School
              </p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-gold-500/90">
                Management Portal
              </p>
            </div>
          </div>
          <div className="gold-rule mt-5" />
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {items.map((item, i) => {
            const active = pathname === item.href;
            if (item.soon) {
              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-[13px] text-slate-600"
                  title="Coming in next phase"
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <span className="rounded border border-white/[0.07] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-600">
                    Soon
                  </span>
                </div>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "animate-fade-up group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors duration-150",
                  active
                    ? "bg-white/[0.06] text-white"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                )}
                style={{ animationDelay: `${40 + i * 25}ms` }}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gold-500" />
                )}
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    active ? "text-gold-400" : "text-slate-500 group-hover:text-gold-300/80"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + signout */}
        <div className="border-t border-white/[0.07] p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.03] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-ink-800 text-sm font-bold text-gold-400">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[13px] font-semibold text-white">{userName}</p>
              <p className="truncate text-[11px] text-slate-500">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-white/[0.08] px-3 py-2 text-[13px] font-medium text-slate-400 transition-colors duration-150 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex min-h-screen flex-col md:ml-64">
        {/* Gold hairline — prestige detail */}
        <div className="h-[2px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 opacity-80" />

        <header className="glass sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200/70 px-4 py-3 md:px-6 dark:border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/40 bg-ink-950 md:hidden">
              <GraduationCap className="h-4.5 w-4.5 text-gold-400" />
            </div>
            <h1 className="font-display text-lg font-bold tracking-tight text-slate-900 md:text-xl dark:text-slate-100">
              {currentTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
                roleBadgeStylesLight[roleBadgeVariant]
              )}
            >
              {roleBadgeVariant === "warning" && <Crown className="h-3 w-3" />}
              {roleBadge}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 md:hidden dark:hover:bg-red-400/10"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1.5 overflow-x-auto border-b border-slate-200/70 bg-white/60 px-4 py-2 md:hidden dark:border-white/[0.07] dark:bg-ink-900/60">
          {items.map((item) =>
            item.soon ? (
              <span
                key={item.label}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs text-slate-400 dark:text-slate-500"
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  pathname === item.href
                    ? "bg-ink-950 text-gold-300"
                    : "text-slate-600 hover:bg-brand-50 hover:text-brand-800 dark:text-slate-300 dark:hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <main className="flex-1 p-4 md:p-6 lg:p-7">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
