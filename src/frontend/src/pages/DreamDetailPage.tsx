// src/pages/DreamDetailPage.tsx
// Premium E-Commerce Style Product Detail & Participation Form

import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useParams } from "@tanstack/react-router";
import {
  CheckCircle2, ChevronRight, Clock3, Copy, FileCheck2, Info, Link2, Lock,
  MapPin, Share2, Shield, ShieldCheck, Sparkles, Upload, User, Wallet, Star, TrendingUp, Users, Package, BadgeCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createDreamParticipation, getDream, getDreamParticipationHistory, getDreamPaymentAccounts, uploadFileToStorage,
} from "@/lib/api";
import { handleImageError, resolveMediaUrl } from "@/lib/media";
import { Dream, money, marketValue, fundingPercent } from "@/pages/DreamsPage";

type Account = { id: string; label: string; method: string; account_title?: string; account_number: string; instructions?: string };
const PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Jammu and Kashmir"];

export default function DreamDetailPage() {
  const { id } = useParams({ from: "/dreams/$id" });
  const { user } = useAuth();
  const [dream, setDream] = useState<Dream | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState({
    full_name: "", father_husband_name: "", cnic_number: "", province: "", city: "",
    address: "", postal_code: "", mobile_number: "", payment_method: "", contribution_amount: "",
    transaction_id: "", proof_url: "", note: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"story" | "how" | "trust">("story");

  useEffect(() => {
    getDream(id).then((row) => { setDream(row); setForm((f) => ({ ...f, contribution_amount: row.contribution_amount ? String(row.contribution_amount) : f.contribution_amount })); }).catch(() => setDream(null));
    getDreamPaymentAccounts().then(setAccounts).catch(() => setAccounts([]));
  }, [id]);

  useEffect(() => {
    if (!user?.id) { setHistory([]); return; }
    getDreamParticipationHistory(id).then(setHistory).catch(() => setHistory([]));
  }, [id, user?.id]);

  if (!dream) {
    return <Layout><main className="mx-auto max-w-4xl p-10 text-center text-slate-500">Dream product not found or is not published yet.</main></Layout>;
  }

  const mv = marketValue(dream);
  const contribution = Number(dream.contribution_amount || 0);
  const imageUrl = resolveMediaUrl(dream.image_url);
  const progress = fundingPercent(dream);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const uploadProof = async (file: File | null) => {
    if (!file) return; setUploading(true);
    try { update("proof_url", await uploadFileToStorage(file, `dream-receipts/${dream.id}/${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, "-")}`)); toast.success("Receipt uploaded"); }
    catch (e: any) { toast.error(e?.message || "Upload failed"); }
    finally { setUploading(false); }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const required = ["full_name", "father_husband_name", "cnic_number", "province", "city", "address", "postal_code", "mobile_number", "payment_method", "transaction_id", "proof_url"];
    if (required.some((key) => !String((form as any)[key] || "").trim())) { toast.error("Complete all required fields."); return; }
    setBusy(true);
    try {
      await createDreamParticipation({ dream_id: dream.id, ...form, contribution_amount: Number(dream.contribution_amount || 0) });
      setSubmitted(true); getDreamParticipationHistory(dream.id).then(setHistory).catch(() => undefined);
      toast.success("Dream submission received!");
    } catch (e: any) { toast.error(e?.message || "Submission failed"); }
    finally { setBusy(false); }
  };

  const copyAccount = (value: string) => { navigator.clipboard?.writeText(value); toast.success("Copied"); };

  const shareProduct = async () => {
    const shareUrl = new URL(`/dreams/${dream.id}`, window.location.origin).toString();
    const shareData = { title: `${dream.name} | Givethra Dreams`, text: `${dream.name} — fixed contribution ${money(contribution)}.`, url: shareUrl };
    try { if (navigator.share) { await navigator.share(shareData); return; } await navigator.clipboard.writeText(shareUrl); toast.success("Link copied"); }
    catch (error: any) { if (error?.name !== "AbortError") toast.error("Failed to share"); }
  };

  return (
    <Layout>
      <main className="min-h-screen bg-slate-50 pb-36 md:pb-12">
        
        {/* BREADCRUMB */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-hidden px-4 py-3 text-xs text-slate-500 md:px-8">
            <Link to="/" className="shrink-0 hover:text-teal-700">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link to="/dreams" className="shrink-0 hover:text-teal-700">Dreams</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate font-bold text-slate-900">{dream.name}</span>
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
            
            {/* LEFT COLUMN: IMAGE & TABS */}
            <div className="min-w-0 space-y-6">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-50 md:min-h-[500px]">
                  {dream.image_url ? (
                    <img src={imageUrl} alt={dream.name} onError={handleImageError} className="h-full max-h-[600px] w-full object-contain p-4" />
                  ) : (<span className="text-sm font-semibold text-slate-400">Product image coming soon</span>)}
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-teal-700 shadow-sm backdrop-blur">{dream.category}</span>
                  <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">{dream.status}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex overflow-x-auto border-b border-slate-100 [scrollbar-width:none]">
                  {[{ k: "story", label: "Product Story" }, { k: "how", label: "How it works" }, { k: "trust", label: "Trust & Review" }].map((t) => (
                    <button key={t.k} onClick={() => setTab(t.k as any)} className={`shrink-0 whitespace-nowrap px-6 py-4 text-sm font-bold transition ${tab === t.k ? "border-b-2 border-teal-600 text-teal-700" : "text-slate-500 hover:text-slate-800"}`}>{t.label}</button>
                  ))}
                </div>
                <div className="p-6 text-sm leading-7 text-slate-600">
                  {tab === "story" && <p className="whitespace-pre-line">{dream.description}</p>}
                  {tab === "how" && (
                    <ol className="space-y-4">
                      {["Choose your Dream and enter your identity & address details.", "Transfer the fixed contribution to the Givethra account shown.", "Upload the payment receipt and submit your transaction ID.", "Our review team verifies and activates your participation."].map((step, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-100 text-xs font-black text-teal-700">{i + 1}</span>
                          <span className="text-slate-700 font-medium">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {tab === "trust" && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><ShieldCheck className="h-6 w-6 text-teal-600" /><p className="mt-3 text-sm font-bold text-slate-900">Manual verification</p><p className="text-xs text-slate-500 mt-1">Every payment is checked by our team.</p></div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><FileCheck2 className="h-6 w-6 text-teal-600" /><p className="mt-3 text-sm font-bold text-slate-900">Proof required</p><p className="text-xs text-slate-500 mt-1">Receipt screenshot is mandatory.</p></div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><Lock className="h-6 w-6 text-teal-600" /><p className="mt-3 text-sm font-bold text-slate-900">Secure data</p><p className="text-xs text-slate-500 mt-1">Your information is stored safely.</p></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: STICKY PRODUCT SUMMARY */}
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 ring-1 ring-emerald-200">{dream.status}</span>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700 ring-1 ring-teal-200">{dream.category}</span>
                  </div>
                  <h1 className="mt-4 font-display text-2xl font-black leading-tight text-slate-900 md:text-3xl">{dream.name}</h1>
                  
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /></div>
                    <span className="text-xs font-semibold text-slate-500">Verified Product</span>
                  </div>

                  <button onClick={shareProduct} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700">
                    <Share2 className="h-4 w-4" /> Share this product
                  </button>

                  {/* PRICE BOX */}
                  <div className="mt-6 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50/50 p-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-teal-800">Your Contribution</span>
                      {mv > 0 && (<span className="text-xs font-semibold text-slate-400 line-through">{money(mv)}</span>)}
                    </div>
                    <p className="mt-1 font-display text-4xl font-black text-teal-800">{money(contribution)}</p>
                    {mv > 0 && <p className="mt-1 text-[11px] font-medium text-teal-700/80">Market value {money(mv)} — you pay a fixed share.</p>}
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-bold text-teal-800"><span>Funded</span><span>{progress}%</span></div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-teal-200/50">
                        <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center"><Package className="mx-auto h-4 w-4 text-slate-400" /><p className="mt-1 text-[10px] font-bold uppercase text-slate-500">Quantity</p><p className="text-base font-black text-slate-900">{dream.quantity}</p></div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center"><Users className="mx-auto h-4 w-4 text-slate-400" /><p className="mt-1 text-[10px] font-bold uppercase text-slate-500">Participants</p><p className="text-base font-black text-slate-900">{dream.approved_participants}</p></div>
                  </div>

                  <a href="#participate" className="mt-6 hidden md:block">
                    <Button disabled={!contribution || submitted} className="h-14 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-base font-black text-white shadow-lg transition-transform hover:scale-[1.02]">
                      {submitted ? "Submission Received" : "Participate Now"} <ChevronRight className="ml-1 h-5 w-5" />
                    </Button>
                  </a>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-500">
                    <div><Shield className="mx-auto h-4 w-4 text-teal-600" /><p className="mt-1">Verified</p></div>
                    <div><Clock3 className="mx-auto h-4 w-4 text-teal-600" /><p className="mt-1">Fast Review</p></div>
                    <div><FileCheck2 className="mx-auto h-4 w-4 text-teal-600" /><p className="mt-1">Proof Needed</p></div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Dreams are separate from Givethra Help cases and do not change your Credit wallet rules.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* PARTICIPATION FORM SECTION */}
        <section id="participate" className="mx-auto max-w-7xl px-4 md:px-8">
          {submitted ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center shadow-sm">
              <BadgeCheck className="mx-auto h-16 w-16 text-emerald-600" />
              <h2 className="mt-4 font-display text-2xl font-black text-emerald-900">Submission Received</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-emerald-800">
                Your payment proof is with our review team. A registration number will be generated after approval.
              </p>
              <Link to="/dreams" className="mt-6 inline-flex"><Button variant="outline" className="rounded-xl border-emerald-300 font-bold text-emerald-700">Explore More Dreams</Button></Link>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
              <div className="border-b border-slate-100 bg-slate-50/50 p-6 md:p-8 rounded-t-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700">
                  <Sparkles className="h-3 w-3" /> Participation Form
                </div>
                <h2 className="mt-3 font-display text-2xl font-black text-slate-900">Reserve your spot in this Dream</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Fill in your identity and payment details. Our team verifies every submission manually.</p>
              </div>

              <form onSubmit={submit} className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0 space-y-8">
                  
                  {/* IDENTITY */}
                  <fieldset className="space-y-4">
                    <legend className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-800"><User className="h-4 w-4 text-teal-600" /> Personal Identity</legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Full Name" required value={form.full_name} onChange={(v) => update("full_name", v)} />
                      <Field label="Father / Husband Name" required value={form.father_husband_name} onChange={(v) => update("father_husband_name", v)} />
                      <Field label="CNIC Number" required placeholder="00000-0000000-0" value={form.cnic_number} onChange={(v) => update("cnic_number", v)} />
                      <Field label="Mobile Number" required value={form.mobile_number} onChange={(v) => update("mobile_number", v)} />
                    </div>
                  </fieldset>

                  {/* ADDRESS */}
                  <fieldset className="space-y-4 border-t border-slate-100 pt-6">
                    <legend className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-800"><MapPin className="h-4 w-4 text-teal-600" /> Shipping Address</legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600">Province *</Label>
                        <select value={form.province} onChange={(e) => update("province", e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200" required>
                          <option value="">Select region</option>
                          {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <Field label="City" required value={form.city} onChange={(v) => update("city", v)} />
                      <Field label="Postal Code" required value={form.postal_code} onChange={(v) => update("postal_code", v)} />
                      <Field label="Exact Address" required placeholder="House, street, area" value={form.address} onChange={(v) => update("address", v)} />
                    </div>
                  </fieldset>

                  {/* PAYMENT */}
                  <fieldset className="space-y-4 border-t border-slate-100 pt-6">
                    <legend className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-800"><Wallet className="h-4 w-4 text-teal-600" /> Payment Details</legend>

                    {accounts.length > 0 && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                        <p className="text-sm font-black text-amber-900">
                          Please send exactly <span className="text-teal-700">{money(contribution)}</span> to any account:
                        </p>
                        <div className="mt-3 space-y-3">
                          {accounts.map((a) => (
                            <div key={a.id} className="rounded-xl border border-amber-200 bg-white p-3 shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-slate-900">{a.label}</p>
                                  <p className="truncate text-xs font-bold text-teal-600">{a.method}</p>
                                  {a.account_title && <p className="mt-0.5 truncate text-[11px] text-slate-500">Title: {a.account_title}</p>}
                                </div>
                                <button type="button" onClick={() => copyAccount(a.account_number)} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1.5 text-[10px] font-black text-amber-900 hover:bg-amber-200">
                                  <Copy className="h-3 w-3" /> Copy
                                </button>
                              </div>
                              <p className="mt-2 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm font-black text-slate-800">{a.account_number}</p>
                              {a.instructions && <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{a.instructions}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600">Payment Method *</Label>
                        <select value={form.payment_method} onChange={(e) => update("payment_method", e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200" required>
                          <option value="">Select account</option>
                          {accounts.map((a) => <option key={a.id} value={`${a.method} · ${a.account_number}`}>{a.label} — {a.account_number}</option>)}
                        </select>
                      </div>
                      <Field label="Transaction ID / T.N.X" required placeholder="Enter transaction number" value={form.transaction_id} onChange={(v) => update("transaction_id", v)} />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600">Payment Proof *</Label>
                      <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/30 text-center transition hover:border-teal-500 hover:bg-teal-50">
                        <Upload className="h-6 w-6 text-teal-600" />
                        <span className="text-sm font-bold text-teal-700">{uploading ? "Uploading…" : form.proof_url ? "Receipt uploaded — replace" : "Attach receipt"}</span>
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => void uploadProof(e.target.files?.[0] || null)} />
                      </label>
                      {form.proof_url && <a href={form.proof_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 underline"><CheckCircle2 className="h-3.5 w-3.5" /> View uploaded receipt</a>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600">Additional Note (Optional)</Label>
                      <textarea value={form.note} onChange={(e) => update("note", e.target.value)} className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:bg-white" />
                    </div>
                  </fieldset>
                </div>

                {/* DESKTOP STICKY SUMMARY */}
                <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Order Summary</p>
                    <p className="mt-2 font-display text-lg font-black text-slate-900">{dream.name}</p>
                    <div className="mt-4 space-y-2 text-sm">
                      {mv > 0 && <Row label="Market Value" value={money(mv)} muted />}
                      <Row label="Your Contribution" value={money(contribution)} strong />
                    </div>
                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <Button type="submit" disabled={busy || uploading || !accounts.length || !contribution} className="h-14 w-full rounded-xl bg-slate-900 text-base font-black text-white hover:bg-teal-700">
                        {busy ? "Submitting…" : "Submit Participation"}
                      </Button>
                      {!accounts.length && <p className="mt-2 text-center text-[11px] font-bold text-rose-600">Payment accounts not configured.</p>}
                    </div>
                    <ul className="mt-5 space-y-2 text-[11px] font-medium text-slate-500">
                      <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-teal-600" /> Verified manual review</li>
                      <li className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-teal-600" /> Approval within 48 hours</li>
                      <li className="flex items-center gap-2"><FileCheck2 className="h-3.5 w-3.5 text-teal-600" /> Receipt proof required</li>
                    </ul>
                  </div>
                </aside>

                {/* MOBILE SUBMIT */}
                <div className="lg:hidden">
                  <Button type="submit" disabled={busy || uploading || !accounts.length || !contribution} className="h-14 w-full rounded-2xl bg-slate-900 text-base font-black text-white hover:bg-teal-700">
                    {busy ? "Submitting…" : "Submit Participation"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* HISTORY */}
        {user?.id && (
          <section className="mx-auto mt-10 max-w-7xl px-4 md:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-black text-slate-900">Your History</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Submission & approval updates for this product.</p>
              {history.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-5 text-sm font-medium text-slate-400">No submissions yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {history.map((entry) => {
                    const status = String(entry.to_status || "").toLowerCase();
                    const isRej = status === "rejected"; const isApp = ["approved", "active", "completed"].includes(status);
                    return (
                      <div key={entry.id} className={`rounded-xl border p-4 ${isRej ? "border-red-200 bg-red-50/60" : isApp ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className={`text-sm font-black capitalize ${isRej ? "text-red-700" : isApp ? "text-emerald-700" : "text-slate-800"}`}>{status.replaceAll("_", " ")}</p>
                          <time className="text-xs font-medium text-slate-500">{entry.changed_at ? new Date(entry.changed_at).toLocaleString() : "—"}</time>
                        </div>
                        {entry.note && <p className="mt-1 text-sm text-slate-600">{entry.note}</p>}
                        {entry.registration_number && <p className="mt-2 font-bold text-emerald-700">Reg No: {entry.registration_number}</p>}
                        {entry.rejection_reason && <p className="mt-2 font-bold text-red-700">Reason: {entry.rejection_reason}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* MOBILE STICKY CTA */}
        {!submitted && (
          <div className="fixed inset-x-0 bottom-16 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Contribution</p><p className="truncate text-xl font-black text-teal-700">{money(contribution)}</p></div>
              <a href="#participate" className="shrink-0"><Button className="h-12 rounded-xl bg-slate-900 px-6 font-black text-white hover:bg-teal-700">Participate</Button></a>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold text-slate-600">{label} {required && "*"}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="h-12 rounded-xl border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200" />
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-slate-500">{label}</span>
      <span className={strong ? "text-lg font-black text-teal-700" : muted ? "text-sm font-semibold text-slate-400 line-through" : "font-bold text-slate-900"}>{value}</span>
    </div>
  );
}
