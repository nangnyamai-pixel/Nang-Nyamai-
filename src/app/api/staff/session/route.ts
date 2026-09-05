import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = sessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Unable to establish session." }, { status: 401 });

  const supabase = await createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token: parsed.data.accessToken,
    refresh_token: parsed.data.refreshToken,
  });
  if (sessionError || !sessionData.user) return NextResponse.json({ error: "Unable to establish session." }, { status: 401 });

  const { data: profile, error: profileError } = await supabase
    .from("staff_profiles")
    .select("is_active")
    .eq("auth_user_id", sessionData.user.id)
    .maybeSingle();
  if (profileError || !profile?.is_active) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Unable to establish session." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
