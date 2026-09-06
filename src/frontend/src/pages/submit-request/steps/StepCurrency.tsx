// src/frontend/src/pages/submit-request/steps/StepCurrency.tsx
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepNavigation } from "../shared/StepNavigation";
import { CASE_CURRENCIES } from "../constants";

export default function StepCurrency({ value, onChange, onNext, onBack, isFirst, isLast }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">💰 Select your currency</h2>
        <p className="text-sm text-muted-foreground">Choose the currency for your case.</p>
        <Label>Currency *</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="py-6 text-lg">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CASE_CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
