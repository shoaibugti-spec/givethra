// src/frontend/src/pages/submit-request/steps/StepSelfie.tsx
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";
import { DocBox } from "../shared/DocBox";

export default function StepSelfie({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const selfieUrl = formData?.selfieUrl || "";

  const setDoc = (url: string) => {
    setFormData((prev: any) => ({ ...prev, selfieUrl: url }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Live selfie</h2>
        <p className="text-sm text-muted-foreground">
          Upload a clear live selfie for identity verification.
        </p>
        <DocBox
          label="Live selfie"
          required
          hint="Face clearly visible, good lighting, no filters"
          accept="image/*"
          onUpload={setDoc}
          value={selfieUrl}
        />
      </div>

      <StepGuide
        lines={[
          "Take a recent live photo of your face.",
          "Face must be clearly visible with good lighting.",
          "No group photos, filters, or screenshots of old pictures.",
          "Selfie is required before submission.",
        ]}
      />

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!selfieUrl}
      />
    </div>
  );
}
