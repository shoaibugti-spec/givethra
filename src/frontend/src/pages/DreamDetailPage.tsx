import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useParams } from "@tanstack/react-router";
import {
  CheckCircle2, ChevronRight, Clock3, Copy, FileCheck2, Info, Lock,
  MapPin, Shield, ShieldCheck, Sparkles, TrendingUp, Upload, User, Users, Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createDreamParticipation, getDream, getDreamPaymentAccounts, uploadFileToStorage,
} from "@/lib/api";
import { Dream, money, marketValue, fundingPercent, fundingLeft } from "@/pages/DreamsPage";

type Account = { id: string; label: string; method: string; account_title?: string; account_number: string; instructions?: string };
const PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Jammu and Kashmir"];

export default function DreamDetailPage() {
  const { id } = useParams({ from: "/dreams/$id" });
  const [dream, setDream] = useState<Dream | null>(null);
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
    getDream(id)
      .then((row) => {
        setDream(row);
        setForm((f) => ({ ...f, contribution_amount: row.contribution_amount ? String(row.contribution_amount) : f.contribution_amount }));
      })
      .catch(() => setDream(null));
    getDreamPaymentAccounts().then(setAccounts).catch(() => setAccounts([]));
  }, [id]);

  if (!dream) {
    return <Layout><main className="mx-auto max-w-4xl p-10 text-center">Dream product not found or is not published yet.</main></Layout>;
  }

  const percent = fundingPercent(dream);
  const left = fundingLeft(dream);
  const mv = marketValue(dream);
  const contribution = Number(dream.contribution_amount || 0);
  const spotsLeft = Math.max(0, Number(dream.participant_capacity || 0) - Number(dream.approved_participants || 0));

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const uploadProof = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      update("proof_url", await uploadFileToStorage(file, `dream-receipts/${dream.id}/${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, "-")}`));
      toast.success("Payment receipt uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Receipt upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const required = ["full_name", "father_husband_name", "cnic_number", "province", "city", "address", "postal_code", "mobile_number", "payment_method", "transaction_id", "proof_url"];
    if (required.some((key) => !String((form as any)[key] || "").trim())) {
      toast.error("Complete all identity, address, payment and receipt fields.");
      return;
    }
    setBusy(true);
    try {
      await createDreamParticipation({ dream_id: dream.id, ...form, contribution_amount: Number(dream.contribution_amount || 0) });
      setSubmitted(true);
      toast.success("Dream submission received for Givethra review.");
    } catch (e: any) {
      toast.error(e?.message || "Dream submission failed");
    } finally {
      setBusy(false);
    }
  };

  const copyAccount = (value: string) => {
    navigator.clipboard?.writeText(value);
    toast.success("Account number copied");
  };

  return (
    <Layout>
      <main className="min-h-screen bg-[#f7fafb] pb-36 md:pb-12">
        {/* BREADCRUMB */}
        <div className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-hidden px-4 py-2.5 text-[11px] text-muted-foreground md:px-8 md:text-xs">
            <Link to="/" className="shrink-0 hover:text-teal-700">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link to="/dreams" className="shrink-0 hover:text-teal-700">Dreams</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate font-semibold text-foreground">{dream.name}</span>
          </div>
        </div>

        {/* HERO */}
        <section className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
            <div className="min-w-0 space-y-5 md:space-y-6">
              <div className="overflow-hidden rounded-2xl border border-border bg-white p-2.5 shadow-sm md:rounded-3xl md:p-3">
                <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 via-white to-amber-50 md:min-h-[420px] md:rounded-2xl">
                  {dream.image_url ? (
                    <img src={dream.image_url} alt={dream.name} className="h-full max-h-[480px] w-full object-contain" />
                  ) : (
                    <span className="text-sm font-semibold text-teal-700">Product image coming soon</span>
                  )}
                  <span className="absolute left-2 top-2 max-w-[calc(100%-100px)] truncate rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700 shadow md:left-4 md:top-4 md:max-w-[60%] md:px-3 md:py-1.5 md:text-[11px]">{dream.category}</span>
                  <span className="absolute right-2 top-2 shrink-0 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow md:right-4 md:top-4 md:px-3 md:py-1.5 md:text-[11px]">{dream.status}</span>
                </div>
              </div>

              {/* TABS */}
              <div className="rounded-2xl border border-border bg-white shadow-sm md:rounded-3xl">
                <div className="flex overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {[
                    { k: "story", label: "Product story" },
                    { k: "how", label: "How it works" },
                    { k: "trust", label: "Trust & review" },
                  ].map((t) => (
                    <button
                      key={t.k}
                      onClick={() => setTab(t.k as any)}
                      className={`shrink-0 whitespace-nowrap px-4 py-3 text-xs font-bold transition md:px-5 md:text-sm ${tab === t.k ? "border-b-2 border-teal-600 text-teal-700" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="p-4 text-sm leading-7 text-muted-foreground md:p-6">
                  {tab === "story" && <p>{dream.description}</p>}
                  {tab === "how" && (
                    <ol className="space-y-3">
                      {[
                        "Choose your Dream and enter your identity & address details.",
                        "Transfer the fixed contribution to the Givethra account shown.",
                        "Upload the payment receipt and submit your transaction ID.",
                        "Our review team verifies and activates your participation.",
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-600 text-xs font-bold text-white">{i + 1}</span>
                          <span className="text-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {tab === "trust" && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border bg-muted/40 p-3 md:p-4"><ShieldCheck className="h-5 w-5 text-teal-700" /><p className="mt-2 text-sm font-bold text-foreground">Manual verification</p><p className="text-xs">Every payment is checked by our team.</p></div>
                      <div className="rounded-2xl border bg-muted/40 p-3 md:p-4"><FileCheck2 className="h-5 w-5 text-teal-700" /><p className="mt-2 text-sm font-bold text-foreground">Proof required</p><p className="text-xs">Receipt screenshot is mandatory.</p></div>
                      <div className="rounded-2xl border bg-muted/40 p-3 md:p-4"><Lock className="h-5 w-5 text-teal-700" /><p className="mt-2 text-sm font-bold text-foreground">Secure data</p><p className="text-xs">Your information is stored safely.</p></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT STICKY */}
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-3 md:space-y-4">
                <div className="rounded-2xl border border-border bg-white p-4 shadow-sm md:rounded-3xl md:p-5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">{dream.status}</span>
                    <span className="max-w-[60%] truncate rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">{dream.category}</span>
                  </div>
                  <h1 className="mt-2.5 font-display text-xl font-black leading-tight md:text-2xl">{dream.name}</h1>
                  <p className="mt-1.5 line-clamp-3 text-xs text-muted-foreground md:text-sm">{dream.description}</p>

                  {/* PRICE BLOCK */}
                  <div className="mt-4 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-amber-50 p-3.5 md:p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 md:text-[11px]">Your contribution</span>
                      {mv > 0 && (
                        <span className="shrink-0 text-[10px] font-semibold text-muted-foreground line-through md:text-xs">{money(mv)}</span>
                      )}
                    </div>
                    <p className="mt-1 font-display text-3xl font-black text-teal-700 md:text-4xl">{money(contribution)}</p>
                    {mv > 0 ? (
                      <p className="mt-1 text-[10px] text-teal-800/80 md:text-[11px]">Market value {money(mv)} — you pay a fixed share.</p>
                    ) : (
                      <p className="mt-1 text-[10px] text-teal-800/80 md:text-[11px]">One fixed amount — same for every participant.</p>
                    )}
                  </div>

                  {/* FUNDING */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="font-bold">Funding progress</span>
                      <span className="font-black text-amber-600">{percent}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-teal-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-amber-400" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground md:text-xs">
                      <span>{money(dream.funded_amount)} raised</span>
                      <span>{money(left)} left</span>
                    </div>
                  </div>

                  {/* META */}
                  <div className="mt-3 grid grid-cols-2 gap-2 md:mt-4 md:gap-3">
                    <div className="rounded-xl border bg-muted/30 p-2.5 md:p-3">
                      <Users className="h-4 w-4 text-teal-700" />
                      <p className="mt-1 text-xs font-bold text-foreground md:text-sm">{dream.approved_participants} joined</p>
                      <p className="text-[10px] text-muted-foreground md:text-xs">{spotsLeft} spots left</p>
                    </div>
                    <div className="rounded-xl border bg-muted/30 p-2.5 md:p-3">
                      <TrendingUp className="h-4 w-4 text-teal-700" />
                      <p className="mt-1 text-xs font-bold text-foreground md:text-sm">{dream.participant_capacity} total</p>
                      <p className="text-[10px] text-muted-foreground md:text-xs">capacity</p>
                    </div>
                  </div>

                  <a href="#participate" className="mt-4 hidden md:block">
                    <Button disabled={!contribution || submitted} className="h-12 w-full rounded-xl bg-teal-700 text-base font-bold hover:bg-teal-800">
                      {submitted ? "Submission received" : "Participate Now"}
                    </Button>
                  </a>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[9px] font-semibold text-muted-foreground md:mt-4 md:text-[10px]">
                    <div><Shield className="mx-auto h-4 w-4 text-teal-700" /><p className="mt-1">Verified</p></div>
                    <div><Clock3 className="mx-auto h-4 w-4 text-teal-700" /><p className="mt-1">Reviewed</p></div>
                    <div><FileCheck2 className="mx-auto h-4 w-4 text-teal-700" /><p className="mt-1">Proof needed</p></div>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900 md:text-xs">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Dreams are separate from Givethra Help cases and do not change your existing Credit wallet rules.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* FORM */}
        <section id="participate" className="mx-auto max-w-7xl px-4 md:px-8">
          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm md:rounded-3xl md:p-8">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h2 className="mt-4 font-display text-xl font-bold text-emerald-900 md:text-2xl">Submission received</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-emerald-800">
                Your payment proof is with the Givethra review team. A registration number will be generated after approval.
              </p>
              <Link to="/dreams" className="mt-6 inline-flex">
                <Button variant="outline" className="rounded-xl border-emerald-300">Explore more Dreams</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white shadow-sm md:rounded-3xl">
              <div className="border-b border-border p-4 md:p-6">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700">
                  <Sparkles className="h-3.5 w-3.5" /> Participation form
                </div>
                <h2 className="mt-2 font-display text-xl font-black md:text-2xl">Reserve your spot in this Dream</h2>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">Fill in your identity and payment details. Our team verifies every submission manually.</p>
              </div>

              <form onSubmit={submit} className="grid gap-5 p-4 md:gap-6 md:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 space-y-5 md:space-y-6">
                  {/* IDENTITY */}
                  <fieldset className="space-y-3.5 md:space-y-4">
                    <legend className="flex items-center gap-2 text-sm font-bold text-foreground"><User className="h-4 w-4 text-teal-700" /> Identity</legend>
                    <div className="grid gap-3.5 sm:grid-cols-2 md:gap-4">
                      <Field label="Full Name" required value={form.full_name} onChange={(v) => update("full_name", v)} />
                      <Field label="Father / Husband Name" required value={form.father_husband_name} onChange={(v) => update("father_husband_name", v)} />
                      <Field label="CNIC Number" required placeholder="00000-0000000-0" value={form.cnic_number} onChange={(v) => update("cnic_number", v)} />
                      <Field label="Mobile Number" required value={form.mobile_number} onChange={(v) => update("mobile_number", v)} />
                    </div>
                  </fieldset>

                  {/* ADDRESS */}
                  <fieldset className="space-y-3.5 border-t pt-5 md:space-y-4 md:pt-6">
                    <legend className="flex items-center gap-2 text-sm font-bold text-foreground"><MapPin className="h-4 w-4 text-teal-700" /> Address</legend>
                    <div className="grid gap-3.5 sm:grid-cols-2 md:gap-4">
                      <div>
                        <Label>Province *</Label>
                        <select value={form.province} onChange={(e) => update("province", e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm" required>
                          <option value="">Select province / region</option>
                          {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <Field label="City" required value={form.city} onChange={(v) => update("city", v)} />
                      <Field label="Postal Code" required value={form.postal_code} onChange={(v) => update("postal_code", v)} />
                      <Field label="Exact Address" required placeholder="House, street, area" value={form.address} onChange={(v) => update("address", v)} />
                    </div>
                  </fieldset>

                  {/* PAYMENT */}
                  <fieldset className="space-y-3.5 border-t pt-5 md:space-y-4 md:pt-6">
                    <legend className="flex items-center gap-2 text-sm font-bold text-foreground"><Wallet className="h-4 w-4 text-teal-700" /> Payment details</legend>

                    {accounts.length > 0 && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 md:p-4">
                        <p className="text-xs font-bold text-amber-900 md:text-sm">
                          Send <span className="text-teal-700">{money(contribution)}</span> to any Givethra account
                        </p>
                        <div className="mt-3 space-y-2.5">
                          {accounts.map((a) => (
                            <div key={a.id} className="rounded-xl border border-amber-200 bg-white/80 p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-foreground">{a.label}</p>
                                  <p className="truncate text-xs font-semibold text-teal-700">{a.method}</p>
                                  {a.account_title && (
                                    <p className="mt-1 truncate text-[11px] text-muted-foreground">Title: {a.account_title}</p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyAccount(a.account_number)}
                                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[10px] font-bold text-amber-900 hover:bg-amber-100"
                                >
                                  <Copy className="h-3 w-3" /> Copy
                                </button>
                              </div>
                              <p className="mt-2 break-all rounded-lg bg-amber-50 px-2 py-1.5 font-mono text-xs font-bold text-foreground md:text-sm">
                                {a.account_number}
                              </p>
                              {a.instructions && (
                                <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{a.instructions}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-3.5 sm:grid-cols-2 md:gap-4">
                      <div className="min-w-0">
                        <Label>Payment method *</Label>
                        <select value={form.payment_method} onChange={(e) => update("payment_method", e.target.value)} className="mt-1.5 h-11 w-full truncate rounded-xl border bg-background px-3 text-sm" required>
                          <option value="">Select account</option>
                          {accounts.map((a) => <option key={a.id} value={`${a.method} · ${a.account_number}`}>{a.label} — {a.account_number}</option>)}
                        </select>
                      </div>
                      <Field label="Transaction ID / T.N.X" required placeholder="Enter transaction number" value={form.transaction_id} onChange={(v) => update("transaction_id", v)} />
                    </div>

                    <div>
                      <Label>Payment proof / receipt screenshot *</Label>
                      <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/40 p-4 text-center text-xs font-semibold text-teal-700 transition hover:bg-teal-50 md:p-5 md:text-sm">
                        <Upload className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {uploading ? "Uploading receipt…" : form.proof_url ? "Receipt uploaded — replace" : "Attach payment screenshot"}
                        </span>
                        <input type="file" accept="image/*,.pdf" capture="environment" className="hidden" onChange={(e) => void uploadProof(e.target.files?.[0] || null)} />
                      </label>
                      {form.proof_url && (
                        <a href={form.proof_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 underline">
                          <CheckCircle2 className="h-3.5 w-3.5" /> View uploaded receipt
                        </a>
                      )}
                    </div>

                    <div>
                      <Label>Additional note (optional)</Label>
                      <textarea value={form.note} onChange={(e) => update("note", e.target.value)} className="mt-1.5 min-h-24 w-full rounded-xl border bg-background px-3 py-2 text-sm" />
                    </div>
                  </fieldset>
                </div>

                {/* DESKTOP STICKY SUMMARY */}
                <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
                  <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Order summary</p>
                    <p className="mt-2 font-display text-lg font-bold">{dream.name}</p>
                    <div className="mt-3 space-y-1.5 text-sm">
                      {mv > 0 && <Row label="Market value" value={money(mv)} muted />}
                      <Row label="Your contribution" value={money(contribution)} strong />
                      <Row label="Funding progress" value={`${percent}%`} />
                    </div>
                    <div className="mt-4 border-t border-teal-200 pt-4">
                      <Button
                        type="submit"
                        disabled={busy || uploading || !accounts.length || !contribution}
                        className="h-12 w-full rounded-xl bg-teal-700 font-bold hover:bg-teal-800"
                      >
                        {busy ? "Submitting…" : "Submit Dream Participation"}
                      </Button>
                      {!accounts.length && <p className="mt-2 text-[11px] text-rose-700">Payment accounts are not configured yet.</p>}
                    </div>
                    <ul className="mt-4 space-y-1.5 text-[11px] text-teal-900/80">
                      <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Verified manual review</li>
                      <li className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Approval usually within 48 hours</li>
                      <li className="flex items-center gap-1.5"><FileCheck2 className="h-3.5 w-3.5" /> Receipt proof required</li>
                    </ul>
                  </div>
                </aside>

                {/* MOBILE submit */}
                <div className="lg:hidden">
                  <Button
                    type="submit"
                    disabled={busy || uploading || !accounts.length || !contribution}
                    className="h-12 w-full rounded-xl bg-teal-700 text-base font-bold hover:bg-teal-800"
                  >
                    {busy ? "Submitting…" : "Submit Dream Participation"}
                  </Button>
                  {!accounts.length && <p className="mt-2 text-center text-[11px] text-rose-700">Payment accounts are not configured yet.</p>}
                </div>
              </form>
            </div>
          )}
        </section>

        {/* MOBILE STICKY CTA */}
        {!submitted && (
          <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-white/95 p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your contribution</p>
                <p className="truncate text-lg font-black text-teal-700">{money(contribution)}</p>
              </div>
              <a href="#participate" className="shrink-0">
                <Button className="h-11 rounded-xl bg-teal-700 px-5 font-bold">Participate</Button>
              </a>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}

function Field({
  label, value, onChange, placeholder, required,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div className="min-w-0">
      <Label>{label}{required ? " *" : ""}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="mt-1.5 h-11 rounded-xl" />
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "text-base font-black text-teal-700" : muted ? "text-muted-foreground line-through" : "font-semibold text-foreground"}>{value}</span>
    </div>
  );
}
