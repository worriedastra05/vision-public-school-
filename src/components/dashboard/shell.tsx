"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { GraduationCap, LogOut, Clock } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { Badge } from "@/components/ui/badge";
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
  default: "bg-indigo-100 text-indigo-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-red-100 text-red-700",
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

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900 text-slate-300 md:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Vision Public School</p>
            <p className="text-[11px] text-slate-400">Management Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const active = pathname === item.href;
            if (item.soon) {
              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-500"
                  title="Coming in next phase"
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-white">{userName}</p>
              <p className="truncate text-[11px] text-slate-400">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-red-500/20 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3.5 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 md:hidden">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900 md:text-xl">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={cn("border-0", roleBadgeStyles[roleBadgeVariant])}>{roleBadge}</Badge>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 md:hidden"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </header>

        {/* Mobile nav (horizontal scroll) */}
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
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium",
                  pathname === item.href
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
