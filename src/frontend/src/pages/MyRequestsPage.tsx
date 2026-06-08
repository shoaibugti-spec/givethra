import type { CaseSummary, VerificationStatus } from "@/backend";
import { CategoryPill } from "@/components/CategoryPill";
import Layout from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { VerificationBadge } from "@/components/VerificationBadge";
import type { VerificationLevel } from "@/components/VerificationBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBackendActor } from "@/hooks/useBackend";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

function toVerifLevel(v: VerificationStatus): VerificationLevel {
  if (v === "InstitutionVerified") return "institution_verified";
  if (v === "DocumentsSubmitted") return "documents_submitted";
  return "unverified";
}

export default function MyRequestsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    actor
      .listCases(null, { offset: BigInt(0), limit: BigInt(50) })
      .then(setCases)
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, [actor, isFetching]);

  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              My Requests
            </h1>
            <p className="text-muted-foreground mt-1">
              Track the status of your submitted help requests.
            </p>
          </div>
          <Button
            data-ocid="my_requests.submit_button"
            onClick={() => navigate({ to: "/submit-request" })}
            className="gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>

        {loading ? (
          <div
            className="flex justify-center py-20"
            data-ocid="my_requests.loading_state"
          >
            <LoadingSpinner label="Loading requests..." />
          </div>
        ) : cases.length === 0 ? (
          <div
            data-ocid="my_requests.empty_state"
            className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-20 text-center space-y-4"
          >
            <p className="text-muted-foreground">
              You haven&apos;t submitted any requests yet.
            </p>
            <Button
              onClick={() => navigate({ to: "/submit-request" })}
              data-ocid="my_requests.empty_submit_button"
            >
              Submit your first request
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((req, i) => (
              <div
                key={String(req.id)}
                data-ocid={`my_requests.item.${i + 1}`}
                className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <VerificationBadge
                      level={toVerifLevel(req.verificationStatus)}
                    />
                    <CategoryPill category={req.category} />
                  </div>
                  <h3 className="font-display font-semibold text-foreground truncate">
                    {req.title}
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    {req.city}, {req.country} &middot; $
                    {(Number(req.amountNeeded) / 100).toLocaleString()} needed
                  </div>
                </div>
                <Link to="/cases/$id" params={{ id: String(req.id) }}>
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid={`my_requests.view_button.${i + 1}`}
                  >
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
