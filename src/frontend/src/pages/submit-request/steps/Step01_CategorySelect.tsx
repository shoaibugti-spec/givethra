// src/frontend/src/pages/submit-request/steps/Step01_CategorySelect.tsx
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StepGuide } from "../shared/StepGuide"; // یا یہاں بھی StepGuide رکھ سکتے ہیں

interface Props {
  category: string;
  setCategory: (v: string) => void;
  willBeFree: boolean;
  isFirstCaseFree: boolean;
  isFreeDisabled: boolean;
  CATEGORY_LIMITS: any;
  CATEGORIES: string[];
  isFixedAmount: (cat: string) => boolean;
  getFixedAmountValue: (cat: string) => number | null;
  getMaxLimit: (cat: string) => number | null;
  isDebtCategory: (cat: string) => boolean;
  needsPaymentReceiver: boolean;
  title: string;
  setTitle: (v: string) => void;
  shortDesc: string;
  setShortDesc: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  urgency: string;
  setUrgency: (v: string) => void;
  easy: boolean;
  isEducationCategory: boolean;
  setTried1: (v: boolean) => void;
  setStep: (v: number) => void;
}

export default function Step01_CategorySelect(props: Props) {
  const {
    category, setCategory, willBeFree, isFirstCaseFree, isFreeDisabled,
    CATEGORY_LIMITS, CATEGORIES, isFixedAmount, getFixedAmountValue,
    getMaxLimit, isDebtCategory, needsPaymentReceiver,
    title, setTitle, shortDesc, setShortDesc,
    country, setCountry, city, setCity,
    urgency, setUrgency, easy, isEducationCategory,
    setTried1, setStep,
  } = props;

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-5">
      <h2 className="font-bold text-lg">📝 Basic Information</h2>

      <div className="space-y-2">
        <Label>Help Category *</Label>
        <div className="notranslate" translate="no">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className={!category ? "border-red-400" : ""}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {willBeFree && !isFreeDisabled && (
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            🎁 {isFirstCaseFree ? "Your first case is FREE!" : "This category has a FREE offer!"}
          </p>
        )}

        {category && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
            <p className="font-semibold text-primary">📋 {CATEGORY_LIMITS[category]?.label || "Verified Need"}</p>
            {isFixedAmount(category) && (
              <p className="text-green-600 font-bold">💰 Fixed Amount: Rs {getFixedAmountValue(category)?.toLocaleString()}</p>
            )}
            {getMaxLimit(category) && (
              <p className="text-amber-600">⚠️ Maximum Limit: Rs {getMaxLimit(category)?.toLocaleString()}</p>
            )}
            {isDebtCategory(category) && (
              <p className="text-blue-600">📊 5% of total debt (max Rs 25,000)</p>
            )}
            {needsPaymentReceiver && <p className="text-purple-600">📌 Payment receiver details required</p>}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Request Title *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Help with School Fee" />
      </div>

      <div className="space-y-2">
        <Label>Short Description *</Label>
        <Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="One line summary" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Country *</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger><SelectValue placeholder="Select your country" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {COUNTRIES.map((option) => (
                <SelectItem key={option.code} value={option.name}>{option.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>City *</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Karachi" />
        </div>
      </div>

      {!easy && category && category !== "Disability Support" && !isEducationCategory && (
        <div className="space-y-2">
          <Label>Urgency Level *</Label>
          <div className="grid grid-cols-2 gap-2">
            {["Low", "Medium", "High", "Emergency"].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUrgency(u)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium ${urgency === u ? "bg-primary text-white border-primary" : "border-border"}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      )}
      {(easy && !isEducationCategory) && (
        <p className="text-xs text-muted-foreground">ℹ️ Urgency will be set automatically from your bill's due date.</p>
      )}

      <Button
        className="w-full"
        onClick={() => {
          setTried1(true);
          if (!category || !title.trim() || !shortDesc.trim() || !country.trim() || !city.trim()) {
            toast.error("Please fill all required fields (marked red)");
            return;
          }
          if (!easy && category !== "Disability Support" && !isEducationCategory && !urgency) {
            toast.error("Please choose urgency level");
            return;
          }
          setStep(2);
        }}
      >
        Continue
      </Button>

      <StepGuide lines={[
        "Choose the category that matches your need.",
        "Write a short title and one-line description.",
        "Enter your country and city, then tap Continue.",
      ]} />
    </div>
  );
}
