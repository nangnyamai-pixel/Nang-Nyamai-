export function PriceRow({ label, value, prominent = false }: { label: string; value: number; prominent?: boolean }) {
  return <div className={`flex items-center justify-between ${prominent ? "text-lg font-bold text-[var(--charcoal)]" : "text-sm text-[var(--secondary-text)]"}`}><span>{label}</span><span>RM {Number(value).toFixed(2)}</span></div>;
}
