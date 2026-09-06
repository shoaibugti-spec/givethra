// src/frontend/src/pages/submit-request/category-forms/BusinessWorkHelpForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";

export default function BusinessWorkHelpForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
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

  const isValid =
    catFields.business_name?.trim() &&
    catFields.business_type?.trim() &&
    catFields.owner_name?.trim() &&
    catFields.owner_contact?.trim() &&
    catFields.business_address?.trim() &&
    catFields.business_amount &&
    catDocUrls.business_quotation &&
    catDocUrls.business_proof;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="💼 Business / Work Help"
      subtitle="Provide business or work help details."
      guide="💰 Rs 8,000–20,000 based on verified need. Provide business proof for verification."
    >
      <div className="space-y-3">
        <TextInput
          field="Business Name"
          value={catFields.business_name}
          onChange={(v) => setField("business_name", v)}
          placeholder="Official business name"
        />

        <TextInput
          field="Business Type"
          value={catFields.business_type}
          onChange={(v) => setField("business_type", v)}
          placeholder="e.g. Retail, Services, Manufacturing"
        />

        <TextInput
          field="Business Owner Name"
          value={catFields.owner_name}
          onChange={(v) => setField("owner_name", v)}
          placeholder="Full name of owner"
        />

        <TextInput
          field="Owner Contact Number"
          value={catFields.owner_contact}
          onChange={(v) => setField("owner_contact", v)}
          placeholder="Phone number for verification"
        />

        <TextInput
          field="Business Address"
          value={catFields.business_address}
          onChange={(v) => setField("business_address", v)}
          placeholder="Complete business address"
        />

        <TextInput
          field="Amount Needed"
          value={catFields.business_amount}
          onChange={(v) => setField("business_amount", v)}
          placeholder="e.g. 15000"
          type="number"
        />

        <FileUpload
          label="Business Equipment / Supply Quotation"
          key="business_quotation"
          required
          hint="Quotation for the items needed for business"
          onUpload={(url) => setDoc("business_quotation", url)}
          value={catDocUrls.business_quotation}
        />

        <FileUpload
          label="Business Proof (License / Registration)"
          key="business_proof"
          required
          hint="Proof that you have a business (license, registration, etc.)"
          onUpload={(url) => setDoc("business_proof", url)}
          value={catDocUrls.business_proof}
        />
      </div>
    </BaseCategoryForm>
  );
}
