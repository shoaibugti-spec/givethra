// src/frontend/src/pages/submit-request/steps/StepAmount.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepNavigation } from "../shared/StepNavigation";
import { CASE_CURRENCIES, CURRENCY_SYMBOLS, getMaxLimit } from "../constants";

export default function StepAmount({ value, formData, onChange, onNext, onBack, isFirst, isLast }: any) {
  const { currency, category } = formData;
  const sym = CURRENCY_SYMBOLS[currency] || currency;
  const maxLimit = getMaxLimit(category);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">💰 How much do you need?</h2>
        <p className="text-sm text-muted-foreground">Enter the verified amount you need for this case.</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Amount Needed *</Label>
            <div className="flex gap-2">
              <div className="w-28">
                <Select value={currency} onValueChange={(v) => setFormData((prev: any) => ({ ...prev, currency: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  {sym}
                </span>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="e.g. 31000"
                  className="pl-12 text-lg py-6"
                  autoFocus
                />
              </div>
            </div>
            {maxLimit && (
              <p className="text-xs text-amber-600">⚠️ Maximum allowed: Rs {maxLimit.toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>
      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!value || parseFloat(value) <= 0}
      />
    </div>
  );
}
