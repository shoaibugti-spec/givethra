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
import { createDreamParticipation, getDream, getDreamPaymentAccounts, uploadFileToStorage } from "@/lib/api";
import { Dream, money } from "@/pages/DreamsPage";

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

  const percent = Math.min(100, Math.round((Number(dream.funded_amount || 0) / Math.max(1, Number(dream.dream_price || 1))) * 100));
  const left = Math.max(0, Number(dream.dream_price || 0) - Number(dream.funded_amount || 0));
  const spotsLeft = Math.max(0, Number(dream.participant_capacity || 0) - Number(dream.approved_participants || 0));
  const contribution = Number(dream.contribution_amount || 0);

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
      <main className="min-h-screen bg-[#f7fafb] pb-28 md:pb-12">
        {/* BREADCRUMB */}
        <div className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground md:px-8">
            <Link to="/" className="hover:text-teal-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/dreams" className="hover:text-teal-700">Dreams</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="truncate font-semibold text-foreground">{dream.name}</span>
          </div>
        </div>

        {/* PRODUCT HERO */}
        <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* LEFT: image + tabs */}
            <div className="space-y-6">
              <div className="overflow-hidden rounded-3xl border border-border bg-white p-3 shadow-sm">
                <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 via-white to-amber-50 md:min-h-[420px]">
                  {dream.image_url ? (
                    <img src={dream.image_url} alt={dream.name} className="h-full max-h-[520px] w-full object-contain" />
                  ) : (
                    <span className="text-sm font-semibold text-teal-700">Product image coming soon</span>
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700 shadow">{dream.category}</span>
                  <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow">{dream.status}</span>
                </div>
              </div>

              {/* TABS */}
              <div className="rounded-3xl border border-border bg-white shadow-sm">
                <div className="flex overflow-x-auto border-b border-border">
                  {[
                    { k: "story", label: "Product story" },
                    { k: "how", label: "How it works" },
                    { k: "trust", label: "Trust & review" },
                  ].map((t) => (
                    <button
                      key={t.k}
                      onClick={() => setTab(t.k as any)}
                      className={`whitespace-nowrap px-5 py-3 text-sm font-bold transition ${tab === t.k ? "border-b-2 border-teal-600 text-teal-700" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="p-6 text-sm leading-7 text-muted-foreground">
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
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border bg-muted/40 p-4"><ShieldCheck className="h-5 w-5 text-teal-700" /><p className="mt-2 font-bold text-foreground">Manual verification</p><p className="text-xs">Every payment is checked by our team.</p></div>
                      <div className="rounded-2xl border bg-muted/40 p-4"><FileCheck2 className="h-5 w-5 text-teal-700" /><p className="mt-2 font-bold text-foreground">Proof required</p><p className="text-xs">Receipt screenshot is mandatory.</p></div>
                      <div className="rounded-2xl border bg-muted/40 p-4"><Lock className="h-5 w-5 text-teal-700" /><p className="mt-2 font-bold text-foreground">Secure data</p><p className="text-xs">Your information is stored safely.</p></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: sticky buy card */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-4">
                <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">{dream.status}</span>
                    <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">{dream.category}</span>
                  </div>
                  <h1 className="mt-3 font-display text-2xl font-black leading-tight">{dream.name}</h1>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{dream.description}</p>

                  {/* PRICE BLOCK */}
                  <div className="mt-5 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-amber-50 p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Your contribution</span>
                      <span className="text-xs font-semibold text-muted-foreground line-through">{money(dream.dream_price)}</span>
                    </div>
                    <p className="mt-1 font-display text-4xl font-black text-teal-700">{money(contribution)}</p>
                    <p className="mt-1 text-[11px] text-teal-800/80">One fixed amount — same for every participant.</p>
                  </div>

                  {/* FUNDING */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold">Funding progress</span>
                      <span className="font-black text-amber-600">{percent}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-teal-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-amber-400" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>{money(dream.funded_amount)} raised</span>
                      <span>{money(left)} left</span>
                    </div>
                  </div>

                  {/* META */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border bg-muted/30 p-3">
                      <Users className="h-4 w-4 text-teal-700" />
                      <p className="mt-1 font-bold text-foreground">{dream.approved_participants} joined</p>
                      <p className="text-muted-foreground">{spotsLeft} spots left</p>
                    </div>
                    <div className="rounded-xl border bg-muted/30 p-3">
                      <TrendingUp className="h-4 w-4 text-teal-700" />
                      <p className="mt-1 font-bold text-foreground">{dream.participant_capacity} total</p>
                      <p className="text-muted-foreground">capacity</p>
                    </div>
                  </div>

                  <a href="#participate" className="mt-5 block">
                    <Button disabled={!contribution || submitted} className="h-12 w-full rounded-xl bg-teal-700 text-base font-bold hover:bg-teal-800">
                      {submitted ? "Submission received" : "Participate Now"}
                    </Button>
                  </a>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-muted-foreground">
                    <div><Shield className="mx-auto h-4 w-4 text-teal-700" /><p className="mt-1">Verified</p></div>
                    <div><Clock3 className="mx-auto h-4 w-4 text-teal-700" /><p className="mt-1">Reviewed</p></div>
                    <div><FileCheck2 className="mx-auto h-4 w-4 text-teal-700" /><p className="mt-1">Proof needed</p></div>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Dreams are separate from Givethra Help cases and do not change your existing Credit wallet rules.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* PARTICIPATION FORM */}
        <section id="participate" className="mx-auto max-w-7xl px-4 md:px-8">
          {submitted ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h2 className="mt-4 font-display text-2xl font-bold text-emerald-900">Submission received</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-emerald-800">
                Your payment proof is with the Givethra review team. A registration number will be generated after approval.
              </p>
              <Link to="/dreams" className="mt-6 inline-flex">
                <Button variant="outline" className="rounded-xl border-emerald-300">Explore more Dreams</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-white shadow-sm">
              <div className="border-b border-border p-5 md:p-6">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700">
                  <Sparkles className="h-3.5 w-3.5" /> Participation form
                </div>
                <h2 className="mt-2 font-display text-2xl font-black">Reserve your spot in this Dream</h2>
                <p className="mt-1 text-sm text-muted-foreground">Fill in your identity and payment details. Our team verifies every submission manually.</p>
              </div>

              <form onSubmit={submit} className="grid gap-6 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  {/* IDENTITY */}
                  <fieldset className="space-y-4">
                    <legend className="flex items-center gap-2 text-sm font-bold text-foreground"><User className="h-4 w-4 text-teal-700" /> Identity</legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Full Name" required value={form.full_name} onChange={(v) => update("full_name", v)} />
                      <Field label="Father / Husband Name" required value={form.father_husband_name} onChange={(v) => update("father_husband_name", v)} />
                      <Field label="CNIC Number" required placeholder="00000-0000000-0" value={form.cnic_number} onChange={(v) => update("cnic_number", v)} />
                      <Field label="Mobile Number" required value={form.mobile_number} onChange={(v) => update("mobile_number", v)} />
                    </div>
                  </fieldset>

                  {/* ADDRESS */}
                  <fieldset className="space-y-4 border-t pt-6">
                    <legend className="flex items-center gap-2 text-sm font-bold text-foreground"><MapPin className="h-4 w-4 text-teal-700" /> Address</legend>
                    <div className="grid gap-4 sm:grid-cols-2">
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
                  <fieldset className="space-y-4 border-t pt-6">
                    <legend className="flex items-center gap-2 text-sm font-bold text-foreground"><Wallet className="h-4 w-4 text-teal-700" /> Payment details</legend>

                    {accounts.length > 0 && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-bold text-amber-900">
                          Send <span className="text-teal-700">{money(contribution)}</span> to any Givethra account
                        </p>
                        <div className="mt-3 space-y-3">
                          {accounts.map((a) => (
                            <div key={a.id} className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="text-sm">
                                <p className="font-bold text-foreground">{a.label} · <span className="text-teal-700">{a.method}</span></p>
                                <p className="text-xs text-muted-foreground">Title: {a.account_title || "—"}</p>
                                <p className="font-mono text-sm font-bold text-foreground">{a.account_number}</p>
                                {a.instructions && <p className="mt-1 text-xs text-muted-foreground">{a.instructions}</p>}
                              </div>
                              <button
                                type="button"
                                onClick={() => copyAccount(a.account_number)}
                                className="inline-flex items-center gap-1 self-start rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 sm:self-auto"
                              >
                                <Copy className="h-3.5 w-3.5" /> Copy
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Payment method *</Label>
                        <select value={form.payment_method} onChange={(e) => update("payment_method", e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm" required>
                          <option value="">Select account</option>
                          {accounts.map((a) => <option key={a.id} value={`${a.method} · ${a.account_number}`}>{a.label} — {a.account_number}</option>)}
                        </select>
                      </div>
                      <Field label="Transaction ID / T.N.X" required placeholder="Enter transaction number" value={form.transaction_id} onChange={(v) => update("transaction_id", v)} />
                    </div>

                    <div>
                      <Label>Payment proof / receipt screenshot *</Label>
                      <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/40 p-5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50">
                        <Upload className="h-4 w-4" />
                        {uploading ? "Uploading receipt…" : form.proof_url ? "Receipt uploaded — replace" : "Attach payment screenshot"}
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

                {/* STICKY SUMMARY */}
                <aside className="lg:sticky lg:top-24 lg:self-start">
                  <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Order summary</p>
                    <p className="mt-2 font-display text-lg font-bold">{dream.name}</p>
                    <div className="mt-3 space-y-1.5 text-sm">
                      <Row label="Market value" value={money(dream.dream_price)} muted />
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
              </form>
            </div>
          )}
        </section>

        {/* MOBILE STICKY CTA */}
        {!submitted && (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white p-3 shadow-lg md:hidden">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your contribution</p>
                <p className="text-xl font-black text-teal-700">{money(contribution)}</p>
              </div>
              <a href="#participate">
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
    <div>
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
