import { cn } from "@/lib/utils";
import { FileCheck, ShieldAlert, ShieldCheck } from "lucide-react";

export type VerificationLevel =
  | "documents_submitted"
  | "institution_verified"
  | "pending"
  | "unverified";

interface Props {
  level: VerificationLevel;
  size?: "sm" | "md";
  className?: string;
}

const config: Record<
  VerificationLevel,
  { label: string; icon: React.ElementType; className: string }
> = {
  institution_verified: {
    label: "Verified",
    icon: ShieldCheck,
    className:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800",
  },
  documents_submitted: {
    label: "Docs Submitted",
    icon: FileCheck,
    className: "text-primary bg-primary/10 border-primary/20",
  },
  pending: {
    label: "Pending",
    icon: ShieldAlert,
    className:
      "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800",
  },
  unverified: {
    label: "Unverified",
    icon: ShieldAlert,
    className: "text-muted-foreground bg-muted border-border",
  },
};

export function VerificationBadge({ level, size = "sm", className }: Props) {
  const { label, icon: Icon, className: colorClass } = config[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        colorClass,
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {label}
    </span>
  );
}
