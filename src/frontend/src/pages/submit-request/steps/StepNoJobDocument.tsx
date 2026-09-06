// src/frontend/src/pages/submit-request/steps/StepNoJobDocument.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";
import { DocBox } from "../shared/DocBox";

export default function StepNoJobDocument({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { statementUrl } = formData;

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: url }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">📎 Upload your bank statement</h2>
        <p className="text-sm text-muted-foreground">
          Since you don't have a job, we need your bank statement for verification.
        </p>
        <DocBox
          label="Last 6 Months Bank Statement"
          required
          hint="Bank, EasyPaisa or JazzCash statement"
          accept=".pdf,image/*"
          onUpload={(url) => setDoc("statementUrl", url)}
          value={statementUrl}
        />
      </div>
      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!statementUrl}
      />
    </div>
  );
}
