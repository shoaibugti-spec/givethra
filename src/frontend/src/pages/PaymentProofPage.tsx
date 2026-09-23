import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCaseById, getCaseResolutions, getCasesByIds, getCaseUnlocksByHero } from "@/lib/api";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, FileCheck2, Copy, Check, Loader2, ImageOff } from "lucide-react";
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
  const [downloading, setDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const caseId = useMemo(() => {
    const match = location.pathname.match(/^\/payment-proof\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }, [location.pathname]);

  // Detect file type by extension (query params allowed)
  const isPdf = /\.pdf(\?.*)?$/i.test(proofUrl);

  // Reset image states whenever URL changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [proofUrl]);

  useEffect(() => {
    let active = true;
    if (!user?.id || !caseId) {
      setLoading(false);
      return () => { active = false; };
    }

    Promise.allSettled([
      getCaseById(caseId),
      getCaseResolutions(caseId),
      getCasesByIds([caseId]),
      getCaseUnlocksByHero(user.id),
    ])
      .then((results) => {
        if (!active) return;
        const caseData = results[0].status === "fulfilled" ? results[0].value : null;
        const resolutions = results[1].status === "fulfilled" && Array.isArray(results[1].value) ? results[1].value : [];
        const casesByIds = results[2].status === "fulfilled" && Array.isArray(results[2].value) ? results[2].value : [];
        const unlocks = results[3].status === "fulfilled" && Array.isArray(results[3].value) ? results[3].value : [];

        let url = "";
        let txn = "";

        // Source 1: caseData
        if (caseData) {
          url = caseData.paid_receipt_url || caseData.payment_receipt_url || caseData.payment_proof_url || caseData.receipt_url || "";
          txn = caseData.transaction_id || caseData.reference_number || caseData.consumer_no || caseData.payment_transaction_id || "";
        }
        // Source 2: casesByIds
        if (!url && casesByIds.length > 0) {
          const c = casesByIds[0];
          url = c.payment_receipt_url || c.paid_receipt_url || c.payment_proof_url || c.receipt_url || "";
          if (!txn) txn = c.payment_transaction_id || c.transaction_id || c.reference_number || "";
        }
        // Source 3: resolutions
        if (!url && resolutions.length > 0) {
          const withReceipt = resolutions.find((r: any) => r.receipt_url || r.paid_receipt_url);
          if (withReceipt) {
            url = withReceipt.receipt_url || withReceipt.paid_receipt_url || "";
            if (!txn) txn = withReceipt.transaction_id || "";
          }
        }
        // Source 4: unlocks
        if (!url) {
          const userUnlock = unlocks.find((u: any) => String(u.case_id) === String(caseId));
          if (userUnlock) {
            url = userUnlock.receipt_url || userUnlock.paid_receipt_url || "";
            if (!txn) txn = userUnlock.transaction_id || "";
          }
        }

        setCaseTitle(caseData?.title || casesByIds[0]?.title || "Payment proof");
        setProofUrl(url);
        setTransactionId(txn);
      })
      .catch(() => { if (active) toast.error("Unable to load payment proof."); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [caseId, user?.id]);

  const copyTxn = () => {
    if (!transactionId) return;
    navigator.clipboard.writeText(transactionId);
    setCopied(true);
    toast.success("Transaction ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Download via fetch + blob — stays on same page
  const handleDownload = async () => {
    if (!proofUrl || downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(proofUrl);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const rawName = proofUrl.split("/").pop()?.split("?")[0] || "payment-proof";
      const fileName = rawName.includes(".") ? rawName : `${rawName}.jpg`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      toast.success("Download started!");
    } catch (err) {
      console.error(err);
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-12 text-center">
          <h1 className="text-xl font-bold">Sign in required</h1>
          <Button className="mt-5" onClick={() => navigate({ to: "/sign-in" })}>Sign in</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="mx-auto max-w-4xl px-4 py-5 pb-24">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => navigate({ to: "/my-help" })}>
            <ArrowLeft className="mr-2 h-4 w-4" />Back to My Help
          </Button>
          {proofUrl && (
            <Button variant="outline" onClick={handleDownload} disabled={downloading}>
              {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {downloading ? "Downloading..." : "Download"}
            </Button>
          )}
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
                <p className="font-mono text-sm font-bold text-foreground break-all">{transactionId}</p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 ml-2" onClick={copyTxn}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : proofUrl ? (
            isPdf ? (
              // PDF: iframe, plus a fallback open button (mobile friendly)
              <div className="space-y-2">
                <iframe
                  title="Verified payment proof"
                  src={proofUrl}
                  className="h-[75vh] w-full rounded-xl border bg-white"
                />
                <p className="text-center text-[11px] text-muted-foreground">
                  If the document does not load, tap Download above.
                </p>
              </div>
            ) : (
              // Image: centered, full visible, scales down on mobile
              <div className="flex w-full items-center justify-center rounded-xl border bg-white p-2">
                {imageError ? (
                  <div className="flex flex-col items-center gap-2 py-20 text-sm text-muted-foreground">
                    <ImageOff className="h-8 w-8" />
                    <p>Image could not be loaded.</p>
                    <Button size="sm" variant="outline" onClick={handleDownload}>Try Download</Button>
                  </div>
                ) : (
                  <>
                    {!imageLoaded && (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    <img
                      src={proofUrl}
                      alt="Verified payment proof"
                      onLoad={() => setImageLoaded(true)}
                      onError={() => { setImageError(true); setImageLoaded(true); }}
                      className={`block max-h-[75vh] w-auto max-w-full rounded object-contain ${imageLoaded ? "" : "hidden"}`}
                    />
                  </>
                )}
              </div>
            )
          ) : (
            <div className="py-20 text-center text-sm text-muted-foreground">
              No payment proof is available for this record.
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}
