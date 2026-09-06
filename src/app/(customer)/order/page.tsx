import menuData from "@/../data/menu-2025.json";
import { MenuBrowser } from "@/components/customer/menu-browser";
import { createClient } from "@/lib/supabase/server";

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
    })),
  }));
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  let categories = hasSupabase ? [] : previewCategories;

  if (hasSupabase) {
    const supabase = await createClient();
    const [{ data: liveCategories }, { data: liveItems }] = await Promise.all([
      supabase.from("categories").select("id, name, slug, display_order").eq("is_active", true).order("display_order"),
      supabase.from("menu_items").select("id, category_id, name, description, price, is_available, is_popular").order("name"),
    ]);
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
        })),
      })).filter((category) => category.menu_items.length > 0);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--warm-ivory)]">
      <header className="mx-auto max-w-5xl px-5 pb-4 pt-8 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--sarawak-red)]">Budaya Restaurant</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--charcoal)]">Menu Sarawak</h1>
        <p className="mt-2 text-sm text-[var(--secondary-text)]">{table ? `Meja ${table}` : "Preview menu"} · Harga tertakluk kepada SST 6%</p>
      </header>
      <section className="mx-auto max-w-5xl px-5 pb-12 sm:px-8">
        <MenuBrowser categories={categories} tableToken={token || table} tableLabel={table || token} />
      </section>
    </main>
  );
}
