// src/frontend/src/pages/submit-request/category-forms/DebtReliefForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";

export default function DebtReliefForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
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
    catFields.creditor_name?.trim() &&
    catFields.creditor_contact?.trim() &&
    catFields.creditor_bank?.trim() &&
    catFields.creditor_account?.trim() &&
    catFields.total_debt &&
    catFields.debt_reason?.trim() &&
    catDocUrls.debt_proof;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="💰 Debt Relief"
      subtitle="Provide debt relief details."
      guide="📊 5% of total debt (max Rs 25,000). Amount is automatically calculated."
    >
      <div className="space-y-3">
        <TextInput
          field="Creditor Name"
          value={catFields.creditor_name}
          onChange={(v) => setField("creditor_name", v)}
          placeholder="Name of the creditor"
        />

        <TextInput
          field="Creditor Contact Number"
          value={catFields.creditor_contact}
          onChange={(v) => setField("creditor_contact", v)}
          placeholder="Phone number for verification"
        />

        <TextInput
          field="Creditor Bank Name"
          value={catFields.creditor_bank}
          onChange={(v) => setField("creditor_bank", v)}
          placeholder="Bank name"
        />

        <TextInput
          field="Creditor Account Number"
          value={catFields.creditor_account}
          onChange={(v) => setField("creditor_account", v)}
          placeholder="Account number"
        />

        <TextInput
          field="Total Outstanding Debt"
          value={catFields.total_debt}
          onChange={(v) => setField("total_debt", v)}
          placeholder="e.g. 500000"
          type="number"
        />

        <TextInput
          field="Reason for Debt"
          value={catFields.debt_reason}
          onChange={(v) => setField("debt_reason", v)}
          placeholder="Brief explanation of why the debt was incurred"
        />

        <FileUpload
          label="Debt Proof (Loan Agreement / Bank Statement)"
          key="debt_proof"
          required
          hint="Clear photo of loan agreement, bank statement, or any proof of debt"
          onUpload={(url) => setDoc("debt_proof", url)}
          value={catDocUrls.debt_proof}
        />
      </div>
    </BaseCategoryForm>
  );
}
