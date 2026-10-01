"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { GraduationCap, LogOut, Clock, Crown } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
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

const roleBadgeStyles = {
  default: "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30",
  success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30",
  warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30",
};

const roleBadgeIcons = {
  default: GraduationCap,
  success: GraduationCap,
  warning: Crown,
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
  const BadgeIcon = roleBadgeIcons[roleBadgeVariant];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ── Sidebar (desktop) — midnight premium ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-gradient-to-b from-midnight-800 via-midnight-900 to-midnight-950 text-slate-300 shadow-2xl shadow-midnight-950/50 md:flex">
        {/* Logo */}
        <div className="animate-fade-in flex items-center gap-3 border-b border-white/[0.07] px-5 py-5">
          <div className="animate-glow-pulse flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-lg shadow-brand-600/40">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-white">Vision Public School</p>
            <p className="text-[11px] font-medium text-brand-300/80">Management Portal</p>
          </div>
        </div>

        {/* Nav — staggered entrance */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item, i) => {
            const active = pathname === item.href;
            if (item.soon) {
              return (
                <div
                  key={item.label}
                  className="animate-fade-up flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-500/80 transition-colors"
                  style={{ animationDelay: `${60 + i * 35}ms` }}
                  title="Coming in next phase"
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    <Clock className="h-3 w-3" /> Soon
                  </span>
                </div>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "animate-fade-up group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "translate-x-1 bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/35"
                    : "text-slate-400 hover:translate-x-1 hover:bg-white/[0.07] hover:text-white"
                )}
                style={{ animationDelay: `${60 + i * 35}ms` }}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                    active ? "text-white" : "text-slate-500 group-hover:text-brand-300"
                  )}
                />
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-white/90" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card + signout */}
        <div className="animate-fade-in border-t border-white/[0.07] p-4" style={{ animationDelay: "120ms" }}>
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-brand-600/30">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-white">{userName}</p>
              <p className="truncate text-[11px] text-slate-400">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex min-h-screen flex-col md:ml-64">
        {/* Premium gradient top line */}
        <div className="h-[3px] bg-gradient-to-r from-brand-600 via-violet-500 to-fuchsia-500 bg-[length:200%_auto] animate-gradient-x" />

        {/* Glass header */}
        <header className="glass sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200/80 px-4 py-3.5 md:px-6">
          <div className="animate-fade-in flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-md shadow-brand-600/30 md:hidden">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
              {pageTitle}
            </h1>
          </div>
          <div className="animate-fade-in flex items-center gap-3" style={{ animationDelay: "100ms" }}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                roleBadgeStyles[roleBadgeVariant]
              )}
            >
              <BadgeIcon className="h-3 w-3" />
              {roleBadge}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 md:hidden"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2.5 md:hidden">
          {items.map((item) =>
            item.soon ? (
              <span
                key={item.label}
                className="flex whitespace-nowrap rounded-lg px-3 py-1.5 text-xs text-slate-400"
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  pathname === item.href
                    ? "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/30"
                    : "bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <main className="flex-1 p-4 md:p-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
