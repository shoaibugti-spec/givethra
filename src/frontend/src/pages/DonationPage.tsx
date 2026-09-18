import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock3, Copy, History, Upload, WalletCards } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getDonationHistory, getDonationSummary, submitDonation, uploadFileToStorage } from "@/lib/api";

const AMOUNTS = [3000, 5000, 10000, 15000, 20000, 25000];
const PAYMENT_METHODS = {
  nayapay: { label: "NayaPay", accountTitle: "Shoaib Ahmed", account: "PK93NAYA1234503331641604" },
  usdt: { label: "Crypto Currency (USDT)", accountTitle: "USDT TRC20", account: "TNjaCQjQ5Yzm5tiVF8s121rUv5BH7y6hAC" },
} as const;
const money = (value: number) => `PKR ${Math.max(0, Number(value) || 0).toLocaleString()}`;
type PaymentMethod = keyof typeof PAYMENT_METHODS;

export default function DonationPage() {
  const { isAuthenticated, user } = useAuth();
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [amount, setAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("nayapay");
  const [paymentReference, setPaymentReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try { const [nextSummary, nextHistory] = await Promise.all([getDonationSummary(), getDonationHistory()]); setSummary(nextSummary); setHistory(Array.isArray(nextHistory) ? nextHistory : []); }
    catch (error) { console.error(error); toast.error("Contribution information could not be loaded."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [user?.id]);
  const selectedAmount = useMemo(() => Number(customAmount || amount), [amount, customAmount]);
  const selectedPayment = PAYMENT_METHODS[paymentMethod];
  function copyText(value: string) { void navigator.clipboard?.writeText(value); toast.success("Payment account copied."); }
  const submit = async () => {
    if (!Number.isFinite(selectedAmount) || selectedAmount <= 0) return toast.error("Enter a valid contribution amount.");
    if (!paymentReference.trim()) return toast.error("Transaction/reference number is required.");
    if (!proofFile && !proofUrl.trim()) return toast.error("Attach the payment receipt or provide a proof link.");
    setSubmitting(true);
    try {
      let uploadedProofUrl = proofUrl.trim();
      if (proofFile) { const safeName = proofFile.name.replace(/[^a-zA-Z0-9._-]+/g, "_"); uploadedProofUrl = await uploadFileToStorage(proofFile, `contributions/${user!.id}/${Date.now()}-${safeName}`); }
      await submitDonation({ amount: selectedAmount, currency: "PKR", frequency, payment_method: selectedPayment.label, payment_reference: paymentReference.trim(), proof_url: uploadedProofUrl });
      toast.success("Contribution submitted. It is pending admin verification."); setPaymentReference(""); setProofFile(null); setProofUrl(""); await load();
    } catch (error: any) { toast.error(error?.message || "Contribution could not be submitted."); }
    finally { setSubmitting(false); }
  };
  if (!isAuthenticated) return <Layout><div className="mx-auto max-w-lg px-4 py-12"><Card className="text-center"><CardContent className="space-y-4 p-8"><WalletCards className="mx-auto h-12 w-12 text-primary" /><h1 className="text-2xl font-bold">Sign in to contribute</h1><p className="text-muted-foreground">Your contribution record is private to your account.</p><Button asChild><Link to="/sign-in">Sign in</Link></Button></CardContent></Card></div></Layout>;
  return <Layout><div className="mx-auto max-w-5xl space-y-5 px-4 py-5 md:py-8">
    <section className="rounded-2xl border bg-gradient-to-r from-primary/10 via-card to-amber-50 p-5 shadow-sm dark:to-amber-950/20 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Community contribution</p><h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Keep verified help moving.</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Contribute once or monthly. After payment, attach the receipt and transaction number; admin verification moves the amount into the community balance.</p></section>
    <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><WalletCards className="h-5 w-5 text-primary" /> Contribution summary</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-3 md:grid-cols-5"><Metric label="Total raised" value={money(summary?.total_contributed)} tone="primary" /><Metric label="Spent" value={money(summary?.amount_used)} /><Metric label="Available" value={money(summary?.available_balance)} tone="green" /><Metric label="Direct help" value={money(summary?.direct_help)} /><Metric label="Contribution help" value={money(summary?.contribution_help)} /></CardContent></Card>
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <Card><CardHeader className="pb-3"><CardTitle className="text-lg">Choose contribution</CardTitle><p className="text-sm text-muted-foreground">Monthly means a manual recurring contribution; submit a new proof each time.</p></CardHeader><CardContent className="space-y-5"><div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">{([["once", "Give once"], ["monthly", "Give monthly"]] as const).map(([key, label]) => <button key={key} type="button" onClick={() => setFrequency(key)} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${frequency === key ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}>{label}</button>)}</div><div><Label>Amount (PKR)</Label><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{AMOUNTS.map((value) => <button key={value} type="button" onClick={() => { setAmount(value); setCustomAmount(""); }} className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${amount === value && !customAmount ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"}`}>{money(value)}</button>)}</div></div><div><Label htmlFor="other-amount">Other amount</Label><Input id="other-amount" inputMode="numeric" value={customAmount} onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Write another PKR amount" /></div><Button className="w-full" disabled={submitting} onClick={() => document.getElementById("payment-step")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Continue to payment</Button></CardContent></Card>
      <Card id="payment-step"><CardHeader className="pb-3"><CardTitle className="text-lg">Payment and proof</CardTitle><p className="text-sm text-muted-foreground">Complete these four short steps in order.</p></CardHeader><CardContent className="space-y-4"><Step number="1" title="Choose payment method"><div className="grid grid-cols-2 gap-2">{(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((key) => <button key={key} type="button" onClick={() => setPaymentMethod(key)} className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold ${paymentMethod === key ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{PAYMENT_METHODS[key].label}</button>)}</div></Step><Step number="2" title="Choose amount"><p className="rounded-lg bg-muted px-3 py-2 text-sm font-bold">{money(selectedAmount)} · {frequency === "monthly" ? "Monthly" : "Once"}</p></Step><Step number="3" title="Send payment to"><div className="space-y-2 rounded-xl bg-muted/60 p-3 text-sm"><CopyRow label="Account title" value={selectedPayment.accountTitle} onCopy={copyText} /><CopyRow label="Account / wallet" value={selectedPayment.account} onCopy={copyText} /><p className="text-xs text-muted-foreground">Send exactly the selected amount, then keep the receipt.</p></div></Step><Step number="4" title="Submit payment proof"><div className="space-y-3"><div><Label htmlFor="txn">TXN / reference number</Label><Input id="txn" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="Enter transaction number" /></div><div><Label htmlFor="receipt">Receipt screenshot or file</Label><Input id="receipt" type="file" accept="image/*,application/pdf" onChange={(e) => setProofFile(e.target.files?.[0] || null)} /><p className="mt-1 text-xs text-muted-foreground">{proofFile ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />{proofFile.name}</span> : <span className="flex items-center gap-1"><Upload className="h-3.5 w-3.5" />Attach payment proof</span>}</p></div><div><Label htmlFor="proof-link">Optional proof link</Label><Input id="proof-link" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="Only if the receipt is already hosted" /></div><Button className="w-full" disabled={submitting} onClick={submit}>{submitting ? "Submitting…" : `Submit ${money(selectedAmount)} request`}</Button><p className="text-center text-xs text-muted-foreground">Status starts as Pending and changes after admin checks the payment.</p></div></Step></CardContent></Card>
    </div>
    <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><History className="h-5 w-5 text-primary" /> Contribution history</CardTitle></CardHeader><CardContent className="space-y-2">{loading ? <p className="py-3 text-sm text-muted-foreground">Loading…</p> : history.length === 0 ? <p className="py-3 text-sm text-muted-foreground">No contributions submitted yet.</p> : history.slice(0, 12).map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"><div><p className="font-semibold">{money(item.amount)} · {item.frequency === "monthly" ? "Monthly" : "Once"}</p><p className="text-xs text-muted-foreground">{item.payment_method} · {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "—"}</p></div><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${item.status === "approved" || item.status === "completed" ? "bg-emerald-100 text-emerald-700" : item.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}><Clock3 className="h-3.5 w-3.5" />{item.status}</span></div>)}</CardContent></Card>
  </div></Layout>;
}
function Metric({ label, value, tone }: { label: string; value: string; tone?: "primary" | "green" }) { return <div className="rounded-xl bg-muted/60 p-3"><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className={`mt-1 text-lg font-bold ${tone === "primary" ? "text-primary" : tone === "green" ? "text-emerald-600" : "text-foreground"}`}>{value}</p></div>; }
function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) { return <section className="space-y-2"><div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{number}</span><h3 className="text-sm font-bold">{title}</h3></div>{children}</section>; }
function CopyRow({ label, value, onCopy }: { label: string; value: string; onCopy: (value: string) => void }) { return <div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="break-all font-mono text-xs font-semibold">{value}</p></div><Button type="button" size="sm" variant="outline" onClick={() => onCopy(value)} aria-label={`Copy ${label}`}><Copy className="h-3.5 w-3.5" /></Button></div>; }
