// src/frontend/src/pages/submit-request/category-forms/WidowElderlyForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";

export default function WidowElderlyForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
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

  const isValid = catFields.full_name?.trim() && catFields.age?.trim() && catFields.status;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="👵 Widow & Elderly Support"
      subtitle="Provide details for elderly or widow support."
      guide="💰 Fixed Amount: Rs 6,000. For widows and elderly individuals."
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Status *</Label>
          <div className="grid grid-cols-2 gap-2">
            {["Widow", "Elderly (60+)", "Both"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setField("status", opt)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${
                  catFields.status === opt ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <TextInput
          field="Full Name"
          value={catFields.full_name}
          onChange={(v) => setField("full_name", v)}
          placeholder="Full name"
        />

        <TextInput
          field="Age"
          value={catFields.age}
          onChange={(v) => setField("age", v)}
          placeholder="Age in years"
        />

        {catFields.status === "Widow" && (
          <TextInput
            field="Spouse's Name"
            value={catFields.spouse_name}
            onChange={(v) => setField("spouse_name", v)}
            placeholder="Name of deceased spouse"
          />
        )}

        <TextInput
          field="CNIC Number"
          value={catFields.cnic}
          onChange={(v) => setField("cnic", v)}
          placeholder="CNIC number"
        />

        <FileUpload
          label="CNIC Photo"
          key="cnic"
          required
          hint="Clear photo of CNIC (front and back)"
          onUpload={(url) => setDoc("cnic", url)}
          value={catDocUrls.cnic}
        />

        {catFields.status === "Widow" && (
          <FileUpload
            label="Spouse's Death Certificate"
            key="death_cert"
            required
            hint="Clear photo of death certificate"
            onUpload={(url) => setDoc("death_cert", url)}
            value={catDocUrls.death_cert}
          />
        )}
      </div>
    </BaseCategoryForm>
  );
}
