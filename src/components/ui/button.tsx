import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--sarawak-red)] text-white hover:bg-[#b9151b]",
  secondary: "bg-[var(--heritage-yellow)] text-[var(--charcoal)] hover:bg-[#e6b800]",
  outline: "border border-[var(--soft-sand)] bg-white text-[var(--charcoal)] hover:border-[var(--sarawak-red)] hover:text-[var(--sarawak-red)]",
  ghost: "bg-transparent text-[var(--charcoal)] hover:bg-[var(--soft-sand)]/40",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={`inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] px-5 text-sm font-bold transition duration-[var(--motion-standard)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props} />;
}
