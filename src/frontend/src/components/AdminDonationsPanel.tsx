import { useEffect, useMemo, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminGetContributionSpending, adminGetDonations, adminSpendContribution, adminUpdateDonation } from "@/lib/api";

const money = (value: number) => `PKR ${Number(value || 0).toLocaleString()}`;

export default function AdminDonationsPanel() {
  const [donations, setDonations] = useState<any[]>([]);
  const [spending, setSpending] = useState<any[]>([]);
  const [caseId, setCaseId] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<"donations" | "spending">("donations");

  const load = async () => {
    try {
      const [d, s] = await Promise.all([adminGetDonations(), adminGetContributionSpending()]);
      setDonations(Array.isArray(d) ? d : []);
      setSpending(Array.isArray(s) ? s : []);
    } catch (e: any) { toast.error(e?.message || "Contribution data could not be loaded"); }
  };
  useEffect(() => { void load(); }, []);

  const update = async (id: string, status: string) => {
    setBusy(true);
    try { await adminUpdateDonation(id, { status }); toast.success(`Contribution ${status}`); await load(); }
    catch (e: any) { toast.error(e?.message || "Update failed"); }
    finally { setBusy(false); }
  };
  const spend = async () => {
    const value = Number(amount);
    if (!caseId.trim() || !Number.isFinite(value) || value <= 0) return toast.error("Enter an active request ID and valid amount");
    setBusy(true);
    try { await adminSpendContribution({ case_id: caseId.trim(), amount: value }); toast.success("Contribution allocated to request"); setCaseId(""); setAmount(""); await load(); }
    catch (e: any) { toast.error(e?.message || "Contribution allocation failed"); }
    finally { setBusy(false); }
  };

  const approvedTotal = useMemo(() => donations.filter((d) => ["approved", "completed"].includes(d.status)).reduce((sum, d) => sum + Number(d.amount || 0), 0), [donations]);
  const spentTotal = useMemo(() => spending.reduce((sum, item) => sum + Number(item.amount || 0), 0), [spending]);
  const pending = donations.filter((item) => item.status === "pending");

  return <div className="space-y-4">
    <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold">Community Contributions</h2><p className="text-sm text-muted-foreground">Review receipts first; only approved amounts can be allocated to an active request.</p></div><Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Total raised" value={money(approvedTotal)} /><Stat label="Spent" value={money(spentTotal)} /><Stat label="Available" value={money(Math.max(0, approvedTotal - spentTotal))} /><Stat label="Pending" value={String(pending.length)} /></div>
    <div className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/30 p-1"><button type="button" onClick={() => setView("donations")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${view === "donations" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>Donations ({donations.length})</button><button type="button" onClick={() => setView("spending")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${view === "spending" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>Spending ({spending.length})</button></div>
    {view === "donations" ? <Card><CardHeader><CardTitle>Donation review</CardTitle></CardHeader><CardContent className="space-y-3">{donations.length === 0 ? <p className="text-sm text-muted-foreground">No contribution records.</p> : donations.map((item) => <div key={item.id} className="grid gap-3 rounded-xl border p-4 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{money(item.amount)}</span><span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{item.status}</span><span className="text-xs text-muted-foreground">{item.frequency}</span></div><p className="mt-1 text-sm">{item.donor_name || item.donor_email || item.user_id}</p><p className="text-xs text-muted-foreground">{item.payment_method} · TXN {item.payment_reference} · {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "—"}</p>{item.proof_url && <a className="text-xs font-semibold text-primary underline" href={item.proof_url} target="_blank" rel="noreferrer">View receipt / proof</a>}</div>{item.status === "pending" && <div className="flex gap-2"><Button size="sm" disabled={busy} onClick={() => void update(item.id, "approved")}><Check className="mr-1 h-4 w-4" />Approve</Button><Button size="sm" variant="outline" disabled={busy} onClick={() => void update(item.id, "rejected")}><X className="mr-1 h-4 w-4" />Reject</Button></div>}</div>)}</CardContent></Card> : <Card><CardHeader><CardTitle>Spending from community balance</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 md:grid-cols-[1fr_180px_auto]"><Input placeholder="Approved active request ID" value={caseId} onChange={(e) => setCaseId(e.target.value)} /><Input placeholder="Amount (PKR)" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} /><Button disabled={busy} onClick={() => void spend()}>Allocate</Button></div>{spending.length === 0 ? <p className="text-sm text-muted-foreground">No spending records yet.</p> : spending.map((item) => <div key={item.id} className="flex flex-wrap justify-between gap-2 rounded-lg border p-3 text-sm"><span>{item.case_title || item.case_id}</span><span className="font-semibold">{money(item.amount)} · {item.status}</span></div>)}</CardContent></Card>}
  </div>;
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border bg-card p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>; }
