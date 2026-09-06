"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { OrderStatus } from "@/types/database";

type QueueFilter = "active" | "received" | "completed";
type RawQueueOrder = {
  id: string; order_number: string; status: OrderStatus; total: number; created_at: string; updated_at: string;
  restaurant_tables: { table_number: string } | null;
  order_items: { quantity: number }[];
};
type QueueOrder = Omit<RawQueueOrder, "restaurant_tables" | "order_items"> & { tableNumber: string; itemCount: number };

const money = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2 });

export function OrderDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [filter, setFilter] = useState<QueueFilter>("active");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [orders, setOrders] = useState<QueueOrder[]>([]);
  const [counts, setCounts] = useState({ received: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const refreshRef = useRef<() => void>(() => undefined);

  useEffect(() => { const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350); return () => window.clearTimeout(timer); }, [search]);

  const loadOrders = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    setError("");
    let query = supabase.from("orders").select("id, order_number, status, total, created_at, updated_at, restaurant_tables!orders_table_id_fkey(table_number), order_items(quantity)").order("created_at", { ascending: false });
    if (filter === "active") query = query.in("status", ["received", "preparing", "ready"]);
    else query = query.eq("status", filter);
    if (debouncedSearch) {
      const safeSearch = debouncedSearch.replace(/[%_]/g, "");
      query = query.ilike("order_number", `%${safeSearch}%`);
    }
    const [ordersResult, receivedResult, completedResult] = await Promise.all([
      query,
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "received"),
      supabase.from("orders").select("updated_at").eq("status", "completed"),
    ]);
    if (ordersResult.error || receivedResult.error || completedResult.error) {
      setError("Unable to load orders."); setLoading(false); return;
    }
    const rows = (ordersResult.data ?? []) as unknown as RawQueueOrder[];
    setOrders(rows.map(({ restaurant_tables, order_items, ...order }) => ({ ...order, tableNumber: restaurant_tables?.table_number ?? "—", itemCount: order_items.reduce((sum, item) => sum + item.quantity, 0) })));
    const today = malaysiaDateKey(new Date());
    const completedToday = (completedResult.data ?? []).filter((row) => malaysiaDateKey(row.updated_at) === today).length;
    setCounts({ received: receivedResult.count ?? 0, completed: completedToday });
    setUpdatedAt(new Date()); setLoading(false);
  }, [debouncedSearch, filter, supabase]);

  useEffect(() => { refreshRef.current = () => void loadOrders(true); }, [loadOrders]);
  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadOrders(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadOrders]);
  useEffect(() => {
    const channel = supabase.channel("staff-order-queue").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => refreshRef.current()).subscribe();
    const pollingFallback = window.setInterval(() => refreshRef.current(), 10_000);
    return () => { window.clearInterval(pollingFallback); void supabase.removeChannel(channel); };
  }, [supabase]);

  const emptyMessage = debouncedSearch ? `No orders found for “${debouncedSearch}”.` : filter === "completed" ? "No completed orders yet." : filter === "received" ? "No new orders right now." : "No active orders right now.";

  return <div className="order-dashboard">
    <header className="order-page-header"><div><p>Restaurant operations</p><h1>Order Queue</h1><span>Track incoming orders as they arrive.</span></div><div className="live-indicator"><i /> Live updates enabled</div></header>
    <section className="order-summary-grid" aria-label="Order status filters">
      <SummaryCard label="New" count={counts.received} selected={filter === "received"} onClick={() => setFilter("received")} tone="warm" />
      <SummaryCard label="Completed" count={counts.completed} selected={filter === "completed"} onClick={() => setFilter("completed")} tone="green" />
    </section>
    <section className="order-queue-panel">
      <div className="order-toolbar"><div><h2>{filter === "received" ? "Incoming orders" : "Completed orders"}</h2><p>{loading ? "Checking the queue…" : `${orders.length} ${orders.length === 1 ? "order" : "orders"} shown`}</p></div><label className="order-search"><SearchIcon /><span className="sr-only">Search by order ID</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order ID..." /></label></div>
      {error ? <div className="queue-state error-state"><strong>Unable to load orders.</strong><span>Please check your connection and try again.</span><button type="button" onClick={() => void loadOrders()}>Retry</button></div>
        : loading ? <OrderSkeleton />
        : orders.length === 0 ? <div className="queue-state"><span className="empty-icon">✓</span><strong>{emptyMessage}</strong><span>{debouncedSearch ? "Try a different order number." : "The queue will update automatically."}</span></div>
        : <div className="order-list">{orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>}
      <footer className="queue-footer"><span><i /> Realtime connected</span><span>{updatedAt ? `Last checked ${updatedAt.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}` : "Connecting…"}</span></footer>
    </section>
  </div>;
}

function SummaryCard({ label, count, selected, onClick, tone }: { label: string; count: number; selected: boolean; onClick: () => void; tone: "warm" | "green" }) {
  return <button type="button" className={`order-summary-card ${tone} ${selected ? "selected" : ""}`} onClick={onClick} aria-pressed={selected}><span>{label}<small>{label === "New" ? "Needs attention" : "Finished today"}</small></span><strong>{count}</strong></button>;
}

function OrderCard({ order }: { order: QueueOrder }) {
  const destination = order.status === "received" ? `/staff/orders/${order.id}` : `/staff/orders/${order.id}/status`;
  const label = order.status === "received" ? "NEW" : order.status === "preparing" ? "PREPARING" : order.status === "ready" ? "READY" : "COMPLETED";
  const actionLabel = order.status === "received" ? "Open order details" : order.status === "preparing" ? "Update preparing order" : order.status === "ready" ? "Update ready order" : "View completed order";
  const timestamp = order.status === "completed" ? order.updated_at : order.created_at;
  return <article className="order-card"><span className={`order-status status-${order.status}`}>{label}</span><div className="order-identity"><strong>#{order.order_number}</strong><span>Table {order.tableNumber} <i /> {new Date(timestamp).toLocaleTimeString("en-MY", { timeZone: "Asia/Kuala_Lumpur", hour: "numeric", minute: "2-digit" })}</span></div><div className="order-metrics"><span>{order.itemCount} {order.itemCount === 1 ? "item" : "items"}</span><strong>{money.format(Number(order.total)).replace("RM", "RM ")}</strong></div><Link className={`order-next order-next-${order.status}`} href={destination} aria-label={actionLabel} title={actionLabel}>→</Link></article>;
}

function malaysiaDateKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  return parts.filter((part) => part.type !== "literal").map((part) => part.value).join("-");
}

function OrderSkeleton() { return <div className="order-list" aria-label="Loading orders">{[1, 2, 3].map((item) => <div className="order-card skeleton" key={item}><span /><div><i /><i /></div><div><i /><i /></div></div>)}</div>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>; }
