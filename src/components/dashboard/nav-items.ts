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
  UserPlus,
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
  soon?: boolean; // placeholder for an upcoming module
}

export const NAV_ITEMS: Record<string, NavItem[]> = {
  SUPERADMIN: [
    { label: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "New Admission", href: "/admin/students/new", icon: UserPlus },
    { label: "Teachers", href: "/admin/teachers", icon: Users },
    { label: "Classes", href: "/admin/classes", icon: BookOpen },
    { label: "Exams & Results", href: "/admin/exams", icon: FileText },
    { label: "Fees", href: "/admin/fees", icon: Wallet },
    { label: "ID Cards", href: "/admin/id-cards", icon: IdCard },
    { label: "Notices", href: "/notices", icon: Bell },
    { label: "Admins", href: "/superadmin/admins", icon: ShieldCheck },
    { label: "Reports", href: "/superadmin/reports", icon: ScrollText },
    { label: "Activity Logs", href: "/superadmin/logs", icon: ClipboardCheck },
    { label: "Settings", href: "/superadmin/settings", icon: Settings },
    { label: "Backup", href: "/superadmin/backup", icon: DatabaseBackup },
    { label: "Profile", href: "/profile", icon: User },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "New Admission", href: "/admin/students/new", icon: UserPlus },
    { label: "Teachers", href: "/admin/teachers", icon: Users },
    { label: "Classes", href: "/admin/classes", icon: BookOpen },
    { label: "Attendance", href: "/admin/attendance", icon: ClipboardCheck },
    { label: "Exams & Results", href: "/admin/exams", icon: FileText },
    { label: "Fees", href: "/admin/fees", icon: Wallet },
    { label: "ID Cards", href: "/admin/id-cards", icon: IdCard },
    { label: "Notices", href: "/notices", icon: Bell },
    { label: "Timetable", href: "/admin/timetable", icon: CalendarClock, soon: true },
    { label: "Profile", href: "/profile", icon: User },
  ],
  STUDENT: [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "My ID Card", href: "/student/id-card", icon: IdCard },
    { label: "Report Card", href: "/student/report-card", icon: FileText },
    { label: "My Attendance", href: "/student/attendance", icon: ClipboardCheck },
    { label: "My Fees", href: "/student/fees", icon: Wallet },
    { label: "Timetable", href: "/student/timetable", icon: CalendarDays, soon: true },
    { label: "Notices", href: "/notices", icon: Bell },
    { label: "Profile", href: "/profile", icon: User },
  ],
};

/** Find the nav item for a pathname (page header title). Longest href wins,
 *  so /admin/students/new resolves to "New Admission", not "Students". */
export function findNavItem(role: string, pathname: string) {
  return [...(NAV_ITEMS[role] ?? [])]
    .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
