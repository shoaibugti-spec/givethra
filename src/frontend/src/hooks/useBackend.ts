import { getBackendActor } from "@/lib/actor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBackendActor() {
  return { actor: getBackendActor(), isFetching: false };
}

export function useGetCallerProfile() {
  const actor = getBackendActor();
  const query = useQuery<unknown>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      // Backend does not expose getCallerUserProfile yet;
      // return null so KYC gating defaults to "not approved".
      return null;
    },
    enabled: !!actor,
  });
  return { ...query, isLoading: query.isLoading };
}
