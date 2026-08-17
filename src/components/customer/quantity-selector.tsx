"use client";

export function QuantitySelector({ quantity, onDecrease, onIncrease, label }: { quantity: number; onDecrease: () => void; onIncrease: () => void; label: string }) {
  return <div className="flex items-center gap-2" aria-label={label}><button type="button" onClick={onDecrease} className="min-h-11 min-w-11 rounded-full border border-[var(--soft-sand)] bg-white text-lg" aria-label={`Kurangkan ${label}`}>−</button><span className="w-7 text-center font-bold" aria-live="polite">{quantity}</span><button type="button" onClick={onIncrease} className="min-h-11 min-w-11 rounded-full bg-[var(--sarawak-red)] text-white" aria-label={`Tambah ${label}`}>+</button></div>;
}
