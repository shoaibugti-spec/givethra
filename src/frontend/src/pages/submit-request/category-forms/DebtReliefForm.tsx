// src/frontend/src/pages/submit-request/category-forms/DebtReliefForm.tsx
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BaseCategoryForm } from "./BaseCategoryForm";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";

export default function DebtReliefForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};

  const setField = (key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catFields: { ...(prev.catFields || {}), [key]: value },
    }));
  };

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catDocUrls: { ...(prev.catDocUrls || {}), [key]: url },
    }));
  };

  const isValid = useMemo(() => {
    return (
      !!catFields.creditor_name?.trim() &&
      !!catFields.total_debt &&
      !!catDocUrls.debt_proof
    );
  }, [catFields, catDocUrls]);

  return (
    <BaseCategoryForm
      title="Debt Relief"
      subtitle="5% of total debt · max Rs 25,000"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Creditor name *</Label>
          <Input
            value={catFields.creditor_name || ""}
            onChange={(e) => setField("creditor_name", e.target.value)}
            placeholder="Person or institution owed"
          />
        </div>

        <div className="space-y-1">
          <Label>Total debt amount *</Label>
          <Input
            type="number"
            value={catFields.total_debt || ""}
            onChange={(e) => setField("total_debt", e.target.value)}
            placeholder="Full outstanding debt"
          />
          <p className="text-xs text-muted-foreground">
            Help amount is calculated later as 5% of total debt (maximum Rs 25,000).
          </p>
        </div>

        <DocBox
          label="Debt proof"
          required
          hint="Loan paper, ledger, or written proof of debt"
          onUpload={(url) => setDoc("debt_proof", url)}
          value={catDocUrls.debt_proof}
        />
      </div>

      <StepGuide
        lines={[
          "Help is 5% of total debt, capped at Rs 25,000.",
          "You will confirm total debt again in the amount step.",
          "Upload clear proof of the outstanding debt.",
          "Creditor payment details come in the payment receiver step.",
        ]}
      />
    </BaseCategoryForm>
  );
}
