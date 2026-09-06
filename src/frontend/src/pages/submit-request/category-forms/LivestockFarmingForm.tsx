// src/frontend/src/pages/submit-request/category-forms/LivestockFarmingForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";

export default function LivestockFarmingForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
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

  const farmOptions = ["Livestock", "Crops", "Poultry", "Mixed"];

  const isValid =
    catFields.farm_type &&
    catFields.animal_count &&
    catFields.farm_owner?.trim() &&
    catFields.farm_contact?.trim() &&
    catFields.farm_address?.trim() &&
    catFields.farm_amount &&
    catDocUrls.livestock_quotation &&
    catDocUrls.livestock_proof;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="🐄 Livestock / Farming"
      subtitle="Provide livestock or farming details."
      guide="📌 Provide farm details and equipment quotation for verification."
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Farm Type *</Label>
          <div className="grid grid-cols-2 gap-2">
            {farmOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setField("farm_type", opt)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${
                  catFields.farm_type === opt ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <TextInput
          field="Number of Animals / Area Size"
          value={catFields.animal_count}
          onChange={(v) => setField("animal_count", v)}
          placeholder="e.g. 5 cows / 2 acres"
        />

        <TextInput
          field="Farm Owner Name"
          value={catFields.farm_owner}
          onChange={(v) => setField("farm_owner", v)}
          placeholder="Full name of farm owner"
        />

        <TextInput
          field="Farm Owner Contact Number"
          value={catFields.farm_contact}
          onChange={(v) => setField("farm_contact", v)}
          placeholder="Phone number for verification"
        />

        <TextInput
          field="Farm Address"
          value={catFields.farm_address}
          onChange={(v) => setField("farm_address", v)}
          placeholder="Complete farm address"
        />

        <TextInput
          field="Amount Needed"
          value={catFields.farm_amount}
          onChange={(v) => setField("farm_amount", v)}
          placeholder="e.g. 15000"
          type="number"
        />

        <FileUpload
          label="Livestock / Farming Equipment Quotation"
          key="livestock_quotation"
          required
          hint="Quotation for the animals or equipment needed"
          onUpload={(url) => setDoc("livestock_quotation", url)}
          value={catDocUrls.livestock_quotation}
        />

        <FileUpload
          label="Proof of Livestock / Farming"
          key="livestock_proof"
          required
          hint="Photo or document showing your livestock/farming"
          onUpload={(url) => setDoc("livestock_proof", url)}
          value={catDocUrls.livestock_proof}
        />
      </div>
    </BaseCategoryForm>
  );
}
