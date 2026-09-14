import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/customer/profile-form";
import { ProfileLogout } from "@/components/customer/profile-logout";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/profile");
  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("member_id, full_name, email, phone").eq("id", user.id).maybeSingle(),
    supabase.from("orders").select("id, order_number, total, status, payment_status, created_at").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(10),
  ]);
  return <main className="heritage-pattern min-h-screen px-5 py-8"><div className="mx-auto max-w-2xl space-y-6"><header><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sarawak-red)]">NangNyamai</p><h1 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">Customer profile</h1></div><ProfileLogout /></div><p className="mt-2 text-sm text-[var(--text-secondary)]">Member ID: <strong>{profile?.member_id ?? "—"}</strong></p></header><ProfileForm fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} email={profile?.email ?? user.email ?? ""} orders={orders ?? []} /></div></main>;
}
