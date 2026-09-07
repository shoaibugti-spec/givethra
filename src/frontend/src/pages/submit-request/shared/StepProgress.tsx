// src/frontend/src/pages/submit-request/shared/StepProgress.tsx
// ✅ FIXED: No flicker when only total changes (category select)

import { memo } from "react";

export const StepProgress = memo(function StepProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const safeTotal = Math.max(total, 1);
  const percentage = Math.round((current / safeTotal) * 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          Step {current} of {safeTotal}
        </span>
        <span>{percentage}% complete</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-primary h-1.5 rounded-full"
          style={{
            width: `${percentage}%`,
            transition: "width 0.25s ease-out",
          }}
        />
      </div>
    </div>
  );
});
