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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  soon?: boolean; // Phase 2+ me implement hoga
}

export const NAV_ITEMS: Record<string, NavItem[]> = {
  SUPERADMIN: [
    { label: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
    { label: "Admins", href: "/superadmin/admins", icon: ShieldCheck, soon: true },
    { label: "Students", href: "/superadmin/students", icon: GraduationCap, soon: true },
    { label: "Teachers", href: "/superadmin/teachers", icon: Users, soon: true },
    { label: "Classes", href: "/superadmin/classes", icon: BookOpen, soon: true },
    { label: "Exams & Results", href: "/superadmin/exams", icon: FileText, soon: true },
    { label: "Fees", href: "/superadmin/fees", icon: Wallet, soon: true },
    { label: "ID Cards", href: "/superadmin/id-cards", icon: IdCard, soon: true },
    { label: "Notices", href: "/superadmin/notices", icon: Bell, soon: true },
    { label: "Reports", href: "/superadmin/reports", icon: ScrollText, soon: true },
    { label: "Activity Logs", href: "/superadmin/logs", icon: ClipboardCheck, soon: true },
    { label: "Settings", href: "/superadmin/settings", icon: Settings, soon: true },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: GraduationCap, soon: true },
    { label: "Teachers", href: "/admin/teachers", icon: Users, soon: true },
    { label: "Classes", href: "/admin/classes", icon: BookOpen, soon: true },
    { label: "Attendance", href: "/admin/attendance", icon: ClipboardCheck, soon: true },
    { label: "Exams & Results", href: "/admin/exams", icon: FileText, soon: true },
    { label: "Fees", href: "/admin/fees", icon: Wallet, soon: true },
    { label: "ID Cards", href: "/admin/id-cards", icon: IdCard, soon: true },
    { label: "Notices", href: "/admin/notices", icon: Bell, soon: true },
    { label: "Timetable", href: "/admin/timetable", icon: CalendarClock, soon: true },
  ],
  STUDENT: [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "My ID Card", href: "/student/id-card", icon: IdCard, soon: true },
    { label: "Report Card", href: "/student/report-card", icon: FileText, soon: true },
    { label: "My Attendance", href: "/student/attendance", icon: ClipboardCheck, soon: true },
    { label: "My Fees", href: "/student/fees", icon: Wallet, soon: true },
    { label: "Timetable", href: "/student/timetable", icon: CalendarDays, soon: true },
    { label: "Notices", href: "/student/notices", icon: Bell, soon: true },
    { label: "Profile", href: "/student/profile", icon: User, soon: true },
  ],
};
