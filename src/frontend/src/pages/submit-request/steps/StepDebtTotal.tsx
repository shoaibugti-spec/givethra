// src/frontend/src/pages/submit-request/steps/StepDebtTotal.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepNavigation } from "../shared/StepNavigation";
import { CASE_CURRENCIES, CURRENCY_SYMBOLS } from "../constants";
import { calculateDebtAmount } from "../utils/debtCalculator";
import { useState, useEffect } from "react";

export default function StepDebtTotal({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { debtTotalAmount, currency } = formData;
  const [calculated, setCalculated] = useState(0);

  useEffect(() => {
    const val = parseFloat(debtTotalAmount);
    if (!isNaN(val) && val > 0) {
      setCalculated(calculateDebtAmount(val));
    } else {
      setCalculated(0);
    }
  }, [debtTotalAmount]);

  const sym = CURRENCY_SYMBOLS[currency] || currency;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">💰 Total Outstanding Debt</h2>
        <p className="text-sm text-muted-foreground">
          Enter your total debt amount. Givethra will calculate 5% of it (max Rs 25,000).
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Total Outstanding Debt *</Label>
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
                  value={debtTotalAmount}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, debtTotalAmount: e.target.value }))}
                  placeholder="e.g. 500000"
                  className="pl-12 text-lg py-6"
                  autoFocus
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">💡 Enter your total debt (e.g. 500,000 for 5 lakh)</p>
          </div>

          {debtTotalAmount && parseFloat(debtTotalAmount) > 0 && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">5% Assistance Amount:</span>
                <span className="text-xl font-bold text-primary">
                  {sym} {calculated.toLocaleString()}
                  {calculated >= 25000 && (
                    <span className="text-xs text-amber-600 ml-2">(Max limit reached)</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!debtTotalAmount || parseFloat(debtTotalAmount) <= 0}
      />
    </div>
  );
}
