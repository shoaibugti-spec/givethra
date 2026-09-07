// src/frontend/src/pages/submit-request/steps/StepAmount.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";
import { getMaxLimit, getCategoryLimit } from "../constants";

export default function StepAmount({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  formData,
}: any) {
  const category = formData?.category || "";
  const maxLimit = getMaxLimit(category);
  const limitInfo = getCategoryLimit(category);
  const amountNum = parseFloat(value) || 0;
  const overMax = maxLimit != null && amountNum > maxLimit;
  const isValid = amountNum > 0 && !overMax;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">How much help do you need?</h2>
        <p className="text-sm text-muted-foreground">
          Enter the amount required for this case.
          {limitInfo?.label ? ` Policy: ${limitInfo.label}.` : ""}
        </p>
        <Label>Amount needed *</Label>
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter amount"
          className="text-lg py-6"
          autoFocus
        />
        {overMax && (
          <p className="text-sm text-red-600">
            Amount cannot exceed Rs {maxLimit?.toLocaleString()}.
          </p>
        )}
      </div>

      <StepGuide
        lines={[
          limitInfo?.label
            ? `Category policy: ${limitInfo.label}.`
            : "Enter only the amount required for this verified need.",
          maxLimit
            ? `Maximum allowed for this category is Rs ${maxLimit.toLocaleString()}.`
            : "Amount should match your documents and bill/estimate.",
          "Do not inflate the amount — mismatched amounts are rejected.",
          "Fixed-stipend categories are handled automatically and may skip this step.",
        ]}
      />

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!isValid}
      />
    </div>
  );
}
