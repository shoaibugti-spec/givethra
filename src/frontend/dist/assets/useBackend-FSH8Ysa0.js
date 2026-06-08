import { u as useActor, a as useQuery, c as createActor } from "./backend-B2Q1poOu.js";
import "./index-BoYH-a4m.js";
function useBackendActor() {
  return useActor(createActor);
}
function useGetCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const query = useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return null;
    },
    enabled: !!actor && !actorFetching
  });
  return { ...query, isLoading: actorFetching || query.isLoading };
}
export {
  useGetCallerProfile as a,
  useBackendActor as u
};
