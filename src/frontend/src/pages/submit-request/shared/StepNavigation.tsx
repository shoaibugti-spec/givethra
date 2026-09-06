// src/frontend/src/pages/submit-request/shared/StepNavigation.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  nextLabel?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function StepNavigation({
  onNext,
  onBack,
  isFirst,
  isLast,
  nextLabel = "Next",
  disabled = false,
  loading = false,
}: Props) {
  return (
    <div className="flex gap-3 pt-4 border-t">
      {!isFirst && (
        <Button
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={loading}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      )}
      <Button
        className="flex-1"
        onClick={onNext}
        disabled={disabled || loading}
      >
        {loading ? "Loading..." : (
          <>
            {isLast ? "Submit Request" : nextLabel}
            {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
          </>
        )}
      </Button>
    </div>
  );
}
