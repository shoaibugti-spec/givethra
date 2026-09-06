// src/frontend/src/pages/submit-request/steps/StepCategory.tsx
import { Button } from "@/components/ui/button";
import { StepNavigation } from "../shared/StepNavigation";
import { getCategoryColor, getCategoryIcon } from "../utils/categoryStyles";

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  limitInfo?: string;
}

const CATEGORIES_WITH_STYLES: Category[] = [
  { id: "Electricity Bill", label: "⚡ Electricity Bill", color: "bg-yellow-500", icon: "⚡" },
  { id: "Gas Bill", label: "🔥 Gas Bill", color: "bg-orange-500", icon: "🔥" },
  { id: "Water Bill", label: "💧 Water Bill", color: "bg-blue-500", icon: "💧" },
  { id: "House Rent", label: "🏠 House Rent", color: "bg-indigo-500", icon: "🏠" },
  { id: "School, College & University Fees", label: "🎓 School/College Fee", color: "bg-purple-500", icon: "🎓" },
  { id: "Education, Books & Admission", label: "📚 Education/Books", color: "bg-pink-500", icon: "📚" },
  { id: "Medical & Treatment", label: "🏥 Medical Treatment", color: "bg-red-500", icon: "🏥" },
  { id: "Medicines", label: "💊 Medicines", color: "bg-rose-500", icon: "💊" },
  { id: "Food & Groceries", label: "🍲 Food & Groceries", color: "bg-emerald-500", icon: "🍲" },
  { id: "Child Support", label: "👶 Child Support", color: "bg-cyan-500", icon: "👶" },
  { id: "Widow & Elderly Support", label: "👵 Widow/Elderly", color: "bg-teal-500", icon: "👵" },
  { id: "Disability Support", label: "♿ Disability Support", color: "bg-sky-500", icon: "♿" },
  { id: "Marriage Support", label: "💍 Marriage Support", color: "bg-fuchsia-500", icon: "💍" },
  { id: "Business / Work Help", label: "💼 Business Help", color: "bg-amber-500", icon: "💼" },
  { id: "Home Repair", label: "🔧 Home Repair", color: "bg-stone-500", icon: "🔧" },
  { id: "Funeral Expenses", label: "🕊️ Funeral Expenses", color: "bg-gray-500", icon: "🕊️" },
  { id: "Livestock / Farming", label: "🐄 Livestock/Farming", color: "bg-lime-500", icon: "🐄" },
  { id: "Debt Relief", label: "💰 Debt Relief", color: "bg-violet-500", icon: "💰" },
  { id: "Emergency Help", label: "🚨 Emergency Help", color: "bg-red-700", icon: "🚨" },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  categories?: typeof CATEGORIES_WITH_STYLES;
  categoryLimits: any;
  willBeFree: boolean;
  isFreeDisabled: boolean;
  freeCasesUsed: number;
}

export default function StepCategory({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  categories = CATEGORIES_WITH_STYLES,
  categoryLimits,
  willBeFree,
  isFreeDisabled,
  freeCasesUsed,
}: Props) {
  const handleSelect = (id: string) => {
    onChange(id);
    // Auto-advance after selection with a small delay
    setTimeout(onNext, 300);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">What do you need help with?</h2>
        <p className="text-sm text-muted-foreground">
          Choose the category that best describes your need.
        </p>
        {willBeFree && !isFreeDisabled && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 text-sm font-medium">
            🎉 {freeCasesUsed === 0 ? "Your first case is FREE!" : "This case is FREE!"}
          </div>
        )}
        {isFreeDisabled && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 text-sm">
            ⚠️ Free cases used up. 1 credit fee applies.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const limit = categoryLimits[cat.id];
          const isSelected = value === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              className={`
                relative p-4 rounded-2xl text-white font-medium
                transition-all duration-200 transform
                ${cat.color} hover:scale-105 hover:shadow-lg
                ${isSelected ? "ring-4 ring-primary ring-offset-2 scale-105" : ""}
                flex flex-col items-center justify-center gap-2
                min-h-[100px] text-center
              `}
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm leading-tight">{cat.label}</span>
              {limit && (
                <span className="absolute bottom-2 right-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                  {limit.label}
                </span>
              )}
              {isSelected && (
                <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        nextLabel="Next →"
        disabled={!value}
      />
    </div>
  );
}
