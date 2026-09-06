// src/frontend/src/pages/submit-request/category-forms/[CategoryName]Form.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";

export default function [CategoryName]Form({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { catFields, catDocUrls } = formData;

  const setField = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      catFields: { ...prev.catFields, [key]: value },
    }));
  };

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls, [key]: url },
    }));
  };

  // 👇 یہاں اپنی فیلڈز اور validation لگائیں
  const isValid = catFields.field1?.trim() && catFields.field2?.trim() && catDocUrls.doc1;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="[Category Title]"
      subtitle="[Category Subtitle]"
      guide="⚠️ [Any special instructions]"
    >
      <div className="space-y-3">
        <TextInput
          field="[Field Label 1]"
          value={catFields.field1}
          onChange={(v) => setField("field1", v)}
          placeholder="[Placeholder]"
        />

        {/* For choices */}
        <div className="space-y-2">
          <Label>[Choice Label] *</Label>
          <div className="grid grid-cols-2 gap-2">
            {["Option 1", "Option 2"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setField("choice_field", opt)}
                className={`px-2 py-2 rounded-lg border text-xs font-medium ${
                  catFields.choice_field === opt ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <FileUpload
          label="[Document Label]"
          key="doc1"
          required
          hint="[Hint]"
          onUpload={(url) => setDoc("doc1", url)}
          value={catDocUrls.doc1}
        />
      </div>
    </BaseCategoryForm>
  );
}
