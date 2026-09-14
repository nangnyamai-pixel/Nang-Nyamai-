"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CustomerProfileForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { void (async () => { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) { setMessage("Please sign in to manage your profile."); setLoading(false); return; } const { data } = await (supabase as any).from("profiles").select("full_name, phone_number").eq("id", user.id).maybeSingle(); setFullName(data?.full_name ?? ""); setPhone(data?.phone_number ?? ""); setLoading(false); })(); }, []);
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setMessage(""); const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) { setMessage("Please sign in to manage your profile."); setSaving(false); return; } const { error } = await (supabase as any).from("profiles").update({ full_name: fullName.trim() || null, phone_number: phone.trim() || null }).eq("id", user.id); setMessage(error ? "Unable to save your profile. Please try again." : "Profile updated."); setSaving(false); }
  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[var(--warm-ivory)]"><p>Loading profile…</p></main>;
  return <main className="min-h-screen bg-[var(--warm-ivory)] p-6"><section className="mx-auto mt-10 w-full max-w-md rounded-[var(--radius-xl)] bg-white p-7 shadow-[var(--shadow-soft)]"><p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--sarawak-red)]">NangNyamai</p><h1 className="mt-3 text-3xl font-bold text-[var(--charcoal)]">My Profile</h1><form onSubmit={save} className="mt-7 space-y-4"><label className="block text-sm font-semibold">Full Name<Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2" /></label><label className="block text-sm font-semibold">Phone Number<Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2" /></label>{message && <p role="status" className="text-sm text-[var(--secondary-text)]">{message}</p>}<Button type="submit" disabled={saving} className="w-full">{saving ? "Saving…" : "Save Profile"}</Button></form></section></main>;
}

