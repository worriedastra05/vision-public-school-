import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  FileText,
  Wallet,
  IdCard,
  Bell,
  CalendarDays,
  User,
  ScrollText,
  Settings,
  CalendarClock,
  DatabaseBackup,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  soon?: boolean; // next phases me implement hoga
}

export const NAV_ITEMS: Record<string, NavItem[]> = {
  SUPERADMIN: [
    { label: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Teachers", href: "/admin/teachers", icon: Users },
    { label: "Classes", href: "/admin/classes", icon: BookOpen },
    { label: "Exams & Results", href: "/admin/exams", icon: FileText },
    { label: "Fees", href: "/admin/fees", icon: Wallet },
    { label: "ID Cards", href: "/superadmin/id-cards", icon: IdCard, soon: true },
    { label: "Notices", href: "/notices", icon: Bell },
    { label: "Admins", href: "/superadmin/admins", icon: ShieldCheck, soon: true },
    { label: "Reports", href: "/superadmin/reports", icon: ScrollText, soon: true },
    { label: "Activity Logs", href: "/superadmin/logs", icon: ClipboardCheck, soon: true },
    { label: "Settings", href: "/superadmin/settings", icon: Settings, soon: true },
    { label: "Backup", href: "/superadmin/backup", icon: DatabaseBackup, soon: true },
    { label: "Profile", href: "/profile", icon: User },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Teachers", href: "/admin/teachers", icon: Users },
    { label: "Classes", href: "/admin/classes", icon: BookOpen },
    { label: "Attendance", href: "/admin/attendance", icon: ClipboardCheck },
    { label: "Exams & Results", href: "/admin/exams", icon: FileText },
    { label: "Fees", href: "/admin/fees", icon: Wallet },
    { label: "ID Cards", href: "/admin/id-cards", icon: IdCard, soon: true },
    { label: "Notices", href: "/notices", icon: Bell },
    { label: "Timetable", href: "/admin/timetable", icon: CalendarClock, soon: true },
    { label: "Profile", href: "/profile", icon: User },
  ],
  STUDENT: [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "My ID Card", href: "/student/id-card", icon: IdCard, soon: true },
    { label: "Report Card", href: "/student/report-card", icon: FileText },
    { label: "My Attendance", href: "/student/attendance", icon: ClipboardCheck },
    { label: "My Fees", href: "/student/fees", icon: Wallet },
    { label: "Timetable", href: "/student/timetable", icon: CalendarDays, soon: true },
    { label: "Notices", href: "/notices", icon: Bell },
    { label: "Profile", href: "/profile", icon: User },
  ],
};

/** Pathname se nav item dhoondo (page title ke liye) */
export function findNavItem(role: string, pathname: string) {
  return (NAV_ITEMS[role] ?? []).find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
}
