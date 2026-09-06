"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureCustomerProfile } from "@/lib/auth/customer-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const destination = searchParams.get("redirectTo") || searchParams.get("next") || "/order";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      setError("Email atau password tidak sah. Sila cuba lagi.");
      setLoading(false);
      return;
    }
    if (!result.data.user || await ensureCustomerProfile(supabase, result.data.user)) {
      setError("Unable to prepare your customer profile. Please try again.");
      setLoading(false);
      return;
    }
    router.replace(destination);
    router.refresh();
  }

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`;
    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (result.error) {
      setError("Google login tidak tersedia buat masa ini.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--warm-ivory)] p-6">
      <section className="w-full max-w-md rounded-[var(--radius-xl)] bg-white p-7 shadow-[var(--shadow-soft)] sm:p-9" aria-labelledby="login-title">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--sarawak-red)]">NangNyamai</p>
        <h1 id="login-title" className="mt-3 text-3xl font-bold text-[var(--charcoal)]">Selamat datang.</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--secondary-text)]">Log masuk untuk menguruskan operasi restoran.</p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block text-sm font-semibold text-[var(--charcoal)]">Email<Input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2" /></label>
          <label className="block text-sm font-semibold text-[var(--charcoal)]">Password<Input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2" /></label>
          {error && <p role="alert" className="rounded-[var(--radius-sm)] bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Sedang log masuk..." : "Log masuk"}</Button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-[var(--secondary-text)]"><span className="h-px flex-1 bg-[var(--soft-sand)]" /><span>atau</span><span className="h-px flex-1 bg-[var(--soft-sand)]" /></div>
        <Button type="button" variant="outline" disabled={loading} onClick={signInWithGoogle} className="w-full">
          <span className="mr-2 text-base font-bold">G</span> Teruskan dengan Google
        </Button>
        <a href={destination} className="mt-4 flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-[var(--secondary-text)] transition hover:bg-[var(--soft-sand)]/40 hover:text-[var(--charcoal)]">
          Teruskan sebagai guest
        </a>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[var(--warm-ivory)] p-6"><p className="text-sm text-[var(--secondary-text)]">Memuatkan login...</p></main>}>
      <LoginForm />
    </Suspense>
  );
}
