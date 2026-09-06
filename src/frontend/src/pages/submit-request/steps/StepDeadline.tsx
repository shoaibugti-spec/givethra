// src/frontend/src/pages/submit-request/steps/StepDeadline.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";
import { isEasyCat } from "../constants";

export default function StepDeadline({ value, formData, onChange, onNext, onBack, isFirst, isLast }: any) {
  const { category } = formData;
  const isEasy = isEasyCat(category);
  const label = isEasy ? "Bill / Challan Due Date (Expiry) *" : "Expected Resolution Date *";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{isEasy ? "📅 Bill Expiry Date" : "📅 When do you need this resolved?"}</h2>
        <p className="text-sm text-muted-foreground">
          {isEasy
            ? "Select the due date on your bill. If this passes, the case will expire."
            : "Select a date by which you need this help."}
        </p>
        <Label>{label}</Label>
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="py-6 text-lg"
          min={new Date().toISOString().split("T")[0]}
        />
        {isEasy && value && (
          <p className="text-xs text-amber-600">
            ⚠️ If the due date passes and the case is not completed, the case will EXPIRE.
          </p>
        )}
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
