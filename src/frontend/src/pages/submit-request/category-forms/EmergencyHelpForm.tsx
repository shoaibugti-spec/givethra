// src/frontend/src/pages/submit-request/category-forms/EmergencyHelpForm.tsx
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const EMERGENCY_TYPES = [
  "Accident",
  "Sudden illness",
  "Natural disaster",
  "Displacement",
  "Other urgent need",
];

export default function EmergencyHelpForm({
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
      !!catFields.emergency_type &&
      !!catFields.emergency_description?.trim() &&
      !!catDocUrls.emergency_proof
    );
  }, [catFields, catDocUrls]);

  return (
    <BaseCategoryForm
      title="Emergency Help"
      subtitle="Verified urgent need only"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Emergency type *</Label>
          <Select
            value={catFields.emergency_type || ""}
            onValueChange={(v) => setField("emergency_type", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select emergency type" />
            </SelectTrigger>
            <SelectContent>
              {EMERGENCY_TYPES.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Describe the emergency *</Label>
          <Textarea
            value={catFields.emergency_description || ""}
            onChange={(e) => setField("emergency_description", e.target.value)}
            placeholder="What happened, when, and what help is needed now"
            rows={4}
          />
        </div>

        <DocBox
          label="Emergency proof"
          required
          hint="Photo, report, or document proving the emergency"
          onUpload={(url) => setDoc("emergency_proof", url)}
          value={catDocUrls.emergency_proof}
        />
      </div>

      <StepGuide
        lines={[
          "Explain the emergency clearly and honestly.",
          "Upload proof that shows the urgent situation.",
          "Recipient payment details come in the payment receiver step.",
          "False claims are rejected and may affect your account.",
        ]}
      />
    </BaseCategoryForm>
  );
}
