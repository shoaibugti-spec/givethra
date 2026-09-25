// src/frontend/src/pages/submit-request/steps/StepAmount.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";
import { getMaxLimit, getMinAmount, getCategoryLimit, getFixedAmount } from "../constants";

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
  const minAmount = getMinAmount(category);
  const limitInfo = getCategoryLimit(category);
  const fixedAmount = getFixedAmount(category);
  const isFixed = fixedAmount != null;
  const amountNum = parseFloat(value) || 0;
  const overMax = maxLimit != null && amountNum > maxLimit;
  const underMin = minAmount != null && amountNum > 0 && amountNum < minAmount;
  const isValid = isFixed ? fixedAmount > 0 : amountNum > 0 && !overMax && !underMin;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">How much help do you need?</h2>
        <p className="text-sm text-muted-foreground">
          {isFixed ? "This category has a fixed assistance amount." : "Enter the amount required for this case."}
          {limitInfo?.label ? ` Policy: ${limitInfo.label}.` : ""}
        </p>
        <Label>{isFixed ? "Amount (Fixed)" : "Amount needed *"}</Label>
        <Input
          type="number"
          value={isFixed ? fixedAmount : value || ""}
          onChange={isFixed ? undefined : (e) => onChange(e.target.value)}
          min={minAmount ?? undefined}
          max={maxLimit ?? undefined}
          readOnly={isFixed}
          aria-readonly={isFixed}
          placeholder={isFixed ? undefined : "Enter amount"}
          className="text-lg py-6"
          autoFocus={!isFixed}
        />
        {isFixed && <p className="text-sm font-semibold text-green-700">Fixed amount: Rs {fixedAmount.toLocaleString()}. You cannot change this amount.</p>}
        {overMax && (
          <p className="text-sm text-red-600">
            Amount cannot exceed Rs {maxLimit?.toLocaleString()}.
          </p>
        )}
        {underMin && (
          <p className="text-sm text-red-600">
            Amount must be at least Rs {minAmount?.toLocaleString()}.
          </p>
        )}
      </div>

      <StepGuide
        lines={[
          isFixed
            ? `Fixed policy: Rs ${fixedAmount.toLocaleString()}.`
            : limitInfo?.label
            ? `Category policy: ${limitInfo.label}.`
            : "Enter only the amount required for this verified need.",
          maxLimit
            ? `Maximum allowed for this category is Rs ${maxLimit.toLocaleString()}.`
            : "Amount should match your documents and bill/estimate.",
          minAmount ? `Minimum allowed for this category is Rs ${minAmount.toLocaleString()}.` : "",
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
