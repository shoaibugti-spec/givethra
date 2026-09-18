// src/frontend/src/pages/submit-request/steps/StepWhyHelp.tsx
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

const MIN_WORDS = 200;

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
          Describe your situation in detail. Heroes read this to understand your need
          and decide whether to help.
        </p>
        <Label>Explain your situation *</Label>
        <Textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Explain from the beginning: what happened, since when, your current situation, family circumstances, and how this help will change things. Write at least 200 words..."
          rows={12}
          className="text-base min-h-[240px]"
          autoFocus
        />
        <div className="flex items-center justify-between gap-2 text-xs">
          <p className={isValid ? "text-green-600 font-medium" : "text-amber-700 dark:text-amber-400"}>
            {isValid
              ? `✓ ${words} words — you can continue`
              : `${words} words so far — at least ${MIN_WORDS} required (${remaining} more)`}
          </p>
          <p className="text-muted-foreground tabular-nums">
            {words} / {MIN_WORDS}+
          </p>
        </div>
      </div>

      <StepGuide
        lines={[
          `Write at least ${MIN_WORDS} words. More detail is always better.`,
          "Cover what happened, when it started, your current situation, and why you need help now.",
          "Be honest and clear. Heroes use this text to verify and decide.",
          "Do not copy a short one-line summary — explain the full story.",
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
