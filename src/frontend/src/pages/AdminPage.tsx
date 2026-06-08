import type { CasePublic, SupportProofPublic, UserPublic } from "@/backend";
import { ReviewStatus, VerificationStatus } from "@/backend";
import Layout from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { VerificationBadge } from "@/components/VerificationBadge";
import type { VerificationLevel } from "@/components/VerificationBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useBackendActor } from "@/hooks/useBackend";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Shield, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function toVerifLevel(v: VerificationStatus): VerificationLevel {
  if (v === "InstitutionVerified") return "institution_verified";
  if (v === "DocumentsSubmitted") return "documents_submitted";
  return "unverified";
}

export default function AdminPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const [cases, setCases] = useState<CasePublic[]>([]);
  const [proofs, setProofs] = useState<SupportProofPublic[]>([]);
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    Promise.all([
      actor.getAllCases(),
      actor.getAllProofs(),
      actor.getAllUsers(),
    ])
      .then(([c, p, u]) => {
        setCases(c);
        setProofs(p);
        setUsers(u);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [actor, isFetching]);

  const updateVerif = async (caseId: bigint, status: VerificationStatus) => {
    if (!actor) return;
    try {
      await actor.updateVerificationStatus(caseId, status);
      setCases(
        (prev) =>
          prev.map((c) =>
            c.id === caseId ? { ...c, verificationStatus: status } : c,
          ) as CasePublic[],
      );
      toast.success("Verification status updated.");
    } catch {
      toast.error("Failed to update verification.");
    }
  };

  const updateProof = async (proofId: bigint, status: ReviewStatus) => {
    if (!actor) return;
    try {
      await actor.updateProofStatus(proofId, status, null);
      setProofs((prev) =>
        prev.map((p) => (p.id === proofId ? { ...p, status } : p)),
      );
      toast.success("Proof status updated.");
    } catch {
      toast.error("Failed to update proof.");
    }
  };

  const suspendUser = async (userId: UserPublic["id"]) => {
    if (!actor) return;
    try {
      await actor.suspendUser(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: false } : u)),
      );
      toast.success("User suspended.");
    } catch {
      toast.error("Failed to suspend user.");
    }
  };

  const banUser = async (userId: UserPublic["id"]) => {
    if (!actor) return;
    try {
      await actor.banUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User banned.");
    } catch {
      toast.error("Failed to ban user.");
    }
  };

  if (!isAuthenticated || !isAdmin) {
    navigate({ to: "/" });
    return null;
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground">
            Admin Panel
          </h1>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Users",
              value: users.length,
              ocid: "admin.users_card",
            },
            {
              label: "Total Cases",
              value: cases.length,
              ocid: "admin.pending_cases_card",
            },
            {
              label: "Support Proofs",
              value: proofs.length,
              ocid: "admin.proofs_card",
            },
          ].map(({ label, value, ocid }) => (
            <div
              key={label}
              data-ocid={ocid}
              className="rounded-xl border border-border bg-card p-5 space-y-1"
            >
              <div className="text-3xl font-display font-bold text-foreground">
                {value}
              </div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div
            className="flex justify-center py-20"
            data-ocid="admin.loading_state"
          >
            <LoadingSpinner label="Loading admin data..." />
          </div>
        ) : (
          <Tabs defaultValue="cases" data-ocid="admin.tabs">
            <TabsList>
              <TabsTrigger value="cases" data-ocid="admin.cases_tab">
                Cases ({cases.length})
              </TabsTrigger>
              <TabsTrigger value="proofs" data-ocid="admin.proofs_tab">
                Proofs ({proofs.length})
              </TabsTrigger>
              <TabsTrigger value="users" data-ocid="admin.users_tab">
                Users ({users.length})
              </TabsTrigger>
            </TabsList>

            {/* Cases tab */}
            <TabsContent value="cases" className="space-y-3 mt-4">
              {cases.length === 0 ? (
                <div
                  data-ocid="admin.cases_empty_state"
                  className="text-center py-12 text-muted-foreground"
                >
                  No cases yet.
                </div>
              ) : (
                cases.map((c, i) => (
                  <div
                    key={String(c.id)}
                    data-ocid={`admin.case.item.${i + 1}`}
                    className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <VerificationBadge
                          level={toVerifLevel(c.verificationStatus)}
                          size="sm"
                        />
                      </div>
                      <p className="font-medium text-foreground truncate">
                        {c.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.city}, {c.country} &middot; {c.category}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`admin.verify_case_button.${i + 1}`}
                        onClick={() =>
                          updateVerif(
                            c.id,
                            VerificationStatus.DocumentsSubmitted,
                          )
                        }
                      >
                        Docs
                      </Button>
                      <Button
                        size="sm"
                        data-ocid={`admin.institution_verify_button.${i + 1}`}
                        onClick={() =>
                          updateVerif(
                            c.id,
                            VerificationStatus.InstitutionVerified,
                          )
                        }
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Verify
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Proofs tab */}
            <TabsContent value="proofs" className="space-y-3 mt-4">
              {proofs.length === 0 ? (
                <div
                  data-ocid="admin.proofs_empty_state"
                  className="text-center py-12 text-muted-foreground"
                >
                  No support proofs yet.
                </div>
              ) : (
                proofs.map((p, i) => (
                  <div
                    key={String(p.id)}
                    data-ocid={`admin.proof.item.${i + 1}`}
                    className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            p.status === "Approved"
                              ? "default"
                              : p.status === "Rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {p.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Case #{String(p.caseId)} &middot;{" "}
                        {p.referenceNumber ?? "No ref"}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`admin.approve_proof_button.${i + 1}`}
                        onClick={() => updateProof(p.id, ReviewStatus.Approved)}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`admin.reject_proof_button.${i + 1}`}
                        onClick={() => updateProof(p.id, ReviewStatus.Rejected)}
                        className="text-destructive border-destructive/40 hover:bg-destructive/10"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Users tab */}
            <TabsContent value="users" className="space-y-3 mt-4">
              {users.length === 0 ? (
                <div
                  data-ocid="admin.users_empty_state"
                  className="text-center py-12 text-muted-foreground"
                >
                  No users yet.
                </div>
              ) : (
                users.map((u, i) => (
                  <div
                    key={String(u.id)}
                    data-ocid={`admin.user.item.${i + 1}`}
                    className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="font-medium text-foreground">
                        {u.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u.email} &middot; {u.role} &middot; {u.country}
                      </p>
                      <Badge
                        variant={u.isActive ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`admin.suspend_user_button.${i + 1}`}
                        onClick={() => suspendUser(u.id)}
                        disabled={!u.isActive}
                      >
                        Suspend
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`admin.ban_user_button.${i + 1}`}
                        onClick={() => banUser(u.id)}
                        className="text-destructive border-destructive/40 hover:bg-destructive/10"
                      >
                        Ban
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
