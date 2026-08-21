import type { UserPublic } from "@/backend";
import { useAuth } from "@/contexts/AuthContext";
import { getBackendActor } from "@/lib/actor";
import { useQuery } from "@tanstack/react-query";

export function useBackendActor() {
  return { actor: getBackendActor(), isFetching: false };
}

/**
 * Polls the caller-based profile endpoint every 10 seconds so name/avatar
 * stay in sync across all components after a Save Changes.
 */
export function useGetCallerProfile() {
  const actor = getBackendActor();
  const { userId, isAuthenticated } = useAuth();
  const query = useQuery<UserPublic | null>({
    queryKey: ["callerProfile", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      // Prefer the caller-based method when available (no userId param needed)
      try {
        const profile = await actor.getCallerUserProfile();
        if (profile) return profile;
      } catch {
        // fallback below
      }
      // Fallback: userId-keyed lookup
      const result = await actor.getCurrentUser(userId);
      if (result.__kind__ === "ok") return result.ok;
      return null;
    },
    enabled: !!actor && isAuthenticated && !!userId,
    refetchInterval: 10_000, // live sync every 10 s
    staleTime: 5_000,
  });
  return { ...query, isLoading: query.isLoading };
}

/**
 * Polls the caller-based wallet balance every 10 seconds.
 */
export function useGetWallet() {
  const actor = getBackendActor();
  const { userId, isAuthenticated } = useAuth();
  const query = useQuery<bigint | null>({
    queryKey: ["wallet", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      // Prefer caller-based getCallerWallet()
      try {
        const balance = await actor.getCallerWallet();
        return balance;
      } catch {
        // fallback to userId variant
      }
      const balance = await actor.getWalletByUserId(userId);
      return balance ?? null;
    },
    enabled: !!actor && isAuthenticated && !!userId,
    refetchInterval: 10_000, // live sync every 10 s
    staleTime: 5_000,
  });
  return { ...query, isLoading: query.isLoading };
}
