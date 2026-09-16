import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCaseById, getCaseResolutions, getCaseUnlocksByHero } from "@/lib/api";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, ExternalLink, FileCheck2, Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function PaymentProofPage() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [proofUrl, setProofUrl] = useState("");
  const [caseTitle, setCaseTitle] = useState("Payment proof");
  const [loading, setLoading] = useState(true);
  const caseId = useMemo(() => {
    const match = location.pathname.match(/^\/payment-proof\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    if (!user?.id || !caseId) { setLoading(false); return () => { active = false; }; }
    Promise.allSettled([getCaseById(caseId), getCaseResolutions(caseId), getCaseUnlocksByHero(user.id)])
      .then((results) => {
        if (!active) return;
        const caseData = results[0].status === "fulfilled" ? results[0].value : null;
        const resolutions = results[1].status === "fulfilled" && Array.isArray(results[1].value) ? results[1].value : [];
        const unlocks = results[2].status === "fulfilled" && Array.isArray(results[2].value) ? results[2].value : [];
        const userUnlock = unlocks.find((u: any) => String(u.case_id) === String(caseId));
        const completed = resolutions.filter((r: any) => r.receipt_url || r.paid_receipt_url);
        const url = completed[0]?.receipt_url || completed[0]?.paid_receipt_url || caseData?.paid_receipt_url || caseData?.payment_proof_url || caseData?.receipt_url || "";
        setCaseTitle(caseData?.title || "Payment proof");
        setProofUrl(url);
        if (!url && !userUnlock) toast.error("Payment proof is not available for this help record.");
      })
      .catch(() => { if (active) toast.error("Unable to load payment proof."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [caseId, user?.id]);

  if (!isAuthenticated) {
    return <Layout><div className="mx-auto max-w-xl px-4 py-12 text-center"><h1 className="text-xl font-bold">Sign in required</h1><Button className="mt-5" onClick={() => navigate({ to: "/sign-in" })}>Sign in</Button></div></Layout>;
  }

  return (
    <Layout>
      <main className="mx-auto max-w-4xl px-4 py-5 pb-24">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <Button variant="ghost" onClick={() => navigate({ to: "/my-help" })}><ArrowLeft className="mr-2 h-4 w-4" />Back to My Help</Button>
          <div className="flex gap-2">
            {proofUrl && <a href={proofUrl} download target="_blank" rel="noopener noreferrer"><Button variant="outline"><Download className="mr-2 h-4 w-4" />Download</Button></a>}
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print / Save PDF</Button>
          </div>
        </div>
        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3 border-b pb-4"><FileCheck2 className="h-6 w-6 text-primary" /><div><h1 className="font-bold">Verified Payment Proof</h1><p className="text-xs text-muted-foreground">{caseTitle}</p></div></div>
          {loading ? <div className="py-20 text-center text-sm text-muted-foreground">Loading payment proof...</div> : proofUrl ? (
            <div className="space-y-3">
              <div className="flex min-h-[55vh] items-center justify-center rounded-xl border bg-white p-3">
                <img src={proofUrl} alt="Verified payment proof" className="max-h-[70vh] w-auto max-w-full rounded object-contain" />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 border-t pt-3">
                <a href={proofUrl} download target="_blank" rel="noopener noreferrer"><Button className="gap-2"><Download className="h-4 w-4" />Download payment proof image</Button></a>
                <a className="inline-flex items-center gap-1 text-xs text-primary hover:underline" href={proofUrl} target="_blank" rel="noopener noreferrer">Open original <ExternalLink className="h-3 w-3" /></a>
              </div>
            </div>
          ) : <div className="py-20 text-center text-sm text-muted-foreground">No payment proof is available for this record.</div>}
        </section>
      </main>
    </Layout>
  );
}
