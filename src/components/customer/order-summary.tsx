import { PriceRow } from "@/components/customer/price-row";

export function OrderSummary({ subtotal, total = subtotal }: { subtotal: number; total?: number }) {
  return <div className="border-t border-[var(--soft-sand)] pt-4"><PriceRow label="Subtotal" value={subtotal} /><div className="mt-3 border-t border-[var(--soft-sand)] pt-3"><PriceRow label="Jumlah" value={total} prominent /></div></div>;
}
