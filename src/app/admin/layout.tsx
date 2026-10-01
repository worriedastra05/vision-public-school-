import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();

  // Defense-in-depth: only an ADMIN or SUPERADMIN can access this area
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") redirect("/");

  const isSuper = session.user.role === "SUPERADMIN";

  return (
    <DashboardShell
      role={isSuper ? "SUPERADMIN" : "ADMIN"}
      userName={session.user.name ?? "Admin"}
      userEmail={session.user.email ?? ""}
      roleBadge={isSuper ? "Super Admin" : "Admin"}
      roleBadgeVariant={isSuper ? "warning" : "success"}
      pageTitle="Admin Panel"
    >
      {children}
    </DashboardShell>
  );
}
