// src/frontend/src/pages/submit-request/category-forms/BaseCategoryForm.tsx

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DocBox } from "../shared/DocBox";
import { StepNavigation } from "../shared/StepNavigation";

interface BaseProps {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  children?: React.ReactNode;
  title: string;
  subtitle: string;
  guide?: string;
  hideNavigation?: boolean;
  disabled?: boolean;
}

export function BaseCategoryForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
  children,
  title,
  subtitle,
  guide,
  hideNavigation = false,
  disabled = false,
}: BaseProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {guide && (
          <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
            {guide}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {children}

        {!hideNavigation && (
          <StepNavigation
            onNext={onNext}
            onBack={onBack}
            isFirst={isFirst}
            isLast={isLast}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}

export function TextInput({
  field,
  value,
  onChange,
  placeholder,
  required = true,
  type = "text",
}: any) {
  return (
    <div className="space-y-2">
      <Label>
        {field} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter ${field.toLowerCase()}`}
      />
    </div>
  );
}

export function TextAreaInput({
  field,
  value,
  onChange,
  placeholder,
  required = true,
  rows = 3,
}: any) {
  return (
    <div className="space-y-2">
      <Label>
        {field} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter ${field.toLowerCase()}`}
        rows={rows}
      />
    </div>
  );
}

export function FileUpload({ label, key, required, hint, accept, onUpload, value }: any) {
  return (
    <DocBox
      label={label}
      required={required}
      hint={hint}
      accept={accept}
      onUpload={onUpload}
      value={value}
    />
  );
}
