// src/frontend/src/pages/submit-request/steps/StepOwnedDocuments.tsx
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepNavigation } from "../shared/StepNavigation";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";

const RELATIONS = ["Myself", "Father", "Mother", "Spouse", "Other family"];

export default function StepOwnedDocuments({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const ownerCnicUrl = formData?.ownerCnicUrl || "";
  const ownerRelation = formData?.ownerRelation || "";

  const setDoc = (url: string) => {
    setFormData((prev: any) => ({ ...prev, ownerCnicUrl: url }));
  };

  const setRelation = (value: string) => {
    setFormData((prev: any) => ({ ...prev, ownerRelation: value }));
  };

  const isValid = !!ownerCnicUrl && !!ownerRelation;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Owned property documents</h2>
        <p className="text-sm text-muted-foreground">
          Upload owner CNIC and select your relation to the owner.
        </p>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Relation to owner *</Label>
            <Select value={ownerRelation} onValueChange={setRelation}>
              <SelectTrigger>
                <SelectValue placeholder="Select relation" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DocBox
            label="Owner CNIC"
            required
            hint="Clear front side of property owner CNIC"
            onUpload={setDoc}
            value={ownerCnicUrl}
          />
        </div>
      </div>

      <StepGuide
        lines={[
          "Select how you are related to the property owner.",
          "Upload a clear owner CNIC photo.",
          "If you are the owner, choose Myself and upload your own CNIC.",
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
