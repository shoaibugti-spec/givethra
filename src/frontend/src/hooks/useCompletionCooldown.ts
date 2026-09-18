// src/frontend/src/hooks/useCompletionCooldown.ts
import { useEffect, useState, useCallback, useMemo } from "react";
import { getCasesByUser } from "@/lib/api";
import {
  buildCooldownState,
  detectEarlyRequestRejected,
  formatRemaining,
  type CooldownState,
} from "@/lib/completionCooldown";

export function useCompletionCooldown(userId?: string) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    if (!userId) {
      setCases([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getCasesByUser(userId);
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("useCompletionCooldown load error:", err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh remaining time every 60s
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const cooldown: CooldownState = useMemo(() => {
    void tick; // recompute every minute
    const earlyRejected = detectEarlyRequestRejected(cases);
    return buildCooldownState(cases, { earlyRequestRejected: earlyRejected });
  }, [cases, tick]);

  const remainingLabel = formatRemaining(cooldown.remainingMs);

  return {
    loading,
    cases,
    cooldown,
    remainingLabel,
    refetch: load,
  };
}
