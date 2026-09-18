// src/frontend/src/pages/submit-request/steps/StepRentedDocuments.tsx
import { StepNavigation } from "../shared/StepNavigation";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";

export default function StepRentedDocuments({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const rentalAgreementUrl = formData?.rentalAgreementUrl || "";
  const landlordCnicUrl = formData?.landlordCnicUrl || "";

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: url }));
  };

  const isValid = !!rentalAgreementUrl && !!landlordCnicUrl;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Rented property documents</h2>
        <p className="text-sm text-muted-foreground">
          Upload documents that prove you are living in a rented property.
        </p>
        <div className="space-y-4">
          <DocBox
            label="Rental agreement"
            required
            hint="Clear photo of the rent agreement"
            onUpload={(url) => setDoc("rentalAgreementUrl", url)}
            value={rentalAgreementUrl}
          />
          <DocBox
            label="Landlord CNIC"
            required
            hint="Front side of landlord CNIC"
            onUpload={(url) => setDoc("landlordCnicUrl", url)}
            value={landlordCnicUrl}
          />
        </div>
      </div>

      <StepGuide
        lines={[
          "Both rental agreement and landlord CNIC are required.",
          "Photos must be clear and readable.",
          "Names should match other details in your case where possible.",
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
