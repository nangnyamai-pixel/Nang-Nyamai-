import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const payloadSchema = z.object({
  preferences: z.array(z.string().max(32)).max(10),
  topMatchFoodId: z.string().min(1).max(200).nullable(),
  matchPercentage: z.number().int().min(0).max(100),
});

export async function POST(request: Request) {
  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid match activity." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("nangnyamai_ai_session")?.value;
  if (!user && !sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set("nangnyamai_ai_session", sessionId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  }
  const { error } = await supabase.from("ai_food_matches").insert({
    customer_id: user?.id ?? null,
    session_id: user ? null : sessionId,
    preferences: parsed.data.preferences,
    top_match_food_id: parsed.data.topMatchFoodId,
    match_percentage: parsed.data.matchPercentage,
  });
  if (error) {
    console.error(`[AI_FOOD_MATCH] activity insert failed code=${error.code ?? "null"} message=${JSON.stringify(error.message ?? null)}`);
    return NextResponse.json({ error: "Activity recording unavailable." }, { status: 503 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
