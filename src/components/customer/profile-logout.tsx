"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { profileTranslations } from "@/lib/profile-translations";

export function ProfileLogout() {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = (key: keyof typeof profileTranslations.en) => profileTranslations[locale][key];
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  async function logout() {
    setLoading(true); setError(false);
    const { error: signOutError } = await createClient().auth.signOut();
    if (signOutError) { setError(true); setLoading(false); return; }
    router.replace("/auth/login?redirectTo=/order"); router.refresh();
  }
  if (!confirming) return <button type="button" onClick={() => setConfirming(true)} aria-label={t("logout")} className="min-h-11 rounded-full border border-[var(--terracotta)] px-4 text-sm font-bold text-[var(--terracotta)] hover:bg-[var(--terracotta)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-green)]">{t("logout")}</button>;
  return <div className="flex flex-wrap items-center justify-end gap-2" role="group" aria-label={t("logout")}><span className="text-sm text-[var(--text-secondary)]">{t("logoutConfirm")}</span><button type="button" onClick={() => setConfirming(false)} disabled={loading} className="min-h-11 rounded-full border border-[var(--border-soft)] px-4 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-muted)]">{t("logoutCancel")}</button><button type="button" onClick={logout} disabled={loading} aria-busy={loading} className="min-h-11 rounded-full border border-[var(--terracotta)] px-4 text-sm font-bold text-[var(--terracotta)] hover:bg-[var(--terracotta)] hover:text-white">{loading ? t("loggingOut") : t("logout")}</button>{error && <span role="alert" className="w-full text-right text-xs text-[var(--terracotta)]">{t("logoutFailed")}</span>}</div>;
}
