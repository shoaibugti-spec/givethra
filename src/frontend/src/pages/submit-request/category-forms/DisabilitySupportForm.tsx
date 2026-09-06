// src/frontend/src/pages/submit-request/category-forms/DisabilitySupportForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";
import { HEALTH_INSTITUTES } from "@/lib/institutesList";
import { useState } from "react";

export default function DisabilitySupportForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { catFields, catDocUrls, disabilityMode, disabilityShopName, disabilityShopContact, disabilityHospital, disabilityBankTitle, disabilityBankNumber, treatmentAmount, treatmentExpiry, treatmentPatientNumber, disabilityType } = formData;
  const [search, setSearch] = useState("");
  const [isOther, setIsOther] = useState(false);

  const setField = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls, [key]: url },
    }));
  };

  const filteredHospitals = HEALTH_INSTITUTES.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const isValid = catDocUrls.disability_cnic && catDocUrls.disability_photo && disabilityType && disabilityMode;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="♿ Disability Support"
      subtitle="Provide disability support details."
      guide="📌 First upload the required documents, then choose the type of help."
      hideNavigation
    >
      <div className="space-y-4">
        <div className="space-y-3 rounded-xl border-2 border-amber-300 bg-amber-50/30 dark:bg-amber-950/10 p-4">
          <p className="text-sm font-bold text-amber-800">📎 Required Documents</p>
          <FileUpload
            label="CNIC showing Disability (or Disability Certificate)"
            key="disability_cnic"
            required
            hint="REQUIRED — CNIC that marks the person as disabled, or an official disability certificate"
            onUpload={(url) => setDoc("disability_cnic", url)}
            value={catDocUrls.disability_cnic}
          />
          <FileUpload
            label="Clear Photo of Disability"
            key="disability_photo"
            required
            hint="A clear photo showing the disability, for verification"
            onUpload={(url) => setDoc("disability_photo", url)}
            value={catDocUrls.disability_photo}
          />
        </div>

        <div className="space-y-2">
          <Label>Type of Disability *</Label>
          <div className="grid grid-cols-2 gap-2">
            {["Physical", "Visual", "Hearing", "Intellectual", "Other"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setField("disabilityType", opt)}
                className={`px-2 py-2 rounded-lg border text-xs font-medium text-left ${
                  disabilityType === opt ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>What kind of help is needed? *</Label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { v: "product", l: "🦽 Equipment / Product (e.g. wheelchair, hearing aid)" },
              { v: "treatment", l: "🏥 Hospital Treatment" },
              { v: "stipend", l: "💰 Monthly Stipend (Rs 6,000)" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setField("disabilityMode", o.v)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium text-left ${
                  disabilityMode === o.v ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        {disabilityMode === "product" && (
          <div className="space-y-3 rounded-xl border p-3 bg-card">
            <p className="text-sm font-semibold text-green-700">🛒 Product — Shop Details</p>
            <TextInput
              field="Shop Name"
              value={disabilityShopName}
              onChange={(v) => setField("disabilityShopName", v)}
              placeholder="Shop name"
              required
            />
            <TextInput
              field="Shop Contact Number"
              value={disabilityShopContact}
              onChange={(v) => setField("disabilityShopContact", v)}
              placeholder="Phone number"
              required
            />
            <FileUpload
              label="Shop Quotation / Price Estimate"
              key="product_receipt"
              required
              hint="Photo of the shop's quotation showing the product & price"
              onUpload={(url) => setDoc("product_receipt", url)}
              value={catDocUrls.product_receipt}
            />
          </div>
        )}

        {disabilityMode === "treatment" && (
          <div className="space-y-3 rounded-xl border p-3 bg-card">
            <p className="text-sm font-semibold text-green-700">🏥 Treatment — Select Hospital</p>
            {!isOther && !disabilityHospital && (
              <div className="space-y-2">
                <Label>Search & Select Hospital *</Label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type hospital name..."
                  className="w-full px-4 py-2.5 rounded-lg border"
                />
                {search.length >= 2 && (
                  <div className="rounded-xl border divide-y overflow-hidden max-h-48 overflow-y-auto">
                    {filteredHospitals.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setField("disabilityHospital", n)}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5"
                      >
                        {n}
                      </button>
                    ))}
                    {filteredHospitals.length === 0 && (
                      <p className="px-3 py-2.5 text-sm text-muted-foreground">No match found.</p>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsOther(true)}
                  className="text-xs text-primary font-medium underline"
                >
                  My hospital is not in the list
                </button>
              </div>
            )}
            {disabilityHospital && !isOther && (
              <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-300 p-3 flex items-center justify-between">
                <p className="text-sm font-medium text-green-700">✓ {disabilityHospital}</p>
                <button
                  type="button"
                  onClick={() => setField("disabilityHospital", "")}
                  className="text-xs text-primary underline"
                >
                  Change
                </button>
              </div>
            )}
            {isOther && (
              <TextInput
                field="Hospital Name"
                value={disabilityHospital}
                onChange={(v) => setField("disabilityHospital", v)}
                placeholder="Full hospital name"
              />
            )}
            <TextInput
              field="Treatment Amount"
              value={treatmentAmount}
              onChange={(v) => setField("treatmentAmount", v)}
              placeholder="Total amount on hospital bill"
              type="number"
              required
            />
            <div className="space-y-2">
              <Label>Bill Expiry Date *</Label>
              <input
                type="date"
                value={treatmentExpiry}
                onChange={(e) => setField("treatmentExpiry", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border"
              />
            </div>
            <TextInput
              field="Patient / Bill Number"
              value={treatmentPatientNumber}
              onChange={(v) => setField("treatmentPatientNumber", v)}
              placeholder="Patient number or bill number from hospital"
              required
            />
          </div>
        )}

        {disabilityMode === "stipend" && (
          <div className="space-y-3 rounded-xl border p-3 bg-card">
            <p className="text-sm font-semibold text-green-700">💰 Monthly Stipend — Rs 6,000</p>
            <TextInput
              field="Account Title"
              value={disabilityBankTitle}
              onChange={(v) => setField("disabilityBankTitle", v)}
              placeholder="Your name as on account"
              required
            />
            <TextInput
              field="Bank Account / EasyPaisa / JazzCash Number"
              value={disabilityBankNumber}
              onChange={(v) => setField("disabilityBankNumber", v)}
              placeholder="Account number"
              required
            />
          </div>
        )}
      </div>

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!isValid}
      />
    </BaseCategoryForm>
  );
}
