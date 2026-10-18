import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadFileToStorage } from "@/lib/api";

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
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const safeName = file.name.normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^[-.]+|[-.]+$/g, "")
        .slice(0, 120) || "document";
      const nonce = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const url = await uploadFileToStorage(file, `docs/${nonce}-${safeName}`);
      onUpload(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border p-3 space-y-2">
      <Label className="text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={uploading}
        className="block w-full text-sm text-muted-foreground"
      />
      {uploading && <p className="text-xs text-amber-600">⏳ Uploading...</p>}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
      {value && !uploading && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded ✓
        </p>
      )}
    </div>
  );
}
