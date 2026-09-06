// src/frontend/src/pages/submit-request/category-forms/FuneralExpensesForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";

export default function FuneralExpensesForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
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

  const relationOptions = ["My father", "My mother", "My husband", "My wife", "My child", "Other relative"];

  const isValid =
    catFields.deceased_relation &&
    catFields.deceased_name?.trim() &&
    catFields.service_provider?.trim() &&
    catFields.provider_contact?.trim() &&
    catFields.provider_bank?.trim() &&
    catFields.provider_account?.trim() &&
    catFields.funeral_amount &&
    catFields.funeral_date &&
    catDocUrls.death_certificate &&
    catDocUrls.relation_proof;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="🕊️ Funeral Expenses"
      subtitle="Provide funeral expense details."
      guide="📌 One case = ONE funeral only. Provide funeral service provider details."
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Relation to the deceased *</Label>
          <div className="grid grid-cols-2 gap-2">
            {relationOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setField("deceased_relation", opt)}
                className={`px-2 py-2 rounded-lg border text-xs font-medium text-left ${
                  catFields.deceased_relation === opt ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <TextInput
          field="Deceased Person's Full Name"
          value={catFields.deceased_name}
          onChange={(v) => setField("deceased_name", v)}
          placeholder="Full name of the deceased"
        />

        <TextInput
          field="Funeral Service Provider"
          value={catFields.service_provider}
          onChange={(v) => setField("service_provider", v)}
          placeholder="Name of the funeral service provider"
        />

        <TextInput
          field="Provider Contact Number"
          value={catFields.provider_contact}
          onChange={(v) => setField("provider_contact", v)}
          placeholder="Phone number for verification"
        />

        <TextInput
          field="Provider Bank Name"
          value={catFields.provider_bank}
          onChange={(v) => setField("provider_bank", v)}
          placeholder="Bank name"
        />

        <TextInput
          field="Provider Account Number"
          value={catFields.provider_account}
          onChange={(v) => setField("provider_account", v)}
          placeholder="Account number"
        />

        <TextInput
          field="Funeral Expenses Amount"
          value={catFields.funeral_amount}
          onChange={(v) => setField("funeral_amount", v)}
          placeholder="e.g. 50000"
          type="number"
        />

        <div className="space-y-2">
          <Label>Funeral Date *</Label>
          <input
            type="date"
            value={catFields.funeral_date || ""}
            onChange={(e) => setField("funeral_date", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border"
          />
        </div>

        <FileUpload
          label="Death Certificate"
          key="death_certificate"
          required
          hint="Clear photo of the death certificate"
          onUpload={(url) => setDoc("death_certificate", url)}
          value={catDocUrls.death_certificate}
        />

        <FileUpload
          label="Proof of Relation (B-Form / FRC)"
          key="relation_proof"
          required
          hint="Proof of relation to the deceased"
          onUpload={(url) => setDoc("relation_proof", url)}
          value={catDocUrls.relation_proof}
        />
      </div>
    </BaseCategoryForm>
  );
}
