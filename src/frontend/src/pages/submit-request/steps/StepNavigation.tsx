// src/frontend/src/pages/submit-request/shared/StepNavigation.tsx
import { Button } from "@/components/ui/button";

export function StepNavigation({ onNext, onBack, isFirst, isLast, nextLabel = "Next" }: any) {
  return (
    <div className="flex gap-3 pt-4 border-t">
      {!isFirst && (
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
      )}
      <Button className="flex-1" onClick={onNext}>
        {isLast ? "Submit" : nextLabel}
      </Button>
    </div>
  );
}
