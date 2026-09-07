// src/frontend/src/pages/submit-request/steps/StepDebtTotal.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";
import { calculateDebtAmount } from "../constants";

export default function StepDebtTotal({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  formData,
  setFormData,
}: any) {
  const total = parseFloat(value || formData?.debtTotalAmount || "") || 0;
  const helpAmount = total > 0 ? calculateDebtAmount(total) : 0;
  const isValid = total > 0;

  const handleChange = (raw: string) => {
    if (setFormData) {
      setFormData((prev: any) => ({
        ...prev,
        debtTotalAmount: raw,
        amount: calculateDebtAmount(parseFloat(raw) || 0).toString(),
      }));
    }
    onChange?.(raw);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">What is your total debt?</h2>
        <p className="text-sm text-muted-foreground">
          Enter the full outstanding debt. Help is calculated as 5% (max Rs 25,000).
        </p>
        <Label>Total debt amount *</Label>
        <Input
          type="number"
          value={value || formData?.debtTotalAmount || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Full debt amount"
          className="text-lg py-6"
          autoFocus
        />
        {total > 0 && (
          <p className="text-sm text-green-700 dark:text-green-400">
            Estimated help amount: Rs {helpAmount.toLocaleString()}
          </p>
        )}
      </div>

      <StepGuide
        lines={[
          "Enter the full outstanding debt, not the help amount.",
          "Help = 5% of total debt, capped at Rs 25,000.",
          "Total debt must match your debt proof document.",
          "Creditor payment details are collected in the payment receiver step.",
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
