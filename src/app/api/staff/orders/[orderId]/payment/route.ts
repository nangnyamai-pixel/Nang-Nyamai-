import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaff, getCurrentUserRole } from "@/lib/auth/roles";

const schema = z.object({ paymentMethod: z.enum(["cash", "card"]) });

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const [staff, role] = await Promise.all([getCurrentStaff(), getCurrentUserRole()]);
  if (!staff && role?.role !== "admin") return NextResponse.json({ error: "You do not have permission to process payments." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Payment method is invalid." }, { status: 400 });
  const supabase = await createClient(); const orderId = (await params).orderId;
  const { data, error } = await supabase.from("orders").update({ payment_status: "paid", payment_method: parsed.data.paymentMethod, status: "completed" }).eq("id", orderId).eq("status", "ready").eq("payment_status", "unpaid").select("id, status, payment_status, payment_method").maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to process payment right now." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "This order is no longer eligible for payment." }, { status: 409 });
  return NextResponse.json({ ok: true, order: data });
}
