// src/frontend/src/pages/submit-request/steps/StepJobDocuments.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";
import { DocBox } from "../shared/DocBox";

export default function StepJobDocuments({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { salarySlipUrl, statementUrl } = formData;

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: url }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">📎 Upload your job documents</h2>
        <p className="text-sm text-muted-foreground">
          Since you have a job, we need these documents for verification.
        </p>
        <div className="space-y-4">
          <DocBox
            label="Last 6 Months Salary Slip"
            required
            onUpload={(url) => setDoc("salarySlipUrl", url)}
            value={salarySlipUrl}
          />
          <DocBox
            label="Last 6 Months Bank Statement"
            required
            hint="Bank, EasyPaisa or JazzCash statement"
            accept=".pdf,image/*"
            onUpload={(url) => setDoc("statementUrl", url)}
            value={statementUrl}
          />
        </div>
      </div>
      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!salarySlipUrl || !statementUrl}
      />
    </div>
  );
}
