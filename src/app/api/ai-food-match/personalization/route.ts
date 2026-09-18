import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const inputSchema = z.object({ foodIds: z.array(z.string().min(1).max(200)).max(500) });

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ previouslyOrderedIds: [], popularIds: [] }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("order_items")
    .select("menu_item_id, quantity, orders!inner(customer_id, status, payment_status)")
    .in("menu_item_id", parsed.data.foodIds)
    .eq("orders.status", "completed")
    .eq("orders.payment_status", "paid");
  if (error) {
    console.error(`[AI_FOOD_MATCH] personalization query failed code=${error.code ?? "null"}`);
    return NextResponse.json({ previouslyOrderedIds: [], popularIds: [] });
  }

  const previous = new Set<string>();
  const popularity = new Map<string, number>();
  for (const raw of data ?? []) {
    const row = raw as unknown as { menu_item_id: string; quantity: number; orders: { customer_id: string | null } | { customer_id: string | null }[] };
    const orders = Array.isArray(row.orders) ? row.orders : [row.orders];
    const quantity = Number(row.quantity) || 0;
    popularity.set(row.menu_item_id, (popularity.get(row.menu_item_id) ?? 0) + quantity);
    if (user && orders.some((order) => order.customer_id === user.id)) previous.add(row.menu_item_id);
  }
  const popularIds = [...popularity.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10).map(([id]) => id);
  return NextResponse.json({ previouslyOrderedIds: [...previous], popularIds });
}
