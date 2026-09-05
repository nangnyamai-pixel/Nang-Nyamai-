import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";
import type { StaffProfile } from "@/types/database";

/**
 * Returns the authenticated user's id and role, or null if not signed in.
 *
 * This is the server-side source of truth for authorization decisions.
 * Use it in Server Components, Server Actions, and Route Handlers before
 * performing any staff/admin-only operation. Middleware route checks
 * (see lib/supabase/middleware.ts) are a UX convenience only — this check
 * plus Row Level Security policies are what actually enforce access control.
 */
export async function getCurrentUserRole(): Promise<{
  userId: string;
  role: UserRole;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  return { userId: user.id, role: profile.role };
}

/** Returns the active staff profile belonging to the current Auth user. */
export async function getCurrentStaff(): Promise<StaffProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  return error ? null : data;
}

/** Throws-free helper for checking whether the current user has one of the given roles. */
export async function requireRole(allowed: UserRole[]) {
  const current = await getCurrentUserRole();
  if (!current || !allowed.includes(current.role)) {
    return { authorized: false as const, userId: current?.userId ?? null };
  }
  return { authorized: true as const, userId: current.userId };
}
