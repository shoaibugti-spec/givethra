// src/frontend/src/pages/submit-request/category-forms/GasBillForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";
import { GAS_COMPANIES } from "@/lib/institutesList";

export default function GasBillForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { catFields, catDocUrls, refNumber } = formData;

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

  const setRef = (value: string) => {
    setFormData((prev: any) => ({ ...prev, refNumber: value }));
  };

  const isValid = refNumber?.trim() && catFields.bill_owner_name?.trim() && catDocUrls.bill;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="🔥 Gas Bill Details"
      subtitle="Provide your gas bill details for verification."
      guide="⚠️ One case = ONE bill only. Upload a clear photo of your gas bill."
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Select Your Company *</Label>
          <div className="grid grid-cols-2 gap-2">
            {GAS_COMPANIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setField("company", c.name)}
                className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left ${
                  catFields.company === c.name ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <TextInput
          field="Consumer Reference Number"
          value={refNumber}
          onChange={setRef}
          placeholder="e.g. 123456789"
        />

        <TextInput
          field="Bill Owner Name (as on bill)"
          value={catFields.bill_owner_name}
          onChange={(v) => setField("bill_owner_name", v)}
          placeholder="e.g. Muhammad Ali"
        />

        <FileUpload
          label="Bill Photo (clear & readable)"
          key="bill"
          required
          hint="Bill should clearly show consumer/reference number and amount"
          onUpload={(url) => setDoc("bill", url)}
          value={catDocUrls.bill}
        />
      </div>
    </BaseCategoryForm>
  );
}
