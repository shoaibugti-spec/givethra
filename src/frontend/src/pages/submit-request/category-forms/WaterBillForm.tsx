// src/frontend/src/pages/submit-request/category-forms/WaterBillForm.tsx
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseCategoryForm } from "./BaseCategoryForm";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";
import { UTILITY_CATS } from "../constants";
import { ELECTRICITY_MAX_ELIGIBLE_UNITS } from "../electricity";

export default function WaterBillForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const companies = UTILITY_CATS["Water Bill"]?.companies || [];
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const instituteName = formData.instituteName || catFields.company || "";
  const refNumber = formData.refNumber || "";
  const monthlyUnits = Number(catFields.monthly_units || 0);

  const setField = (key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catFields: { ...(prev.catFields || {}), [key]: value },
    }));
  };

  const setTop = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catDocUrls: { ...(prev.catDocUrls || {}), [key]: url },
    }));
  };

  const onCompanyChange = (name: string) => {
    setFormData((prev: any) => ({
      ...prev,
      instituteName: name,
      catFields: { ...(prev.catFields || {}), company: name },
    }));
  };

  const isValid = useMemo(() => {
    return (
      !!instituteName.trim() &&
      !!refNumber.trim() &&
      !!catFields.bill_owner_name?.trim() &&
      monthlyUnits >= 1 && monthlyUnits <= ELECTRICITY_MAX_ELIGIBLE_UNITS &&
      !!catDocUrls.bill
    );
  }, [instituteName, refNumber, catFields.bill_owner_name, catDocUrls.bill, monthlyUnits]);

  return (
    <BaseCategoryForm
      title="Water Bill"
      subtitle="One month verified water bill only"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Water company / board *</Label>
          <Select value={instituteName} onValueChange={onCompanyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c: any) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Consumer reference number *</Label>
          <Input
            value={refNumber}
            onChange={(e) => setTop("refNumber", e.target.value)}
            placeholder="Reference / consumer number on the bill"
          />
        </div>

        <div className="space-y-1">
          <Label>Bill owner name *</Label>
          <Input
            value={catFields.bill_owner_name || ""}
            onChange={(e) => setField("bill_owner_name", e.target.value)}
            placeholder="Name printed on the bill"
          />
        </div>

        <div className="space-y-1">
          <Label>Monthly water units *</Label>
          <Input type="number" min={1} max={ELECTRICITY_MAX_ELIGIBLE_UNITS} value={catFields.monthly_units || ""} onChange={(e) => setField("monthly_units", e.target.value)} placeholder="1–300 units" />
          {monthlyUnits > ELECTRICITY_MAX_ELIGIBLE_UNITS && <p className="text-sm font-semibold text-destructive">Usage above 300 units is not eligible.</p>}
          {monthlyUnits >= 1 && monthlyUnits <= ELECTRICITY_MAX_ELIGIBLE_UNITS && <p className="text-xs text-muted-foreground">Eligible range: 1–300 units.</p>}
        </div>

        <DocBox
          label="Water bill photo (ONE month only)"
          required
          hint="Clear photo of a single current month bill — not arrears"
          onUpload={(url) => setDoc("bill", url)}
          value={catDocUrls.bill}
        />
      </div>

      <StepGuide
        lines={[
          "Upload only ONE month water bill — the current due month.",
          "Do not submit arrears, old dues, or multiple months.",
          "Reference number and owner name must match the bill photo.",
          "Clear photo is required for verification.",
        ]}
      />
    </BaseCategoryForm>
  );
}
