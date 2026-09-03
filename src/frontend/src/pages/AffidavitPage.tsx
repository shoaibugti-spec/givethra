import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCaseById, getCaseResolutions } from "@/lib/api";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, ExternalLink, FileText, Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function maskName(value: unknown): string {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Protected participant";
  return parts.length > 1 ? `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.` : parts[0];
}

function maskCnic(value: unknown): string {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `${digits.slice(0, 4)}*********` : "Not disclosed";
}

function maskAccount(value: unknown): string {
  const digits = String(value || "").replace(/\s/g, "");
  return digits ? `****${digits.slice(-4)}` : "Not disclosed";
}

function isVerifiedResolution(resolution: any): boolean {
  const status = String(resolution?.status || "").toLowerCase();
  return ["completed", "approved", "verified", "confirmed", "seeker_confirmed"].includes(status)
    || [1, true, "1", "true", "yes"].includes(resolution?.admin_confirmed)
    || Boolean(resolution?.admin_approved_at || resolution?.approved_at || resolution?.verified_at || resolution?.completed_at || resolution?.admin_confirmed_at);
}

function formatDate(value: unknown): string {
  if (!value) return "Not recorded";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "Not recorded" : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function AffidavitPage() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [resolution, setResolution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const caseId = useMemo(() => {
    const match = location.pathname.match(/^\/affidavit\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    if (!caseId || !user?.id) {
      setLoading(false);
      return () => { active = false; };
    }
    Promise.all([getCaseById(caseId), getCaseResolutions(caseId, user.id)])
      .then(([nextCase, resolutions]) => {
        if (!active) return;
        const verified = (Array.isArray(resolutions) ? resolutions : []).find(isVerifiedResolution);
        setCaseData(nextCase);
        setResolution(verified || null);
      })
      .catch((error) => {
        if (active) toast.error(error instanceof Error ? error.message : "Unable to load affidavit");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [caseId, user?.id]);

  if (!isAuthenticated) {
    return <Layout><div className="mx-auto max-w-xl px-4 py-12 text-center"><h1 className="text-xl font-bold">Sign in required</h1><p className="mt-2 text-sm text-muted-foreground">Please sign in to view a verified affidavit.</p><Button className="mt-5" onClick={() => navigate({ to: "/sign-in" })}>Sign in</Button></div></Layout>;
  }

  const data = resolution || {};
  const title = caseData?.title || data.case_title || "Completed assistance";
  const category = caseData?.category || data.case_category || "Community assistance";
  const currency = caseData?.currency || data.currency || "USD";
  const amount = data.seeker_confirmed_amount ?? data.amount_paid ?? data.amount ?? caseData?.amount_collected ?? caseData?.amount_needed ?? "Not recorded";
  const verificationCode = String(data.verification_security_code || data.security_code || data.id || caseId).slice(-16).toUpperCase();
  const receiptUrl = data.receipt_url || data.paid_receipt_url || caseData?.paid_receipt_url || "";

  return (
    <Layout>
      <main className="mx-auto max-w-3xl px-4 py-6 pb-24">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={() => navigate({ to: `/cases/${caseId}` as "/" })}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print / Save PDF</Button>
        </div>
        {loading ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">Loading verified affidavit...</div>
        ) : !resolution || !isVerifiedResolution(resolution) ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
            <FileText className="mx-auto h-10 w-10 text-amber-600" />
            <h1 className="mt-3 text-xl font-bold">Affidavit not available</h1>
            <p className="mt-2 text-sm text-muted-foreground">This case does not have an approved, digitally verified assistance record yet.</p>
          </div>
        ) : (
          <article className="rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-sm md:p-10">
            <header className="border-b border-border pb-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><FileText className="h-6 w-6" /></div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-primary">Givethra</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">DIGITALLY VERIFIED AFFIDAVIT</h1>
              <p className="mt-2 text-sm text-muted-foreground">Official record of completed assistance</p>
            </header>

            <section className="mt-7 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">Case Information</h2>
              <div className="grid gap-3 rounded-2xl bg-muted/30 p-4 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">Case ID:</span> <span className="font-mono">{caseId}</span></p>
                <p><span className="text-muted-foreground">Category:</span> {category}</p>
                <p className="sm:col-span-2"><span className="text-muted-foreground">Title:</span> {title}</p>
              </div>
            </section>

            <section className="mt-7 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">Protected Participants</h2>
              <div className="grid gap-3 rounded-2xl border border-border p-4 text-sm sm:grid-cols-2">
                <div><p className="font-semibold">Requester</p><p className="mt-1">{maskName(data.seeker_name || caseData?.user_name)}</p><p className="font-mono text-xs text-muted-foreground">CNIC: {maskCnic(data.seeker_cnic_number || data.seeker_cnic)}</p></div>
                <div><p className="font-semibold">Hero</p><p className="mt-1">{maskName(data.hero_name || user?.fullName)}</p><p className="font-mono text-xs text-muted-foreground">CNIC: {maskCnic(data.hero_cnic_number || data.hero_cnic)}</p></div>
              </div>
            </section>

            <section className="mt-7 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">Assistance Details</h2>
              <div className="grid gap-3 rounded-2xl bg-muted/30 p-4 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">Help type:</span> {data.paid_to === "givethra" ? "Contribution" : "Direct Help"}</p>
                <p><span className="text-muted-foreground">Amount settled:</span> {amount} {currency}</p>
                <p><span className="text-muted-foreground">Transaction:</span> <span className="font-mono">{data.transaction_id || "Not recorded"}</span></p>
                <p><span className="text-muted-foreground">Payment method:</span> {data.payment_method || caseData?.payment_method || "Not recorded"}</p>
                <p><span className="text-muted-foreground">Verification date:</span> {formatDate(data.reviewed_at || data.admin_confirmed_at || data.completed_at || data.submitted_at)}</p>
                <p><span className="text-muted-foreground">Account:</span> {maskAccount(caseData?.account_number || caseData?.account_iban)}</p>
              </div>
              {receiptUrl && <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ExternalLink className="h-4 w-4" />View payment evidence</a>}
            </section>

            <section className="mt-7 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900 dark:border-teal-900/50 dark:bg-teal-950/20 dark:text-teal-100">
              <p className="flex items-start gap-2 font-medium"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />Audit guarantee</p>
              <p className="mt-2 leading-relaxed">This digitally generated affidavit records a verified assistance event. Personal identifiers are intentionally masked. Full source records remain protected within Givethra and may be disclosed only through an authorized audit or dispute process.</p>
              <p className="mt-3 font-mono text-xs">Verification security code: {verificationCode}</p>
            </section>

            <footer className="mt-8 border-t border-border pt-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Givethra. All rights reserved.</footer>
          </article>
        )}
      </main>
    </Layout>
  );
}

export { maskName, maskCnic, maskAccount };
