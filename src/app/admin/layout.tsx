import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();

  // Defense-in-depth: ADMIN ya SUPERADMIN hi access kar sakta hai
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") redirect("/");

  return (
    <DashboardShell
      role="ADMIN"
      userName={session.user.name ?? "Admin"}
      userEmail={session.user.email ?? ""}
      roleBadge={session.user.role === "SUPERADMIN" ? "Super Admin" : "Admin"}
      roleBadgeVariant="success"
      pageTitle="Admin Panel"
    >
      {children}
    </DashboardShell>
  );
}
