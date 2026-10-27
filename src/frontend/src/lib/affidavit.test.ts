// src/frontend/src/pages/AffidavitPage.tsx
// Role-aware affidavit:
//   - Hero (contribution OR direct help): their own verified help on this case
//   - Requester (help seeker): every verified help received on their case, with totals
//   - Admin: the same full view as the requester
// All rules live in "@/lib/affidavit" so My Help / My Cases / this page always agree.

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCaseById,
  getCaseResolutions,
  getCaseResolutionsByHero,
  getCaseUnlocksByHero,
  getCasesByUser,
} from "@/lib/api";
import { buildAffidavit, caseOwnerIds } from "@/lib/affidavit";
import type { AffidavitDoc, AffidavitRole } from "@/lib/affidavit";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, ExternalLink, FileText, Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function maskName(value: unknown): string {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Protected participant";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
}

function maskCnic(value: unknown): string {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `${digits.slice(0, 4)}*********` : "Not disclosed";
}

function maskAccount(value: unknown): string {
  const digits = String(value || "").replace(/\s/g, "");
  return digits ? `****${digits.slice(-4)}` : "Not disclosed";
}

function formatDate(value: unknown): string {
  if (!value) return "Not recorded";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "Not recorded"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function formatAmount(amount: number | null, currency: string): string {
  return amount === null ? "Not recorded" : `${amount.toLocaleString()} ${currency}`;
}

const ROLE_LABEL: Record<AffidavitRole, string> = {
  hero: "HERO",
  seeker: "REQUESTER",
  admin: "ADMIN COPY",
};

function declaration(doc: AffidavitDoc): string {
  const n = doc.entries.length;
  if (doc.role === "hero") {
    return doc.entries.every((e) => e.kind === "contribution")
      ? "This affidavit records your verified contribution toward the case above. Your contribution was received and verified by Givethra and helped fund this case."
      : "This affidavit records the verified assistance you provided to the case above. The payment was confirmed through Givethra's verification process.";
  }
  return `This affidavit records ${n === 1 ? "one verified assistance" : `${n} verified assistances`} received for the case above${
    n > 1 ? ", with the combined total shown below" : ""
  }. Each payment was confirmed through Givethra's verification process.`;
}

export default function AffidavitPage() {
  const { user, isAuthenticated, isInitializing, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<AffidavitDoc | null>(null);
  const [role, setRole] = useState<AffidavitRole>("hero");
  const [loading, setLoading] = useState(true);

  const caseId = useMemo(() => {
    const match = location.pathname.match(/^\/affidavit\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }, [location.pathname]);

  useEffect(() => {
    // Wait for sign-in state to finish loading, otherwise a page refresh shows "Sign in required".
    if (isInitializing) return;
    if (!isAuthenticated || !user?.id || !caseId) {
      setLoading(false);
      return;
    }

    let active = true;
    const uid = String(user.id);
    setLoading(true);

    (async () => {
      try {
        const [caseRes, ownCasesRes, unlocksRes, heroRes, heroCaseRes] = await Promise.allSettled([
          getCaseById(caseId),
          getCasesByUser(uid),
          getCaseUnlocksByHero(uid),
          getCaseResolutionsByHero(uid),
          getCaseResolutions(caseId, uid),
        ]);

        const caseData = caseRes.status === "fulfilled" ? caseRes.value : null;
        const ownCases = ownCasesRes.status === "fulfilled" && Array.isArray(ownCasesRes.value) ? ownCasesRes.value : [];
        const unlocks = unlocksRes.status === "fulfilled" && Array.isArray(unlocksRes.value) ? unlocksRes.value : [];
        const heroRows = heroRes.status === "fulfilled" && Array.isArray(heroRes.value) ? heroRes.value : [];
        const heroCaseRows =
          heroCaseRes.status === "fulfilled" && Array.isArray(heroCaseRes.value) ? heroCaseRes.value : [];

        const ownsCase =
          caseOwnerIds(caseData).includes(uid) || ownCases.some((c: any) => String(c?.id) === String(caseId));
        const nextRole: AffidavitRole = isAdmin ? "admin" : ownsCase ? "seeker" : "hero";

        let resolutions: any[];
        if (nextRole === "hero") {
          resolutions = [...heroRows.filter((r: any) => String(r?.case_id) === String(caseId)), ...heroCaseRows];
        } else {
          // Requester/admin need every helper on the case, not just one.
          const all = await getCaseResolutions(caseId).catch(() => []);
          resolutions = Array.isArray(all) ? all : [];
        }

        if (!active) return;
        setRole(nextRole);
        setDoc(
          buildAffidavit({
            caseId,
            caseData,
            resolutions,
            unlocks,
            user: { id: uid, fullName: user.fullName },
            role: nextRole,
          })
        );
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Unable to load affidavit");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [caseId, user?.id, user?.fullName, isAuthenticated, isInitializing, isAdmin]);

  if (isInitializing) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-12 text-center text-sm text-muted-foreground">Loading...</div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-12 text-center">
          <h1 className="text-xl font-bold">Sign in required</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please sign in to view a verified affidavit.</p>
          <Button className="mt-5" onClick={() => navigate({ to: "/sign-in" })}>
            Sign in
          </Button>
        </div>
      </Layout>
    );
  }

  const goBack = () => {
    if (role === "hero") navigate({ to: "/my-help" });
    else navigate({ to: "/cases/$id", params: { id: caseId } });
  };

  return (
    <Layout>
      <main className="mx-auto max-w-3xl px-4 py-6 pb-24">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {role === "hero" ? "Back to My Help" : "Back to case"}
          </Button>
          <Button variant="outline" onClick={() => window.print()} disabled={!doc}>
            <Printer className="mr-2 h-4 w-4" />
            Print / Save PDF
          </Button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Loading verified affidavit...
          </div>
        ) : !doc ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
            <FileText className="mx-auto h-10 w-10 text-amber-600" />
            <h1 className="mt-3 text-xl font-bold">Affidavit not available</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {role === "hero"
                ? "You don't have an approved, digitally verified assistance record on this case yet."
                : "This case does not have an approved, digitally verified assistance record yet."}
            </p>
          </div>
        ) : (
          <article className="rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-sm md:p-10">
            <header className="border-b border-border pb-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-primary">Givethra</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">
                DIGITALLY VERIFIED AFFIDAVIT — {ROLE_LABEL[doc.role]}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">Official record of completed assistance</p>
            </header>

            <section className="mt-7 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">Case Information</h2>
              <div className="grid gap-3 rounded-2xl bg-muted/30 p-4 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Case ID:</span> <span className="font-mono break-all">{doc.caseId}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Category:</span> {doc.category}
                </p>
                <p className="sm:col-span-2">
                  <span className="text-muted-foreground">Title:</span> {doc.title}
                </p>
              </div>
            </section>

            <section className="mt-7 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">Protected Participants</h2>
              <div className="grid gap-3 rounded-2xl border border-border p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="font-semibold">Requester</p>
                  <p className="mt-1">{maskName(doc.seekerName)}</p>
                  <p className="font-mono text-xs text-muted-foreground">CNIC: {maskCnic(doc.seekerCnic)}</p>
                  {doc.accountNumber && (
                    <p className="font-mono text-xs text-muted-foreground">Account: {maskAccount(doc.accountNumber)}</p>
                  )}
                </div>
                {doc.role === "hero" ? (
                  <div>
                    <p className="font-semibold">Hero</p>
                    <p className="mt-1">{maskName(doc.entries[0].heroName || user?.fullName)}</p>
                    <p className="font-mono text-xs text-muted-foreground">CNIC: {maskCnic(doc.entries[0].heroCnic)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">{doc.entries.length === 1 ? "Hero" : "Heroes"}</p>
                    <p className="mt-1">
                      {doc.entries.length === 1
                        ? maskName(doc.entries[0].heroName)
                        : `${doc.entries.length} verified helpers`}
                    </p>
                    {doc.entries.length === 1 && (
                      <p className="font-mono text-xs text-muted-foreground">CNIC: {maskCnic(doc.entries[0].heroCnic)}</p>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="mt-7 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">Assistance Details</h2>

              {doc.entries.map((e, i) => (
                <div key={e.key} className="space-y-3 rounded-2xl bg-muted/30 p-4 text-sm">
                  {doc.entries.length > 1 && (
                    <p className="font-semibold">
                      {doc.role === "hero" ? `Payment ${i + 1}` : `Helper ${i + 1}: ${maskName(e.heroName)}`}
                    </p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <p>
                      <span className="text-muted-foreground">Help type:</span>{" "}
                      {e.kind === "contribution" ? "Contribution" : "Direct Help"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Amount settled:</span> {formatAmount(e.amount, doc.currency)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Transaction:</span>{" "}
                      <span className="font-mono break-all">{e.transactionId || "Not recorded"}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Payment method:</span> {e.paymentMethod || "Not recorded"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Verification date:</span> {formatDate(e.verifiedAt)}
                    </p>
                    {doc.entries.length > 1 && (
                      <p>
                        <span className="text-muted-foreground">Record code:</span> <span className="font-mono">{e.code}</span>
                      </p>
                    )}
                  </div>
                  {e.receiptUrl && (
                    <a
                      href={e.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline print:hidden"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View payment evidence
                    </a>
                  )}
                </div>
              ))}

              {doc.entries.length > 1 && doc.hasAmount && (
                <p className="rounded-2xl border border-border p-4 text-sm font-semibold">
                  Total verified: {doc.totalAmount.toLocaleString()} {doc.currency}
                </p>
              )}
            </section>

            <section className="mt-7 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900 dark:border-teal-900/50 dark:bg-teal-950/20 dark:text-teal-100">
              <p className="flex items-start gap-2 font-medium">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                Audit guarantee
              </p>
              <p className="mt-2 leading-relaxed">{declaration(doc)}</p>
              <p className="mt-2 leading-relaxed">
                This digitally generated affidavit records a verified assistance event. Personal identifiers are
                intentionally masked. Full source records remain protected within Givethra and may be disclosed only
                through an authorized audit or dispute process.
              </p>
              <p className="mt-3 font-mono text-xs">Verification security code: {doc.code}</p>
            </section>

            <footer className="mt-8 border-t border-border pt-5 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Givethra. All rights reserved.
            </footer>
          </article>
        )}
      </main>
    </Layout>
  );
}

export { maskName, maskCnic, maskAccount };
