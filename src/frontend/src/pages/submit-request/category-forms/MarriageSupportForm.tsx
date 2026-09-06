// src/frontend/src/pages/submit-request/category-forms/MarriageSupportForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";

export default function MarriageSupportForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
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

  const relationOptions = ["My daughter", "My son", "My sister", "My brother", "Myself", "Other relative"];

  const isValid =
    catFields.relation &&
    catFields.person_name?.trim() &&
    catFields.person_age &&
    catFields.vendor_name?.trim() &&
    catFields.vendor_contact?.trim() &&
    catFields.vendor_bank?.trim() &&
    catFields.vendor_account?.trim() &&
    catFields.marriage_amount &&
    catFields.marriage_date &&
    catDocUrls.relation_proof &&
    catDocUrls.marriage_quotation;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="💍 Marriage Support"
      subtitle="Provide marriage expense details for verification."
      guide="📌 One case = ONE marriage only. Provide vendor details for verification."
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Relation to the person getting married *</Label>
          <div className="grid grid-cols-2 gap-2">
            {relationOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setField("relation", opt)}
                className={`px-2 py-2 rounded-lg border text-xs font-medium text-left ${
                  catFields.relation === opt ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <TextInput
          field="Person Getting Married"
          value={catFields.person_name}
          onChange={(v) => setField("person_name", v)}
          placeholder="Full name of the person"
        />

        <TextInput
          field="Age"
          value={catFields.person_age}
          onChange={(v) => setField("person_age", v)}
          placeholder="Age of the person"
          type="number"
        />

        <TextInput
          field="Marriage Vendor Name"
          value={catFields.vendor_name}
          onChange={(v) => setField("vendor_name", v)}
          placeholder="Name of the marriage vendor"
        />

        <TextInput
          field="Vendor Contact Number"
          value={catFields.vendor_contact}
          onChange={(v) => setField("vendor_contact", v)}
          placeholder="Phone number for verification"
        />

        <TextInput
          field="Vendor Bank Name"
          value={catFields.vendor_bank}
          onChange={(v) => setField("vendor_bank", v)}
          placeholder="Bank name"
        />

        <TextInput
          field="Vendor Account Number"
          value={catFields.vendor_account}
          onChange={(v) => setField("vendor_account", v)}
          placeholder="Account number"
        />

        <TextInput
          field="Total Marriage Expenses"
          value={catFields.marriage_amount}
          onChange={(v) => setField("marriage_amount", v)}
          placeholder="e.g. 500000"
          type="number"
        />

        <div className="space-y-2">
          <Label>Expected Marriage Date *</Label>
          <input
            type="date"
            value={catFields.marriage_date || ""}
            onChange={(e) => setField("marriage_date", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border"
          />
        </div>

        <FileUpload
          label="Proof of Relation (B-Form / FRC)"
          key="relation_proof"
          required
          hint="Proof that you are related to the person getting married"
          onUpload={(url) => setDoc("relation_proof", url)}
          value={catDocUrls.relation_proof}
        />

        <FileUpload
          label="Marriage Expenses Quotation / List"
          key="marriage_quotation"
          required
          hint="List of items needed for the marriage"
          onUpload={(url) => setDoc("marriage_quotation", url)}
          value={catDocUrls.marriage_quotation}
        />
      </div>
    </BaseCategoryForm>
  );
}
