// src/frontend/src/pages/PaymentProofPage.tsx
// 🔥 FIXED: Shows payment proof image + Transaction ID (TXN number) together
// 🔥 FIXED: Removed Print/Save PDF button (was confusing and unnecessary)
// 🔥 FIXED: Uses useParams instead of regex for reliable caseId extraction
// 🔥 FIXED: Extracts receipt_url and transaction_id from all possible data sources

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCaseById, getCaseResolutions, getCaseUnlocksByHero } from "@/lib/api";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileCheck2,
  Copy,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PaymentProofPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 🔥 FIX: Use useParams to reliably extract caseId from the URL
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
      return () => {
        active = false;
      };
    }

    Promise.allSettled([
      getCaseById(caseId),
      getCaseResolutions(caseId),
      getCaseUnlocksByHero(user.id),
    ])
      .then((results) => {
        if (!active) return;

        const caseData =
          results[0].status === "fulfilled" ? results[0].value : null;
        const resolutions =
          results[1].status === "fulfilled" &&
          Array.isArray(results[1].value)
            ? results[1].value
            : [];
        const unlocks =
          results[2].status === "fulfilled" &&
          Array.isArray(results[2].value)
            ? results[2].value
            : [];

        // 🔥 Find THIS user's specific resolution first, then fall back to any
        const myResolution =
          resolutions.find(
            (r: any) => String(r.hero_id) === String(user.id)
          ) || resolutions[0];

        const userUnlock = unlocks.find(
          (u: any) => String(u.case_id) === String(caseId)
        );

        // 🔥 Extract Payment Proof Image URL — check all possible sources
        const url =
          myResolution?.receipt_url ||
          myResolution?.paid_receipt_url ||
          caseData?.paid_receipt_url ||
          caseData?.payment_receipt_url ||
          caseData?.payment_proof_url ||
          caseData?.receipt_url ||
          userUnlock?.receipt_url ||
          userUnlock?.paid_receipt_url ||
          "";

        // 🔥 Extract Transaction ID (TXN number) — check all possible sources
        const txnId =
          myResolution?.transaction_id ||
          caseData?.transaction_id ||
          caseData?.reference_number ||
          caseData?.consumer_no ||
          caseData?.payment_transaction_id ||
          userUnlock?.transaction_id ||
          "";

        setCaseTitle(caseData?.title || "Payment proof");
        setProofUrl(url);
        setTransactionId(txnId);

        if (!url) {
          console.warn(
            "Payment proof image URL not found for case:",
            caseId,
            { myResolution, caseData, userUnlock }
          );
        }
      })
      .catch(() => {
        if (active) toast.error("Unable to load payment proof.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
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
          <Button className="mt-5" onClick={() => navigate({ to: "/sign-in" })}>
            Sign in
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="mx-auto max-w-4xl px-4 py-5 pb-24">
        {/* 🔥 Print / Save PDF button REMOVED — only Back button remains */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => navigate({ to: "/my-help" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Help
          </Button>
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
            <div className="py-20 text-center text-sm text-muted-foreground">
              Loading payment proof...
            </div>
          ) : proofUrl ? (
            <div className="space-y-4">
              {/* 🔥 Transaction ID (TXN) Display Block */}
              {transactionId && (
                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Transaction ID / Reference Number
                    </p>
                    <p className="font-mono text-base font-bold text-foreground truncate">
                      {transactionId}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 ml-2"
                    onClick={copyTxn}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="ml-1.5 hidden sm:inline">
                      {copied ? "Copied" : "Copy"}
                    </span>
                  </Button>
                </div>
              )}

              {/* 🔥 Payment Proof Image (Receipt Screenshot) */}
              <div className="flex min-h-[55vh] items-center justify-center rounded-xl border bg-white p-3">
                <img
                  src={proofUrl}
                  alt="Verified payment proof"
                  className="max-h-[70vh] w-auto max-w-full rounded object-contain"
                />
              </div>

              {/* 🔥 Action Buttons — Download & Open Original */}
              <div className="flex flex-wrap items-center justify-center gap-3 border-t pt-3">
                <a
                  href={proofUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="gap-2">
                    <Download className="h-4 w-4" /> Download payment proof image
                  </Button>
                </a>
                <a
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  href={proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open original <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
              <ImageIcon className="h-10 w-10 opacity-30" />
              <p className="font-medium">
                No payment proof image is available for this record.
              </p>
              <p className="text-xs max-w-md">
                This usually means the receipt image hasn't been uploaded yet,
                or the payment is still under verification by Givethra.
              </p>

              {/* Show TXN if available even without image */}
              {transactionId && (
                <div className="mt-2 w-full max-w-sm rounded-lg border border-primary/20 bg-primary/5 p-3 text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Transaction ID
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-bold text-foreground break-all">
                      {transactionId}
                    </p>
                    <Button size="sm" variant="ghost" onClick={copyTxn}>
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
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
