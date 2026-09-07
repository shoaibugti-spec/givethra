// src/frontend/src/pages/submit-request/category-forms/DisabilitySupportForm.tsx
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseCategoryForm } from "./BaseCategoryForm";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";
import { CHOICE_FIELDS } from "../constants";

const MODE_OPTIONS = [
  { value: "stipend", label: "Monthly stipend (Rs 6,000)" },
  { value: "treatment", label: "Treatment / aid support" },
];

export default function DisabilitySupportForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const catDocUrls = formData.catDocUrls || {};
  const disabilityType = formData.disabilityType || "";
  const disabilityMode = formData.disabilityMode || "";
  const typeOptions = CHOICE_FIELDS.disability_type || [];

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
      !!disabilityType &&
      !!disabilityMode &&
      !!catDocUrls.disability_cnic &&
      !!catDocUrls.disability_photo
    );
  }, [disabilityType, disabilityMode, catDocUrls]);

  return (
    <BaseCategoryForm
      title="Disability Support"
      subtitle="Fixed stipend Rs 6,000 or verified treatment need"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Disability type *</Label>
          <Select value={disabilityType} onValueChange={(v) => setTop("disabilityType", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((opt: string) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Type of help needed *</Label>
          <Select value={disabilityMode} onValueChange={(v) => setTop("disabilityMode", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select help type" />
            </SelectTrigger>
            <SelectContent>
              {MODE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DocBox
          label="Disability CNIC / certificate"
          required
          hint="Front and back if possible"
          onUpload={(url) => setDoc("disability_cnic", url)}
          value={catDocUrls.disability_cnic}
        />

        <DocBox
          label="Clear photo of the disability"
          required
          hint="Respectful, clear photo for verification"
          onUpload={(url) => setDoc("disability_photo", url)}
          value={catDocUrls.disability_photo}
        />
      </div>

      <StepGuide
        lines={[
          "Stipend mode is a fixed Rs 6,000 support.",
          "Treatment mode requires verified medical need documents.",
          "Upload clear disability CNIC/certificate and photo.",
          "Incorrect or unclear documents can cause rejection.",
        ]}
      />
    </BaseCategoryForm>
  );
}
