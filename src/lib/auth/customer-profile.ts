import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function ensureCustomerProfile(supabase: SupabaseClient<Database>, user: User) {
  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (lookupError) return lookupError;

  const profile = {
    email: user.email ?? null,
    full_name: user.user_metadata?.full_name ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  };

  if (existing) {
    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);
    return error;
  }

  const { error } = await supabase.from("profiles").insert({ id: user.id, ...profile, role: "customer" });
  return error;
}
