import { createClient } from "@/lib/supabase/server";
import { MenuBrowser } from "@/components/customer/menu-browser";
import localMenu from "../../../../data/menu-2025.json";

type OrderPageProps = {
  searchParams: Promise<{ table?: string; token?: string }>;
};

export default async function OrderEntryPage({ searchParams }: OrderPageProps) {
  const params = await searchParams;
  const table = params.table ?? null;
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  let categories = null;
  let error = null;

  if (hasSupabaseConfig) {
    const supabase = await createClient();
    const [categoryResult, itemResult] = await Promise.all([
      supabase.from("categories").select("id, name, slug").eq("is_active", true).order("display_order", { ascending: true }),
      supabase.from("menu_items").select("id, category_id, name, description, price, is_available").order("name", { ascending: true }),
    ]);
    error = categoryResult.error ?? itemResult.error;
    categories = categoryResult.data?.map((category) => ({
      ...category,
      menu_items: itemResult.data?.filter((item) => item.category_id === category.id) ?? [],
    })) ?? null;
  }

  const previewCategories = localMenu.categories.map((category, categoryIndex) => ({
    id: `local-${categoryIndex}`,
    name: category.name,
    menu_items: category.items.map((item, itemIndex) => ({
      id: `local-${categoryIndex}-${itemIndex}`,
      name: item.name,
      description: "description" in item ? item.description ?? null : null,
      price: item.price,
      is_available: true,
    })),
  }));
  const visibleCategories = hasSupabaseConfig ? categories : previewCategories;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8 sm:px-8">
      <header className="relative mb-10 overflow-hidden rounded-[28px] bg-[#171717] p-6 text-[#fff8eb] shadow-[var(--shadow-soft)] sm:p-9">
        <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[18px] border-[#d71920]/40" aria-hidden="true" />
        <div className="relative">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#f6c515]">Budaya Restaurant</p>
          <h1 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">Taste the flavours of Sarawak.</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#e8ddc7]">Menu tempatan yang diwarisi, disediakan segar untuk pengalaman makan anda.</p>
          {table && <p className="mt-5 inline-flex rounded-full bg-[#fff8eb]/10 px-4 py-2 text-sm text-[#fff8eb]">Meja {table}</p>}
        </div>
      </header>

      {hasSupabaseConfig && error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Menu belum dapat dimuat. Sila semak sambungan Supabase.
        </p>
      ) : !visibleCategories?.length ? (
        <p className="rounded-lg bg-neutral-100 p-4 text-sm text-neutral-600">
          Menu belum tersedia.
        </p>
      ) : (
        <MenuBrowser categories={visibleCategories} tableToken={params.token ?? ""} />
      )}
    </main>
  );
}
