"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CompletedOrder = { order_number: string; status: string; payment_status: string; payment_method: string | null; total: number; updated_at: string; restaurant_tables: { table_number: string } | null };
const money = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2 });

export function CompleteOrder({ orderId }: { orderId: string }) {
  const supabase = useMemo(() => createClient(), []); const [order, setOrder] = useState<CompletedOrder | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); const { data, error: queryError } = await supabase.from("orders").select("order_number, status, payment_status, payment_method, total, updated_at, restaurant_tables!orders_table_id_fkey(table_number)").eq("id", orderId).maybeSingle(); if (queryError) setError("Unable to load the completed order right now."); else if (!data) setError("Order not found."); else setOrder(data as unknown as CompletedOrder); setLoading(false); }, [orderId, supabase]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  if (loading) return <main className="status-page"><span>Loading completed order…</span></main>;
  const valid = order && order.status === "completed" && order.payment_status === "paid" && (order.payment_method === "cash" || order.payment_method === "card");
  if (!order || !valid) return <main className="status-page"><Link className="details-back" href="/staff/orders">← <span>Back to Order Queue</span></Link><div className="status-error">{error || "This order does not have a completed payment."}</div></main>;
  return <main className="status-page"><Link className="details-back" href="/staff/orders">← <span>Back to Order Queue</span></Link><header className="status-page-header"><p>Payment Processing</p><h1>Complete Order</h1></header><section className="details-panel kitchen-confirmation"><span className="empty-icon">✓</span><h2>Order Completed!</h2><div className="status-summary"><div><small>Order ID</small><strong>#{order.order_number}</strong></div><div><small>Table</small><strong>{order.restaurant_tables?.table_number ?? "—"}</strong></div><div><small>Completed Time</small><strong>{new Date(order.updated_at).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}</strong></div><div><small>Total Paid</small><strong>{money.format(Number(order.total))}</strong></div><div><small>Payment Method</small><strong>{order.payment_method === "cash" ? "Cash" : "Card"}</strong></div></div><Link className="details-primary-link" href="/staff/orders">Back to Order Queue</Link></section></main>;
}
