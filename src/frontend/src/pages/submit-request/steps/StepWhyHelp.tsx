// src/frontend/src/pages/submit-request/steps/StepWhyHelp.tsx
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StepNavigation } from "../shared/StepNavigation";

const MIN_WORDS = 500;

function countWords(text: string): number {
  const t = (text || "").trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export default function StepWhyHelp({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const text = value || "";
  const words = countWords(text);
  const isValid = words >= MIN_WORDS;
  const remaining = Math.max(0, MIN_WORDS - words);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Why do you need this help?</h2>
        <p className="text-sm text-muted-foreground">
          اپنے مسئلے کی مکمل تفصیل لکھیں — Heroes اسی متن سے سمجھتے ہیں کہ مدد کیوں
          ضروری ہے۔ جتنا واضح لکھیں گے، اتنا بہتر۔
        </p>
        <Label>Explain Your Situation *</Label>
        <Textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="شروع سے آخر تک اپنا مسئلہ تفصیل سے بیان کریں: کیا ہوا، کب سے، موجودہ حالت، خاندان کی صورتحال، اور مدد سے کیا بدلاؤ آئے گا۔ کم از کم 500 الفاظ..."
          rows={14}
          className="text-base min-h-[280px]"
          autoFocus
        />
        <div className="flex items-center justify-between gap-2 text-xs">
          <p
            className={
              isValid
                ? "text-green-600 font-medium"
                : "text-amber-700 dark:text-amber-400"
            }
          >
            {isValid
              ? `✓ ${words} الفاظ — آگے بڑھ سکتے ہیں`
              : `ابھی ${words} الفاظ — کم از کم ${MIN_WORDS} الفاظ درکار (مزید ${remaining})`}
          </p>
          <p className="text-muted-foreground tabular-nums">{words} / {MIN_WORDS}+</p>
        </div>
        <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 p-3">
          💡 کم از کم <strong>500 الفاظ</strong> لکھیں۔ مسئلہ، پس منظر، اور مدد کی
          ضرورت واضح طور پر بیان کریں۔ جتنا زیادہ درست لکھیں گے اتنا ہی Heroes کو
          سمجھنے میں آسانی ہوگی۔
        </p>
      </div>
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
