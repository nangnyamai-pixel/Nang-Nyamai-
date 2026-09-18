"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import Image from "next/image";

type FoodCardProps = {
  name: string;
  description: string | null;
  price: number;
  popular?: boolean;
  recommended?: boolean;
  badgeLabel?: string;
  onAdd: () => void;
  onSelect: () => void;
  image?: string | null;
};

export function FoodCard({ name, description, price, popular, recommended, badgeLabel, onAdd, onSelect, image }: FoodCardProps) {
  const { t } = useLanguage();
  const isExternalImage = image?.startsWith("http://") || image?.startsWith("https://");
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--soft-sand)] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      <button type="button" onClick={onSelect} className="flex flex-1 flex-col text-left">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[var(--charcoal)] px-6 text-center">
          {image && (isExternalImage ? <img src={image} alt={name} className="absolute inset-0 h-full w-full object-cover" /> : <Image src={image} alt={name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />)}
          <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true" style={{ backgroundImage: "linear-gradient(135deg, transparent 42%, #c89b3c 43%, transparent 45%), linear-gradient(45deg, transparent 42%, #6b4632 43%, transparent 45%)", backgroundSize: "32px 32px" }} />
          {!image && <span className="relative text-xs font-bold uppercase tracking-[0.2em] text-[var(--warm-ivory)]">NangNyamai</span>}
          {popular && <Badge tone="accent" className="absolute left-4 top-4">{badgeLabel ?? t("signature")}</Badge>}
          {recommended && <Badge tone="accent" className={`absolute left-4 ${popular ? "top-14" : "top-4"}`}>Recommended</Badge>}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex min-h-12 items-start justify-between gap-3">
            <h3 className="line-clamp-2 font-semibold text-[var(--primary-text)]">{name}</h3>
            <span className="shrink-0 text-sm font-bold text-[var(--terracotta)]">RM {Number(price).toFixed(2)}</span>
          </div>
          <p className="mt-2 min-h-12 line-clamp-2 text-sm leading-6 text-[var(--secondary-text)]">{description || " "}</p>
        </div>
      </button>
      <div className="mt-auto px-5 pb-5">
        <Button className="w-full" onClick={onAdd}>+ {t("add")}</Button>
      </div>
    </article>
  );
}
