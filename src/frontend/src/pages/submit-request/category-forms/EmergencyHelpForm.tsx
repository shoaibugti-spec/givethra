// src/frontend/src/pages/submit-request/category-forms/EmergencyHelpForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";

export default function EmergencyHelpForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
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

  const emergencyTypes = ["Medical Emergency", "Natural Disaster", "Accident", "Urgent Family Matter", "Other"];

  const isValid =
    catFields.emergency_type &&
    catFields.emergency_description?.trim() &&
    catFields.emergency_location?.trim() &&
    catFields.emergency_amount &&
    catFields.emergency_date &&
    catDocUrls.emergency_proof;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="🚨 Emergency Help"
      subtitle="Provide emergency help details."
      guide="⚡ For urgent situations only. Please provide proof of the emergency."
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Emergency Type *</Label>
          <div className="grid grid-cols-2 gap-2">
            {emergencyTypes.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setField("emergency_type", opt)}
                className={`px-2 py-2 rounded-lg border text-xs font-medium ${
                  catFields.emergency_type === opt ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <TextInput
          field="Emergency Description"
          value={catFields.emergency_description}
          onChange={(v) => setField("emergency_description", v)}
          placeholder="Describe the emergency in detail"
        />

        <TextInput
          field="Emergency Location"
          value={catFields.emergency_location}
          onChange={(v) => setField("emergency_location", v)}
          placeholder="Complete address or location"
        />

        <TextInput
          field="Amount Needed"
          value={catFields.emergency_amount}
          onChange={(v) => setField("emergency_amount", v)}
          placeholder="e.g. 20000"
          type="number"
        />

        <div className="space-y-2">
          <Label>Emergency Date *</Label>
          <input
            type="date"
            value={catFields.emergency_date || ""}
            onChange={(e) => setField("emergency_date", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border"
          />
        </div>

        <FileUpload
          label="Emergency Proof (Photo / Report)"
          key="emergency_proof"
          required
          hint="Clear photo of the emergency situation, hospital report, or any proof"
          onUpload={(url) => setDoc("emergency_proof", url)}
          value={catDocUrls.emergency_proof}
        />
      </div>
    </BaseCategoryForm>
  );
}
