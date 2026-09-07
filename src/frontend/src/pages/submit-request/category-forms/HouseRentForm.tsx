// src/frontend/src/pages/submit-request/category-forms/HouseRentForm.tsx
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BaseCategoryForm } from "./BaseCategoryForm";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";

export default function HouseRentForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};

  const setField = (key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catFields: { ...(prev.catFields || {}), [key]: value },
    }));
  };

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catDocUrls: { ...(prev.catDocUrls || {}), [key]: url },
    }));
  };

  const isValid = useMemo(() => {
    return (
      !!catFields.landlord_name?.trim() &&
      !!catFields.landlord_contact?.trim() &&
      !!catFields.rent_amount &&
      !!catDocUrls.rental_agreement &&
      !!catDocUrls.landlord_cnic
    );
  }, [catFields, catDocUrls]);

  return (
    <BaseCategoryForm
      title="House Rent"
      subtitle="One month verified rent only"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Landlord name *</Label>
          <Input
            value={catFields.landlord_name || ""}
            onChange={(e) => setField("landlord_name", e.target.value)}
            placeholder="Full name of landlord"
          />
        </div>

        <div className="space-y-1">
          <Label>Landlord contact *</Label>
          <Input
            value={catFields.landlord_contact || ""}
            onChange={(e) => setField("landlord_contact", e.target.value)}
            placeholder="Landlord phone number"
          />
        </div>

        <div className="space-y-1">
          <Label>Monthly rent amount (ONE month) *</Label>
          <Input
            type="number"
            value={catFields.rent_amount || ""}
            onChange={(e) => setField("rent_amount", e.target.value)}
            placeholder="Amount for one month only"
          />
        </div>

        <DocBox
          label="Rental agreement"
          required
          hint="Clear photo of the rent agreement"
          onUpload={(url) => setDoc("rental_agreement", url)}
          value={catDocUrls.rental_agreement}
        />

        <DocBox
          label="Landlord CNIC"
          required
          hint="Front side of landlord CNIC"
          onUpload={(url) => setDoc("landlord_cnic", url)}
          value={catDocUrls.landlord_cnic}
        />
      </div>

      <StepGuide
        lines={[
          "Request help for ONE month rent only — not multiple months or arrears.",
          "Landlord name and contact must be real and reachable for verification.",
          "Upload a clear rental agreement and landlord CNIC.",
          "Payment receiver details (landlord bank) will be asked in the next step for this category.",
        ]}
      />
    </BaseCategoryForm>
  );
}
