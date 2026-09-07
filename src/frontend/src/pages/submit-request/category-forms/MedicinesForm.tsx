// src/frontend/src/pages/submit-request/category-forms/MedicinesForm.tsx
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BaseCategoryForm } from "./BaseCategoryForm";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";

export default function MedicinesForm({
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
      !!catDocUrls.medicine_estimate &&
      !!catDocUrls.doctor_report
    );
  }, [catFields, catDocUrls]);

  return (
    <BaseCategoryForm
      title="Medicines"
      subtitle="ONE patient · verified prescription cost only"
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
          <Label>Illness / condition *</Label>
          <Input
            value={catFields.illness || ""}
            onChange={(e) => setField("illness", e.target.value)}
            placeholder="Brief description of condition"
          />
        </div>

        <div className="space-y-1">
          <Label>Invoice / prescription number (if any)</Label>
          <Input
            value={refNumber}
            onChange={(e) => setTop("refNumber", e.target.value)}
            placeholder="Optional reference"
          />
        </div>

        <DocBox
          label="Prescription / medicine estimate photo"
          required
          hint="Clear estimate or list of medicines with prices"
          onUpload={(url) => setDoc("medicine_estimate", url)}
          value={catDocUrls.medicine_estimate}
        />

        <DocBox
          label="Doctor's report / prescription"
          required
          hint="Clear photo of the doctor's written report or prescription"
          onUpload={(url) => setDoc("doctor_report", url)}
          value={catDocUrls.doctor_report}
        />
      </div>

      <StepGuide
        lines={[
          "This case is for ONE patient only.",
          "Upload both the medicine estimate and the doctor's prescription / report.",
          "Payment receiver (pharmacy / shop) details will be asked in the next step for this category.",
          "Documents must be clear and readable for verification.",
        ]}
      />
    </BaseCategoryForm>
  );
}
