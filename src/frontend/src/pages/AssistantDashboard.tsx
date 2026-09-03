// src/frontend/src/pages/AssistantDashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { getAssistantPendingPayments, assistantPayCase } from "@/lib/api";

interface PaymentCase {
  id: string;
  title: string;
  amount_needed: number;
  amount_collected: number;
  total_contributions: number;
  remaining_to_pay: number;
  requester_id: string;
}

export default function AssistantDashboard() {
  const { user, isAuthenticated, isAssistant } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<PaymentCase[]>([]);
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
    fetchPayments();
  }, [isAuthenticated, isAssistant, navigate]);

  const fetchPayments = async () => {
    try {
      const data = await getAssistantPendingPayments();
      setCases(data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load pending payments");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (caseId: string, amount: number) => {
    if (!confirm(`Are you sure you want to pay ${amount} for this case?`)) return;
    setProcessing(caseId);
    try {
      // آپ چاہیں تو یہاں ایک موڈل بنا سکتے ہیں تاکہ رسید اور TXN ID ڈالی جا سکے
      const result = await assistantPayCase(caseId, amount);
      toast.success(`Payment of ${amount} successful!`);
      setCases(prev => prev.filter(c => c.id !== caseId));
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
        <h1 className="text-2xl font-bold mb-6">Assistant Dashboard – Pending Payments</h1>
        {cases.length === 0 ? (
          <p className="text-muted-foreground">No pending payments. All contributions have been processed.</p>
        ) : (
          <div className="space-y-4">
            {cases.map((c) => (
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
      </div>
    </Layout>
  );
}
