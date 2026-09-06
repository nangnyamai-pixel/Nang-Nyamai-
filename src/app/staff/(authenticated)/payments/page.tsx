import type { Metadata } from "next";
import { PaymentDashboard } from "@/components/staff/payment-dashboard";

export const metadata: Metadata = { title: "Payment Processing | NangNyamai" };

export default function StaffPaymentsPage() {
  return <PaymentDashboard />;
}
