import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--primary-green)] text-white hover:bg-[var(--primary-green-hover)]",
  secondary: "bg-[var(--gold-accent)] text-[var(--brown-dark)] hover:bg-[var(--brown-earth)] hover:text-white",
  outline: "border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--primary-green)] hover:text-[var(--primary-green)]",
  ghost: "bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-muted)]",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={`inline-flex min-h-11 shrink-0 touch-manipulation items-center justify-center whitespace-nowrap rounded-[var(--radius-pill)] px-5 text-center text-sm font-bold leading-none transition duration-[var(--motion-standard)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-green)] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props} />;
}
