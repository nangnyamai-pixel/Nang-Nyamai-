import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase auth session on every request and applies
 * coarse route protection for /staff and /admin.
 *
 * This is a first line of defense only. It must NOT be relied on as the
 * sole authorization mechanism — every sensitive read/write also needs
 * Row Level Security policies and server-side role checks, since
 * middleware/route checks can be bypassed by calling APIs directly.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isStaffRoute = path.startsWith("/staff");
  const isAdminRoute = path.startsWith("/admin");

  if ((isStaffRoute || isAdminRoute) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based checks (staff vs admin) happen in lib/auth using the
  // authenticated user's profile — see lib/auth/roles.ts.

  return supabaseResponse;
}
