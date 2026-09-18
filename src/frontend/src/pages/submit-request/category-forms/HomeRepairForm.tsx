// src/frontend/src/pages/submit-request/category-forms/HomeRepairForm.tsx
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

const PROPERTY_TYPES = ["House", "Room", "Shop", "Other"];
const REPAIR_TYPES = ["Roof", "Wall", "Plumbing", "Electrical", "Other"];

export default function HomeRepairForm({
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
      !!catFields.property_type &&
      !!catFields.repair_type &&
      !!catFields.repair_amount &&
      !!catDocUrls.repair_estimate
    );
  }, [catFields, catDocUrls]);

  return (
    <BaseCategoryForm
      title="Home Repair"
      subtitle="Max Rs 18,000 · verified repair need"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Property type *</Label>
          <Select
            value={catFields.property_type || ""}
            onValueChange={(v) => setField("property_type", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Repair type *</Label>
          <Select
            value={catFields.repair_type || ""}
            onValueChange={(v) => setField("repair_type", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select repair type" />
            </SelectTrigger>
            <SelectContent>
              {REPAIR_TYPES.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Repair amount *</Label>
          <Input
            type="number"
            value={catFields.repair_amount || ""}
            onChange={(e) => setField("repair_amount", e.target.value)}
            placeholder="Max Rs 18,000"
          />
        </div>

        <DocBox
          label="Repair estimate"
          required
          hint="Clear estimate from contractor or material shop"
          onUpload={(url) => setDoc("repair_estimate", url)}
          value={catDocUrls.repair_estimate}
        />
      </div>

      <StepGuide
        lines={[
          "Maximum amount is Rs 18,000 for this category.",
          "Upload a clear repair estimate matching the amount.",
          "Contractor / shop payment details come in the payment receiver step.",
          "Only verified repair needs are approved.",
        ]}
      />
    </BaseCategoryForm>
  );
}
