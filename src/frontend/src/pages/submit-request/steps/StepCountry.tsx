// src/frontend/src/pages/submit-request/steps/StepCountry.tsx
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
import { COUNTRIES } from "@/lib/countries";

export default function StepCountry({
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
        <h2 className="text-2xl font-bold">Which country are you in?</h2>
        <p className="text-sm text-muted-foreground">
          Select the country where you currently live.
        </p>
        <Label>Country *</Label>
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className="text-base py-6">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {(COUNTRIES || []).map((c: any) => {
              const name = typeof c === "string" ? c : c.name || c.label;
              return (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <StepGuide
        lines={[
          "Select the country of your current residence.",
          "This helps matching and verification for your case.",
          "Choose carefully — it should match your documents.",
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
