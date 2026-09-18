// src/frontend/src/pages/submit-request/category-forms/FoodGroceriesForm.tsx
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BaseCategoryForm } from "./BaseCategoryForm";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";

export default function FoodGroceriesForm({
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
      !!catFields.family_members &&
      !!catFields.shop_name?.trim() &&
      !!catFields.groceries_amount &&
      !!catDocUrls.groceries_estimate
    );
  }, [catFields, catDocUrls]);

  return (
    <BaseCategoryForm
      title="Food & Groceries"
      subtitle="Max Rs 12,000 per family · verified need"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Number of family members *</Label>
          <Input
            type="number"
            value={catFields.family_members || ""}
            onChange={(e) => setField("family_members", e.target.value)}
            placeholder="e.g. 5"
          />
        </div>

        <div className="space-y-1">
          <Label>Shop name *</Label>
          <Input
            value={catFields.shop_name || ""}
            onChange={(e) => setField("shop_name", e.target.value)}
            placeholder="Grocery shop name"
          />
        </div>

        <div className="space-y-1">
          <Label>Groceries amount needed *</Label>
          <Input
            type="number"
            value={catFields.groceries_amount || ""}
            onChange={(e) => setField("groceries_amount", e.target.value)}
            placeholder="Max Rs 12,000"
          />
        </div>

        <DocBox
          label="Groceries estimate / list photo"
          required
          hint="Clear list with prices from the shop"
          onUpload={(url) => setDoc("groceries_estimate", url)}
          value={catDocUrls.groceries_estimate}
        />
      </div>

      <StepGuide
        lines={[
          "Maximum help is Rs 12,000 per family for this category.",
          "Upload a clear shop estimate or item list with prices.",
          "Shop payment details will be asked in the payment receiver step.",
          "Amount must match the estimate document.",
        ]}
      />
    </BaseCategoryForm>
  );
}
