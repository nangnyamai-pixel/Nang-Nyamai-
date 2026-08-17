import type { HTMLAttributes } from "react";

type BadgeTone = "brand" | "accent" | "neutral" | "success" | "danger";

const tones: Record<BadgeTone, string> = {
  brand: "bg-[var(--sarawak-red)] text-white",
  accent: "bg-[var(--heritage-yellow)] text-[var(--charcoal)]",
  neutral: "bg-[var(--soft-sand)]/50 text-[var(--secondary-text)]",
  success: "bg-emerald-100 text-emerald-800",
  danger: "bg-red-100 text-red-800",
};

export function Badge({ tone = "neutral", className = "", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={`inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-xs font-bold ${tones[tone]} ${className}`} {...props} />;
}
