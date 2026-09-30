// src/frontend/src/pages/submit-request/steps/StepJobDocuments.tsx
import { StepNavigation } from "../shared/StepNavigation";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";
import { getEmploymentOption } from "../employment";

export default function StepJobDocuments({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const option = getEmploymentOption(formData.jobStatus);
  const documents = option?.documents || [];

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: url }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Upload your employment documents</h2>
        <p className="text-sm text-muted-foreground">
          Required documents for {option?.label || "your selected employment status"}.
        </p>
        <div className="space-y-4">
          {documents.map((document) => (
            <DocBox
              key={document.key}
              label={document.label}
              required={document.required}
              hint={document.hint}
              accept=".pdf,image/*"
              onUpload={(url) => setDoc(document.key, url)}
              value={formData[document.key]}
            />
          ))}
        </div>
      </div>

      <StepGuide
        lines={[
          "Attach clear photos or PDFs; required documents must be uploaded before continuing.",
          "Bank, EasyPaisa, and JazzCash statements are accepted where specified.",
        ]}
      />

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={documents.some((document) => document.required && !formData[document.key])}
      />
    </div>
  );
}
