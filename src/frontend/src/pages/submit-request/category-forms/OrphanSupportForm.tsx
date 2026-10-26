import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseCategoryForm } from "./BaseCategoryForm";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";

const PARENT_DEATH_OPTIONS = ["Father passed away", "Mother passed away", "Both passed away"];

export default function OrphanSupportForm({
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

  const isValid = useMemo(
    () =>
      !!catFields.child_name?.trim() &&
      !!catFields.child_age &&
      PARENT_DEATH_OPTIONS.includes(catFields.parents_status) &&
      !!catDocUrls.child_b_form &&
      !!catDocUrls.parents_proof,
    [catFields, catDocUrls]
  );

  return (
    <BaseCategoryForm
      title="Orphan Support"
      subtitle="Fixed support Rs 4,000 · verified orphan need"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
          This category is for a child whose father, mother, or both parents have passed away.
        </div>

        <div className="space-y-1">
          <Label>Child's name *</Label>
          <Input value={catFields.child_name || ""} onChange={(e) => setField("child_name", e.target.value)} placeholder="Full name of the child" />
        </div>

        <div className="space-y-1">
          <Label>Child's age *</Label>
          <Input type="number" value={catFields.child_age || ""} onChange={(e) => setField("child_age", e.target.value)} placeholder="Age in years" />
        </div>

        <div className="space-y-1">
          <Label>Which parent passed away? *</Label>
          <Select value={catFields.parents_status || ""} onValueChange={(value) => setField("parents_status", value)}>
            <SelectTrigger><SelectValue placeholder="Select parent status" /></SelectTrigger>
            <SelectContent>
              {PARENT_DEATH_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <DocBox
          label="B-Form / birth certificate"
          required
          hint="Clear photo of the child's B-Form or birth certificate"
          onUpload={(url) => setDoc("child_b_form", url)}
          value={catDocUrls.child_b_form}
        />

        <DocBox
          label="Parent death certificate / death proof"
          required
          hint="Upload the death certificate matching the selected parent status"
          onUpload={(url) => setDoc("parents_proof", url)}
          value={catDocUrls.parents_proof}
        />
      </div>

      <StepGuide lines={[
        "This category has a fixed support amount of Rs 4,000.",
        "Upload the child's B-Form and the matching parent death proof.",
        "The selected parent status must match the uploaded document.",
        "False information can lead to rejection.",
      ]} />
    </BaseCategoryForm>
  );
}
