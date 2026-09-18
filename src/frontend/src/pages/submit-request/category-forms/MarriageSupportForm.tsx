// src/frontend/src/pages/submit-request/category-forms/MarriageSupportForm.tsx
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

export default function MarriageSupportForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const relationOptions = CHOICE_FIELDS.relation || [];

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
      !!catFields.relation &&
      !!catFields.person_name?.trim() &&
      !!catDocUrls.relation_proof &&
      !!catDocUrls.marriage_quotation
    );
  }, [catFields, catDocUrls]);

  return (
    <BaseCategoryForm
      title="Marriage Support"
      subtitle="Verified marriage need only"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Relation *</Label>
          <Select
            value={catFields.relation || ""}
            onValueChange={(v) => setField("relation", v)}
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
          <Label>Person's name *</Label>
          <Input
            value={catFields.person_name || ""}
            onChange={(e) => setField("person_name", e.target.value)}
            placeholder="Name of the person getting married"
          />
        </div>

        <DocBox
          label="Relation proof"
          required
          hint="Document proving relation to the person"
          onUpload={(url) => setDoc("relation_proof", url)}
          value={catDocUrls.relation_proof}
        />

        <DocBox
          label="Marriage quotation / estimate"
          required
          hint="Clear quotation of marriage-related costs"
          onUpload={(url) => setDoc("marriage_quotation", url)}
          value={catDocUrls.marriage_quotation}
        />
      </div>

      <StepGuide
        lines={[
          "Upload clear relation proof and marriage cost quotation.",
          "Vendor payment details will be asked in the payment receiver step.",
          "Only verified needs are approved.",
          "Documents must be readable and complete.",
        ]}
      />
    </BaseCategoryForm>
  );
}
