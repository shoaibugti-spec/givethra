// src/frontend/src/components/CompletionCooldownBanner.tsx
// Show on Home Page only when last case is COMPLETED and still inside 30 days

import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCompletionCooldown } from "@/hooks/useCompletionCooldown";
import { formatRemaining } from "@/lib/completionCooldown";

export default function CompletionCooldownBanner() {
  const { user, isAuthenticated } = useAuth();
  const { loading, cooldown, remainingLabel } = useCompletionCooldown(user?.id);

  if (!isAuthenticated || loading) return null;

  // Only show while waiting inside the 30-day window
  if (
    cooldown.phase !== "waiting" &&
    cooldown.phase !== "early_available" &&
    cooldown.phase !== "early_locked"
  ) {
    return null;
  }

  const remaining = formatRemaining(cooldown.remainingMs);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-4">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 p-5 space-y-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="text-2xl leading-none">❤️</div>
          <div className="space-y-1 flex-1">
            <h2 className="text-lg font-bold text-rose-800 dark:text-rose-200">
              {cooldown.messageTitle || "Your Help Was Completed"}
            </h2>
            <p className="text-sm text-rose-900/80 dark:text-rose-100/80">
              You can submit another case after 30 Days
            </p>
            <p className="text-base font-semibold tabular-nums text-rose-700 dark:text-rose-300">
              ⏳ {remaining}
            </p>
            {cooldown.lastCompletedTitle && (
              <p className="text-xs text-muted-foreground">
                Last completed case: “{cooldown.lastCompletedTitle}”
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Your previous case was successfully completed. We appreciate your trust.
          Please allow time for others to receive help too. A new need must be
          verified again — repeated help is not automatic.
        </p>

        {cooldown.phase === "waiting" && (
          <p className="text-xs rounded-lg bg-white/70 dark:bg-black/20 border px-3 py-2">
            After 15 days you may send one limited early request for admin review.
            Approval is not guaranteed.
          </p>
        )}

        {cooldown.phase === "early_available" && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-2">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Need Help Again?
            </p>
            <p className="text-xs text-amber-900/80 dark:text-amber-100/80">
              If you have a genuine new problem, you may submit an early request for
              review. Givethra will review it. Approval is not guaranteed. If rejected,
              you must wait until the full 30-day period ends.
            </p>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link to="/onboarding-submit" search={{ early: "1" } as any}>
                Request Early Review
              </Link>
            </Button>
          </div>
        )}

        {cooldown.phase === "early_locked" && (
          <p className="text-xs rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 px-3 py-2 text-red-700 dark:text-red-300">
            Your early request was not approved. Please wait for the remaining{" "}
            {remainingLabel} before submitting again.
          </p>
        )}
      </div>
    </div>
  );
}
