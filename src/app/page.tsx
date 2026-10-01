import { auth } from "@/auth";
import { redirect } from "next/navigation";

const ROLE_HOME: Record<string, string> = {
  SUPERADMIN: "/superadmin/dashboard",
  ADMIN: "/admin/dashboard",
  STUDENT: "/student/dashboard",
};

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/login");
  redirect(ROLE_HOME[session.user.role] ?? "/login");
}
