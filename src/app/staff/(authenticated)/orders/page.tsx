import type { Metadata } from "next";
import { OrderDashboard } from "@/components/staff/order-dashboard";

export const metadata: Metadata = { title: "Order Queue | NangNyamai" };

export default function StaffOrdersPage() {
  return <OrderDashboard />;
}
