"use client";
import { LanguageSelector } from "@/components/shared/language-selector";
import { useLanguage } from "@/lib/i18n";
export default function StaffDashboardPlaceholder() {
  const { locale } = useLanguage();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 p-6">
      <LanguageSelector />
      <p className="text-sm text-neutral-500">
        {locale === "en" ? "Staff dashboard — built in Sprint 2. This route is protected by" : "Dashboard kakitangan — dibina dalam Sprint 2. Laluan ini dilindungi oleh"}
        
        {" "}
        {locale === "en" ? "middleware + server-side role checks (see lib/auth/roles.ts)." : "middleware + semakan peranan server (lihat lib/auth/roles.ts)."}
      </p>
    </main>
  );
}
