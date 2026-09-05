import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth/roles";
import { StaffSidebar } from "@/components/staff/staff-sidebar";

export default async function StaffAuthenticatedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/staff/login");
  return <div className="staff-app-shell"><StaffSidebar staffName={staff.name} staffRole={staff.role} /><main className="staff-main">{children}</main></div>;
}
