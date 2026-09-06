// src/frontend/src/pages/submit-request/category-forms/HouseRentForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";

export default function HouseRentForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
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
    catFields.landlord_name?.trim() &&
    catFields.landlord_contact?.trim() &&
    catFields.landlord_bank?.trim() &&
    catFields.landlord_account?.trim() &&
    catFields.rent_amount &&
    catFields.rent_due_date &&
    catDocUrls.rental_agreement &&
    catDocUrls.landlord_cnic;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="🏠 House Rent"
      subtitle="Provide rental details for verification."
      guide="💰 Verified 1 Month Rent. One case = ONE rental property only."
    >
      <div className="space-y-3">
        <TextInput
          field="Landlord's Full Name"
          value={catFields.landlord_name}
          onChange={(v) => setField("landlord_name", v)}
          placeholder="Full name of landlord"
        />

        <TextInput
          field="Landlord's Contact Number"
          value={catFields.landlord_contact}
          onChange={(v) => setField("landlord_contact", v)}
          placeholder="Phone number for verification"
        />

        <TextInput
          field="Landlord's Bank Name"
          value={catFields.landlord_bank}
          onChange={(v) => setField("landlord_bank", v)}
          placeholder="Bank name"
        />

        <TextInput
          field="Landlord's Account Number"
          value={catFields.landlord_account}
          onChange={(v) => setField("landlord_account", v)}
          placeholder="Account number"
        />

        <TextInput
          field="Monthly Rent Amount"
          value={catFields.rent_amount}
          onChange={(v) => setField("rent_amount", v)}
          placeholder="e.g. 25000"
          type="number"
        />

        <div className="space-y-2">
          <Label>Rent Due Date *</Label>
          <input
            type="date"
            value={catFields.rent_due_date || ""}
            onChange={(e) => setField("rent_due_date", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border"
          />
        </div>

        <TextInput
          field="Property Address"
          value={catFields.property_address}
          onChange={(v) => setField("property_address", v)}
          placeholder="Complete address of the property"
        />

        <FileUpload
          label="Rental Agreement / Contract"
          key="rental_agreement"
          required
          hint="Clear photo of your rental agreement or lease document"
          onUpload={(url) => setDoc("rental_agreement", url)}
          value={catDocUrls.rental_agreement}
        />

        <FileUpload
          label="Landlord's CNIC"
          key="landlord_cnic"
          required
          hint="CNIC of the landlord or any document proving property ownership"
          onUpload={(url) => setDoc("landlord_cnic", url)}
          value={catDocUrls.landlord_cnic}
        />
      </div>
    </BaseCategoryForm>
  );
}
