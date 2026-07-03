import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentDashboard from "@/components/StudentDashboard";
import AlumniDashboard from "@/components/AlumniDashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "student") {
    return <StudentDashboard />;
  }

  if (session.user.role === "alumni") {
    return <AlumniDashboard />;
  }

  redirect("/admin");
}