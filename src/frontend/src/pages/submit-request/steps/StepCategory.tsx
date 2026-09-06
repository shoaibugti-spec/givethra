// src/frontend/src/pages/submit-request/steps/StepCategory.tsx
import { StepNavigation } from "../shared/StepNavigation";

// 🔥 تمام 19 کیٹگریز کے ساتھ ان کے آئیکن اور رنگ
const CATEGORIES_WITH_STYLES = [
  { id: "Electricity Bill", label: "⚡ Electricity Bill", color: "bg-yellow-500" },
  { id: "Gas Bill", label: "🔥 Gas Bill", color: "bg-orange-500" },
  { id: "Water Bill", label: "💧 Water Bill", color: "bg-blue-500" },
  { id: "House Rent", label: "🏠 House Rent", color: "bg-indigo-500" },
  { id: "School, College & University Fees", label: "🎓 School/College Fee", color: "bg-purple-500" },
  { id: "Education, Books & Admission", label: "📚 Education/Books", color: "bg-pink-500" },
  { id: "Medical & Treatment", label: "🏥 Medical Treatment", color: "bg-red-500" },
  { id: "Medicines", label: "💊 Medicines", color: "bg-rose-500" },
  { id: "Food & Groceries", label: "🍲 Food & Groceries", color: "bg-emerald-500" },
  { id: "Child Support", label: "👶 Child Support", color: "bg-cyan-500" },
  { id: "Widow & Elderly Support", label: "👵 Widow/Elderly", color: "bg-teal-500" },
  { id: "Disability Support", label: "♿ Disability Support", color: "bg-sky-500" },
  { id: "Marriage Support", label: "💍 Marriage Support", color: "bg-fuchsia-500" },
  { id: "Business / Work Help", label: "💼 Business Help", color: "bg-amber-500" },
  { id: "Home Repair", label: "🔧 Home Repair", color: "bg-stone-500" },
  { id: "Funeral Expenses", label: "🕊️ Funeral Expenses", color: "bg-gray-500" },
  { id: "Livestock / Farming", label: "🐄 Livestock/Farming", color: "bg-lime-500" },
  { id: "Debt Relief", label: "💰 Debt Relief", color: "bg-violet-500" },
  { id: "Emergency Help", label: "🚨 Emergency Help", color: "bg-red-700" },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  categories?: typeof CATEGORIES_WITH_STYLES;
  categoryLimits?: any;
  willBeFree?: boolean;
  isFreeDisabled?: boolean;
  freeCasesUsed?: number;
}

export default function StepCategory({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  categories = CATEGORIES_WITH_STYLES,
  willBeFree = false,
  isFreeDisabled = false,
  freeCasesUsed = 0,
}: Props) {
  const handleSelect = (id: string) => {
    onChange(id);
    // 🔥 ایک چھوٹی سی تاخیر کے بعد Next پر جائیں تاکہ صارف کو سلیکشن نظر آئے
    setTimeout(() => {
      if (id) onNext();
    }, 300);
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

      {/* 🔥 19 رنگین باکسز - گرڈ میں */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat) => {
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
                flex flex-col items-center justify-center gap-1
                min-h-[90px] text-center
              `}
            >
              <span className="text-3xl">{cat.label.split(" ")[0]}</span>
              <span className="text-sm leading-tight">{cat.label}</span>
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
