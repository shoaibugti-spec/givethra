// src/frontend/src/pages/submit-request/category-forms/LivestockFarmingForm.tsx
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

const FARM_TYPES = ["Livestock", "Poultry", "Crops", "Dairy", "Other"];

export default function LivestockFarmingForm({
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
      !!catFields.farm_type &&
      !!catFields.farm_amount &&
      !!catDocUrls.livestock_quotation &&
      !!catDocUrls.livestock_proof
    );
  }, [catFields, catDocUrls]);

  return (
    <BaseCategoryForm
      title="Livestock / Farming"
      subtitle="Verified farming need only"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Farm type *</Label>
          <Select
            value={catFields.farm_type || ""}
            onValueChange={(v) => setField("farm_type", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select farm type" />
            </SelectTrigger>
            <SelectContent>
              {FARM_TYPES.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Amount needed *</Label>
          <Input
            type="number"
            value={catFields.farm_amount || ""}
            onChange={(e) => setField("farm_amount", e.target.value)}
            placeholder="Amount required"
          />
        </div>

        <DocBox
          label="Quotation"
          required
          hint="Clear price quotation for animals, feed, or materials"
          onUpload={(url) => setDoc("livestock_quotation", url)}
          value={catDocUrls.livestock_quotation}
        />

        <DocBox
          label="Farm / livestock proof"
          required
          hint="Photo or document proving the farming activity"
          onUpload={(url) => setDoc("livestock_proof", url)}
          value={catDocUrls.livestock_proof}
        />
      </div>

      <StepGuide
        lines={[
          "Upload a clear quotation and proof of farming activity.",
          "Supplier payment details will be asked in the payment receiver step.",
          "Only verified farming needs are approved.",
          "Documents must be clear and complete.",
        ]}
      />
    </BaseCategoryForm>
  );
}
