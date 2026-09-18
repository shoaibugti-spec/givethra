// src/frontend/src/pages/submit-request/steps/StepPaymentReceiver.tsx
// Payment receiver details — same rules as SubmitRequestPage

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

const RECEIVER_LABELS: Record<string, string> = {
  "House Rent": "Landlord",
  "Food & Groceries": "Shop Owner",
  "Medicines": "Pharmacy / Shop Owner",
  "Home Repair": "Contractor / Material Shop",
  "Debt Relief": "Creditor",
  "Business / Work Help": "Business Owner / Supplier",
  "Marriage Support": "Marriage Vendor",
  "Funeral Expenses": "Funeral Service Provider",
  "Livestock / Farming": "Supplier / Farm Owner",
  "Emergency Help": "Emergency Recipient",
  Other: "Recipient",
};

const SHOP_NAME_CATS = new Set(["Food & Groceries", "Medicines", "Home Repair"]);

export default function StepPaymentReceiver({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const category = formData?.category || "";
  const label = RECEIVER_LABELS[category] || "Payment Receiver";
  const needsShopName = SHOP_NAME_CATS.has(category);

  const receiverName = formData?.receiverName || "";
  const receiverContact = formData?.receiverContact || "";
  const receiverBank = formData?.receiverBank || "";
  const receiverAccount = formData?.receiverAccount || "";
  const receiverAddress = formData?.receiverAddress || "";
  const receiverShopName = formData?.receiverShopName || "";

  const setField = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const isValid =
    !!receiverName.trim() &&
    !!receiverContact.trim() &&
    !!receiverBank.trim() &&
    !!receiverAccount.trim() &&
    !!receiverAddress.trim() &&
    (!needsShopName || !!receiverShopName.trim());

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{label} payment details</h2>
        <p className="text-sm text-muted-foreground">
          Enter where the help amount should be paid. These details are required for
          verification and payout.
        </p>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
        <div className="space-y-1">
          <Label>{label} name *</Label>
          <Input
            value={receiverName}
            onChange={(e) => setField("receiverName", e.target.value)}
            placeholder={`Enter ${label.toLowerCase()} name`}
            className="bg-background"
          />
        </div>

        <div className="space-y-1">
          <Label>{label} contact number *</Label>
          <Input
            value={receiverContact}
            onChange={(e) => setField("receiverContact", e.target.value)}
            placeholder="Phone number for verification"
            className="bg-background"
          />
        </div>

        <div className="space-y-1">
          <Label>{label} bank name *</Label>
          <Input
            value={receiverBank}
            onChange={(e) => setField("receiverBank", e.target.value)}
            placeholder="Bank name"
            className="bg-background"
          />
        </div>

        <div className="space-y-1">
          <Label>{label} account number *</Label>
          <Input
            value={receiverAccount}
            onChange={(e) => setField("receiverAccount", e.target.value)}
            placeholder="Account number"
            className="bg-background"
          />
        </div>

        <div className="space-y-1">
          <Label>{label} address *</Label>
          <Textarea
            value={receiverAddress}
            onChange={(e) => setField("receiverAddress", e.target.value)}
            placeholder="Complete address of the receiver / shop"
            rows={2}
            className="bg-background"
          />
        </div>

        {needsShopName && (
          <div className="space-y-1">
            <Label>Shop name *</Label>
            <Input
              value={receiverShopName}
              onChange={(e) => setField("receiverShopName", e.target.value)}
              placeholder="Shop or pharmacy name"
              className="bg-background"
            />
          </div>
        )}
      </div>

      <StepGuide
        lines={[
          `Fill complete ${label.toLowerCase()} details so admin can verify the payout.`,
          "Name, contact, bank, account number, and address are all required.",
          needsShopName
            ? "Shop name is required for this category."
            : "Use the real account that will receive the help amount.",
          "Incorrect details can delay or reject the case.",
        ]}
      />

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!isValid}
      />
    </div>
  );
}
