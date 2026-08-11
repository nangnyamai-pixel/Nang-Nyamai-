import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
