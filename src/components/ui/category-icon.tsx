type CategoryIconProps = { name: string; className?: string };

function iconId(name: string) {
  const value = name.toLowerCase();
  if (value.includes("noodle") || value.includes("mee") || value.includes("laksa")) return "icon-noodles";
  if (value.includes("drink") || value.includes("beverage") || value.includes("juice")) return "icon-drinks";
  if (value.includes("dessert")) return "icon-desserts";
  if (value.includes("rice")) return "icon-rice";
  if (value.includes("highlander")) return "icon-highlander";
  if (value.includes("ethnic")) return "icon-ethnic";
  if (value.includes("snack") || value.includes("side")) return "icon-sides";
  return "icon-all";
}

export function CategoryIcon({ name, className = "h-8 w-8" }: CategoryIconProps) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 64 64"><use href={`/icons/category-icons.svg#${iconId(name)}`} /></svg>;
}
