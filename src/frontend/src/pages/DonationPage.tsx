import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, HeartHandshake, History, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getDonationHistory, getDonationSummary, submitDonation } from "@/lib/api";

const AMOUNTS = [3000, 5000, 10000, 15000, 20000, 25000];
const money = (value: number) => `PKR ${Math.max(0, Number(value) || 0).toLocaleString()}`;

export default function DonationPage() {
  const { isAuthenticated, user } = useAuth();
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [amount, setAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user?.id) return;
    try {
      const [nextSummary, nextHistory] = await Promise.all([getDonationSummary(), getDonationHistory()]);
      setSummary(nextSummary);
      setHistory(Array.isArray(nextHistory) ? nextHistory : []);
    } catch (error) {
      console.error(error);
      toast.error("Donation information could not be loaded.");
    }
  };
  useEffect(() => { void load(); }, [user?.id]);

  if (!isAuthenticated) {
    return <div className="container py-12"><Card className="mx-auto max-w-lg text-center"><CardContent className="space-y-4 p-8"><HeartHandshake className="mx-auto h-12 w-12 text-primary" /><h1 className="text-2xl font-bold">Sign in to support verified help</h1><p className="text-muted-foreground">Your contribution record and balance are private to your account.</p><Button asChild><Link to="/sign-in">Sign in</Link></Button></CardContent></Card></div>;
  }

  const selectedAmount = customAmount ? Number(customAmount) : amount;
  const submit = async () => {
    if (!Number.isFinite(selectedAmount) || selectedAmount <= 0) return toast.error("Enter a valid contribution amount.");
    if (!paymentMethod.trim() || !paymentReference.trim()) return toast.error("Payment method and reference are required.");
    setSubmitting(true);
    try {
      await submitDonation({ amount: selectedAmount, currency: "PKR", frequency, payment_method: paymentMethod.trim(), payment_reference: paymentReference.trim(), proof_url: proofUrl.trim() || null });
      toast.success("Contribution submitted for Givethra verification.");
      setPaymentReference(""); setProofUrl("");
      await load();
    } catch (error: any) { toast.error(error?.message || "Contribution could not be submitted."); }
    finally { setSubmitting(false); }
  };

  return <div className="container max-w-5xl space-y-6 py-6 md:py-10">
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-800 p-6 text-primary-foreground shadow-lg md:p-10">
      <div className="max-w-2xl space-y-4"><div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm"><HeartHandshake className="h-4 w-4" /> Verified Help. Real Impact.</div><h1 className="text-3xl font-bold md:text-5xl">Help us be ready when someone needs help.</h1><p className="text-sm leading-6 text-white/85 md:text-base">Your contribution helps keep funds available for verified help cases. When a genuine case is approved, available community contributions can provide meaningful support where it is needed.</p></div>
    </section>
    <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <Card><CardHeader><CardTitle>Make a contribution</CardTitle><p className="text-sm text-muted-foreground">Monthly contributions are recorded as a manual recurring pledge and require confirmation each time.</p></CardHeader><CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1"><button className={`rounded-lg px-3 py-2 text-sm font-semibold ${frequency === "once" ? "bg-background shadow" : "text-muted-foreground"}`} onClick={() => setFrequency("once")}>Donate Once</button><button className={`rounded-lg px-3 py-2 text-sm font-semibold ${frequency === "monthly" ? "bg-background shadow" : "text-muted-foreground"}`} onClick={() => setFrequency("monthly")}>Donate Monthly</button></div>
        <div><Label>Choose amount</Label><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{AMOUNTS.map((value) => <button key={value} className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${amount === value && !customAmount ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"}`} onClick={() => { setAmount(value); setCustomAmount(""); }}>{money(value)}</button>)}</div></div>
        <div><Label htmlFor="other-amount">Other amount (PKR)</Label><Input id="other-amount" inputMode="numeric" value={customAmount} onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Enter another amount" /></div>
        <div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor="payment-method">Payment method</Label><Input id="payment-method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="e.g. Bank transfer / Easypaisa" /></div><div><Label htmlFor="payment-reference">Payment/reference ID</Label><Input id="payment-reference" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="Reference after external payment" /></div></div>
        <div><Label htmlFor="proof-url">Payment proof link (optional)</Label><Input id="proof-url" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="Paste the proof link if available" /></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">After you pay through an approved Givethra method, submit the reference above. Your amount remains pending until an administrator verifies it.</div>
        <Button className="w-full bg-amber-500 text-black hover:bg-amber-400" disabled={submitting} onClick={submit}>{submitting ? "Submitting…" : `Donate ${money(selectedAmount)}`}</Button>
      </CardContent></Card>
      <div className="space-y-4"><Card><CardHeader><CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5" /> Contribution account</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-3 text-sm"><Metric label="Available" value={money(summary?.available_balance)} /><Metric label="Total approved" value={money(summary?.total_contributed)} /><Metric label="Used for help" value={money(summary?.amount_used)} /><Metric label="Pending" value={money(summary?.pending_amount)} /></CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Your contribution history</CardTitle></CardHeader><CardContent className="space-y-3">{history.length === 0 ? <p className="text-sm text-muted-foreground">No contributions submitted yet.</p> : history.slice(0, 8).map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><div><p className="font-semibold">{money(item.amount)}</p><p className="text-xs text-muted-foreground">{item.frequency === "monthly" ? "Monthly" : "Once"} · {new Date(item.submitted_at).toLocaleDateString()}</p></div><span className="inline-flex items-center gap-1 text-xs font-semibold capitalize"><CheckCircle2 className="h-3.5 w-3.5" />{item.status}</span></div>)}</CardContent></Card></div>
    </div>
  </div>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-muted/60 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-bold">{value}</p></div>; }
