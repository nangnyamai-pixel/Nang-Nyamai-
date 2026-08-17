"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FoodCardProps = {
  name: string;
  description: string | null;
  price: number;
  popular?: boolean;
  onAdd: () => void;
  onSelect: () => void;
};

export function FoodCard({ name, description, price, popular, onAdd, onSelect }: FoodCardProps) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--soft-sand)] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[var(--charcoal)] px-6 text-center">
          <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true" style={{ backgroundImage: "linear-gradient(135deg, transparent 42%, #f6c515 43%, transparent 45%), linear-gradient(45deg, transparent 42%, #d71920 43%, transparent 45%)", backgroundSize: "32px 32px" }} />
          <span className="relative text-xs font-bold uppercase tracking-[0.2em] text-[var(--warm-ivory)]">NangNyamai</span>
          {popular && <Badge tone="accent" className="absolute left-4 top-4">Signature</Badge>}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-[var(--primary-text)]">{name}</h3>
            <span className="shrink-0 text-sm font-bold text-[var(--sarawak-red)]">RM {Number(price).toFixed(2)}</span>
          </div>
          {description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--secondary-text)]">{description}</p>}
        </div>
      </button>
      <div className="px-5 pb-5">
        <Button className="w-full" onClick={onAdd}>+ Tambah</Button>
      </div>
    </article>
  );
}
