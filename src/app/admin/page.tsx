"use client";
import { LanguageSelector } from "@/components/shared/language-selector";
import { useLanguage } from "@/lib/i18n";
export default function AdminDashboardPlaceholder() {
  const { locale } = useLanguage();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 p-6">
      <LanguageSelector />
      <p className="text-sm text-neutral-500">
        {locale === "en" ? "Admin dashboard — built in Sprint 5. This route is protected by middleware + server-side role checks (see lib/auth/roles.ts)." : "Dashboard pentadbir — dibina dalam Sprint 5. Laluan ini dilindungi oleh middleware + semakan peranan server (lihat lib/auth/roles.ts)."}
      </p>
    </main>
  );
}
