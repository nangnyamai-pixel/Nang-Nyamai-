import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "NangNyamai | Budaya Restaurant",
  description:
    "Smart digital menu and ordering system for Budaya Restaurant, Sarawak Cultural Village.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><ThemeProvider><LanguageProvider>{children}</LanguageProvider></ThemeProvider></body>
    </html>
  );
}
