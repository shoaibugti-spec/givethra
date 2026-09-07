// src/frontend/src/pages/submit-request/steps/StepCurrency.tsx
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";
import { CASE_CURRENCIES } from "../constants";

export default function StepCurrency({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Select currency</h2>
        <p className="text-sm text-muted-foreground">
          Choose the currency for the amount you requested.
        </p>
        <Label>Currency *</Label>
        <Select value={value || "PKR"} onValueChange={onChange}>
          <SelectTrigger className="text-base py-6">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {(CASE_CURRENCIES || ["PKR"]).map((c: string) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <StepGuide
        lines={[
          "Most cases in Pakistan should use PKR.",
          "Select another currency only if your need is truly in that currency.",
          "Currency should match your bills and payment details.",
        ]}
      />

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!value}
      />
    </div>
  );
}
