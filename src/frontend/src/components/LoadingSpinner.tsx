import { cn } from "@/lib/utils";

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = "md", className, label }: Props) {
  const sizeClass = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" }[size];
  return (
    <div
      data-ocid="loading_state"
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
      aria-label={label ?? "Loading"}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-border border-t-primary",
          sizeClass,
        )}
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
