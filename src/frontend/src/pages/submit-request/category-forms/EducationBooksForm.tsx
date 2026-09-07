// src/frontend/src/pages/submit-request/category-forms/EducationBooksForm.tsx
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
import {
  EDUCATION_SUB_OPTIONS,
  EDUCATION_ADMISSION_FIELDS,
  getEducationDocs,
} from "../constants";

export default function EducationBooksForm({
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
  const eduAdmissionLevel = formData.eduAdmissionLevel || catFields.admission_level || "";

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

  const onSubTypeChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      eduSubType: value,
      eduAdmissionLevel: "",
      catFields: {
        ...(prev.catFields || {}),
        edu_sub_type: value,
        admission_level: "",
      },
    }));
  };

  const onLevelChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      eduAdmissionLevel: value,
      catFields: { ...(prev.catFields || {}), admission_level: value },
    }));
  };

  const admissionFields =
    eduSubType === "admission" && eduAdmissionLevel
      ? (EDUCATION_ADMISSION_FIELDS as any)[eduAdmissionLevel] || []
      : [];

  const requiredDocs = getEducationDocs(eduSubType, eduAdmissionLevel || eduSubType);

  const isValid = useMemo(() => {
    if (!eduSubType) return false;
    if (!catFields.student_name?.trim()) return false;
    if (!catFields.student_class?.trim()) return false;
    if (eduSubType === "admission" && !eduAdmissionLevel) return false;
    for (const field of admissionFields) {
      if (field.required && !String(catFields[field.key] || "").trim()) return false;
    }
    for (const doc of requiredDocs) {
      if (doc.required && !catDocUrls[doc.key]) return false;
    }
    return true;
  }, [
    eduSubType,
    eduAdmissionLevel,
    catFields,
    catDocUrls,
    admissionFields,
    requiredDocs,
  ]);

  return (
    <BaseCategoryForm
      title="Education, Books & Admission"
      subtitle="ONE student · verified education cost only"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Help type *</Label>
          <Select value={eduSubType} onValueChange={onSubTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_SUB_OPTIONS.map((opt) => (
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
          <Label>Class / grade / program *</Label>
          <Input
            value={catFields.student_class || ""}
            onChange={(e) => setField("student_class", e.target.value)}
            placeholder="e.g. Grade 8, FA, BS"
          />
        </div>

        {eduSubType === "admission" && (
          <div className="space-y-1">
            <Label>Admission level *</Label>
            <Select value={eduAdmissionLevel} onValueChange={onLevelChange}>
              <SelectTrigger>
                <SelectValue placeholder="School / College / University" />
              </SelectTrigger>
              <SelectContent>
                {["School", "College", "University"].map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {admissionFields.map((field: any) => (
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

        {requiredDocs.map((doc) => (
          <DocBox
            key={doc.key}
            label={doc.label}
            required={doc.required}
            hint={doc.hint}
            onUpload={(url) => setDoc(doc.key, url)}
            value={catDocUrls[doc.key]}
          />
        ))}
      </div>

      <StepGuide
        lines={[
          "This case is for ONE student only.",
          "Choose the correct help type: Admission, Books, or Uniform.",
          "Upload clear quotation / challan and student identity proof.",
          "Amounts and documents must match what the institute requires.",
        ]}
      />
    </BaseCategoryForm>
  );
}
