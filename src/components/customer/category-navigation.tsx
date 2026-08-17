"use client";

import { CategoryIcon } from "@/components/ui/category-icon";

type Category = { id: string; name: string };

export function CategoryNavigation({ categories, activeCategory, onSelect }: { categories: Category[]; activeCategory: string; onSelect: (id: string) => void }) {
  return (
    <nav className="-mx-1 overflow-x-auto px-1 pb-2" aria-label="Kategori menu">
      <div className="flex min-w-max gap-3">
        {[{ id: "all", name: "Semua" }, ...categories].map((category) => {
          const active = activeCategory === category.id;
          return (
            <button
              type="button"
              key={category.id}
              onClick={() => onSelect(category.id)}
              aria-pressed={active}
              className={`group w-[112px] rounded-[18px] p-1.5 text-left transition duration-200 ${active ? "bg-white shadow-[0_8px_20px_rgb(23_23_23_/_10%)] ring-2 ring-[var(--sarawak-red)]" : "bg-transparent hover:-translate-y-0.5"}`}
            >
              <span className="flex aspect-[1.35/1] items-center justify-center overflow-hidden rounded-[14px] bg-[#FAF7F2]">
                <CategoryIcon name={category.name} className="h-14 w-14 transition duration-200 group-hover:scale-105" />
              </span>
              <span className={`block truncate px-1 pt-2 text-center text-xs font-semibold ${active ? "text-[var(--sarawak-red)]" : "text-[var(--secondary-text)]"}`}>{category.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
