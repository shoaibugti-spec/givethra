import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCaseById, getCaseResolutions } from "@/lib/api";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Download, ExternalLink, FileCheck2, Copy, Check, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PaymentProofPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 🔥 Use useParams for reliable caseId extraction
  const { caseId } = useParams({ from: "/payment-proof/$caseId" });

  const [proofUrl, setProofUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [copied, setCopied] = useState(false);
  const [caseTitle, setCaseTitle] = useState("Payment proof");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user?.id || !caseId) {
      setLoading(false);
      return () => { active = false; };
    }

    // 🔥 Use Promise.all like the OLD working version
    Promise.all([getCaseById(caseId), getCaseResolutions(caseId)])
      .then(([caseData, resolutions]) => {
        if (!active) return;

        // 🔥 OLD WORKING LOGIC - extract from completed resolutions
        const completed = (Array.isArray(resolutions) ? resolutions : [])
          .filter((r: any) => r.receipt_url || r.paid_receipt_url);

        const url =
          completed[0]?.receipt_url ||
          completed[0]?.paid_receipt_url ||
          caseData?.paid_receipt_url ||
          "";

        // 🔥 Extract TXN number from all possible sources
        const txnId =
          completed[0]?.transaction_id ||
          caseData?.transaction_id ||
          caseData?.reference_number ||
          caseData?.consumer_no ||
          caseData?.payment_transaction_id ||
          "";

        setCaseTitle(caseData?.title || "Payment proof");
        setProofUrl(url);
        setTransactionId(txnId);

        if (!url) toast.error("Payment proof is not available yet.");
      })
      .catch(() => {
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

          {loading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">Loading payment proof...</div>
          ) : proofUrl ? (
            <div className="space-y-4">

              {/* 🔥 TXN Number Display Block */}
              {transactionId && (
                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
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

              {/* 🔥 Payment Proof Display - iframe works for BOTH images and PDFs (this is what made the OLD version work!) */}
              <iframe
                title="Verified payment proof"
                src={proofUrl}
                className="min-h-[70vh] w-full rounded-xl border bg-white"
              />

              {/* Open original link */}
              <a
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                href={proofUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open original proof <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <div className="py-20 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
              <ImageIcon className="h-10 w-10 opacity-30" />
              <p className="font-medium">No payment proof is available for this record.</p>
              <p className="text-xs max-w-md">
                This usually means the receipt image hasn't been uploaded yet, or the payment is still under verification by Givethra.
              </p>

              {/* Show TXN even without image */}
              {transactionId && (
                <div className="mt-2 w-full max-w-sm rounded-lg border border-primary/20 bg-primary/5 p-3 text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Transaction ID</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-bold text-foreground break-all">{transactionId}</p>
                    <Button size="sm" variant="ghost" onClick={copyTxn}>
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}
