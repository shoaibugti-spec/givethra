// src/frontend/src/pages/submit-request/steps/StepJobDocuments.tsx
import { StepNavigation } from "../shared/StepNavigation";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";

export default function StepJobDocuments({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const { salarySlipUrl, statementUrl } = formData;

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: url }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Upload your job documents</h2>
        <p className="text-sm text-muted-foreground">
          Required because you selected that you have a job (or recent employment history).
        </p>
        <div className="space-y-4">
          <DocBox
            label="Last 6 months salary slip"
            required
            hint="Clear photo or PDF of salary slips"
            onUpload={(url) => setDoc("salarySlipUrl", url)}
            value={salarySlipUrl}
          />
          <DocBox
            label="Last 6 months bank statement"
            required
            hint="Original bank statement preferred for serious cases — not only a micro-wallet screenshot"
            accept=".pdf,image/*"
            onUpload={(url) => setDoc("statementUrl", url)}
            value={statementUrl}
          />
        </div>
      </div>

      <StepGuide
        lines={[
          "Upload salary slips covering the last 6 months when available.",
          "Upload a real bank statement that shows your financial situation.",
          "Do not rely only on a micro-account or wallet screenshot for large or serious cases.",
          "If you lost your job more than a year ago, still upload the last salary slip you have plus a current statement.",
        ]}
      />

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
