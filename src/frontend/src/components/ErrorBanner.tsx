import { cn } from "@/lib/utils";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface Props {
  message: string;
  dismissible?: boolean;
  className?: string;
}

export function ErrorBanner({ message, dismissible = true, className }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      data-ocid="error_state"
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
        "dark:border-red-800 dark:bg-red-950 dark:text-red-300",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss error"
          className="shrink-0 rounded transition-colors hover:text-red-900 dark:hover:text-red-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
