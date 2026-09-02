// src/frontend/src/pages/MyCasesPage.tsx
// Full production-ready code with proper status grouping and Affidavit integration

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
  Heart,
  Plus,
  ArrowRight,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  getCasesByUser,
  getCaseUnlocksByHero,
  getCaseResolutionsByHero,
  getCasesByIds,
  getKycSubmission,
  getProfile,
} from "@/lib/api";
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

// Global Affidavit generator for dashboard (same as in CaseDetailPage)
function generateAffidavitFromDashboard(caseData: any, resolution: any, heroName: string, seekerCnic: string, seekerName: string) {
  const caseId = (caseData.id ?? "").slice(0, 8).toUpperCase();
  const today = new Date().toLocaleDateString();
  const heroCnic = maskCnic(resolution?.hero_cnic_number);
  const completedDate = resolution?.completed_at || resolution?.admin_confirmed_at || today;
  const verifyCode = `GVT-${caseId}-${Date.now().toString(36).toUpperCase()}`;
  const cur = caseData.currency || "USD";
  const s = sym(cur);
  const paidAmount = resolution?.seeker_confirmed_amount ?? resolution?.amount_paid ?? 0;
  const isFundraising = ["givethra", "contribution", "fundraising", "partial"].includes(
    String(resolution?.paid_to ?? resolution?.payment_type ?? "").toLowerCase()
  );

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

function isApprovedCompletedResolution(resolution: any): boolean {
  if (!resolution) return false;
  const status = String(resolution?.status || "").trim().toLowerCase();
  if (["approved", "completed", "verified", "confirmed", "seeker_confirmed"].includes(status)) {
    return true;
  }
  if ([1, true, "1", "true", "yes"].includes(resolution?.admin_confirmed)) {
    return true;
  }
  if (resolution?.admin_approved_at || resolution?.approved_at || resolution?.verified_at || resolution?.completed_at || resolution?.admin_confirmed_at) {
    return true;
  }
  return false;
}

function isContributionResolution(resolution: any): boolean {
  if (!resolution) return false;
  const marker = String(
    resolution?.paid_to ?? resolution?.paidTo ?? resolution?.payment_type ?? resolution?.paymentType ?? ""
  ).trim().toLowerCase();
  return ["givethra", "contribution", "fundraising", "partial"].includes(marker);
}

export default function MyCasesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [myCases, setMyCases] = useState<any[]>([]);
  const [unlockedCases, setUnlockedCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroName, setHeroName] = useState("Verified Hero");

  const [myCaseStatusFilter, setMyCaseStatusFilter] = useState("completed");
  const [helpTypeFilter, setHelpTypeFilter] = useState("contribution");
  const [helpStatusFilter, setHelpStatusFilter] = useState("completed");

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
      const prof = await getProfile(user.id);
      if (prof?.full_name) setHeroName(prof.full_name.split(" ")[0]);

      const cases = await getCasesByUser(user.id);
      setMyCases(
        (Array.isArray(cases) ? cases : []).map((c: any) => ({
          ...c,
          status: String(c?.status || "pending").toLowerCase(),
        }))
      );

      const [unlocksResult, resolutionsResult] = await Promise.all([
        getCaseUnlocksByHero(user.id),
        getCaseResolutionsByHero(user.id),
      ]);
      const unlocks = Array.isArray(unlocksResult) ? unlocksResult : [];
      const resolutions = Array.isArray(resolutionsResult) ? resolutionsResult : [];

      const caseIds = Array.from(new Set([
        ...unlocks.map((u: any) => String(u.case_id || "")).filter(Boolean),
        ...resolutions.map((r: any) => String(r.case_id || "")).filter(Boolean),
      ]));

      if (caseIds.length === 0) {
        setUnlockedCases([]);
        setLoading(false);
        return;
      }

      const unlockedData = await getCasesByIds(caseIds);
      const caseMap = new Map<string, any>();
      (Array.isArray(unlockedData) ? unlockedData : []).forEach((record: any) => {
        if (record?.id) caseMap.set(String(record.id), record);
      });

      const resolutionByCase = new Map<string, any>();
      resolutions.forEach((resolution: any) => {
        const key = String(resolution.case_id || "");
        const current = resolutionByCase.get(key);
        if (
          !current ||
          new Date(String(resolution.completed_at || resolution.submitted_at || 0)).getTime() >
          new Date(String(current.completed_at || current.submitted_at || 0)).getTime()
        ) {
          resolutionByCase.set(key, resolution);
        }
      });

      resolutions.forEach((resolution: any) => {
        const caseId = String(resolution.case_id || "");
        if (caseId && !caseMap.has(caseId)) {
          caseMap.set(caseId, {
            id: caseId,
            title: resolution.case_title || "Completed help",
            category: resolution.case_category || "Help",
            country: resolution.case_country || "",
            city: resolution.case_city || "",
            currency: resolution.currency || "PKR",
            amount_needed: resolution.amount_paid || 0,
            amount_collected: resolution.amount_paid || 0,
            status: "completed",
          });
        }
      });

      const merged: any[] = [];
      for (const [caseId, caseRecord] of caseMap) {
        const resolution = resolutionByCase.get(caseId);
        const unlock = unlocks.find((u: any) => String(u.case_id) === caseId);

        let helpType: string = "direct";
        if (resolution) {
          helpType = isContributionResolution(resolution) ? "contribution" : "direct";
        } else if (unlock) {
          helpType = unlock.payment_type === "partial" ? "contribution" : "direct";
        }

        let helpStatus: string = "pending";
        if (resolution) {
          const adminConfirmed = [1, "1", true, "true", "yes"].includes(resolution?.admin_confirmed);
          const isApproved = isApprovedCompletedResolution(resolution) || adminConfirmed;
          const status = String(resolution.status || "").toLowerCase();
          if (isApproved) helpStatus = "completed";
          else if (status === "rejected" || status === "disputed") helpStatus = "rejected";
          else helpStatus = "pending";
        } else {
          const caseStatus = String(caseRecord.status || "").toLowerCase();
          helpStatus = caseStatus === "completed" ? "completed" : "pending";
        }
        // If the case itself is completed, mark help as completed
        if (String(caseRecord.status || "").toLowerCase() === "completed") {
          helpStatus = "completed";
        }

        const isCompleted = helpStatus === "completed";
        // Affidavits are available only for a completed, identified resolution.
        merged.push({
          ...caseRecord,
          status: String(caseRecord?.status || "pending").toLowerCase(),
          amount_collected: Number(resolution?.amount_paid ?? resolution?.seeker_confirmed_amount ?? caseRecord.amount_collected ?? 0),
          completed_at: resolution?.completed_at || caseRecord.updated_at,
          resolution_id: resolution?.id,
          affidavit_available: isCompleted && resolution?.id ? true : false,
          helpType,
          helpStatus,
          resolution,
          unlock,
        });
      }
      setUnlockedCases(merged);
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

  function CaseRow({ c, isHelping = false }: { c: any; isHelping?: boolean }) {
    const statusKey = isHelping ? c.helpStatus : c.status;
    const cfg = statusConfig[statusKey] ?? statusConfig.pending;
    const cur = c.currency || "USD";
    const s = sym(cur);
    const needed = Number(c.amount_needed ?? 0);
    const collected = Number(c.amount_collected ?? 0);
    const pct = needed > 0 ? Math.min(Math.round((collected / needed) * 100), 100) : 0;
    const isRejected = statusKey === "rejected";
    const isExpired = !isHelping && c.status === "expired";
    const [triggerLoading, setTriggerLoading] = useState(false);

    async function handleAffidavit() {
      setTriggerLoading(true);
      try {
        const kyc = await getKycSubmission(c.user_id);
        const seekerCnic = maskCnic(kyc?.cnic_number);
        const seekerName = kyc?.full_name || c.full_name || "Verified Beneficiary";
        generateAffidavitFromDashboard(c, c.resolution, heroName, seekerCnic, seekerName);
      } catch {
        toast.error("Error generating affidavit.");
      } finally {
        setTriggerLoading(false);
      }
    }

    return (
      <div className={`rounded-xl border p-4 space-y-3 ${isRejected ? "border-red-300 bg-red-50/50 dark:bg-red-950/10" : isExpired ? "border-amber-300 bg-amber-50/50" : "bg-card"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                {cfg.icon} {cfg.label}
              </span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span>
              {isHelping && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.helpType === "contribution" ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"}`}>
                  {c.helpType === "contribution" ? "🤝 Contribution" : "🦸 Direct Help"}
                </span>
              )}
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

        {isHelping && isRejected && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Your help was not verified</p>
              <p className="text-xs text-red-600">Don't lose hope! Browse other cases and become a Hero.</p>
            </div>
          </div>
        )}

        {isHelping && statusKey === "completed" && c.affidavit_available && (
          <div className="space-y-2">
            <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              🤝 True Hero Impact confirmed! Your verification audit file is ready.
            </div>
            <Button size="sm" className="w-full gap-2 bg-green-600 hover:bg-green-700" onClick={handleAffidavit} disabled={triggerLoading}>
              <FileText className="h-3.5 w-3.5" />
              {triggerLoading ? "Generating..." : "Download & View Affidavit"}
            </Button>
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
          {isHelping ? <Heart className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {isHelping && c.helpStatus === "completed" && c.affidavit_available ? "View Affidavit & Completed Help" : isHelping && c.helpStatus === "completed" ? "View Completed Case" : isHelping ? "Continue Helping" : "View Details"}
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

  const filteredHelpCases = unlockedCases.filter((c) => {
    const typeMatch = c.helpType === helpTypeFilter;
    const status = String(c.helpStatus || "").toLowerCase();
    let statusMatch = false;
    if (helpStatusFilter === "approved") {
      statusMatch = status === "approved" || status === "published" || status === "completed";
    } else {
      statusMatch = status === helpStatusFilter;
    }
    return typeMatch && statusMatch;
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

        {loading ? <div className="text-center py-20 text-muted-foreground">Loading...</div> : (
          <Tabs defaultValue="mycases" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="mycases" className="flex-1">My Cases ({myCases.length})</TabsTrigger>
              <TabsTrigger value="myhelp" className="flex-1">My Help ({unlockedCases.length})</TabsTrigger>
            </TabsList>

            {/* My Cases Tab */}
            <TabsContent value="mycases" className="space-y-4 mt-4">
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
            </TabsContent>

            {/* My Help Tab */}
            <TabsContent value="myhelp" className="space-y-4 mt-4">
              <Tabs value={helpTypeFilter} onValueChange={(val) => { setHelpTypeFilter(val); setHelpStatusFilter("completed"); }} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="contribution">🤝 Contribution</TabsTrigger>
                  <TabsTrigger value="direct">🦸 Direct Help</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs value={helpStatusFilter} onValueChange={setHelpStatusFilter} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>

              {filteredHelpCases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><p>No {helpStatusFilter} {helpTypeFilter === "contribution" ? "contributions" : "direct helps"}.</p></div>
              ) : (
                <div className="space-y-3">{filteredHelpCases.map((c) => <CaseRow key={c.id} c={c} isHelping />)}</div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
