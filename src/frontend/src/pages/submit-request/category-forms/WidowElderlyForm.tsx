// src/frontend/src/pages/submit-request/category-forms/WidowElderlyForm.tsx
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

const STATUS_OPTIONS = ["Widow", "Elderly"];

export default function WidowElderlyForm({
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

  const isWidow = catFields.status === "Widow";

  const isValid = useMemo(() => {
    if (!catFields.status) return false;
    if (!catFields.full_name?.trim()) return false;
    if (!catFields.age) return false;
    if (!catDocUrls.cnic) return false;
    if (isWidow && !catDocUrls.death_cert) return false;
    return true;
  }, [catFields, catDocUrls, isWidow]);

  return (
    <BaseCategoryForm
      title="Widow & Elderly Support"
      subtitle="Fixed stipend Rs 6,000 · verified need"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Status *</Label>
          <Select
            value={catFields.status || ""}
            onValueChange={(v) => setField("status", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Full name *</Label>
          <Input
            value={catFields.full_name || ""}
            onChange={(e) => setField("full_name", e.target.value)}
            placeholder="Full name as on CNIC"
          />
        </div>

        <div className="space-y-1">
          <Label>Age *</Label>
          <Input
            type="number"
            value={catFields.age || ""}
            onChange={(e) => setField("age", e.target.value)}
            placeholder="Age in years"
          />
        </div>

        <DocBox
          label="CNIC photo"
          required
          hint="Clear front side of CNIC"
          onUpload={(url) => setDoc("cnic", url)}
          value={catDocUrls.cnic}
        />

        {isWidow && (
          <DocBox
            label="Spouse death certificate"
            required
            hint="Required for widow status"
            onUpload={(url) => setDoc("death_cert", url)}
            value={catDocUrls.death_cert}
          />
        )}
      </div>

      <StepGuide
        lines={[
          "This category has a fixed stipend of Rs 6,000.",
          "Widow status requires a clear death certificate of the spouse.",
          "CNIC name and details must match the form.",
          "Upload clear, readable documents only.",
        ]}
      />
    </BaseCategoryForm>
  );
}
