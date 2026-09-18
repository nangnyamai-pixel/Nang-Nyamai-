export type FoodMatchPreference = "spicy" | "noodles" | "meat" | "rice" | "local" | "vegetarian" | "budget";

export type MatchableMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  categoryName: string;
  image?: string | null;
  is_signature?: boolean;
};

export type FoodMatchPersonalization = { previouslyOrderedIds?: string[]; popularIds?: string[] };
export type FoodMatchResult = MatchableMenuItem & { percentage: number; reasons: string[]; personalizationReasons: string[] };

const signals: Record<Exclude<FoodMatchPreference, "budget">, { words: string[]; reason: string }> = {
  spicy: { words: ["spicy", "sambal", "pedas", "asam pedas", "chilli", "chili"], reason: "Spicy flavours" },
  noodles: { words: ["noodle", "mee", "laksa", "vermicelli", "kueh tiaw", "bee hoon"], reason: "Noodles" },
  meat: { words: ["chicken", "ayam", "manok", "beef", "daging", "fish", "ikan", "prawn", "udang"], reason: "Meat or seafood" },
  rice: { words: ["rice", "nasi", "bario"], reason: "Rice-based dish" },
  local: { words: ["sarawak", "santubong", "sibu", "pansoh", "umai", "tepus", "highlander", "paku", "belacan", "kolok", "laksa"], reason: "Local Sarawak flavours" },
  vegetarian: { words: ["vegetable", "sayur", "salad", "mushroom", "cucumber", "pumpkin", "fruit"], reason: "Vegetable-forward choice" },
};

export function matchFood(items: MatchableMenuItem[], preferences: FoodMatchPreference[], budget?: number, personalization: FoodMatchPersonalization = {}): FoodMatchResult[] {
  const active = preferences.filter((preference) => preference !== "budget");
  const previouslyOrdered = new Set(personalization.previouslyOrderedIds ?? []);
  const popular = new Set(personalization.popularIds ?? []);
  return items.filter((item) => item.is_available).map((item) => {
    const haystack = `${item.name} ${item.description ?? ""} ${item.categoryName}`.toLowerCase();
    const reasons: string[] = [];
    let points = 0;
    for (const preference of active) {
      const signal = signals[preference];
      if (signal.words.some((word) => haystack.includes(word))) { points += 3; reasons.push(signal.reason); }
    }
    if (preferences.includes("budget") && budget !== undefined && item.price <= budget) { points += 2; reasons.push("Within budget"); }
    const personalizationReasons: string[] = [];
    if (previouslyOrdered.has(item.id)) { points += 2; personalizationReasons.push("You ordered this before"); }
    if (popular.has(item.id)) { points += 1; personalizationReasons.push("Popular menu choice"); }
    const maxPoints = active.length * 3 + (preferences.includes("budget") && budget !== undefined ? 2 : 0) + 3;
    const percentage = maxPoints ? Math.min(99, Math.round((points / maxPoints) * 100)) : 70;
    return { ...item, percentage, reasons: [...reasons, ...personalizationReasons], personalizationReasons };
  }).filter((item) => active.length === 0 || item.reasons.length > 0)
    .sort((a, b) => b.percentage - a.percentage || a.price - b.price || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
    .slice(0, 3);
}
