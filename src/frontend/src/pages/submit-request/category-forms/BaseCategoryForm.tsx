// src/frontend/src/pages/submit-request/category-forms/BaseCategoryForm.tsx
import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";

type Props = {
  title: string;
  subtitle?: string;
  guide?: string;
  children: ReactNode;
  formData?: any;
  setFormData?: (updater: any) => void;
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
  guide,
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
        {guide && <p className="text-xs text-muted-foreground">{guide}</p>}
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

export function TextInput({
  field,
  value,
  onChange,
  placeholder,
}: {
  field: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{field}</span>
      <Input value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function FileUpload({
  label,
  hint,
  required,
  value,
  onUpload,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  value?: string;
  onUpload: (url: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}{required ? " *" : ""}</span>
      <Input type="url" value={value ?? ""} onChange={(event) => onUpload(event.target.value)} placeholder={hint ?? "Paste the uploaded file URL"} />
    </label>
  );
}
