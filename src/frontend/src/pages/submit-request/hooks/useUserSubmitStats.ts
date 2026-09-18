// src/frontend/src/pages/submit-request/hooks/useUserSubmitStats.ts
import { useState, useEffect, useCallback } from "react";
import {
  getCasesByUser,
  getUserSuspension,
  getWallet,
  getFeedbacks,
} from "@/lib/api";

export type ActiveCaseInfo = {
  id: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "completed";
  rejectionReason?: string;
};

export type UserSubmitStats = {
  balance: number;
  freeCasesUsed: number;
  totalCases: number;
  rejectedCases: number;
  isSuspended: boolean;
  isFreeDisabled: boolean;
  suspensionCount: number;
  blockedByFeedback: { caseId: string; caseTitle: string } | null;
  activeCase: ActiveCaseInfo | null;
};

const INITIAL_STATS: UserSubmitStats = {
  balance: 0,
  freeCasesUsed: 0,
  totalCases: 0,
  rejectedCases: 0,
  isSuspended: false,
  isFreeDisabled: false,
  suspensionCount: 0,
  blockedByFeedback: null,
  activeCase: null,
};

export function useUserSubmitStats(userId?: string) {
  const [stats, setStats] = useState<UserSubmitStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      setStats(INITIAL_STATS);
      setLoading(false);
      return;
    }

    const currentUserId = userId;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [cases, suspension, wallet, feedbacks] = await Promise.all([
          getCasesByUser(currentUserId),
          getUserSuspension(currentUserId),
          getWallet(currentUserId),
          getFeedbacks(200),
        ]);

        if (cancelled) return;

        const caseList: any[] = Array.isArray(cases) ? cases : [];
        const totalCases = caseList.length;
        const rejectedCases = caseList.filter(
          (c: any) => String(c.status || "").toLowerCase() === "rejected"
        ).length;
        const freeCasesUsed = caseList.filter((c: any) => c.was_free === true).length;

        // ── Latest relevant case (pending / approved / rejected) ──
        const sorted = caseList
          .slice()
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at || b.submitted_at || 0).getTime() -
              new Date(a.created_at || a.submitted_at || 0).getTime()
          );

        let activeCase: ActiveCaseInfo | null = null;
        for (const c of sorted) {
          const st = String(c.status || "").toLowerCase();
          if (st === "pending" || st === "approved" || st === "rejected") {
            activeCase = {
              id: String(c.id),
              title: String(c.title || "Your case"),
              status: st as "pending" | "approved" | "rejected",
              rejectionReason: String(
                c.rejection_reason ||
                  c.admin_notes ||
                  c.reject_reason ||
                  c.rejection_notes ||
                  ""
              ).trim() || undefined,
            };
            break;
          }
        }

        // ── Blocked by missing feedback on completed case (after 24h) ──
        const completedCases = caseList.filter(
          (c: any) => String(c.status || "").toLowerCase() === "completed"
        );
        let blocked: { caseId: string; caseTitle: string } | null = null;
        if (completedCases.length > 0) {
          const feedbackList = Array.isArray(feedbacks) ? feedbacks : [];
          const now = Date.now();
          const overdue = completedCases.find((completed: any) => {
            const completedAt = new Date(
              String(
                completed.completed_at ||
                  completed.updated_at ||
                  completed.created_at ||
                  ""
              )
            ).getTime();
            if (!Number.isFinite(completedAt) || now - completedAt < 24 * 60 * 60 * 1000) {
              return false;
            }
            const submitted = feedbackList.some(
              (fb: any) =>
                String(fb.case_id) === String(completed.id) &&
                String(fb.user_id) === String(currentUserId) &&
                ["pending_review", "approved"].includes(
                  String(fb.status || "").toLowerCase()
                )
            );
            return !submitted;
          });
          if (overdue) {
            blocked = {
              caseId: String(overdue.id),
              caseTitle: String(overdue.title || "your completed case"),
            };
          }
        }

        const isSuspended =
          suspension?.is_active === true || suspension?.is_active === 1;
        const isFreeDisabled = rejectedCases >= 3 || freeCasesUsed >= 2;

        setStats({
          balance: Number(wallet?.balance || 0),
          freeCasesUsed,
          totalCases,
          rejectedCases,
          isSuspended,
          isFreeDisabled,
          suspensionCount: Number(suspension?.suspension_count || 0),
          blockedByFeedback: blocked,
          activeCase,
        });
      } catch (err) {
        console.error("Error loading user stats:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  return { stats, loading, refetch };
}
