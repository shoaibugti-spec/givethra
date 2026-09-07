// src/frontend/src/pages/submit-request/steps/StepCategory.tsx
import { StepNavigation } from "../shared/StepNavigation";

// 🔥 تمام 19 کیٹگریز — ہر ایک کا اپنا رنگ (Tailwind کلاسز کے لیے)
const ALL_CATEGORIES = [
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
  willBeFree = false,
  isFreeDisabled = false,
  freeCasesUsed = 0,
}: Props) {
  const handleSelect = (id: string) => {
    console.log("Category selected:", id); // 🔍 ڈیبگ کے لیے
    onChange(id);
    // تھوڑی تاخیر کے بعد Next پر جائیں
    setTimeout(() => {
      if (id) {
        console.log("Moving to next step...");
        onNext();
      }
    }, 400);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Heading */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">What do you need help with?</h2>
        <p className="text-muted-foreground text-sm">
          Choose the category that best describes your need.
        </p>
        {willBeFree && !isFreeDisabled && (
          <div className="inline-block mt-2 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            🎉 {freeCasesUsed === 0 ? "Your first case is FREE!" : "This case is FREE!"}
          </div>
        )}
        {isFreeDisabled && (
          <div className="inline-block mt-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
            ⚠️ Free cases used up. 1 credit fee applies.
          </div>
        )}
      </div>

      {/* 🔥 Grid of category boxes — Tailwind classes for colors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ALL_CATEGORIES.map((cat) => {
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
                <span className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-3 justify-center">
        {!isFirst && (
          <button
            onClick={onBack}
            className="flex-1 py-2.5 px-6 rounded-lg border border-border bg-transparent hover:bg-muted transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!value}
          className={`
            flex-1 py-2.5 px-6 rounded-lg font-medium
            ${value ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"}
          `}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
