// src/frontend/src/pages/submit-request/category-forms/BusinessWorkHelpForm.tsx
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BaseCategoryForm } from "./BaseCategoryForm";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";

export default function BusinessWorkHelpForm({
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
      !!catFields.business_name?.trim() &&
      !!catFields.business_amount &&
      !!catDocUrls.business_quotation &&
      !!catDocUrls.business_proof
    );
  }, [catFields, catDocUrls]);

  return (
    <BaseCategoryForm
      title="Business / Work Help"
      subtitle="Max Rs 20,000 · verified business need"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Business / work name *</Label>
          <Input
            value={catFields.business_name || ""}
            onChange={(e) => setField("business_name", e.target.value)}
            placeholder="Name of business or work activity"
          />
        </div>

        <div className="space-y-1">
          <Label>Amount needed *</Label>
          <Input
            type="number"
            value={catFields.business_amount || ""}
            onChange={(e) => setField("business_amount", e.target.value)}
            placeholder="Typical range Rs 8,000–20,000"
          />
        </div>

        <DocBox
          label="Business quotation / cost list"
          required
          hint="Clear list of items or costs needed"
          onUpload={(url) => setDoc("business_quotation", url)}
          value={catDocUrls.business_quotation}
        />

        <DocBox
          label="Business proof"
          required
          hint="Photo or document proving the business / work"
          onUpload={(url) => setDoc("business_proof", url)}
          value={catDocUrls.business_proof}
        />
      </div>

      <StepGuide
        lines={[
          "Maximum amount for this category is Rs 20,000.",
          "Upload a clear quotation and proof of business activity.",
          "Supplier payment details will be collected in the payment receiver step.",
          "Vague or incomplete documents can cause rejection.",
        ]}
      />
    </BaseCategoryForm>
  );
}
