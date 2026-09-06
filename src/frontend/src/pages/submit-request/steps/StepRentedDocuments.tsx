// src/frontend/src/pages/submit-request/steps/StepRentedDocuments.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";
import { DocBox } from "../shared/DocBox";

export default function StepRentedDocuments({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { rentalAgreementUrl, landlordCnicUrl } = formData;

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: url }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">📎 Tenant Documents</h2>
        <p className="text-sm text-muted-foreground">
          Since you rent, please upload these documents for verification.
        </p>
        <div className="space-y-4">
          <DocBox
            label="Rental Agreement / Contract"
            required
            hint="Clear photo of your rental agreement or lease document"
            onUpload={(url) => setDoc("rentalAgreementUrl", url)}
            value={rentalAgreementUrl}
          />
          <DocBox
            label="Landlord's CNIC"
            required
            hint="CNIC of the landlord or any document proving property ownership"
            onUpload={(url) => setDoc("landlordCnicUrl", url)}
            value={landlordCnicUrl}
          />
        </div>
      </div>
      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!rentalAgreementUrl || !landlordCnicUrl}
      />
    </div>
  );
}
