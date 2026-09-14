"use client";
import { useLanguage } from "@/lib/i18n";
import { LanguageSelector } from "@/components/shared/language-selector";
export default function AuthErrorPage() {
  const { t } = useLanguage();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
      <LanguageSelector />
      <h1 className="text-xl font-semibold">{t("signInFailed")}</h1>
      <p className="text-sm text-neutral-500">
        {t("signInFailedBody")}
      </p>
    </main>
  );
}
