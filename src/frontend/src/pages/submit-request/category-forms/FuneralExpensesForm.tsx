// src/frontend/src/pages/submit-request/category-forms/FuneralExpensesForm.tsx
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
import { CHOICE_FIELDS } from "../constants";

export default function FuneralExpensesForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const relationOptions = CHOICE_FIELDS.deceased_relation || [];

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
      !!catFields.deceased_relation &&
      !!catFields.deceased_name?.trim() &&
      !!catDocUrls.death_certificate &&
      !!catDocUrls.relation_proof
    );
  }, [catFields, catDocUrls]);

  return (
    <BaseCategoryForm
      title="Funeral Expenses"
      subtitle="Verified funeral need only"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Relation to deceased *</Label>
          <Select
            value={catFields.deceased_relation || ""}
            onValueChange={(v) => setField("deceased_relation", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select relation" />
            </SelectTrigger>
            <SelectContent>
              {relationOptions.map((opt: string) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Deceased person's name *</Label>
          <Input
            value={catFields.deceased_name || ""}
            onChange={(e) => setField("deceased_name", e.target.value)}
            placeholder="Full name of the deceased"
          />
        </div>

        <DocBox
          label="Death certificate"
          required
          hint="Official death certificate"
          onUpload={(url) => setDoc("death_certificate", url)}
          value={catDocUrls.death_certificate}
        />

        <DocBox
          label="Relation proof"
          required
          hint="Proof of relation to the deceased"
          onUpload={(url) => setDoc("relation_proof", url)}
          value={catDocUrls.relation_proof}
        />
      </div>

      <StepGuide
        lines={[
          "Death certificate is mandatory.",
          "Relation proof must clearly show your connection to the deceased.",
          "Service provider payment details come in the payment receiver step.",
          "Submit only verified, clear documents.",
        ]}
      />
    </BaseCategoryForm>
  );
}
