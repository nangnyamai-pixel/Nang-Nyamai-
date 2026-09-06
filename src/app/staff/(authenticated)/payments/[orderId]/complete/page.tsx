import { CompleteOrder } from "@/components/staff/complete-order";

export default async function CompleteOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  return <CompleteOrder orderId={(await params).orderId} />;
}
