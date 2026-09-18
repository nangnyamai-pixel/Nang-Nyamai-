import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeedbackForm } from "@/components/customer/feedback-form";
import { BackToMenu } from "@/components/customer/back-to-menu";

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?redirectTo=/order/${id}/feedback`);
  const { data: order } = await supabase.from("orders").select("id, order_number, status, payment_status").eq("id", id).eq("customer_id", user.id).maybeSingle();
  if (!order || order.status !== "completed" || order.payment_status !== "paid") redirect(`/order/${id}`);
  const { data: existing } = await supabase.from("feedback").select("id").eq("order_id", id).maybeSingle();
  if (existing) redirect(`/order/${id}`);
  return <main className="heritage-pattern min-h-screen p-5"><section className="mx-auto max-w-lg rounded-[var(--radius-xl)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sarawak-red)]">NangNyamai</p><h1 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">Order feedback</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">#{order.order_number}</p><FeedbackForm orderId={order.id} /><BackToMenu className="mt-4 w-full" /></section></main>;
}
