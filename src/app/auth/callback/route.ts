import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureCustomerProfile } from "@/lib/auth/customer-profile";

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
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure a profile row exists for this user with role = customer.
      // Uses upsert so repeat sign-ins don't fail or duplicate rows.
      const profileError = await ensureCustomerProfile(supabase, data.user);
      if (profileError) return NextResponse.redirect(`${origin}/auth/auth-error`);

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — send the customer to an error page rather than a broken state.
  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
