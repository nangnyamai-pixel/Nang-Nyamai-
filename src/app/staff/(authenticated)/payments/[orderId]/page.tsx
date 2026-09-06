import { PaymentDetails } from "@/components/staff/payment-details";

export default async function StaffPaymentDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  return <PaymentDetails orderId={(await params).orderId} />;
}
