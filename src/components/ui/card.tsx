import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-[var(--radius-lg)] border border-[var(--soft-sand)] bg-white shadow-sm ${className}`} {...props} />;
}
