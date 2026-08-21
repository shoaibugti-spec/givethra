import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  "Electricity Bill": "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
  "Gas Bill": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  "Water Bill": "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
  "House Rent": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  "School Fees": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  "Education & Books": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  "Medical & Treatment": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
  Medicines: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
  "Food & Groceries": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  "Child Support": "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800",
  "Widow & Elderly Support": "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  "Disability Support": "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
  "Marriage Support": "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950 dark:text-fuchsia-300 dark:border-fuchsia-800",
  "Business / Work Help": "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  "Home Repair": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  "Funeral Expenses": "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700",
  "Livestock / Farming": "bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-950 dark:text-lime-300 dark:border-lime-800",
  "Debt Relief": "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  "Emergency Help": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  Other: "bg-muted text-muted-foreground border-border",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  "Electricity Bill": "⚡",
  "Gas Bill": "🔥",
  "Water Bill": "💧",
  "House Rent": "🏠",
  "School Fees": "🎓",
  "Education & Books": "📚",
  "Medical & Treatment": "🏥",
  Medicines: "💊",
  "Food & Groceries": "🍲",
  "Child Support": "👶",
  "Widow & Elderly Support": "👵",
  "Disability Support": "♿",
  "Marriage Support": "💍",
  "Business / Work Help": "💼",
  "Home Repair": "🏚️",
  "Funeral Expenses": "⚰️",
  "Livestock / Farming": "🐄",
  "Debt Relief": "💳",
  "Emergency Help": "🚨",
  Other: "🤲",
};

interface Props {
  category: string;
  size?: "xs" | "sm";
  className?: string;
  showEmoji?: boolean;
}

export function CategoryPill({
  category,
  size = "xs",
  className,
  showEmoji = false,
}: Props) {
  const colorClass =
    categoryColors[category] ?? "bg-muted text-muted-foreground border-border";
  const emoji = CATEGORY_EMOJI[category];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap",
        size === "xs" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        colorClass,
        className,
      )}
    >
      {showEmoji && emoji && <span>{emoji}</span>}
      {category}
    </span>
  );
}
