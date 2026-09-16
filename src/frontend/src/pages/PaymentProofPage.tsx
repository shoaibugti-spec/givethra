import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCaseById, getCaseResolutions, getCasesByIds, getCaseUnlocksByHero } from "@/lib/api";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, ExternalLink, FileCheck2, Copy, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function PaymentProofPage() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [proofUrl, setProofUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [copied, setCopied] = useState(false);
  const [caseTitle, setCaseTitle] = useState("Payment proof");
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const caseId = useMemo(() => {
    const match = location.pathname.match(/^\/payment-proof\/([^/]+)/);
    console.log("🔥 [PaymentProof] URL:", location.pathname);
    console.log("🔥 [PaymentProof] Extracted caseId:", match ? match[1] : "NOT FOUND");
    return match ? decodeURIComponent(match[1]) : "";
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    if (!user?.id || !caseId) {
      setLoading(false);
      console.log("🔥 [PaymentProof] Skipped: user?.id =", user?.id, "caseId =", caseId);
      return () => { active = false; };
    }

    console.log("🔥 [PaymentProof] Starting to load data for caseId:", caseId, "userId:", user.id);

    // 🔥 FIX: Try EVERY possible source
    Promise.allSettled([
      getCaseById(caseId),                 // 0
      getCaseResolutions(caseId),          // 1
      getCasesByIds([caseId]),             // 2
      getCaseUnlocksByHero(user.id),       // 3
    ])
      .then((results) => {
        if (!active) return;

        const caseData = results[0].status === "fulfilled" ? results[0].value : null;
        const resolutions = results[1].status === "fulfilled" && Array.isArray(results[1].value) ? results[1].value : [];
        const casesByIds = results[2].status === "fulfilled" && Array.isArray(results[2].value) ? results[2].value : [];
        const unlocks = results[3].status === "fulfilled" && Array.isArray(results[3].value) ? results[3].value : [];

        console.log("🔥 [PaymentProof] caseData:", caseData);
        console.log("🔥 [PaymentProof] resolutions:", resolutions);
        console.log("🔥 [PaymentProof] casesByIds:", casesByIds);
        console.log("🔥 [PaymentProof] unlocks (this user):", unlocks);

        // 🔥 Try caseData first (broadest)
        let url = "";
        let txn = "";
        let source = "";

        // Source 1: caseData direct fields
        if (caseData) {
          const candidate = caseData.paid_receipt_url || caseData.payment_receipt_url || caseData.payment_proof_url || caseData.receipt_url || "";
          if (candidate) { url = candidate; source = "caseData"; }
          txn = caseData.transaction_id || caseData.reference_number || caseData.consumer_no || caseData.payment_transaction_id || "";
        }

        // Source 2: casesByIds computed column
        if (!url && casesByIds.length > 0) {
          const c = casesByIds[0];
          const candidate = c.payment_receipt_url || c.paid_receipt_url || c.payment_proof_url || c.receipt_url || "";
          if (candidate) { url = candidate; source = "casesByIds"; }
          if (!txn) txn = c.payment_transaction_id || c.transaction_id || c.reference_number || "";
        }

        // Source 3: resolutions
        if (!url && resolutions.length > 0) {
          const withReceipt = resolutions.find((r: any) => r.receipt_url || r.paid_receipt_url);
          if (withReceipt) {
            url = withReceipt.receipt_url || withReceipt.paid_receipt_url || "";
            source = "resolutions";
            if (!txn) txn = withReceipt.transaction_id || "";
          }
        }

        // Source 4: unlocks
        if (!url) {
          const userUnlock = unlocks.find((u: any) => String(u.case_id) === String(caseId));
          if (userUnlock) {
            const candidate = userUnlock.receipt_url || userUnlock.paid_receipt_url || "";
            if (candidate) { url = candidate; source = "unlocks"; }
            if (!txn) txn = userUnlock.transaction_id || "";
          }
        }

        console.log("🔥 [PaymentProof] ✅ FINAL URL:", url, "from source:", source);
        console.log("🔥 [PaymentProof] ✅ FINAL TXN:", txn);

        setCaseTitle(caseData?.title || casesByIds[0]?.title || "Payment proof");
        setProofUrl(url);
        setTransactionId(txn);

        // Build debug info
        const dbg = [
          `caseId: ${caseId}`,
          `caseData keys: ${caseData ? Object.keys(caseData).join(",") : "null"}`,
          `paid_receipt_url: ${caseData?.paid_receipt_url || "empty"}`,
          `payment_receipt_url: ${caseData?.payment_receipt_url || "empty"}`,
          `resolutions count: ${resolutions.length}`,
          `resolutions with receipt: ${resolutions.filter((r:any) => r.receipt_url || r.paid_receipt_url).length}`,
          `unlocks count: ${unlocks.length}`,
          `URL source: ${source || "none"}`,
        ].join("\n");
        setDebugInfo(dbg);
      })
      .catch((err) => {
        console.error("🔥 [PaymentProof] ERROR:", err);
        if (active) toast.error("Unable to load payment proof.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [caseId, user?.id]);

  const copyTxn = () => {
    if (!transactionId) return;
    navigator.clipboard.writeText(transactionId);
    setCopied(true);
    toast.success("Transaction ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return <Layout><div className="mx-auto max-w-xl px-4 py-12 text-center"><h1 className="text-xl font-bold">Sign in required</h1><Button className="mt-5" onClick={() => navigate({ to: "/sign-in" })}>Sign in</Button></div></Layout>;
  }

  return (
    <Layout>
      <main className="mx-auto max-w-4xl px-4 py-5 pb-24">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <Button variant="ghost" onClick={() => navigate({ to: "/my-help" })}>
            <ArrowLeft className="mr-2 h-4 w-4" />Back to My Help
          </Button>
          <div className="flex gap-2">
            {proofUrl && (
              <a href={proofUrl} download target="_blank" rel="noopener noreferrer">
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Download</Button>
              </a>
            )}
          </div>
        </div>

        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3 border-b pb-4">
            <FileCheck2 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-bold">Verified Payment Proof</h1>
              <p className="text-xs text-muted-foreground">{caseTitle}</p>
            </div>
          </div>

          {!loading && proofUrl && transactionId && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Transaction ID / Reference Number
                </p>
                <p className="font-mono text-base font-bold text-foreground truncate">{transactionId}</p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 ml-2" onClick={copyTxn}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                <span className="ml-1.5 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">Loading payment proof...</div>
          ) : proofUrl ? (
            <iframe
              title="Verified payment proof"
              src={proofUrl}
              className="min-h-[70vh] w-full rounded-xl border bg-white"
            />
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground space-y-3">
              <p className="font-medium">No payment proof is available for this record.</p>
              <p className="text-xs">Debug info (please share this with support):</p>
              <pre className="text-left text-[10px] bg-muted/50 p-3 rounded-lg whitespace-pre-wrap max-w-md mx-auto overflow-auto">
                {debugInfo || "No debug info"}
              </pre>
            </div>
          )}

          {proofUrl && (
            <a className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline" href={proofUrl} target="_blank" rel="noopener noreferrer">
              Open original proof <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </section>
      </main>
    </Layout>
  );
}
