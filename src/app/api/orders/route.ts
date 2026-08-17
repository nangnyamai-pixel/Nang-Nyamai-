import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

type OrderInput = {
  tableToken?: unknown;
  items?: unknown;
  specialNote?: unknown;
  paymentMethod?: unknown;
};

function isValidItem(value: unknown): value is { menuItemId: string; quantity: number } {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.menuItemId === "string" && /^[0-9a-f-]{36}$/i.test(item.menuItemId) && typeof item.quantity === "number" && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 20;
}

export async function POST(request: Request) {
  let body: OrderInput;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (typeof body.tableToken !== "string" || !Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50 || !body.items.every(isValidItem)) return NextResponse.json({ error: "Order details are invalid." }, { status: 400 });
  if (body.specialNote !== undefined && (typeof body.specialNote !== "string" || body.specialNote.length > 280)) return NextResponse.json({ error: "Special note is invalid." }, { status: 400 });
  if (body.paymentMethod !== undefined && body.paymentMethod !== "cash" && body.paymentMethod !== "card") return NextResponse.json({ error: "Payment method is invalid." }, { status: 400 });

  const supabase = await createClient();
  const { data: table } = await supabase.from("restaurant_tables").select("id").eq("qr_token", body.tableToken).eq("is_active", true).maybeSingle();
  if (!table) return NextResponse.json({ error: "Table token is invalid or inactive." }, { status: 400 });

  const itemIds = [...new Set((body.items as { menuItemId: string }[]).map((item) => item.menuItemId))];
  const { data: menuItems } = await supabase.from("menu_items").select("id, name, price, is_available").in("id", itemIds);
  if (!menuItems || menuItems.length !== itemIds.length || menuItems.some((item) => !item.is_available)) return NextResponse.json({ error: "One or more menu items are unavailable." }, { status: 400 });

  const menuById = new Map(menuItems.map((item) => [item.id, item]));
  const orderItems = (body.items as { menuItemId: string; quantity: number }[]).map((item) => ({ menu: menuById.get(item.menuItemId)!, quantity: item.quantity }));
  const subtotal = orderItems.reduce((sum, item) => sum + Number(item.menu.price) * item.quantity, 0);
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  let guestSessionId = cookieStore.get("nangnyamai_guest_session")?.value;
  if (!user && !guestSessionId) { guestSessionId = crypto.randomUUID(); cookieStore.set("nangnyamai_guest_session", guestSessionId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 }); }
  const orderNumber = `NN-${Date.now().toString(36).toUpperCase()}`;
  const { data: order, error: orderError } = await supabase.from("orders").insert({ order_number: orderNumber, table_id: table.id, customer_id: user?.id ?? null, guest_session_id: user ? null : guestSessionId!, subtotal, service_charge: 0, total: subtotal, special_note: typeof body.specialNote === "string" ? body.specialNote : null, payment_method: body.paymentMethod === "card" ? "card" : "cash" }).select("id, order_number, total, status, payment_status").single();
  if (orderError || !order) return NextResponse.json({ error: "Unable to create order." }, { status: 500 });
  const { error: itemsError } = await supabase.from("order_items").insert(orderItems.map(({ menu, quantity }) => ({ order_id: order.id, menu_item_id: menu.id, item_name_snapshot: menu.name, unit_price: menu.price, quantity })));
  if (itemsError) return NextResponse.json({ error: "Unable to save order items." }, { status: 500 });
  return NextResponse.json({ order }, { status: 201 });
}
