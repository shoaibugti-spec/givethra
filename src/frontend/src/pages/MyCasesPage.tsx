// src/frontend/src/pages/MyCasesPage.tsx
// 🔥 FIXED: Removed "My Help" tab entirely (Fix #6)
// 🔥 FIXED: Uses shared resolutionStatus helpers (Fix #5)

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  ArrowRight,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getCasesByUser, getProfile } from "@/lib/api";
import { isTrulyCompletedHelp, isContributionResolution, resolutionDisplayStatus } from "@/lib/resolutionStatus";
import { toast } from "sonner";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", PKR: "Rs", SAR: "SAR", AED: "AED", GBP: "£", EUR: "€", INR: "₹",
};

function sym(cur?: string) {
  return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$");
}

function maskCnic(cnic?: string): string {
  if (!cnic) return "—";
  const digits = cnic.replace(/\D/g, "");
  if (digits.length < 6) return cnic;
  const shown = digits.slice(0, 4);
  const masked = "*".repeat(Math.max(digits.length - 4, 4));
  return `${shown}${masked}`;
}

function generateAffidavitFromDashboard(caseData: any, resolution: any, heroName: string, seekerCnic: string, seekerName: string) {
  const caseId = (caseData.id ?? "").slice(0, 8).toUpperCase();
  const today = new Date().toLocaleDateString();
  const heroCnic = maskCnic(resolution?.hero_cnic_number);
  const completedDate = resolution?.completed_at || resolution?.admin_confirmed_at || today;
  const verifyCode = `GVT-${caseId}-${Date.now().toString(36).toUpperCase()}`;
  const cur = caseData.currency || "USD";
  const s = sym(cur);
  const paidAmount = resolution?.seeker_confirmed_amount ?? resolution?.amount_paid ?? 0;
  const isFundraising = isContributionResolution(resolution);

  const html = `
    <html>
    <head>
      <title>Givethra Affidavit - ${caseId}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; line-height: 1.6; }
        .header { text-align: center; border-bottom: 3px double #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .badge { background: #dcfce7; color: #15803d; padding: 6px 12px; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block; }
        h1 { margin: 10px 0; color: #111827; }
        h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; color: #1f2937; margin-top: 30px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .field { background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #f3f4f6; }
        .label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold; }
        .value { font-size: 16px; font-weight: 500; margin-top: 4px; }
        .receipt-btn { display: inline-block; background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 8px; font-size: 14px; }
        .declarations { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 8px; margin: 30px 0; }
        .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="badge">✓ DIGITALLY VERIFIED AFFIDAVIT</div>
        <h1>Givethra Legal & Audit Receipt</h1>
        <p>Verified Help. Real Impact. Generated for Audit Tracking.</p>
      </div>

      <h2>Case Information</h2>
      <div class="grid">
        <div class="field"><div class="label">Case ID</div><div class="value">GVT-${caseId}</div></div>
        <div class="field"><div class="label">Category</div><div class="value">${caseData.category || "—"}</div></div>
        <div class="field" style="grid-column: span 2;"><div class="label">Title</div><div class="value">${caseData.title || "—"}</div></div>
      </div>

      <h2>Help Seeker (Beneficiary)</h2>
      <div class="grid">
        <div class="field"><div class="label">Full Name</div><div class="value">${seekerName}</div></div>
        <div class="field"><div class="label">CNIC (Masked)</div><div class="value">${seekerCnic}</div></div>
      </div>

      <h2>Assistance & Method Verification</h2>
      <div class="grid">
        <div class="field"><div class="label">Helper Name (Hero)</div><div class="value">${heroName}</div></div>
        <div class="field"><div class="label">Help Type</div><div class="value">${isFundraising ? "Contribution (Fundraising)" : "Direct Institute Payment"}</div></div>
        <div class="field"><div class="label">Amount Settled</div><div class="value" style="color:#16a34a; font-weight:bold;">${s} ${paidAmount} ${cur}</div></div>
        <div class="field"><div class="label">TXN Number</div><div class="value">${resolution?.transaction_id || "—"}</div></div>
        <div class="field"><div class="label">Payment Route / Method</div><div class="value">${resolution?.resolution_type || caseData.payment_method || "Online Transfer"}</div></div>
        <div class="field"><div class="label">Verification Date</div><div class="value">${new Date(completedDate).toLocaleDateString()}</div></div>
      </div>

      ${resolution?.receipt_url ? `
      <h2>Payment Evidence File</h2>
      <div class="field" style="background: #eff6ff; border: 1px solid #bfdbfe;">
        <div class="label">Receipt Attachment</div>
        <p style="font-size:13px; margin: 4px 0 10px 0; color:#1e40af;">You can securely view the original image receipt submitted for this financial transaction below:</p>
        <a href="${resolution.receipt_url}" target="_blank" class="receipt-btn">Open & View Uploaded Receipt File ↗</a>
      </div>
      ` : ""}

      <div class="declarations">
        <strong>Official Audit Guarantee:</strong> This document serves as legitimate proof that the stated amount was fully transferred to assist the beneficiary platform group. Both parties have verified completion electronically. This can be produced before any legal audit or inquiry.
      </div>

      <div class="footer">
        <p>Verification Security Code: <strong>${verifyCode}</strong></p>
        <p>© ${new Date().getFullYear()} Givethra Platform. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  } else {
    toast.error("Please allow pop-ups to open the affidavit.");
  }
}

export default function MyCasesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [myCases, setMyCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myCaseStatusFilter, setMyCaseStatusFilter] = useState("completed");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadData();
    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isAuthenticated]);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    try {
      const cases = await getCasesByUser(user.id);
      setMyCases(
        (Array.isArray(cases) ? cases : []).map((c: any) => ({
          ...c,
          status: String(c?.status || "pending").toLowerCase(),
        }))
      );
    } catch (err) {
      console.error("Failed to load cases dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const statusConfig: any = {
    pending: { icon: <Clock className="h-3.5 w-3.5" />, label: "Pending", color: "bg-orange-100 text-orange-700" },
    rejected: { icon: <XCircle className="h-3.5 w-3.5" />, label: "Rejected", color: "bg-red-100 text-red-700" },
    approved: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Approved", color: "bg-green-100 text-green-700" },
    completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Completed", color: "bg-blue-100 text-blue-700" },
    expired: { icon: <CalendarClock className="h-3.5 w-3.5" />, label: "Expired", color: "bg-amber-100 text-amber-700" },
  };

  function CaseRow({ c }: { c: any }) {
    const statusKey = c.status;
    const cfg = statusConfig[statusKey] ?? statusConfig.pending;
    const cur = c.currency || "USD";
    const s = sym(cur);
    const needed = Number(c.amount_needed ?? 0);
    const collected = Number(c.amount_collected ?? 0);
    const pct = needed > 0 ? Math.min(Math.round((collected / needed) * 100), 100) : 0;
    const isRejected = statusKey === "rejected";
    const isExpired = c.status === "expired";

    return (
      <div className={`rounded-xl border p-4 space-y-3 ${isRejected ? "border-red-300 bg-red-50/50 dark:bg-red-950/10" : isExpired ? "border-amber-300 bg-amber-50/50" : "bg-card"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                {cfg.icon} {cfg.label}
              </span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span>
            </div>
            <p className="font-semibold">{c.title}</p>
            <p className="text-xs text-muted-foreground">📍 {c.city}, {c.country} {needed > 0 && `· ${s} ${needed} ${cur}`}</p>
          </div>
        </div>

        {needed > 0 && !isRejected && !isExpired && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-medium">
              <span className="text-green-600">{s} {collected} settled</span>
              <span className="text-muted-foreground">{pct}% · {s} {Math.max(needed - collected, 0)} left</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {isRejected && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Case Rejected</p>
              <p className="text-xs text-red-600">{c.rejection_reason || "No reason provided."}</p>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full shrink-0">
                  <CalendarClock className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-amber-800">⏰ Case Expired</h4>
                  <p className="text-xs text-amber-600">No one helped in time, but you can try again</p>
                </div>
              </div>
              <div className="bg-white rounded-lg border-2 border-amber-200 p-4">
                <p className="text-sm text-amber-900">Your case remained active until the deadline but no Hero stepped forward. {c.was_free ? "Since this was your free case, you can submit a new case for FREE." : "The 1 credit you used has been refunded."}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700 text-white" onClick={() => navigate({ to: "/submit-request" })}><ArrowRight className="h-3.5 w-3.5" /> Submit New Case</Button>
                <Button size="sm" variant="outline" className="flex-1 gap-2 border-amber-300 text-amber-600" onClick={() => navigate({ to: "/cases" })}><Eye className="h-3.5 w-3.5" /> Browse Other Cases</Button>
              </div>
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => navigate({ to: "/cases/$id", params: { id: c.id } })}>
          <Eye className="h-3.5 w-3.5" /> View Details
        </Button>
      </div>
    );
  }

  const filteredMyCases = myCases.filter((c) => {
    const status = String(c.status || "").toLowerCase();
    if (myCaseStatusFilter === "approved") {
      return status === "approved" || status === "published";
    }
    return status === myCaseStatusFilter;
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">My Cases</h1>
          </div>
          <Button size="sm" onClick={() => navigate({ to: "/submit-request" })} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Case
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            <Tabs value={myCaseStatusFilter} onValueChange={setMyCaseStatusFilter} className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

            {filteredMyCases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><p>No {myCaseStatusFilter} cases.</p></div>
            ) : (
              <div className="space-y-3">{filteredMyCases.map((c) => <CaseRow key={c.id} c={c} />)}</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
