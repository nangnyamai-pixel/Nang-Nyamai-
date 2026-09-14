import type { Locale } from "@/lib/i18n";

export const profileTranslations = {
  en: { logout: "Log out", logoutConfirm: "Are you sure you want to log out?", logoutCancel: "Cancel", logoutFailed: "Unable to log out. Please try again.", loggingOut: "Logging out..." },
  ms: { logout: "Log keluar", logoutConfirm: "Adakah anda pasti mahu log keluar?", logoutCancel: "Batal", logoutFailed: "Tidak dapat log keluar. Sila cuba lagi.", loggingOut: "Sedang log keluar..." },
} as const satisfies Record<Locale, Record<string, string>>;
