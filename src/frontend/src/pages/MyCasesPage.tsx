// src/frontend/src/pages/MyCasesPage.tsx
// Givethra - My Cases (for Requesters only)
// Shows only the user's own cases: Pending, Approved, Rejected, Completed, Expired

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
  CalendarClock,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getCasesByUser } from "@/lib/api";
import { toast } from "sonner";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  PKR: "Rs",
  SAR: "SAR",
  AED: "AED",
  GBP: "£",
  EUR: "€",
  INR: "₹",
};

function sym(cur?: string) {
  return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$");
}

// Privacy: mask name
function maskName(name?: string): string {
  if (!name) return "—";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] || "—";
  return `${parts[0]} ${parts[1].charAt(0)}.`;
}

export default function MyCasesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [myCases, setMyCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

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
      console.error("Failed to load cases:", err);
      toast.error("Could not load your cases.");
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

  const filteredCases = myCases.filter((c) => {
    const status = String(c.status || "").toLowerCase();
    if (statusFilter === "approved") {
      return status === "approved" || status === "published" || status === "active";
    }
    return status === statusFilter;
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
        ) : myCases.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed bg-muted/20">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="font-semibold">You haven't submitted any cases yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Submit your first case today!</p>
            <Button className="mt-4" onClick={() => navigate({ to: "/submit-request" })}>
              Submit a Case
            </Button>
          </div>
        ) : (
          <>
            {/* Status Tabs */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
              <TabsList className="flex w-full flex-wrap gap-1 h-auto">
                <TabsTrigger value="pending" className="min-w-[5.5rem] flex-1">Pending</TabsTrigger>
                <TabsTrigger value="rejected" className="min-w-[5.5rem] flex-1">Rejected</TabsTrigger>
                <TabsTrigger value="approved" className="min-w-[5.5rem] flex-1">Approved</TabsTrigger>
                <TabsTrigger value="completed" className="min-w-[5.5rem] flex-1">Completed</TabsTrigger>
                <TabsTrigger value="expired" className="min-w-[5.5rem] flex-1">Expired</TabsTrigger>
              </TabsList>

              <TabsContent value={statusFilter} className="mt-4 space-y-3">
                {filteredCases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No {statusFilter} cases.</p>
                  </div>
                ) : (
                  filteredCases.map((c) => {
                    const cfg = statusConfig[c.status] || statusConfig.pending;
                    const cur = c.currency || "USD";
                    const s = sym(cur);
                    const needed = Number(c.amount_needed ?? 0);
                    const collected = Number(c.amount_collected ?? 0);
                    const pct = needed > 0 ? Math.min(Math.round((collected / needed) * 100), 100) : 0;
                    const isRejected = c.status === "rejected";
                    const isExpired = c.status === "expired";
                    const isCompleted = c.status === "completed";

                    return (
                      <div
                        key={c.id}
                        className={`rounded-xl border p-4 space-y-3 ${
                          isRejected
                            ? "border-red-300 bg-red-50/50 dark:bg-red-950/10"
                            : isExpired
                            ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/10"
                            : isCompleted
                            ? "border-blue-200 bg-blue-50/30 dark:bg-blue-950/10"
                            : "bg-card"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                                {cfg.icon} {cfg.label}
                              </span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span>
                            </div>
                            <p className="font-semibold text-sm truncate">{c.title}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" /> {c.city}, {c.country}
                              </span>
                              {needed > 0 && (
                                <span className="font-medium text-foreground">
                                  {s} {needed} {cur}
                                </span>
                              )}
                              {isCompleted && collected > 0 && (
                                <span className="font-medium text-green-600">
                                  Received: {s} {collected}
                                </span>
                              )}
                            </div>
                            {c.deadline && c.status !== "expired" && c.status !== "completed" && (
                              (() => {
                                const daysLeft = Math.ceil(
                                  (new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                );
                                if (daysLeft < 0) return null;
                                return (
                                  <div
                                    className={`text-xs font-bold px-2 py-1 rounded-lg text-center inline-block ${
                                      daysLeft <= 3
                                        ? "bg-red-100 text-red-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    ⏳ {daysLeft === 0
                                      ? "Expires TODAY!"
                                      : daysLeft === 1
                                      ? "1 day left!"
                                      : `${daysLeft} days left`}
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        </div>

                        {needed > 0 && !isRejected && !isExpired && !isCompleted && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-medium">
                              <span className="text-green-600">{s} {collected} raised</span>
                              <span className="text-muted-foreground">{pct}% · {s} {Math.max(needed - collected, 0)} left</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )}

                        {isRejected && c.rejection_reason && (
                          <div className="rounded-lg bg-red-100 dark:bg-red-950/30 border border-red-200 p-2.5 text-xs text-red-700">
                            <strong>Rejection reason:</strong> {c.rejection_reason}
                          </div>
                        )}

                        {isExpired && (
                          <div className="rounded-lg bg-amber-100 dark:bg-amber-950/30 border border-amber-200 p-2.5 text-xs text-amber-700">
                            ⏰ This case expired because no Hero helped in time.
                            {c.was_free ? " Since this was your free case, you can submit a new case for FREE." : ""}
                          </div>
                        )}

                        {isCompleted && (
                          <div className="rounded-lg bg-blue-100 dark:bg-blue-950/30 border border-blue-200 p-2.5 text-xs text-blue-700">
                            ✅ This case was completed with the help of Heroes.
                            {collected > 0 && ` Total help received: ${s} ${collected} ${cur}`}
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5"
                          onClick={() => navigate({ to: "/cases/$id", params: { id: c.id } })}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {isCompleted ? "View Completed Case" : "View Details"}
                        </Button>
                      </div>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}
