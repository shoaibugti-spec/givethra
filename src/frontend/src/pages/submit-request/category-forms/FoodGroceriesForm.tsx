// src/frontend/src/pages/submit-request/category-forms/FoodGroceriesForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";

export default function FoodGroceriesForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
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
    catFields.family_members &&
    catFields.shop_name?.trim() &&
    catFields.shop_contact?.trim() &&
    catFields.shop_address?.trim() &&
    catFields.groceries_amount &&
    catFields.groceries_due_date &&
    catDocUrls.groceries_estimate;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="🍲 Food & Groceries"
      subtitle="Provide grocery details for your family."
      guide="💰 Max Rs 12,000 per family. Provide shop details for verification."
    >
      <div className="space-y-3">
        <TextInput
          field="Number of Family Members"
          value={catFields.family_members}
          onChange={(v) => setField("family_members", v)}
          placeholder="e.g. 5"
          type="number"
        />

        <TextInput
          field="Shop Name"
          value={catFields.shop_name}
          onChange={(v) => setField("shop_name", v)}
          placeholder="Full shop name"
        />

        <TextInput
          field="Shop Contact Number"
          value={catFields.shop_contact}
          onChange={(v) => setField("shop_contact", v)}
          placeholder="Phone number for verification"
        />

        <TextInput
          field="Shop Address"
          value={catFields.shop_address}
          onChange={(v) => setField("shop_address", v)}
          placeholder="Complete address of the shop"
        />

        <TextInput
          field="Estimated Groceries Amount"
          value={catFields.groceries_amount}
          onChange={(v) => setField("groceries_amount", v)}
          placeholder="e.g. 8000"
          type="number"
        />

        <div className="space-y-2">
          <Label>Due Date *</Label>
          <input
            type="date"
            value={catFields.groceries_due_date || ""}
            onChange={(e) => setField("groceries_due_date", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border"
          />
        </div>

        <FileUpload
          label="Groceries List / Estimate"
          key="groceries_estimate"
          required
          hint="Clear photo of the grocery list or estimate from the shop"
          onUpload={(url) => setDoc("groceries_estimate", url)}
          value={catDocUrls.groceries_estimate}
        />

        <FileUpload
          label="Shop Proof / Receipt"
          key="shop_proof"
          required
          hint="Any proof of the shop (receipt, business card, etc.)"
          onUpload={(url) => setDoc("shop_proof", url)}
          value={catDocUrls.shop_proof}
        />
      </div>
    </BaseCategoryForm>
  );
}
