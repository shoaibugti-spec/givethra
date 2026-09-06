// src/frontend/src/pages/submit-request/shared/DocBox.tsx
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface Props {
  label: string;
  required?: boolean;
  hint?: string;
  accept?: string;
  onUpload: (url: string) => void;
  value?: string;
}

export function DocBox({ label, required, hint, accept = "image/*,.pdf", onUpload, value }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // یہاں اپنی upload logic لگائیں
      const url = await uploadFile(file);
      onUpload(url);
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    // Placeholder — use your actual upload API
    return "https://example.com/" + file.name;
  };

  return (
    <div className="rounded-xl border border-border p-3 space-y-2">
      <Label className="text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="block w-full text-sm text-muted-foreground"
      />
      {uploading && <p className="text-xs text-amber-600">⏳ Uploading...</p>}
      {value && !uploading && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded ✓
        </p>
      )}
    </div>
  );
}
