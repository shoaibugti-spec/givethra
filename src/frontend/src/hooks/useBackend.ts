import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBackendActor() {
  return useActor(createActor);
}

export function useGetCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const query = useQuery<unknown>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      // Backend does not expose getCallerUserProfile yet;
      // return null so KYC gating defaults to "not approved".
      return null;
    },
    enabled: !!actor && !actorFetching,
  });
  return { ...query, isLoading: actorFetching || query.isLoading };
}
