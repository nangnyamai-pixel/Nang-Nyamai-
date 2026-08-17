import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the Supabase OAuth redirect after a customer signs in with Google.
 *
 * Expected flow:
 *   Customer at Table T12 -> "Continue with Google" -> Google login
 *   -> redirected here with a `code` -> exchange for a session
 *   -> synchronize profile -> redirect back to the customer's table session.
 *
 * The `next` query param (set when initiating the OAuth flow) preserves the
 * table/session context so the customer lands back on their ordering page
 * instead of losing table context.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") ?? "/";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Provision a profile only when one does not exist. Existing roles are
      // never overwritten by an OAuth callback.
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!existingProfile) {
        const configuredAdmins = (process.env.ADMIN_EMAILS ?? "")
          .split(",")
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean);
        const email = data.user.email?.toLowerCase() ?? null;
        const role = email && configuredAdmins.includes(email) ? "admin" : "customer";

        await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email ?? null,
          full_name: data.user.user_metadata?.full_name ?? null,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
          role,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — send the customer to an error page rather than a broken state.
  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
