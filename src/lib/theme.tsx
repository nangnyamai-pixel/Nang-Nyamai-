"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export type Theme = "light" | "dark";
type ThemeContextValue = { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "nangnyamai-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const pathname = usePathname();

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const preferred = saved === "dark" || saved === "light" ? saved : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    window.setTimeout(() => setThemeState(preferred), 0);
  }, []);

  useEffect(() => {
    const customerSurface = pathname === "/" || pathname.startsWith("/order") || pathname.startsWith("/auth") || pathname.startsWith("/profile");
    document.documentElement.dataset.theme = customerSurface ? theme : "light";
  }, [pathname, theme]);

  const value = useMemo(() => ({
    theme,
    setTheme: (next: Theme) => { setThemeState(next); window.localStorage.setItem(STORAGE_KEY, next); },
    toggleTheme: () => { const next = theme === "light" ? "dark" : "light"; setThemeState(next); window.localStorage.setItem(STORAGE_KEY, next); },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
