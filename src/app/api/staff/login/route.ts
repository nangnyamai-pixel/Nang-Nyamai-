import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  staffId: z.string().trim().min(1).max(32).regex(/^[a-zA-Z0-9-]+$/),
  password: z.string().min(1).max(256),
});

const INVALID_CREDENTIALS = "Invalid Staff ID or password.";

export async function POST(request: Request) {
  const parsed = credentialsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });

  const staffId = parsed.data.staffId.toUpperCase();
  const supabase = await createClient();
  const email = `${staffId.toLowerCase()}@staff.nangnyamai.invalid`;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error || !data.user) return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });

  const { data: profile, error: profileError } = await supabase.from("staff_profiles").select("staff_id, is_active").eq("auth_user_id", data.user.id).maybeSingle();
  if (profileError || !profile || profile.staff_id !== staffId) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }
  if (!profile.is_active) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Your staff account is currently inactive. Please contact an administrator." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
