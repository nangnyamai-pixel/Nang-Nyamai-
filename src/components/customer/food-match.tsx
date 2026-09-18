"use client";

import { useMemo, useState } from "react";
import { FoodCard } from "@/components/customer/food-card";
import { Button } from "@/components/ui/button";
import { matchFood, type FoodMatchPersonalization, type FoodMatchPreference, type MatchableMenuItem } from "@/lib/food-match";
import { useLanguage } from "@/lib/i18n";

const preferences: { key: FoodMatchPreference; en: string; ms: string }[] = [
  { key: "spicy", en: "Spicy", ms: "Pedas" }, { key: "noodles", en: "Noodles", ms: "Mi" },
  { key: "meat", en: "Meat", ms: "Daging" }, { key: "rice", en: "Rice", ms: "Nasi" },
  { key: "local", en: "Local Food", ms: "Makanan Tempatan" }, { key: "vegetarian", en: "Vegetarian", ms: "Vegetarian" },
  { key: "budget", en: "Budget", ms: "Bajet" },
];

export function FoodMatch({ items, onSelect, onAdd }: { items: MatchableMenuItem[]; onSelect: (item: MatchableMenuItem) => void; onAdd: (item: MatchableMenuItem) => void }) {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FoodMatchPreference[]>([]);
  const [budget, setBudget] = useState(15);
  const [hasRun, setHasRun] = useState(false);
  const [personalization, setPersonalization] = useState<FoodMatchPersonalization>({});
  const results = useMemo(() => matchFood(items, selected, selected.includes("budget") ? budget : undefined, personalization), [items, selected, budget, personalization]);
  const label = (en: string, ms: string) => locale === "ms" ? ms : en;
  const toggle = (key: FoodMatchPreference) => setSelected((current) => current.includes(key) ? current.filter((value) => value !== key) : [...current, key]);
  const runMatch = () => {
    setHasRun(true);
    setPersonalization({});
    void fetch("/api/ai-food-match/personalization", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ foodIds: items.map((item) => item.id) }) })
      .then(async (response) => response.ok ? await response.json() as FoodMatchPersonalization : {})
      .then((data) => setPersonalization(data))
      .catch((error) => console.error("[AI_FOOD_MATCH] personalization unavailable", error));
    void fetch("/api/ai-food-match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preferences: selected, topMatchFoodId: results[0]?.id ?? null, matchPercentage: results[0]?.percentage ?? 0 }) }).catch((error) => console.error("[AI_FOOD_MATCH] activity recording unavailable", error));
  };
  return <section className="mb-12 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-[var(--text-primary)]">{label("Find My Food", "Cari Makanan Saya")}</h2><p className="text-sm text-[var(--text-secondary)]">{label("Get simple matches from today's available menu.", "Cari padanan mudah daripada menu yang tersedia hari ini.")}</p></div><Button type="button" variant="outline" onClick={() => setOpen((value) => !value)}>{open ? label("Close", "Tutup") : label("Start matching", "Mula cari")}</Button></div>
    {open && <div className="mt-4 space-y-4"><fieldset><legend className="text-sm font-bold text-[var(--text-primary)]">{label("What are you in the mood for?", "Apakah pilihan anda?")}</legend><div className="mt-2 flex flex-wrap gap-2">{preferences.map((preference) => <button key={preference.key} type="button" aria-pressed={selected.includes(preference.key)} onClick={() => toggle(preference.key)} className={`min-h-11 rounded-full border px-4 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-green)] ${selected.includes(preference.key) ? "border-[var(--primary-green)] bg-[var(--primary-green)] text-white" : "border-[var(--border-soft)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"}`}>{label(preference.en, preference.ms)}</button>)}</div></fieldset>{selected.includes("budget") && <label className="block text-sm font-semibold text-[var(--text-primary)]">{label("Maximum price", "Harga maksimum")}: RM {budget}<input type="range" min="5" max="60" step="1" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-2 w-full accent-[var(--primary-green)]" /></label>}<div className="flex flex-wrap gap-2"><Button type="button" onClick={runMatch}>{label("Find matches", "Cari padanan")}</Button><Button type="button" variant="ghost" onClick={() => { setSelected([]); setHasRun(false); }}>{label("Reset", "Set semula")}</Button></div>{hasRun && <div aria-live="polite" className="space-y-4"><h3 className="text-lg font-bold text-[var(--text-primary)]">{label("Top 3 matches", "3 padanan terbaik")}</h3>{results.length === 0 ? <p className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-secondary)]">{label("No matching food found. Try broadening your preferences.", "Tiada makanan sepadan. Cuba longgarkan pilihan anda.")}</p> : <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">{results.map((result) => <div key={result.id} className="flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface)]"><div className="flex-1"><FoodCard name={result.name} description={result.description} price={result.price} image={result.image} recommended onSelect={() => onSelect(result)} onAdd={() => onAdd(result)} /></div><div className="min-h-[4.5rem] px-4 pb-4 pt-2"><p className="text-sm font-bold text-[var(--gold-accent)]">{result.percentage}% {label("Match", "Padanan")}</p><p className="mt-1 line-clamp-2 min-h-8 text-xs leading-4 text-[var(--text-secondary)]"><span className="font-semibold">{label("Why this match?", "Kenapa padanan ini?")}</span> {result.reasons.length ? result.reasons.join(", ") : label("Based on your menu preferences.", "Berdasarkan pilihan menu anda.")}</p></div></div>)}</div>}</div>}</div>}
  </section>;
}
