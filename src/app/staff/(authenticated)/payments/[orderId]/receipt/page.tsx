import { DigitalReceipt } from "@/components/staff/digital-receipt";

export default async function ReceiptPage({ params }: { params: Promise<{ orderId: string }> }) {
  return <DigitalReceipt orderId={(await params).orderId} />;
}
