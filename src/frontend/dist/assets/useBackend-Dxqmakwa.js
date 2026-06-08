import { g as getBackendActor } from "./index-C7ZxjHlS.js";
import { u as useQuery } from "./useQuery-Cb3pY6Kz.js";
function useBackendActor() {
  return { actor: getBackendActor(), isFetching: false };
}
function useGetCallerProfile() {
  const actor = getBackendActor();
  const query = useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return null;
    },
    enabled: !!actor
  });
  return { ...query, isLoading: query.isLoading };
}
export {
  useGetCallerProfile as a,
  useBackendActor as u
};
