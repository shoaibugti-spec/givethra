// src/frontend/src/pages/submit-request/category-forms/MedicalTreatmentForm.tsx
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BaseCategoryForm } from "./BaseCategoryForm";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";

export default function MedicalTreatmentForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const refNumber = formData.refNumber || "";

  const setField = (key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catFields: { ...(prev.catFields || {}), [key]: value },
    }));
  };

  const setTop = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catDocUrls: { ...(prev.catDocUrls || {}), [key]: url },
    }));
  };

  const isValid = useMemo(() => {
    return (
      !!catFields.patient_name?.trim() &&
      !!catFields.illness?.trim() &&
      !!catFields.hospital_name?.trim() &&
      !!catDocUrls.medical_bill
    );
  }, [catFields, catDocUrls]);

  return (
    <BaseCategoryForm
      title="Medical & Treatment"
      subtitle="ONE patient · verified treatment bill only"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Patient's name (ONE patient only) *</Label>
          <Input
            value={catFields.patient_name || ""}
            onChange={(e) => setField("patient_name", e.target.value)}
            placeholder="Full name of one patient"
          />
        </div>

        <div className="space-y-1">
          <Label>Illness / treatment needed *</Label>
          <Input
            value={catFields.illness || ""}
            onChange={(e) => setField("illness", e.target.value)}
            placeholder="Brief description of illness or treatment"
          />
        </div>

        <div className="space-y-1">
          <Label>Hospital / clinic name *</Label>
          <Input
            value={catFields.hospital_name || ""}
            onChange={(e) => setField("hospital_name", e.target.value)}
            placeholder="Hospital or clinic name"
          />
        </div>

        <div className="space-y-1">
          <Label>Bill / invoice / MR number (if any)</Label>
          <Input
            value={refNumber}
            onChange={(e) => setTop("refNumber", e.target.value)}
            placeholder="Optional reference number"
          />
        </div>

        <DocBox
          label="Hospital bill / medical receipt"
          required
          hint="Clear photo of the verified treatment bill for one patient"
          onUpload={(url) => setDoc("medical_bill", url)}
          value={catDocUrls.medical_bill}
        />
      </div>

      <StepGuide
        lines={[
          "This case is for ONE patient only — do not combine multiple patients.",
          "Upload a clear hospital bill or medical receipt that shows the amount.",
          "Patient name and illness details must match the documents.",
          "Blurry or incomplete bills can delay or reject the case.",
        ]}
      />
    </BaseCategoryForm>
  );
}
