// src/frontend/src/pages/submit-request/steps/StepCountry.tsx
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepNavigation } from "../shared/StepNavigation";
import { COUNTRIES } from "@/lib/countries";

export default function StepCountry({ value, onChange, onNext, onBack, isFirst, isLast }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Where are you located?</h2>
        <p className="text-sm text-muted-foreground">Select the country where you need help.</p>
        <Label>Country *</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="py-6 text-lg">
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
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
