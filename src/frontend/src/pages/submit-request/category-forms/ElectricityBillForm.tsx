// src/frontend/src/pages/submit-request/category-forms/ElectricityBillForm.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DocBox } from "../shared/DocBox";

export default function ElectricityBillForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">⚡ Electricity Bill Details</h2>
      <p className="text-sm text-muted-foreground">
        Provide your electricity bill details for verification.
      </p>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Consumer Reference Number *</Label>
          <Input
            value={formData.refNumber || ""}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, refNumber: e.target.value }))}
            placeholder="e.g. 123456789"
          />
        </div>

        <div className="space-y-2">
          <Label>Bill Owner Name (as on bill) *</Label>
          <Input
            value={catFields.bill_owner_name || ""}
            onChange={(e) => setField("bill_owner_name", e.target.value)}
            placeholder="e.g. Muhammad Ali"
          />
        </div>

        <DocBox
          label="Bill Photo (clear & readable)"
          required
          hint="Bill should clearly show consumer/reference number and amount"
          onUpload={(url) => setDoc("bill", url)}
          value={catDocUrls.bill}
        />
      </div>
    </div>
  );
}
