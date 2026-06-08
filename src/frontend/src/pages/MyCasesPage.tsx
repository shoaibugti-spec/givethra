import type {
  CaseSummary,
  HelpSeekerStatsPublic,
  VerificationStatus,
} from "@/backend";
import { CategoryPill } from "@/components/CategoryPill";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useBackendActor } from "@/hooks/useBackend";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

function verifStyle(v: VerificationStatus): {
  label: string;
  className: string;
} {
  if (v === "InstitutionVerified")
    return {
      label: "Institution Verified",
      className:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    };
  if (v === "DocumentsSubmitted")
    return {
      label: "Docs Submitted",
      className: "bg-primary/10 text-primary border-primary/20",
    };
  return {
    label: "Unverified",
    className: "bg-muted text-muted-foreground border-border",
  };
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-card p-3 text-center min-w-0">
      <div className="flex justify-center text-primary mb-1">{icon}</div>
      <div className="font-display text-xl font-bold text-foreground">
        {value}
      </div>
      <div className="text-xs text-muted-foreground leading-tight mt-0.5">
        {label}
      </div>
    </div>
  );
}

function CaseSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex justify-between gap-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export default function MyCasesPage() {
  const { isAuthenticated, isHelpSeeker, role } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [stats, setStats] = useState<HelpSeekerStatsPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    Promise.all([
      // getMySupportedCases returns cases the user has a proof for;
      // for a Help Seeker this also shows their own submitted cases
      actor
        .getMySupportedCases("")
        .catch((): CaseSummary[] => []),
      actor.getCallerUserProfile().catch(() => null),
    ])
      .then(([myCases, profile]) => {
        setCases(myCases);
        if (profile) {
          actor
            .getHelpSeekerStats(profile.id)
            .then((s) => setStats(s ?? null))
            .catch(() => setStats(null));
        }
      })
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, [actor, isFetching]);

  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }

  if (role && !isHelpSeeker) {
    return (
      <Layout>
        <div
          className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6"
          data-ocid="my_cases.role_prompt"
        >
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            This page is for Help Seekers
          </h1>
          <p className="text-muted-foreground">
            Switch to Help Seeker role to manage your submitted cases and track
            support progress.
          </p>
          <Button
            data-ocid="my_cases.switch_role_button"
            onClick={() => navigate({ to: "/onboarding" })}
          >
            Switch to Help Seeker Role
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:py-10 space-y-6">
        {/* Header */}
        <div data-ocid="my_cases.page">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            My Cases
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your unlocked cases and submitted requests.
          </p>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="flex gap-3" data-ocid="my_cases.stats">
            <StatCard
              label="Submitted"
              value={Number(stats.requestsSubmitted)}
              icon={<Clock className="h-4 w-4" />}
            />
            <StatCard
              label="Approved"
              value={Number(stats.requestsApproved)}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <StatCard
              label="Completed"
              value={Number(stats.requestsCompleted)}
              icon={<ShieldCheck className="h-4 w-4" />}
            />
          </div>
        )}

        {/* Cases list */}
        {loading ? (
          <div className="space-y-3" data-ocid="my_cases.loading_state">
            {[1, 2, 3].map((i) => (
              <CaseSkeleton key={i} />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div
            data-ocid="my_cases.empty_state"
            className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-20 text-center space-y-4"
          >
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto">
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                No unlocked cases yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Unlock a case to see full details and connect with supporters.
              </p>
            </div>
            <Link to="/cases">
              <Button data-ocid="my_cases.browse_button">Browse Cases</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3" data-ocid="my_cases.list">
            {cases.map((c, i) => {
              const { label, className } = verifStyle(c.verificationStatus);
              const amountUsd = Number(c.amountNeeded) / 100;
              return (
                <Link
                  key={String(c.id)}
                  to="/cases/$id"
                  params={{ id: String(c.id) }}
                  data-ocid={`my_cases.item.${i + 1}`}
                  className="flex items-stretch rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200 group overflow-hidden"
                >
                  <div className="flex-1 p-4 space-y-3 min-w-0">
                    {/* Title + status badge */}
                    <div className="flex items-start gap-2">
                      <h3 className="flex-1 min-w-0 font-display font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {c.title}
                      </h3>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
                      >
                        {label}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {c.city}, {c.country}
                      </span>
                    </div>

                    {/* Category + amount */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <CategoryPill category={String(c.category)} size="xs" />
                      <span className="text-xs font-semibold text-foreground ml-auto">
                        ${amountUsd.toLocaleString()} needed
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <Progress value={0} className="h-1.5" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Awaiting supporters
                        </span>
                        <span>0% funded</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center px-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
