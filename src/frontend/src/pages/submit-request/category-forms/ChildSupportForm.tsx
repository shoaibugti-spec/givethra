// src/frontend/src/pages/submit-request/category-forms/ChildSupportForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";

export default function ChildSupportForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
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

  const isValid = catFields.child_name?.trim() && catFields.child_age?.trim() && catFields.parents_status;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="👶 Child Support"
      subtitle="Provide details about the child who needs support."
      guide="💰 Fixed Amount: Rs 6,000. One case = ONE child only."
    >
      <div className="space-y-3">
        <TextInput
          field="Child's Full Name"
          value={catFields.child_name}
          onChange={(v) => setField("child_name", v)}
          placeholder="Full name of child"
        />

        <TextInput
          field="Child's Age"
          value={catFields.child_age}
          onChange={(v) => setField("child_age", v)}
          placeholder="e.g. 8"
        />

        <div className="space-y-2">
          <Label>Parents Status *</Label>
          <div className="grid grid-cols-2 gap-2">
            {["Both alive", "Father passed away", "Mother passed away", "Both passed away"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setField("parents_status", opt)}
                className={`px-2 py-2 rounded-lg border text-xs font-medium text-left ${
                  catFields.parents_status === opt ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <TextInput
          field="Child's B-Form / CNIC Number"
          value={catFields.child_cnic}
          onChange={(v) => setField("child_cnic", v)}
          placeholder="B-Form or CNIC number"
        />

        <FileUpload
          label="Child's B-Form / Birth Certificate"
          key="child_b_form"
          required
          hint="Clear photo of B-Form or birth certificate"
          onUpload={(url) => setDoc("child_b_form", url)}
          value={catDocUrls.child_b_form}
        />

        <FileUpload
          label="Proof of Parents' Status"
          key="parents_proof"
          required
          hint="Death certificate(s) if applicable, or other proof"
          onUpload={(url) => setDoc("parents_proof", url)}
          value={catDocUrls.parents_proof}
        />
      </div>
    </BaseCategoryForm>
  );
}
