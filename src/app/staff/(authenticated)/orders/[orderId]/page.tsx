import { OrderDetails } from "@/components/staff/order-details";

export default async function StaffOrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <OrderDetails orderId={orderId} />;
}
