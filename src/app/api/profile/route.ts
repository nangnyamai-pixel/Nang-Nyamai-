import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  let body: { fullName?: unknown; phone?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (fullName.length > 120 || phone.length > 30) return NextResponse.json({ error: "Profile details are invalid." }, { status: 400 });
  const { error } = await supabase.from("profiles").update({ full_name: fullName || null, phone: phone || null }).eq("id", user.id);
  if (error) return NextResponse.json({ error: "Unable to save profile." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
