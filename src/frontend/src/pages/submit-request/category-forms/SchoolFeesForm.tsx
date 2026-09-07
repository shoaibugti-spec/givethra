// src/frontend/src/pages/submit-request/category-forms/SchoolFeesForm.tsx
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
import { FEE_SUB_OPTIONS, EDUCATION_FEE_FIELDS } from "../constants";

export default function SchoolFeesForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const eduSubType = formData.eduSubType || catFields.edu_sub_type || "";

  const setField = (key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catFields: { ...(prev.catFields || {}), [key]: value },
    }));
  };

  const setTop = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catDocUrls: { ...(prev.catDocUrls || {}), [key]: url },
    }));
  };

  const onSubTypeChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      eduSubType: value,
      catFields: { ...(prev.catFields || {}), edu_sub_type: value },
    }));
  };

  const subFields =
    eduSubType === "school"
      ? EDUCATION_FEE_FIELDS.School
      : eduSubType === "college"
        ? EDUCATION_FEE_FIELDS.College
        : eduSubType === "university"
          ? EDUCATION_FEE_FIELDS.University
          : [];

  const isValid = useMemo(() => {
    if (!eduSubType) return false;
    if (!catFields.student_name?.trim()) return false;
    if (!catFields.father_name?.trim()) return false;
    if (!catFields.roll_no?.trim()) return false;
    for (const field of subFields) {
      if (field.required && !String(catFields[field.key] || "").trim()) return false;
    }
    if (!catDocUrls.fee_challan) return false;
    if (!catDocUrls.student_id_proof) return false;
    return true;
  }, [eduSubType, catFields, catDocUrls, subFields]);

  return (
    <BaseCategoryForm
      title="School, College & University Fees"
      subtitle="ONE student · ONE month verified fee only"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Fee type *</Label>
          <Select value={eduSubType} onValueChange={onSubTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select fee type" />
            </SelectTrigger>
            <SelectContent>
              {FEE_SUB_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Student's name (ONE student only) *</Label>
          <Input
            value={catFields.student_name || ""}
            onChange={(e) => setField("student_name", e.target.value)}
            placeholder="Full name of one student"
          />
        </div>

        <div className="space-y-1">
          <Label>Father's name *</Label>
          <Input
            value={catFields.father_name || ""}
            onChange={(e) => setField("father_name", e.target.value)}
            placeholder="Father's full name"
          />
        </div>

        <div className="space-y-1">
          <Label>Roll no / registration no *</Label>
          <Input
            value={catFields.roll_no || ""}
            onChange={(e) => setField("roll_no", e.target.value)}
            placeholder="Student roll or registration number"
          />
        </div>

        {subFields.map((field: any) => (
          <div key={field.key} className="space-y-1">
            <Label>
              {field.label} {field.required ? "*" : ""}
            </Label>
            {field.choices ? (
              <Select
                value={catFields[field.key] || ""}
                onValueChange={(v) => setField(field.key, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.choices.map((c: string) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={catFields[field.key] || ""}
                onChange={(e) => setField(field.key, e.target.value)}
                placeholder={field.placeholder || field.label}
              />
            )}
          </div>
        ))}

        <DocBox
          label="Fee challan / voucher (ONE month)"
          required
          hint="Challan must show amount and due date clearly"
          onUpload={(url) => setDoc("fee_challan", url)}
          value={catDocUrls.fee_challan}
        />

        <DocBox
          label="Student ID proof (B-Form / CNIC / School ID)"
          required
          hint="Clear proof of student identity"
          onUpload={(url) => setDoc("student_id_proof", url)}
          value={catDocUrls.student_id_proof}
        />
      </div>

      <StepGuide
        lines={[
          "This case is for ONE student only — do not combine multiple children.",
          "Upload fee for ONE month only — not a full year or multiple terms.",
          "Fee challan must clearly show student name, amount, and due date.",
          "Student identity proof is required for verification.",
        ]}
      />
    </BaseCategoryForm>
  );
}
