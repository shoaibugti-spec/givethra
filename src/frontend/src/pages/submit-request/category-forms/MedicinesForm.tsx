// src/frontend/src/pages/submit-request/category-forms/MedicinesForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";
import { HEALTH_INSTITUTES } from "@/lib/institutesList";
import { useState } from "react";

export default function MedicinesForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { catFields, catDocUrls, refNumber } = formData;
  const [search, setSearch] = useState("");
  const [isOther, setIsOther] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherContact, setOtherContact] = useState("");
  const [otherAddress, setOtherAddress] = useState("");

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

  const filteredPharmacies = HEALTH_INSTITUTES.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const isValid = catFields.patient_name?.trim() && catFields.illness?.trim() && catDocUrls.bill && catDocUrls.doctor_report;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="💊 Medicines"
      subtitle="Provide medicine/prescription details for ONE patient only."
      guide="⚠️ One case = ONE patient only. Upload a clear photo of the prescription and estimate."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <TextInput
            field="Patient's Name (ONE patient)"
            value={catFields.patient_name}
            onChange={(v) => setField("patient_name", v)}
            placeholder="Full name of patient"
          />

          <TextInput
            field="Illness / Condition"
            value={catFields.illness}
            onChange={(v) => setField("illness", v)}
            placeholder="Brief description of condition"
          />

          {!isOther && !catFields.pharmacy_name && (
            <div className="space-y-2">
              <Label>Search & Select Pharmacy / Hospital *</Label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type pharmacy or hospital name..."
                className="w-full px-4 py-2.5 rounded-lg border"
              />
              {search.length >= 2 && (
                <div className="rounded-xl border divide-y overflow-hidden max-h-48 overflow-y-auto">
                  {filteredPharmacies.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setField("pharmacy_name", n)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5"
                    >
                      {n}
                    </button>
                  ))}
                  {filteredPharmacies.length === 0 && (
                    <p className="px-3 py-2.5 text-sm text-muted-foreground">No match found.</p>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsOther(true)}
                className="text-xs text-primary font-medium underline"
              >
                My pharmacy is not in the list
              </button>
            </div>
          )}

          {catFields.pharmacy_name && !isOther && (
            <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-300 p-3 flex items-center justify-between">
              <p className="text-sm font-medium text-green-700">✓ {catFields.pharmacy_name}</p>
              <button
                type="button"
                onClick={() => setField("pharmacy_name", "")}
                className="text-xs text-primary underline"
              >
                Change
              </button>
            </div>
          )}

          {isOther && (
            <div className="space-y-3 rounded-xl border p-3">
              <div className="flex justify-between">
                <p className="text-sm font-semibold">Pharmacy (not in list)</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOther(false);
                    setOtherName("");
                    setOtherContact("");
                    setOtherAddress("");
                  }}
                  className="text-xs text-primary underline"
                >
                  Back to list
                </button>
              </div>
              <TextInput
                field="Pharmacy Full Name"
                value={otherName}
                onChange={setOtherName}
                placeholder="Complete official name"
              />
              <TextInput
                field="Pharmacy Contact Number"
                value={otherContact}
                onChange={setOtherContact}
                placeholder="Phone number"
              />
              <TextInput
                field="Pharmacy Address"
                value={otherAddress}
                onChange={setOtherAddress}
                placeholder="Complete address"
              />
            </div>
          )}

          {(catFields.pharmacy_name || isOther) && (
            <>
              <TextInput
                field="Invoice / Prescription Number"
                value={refNumber}
                onChange={setRef}
                placeholder="Prescription or invoice number"
              />

              <FileUpload
                label="Prescription / Medicine Estimate Photo"
                key="bill"
                required
                hint="Clear photo of the prescription or medicine estimate"
                onUpload={(url) => setDoc("bill", url)}
                value={catDocUrls.bill}
              />

              <FileUpload
                label="Doctor's Report / Prescription"
                key="doctor_report"
                required
                hint="Clear photo of the doctor's written report or prescription"
                onUpload={(url) => setDoc("doctor_report", url)}
                value={catDocUrls.doctor_report}
              />
            </>
          )}
        </div>
      </div>
    </BaseCategoryForm>
  );
}
