// src/frontend/src/pages/submit-request/steps/StepCategory.tsx
import { StepNavigation } from "../shared/StepNavigation";

// 🔥 تمام 19 کیٹگریز — ہر ایک کا اپنا رنگ (hex colors)
const CATEGORIES = [
  { id: "Electricity Bill", label: "⚡ Electricity Bill", color: "#eab308" },
  { id: "Gas Bill", label: "🔥 Gas Bill", color: "#f97316" },
  { id: "Water Bill", label: "💧 Water Bill", color: "#3b82f6" },
  { id: "House Rent", label: "🏠 House Rent", color: "#6366f1" },
  { id: "School, College & University Fees", label: "🎓 School/College Fee", color: "#a855f7" },
  { id: "Education, Books & Admission", label: "📚 Education/Books", color: "#ec4899" },
  { id: "Medical & Treatment", label: "🏥 Medical Treatment", color: "#ef4444" },
  { id: "Medicines", label: "💊 Medicines", color: "#f43f5e" },
  { id: "Food & Groceries", label: "🍲 Food & Groceries", color: "#10b981" },
  { id: "Child Support", label: "👶 Child Support", color: "#06b6d4" },
  { id: "Widow & Elderly Support", label: "👵 Widow/Elderly", color: "#14b8a6" },
  { id: "Disability Support", label: "♿ Disability Support", color: "#0ea5e9" },
  { id: "Marriage Support", label: "💍 Marriage Support", color: "#d946ef" },
  { id: "Business / Work Help", label: "💼 Business Help", color: "#f59e0b" },
  { id: "Home Repair", label: "🔧 Home Repair", color: "#78716c" },
  { id: "Funeral Expenses", label: "🕊️ Funeral Expenses", color: "#6b7280" },
  { id: "Livestock / Farming", label: "🐄 Livestock/Farming", color: "#84cc16" },
  { id: "Debt Relief", label: "💰 Debt Relief", color: "#8b5cf6" },
  { id: "Emergency Help", label: "🚨 Emergency Help", color: "#b91c1c" },
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
  // 🔥 جب کوئی category منتخب ہو تو اسے set کریں اور اگلے step پر جائیں
  const handleSelect = (id: string) => {
    console.log("Category selected:", id);
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
    <div className="space-y-6">
      {/* Heading */}
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

      {/* 🔥 19 رنگین باکسز — inline styles کے ساتھ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const isSelected = value === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              style={{
                backgroundColor: cat.color,
                color: "#ffffff",
                borderRadius: "16px",
                padding: "16px 8px",
                minHeight: "90px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                border: isSelected ? "4px solid #000000" : "none",
                transform: isSelected ? "scale(1.05)" : "scale(1)",
                transition: "all 0.2s ease",
                boxShadow: isSelected ? "0 8px 25px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.15)",
                cursor: "pointer",
                textAlign: "center",
                fontWeight: "500",
                fontSize: "14px",
                lineHeight: "1.3",
              }}
            >
              <span style={{ fontSize: "28px" }}>{cat.label.split(" ")[0]}</span>
              <span>{cat.label}</span>
              {isSelected && (
                <span
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    background: "#000000",
                    color: "#ffffff",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 🔥 Next/Back buttons */}
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
