// src/frontend/src/pages/submit-request/steps/StepNoJobDocument.tsx
import { StepNavigation } from "../shared/StepNavigation";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";

export default function StepNoJobDocument({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const { statementUrl } = formData;

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: url }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Upload your bank statement</h2>
        <p className="text-sm text-muted-foreground">
          Required because you selected that you do not have a job.
        </p>
        <DocBox
          label="Last 6 months bank statement"
          required
          hint="Original bank statement preferred — EasyPaisa/JazzCash alone is weak for serious cases"
          accept=".pdf,image/*"
          onUpload={(url) => setDoc("statementUrl", url)}
          value={statementUrl}
        />
      </div>

      <StepGuide
        lines={[
          "Upload a clear 6-month bank statement.",
          "For serious cases, prefer an original bank statement over only a micro-wallet history.",
          "This helps verification of your financial need.",
        ]}
      />

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
