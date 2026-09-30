// src/frontend/src/pages/submit-request/category-forms/ElectricityBillForm.tsx
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
import { ELECTRICITY_APPLIANCES, ELECTRICITY_MAX_ELIGIBLE_UNITS, normalizeElectricityAppliances } from "../electricity";

export default function ElectricityBillForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const companies = UTILITY_CATS["Electricity Bill"]?.companies || [];
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const appliances = normalizeElectricityAppliances(catFields.appliances);
  const monthlyUnits = Number(catFields.monthly_units || 0);
  const instituteName = formData.instituteName || catFields.company || "";
  const refNumber = formData.refNumber || "";

  const setField = (key: string, value: any) => {
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
      !!catDocUrls.bill && monthlyUnits >= 1 && monthlyUnits <= ELECTRICITY_MAX_ELIGIBLE_UNITS && Object.keys(appliances).length > 0
    );
  }, [instituteName, refNumber, catFields.bill_owner_name, catDocUrls.bill, monthlyUnits, appliances]);

  const setApplianceCount = (key: string, delta: number) => {
    const next = Math.max(0, (appliances[key] || 0) + delta);
    setField("appliances", { ...appliances, [key]: next });
  };

  return (
    <BaseCategoryForm
      title="Electricity Bill"
      subtitle="One month verified electricity bill only"
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      disabled={!isValid}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Electricity company *</Label>
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

        <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
          <Label>Appliances used in the home *</Label>
          <p className="text-xs text-muted-foreground">Select each appliance and set its quantity.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ELECTRICITY_APPLIANCES.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                <span className="text-sm">{label}</span>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label={`Decrease ${label}`} onClick={() => setApplianceCount(key, -1)} className="h-7 w-7 rounded-full border">−</button>
                  <span className="w-5 text-center text-sm font-semibold">{appliances[key] || 0}</span>
                  <button type="button" aria-label={`Increase ${label}`} onClick={() => setApplianceCount(key, 1)} className="h-7 w-7 rounded-full border">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Label>Monthly electricity units (kWh) *</Label>
          <Input type="number" min={1} max={ELECTRICITY_MAX_ELIGIBLE_UNITS} value={catFields.monthly_units || ""} onChange={(e) => setField("monthly_units", e.target.value)} placeholder="1–300 units" />
          {monthlyUnits > ELECTRICITY_MAX_ELIGIBLE_UNITS && <p className="text-sm font-semibold text-destructive">You are not eligible for this help request because monthly usage is above 300 units.</p>}
          {monthlyUnits >= 1 && monthlyUnits <= ELECTRICITY_MAX_ELIGIBLE_UNITS && <p className="text-xs text-muted-foreground">Eligible range: 1–300 units.</p>}
        </div>

        <DocBox
          label="Electricity bill photo (ONE month only)"
          required
          hint="Clear photo of a single current month bill — not old dues or multiple months"
          onUpload={(url) => setDoc("bill", url)}
          value={catDocUrls.bill}
        />
      </div>

      <StepGuide
        lines={[
          "Upload only ONE month electricity bill — the current due month.",
          "Do not submit arrears, old dues, or multiple months combined.",
          "Reference number and owner name must match the bill photo.",
          "Blurry or incomplete bills can cause rejection.",
        ]}
      />
    </BaseCategoryForm>
  );
}
