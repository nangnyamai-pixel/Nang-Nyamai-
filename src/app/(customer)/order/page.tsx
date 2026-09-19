import menuData from "@/../data/menu-2025.json";
import { MenuBrowser } from "@/components/customer/menu-browser";
import { createClient } from "@/lib/supabase/server";
import { getMenuImage } from "@/lib/menu-images";
import Link from "next/link";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function OrderPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const table = typeof params.table === "string" ? params.table : "";
  const token = typeof params.token === "string" ? params.token : "";
  const previewCategories = menuData.categories.map((category) => ({
      id: category.slug,
      name: category.name,
      menu_items: category.items.map((item, itemIndex) => ({
      id: `${category.slug}-${itemIndex + 1}`,
      name: item.name,
      description: "description" in item ? item.description ?? null : null,
      price: item.price,
      is_available: true,
      image: getMenuImage(category.slug, item.name),
        is_signature: "is_signature" in item ? item.is_signature === true : false,
        categoryName: category.name,
    })),
  }));
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  let categories = hasSupabase ? [] : previewCategories;
  let popularIds: string[] = previewCategories.flatMap((category) => category.menu_items.filter((item) => item.is_signature).map((item) => item.id));

  if (hasSupabase) {
    const supabase = await createClient();
    const [{ data: liveCategories }, { data: liveItems }, { data: popularityRows }] = await Promise.all([
      supabase.from("categories").select("id, name, slug, display_order").eq("is_active", true).order("display_order"),
      supabase.from("menu_items").select("id, category_id, name, description, price, image_url, is_available, is_popular").order("name"),
      supabase.from("order_items").select("menu_item_id, quantity, orders!inner(status, payment_status)").eq("orders.status", "completed").eq("orders.payment_status", "paid"),
    ]);
    const totals = new Map<string, number>();
    for (const row of (popularityRows ?? []) as { menu_item_id: string; quantity: number }[]) totals.set(row.menu_item_id, (totals.get(row.menu_item_id) ?? 0) + Number(row.quantity || 0));
    popularIds = totals.size > 0
      ? [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5).map(([id]) => id)
      : (liveItems ?? []).filter((item) => item.is_available && item.is_popular).map((item) => item.id);
    if (liveCategories && liveItems) {
      categories = liveCategories.map((category) => ({
        id: category.id,
        name: category.name,
        menu_items: liveItems.filter((item) => item.category_id === category.id).map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price),
          is_available: item.is_available,
          image: item.image_url || getMenuImage(category.slug, item.name),
          is_signature: item.is_popular === true,
          categoryName: category.name,
        })),
      })).filter((category) => category.menu_items.length > 0);
    }
  }

  return (
    <main className="heritage-pattern min-h-screen">
      <header className="mx-auto max-w-5xl px-5 pb-4 pt-8 sm:px-8">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--sarawak-red)]">Budaya Restaurant</p><h1 className="mt-2 text-3xl font-bold text-[var(--charcoal)]">Menu Sarawak</h1></div><Link href="/profile" aria-label="Open customer profile" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-green)]"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.2 3.2-5 7-5s6.2 1.8 7 5" /></svg></Link></div>
        <p className="mt-2 text-sm text-[var(--secondary-text)]">{table ? `Table ${table}` : "Preview menu"} · Prices subject to 6% SST</p>
      </header>
      <section className="mx-auto max-w-5xl px-5 pb-12 sm:px-8">
        <MenuBrowser categories={categories} tableToken={token || table} popularIds={popularIds} />
      </section>
    </main>
  );
}
