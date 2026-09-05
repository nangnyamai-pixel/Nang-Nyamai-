import { UpdateOrderStatus } from "@/components/staff/update-order-status";

export default async function StaffUpdateOrderStatusPage({ params }: { params: Promise<{ orderId: string }> }) {
  return <UpdateOrderStatus orderId={(await params).orderId} />;
}
