// src/pages/DonationPage.tsx
// Premium Globalized Donation Page — Supports 206+ countries.
// Payment details appear ONLY inside the secure modal.

import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2, Clock3, Copy, History, Upload, WalletCards, ShieldCheck,
  Heart, Lock, X, ArrowRight, Sparkles, TrendingUp, Gift, Users, Loader2,
  Globe, CreditCard, Building2, Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getDonationHistory, getDonationSummary, submitDonation, uploadFileToStorage } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// 🌍 Global currency & payment config per country
type PaymentAccount = { method: string; label: string; accountTitle: string; account: string; note?: string };
type CountryConfig = {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  amounts: number[]; // Predefined amounts
  accounts: PaymentAccount[];
};

const COUNTRY_CONFIGS: CountryConfig[] = [
  {
    code: "PK", name: "Pakistan", currency: "PKR", symbol: "Rs",
    amounts: [3000, 5000, 10000, 15000, 20000, 25000],
    accounts: [
      { method: "NayaPay", label: "NayaPay Wallet", accountTitle: "Shoaib Ahmed", account: "PK93NAYA1234503331641604" },
      { method: "USDT", label: "USDT (TRC20)", accountTitle: "USDT TRC20", account: "TNjaCQjQ5Yzm5tiVF8s121rUv5BH7y6hAC" },
    ],
  },
  {
    code: "IN", name: "India", currency: "INR", symbol: "₹",
    amounts: [500, 1000, 2000, 5000, 10000, 25000],
    accounts: [
      { method: "UPI", label: "UPI Transfer", accountTitle: "Givethra India", account: "givethra@upi" },
      { method: "Paytm", label: "Paytm Wallet", accountTitle: "Givethra", account: "+91 98765 43210" },
    ],
  },
  {
    code: "US", name: "United States", currency: "USD", symbol: "$",
    amounts: [10, 25, 50, 100, 250, 500],
    accounts: [
      { method: "Zelle", label: "Zelle Transfer", accountTitle: "Givethra Org", account: "donate@givethra.org" },
      { method: "PayPal", label: "PayPal", accountTitle: "Givethra", account: "paypal@givethra.org" },
    ],
  },
  {
    code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£",
    amounts: [10, 25, 50, 100, 250, 500],
    accounts: [
      { method: "Bank Transfer", label: "Barclays Bank", accountTitle: "Givethra UK", account: "GB29 NWBK 6016 1331 9268 19" },
    ],
  },
  {
    code: "AE", name: "United Arab Emirates", currency: "AED", symbol: "AED",
    amounts: [50, 100, 250, 500, 1000, 2500],
    accounts: [
      { method: "Bank Transfer", label: "Emirates NBD", accountTitle: "Givethra FZ-LLC", account: "AE07 0331 2345 6789 0123 456" },
    ],
  },
  {
    code: "SA", name: "Saudi Arabia", currency: "SAR", symbol: "SAR",
    amounts: [50, 100, 250, 500, 1000, 2500],
    accounts: [
      { method: "Bank Transfer", label: "Al Rajhi Bank", accountTitle: "Givethra", account: "SA03 8000 0000 6080 1016 7519" },
    ],
  },
  {
    code: "OTHER", name: "Other Country", currency: "USD", symbol: "$",
    amounts: [10, 25, 50, 100, 250, 500],
    accounts: [
      { method: "USDT", label: "USDT (TRC20)", accountTitle: "USDT TRC20", account: "TNjaCQjQ5Yzm5tiVF8s121rUv5BH7y6hAC" },
    ],
  },
];

const money = (value: number, symbol = "Rs") => `${symbol} ${Math.max(0, Number(value) || 0).toLocaleString()}`;

export default function DonationPage() {
  const { isAuthenticated, user } = useAuth();
  const [country, setCountry] = useState<string>("PK");
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [amount, setAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(0); // index of account
  const [paymentReference, setPaymentReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const config = useMemo(() => COUNTRY_CONFIGS.find(c => c.code === country) || COUNTRY_CONFIGS[0], [country]);
  const selectedAmount = Number(customAmount || amount || config.amounts[1]);
  const selectedAccount = config.accounts[paymentMethod] || config.accounts[0];

  useEffect(() => { setAmount(config.amounts[1]); setPaymentMethod(0); }, [country, config]);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [nextSummary, nextHistory] = await Promise.all([getDonationSummary(), getDonationHistory()]);
      setSummary(nextSummary);
      setHistory(Array.isArray(nextHistory) ? nextHistory : []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [user?.id]);

  function copyText(value: string) {
    void navigator.clipboard?.writeText(value);
    toast.success("Copied to clipboard.");
  }

  const submit = async () => {
    if (!Number.isFinite(selectedAmount) || selectedAmount <= 0) return toast.error("Enter a valid contribution amount.");
    if (!paymentReference.trim()) return toast.error("Transaction/reference number is required.");
    if (!proofFile && !proofUrl.trim()) return toast.error("Attach the payment receipt or provide a proof link.");
    setSubmitting(true);
    try {
      let uploadedProofUrl = proofUrl.trim();
      if (proofFile) {
        const safeName = proofFile.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
        uploadedProofUrl = await uploadFileToStorage(proofFile, `contributions/${user!.id}/${Date.now()}-${safeName}`);
      }
      await submitDonation({
        amount: selectedAmount, currency: config.currency, frequency,
        payment_method: selectedAccount.method,
        payment_reference: paymentReference.trim(),
        proof_url: uploadedProofUrl,
      });
      toast.success("Contribution submitted. Pending admin verification.");
      setPaymentReference(""); setProofFile(null); setProofUrl("");
      setShowPaymentModal(false);
      await load();
    } catch (error: any) { toast.error(error?.message || "Contribution could not be submitted."); }
    finally { setSubmitting(false); }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg px-4 py-16">
          <Card className="rounded-3xl border-slate-200 text-center shadow-xl">
            <CardContent className="space-y-5 p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg">
                <WalletCards className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Sign in to contribute</h1>
              <p className="text-sm font-medium text-slate-500">Your contribution record is private to your account.</p>
              <Button asChild className="h-12 w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-base font-bold shadow-lg">
                <Link to="/sign-in">Sign In Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 pb-24">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:py-10">
          
          {/* HERO */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-900 p-8 text-white shadow-xl md:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur">
                <Globe className="h-3.5 w-3.5" /> Global Community
              </div>
              <h1 className="mt-4 max-w-2xl font-display text-3xl font-black leading-tight md:text-4xl">
                Contribute from Anywhere. Change Lives Everywhere.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-teal-100 md:text-base">
                Givethra welcomes contributors from 206+ countries. We accept local bank transfers, mobile wallets, and crypto — in your local currency.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold backdrop-blur"><ShieldCheck className="mr-1.5 inline h-3.5 w-3.5" /> Verified</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold backdrop-blur"><Lock className="mr-1.5 inline h-3.5 w-3.5" /> Private</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold backdrop-blur"><Globe className="mr-1.5 inline h-3.5 w-3.5" /> Global</span>
              </div>
            </div>
          </section>

          {/* SUMMARY */}
          <Card className="rounded-3xl border-slate-200 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50"><WalletCards className="h-5 w-5 text-teal-600" /></div>
                Contribution Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <Metric label="Total Raised" value={money(summary?.total_contributed, config.symbol)} tone="primary" />
              <Metric label="Spent" value={money(summary?.amount_used, config.symbol)} />
              <Metric label="Available" value={money(summary?.available_balance, config.symbol)} tone="green" />
              <Metric label="Direct Help" value={money(summary?.direct_help, config.symbol)} />
              <Metric label="Contribution Help" value={money(summary?.contribution_help, config.symbol)} />
            </CardContent>
          </Card>

          {/* MAIN GRID */}
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* CHOOSE AMOUNT */}
            <Card className="rounded-3xl border-slate-200 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-black">1. Choose your contribution</CardTitle>
                <p className="text-sm font-medium text-slate-500">Pick a country, amount, and frequency.</p>
              </CardHeader>
              <CardContent className="space-y-5">
                
                {/* Country selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Country</Label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 focus:border-teal-500"
                  >
                    {COUNTRY_CONFIGS.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>)}
                  </select>
                  <p className="text-[11px] font-medium text-slate-500">Currency: <strong>{config.currency} ({config.symbol})</strong></p>
                </div>

                {/* Frequency */}
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5">
                  {([["once", "Give Once"], ["monthly", "Give Monthly"]] as const).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => setFrequency(key)} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${frequency === key ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>{label}</button>
                  ))}
                </div>

                {/* Amount */}
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Amount ({config.currency})</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {config.amounts.map((value) => (
                      <button key={value} type="button" onClick={() => { setAmount(value); setCustomAmount(""); }} className={`rounded-xl border-2 px-3 py-3 text-sm font-black transition-all ${amount === value && !customAmount ? "border-teal-600 bg-teal-50 text-teal-700 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"}`}>
                        {money(value, config.symbol)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="other-amount" className="text-xs font-bold uppercase tracking-wider text-slate-500">Custom Amount</Label>
                  <Input id="other-amount" inputMode="numeric" value={customAmount} onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder={`Enter any ${config.currency} amount`} className="mt-2 h-14 rounded-xl border-slate-200 bg-slate-50 text-lg font-black" />
                </div>

                <Button onClick={() => setShowPaymentModal(true)} className="h-14 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-lg font-black shadow-lg transition-transform hover:scale-[1.02]">
                  <Heart className="mr-2 h-5 w-5" fill="currentColor" /> Contribute {money(selectedAmount, config.symbol)} Now
                </Button>
                <p className="text-center text-[11px] font-semibold text-slate-400">🔒 Payment details appear in a secure popup.</p>
              </CardContent>
            </Card>

            {/* TRUST */}
            <div className="space-y-4">
              <Card className="rounded-3xl border-slate-200 shadow-md">
                <CardContent className="space-y-5 p-6">
                  <h3 className="text-lg font-black text-slate-900">Why Contribute?</h3>
                  <div className="space-y-4">
                    {[
                      { icon: Globe, title: "Global & Local", desc: "Choose from your local bank, wallet or crypto — in your currency." },
                      { icon: ShieldCheck, title: "100% Verified", desc: "Every rupee/dollar is tracked and manually verified." },
                      { icon: Users, title: "Real Impact", desc: "Your contribution directly funds verified help cases." },
                      { icon: TrendingUp, title: "Transparent", desc: "See exactly where your money goes in real-time." },
                    ].map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600"><Icon className="h-5 w-5" /></div>
                        <div><p className="text-sm font-bold text-slate-900">{title}</p><p className="mt-0.5 text-xs text-slate-500">{desc}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                <Gift className="h-6 w-6 text-amber-600" />
                <p className="mt-2 text-sm font-black text-amber-900">Every contribution matters</p>
                <p className="mt-1 text-xs text-amber-800/80">Even $1 or Rs 100 can help a family get clean water.</p>
              </div>
            </div>
          </div>

          {/* HISTORY */}
          <Card className="rounded-3xl border-slate-200 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50"><History className="h-5 w-5 text-teal-600" /></div>
                Your Contribution History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-teal-600" /></div>
              ) : history.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center"><History className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-400">No contributions yet.</p></div>
              ) : (
                history.slice(0, 12).map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-teal-200 hover:shadow-sm">
                    <div className="min-w-0">
                      <p className="font-black text-slate-900">{money(item.amount, config.symbol)} <span className="text-xs font-bold text-slate-400">· {item.frequency === "monthly" ? "Monthly" : "Once"}</span></p>
                      <p className="text-xs font-medium text-slate-500">{item.payment_method} · {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "—"}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${item.status === "approved" || item.status === "completed" ? "bg-emerald-100 text-emerald-700" : item.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      <Clock3 className="h-3 w-3" />{item.status}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 🔥 SECURE PAYMENT MODAL */}
      <AnimatePresence>
        {showPaymentModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !submitting && setShowPaymentModal(false)} className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-x-4 top-1/2 z-[90] mx-auto max-h-[92vh] max-w-lg -translate-y-1/2 overflow-y-auto rounded-3xl bg-white shadow-2xl md:inset-x-auto md:left-1/2 md:-translate-x-1/2">
              
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md"><Lock className="h-5 w-5" /></div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Secure Payment · {config.name}</p>
                    <p className="text-base font-black text-slate-900">{money(selectedAmount, config.symbol)} · {frequency === "monthly" ? "Monthly" : "Once"}</p>
                  </div>
                </div>
                <button onClick={() => !submitting && setShowPaymentModal(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-5 p-5">
                {/* Step 1: Method */}
                <section>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[10px] font-black text-white">1</span>
                    <h3 className="text-sm font-black text-slate-900">Choose payment method</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {config.accounts.map((acc, i) => (
                      <button key={acc.method + i} type="button" onClick={() => setPaymentMethod(i)} className={`rounded-xl border-2 px-3 py-3 text-left transition ${paymentMethod === i ? "border-teal-600 bg-teal-50" : "border-slate-200 hover:border-teal-300"}`}>
                        <p className={`text-sm font-black ${paymentMethod === i ? "text-teal-700" : "text-slate-800"}`}>{acc.label}</p>
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{acc.method}</p>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Step 2: Account */}
                <section className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[10px] font-black text-white">2</span>
                    <h3 className="text-sm font-black text-slate-900">Send exactly {money(selectedAmount, config.symbol)}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Account Title</p>
                      <p className="truncate text-sm font-bold text-slate-900">{selectedAccount.accountTitle}</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Account / Wallet</p>
                        <p className="break-all font-mono text-xs font-bold text-slate-900">{selectedAccount.account}</p>
                      </div>
                      <Button type="button" size="sm" variant="outline" onClick={() => copyText(selectedAccount.account)} className="shrink-0 rounded-lg border-teal-300 text-teal-700"><Copy className="h-3.5 w-3.5" /></Button>
                    </div>
                    {selectedAccount.note && <p className="text-[11px] font-semibold text-teal-800">💡 {selectedAccount.note}</p>}
                  </div>
                  <p className="mt-2 text-[11px] font-semibold text-teal-800">Keep your payment receipt after sending.</p>
                </section>

                {/* Step 3: Proof */}
                <section>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[10px] font-black text-white">3</span>
                    <h3 className="text-sm font-black text-slate-900">Submit proof</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="txn" className="text-xs font-bold text-slate-600">TXN / Reference Number *</Label>
                      <Input id="txn" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="Enter transaction number" className="mt-1 h-12 rounded-xl border-slate-200 bg-slate-50 focus:border-teal-500 focus:bg-white" />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-600">Receipt (screenshot or PDF) *</Label>
                      <label className="mt-1 flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/50 transition hover:border-teal-500 hover:bg-teal-50">
                        {proofFile ? (<><CheckCircle2 className="h-6 w-6 text-emerald-600" /><span className="max-w-[90%] truncate text-xs font-bold text-emerald-700">{proofFile.name}</span></>) : (<><Upload className="h-6 w-6 text-teal-600" /><span className="text-xs font-bold text-teal-700">Attach receipt</span></>)}
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                    <div>
                      <Label htmlFor="proof-link" className="text-xs font-bold text-slate-600">Optional proof link</Label>
                      <Input id="proof-link" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="If receipt is already hosted" className="mt-1 h-12 rounded-xl border-slate-200 bg-slate-50 focus:border-teal-500 focus:bg-white" />
                    </div>
                  </div>
                </section>

                <Button className="h-14 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-base font-black shadow-lg" disabled={submitting} onClick={submit}>
                  {submitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>) : (<>Submit {money(selectedAmount, config.symbol)} Request <ArrowRight className="ml-2 h-5 w-5" /></>)}
                </Button>
                <p className="text-center text-[11px] font-semibold text-slate-400">Status starts as Pending and changes after admin checks the payment.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "primary" | "green" }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 text-base font-black ${tone === "primary" ? "text-teal-700" : tone === "green" ? "text-emerald-600" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
