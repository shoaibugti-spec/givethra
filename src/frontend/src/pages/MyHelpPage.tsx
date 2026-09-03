// src/frontend/src/pages/MyHelpPage.tsx
// Givethra - My Help Page (for Heroes)
// Shows all contributions and direct helps by the hero
// FIXED: Correctly detects approved resolutions

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  HeartHandshake,
  HandCoins,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Eye,
  Calendar,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  getCaseResolutionsByHero,
  getCaseUnlocksByHero,
  getCasesByIds,
  getKycSubmission,
} from "@/lib/api";
import { toast } from "sonner";

// Helper: Check if a resolution is approved/completed
function isApprovedResolution(resolution: any): boolean {
  if (!resolution) return false;
  const status = String(resolution?.status || "").trim().toLowerCase();
  const caseStatus = String(resolution?.case_status || "").trim().toLowerCase();
  if (caseStatus === "completed") return true;
  if (["completed", "approved", "verified", "confirmed"].includes(status) && [1, true, "1", "true", "yes"].includes(resolution?.admin_confirmed)) return true;
  if ([1, true, "1", "true", "yes"].includes(resolution?.admin_confirmed)) return true;
  if (resolution?.admin_approved_at || resolution?.approved_at || resolution?.verified_at || resolution?.completed_at || resolution?.admin_confirmed_at) return true;
  return false;
}

// Helper: Check if resolution is a contribution (paid to Givethra)
function isContributionResolution(resolution: any): boolean {
  if (!resolution) return false;
  const marker = String(
    resolution?.paid_to ?? resolution?.paidTo ?? resolution?.payment_type ?? resolution?.paymentType ?? ""
  ).trim().toLowerCase();
  return ["givethra", "contribution", "fundraising", "partial"].includes(marker);
}

// Privacy: mask name (first name + middle initial)
function maskName(name?: string): string {
  if (!name) return "—";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] || "—";
  return `${parts[0]} ${parts[1].charAt(0)}.`;
}

// Privacy: mask CNIC (show first 4 digits)
function maskCnic(cnic?: string): string {
  if (!cnic) return "—";
  const digits = cnic.replace(/\D/g, "");
  if (digits.length < 6) return cnic;
  const shown = digits.slice(0, 4);
  const masked = "*".repeat(Math.max(digits.length - 4, 4));
  return `${shown}${masked}`;
}

// Currency symbol helper
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", PKR: "Rs", SAR: "SAR", AED: "AED", GBP: "£", EUR: "€", INR: "₹",
};

function sym(cur?: string) {
  return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$");
}

// Affidavit generator (same as in CaseDetailPage)
function generateAffidavitFromRecord(caseData: any, record: any, seekerName: string, heroName: string) {
  const resolution = record.resolution;
  const caseId = (caseData.id ?? "").slice(0, 8).toUpperCase();
  const today = new Date().toLocaleDateString();
  const seekerCnic = maskCnic(record.seeker_cnic);
  const heroCnic = maskCnic(record.hero_cnic);
  const completedDate = record.completedAt ? new Date(record.completedAt).toLocaleDateString() : today;
  const verifyCode = `GVT-${caseId}-${Date.now().toString(36).toUpperCase()}`;
  const cur = caseData.currency || "USD";
  const s = sym(cur);
  const paidAmount = record.amount;
  const isFundraising = record.type === "contribution";

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
        <div class="field"><div class="label">Full Name</div><div class="value">${maskName(seekerName)}</div></div>
        <div class="field"><div class="label">CNIC (Masked)</div><div class="value">${seekerCnic}</div></div>
      </div>

      <h2>Assistance & Method Verification</h2>
      <div class="grid">
        <div class="field"><div class="label">Helper Name (Hero)</div><div class="value">${maskName(heroName)}</div></div>
        <div class="field"><div class="label">Help Type</div><div class="value">${isFundraising ? "Contribution (Fundraising)" : "Direct Institute Payment"}</div></div>
        <div class="field"><div class="label">Amount Settled</div><div class="value" style="color:#16a34a; font-weight:bold;">${s} ${paidAmount} ${cur}</div></div>
        <div class="field"><div class="label">TXN Number</div><div class="value">${record.transactionId || "—"}</div></div>
        <div class="field"><div class="label">Payment Route / Method</div><div class="value">${resolution?.resolution_type || caseData.payment_method || "Online Transfer"}</div></div>
        <div class="field"><div class="label">Verification Date</div><div class="value">${completedDate}</div></div>
      </div>

      ${record.receiptUrl ? `
      <h2>Payment Evidence File</h2>
      <div class="field" style="background: #eff6ff; border: 1px solid #bfdbfe;">
        <div class="label">Receipt Attachment</div>
        <p style="font-size:13px; margin: 4px 0 10px 0; color:#1e40af;">You can securely view the original image receipt submitted for this financial transaction below:</p>
        <a href="${record.receiptUrl}" target="_blank" class="receipt-btn">Open & View Uploaded Receipt File ↗</a>
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

export default function MyHelpPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"all" | "contribution" | "direct">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed" | "rejected">("all");

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
      const [resolutionsResult, unlocksResult] = await Promise.all([
        getCaseResolutionsByHero(user.id),
        getCaseUnlocksByHero(user.id),
      ]);

      const resolutions = Array.isArray(resolutionsResult) ? resolutionsResult : [];
      const unlocks = Array.isArray(unlocksResult) ? unlocksResult : [];

      // Get all case IDs from resolutions and unlocks
      const caseIds = Array.from(
        new Set([
          ...resolutions.map((r: any) => String(r.case_id || "")).filter(Boolean),
          ...unlocks.map((u: any) => String(u.case_id || "")).filter(Boolean),
        ])
      );

      if (caseIds.length === 0) {
        setRecords([]);
        setLoading(false);
        return;
      }

      const casesData = await getCasesByIds(caseIds);
      const caseMap = new Map<string, any>();
      (Array.isArray(casesData) ? casesData : []).forEach((c: any) => {
        if (c?.id) caseMap.set(String(c.id), c);
      });

      // Build records from resolutions (approved ones)
      const recordList: any[] = [];

      for (const resolution of resolutions) {
        const caseId = String(resolution.case_id || "");
        if (!caseId) continue;
        const caseRecord = caseMap.get(caseId) || {
          id: caseId,
          title: resolution.case_title || "Unknown case",
          category: resolution.case_category || "Other",
          country: resolution.case_country || "",
          city: resolution.case_city || "",
          currency: resolution.currency || "PKR",
          amount_needed: resolution.amount_paid || 0,
        };

        const isApproved = isApprovedResolution(resolution);
        const isContribution = isContributionResolution(resolution);
        const status = String(resolution.status || "").toLowerCase();
        const statusDisplay = isApproved ? "completed" : (status === "rejected" || status === "disputed" ? "rejected" : "pending");

        recordList.push({
          id: resolution.id,
          type: isContribution ? "contribution" : "direct",
          amount: Number(resolution.seeker_confirmed_amount ?? resolution.amount_paid ?? 0),
          transactionId: resolution.transaction_id,
          receiptUrl: resolution.receipt_url,
          status: statusDisplay,
          completedAt: resolution.completed_at || resolution.admin_confirmed_at || resolution.submitted_at,
          caseId: caseId,
          caseTitle: caseRecord.title || "Unknown case",
          caseCategory: caseRecord.category || "Other",
          caseCountry: caseRecord.country || "",
          caseCity: caseRecord.city || "",
          currency: caseRecord.currency || "PKR",
          resolution: resolution,
          isApproved: isApproved,
          seekerName: resolution.seeker_name || caseRecord.full_name || "Verified Seeker",
          seekerCnic: resolution.seeker_cnic_number || "",
          heroName: resolution.hero_name || user.fullName || "You",
          heroCnic: resolution.hero_cnic_number || "",
        });
      }

      // 🔥 صرف ایک لائن کی تبدیلی — یہاں دیکھیں:
      // Add unlock-only records (no resolution)
      for (const unlock of unlocks) {
        const caseId = String(unlock.case_id || "");
        if (!caseId) continue;
        // 🔥 FIX: Check if there is ANY resolution for this case
        // پہلے (غلط): if (recordList.some((r) => r.caseId === caseId && r.type !== "unlock")) continue;
        // اب (صحیح):
        if (resolutions.some((r: any) => String(r.case_id) === caseId)) continue;
        const caseRecord = caseMap.get(caseId) || {
          id: caseId,
          title: "Unlocked case",
          category: "Other",
          currency: "PKR",
        };
        const isPartial = unlock.payment_type === "partial";
        recordList.push({
          id: unlock.id,
          type: isPartial ? "contribution" : "direct",
          amount: Number(unlock.pledged_amount ?? 0),
          transactionId: "N/A",
          receiptUrl: null,
          status: "pending",
          completedAt: unlock.unlocked_at,
          caseId: caseId,
          caseTitle: caseRecord.title || "Unlocked case",
          caseCategory: caseRecord.category || "Other",
          caseCountry: caseRecord.country || "",
          caseCity: caseRecord.city || "",
          currency: caseRecord.currency || "PKR",
          resolution: null,
          isApproved: false,
          seekerName: "—",
          seekerCnic: "",
          heroName: user.fullName || "You",
          heroCnic: "",
          isUnlockOnly: true,
        });
      }

      // Sort by date (newest first)
      recordList.sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      });

      setRecords(recordList);
    } catch (err) {
      console.error("Failed to load help records:", err);
      toast.error("Could not load your help history.");
    } finally {
      setLoading(false);
    }
  }

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const statusConfig: any = {
    pending: { icon: <Clock className="h-3.5 w-3.5" />, label: "Pending", color: "bg-orange-100 text-orange-700" },
    rejected: { icon: <XCircle className="h-3.5 w-3.5" />, label: "Rejected", color: "bg-red-100 text-red-700" },
    completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Completed", color: "bg-green-100 text-green-700" },
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <HeartHandshake className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">My Help</h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading your help history...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed bg-muted/20">
            <HeartHandshake className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="font-semibold">You haven't helped anyone yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Browse cases and become a Hero today!</p>
            <Button className="mt-4" onClick={() => navigate({ to: "/cases" })}>
              Browse Cases
            </Button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="space-y-2">
              <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="contribution">🤝 Contribution</TabsTrigger>
                  <TabsTrigger value="direct">🦸 Direct</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all">All Status</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Records */}
            <div className="space-y-3">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No {filterType !== "all" ? filterType : ""} {filterStatus !== "all" ? filterStatus : ""} records found.</p>
                </div>
              ) : (
                filteredRecords.map((record) => {
                  const cfg = statusConfig[record.status] || statusConfig.pending;
                  const cur = record.currency || "PKR";
                  const s = sym(cur);
                  const isCompleted = record.status === "completed";
                  const isRejected = record.status === "rejected";
                  const isUnlockOnly = record.isUnlockOnly;

                  return (
                    <div
                      key={record.id}
                      className={`rounded-xl border p-4 space-y-3 ${
                        isRejected
                          ? "border-red-300 bg-red-50/50 dark:bg-red-950/10"
                          : isCompleted
                          ? "border-green-300 bg-green-50/50 dark:bg-green-950/10"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {record.type === "contribution" ? "🤝 Contribution" : "🦸 Direct Help"}
                            </span>
                            {isUnlockOnly && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                🔓 Unlock Only
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm truncate">{record.caseTitle}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>{record.caseCategory}</span>
                            {(record.caseCity || record.caseCountry) && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" /> {[record.caseCity, record.caseCountry].filter(Boolean).join(", ")}
                              </span>
                            )}
                            {record.amount > 0 && (
                              <span className="font-medium text-foreground">
                                {s} {record.amount} {cur}
                              </span>
                            )}
                          </div>
                          {record.transactionId && record.transactionId !== "N/A" && (
                            <p className="text-xs text-muted-foreground">TXN: <span className="font-mono">{record.transactionId}</span></p>
                          )}
                          {record.completedAt && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {new Date(record.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        {isCompleted && record.isApproved && !isUnlockOnly && (
                          <Button
                            size="sm"
                            className="gap-2 bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[120px]"
                            onClick={() => {
                              const affidavitWindow = window.open(`/affidavit/${encodeURIComponent(record.caseId)}`, "_blank", "noopener,noreferrer");
                              if (!affidavitWindow) toast.error("Please allow pop-ups to view the affidavit.");
                            }}
                          >
                            <FileText className="h-3.5 w-3.5" /> View Affidavit
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 min-w-[100px]"
                          onClick={() => navigate({ to: "/cases/$id", params: { id: record.caseId } })}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> View Case
                        </Button>

                        {isRejected && !isCompleted && (
                          <div className="w-full mt-1 rounded-lg bg-red-100 dark:bg-red-950/30 p-2 text-xs text-red-700 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            This help was not verified. You can try helping again on another case.
                          </div>
                        )}

                        {isUnlockOnly && (
                          <div className="w-full mt-1 rounded-lg bg-amber-100 dark:bg-amber-950/30 p-2 text-xs text-amber-700">
                            💪 You unlocked this case but didn't complete a payment. Browse more cases and become a full Hero!
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
