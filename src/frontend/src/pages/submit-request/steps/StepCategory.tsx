// src/frontend/src/pages/submit-request/steps/StepCategory.tsx
// ✅ FIXED: No blinking, no layout shift, memoized buttons

import React, { memo, useCallback } from "react";

const ALL_CATEGORIES = [
  { id: "Electricity Bill", label: "⚡ Electricity", color: "#eab308" },
  { id: "Gas Bill", label: "🔥 Gas", color: "#f97316" },
  { id: "Water Bill", label: "💧 Water", color: "#3b82f6" },
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

// ✅ Har button alag memo component — sirf selected wala re-render hoga
interface CatButtonProps {
  cat: (typeof ALL_CATEGORIES)[0];
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const CategoryButton = memo(function CategoryButton({
  cat,
  isSelected,
  onSelect,
}: CatButtonProps) {
  // ✅ Stable callback — har render pe naya function nahi banega
  const handleClick = useCallback(() => {
    onSelect(cat.id);
  }, [cat.id, onSelect]);

  const emoji = cat.label.split(" ")[0];

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSelected}
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
        border: "none",
        // ✅ OUTLINE se layout shift nahi hota — border se hota hai
        outline: isSelected ? "4px solid #000" : "3px solid transparent",
        outlineOffset: isSelected ? "2px" : "0",
        transform: isSelected ? "scale(1.03)" : "scale(1)",
        // ✅ SIRF transform aur box-shadow pe transition — "all" nahi!
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        boxShadow: isSelected
          ? "0 8px 25px rgba(0,0,0,0.35)"
          : "0 2px 8px rgba(0,0,0,0.12)",
        cursor: "pointer",
        textAlign: "center",
        fontWeight: "600",
        fontSize: "14px",
        lineHeight: "1.3",
        position: "relative",
        boxSizing: "border-box",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        touchAction: "manipulation",
      }}
    >
      <span style={{ fontSize: "28px", display: "block", lineHeight: 1, marginBottom: "2px" }}>
        {emoji}
      </span>
      <span style={{ display: "block", padding: "0 4px" }}>{cat.label}</span>

      {isSelected && (
        <span
          style={{
            position: "absolute",
            top: "-6px",
            right: "-6px",
            background: "#000",
            color: "#fff",
            borderRadius: "50%",
            width: "26px",
            height: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "bold",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            pointerEvents: "none",
          }}
        >
          ✓
        </span>
      )}
    </button>
  );
});

const StepCategory = memo(function StepCategory({
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
  const handleSelect = useCallback(
    (id: string) => {
      if (id === value) return;
      onChange(id);
    },
    [value, onChange]
  );

  const handleNext = useCallback(() => {
    if (value) onNext();
  }, [value, onNext]);

  return (
    <div style={{ padding: "16px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
          What do you need help with?
        </h2>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Choose the category that best describes your need.
        </p>
        {willBeFree && !isFreeDisabled && (
          <div style={{ display: "inline-block", marginTop: "8px", padding: "6px 16px", borderRadius: "20px", background: "#d1fae5", color: "#065f46", fontSize: "14px", fontWeight: "500" }}>
            🎉 {freeCasesUsed === 0 ? "Your first case is FREE!" : "This case is FREE!"}
          </div>
        )}
        {isFreeDisabled && (
          <div style={{ display: "inline-block", marginTop: "8px", padding: "6px 16px", borderRadius: "20px", background: "#fef3c7", color: "#92400e", fontSize: "14px", fontWeight: "500" }}>
            ⚠️ Free cases used up. 1 credit fee applies.
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        {ALL_CATEGORIES.map((cat) => (
          <CategoryButton
            key={cat.id}
            cat={cat}
            isSelected={value === cat.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center" }}>
        {!isFirst && (
          <button
            onClick={onBack}
            type="button"
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "transparent",
              cursor: "pointer",
              flex: 1,
              fontSize: "16px",
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!value}
          type="button"
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            border: "none",
            background: value ? "#00A896" : "#ccc",
            color: "#fff",
            cursor: value ? "pointer" : "not-allowed",
            flex: 1,
            opacity: value ? 1 : 0.6,
            transition: "background 0.2s ease, opacity 0.2s ease",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
});

export default StepCategory;
