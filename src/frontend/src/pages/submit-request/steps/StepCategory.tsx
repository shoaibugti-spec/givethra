// src/frontend/src/pages/submit-request/steps/StepCategory.tsx
// 🔥 FIXED: No blinking, stable selection, smooth UX

import { StepNavigation } from "../shared/StepNavigation";
import { useState, useCallback, useRef } from "react";

const ALL_CATEGORIES = [
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
  // 🔥 Local state to prevent flickering
  const [selected, setSelected] = useState(value);
  const isProcessing = useRef(false);

  const handleSelect = useCallback(
    (id: string) => {
      // Prevent double clicks / rapid fire
      if (isProcessing.current) return;
      if (id === selected) return;

      isProcessing.current = true;

      // Update local state immediately (smooth UI)
      setSelected(id);
      // Notify parent
      onChange(id);

      // After a short delay, allow navigation and reset flag
      setTimeout(() => {
        isProcessing.current = false;
        // Auto-advance after selection (if needed)
        if (id) {
          onNext();
        }
      }, 300);
    },
    [selected, onChange, onNext]
  );

  // Sync with parent value if it changes externally
  // (but we keep local state to avoid blinking)
  // We don't need to sync because we control it.

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
        {ALL_CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id;
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
                border: isSelected ? "4px solid #000" : "none",
                transform: isSelected ? "scale(1.05)" : "scale(1)",
                transition: "all 0.2s ease",
                boxShadow: isSelected ? "0 8px 25px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.15)",
                cursor: "pointer",
                textAlign: "center",
                fontWeight: "500",
                fontSize: "14px",
                lineHeight: "1.3",
                position: "relative",
              }}
            >
              <span style={{ fontSize: "28px", display: "block" }}>{cat.label.split(" ")[0]}</span>
              <span style={{ display: "block" }}>{cat.label}</span>
              {isSelected && (
                <span
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    background: "#000",
                    color: "#fff",
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

      <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center" }}>
        {!isFirst && (
          <button
            onClick={onBack}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "transparent",
              cursor: "pointer",
              flex: 1,
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!selected}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            border: "none",
            background: selected ? "#00A896" : "#ccc",
            color: "#fff",
            cursor: selected ? "pointer" : "not-allowed",
            flex: 1,
            opacity: selected ? 1 : 0.6,
            transition: "background 0.2s ease",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
