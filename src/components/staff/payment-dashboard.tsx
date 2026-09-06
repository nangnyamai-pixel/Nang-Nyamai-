"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PaymentOrder = {
  id: string;
  order_number: string;
  total: number;
  created_at: string;
  restaurant_tables: { table_number: string } | null;
};

const money = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2 });

export function PaymentDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true); setError("");
    const { data, error: queryError } = await supabase.from("orders")
      .select("id, order_number, total, payment_status, status, created_at, restaurant_tables!orders_table_id_fkey(table_number)")
      .eq("payment_status", "unpaid")
      .eq("status", "ready")
      .order("created_at", { ascending: false });
    if (queryError) { setError("Unable to load payment orders right now."); setLoading(false); return; }
    setOrders((data ?? []) as unknown as PaymentOrder[]); setLoading(false);
  }, [supabase]);

  useEffect(() => { const initial = window.setTimeout(() => void loadOrders(), 0); return () => window.clearTimeout(initial); }, [loadOrders]);
  useEffect(() => {
    const channel = supabase.channel("staff-payment-queue").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void loadOrders()).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadOrders, supabase]);

  return <div className="order-dashboard">
    <header className="order-page-header"><div><Link className="details-back" href="/staff/orders">← <span>Back to Order Queue</span></Link><p>Restaurant operations</p><h1>Payment Processing</h1><span>Orders waiting for payment.</span></div></header>
    <section className="order-queue-panel"><div className="order-toolbar"><div><h2>Payment orders</h2><p>{loading ? "Loading payment orders…" : `${orders.length} ${orders.length === 1 ? "order" : "orders"} waiting`}</p></div></div>
      {error ? <div className="queue-state error-state"><strong>{error}</strong><button type="button" onClick={() => void loadOrders()}>Retry</button></div> : loading ? <div className="queue-state"><span>Loading payment orders…</span></div> : orders.length === 0 ? <div className="queue-state"><strong>No orders are waiting for payment.</strong></div> : <div className="order-list">{orders.map((order) => <article className="order-card" key={order.id}><div className="order-identity"><small>Order ID</small><strong>#{order.order_number}</strong></div><div className="order-identity"><small>Table</small><strong>{order.restaurant_tables?.table_number ?? "—"}</strong></div><div className="order-metrics"><span>Total Amount</span><strong>{money.format(Number(order.total)).replace("RM", "RM ")}</strong></div><Link className="order-next order-next-ready" href={`/staff/payments/${order.id}`} aria-label={`Open payment for ${order.order_number}`} title="Open payment">→</Link></article>)}</div>}
    </section>
  </div>;
}
