import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`min-h-11 w-full rounded-[var(--radius-pill)] border border-[var(--soft-sand)] bg-white px-5 text-sm text-[var(--primary-text)] shadow-sm placeholder:text-[var(--secondary-text)] ${className}`} {...props} />;
}
