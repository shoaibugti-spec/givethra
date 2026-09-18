// src/frontend/src/pages/submit-request/steps/StepCategory.tsx
// ✅ FIXED: Zero blinking — no DOM thrashing, stable styles, memoized buttons

import React, { memo, useCallback, useRef } from "react";

const ALL_CATEGORIES = [
  { id: "Electricity Bill", label: "Electricity", emoji: "⚡", color: "#eab308" },
  { id: "Gas Bill", label: "Gas", emoji: "🔥", color: "#f97316" },
  { id: "Water Bill", label: "Water", emoji: "💧", color: "#3b82f6" },
  { id: "House Rent", label: "House Rent", emoji: "🏠", color: "#6366f1" },
  { id: "School, College & University Fees", label: "School/College Fee", emoji: "🎓", color: "#a855f7" },
  { id: "Education, Books & Admission", label: "Education/Books", emoji: "📚", color: "#ec4899" },
  { id: "Medical & Treatment", label: "Medical Treatment", emoji: "🏥", color: "#ef4444" },
  { id: "Medicines", label: "Medicines", emoji: "💊", color: "#f43f5e" },
  { id: "Food & Groceries", label: "Food & Groceries", emoji: "🍲", color: "#10b981" },
  { id: "Child Support", label: "Child Support", emoji: "👶", color: "#06b6d4" },
  { id: "Widow & Elderly Support", label: "Widow/Elderly", emoji: "👵", color: "#14b8a6" },
  { id: "Disability Support", label: "Disability Support", emoji: "♿", color: "#0ea5e9" },
  { id: "Marriage Support", label: "Marriage Support", emoji: "💍", color: "#d946ef" },
  { id: "Business / Work Help", label: "Business Help", emoji: "💼", color: "#f59e0b" },
  { id: "Home Repair", label: "Home Repair", emoji: "🔧", color: "#78716c" },
  { id: "Funeral Expenses", label: "Funeral Expenses", emoji: "🕊️", color: "#6b7280" },
  { id: "Livestock / Farming", label: "Livestock/Farming", emoji: "🐄", color: "#84cc16" },
  { id: "Debt Relief", label: "Debt Relief", emoji: "💰", color: "#8b5cf6" },
  { id: "Emergency Help", label: "Emergency Help", emoji: "🚨", color: "#b91c1c" },
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

const CategoryButton = memo(function CategoryButton({
  cat,
  isSelected,
  onSelect,
}: {
  cat: (typeof ALL_CATEGORIES)[0];
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const handleClick = useCallback(() => {
    onSelect(cat.id);
  }, [cat.id, onSelect]);

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
        gap: "8px", // آئیکون اور نام کے درمیان فاصلہ
        border: "none",
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
        boxShadow: isSelected
          ? "inset 0 0 0 4px #000000, 0 6px 20px rgba(0,0,0,0.35)"
          : "inset 0 0 0 0px transparent, 0 2px 8px rgba(0,0,0,0.12)",
      }}
    >
      {/* ✅ اوپر صرف آئیکون */}
      <span style={{ fontSize: "28px", lineHeight: 1, display: "block" }}>
        {cat.emoji}
      </span>
      
      {/* ✅ نیچے صرف نام */}
      <span style={{ display: "block", fontSize: "14px", fontWeight: "600" }}>
        {cat.label}
      </span>

      {/* ✅ Selected state checkmark (صرف opacity بدلتی ہے، بلنک نہیں ہوتا) */}
      <span
        aria-hidden={!isSelected}
        style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          background: "#ffffff",
          color: "#000000",
          borderRadius: "50%",
          width: "22px",
          height: "22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: "bold",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          pointerEvents: "none",
          opacity: isSelected ? 1 : 0,
          transform: isSelected ? "scale(1)" : "scale(0.8)",
          transition: "opacity 0.12s ease, transform 0.12s ease",
        }}
      >
        ✓
      </span>
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
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleSelect = useCallback(
    (id: string) => {
      if (id === valueRef.current) return;
      valueRef.current = id;
      onChange(id);
    },
    [onChange]
  );

  const handleNext = useCallback(() => {
    if (valueRef.current) onNext();
  }, [onNext]);

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
          <div
            style={{
              display: "inline-block",
              marginTop: "8px",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "#d1fae5",
              color: "#065f46",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            🎉 {freeCasesUsed === 0 ? "Your first case is FREE!" : "This case is FREE!"}
          </div>
        )}

        {isFreeDisabled && (
          <div
            style={{
              display: "inline-block",
              marginTop: "8px",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "#fef3c7",
              color: "#92400e",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ⚠️ Free cases used up. 1 credit fee applies.
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
      >
        {ALL_CATEGORIES.map((cat) => (
          <CategoryButton
            key={cat.id}
            cat={cat}
            isSelected={value === cat.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: "24px",
          display: "flex",
          gap: "12px",
          justifyContent: "center",
        }}
      >
        {!isFirst && (
          <button
            type="button"
            onClick={onBack}
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
          type="button"
          onClick={handleNext}
          disabled={!value}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            border: "none",
            background: value ? "#00A896" : "#ccc",
            color: "#fff",
            cursor: value ? "pointer" : "not-allowed",
            flex: 1,
            opacity: value ? 1 : 0.6,
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
