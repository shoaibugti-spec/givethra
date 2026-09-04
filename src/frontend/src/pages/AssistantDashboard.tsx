// src/frontend/src/pages/AssistantDashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { 
  getAssistantPendingPayments, 
  assistantPayCase,
  getAssistantActiveCases 
} from "@/lib/api";

interface PaymentCase {
  id: string;
  title: string;
  amount_needed: number;
  amount_collected: number;
  total_contributions: number;
  remaining_to_pay: number;
  requester_id: string;
}

interface ActiveCase {
  id: string;
  title: string;
  category: string;
  country: string;
  city: string;
  urgency: string;
  amount_needed: number;
  amount_collected: number;
  status: string;
  submitted_at: string;
}

type Tab = "pending" | "active";

export default function AssistantDashboard() {
  const { user, isAuthenticated, isAssistant } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [pendingCases, setPendingCases] = useState<PaymentCase[]>([]);
  const [activeCases, setActiveCases] = useState<ActiveCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    if (!isAssistant) {
      navigate({ to: "/" });
      return;
    }
    fetchData();
  }, [isAuthenticated, isAssistant, navigate]);

  // 🔥 FIX: Use Promise.allSettled for better error handling
  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingResult, activeResult] = await Promise.allSettled([
        getAssistantPendingPayments(),
        getAssistantActiveCases(),
      ]);

      // Handle pending payments
      if (pendingResult.status === "fulfilled") {
        setPendingCases(pendingResult.value);
      } else {
        console.error("Pending payments failed:", pendingResult.reason);
        toast.error("Could not load pending payments.");
        setPendingCases([]);
      }

      // Handle active cases
      if (activeResult.status === "fulfilled") {
        setActiveCases(activeResult.value);
      } else {
        console.error("Active cases failed:", activeResult.reason);
        toast.error("Could not load active cases.");
        setActiveCases([]);
      }
    } catch (error) {
      // This catch shouldn't be reached with allSettled, but just in case
      console.error("Unexpected error:", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (caseId: string, amount: number) => {
    if (!confirm(`Are you sure you want to pay ${amount} for this case?`)) return;
    setProcessing(caseId);
    try {
      await assistantPayCase(caseId, amount);
      toast.success(`Payment of ${amount} successful!`);
      setPendingCases(prev => prev.filter(c => c.id !== caseId));
    } catch (error: any) {
      toast.error(error?.message || "Payment failed");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Assistant Dashboard</h1>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "pending"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending Payments ({pendingCases.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "active"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Active Cases ({activeCases.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "pending" && (
          <>
            {pendingCases.length === 0 ? (
              <p className="text-muted-foreground">No pending payments. All contributions have been processed.</p>
            ) : (
              <div className="space-y-4">
                {pendingCases.map((c) => (
                  <Card key={c.id}>
                    <CardHeader>
                      <CardTitle>{c.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Amount Collected:</span>
                        <span className="font-medium">{c.amount_collected}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Contributions:</span>
                        <span className="font-medium">{c.total_contributions}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-primary">
                        <span>Remaining to Pay:</span>
                        <span>{c.remaining_to_pay}</span>
                      </div>
                      <Button
                        onClick={() => handlePay(c.id, c.remaining_to_pay)}
                        disabled={processing === c.id}
                        className="w-full mt-2"
                      >
                        {processing === c.id ? "Processing..." : "Pay Now"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "active" && (
          <>
            {activeCases.length === 0 ? (
              <p className="text-muted-foreground">No active cases available at the moment.</p>
            ) : (
              <div className="space-y-4">
                {activeCases.map((c) => (
                  <Card key={c.id}>
                    <CardHeader>
                      <CardTitle>{c.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.urgency === "Emergency" ? "bg-red-100 text-red-700" :
                          c.urgency === "High" ? "bg-orange-100 text-orange-700" :
                          "bg-muted text-muted-foreground"
                        }`}>{c.urgency}</span>
                        <span className="text-xs text-muted-foreground">{c.city}, {c.country}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Amount Needed:</span>
                        <span className="font-medium">{c.amount_needed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Amount Collected:</span>
                        <span className="font-medium">{c.amount_collected || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <span className="font-medium capitalize">{c.status}</span>
                      </div>
                      <Button
                        onClick={() => navigate({ to: `/cases/${c.id}` })}
                        className="w-full mt-2"
                      >
                        View Case & Help
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
