import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function StudentLayout({ children }: LayoutProps<"/student">) {
  const session = await auth();

  // Defense-in-depth: sirf STUDENT apna portal dekh sakta hai
  if (!session) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/");

  return (
    <DashboardShell
      role="STUDENT"
      userName={session.user.name ?? "Student"}
      userEmail={session.user.email ?? ""}
      roleBadge="Student"
      roleBadgeVariant="default"
      pageTitle="Student Portal"
    >
      {children}
    </DashboardShell>
  );
}
