// src/frontend/src/pages/submit-request/category-forms/BaseCategoryForm.tsx
import { ReactNode } from "react";
import { StepNavigation } from "../shared/StepNavigation";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext: () => void;
  onBack: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  disabled?: boolean;
  submitting?: boolean;
};

export function BaseCategoryForm({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  isFirst,
  isLast,
  disabled,
  submitting,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="space-y-4">{children}</div>

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={!!isFirst}
        isLast={!!isLast}
        disabled={!!disabled || !!submitting}
      />
    </div>
  );
}
