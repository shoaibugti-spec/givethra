import type { CaseSummary, ReviewStatus, SupportProofPublic } from "@/backend";
import { CategoryPill } from "@/components/CategoryPill";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useBackendActor } from "@/hooks/useBackend";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  HandHeart,
  MapPin,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SupportFilter =
  | "all"
  | "Submitted"
  | "UnderReview"
  | "Approved"
  | "Completed";

interface SupportedCase {
  case: CaseSummary;
  proof: SupportProofPublic;
}

const FILTERS: { label: string; value: SupportFilter }[] = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "Submitted" },
  { label: "Under Review", value: "UnderReview" },
  { label: "Approved", value: "Approved" },
  { label: "Completed", value: "Completed" },
];

function proofStatusLabel(status: SupportFilter | ReviewStatus): string {
  if (status === "UnderReview") return "Under Review";
  return status as string;
}

function ProofStatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<
    ReviewStatus,
    { className: string; icon: React.ReactNode }
  > = {
    Submitted: {
      className: "bg-primary/10 text-primary border-primary/20",
      icon: <Clock className="h-3 w-3" />,
    },
    UnderReview: {
      className:
        "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
      icon: <Clock className="h-3 w-3" />,
    },
    Approved: {
      className:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    Completed: {
      className:
        "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700",
      icon: <ShieldCheck className="h-3 w-3" />,
    },
    Rejected: {
      className:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
      icon: <XCircle className="h-3 w-3" />,
    },
  };
  const { className, icon } = map[status] ?? map.Submitted;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {icon}
      {proofStatusLabel(status)}
    </span>
  );
}

function VerifStatusBadge({ status }: { status: string }) {
  if (status === "InstitutionVerified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        <ShieldCheck className="h-3 w-3" />
        Verified
      </span>
    );
  }
  if (status === "DocumentsSubmitted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        <Clock className="h-3 w-3" />
        Docs Submitted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      Unverified
    </span>
  );
}

function SupportCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

export default function MySupportsPage() {
  const { isAuthenticated, isHero, role } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const [supports, setSupports] = useState<SupportedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SupportFilter>("all");

  useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    Promise.all([actor.getMySupportedCases(), actor.getMyProofs()])
      .then(([cases, proofs]) => {
        const proofMap = new Map<string, SupportProofPublic>();
        for (const p of proofs) {
          const key = String(p.caseId);
          // Keep the most recent proof per case
          const existing = proofMap.get(key);
          if (!existing || p.createdAt > existing.createdAt) {
            proofMap.set(key, p);
          }
        }
        const merged: SupportedCase[] = cases
          .map((c) => {
            const proof = proofMap.get(String(c.id));
            return proof ? { case: c, proof } : null;
          })
          .filter((x): x is SupportedCase => x !== null);
        setSupports(merged);
      })
      .catch(() => setSupports([]))
      .finally(() => setLoading(false));
  }, [actor, isFetching]);

  const filtered = useMemo(() => {
    if (filter === "all") return supports;
    return supports.filter((s) => s.proof.status === filter);
  }, [supports, filter]);

  const countFor = (v: SupportFilter) =>
    v === "all"
      ? supports.length
      : supports.filter((s) => s.proof.status === v).length;

  const formatDate = (ts: bigint) =>
    new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }

  if (role && !isHero) {
    return (
      <Layout>
        <div
          className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6"
          data-ocid="my_supports.role_prompt"
        >
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <HandHeart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            This page is for Heroes
          </h1>
          <p className="text-muted-foreground">
            Switch to Hero role to support cases and track your contributions.
          </p>
          <Button
            data-ocid="my_supports.switch_role_button"
            onClick={() => navigate({ to: "/onboarding" })}
          >
            Switch to Hero Role
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:py-10 space-y-6">
        <div data-ocid="my_supports.page">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            My Supports
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cases you have supported as a Hero.
          </p>
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0"
          data-ocid="my_supports.filter.tab"
        >
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              data-ocid={`my_supports.filter.${value}`}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors duration-200 ${
                filter === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {label}
              <span className="ml-1 text-xs opacity-70">
                ({countFor(value)})
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3" data-ocid="my_supports.loading_state">
            {[1, 2, 3].map((i) => (
              <SupportCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="my_supports.empty_state"
            className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-20 text-center space-y-4"
          >
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto">
              <HandHeart className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                {filter === "all"
                  ? "No supported cases yet."
                  : `No ${proofStatusLabel(filter)} cases.`}
              </p>
              <p className="text-sm text-muted-foreground">
                Browse cases to start supporting.
              </p>
            </div>
            <Link to="/cases">
              <Button data-ocid="my_supports.browse_button">
                Browse Verified Cases
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3" data-ocid="my_supports.list">
            {filtered.map(({ case: c, proof }, i) => (
              <Link
                key={String(c.id)}
                to="/cases/$id"
                params={{ id: String(c.id) }}
                data-ocid={`my_supports.item.${i + 1}`}
                className="block rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-display font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {c.city}, {c.country}
                      </span>
                    </div>
                  </div>
                  <ProofStatusBadge status={proof.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CategoryPill category={String(c.category)} size="xs" />
                  <VerifStatusBadge status={String(c.verificationStatus)} />
                  <span className="ml-auto text-xs text-muted-foreground">
                    Supported {formatDate(proof.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
