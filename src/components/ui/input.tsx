import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`min-h-11 w-full rounded-[var(--radius-pill)] border border-[var(--border-soft)] bg-[var(--surface)] px-5 text-sm text-[var(--text-primary)] shadow-sm placeholder:text-[var(--text-secondary)] ${className}`} {...props} />;
}
