// src/frontend/src/pages/submit-request/steps/StepOwnedDocuments.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";
import { DocBox } from "../shared/DocBox";

const OWNER_RELATIONS = ["Myself", "Father", "Mother"];

export default function StepOwnedDocuments({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { ownerCnicUrl, ownerRelation } = formData;

  const setField = (key: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">📎 Owner Documents</h2>
        <p className="text-sm text-muted-foreground">
          Since you own the property, please provide these details.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>House is in whose name? *</Label>
            <div className="grid grid-cols-3 gap-2">
              {OWNER_RELATIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setField("ownerRelation", opt)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    ownerRelation === opt
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium">{opt}</div>
                </button>
              ))}
            </div>
          </div>
          <DocBox
            label={`${ownerRelation || "Owner"}'s CNIC`}
            required
            hint="CNIC of the person whose name the house/utility bill is registered under"
            onUpload={(url) => setField("ownerCnicUrl", url)}
            value={ownerCnicUrl}
          />
        </div>
      </div>
      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!ownerRelation || !ownerCnicUrl}
      />
    </div>
  );
}
