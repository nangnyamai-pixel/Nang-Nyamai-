import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ orderId: z.string().uuid(), foodRating: z.number().int().min(1).max(5), serviceRating: z.number().int().min(1).max(5), overallRating: z.number().int().min(1).max(5), comment: z.string().max(500).optional() });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Feedback details are invalid." }, { status: 400 });
  const input = parsed.data;
  const { data: order } = await supabase.from("orders").select("id").eq("id", input.orderId).eq("customer_id", user.id).eq("status", "completed").eq("payment_status", "paid").maybeSingle();
  if (!order) return NextResponse.json({ error: "This order is not eligible for feedback yet." }, { status: 400 });
  const { error } = await supabase.from("feedback").insert({ order_id: order.id, customer_id: user.id, food_rating: input.foodRating, service_rating: input.serviceRating, overall_rating: input.overallRating, comment: input.comment?.trim() || null });
  if (error?.code === "23505") return NextResponse.json({ error: "Feedback already submitted." }, { status: 409 });
  if (error) {
    console.error(`[FEEDBACK] insert failed code=${error.code ?? "null"} message=${JSON.stringify(error.message ?? null)} details=${JSON.stringify(error.details ?? null)} hint=${JSON.stringify(error.hint ?? null)}`);
    return NextResponse.json({ error: error.code === "42501" ? "Feedback permission is not enabled yet. Please apply the feedback database migration." : "Unable to submit feedback." }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
