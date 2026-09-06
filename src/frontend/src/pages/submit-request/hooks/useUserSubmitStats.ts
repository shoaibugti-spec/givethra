import { useState, useEffect } from "react";
import {
  getCasesByUser,
  getUserSuspension,
  getWallet,
  getFeedbacks,
} from "@/lib/api";

export function useUserSubmitStats(userId?: string) {
  const [stats, setStats] = useState({
    balance: 0,
    freeCasesUsed: 0,
    totalCases: 0,
    rejectedCases: 0,
    isSuspended: false,
    isFreeDisabled: false,
    suspensionCount: 0,
    blockedByFeedback: null as { caseId: string; caseTitle: string } | null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const [cases, suspension, wallet, feedbacks] = await Promise.all([
          getCasesByUser(userId),
          getUserSuspension(userId),
          getWallet(userId),
          getFeedbacks(200),
        ]);

        const totalCases = cases?.length || 0;
        const rejectedCases = cases?.filter((c: any) => c.status === "rejected").length || 0;
        const freeCasesUsed = cases?.filter((c: any) => c.was_free === true).length || 0;

        // Check for blocked by feedback
        const completedCases = cases?.filter((c: any) => c.status === "completed") || [];
        let blocked = null;
        if (completedCases.length > 0) {
          const feedbackList = Array.isArray(feedbacks) ? feedbacks : [];
          const now = Date.now();
          const overdue = completedCases.find((completed: any) => {
            const completedAt = new Date(String(completed.completed_at || completed.updated_at || completed.created_at || "")).getTime();
            if (!Number.isFinite(completedAt) || now - completedAt < 24 * 60 * 60 * 1000) return false;
            const submitted = feedbackList.some((fb: any) =>
              String(fb.case_id) === String(completed.id) &&
              String(fb.user_id) === String(userId) &&
              ["pending_review", "approved"].includes(String(fb.status || "").toLowerCase())
            );
            return !submitted;
          });
          if (overdue) {
            blocked = { caseId: String(overdue.id), caseTitle: String(overdue.title || "your completed case") };
          }
        }

        const isSuspended = suspension?.is_active === true || suspension?.is_active === 1;
        const isFreeDisabled = rejectedCases >= 3 || freeCasesUsed >= 2;

        setStats({
          balance: Number(wallet?.balance || 0),
          freeCasesUsed,
          totalCases,
          rejectedCases,
          isSuspended,
          isFreeDisabled,
          suspensionCount: suspension?.suspension_count || 0,
          blockedByFeedback: blocked,
        });
      } catch (err) {
        console.error("Error loading user stats:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  return { stats, loading, refetch: () => {} };
}
