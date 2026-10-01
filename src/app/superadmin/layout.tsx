import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function SuperAdminLayout({ children }: LayoutProps<"/superadmin">) {
  const session = await auth();

  // Defense-in-depth: proxy.ts ke baad bhi layout par role check
  if (!session) redirect("/login");
  if (session.user.role !== "SUPERADMIN") redirect("/");

  return (
    <DashboardShell
      role="SUPERADMIN"
      userName={session.user.name ?? "Super Admin"}
      userEmail={session.user.email ?? ""}
      roleBadge="Super Admin"
      roleBadgeVariant="warning"
      pageTitle="Super Admin Panel"
    >
      {children}
    </DashboardShell>
  );
}
