"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { LanguageSelector } from "@/components/shared/language-selector";
import { ThemeToggle } from "@/components/shared/theme-toggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const guestDestination = searchParams.get("redirectTo") || "/order";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      setError(t("invalidCredentials"));
      setLoading(false);
      return;
    }
    router.replace(searchParams.get("redirectTo") || "/");
    router.refresh();
  }

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const next = searchParams.get("redirectTo") || "/";
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
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
    <main className="heritage-pattern flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-md rounded-[var(--radius-xl)] bg-white p-7 shadow-[var(--shadow-soft)] sm:p-9" aria-labelledby="login-title">
        <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--sarawak-red)]">NangNyamai</p><div className="flex items-center gap-2"><LanguageSelector /><ThemeToggle /></div></div>
        <h1 id="login-title" className="mt-3 text-3xl font-bold text-[var(--charcoal)]">{t("welcome")}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--secondary-text)]">{t("signInDescription")}</p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block text-sm font-semibold text-[var(--charcoal)]">{t("email")}<Input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2" /></label>
          <label className="block text-sm font-semibold text-[var(--charcoal)]">{t("password")}<Input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2" /></label>
          {error && <p role="alert" className="rounded-[var(--radius-sm)] bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in..." : t("signIn")}</Button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-[var(--secondary-text)]"><span className="h-px flex-1 bg-[var(--soft-sand)]" /><span>atau</span><span className="h-px flex-1 bg-[var(--soft-sand)]" /></div>
        <Button type="button" variant="outline" disabled={loading} onClick={signInWithGoogle} className="w-full">
          <span className="mr-2 text-base font-bold">G</span> {t("loginGoogle")}
        </Button>
        <a href={guestDestination} className="mt-4 flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-[var(--secondary-text)] transition hover:bg-[var(--soft-sand)]/40 hover:text-[var(--charcoal)]">
          {t("loginGuest")}
        </a>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="heritage-pattern flex min-h-screen items-center justify-center p-6"><p className="text-sm text-[var(--secondary-text)]">Memuatkan login...</p></main>}>
      <LoginForm />
    </Suspense>
  );
}
