"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SentToKitchen({ orderId }: { orderId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [details, setDetails] = useState<{ order_number: string; restaurant_tables: { table_number: string } | null; order_items: { quantity: number }[] } | null>(null);
  useEffect(() => { void (async () => { const { data } = await supabase.from("orders").select("order_number, restaurant_tables!orders_table_id_fkey(table_number), order_items(quantity)").eq("id", orderId).single(); setDetails(data as typeof details); })(); }, [orderId, supabase]);
  const count = details?.order_items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  return <main className="order-details"><section className="details-panel kitchen-confirmation"><span className="empty-icon">✓</span><p>Kitchen workflow</p><h1>Order Sent to Kitchen!</h1><span>Kitchen has been notified.</span>{details && <div className="kitchen-summary"><strong>#{details.order_number}</strong><span>Table {details.restaurant_tables?.table_number ?? "—"}</span><span>Sent {new Date().toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" })}</span><span>{count} {count === 1 ? "item" : "items"}</span></div>}<Link className="details-primary-link" href="/staff/orders">Back to Order Queue</Link></section></main>;
}
