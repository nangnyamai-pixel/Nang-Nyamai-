"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export function BackToMenu({ href = "/order", className = "" }: { href?: string; className?: string }) {
  const { locale } = useLanguage();
  return <Link href={href} className={`inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--primary-green)] bg-transparent px-5 text-sm font-bold text-[var(--primary-green)] transition hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-green)] ${className}`}><span aria-hidden="true">←</span><span className="ml-2">{locale === "ms" ? "Kembali ke Menu Utama" : "Back to Main Menu"}</span></Link>;
}
