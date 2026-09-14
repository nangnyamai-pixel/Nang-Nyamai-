import { PriceRow } from "@/components/customer/price-row";
import { useLanguage } from "@/lib/i18n";

export function OrderSummary({ subtotal, total = subtotal }: { subtotal: number; total?: number }) {
  const { t } = useLanguage();
  return <div className="border-t border-[var(--soft-sand)] pt-4"><PriceRow label={t("subtotal")} value={subtotal} /><div className="mt-3 border-t border-[var(--soft-sand)] pt-3"><PriceRow label={t("total")} value={total} prominent /></div></div>;
}
