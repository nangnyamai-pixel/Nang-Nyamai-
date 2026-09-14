"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Notice = { id: string; orderNumber: string; tableNumber: string; total: number; receivedAt: string };
const money = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2 });

export function StaffOrderNotifications() {
  const supabase = useMemo(() => createClient(), []); const router = useRouter(); const alerted = useRef(new Set<string>());
  const [toast, setToast] = useState<Notice | null>(null);
  useEffect(() => {
    const channel = supabase.channel("staff-global-order-notifications").on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, async (payload) => {
      const row = payload.new as { id?: string; order_number?: string; status?: string; table_id?: string; total?: number; created_at?: string };
      if (row.status !== "received" || !row.id || alerted.current.has(row.id)) return; alerted.current.add(row.id);
      let tableNumber = "—"; if (row.table_id) { const { data } = await supabase.from("restaurant_tables").select("table_number").eq("id", row.table_id).maybeSingle(); tableNumber = data?.table_number ?? "—"; }
      const notice: Notice = { id: row.id, orderNumber: row.order_number ?? row.id, tableNumber, total: Number(row.total ?? 0), receivedAt: row.created_at ?? new Date().toISOString() };
      setToast(notice); window.setTimeout(() => setToast((current) => current?.id === notice.id ? null : current), 7000);
      try { void new Audio("/sounds/new-order.mp3").play().catch(() => undefined); } catch { /* visual notification remains available */ }
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [supabase]);
  return <div className="staff-global-notifications">{toast && <button type="button" className="new-order-toast" aria-live="polite" onClick={() => { setToast(null); router.push(`/staff/orders/${toast.id}`); }}><span className="new-order-toast-icon" aria-hidden="true">!</span><span className="new-order-toast-copy"><strong>New Order Received</strong><b>#{toast.orderNumber}</b><span>Table {toast.tableNumber} · {money.format(toast.total)}</span><em>View Order →</em></span></button>}</div>;
}
