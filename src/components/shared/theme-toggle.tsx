"use client";

import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return <button type="button" onClick={toggleTheme} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={isDark} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
    {isDark ? "☀ Light" : "◐ Dark"}
  </button>;
}
