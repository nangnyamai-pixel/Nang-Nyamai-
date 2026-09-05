import { SentToKitchen } from "@/components/staff/sent-to-kitchen";

export default async function SentToKitchenPage({ params }: { params: Promise<{ orderId: string }> }) {
  return <SentToKitchen orderId={(await params).orderId} />;
}
