// src/frontend/src/pages/submit-request/category-forms/ChildSupportForm.tsx
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

export default function ChildSupportForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const parentsOptions = CHOICE_FIELDS.parents_status || [];

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
      !!catFields.child_name?.trim() &&
      !!catFields.child_age &&
      !!catFields.parents_status &&
      !!catDocUrls.child_b_form &&
      !!catDocUrls.parents_proof
    );
  }, [catFields, catDocUrls]);

  return (
    <BaseCategoryForm
      title="Child Support"
      subtitle="Fixed stipend Rs 6,000 · verified child need"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Child's name *</Label>
          <Input
            value={catFields.child_name || ""}
            onChange={(e) => setField("child_name", e.target.value)}
            placeholder="Full name of the child"
          />
        </div>

        <div className="space-y-1">
          <Label>Child's age *</Label>
          <Input
            type="number"
            value={catFields.child_age || ""}
            onChange={(e) => setField("child_age", e.target.value)}
            placeholder="Age in years"
          />
        </div>

        <div className="space-y-1">
          <Label>Parents status *</Label>
          <Select
            value={catFields.parents_status || ""}
            onValueChange={(v) => setField("parents_status", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parents status" />
            </SelectTrigger>
            <SelectContent>
              {parentsOptions.map((opt: string) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DocBox
          label="B-Form / birth certificate"
          required
          hint="Clear photo of child's B-Form or birth certificate"
          onUpload={(url) => setDoc("child_b_form", url)}
          value={catDocUrls.child_b_form}
        />

        <DocBox
          label="Proof of parents' status"
          required
          hint="Death certificate or other proof matching parents status"
          onUpload={(url) => setDoc("parents_proof", url)}
          value={catDocUrls.parents_proof}
        />
      </div>

      <StepGuide
        lines={[
          "This category has a fixed stipend of Rs 6,000.",
          "Upload clear B-Form and parents status proof.",
          "Details must match the documents exactly.",
          "False information can lead to rejection.",
        ]}
      />
    </BaseCategoryForm>
  );
}
