"use client";

import { useMemo, useState } from "react";
import { FoodCard } from "@/components/customer/food-card";
import { Button } from "@/components/ui/button";
import { CategoryNavigation } from "@/components/customer/category-navigation";
import { QuantitySelector } from "@/components/customer/quantity-selector";
import { OrderSummary } from "@/components/customer/order-summary";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { LanguageSelector } from "@/components/shared/language-selector";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { FoodMatch } from "@/components/customer/food-match";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  image?: string | null;
  is_signature?: boolean;
  categoryName: string;
};

type MenuCategory = {
  id: string;
  name: string;
  menu_items: MenuItem[];
};

export function MenuBrowser({ categories, tableToken, popularIds = [] }: { categories: MenuCategory[]; tableToken: string; popularIds?: string[] }) {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [specialNote, setSpecialNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<{ id: string; order_number: string; total: number; status: string; payment_status: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authChoiceOpen, setAuthChoiceOpen] = useState(false);
  const [guestCheckoutAllowed, setGuestCheckoutAllowed] = useState(false);
  const [cart, setCart] = useState<Record<string, { item: MenuItem; quantity: number }>>({});
  const [recommendedIds, setRecommendedIds] = useState<Set<string>>(() => new Set());
  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((total, entry) => total + entry.quantity, 0);
  const cartTotal = cartItems.reduce((total, entry) => total + Number(entry.item.price) * entry.quantity, 0);
  const matchItems = categories.flatMap((category) => category.menu_items.filter((item) => item.is_available).map((item) => ({ ...item, categoryName: category.name })));
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return categories
      .filter((category) => activeCategory === "all" || category.id === activeCategory)
      .map((category) => ({
        ...category,
        menu_items: category.menu_items.filter((item) =>
          !normalized || `${item.name} ${item.description ?? ""}`.toLowerCase().includes(normalized)
        ),
      }))
      .filter((category) => category.menu_items.length > 0);
  }, [activeCategory, categories, query]);

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-end gap-2"><LanguageSelector /><ThemeToggle /></div>
        <label className="block">
          <span className="sr-only">{t("menuSearch")}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("menuSearch")}
            className="min-h-11 w-full rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-5 text-sm text-[var(--text-primary)] shadow-sm placeholder:text-[var(--text-secondary)]"
          />
        </label>
        <CategoryNavigation categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
      </div>
      <FoodMatch items={matchItems} onSelect={(item) => setSelectedItem(item)} onAdd={(item) => { setRecommendedIds((current) => new Set(current).add(item.id)); setCart((current) => ({ ...current, [item.id]: { item, quantity: (current[item.id]?.quantity ?? 0) + 1 } })); }} />

      {filtered.length === 0 ? (
        <p className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-secondary)]">
          {t("noMenu")}
        </p>
      ) : (
        <div className="space-y-10">
          {filtered.map((category) => (
            <section key={category.id}>
              <h2 className="mb-4 border-l-4 border-[var(--primary-green)] pl-3 text-xl font-bold tracking-tight text-[var(--text-primary)]">{category.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.menu_items.filter((item) => item.is_available).map((item) => (
                  <FoodCard key={item.id} name={item.name} description={item.description} price={item.price} image={item.image} popular={popularIds.includes(item.id)} badgeLabel="Popular" onSelect={() => setSelectedItem(item)} onAdd={() => setCart((current) => ({ ...current, [item.id]: { item, quantity: (current[item.id]?.quantity ?? 0) + 1 } }))} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      {cartCount > 0 && (
        <aside className="sticky bottom-4 z-10 mt-8 flex items-center justify-between gap-4 rounded-[20px] bg-[var(--brown-dark)] p-4 text-white shadow-[var(--shadow-soft)]" aria-label="Ringkasan cart">
          <div>
            <p className="text-xs text-white">{tableToken ? `${t("tableDetected")}: ${tableToken}` : t("notDetected")}</p><p className="text-xs text-white">{cartCount} {t("itemsInCart")}</p>
            <p className="text-lg font-bold">RM {cartTotal.toFixed(2)}</p>
          </div>
          <button type="button" onClick={() => setCartOpen(true)} className="min-h-11 rounded-full bg-[var(--primary-green)] px-5 text-sm font-bold text-white hover:bg-[var(--primary-green-hover)]">
            {t("cart")}
          </button>
        </aside>
      )}
      {cartOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-[var(--charcoal)]/60 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={t("cart")}>
          <section className="w-full max-w-lg rounded-t-[var(--radius-xl)] bg-[var(--warm-ivory)] p-6 shadow-2xl sm:rounded-[var(--radius-xl)]">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sarawak-red)]">{t("yourOrder")}</p><h2 className="mt-1 text-2xl font-bold text-[var(--charcoal)]">{t("cart")}</h2></div>
              <button type="button" onClick={() => setCartOpen(false)} className="min-h-11 min-w-11 rounded-full bg-white text-xl" aria-label={`${t("close")} ${t("cart")}`}>×</button>
            </div>
            <div className="mt-6 max-h-[45vh] space-y-3 overflow-y-auto">
              {cartItems.map(({ item, quantity }) => (
                <div key={item.id} className="rounded-[var(--radius-md)] border border-[var(--soft-sand)] bg-white p-4">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-[var(--charcoal)]">{item.name}</h3><div className="mt-1 flex flex-wrap items-center gap-2"><p className="text-sm text-[var(--secondary-text)]">RM {Number(item.price).toFixed(2)} {t("each")}</p>{recommendedIds.has(item.id) && <span className="rounded-full bg-[var(--gold-accent)] px-2 py-0.5 text-xs font-bold text-[var(--brown-dark)]">Recommended</span>}</div></div><button type="button" onClick={() => setCart((current) => { const next = { ...current }; delete next[item.id]; return next; })} className="min-h-11 px-2 text-xs font-semibold text-[var(--sarawak-red)]">{t("remove")}</button></div>
                  <div className="mt-3 flex items-center justify-between"><QuantitySelector label={item.name} quantity={quantity} onDecrease={() => setCart((current) => ({ ...current, [item.id]: { item, quantity: quantity > 1 ? quantity - 1 : 1 } }))} onIncrease={() => setCart((current) => ({ ...current, [item.id]: { item, quantity: quantity + 1 } }))} /><span className="font-bold text-[var(--charcoal)]">RM {(Number(item.price) * quantity).toFixed(2)}</span></div>
                </div>
              ))}
            </div>
            <div className="mt-6"><OrderSummary subtotal={cartTotal} /><Button type="button" className="mt-4 w-full" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>{t("continueCheckout")}</Button></div>
          </section>
        </div>
      )}
      {checkoutOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-[var(--charcoal)]/60 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={t("checkout")}>
          <section className="w-full max-w-lg rounded-t-[var(--radius-xl)] bg-[var(--warm-ivory)] p-6 shadow-2xl sm:rounded-[var(--radius-xl)]">
            <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sarawak-red)]">{t("lastStep")}</p><h2 className="mt-1 text-2xl font-bold text-[var(--charcoal)]">{t("checkout")}</h2></div><button type="button" onClick={() => setCheckoutOpen(false)} className="min-h-11 min-w-11 rounded-full bg-white text-xl" aria-label={`${t("close")} ${t("checkout")}`}>×</button></div>
            <form className="mt-6 space-y-4" onSubmit={async (event) => { event.preventDefault(); if (isSubmitting) return; setCheckoutError(null); if (!tableToken) { setCheckoutError(t("qrIncomplete")); return; } const { data: { user } } = await createClient().auth.getUser(); if (!user && !guestCheckoutAllowed && !authChoiceOpen) { setAuthChoiceOpen(true); return; } setIsSubmitting(true); try { const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tableToken, specialNote, paymentMethod, items: cartItems.map(({ item, quantity }) => ({ menuItemId: item.id, quantity })) }) }); const result = await response.json(); if (!response.ok) { setCheckoutError(result.error ?? t("orderFailed")); return; } setSubmittedOrder(result.order); setCheckoutOpen(false); setCart({}); } catch { setCheckoutError(t("connectionFailed")); } finally { setIsSubmitting(false); } }}>
              <div className="rounded-[var(--radius-md)] border border-[var(--soft-sand)] bg-white px-4 py-3 text-sm text-[var(--secondary-text)]">
                {t("tableDetected")}: <strong className="text-[var(--charcoal)]">{tableToken || t("notDetected")}</strong>
              </div>
              <label className="block text-sm font-semibold text-[var(--charcoal)]">{t("specialNote")} <span className="font-normal text-[var(--secondary-text)]">({t("optional")})</span><textarea value={specialNote} onChange={(event) => setSpecialNote(event.target.value)} maxLength={280} rows={3} placeholder={t("notePlaceholder")} className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--soft-sand)] bg-white p-4 text-sm text-[var(--charcoal)] placeholder:text-[var(--secondary-text)]" /></label>
              <fieldset><legend className="text-sm font-semibold text-[var(--charcoal)]">{t("paymentMethod")}</legend><div className="mt-2 grid grid-cols-2 gap-3">{(["cash", "card"] as const).map((method) => <label key={method} className={`flex min-h-12 cursor-pointer items-center justify-center rounded-full border text-sm font-semibold ${paymentMethod === method ? "border-[var(--sarawak-red)] bg-[var(--sarawak-red)] text-white" : "border-[var(--soft-sand)] bg-white text-[var(--charcoal)]"}`}><input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="sr-only" />{method === "cash" ? t("cash") : t("card")}</label>)}</div></fieldset>
              <OrderSummary subtotal={cartTotal} />
              {checkoutError && <p role="alert" className="rounded-[var(--radius-sm)] bg-red-50 p-3 text-sm text-red-700">{checkoutError}</p>}
              <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? t("submitting") : t("submitOrder")}</Button>
            </form>
            {authChoiceOpen && <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--soft-sand)] bg-white p-4"><p className="text-sm font-semibold text-[var(--charcoal)]">{t("chooseContinue")}</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><Button type="button" onClick={async () => { const next = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search)}`; await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: next } }); }}>{t("googleLogin")}</Button><Button type="button" variant="outline" onClick={() => setGuestCheckoutAllowed(true)}>{t("guestContinue")}</Button></div></div>}
          </section>
        </div>
      )}
      {submittedOrder && <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--charcoal)]/60 p-5" role="dialog" aria-modal="true" aria-label="Pesanan disahkan"><section className="w-full max-w-md rounded-[var(--radius-xl)] bg-[var(--warm-ivory)] p-7 text-center shadow-2xl"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700" aria-hidden="true">✓</div><p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--sarawak-red)]">Nyamai!</p><h2 className="mt-2 text-3xl font-bold text-[var(--charcoal)]">Order confirmed</h2><p className="mt-2 text-sm leading-6 text-[var(--secondary-text)]">Pesanan anda telah diterima dan dihantar ke dapur.</p><div className="mt-6 rounded-[var(--radius-md)] bg-white p-4 text-left"><div className="flex justify-between text-sm"><span className="text-[var(--secondary-text)]">Order number</span><strong>#{submittedOrder.order_number}</strong></div><div className="mt-2 flex justify-between text-sm"><span className="text-[var(--secondary-text)]">Status</span><strong className="capitalize">{submittedOrder.status}</strong></div><div className="mt-2 flex justify-between text-sm"><span className="text-[var(--secondary-text)]">Payment</span><strong className="capitalize">{submittedOrder.payment_status}</strong></div><div className="mt-3 border-t border-[var(--soft-sand)] pt-3 flex justify-between font-bold"><span>Total</span><span className="text-[var(--sarawak-red)]">RM {Number(submittedOrder.total).toFixed(2)}</span></div></div><a href={`/order/${submittedOrder.id}`} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--sarawak-red)] px-5 text-sm font-bold text-white">Track order</a><Button variant="ghost" type="button" className="mt-2 w-full" onClick={() => setSubmittedOrder(null)}>Kembali ke menu</Button></section></div>}
      {selectedItem && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-[var(--charcoal)]/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={selectedItem.name}>
          <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-[var(--warm-ivory)] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sarawak-red)]">Food detail</p><h2 className="mt-2 text-2xl font-bold text-[var(--charcoal)]">{selectedItem.name}</h2></div>
              <button type="button" onClick={() => setSelectedItem(null)} className="min-h-11 min-w-11 rounded-full bg-white text-xl" aria-label="Tutup">×</button>
            </div>
            {selectedItem.description && <p className="text-sm leading-6 text-[var(--secondary-text)]">{selectedItem.description}</p>}
            <p className="mt-5 text-xl font-bold text-[var(--sarawak-red)]">RM {Number(selectedItem.price).toFixed(2)}</p>
            <Button className="mt-6 w-full" onClick={() => { setCart((current) => ({ ...current, [selectedItem.id]: { item: selectedItem, quantity: (current[selectedItem.id]?.quantity ?? 0) + 1 } })); setSelectedItem(null); }}>Tambah ke cart</Button>
          </div>
        </div>
      )}
    </>
  );
}
