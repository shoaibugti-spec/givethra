// src/frontend/src/pages/submit-request/category-forms/HomeRepairForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";

export default function HomeRepairForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
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

  const propertyOptions = ["Owned", "Rented"];
  const repairOptions = ["Plumbing", "Electrical", "Roofing", "Flooring", "Painting", "Other"];

  const isValid =
    catFields.property_type &&
    catFields.repair_type &&
    catFields.contractor_name?.trim() &&
    catFields.contractor_contact?.trim() &&
    catFields.contractor_bank?.trim() &&
    catFields.contractor_account?.trim() &&
    catFields.repair_amount &&
    catFields.repair_address?.trim() &&
    catDocUrls.repair_estimate;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="🔧 Home Repair"
      subtitle="Provide home repair details."
      guide="💰 Max Rs 18,000. Provide contractor details and repair estimate."
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Property Type *</Label>
          <div className="grid grid-cols-2 gap-2">
            {propertyOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setField("property_type", opt)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${
                  catFields.property_type === opt ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Repair Type *</Label>
          <div className="grid grid-cols-2 gap-2">
            {repairOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setField("repair_type", opt)}
                className={`px-2 py-2 rounded-lg border text-xs font-medium ${
                  catFields.repair_type === opt ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <TextInput
          field="Contractor Name"
          value={catFields.contractor_name}
          onChange={(v) => setField("contractor_name", v)}
          placeholder="Full name of contractor"
        />

        <TextInput
          field="Contractor Contact Number"
          value={catFields.contractor_contact}
          onChange={(v) => setField("contractor_contact", v)}
          placeholder="Phone number for verification"
        />

        <TextInput
          field="Contractor Bank Name"
          value={catFields.contractor_bank}
          onChange={(v) => setField("contractor_bank", v)}
          placeholder="Bank name"
        />

        <TextInput
          field="Contractor Account Number"
          value={catFields.contractor_account}
          onChange={(v) => setField("contractor_account", v)}
          placeholder="Account number"
        />

        <TextInput
          field="Repair Cost"
          value={catFields.repair_amount}
          onChange={(v) => setField("repair_amount", v)}
          placeholder="e.g. 12000"
          type="number"
        />

        <TextInput
          field="Property Address"
          value={catFields.repair_address}
          onChange={(v) => setField("repair_address", v)}
          placeholder="Complete address of the property"
        />

        <FileUpload
          label="Repair Estimate / Quotation"
          key="repair_estimate"
          required
          hint="Clear photo of the repair estimate or quotation"
          onUpload={(url) => setDoc("repair_estimate", url)}
          value={catDocUrls.repair_estimate}
        />

        <FileUpload
          label="Contractor Agreement / Work Order"
          key="contractor_agreement"
          required={false}
          hint="If you have a contractor, attach the agreement (optional)"
          onUpload={(url) => setDoc("contractor_agreement", url)}
          value={catDocUrls.contractor_agreement}
        />
      </div>
    </BaseCategoryForm>
  );
}
