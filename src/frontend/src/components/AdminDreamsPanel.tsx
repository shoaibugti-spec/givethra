import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminDeleteDream, adminGetDreamParticipations, adminGetDreamPaymentAccounts, adminGetDreams, adminReviewDreamParticipation, adminSaveDream, adminSaveDreamPaymentAccount, adminSelectDreamWinner, uploadFileToStorage } from "@/lib/api";

const emptyForm = { name: "", category: "Car", description: "", image_url: "", actual_market_price: "", dream_price: "", contribution_amount: "", quantity: "1", participant_capacity: "100", internal_percentage_unit: "", credit_award: "0", announcement_at: "", status: "open", publication_status: "published" };
const emptyAccount = { label: "", method: "Bank Transfer", account_title: "", account_number: "", instructions: "", is_active: true };
const money = (v: any) => `PKR ${Number(v || 0).toLocaleString()}`;

export default function AdminDreamsPanel() {
  const [dreams, setDreams] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [account, setAccount] = useState<any>(emptyAccount);
  const [editing, setEditing] = useState<string>();
  const [editingAccount, setEditingAccount] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"products" | "submissions" | "accounts">("products");

  const load = async () => {
    const [dreamResult, participationResult, accountResult] = await Promise.allSettled([adminGetDreams(), adminGetDreamParticipations(), adminGetDreamPaymentAccounts()]);
    if (dreamResult.status === "fulfilled") setDreams(dreamResult.value);
    if (participationResult.status === "fulfilled") setParticipations(participationResult.value);
    if (accountResult.status === "fulfilled") setAccounts(accountResult.value);
    const failed = [dreamResult, participationResult, accountResult].find((result) => result.status === "rejected");
    if (failed?.status === "rejected") toast.error(failed.reason?.message || "One Dreams section could not be loaded");
  };

  useEffect(() => { void load(); }, []);

  const pending = useMemo(() => participations.filter((p) => p.status === "pending_approval"), [participations]);
  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));
  const setA = (key: string, value: any) => setAccount((f: any) => ({ ...f, [key]: value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminSaveDream({ ...form, dream_price: Number(form.dream_price), contribution_amount: Number(form.contribution_amount || 0), actual_market_price: form.actual_market_price === "" ? null : Number(form.actual_market_price), quantity: Number(form.quantity || 0), participant_capacity: Number(form.participant_capacity), internal_percentage_unit: form.internal_percentage_unit === "" ? null : Number(form.internal_percentage_unit), credit_award: Number(form.credit_award || 0) }, editing);
      toast.success(editing ? "Dream updated" : "Dream created");
      setForm(emptyForm);
      setEditing(undefined);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Could not save Dream");
    } finally {
      setBusy(false);
    }
  }

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminSaveDreamPaymentAccount(account, editingAccount);
      toast.success(editingAccount ? "Payment account updated" : "Payment account added");
      setAccount(emptyAccount);
      setEditingAccount(undefined);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Could not save account");
    } finally {
      setBusy(false);
    }
  }

  async function image(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      set("image_url", await uploadFileToStorage(file, `dreams/${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, "-")}`));
      toast.success("Product image uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function review(p: any, status: string) {
    try {
      const reason = status === "rejected" ? window.prompt("Rejection reason") || "Payment proof was not approved" : undefined;
      await adminReviewDreamParticipation(p.id, { status, rejection_reason: reason });
      toast.success(status === "approved" ? "Dream participation approved and registration generated" : "Submission rejected");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Review failed");
    }
  }

  async function removeDream(d: any) {
    if (!window.confirm(`Delete ${d.name}?`)) return;
    try {
      await adminDeleteDream(d.id);
      toast.success("Dream deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Could not delete Dream");
    }
  }

  async function selectWinner(p: any) {
    if (!window.confirm(`Select ${p.full_name || p.user_name || p.email || "this participant"} as the winner of ${p.dream_name}? This will complete the Dream and notify all participants.`)) return;
    try {
      await adminSelectDreamWinner(p.dream_id, p.id);
      toast.success("Winner selected and participants notified");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Winner selection failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Givethra Dreams Control</h2>
          <p className="text-sm text-muted-foreground">Create, update, publish, complete, or remove Givethra Dream products.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={tab === "products" ? "default" : "outline"} onClick={() => setTab("products")}>Products ({dreams.length})</Button>
          <Button variant={tab === "submissions" ? "default" : "outline"} onClick={() => setTab("submissions")}>Payment submissions {pending.length > 0 && `(${pending.length})`}</Button>
          <Button variant={tab === "accounts" ? "default" : "outline"} onClick={() => setTab("accounts")}>Payment accounts ({accounts.length})</Button>
        </div>
      </div>

      {tab === "products" && (
        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <form onSubmit={save} className="space-y-3 rounded-2xl border bg-card p-4">
            <h3 className="font-semibold">{editing ? "Edit listed product" : "List a new product"}</h3>
            <Input placeholder="Product name" value={form.name} onChange={e => set("name", e.target.value)} required />
            <Input placeholder="Category: Car, Motorcycle, TV…" value={form.category} onChange={e => set("category", e.target.value)} required />
            <Textarea placeholder="Public product description" value={form.description} onChange={e => set("description", e.target.value)} required />
            <label className="grid gap-1 text-xs font-semibold">
              Product image
              <input type="file" accept="image/*" onChange={e => void image(e.target.files?.[0] || null)} className="text-xs" />
            </label>
            {form.image_url && <img src={form.image_url} alt="Product" className="h-24 w-full rounded-lg object-cover" />}
            <Input placeholder="Market value — user ko dikhta hai (e.g. 5000)" inputMode="numeric" value={form.actual_market_price} onChange={e => set("actual_market_price", e.target.value)} />
            <Input placeholder="Funding goal — asli target (e.g. 7000)" inputMode="numeric" value={form.dream_price} onChange={e => set("dream_price", e.target.value)} required />
            <Input placeholder="Suggested contribution per participant" inputMode="numeric" value={form.contribution_amount} onChange={e => set("contribution_amount", e.target.value)} />
            <Input placeholder="Product quantity (e.g. 1, 2, 5)" inputMode="numeric" value={form.quantity} onChange={e => set("quantity", e.target.value)} required />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Participant capacity" inputMode="numeric" value={form.participant_capacity} onChange={e => set("participant_capacity", e.target.value)} />
              <Input placeholder="Credit award" inputMode="numeric" value={form.credit_award} onChange={e => set("credit_award", e.target.value)} />
            </div>
            <Input placeholder="Funding progress unit (optional)" value={form.internal_percentage_unit} onChange={e => set("internal_percentage_unit", e.target.value)} />
            <Input type="datetime-local" value={form.announcement_at} onChange={e => set("announcement_at", e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="open">Open</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="completed">Completed</option>
              </select>
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.publication_status} onChange={e => set("publication_status", e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={busy || uploading} className="flex-1">{busy ? "Saving…" : editing ? "Update product" : "List product"}</Button>
              {editing && <Button type="button" variant="outline" onClick={() => { setEditing(undefined); setForm(emptyForm); }}>Cancel</Button>}
            </div>
          </form>

          <div className="space-y-3">
            {dreams.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No products listed. Use the form to add the first real Dream.</div>
            ) : dreams.map(d => {
              const percent = Math.min(100, Math.round(Number(d.funded_amount || 0) / Math.max(1, Number(d.dream_price || 1)) * 100));
              const hasMarketValue = d.actual_market_price !== null && d.actual_market_price !== undefined && Number(d.actual_market_price) > 0;
              return (
                <div key={d.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex gap-4">
                    {d.image_url
                      ? <img src={d.image_url} alt={d.name} className="h-20 w-24 rounded-lg object-cover" />
                      : <div className="grid h-20 w-24 place-items-center rounded-lg bg-muted text-[10px] text-center">No image</div>}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap justify-between gap-2">
                        <h3 className="font-bold">{d.name}</h3>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{d.publication_status} · {d.status}</span>
                      </div>

                      {/* ---- PRICING LINE (FIXED) ---- */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="text-muted-foreground">Market value:</span>
                        {hasMarketValue ? (
                          <span className="font-semibold text-muted-foreground line-through">{money(d.actual_market_price)}</span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">⚠ Not set</span>
                        )}
                        <span className="text-muted-foreground">· Join with:</span>
                        <span className="font-semibold">{money(d.contribution_amount)}</span>
                      </div>

                      {/* Warning below if market value missing */}
                      {!hasMarketValue && (
                        <p className="mt-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-[10px] font-semibold text-amber-800">
                          ⚠ Is Dream mein Market Value set nahi hai. "Edit details" mein ja kar Market Value daalein.
                        </p>
                      )}

                      <div className="mt-2 h-2 rounded-full bg-teal-100">
                        <div className="h-full rounded-full bg-teal-600" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{percent}% funded · {Math.max(0, Number(d.participant_capacity || 0) - Number(d.approved_participants || 0))} places left · {d.pending_participants || 0} awaiting review</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditing(d.id); setForm({ ...emptyForm, ...d, actual_market_price: d.actual_market_price ?? "", dream_price: d.dream_price ?? "", contribution_amount: d.contribution_amount ?? "", quantity: d.quantity ?? "", participant_capacity: d.participant_capacity ?? "", internal_percentage_unit: d.internal_percentage_unit ?? "", credit_award: d.credit_award ?? "" }); }}>Edit details</Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => void removeDream(d)}>Delete</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "accounts" && (
        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <form onSubmit={saveAccount} className="space-y-3 rounded-2xl border bg-card p-4">
            <h3 className="font-semibold">{editingAccount ? "Edit payment account" : "Add payment account"}</h3>
            <Input placeholder="Label: Givethra Bank Account" value={account.label} onChange={e => setA("label", e.target.value)} required />
            <Input placeholder="Method: Bank / JazzCash / Easypaisa" value={account.method} onChange={e => setA("method", e.target.value)} required />
            <Input placeholder="Account title" value={account.account_title} onChange={e => setA("account_title", e.target.value)} />
            <Input placeholder="Account number / IBAN" value={account.account_number} onChange={e => setA("account_number", e.target.value)} required />
            <Textarea placeholder="Public payment instructions" value={account.instructions} onChange={e => setA("instructions", e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={account.is_active} onChange={e => setA("is_active", e.target.checked)} /> Show this account to users
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={busy} className="flex-1">{editingAccount ? "Update account" : "Add account"}</Button>
              {editingAccount && <Button type="button" variant="outline" onClick={() => { setEditingAccount(undefined); setAccount(emptyAccount); }}>Cancel</Button>}
            </div>
          </form>
          <div className="space-y-3">
            {accounts.map(a => (
              <div key={a.id} className="rounded-2xl border bg-card p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{a.label}</h3>
                    <p className="text-sm">{a.method} · {a.account_number}</p>
                    <p className="text-xs text-muted-foreground">Title: {a.account_title || "—"} · {a.is_active ? "Visible" : "Hidden"}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setEditingAccount(a.id); setAccount({ ...emptyAccount, ...a, is_active: Boolean(a.is_active) }); }}>Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "submissions" && (
        <div className="space-y-3">
          {participations.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No payment submissions yet.</div>
          ) : participations.map(p => (
            <div key={p.id} className="rounded-2xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{p.dream_name}</h3>
                  <p className="text-sm">{p.user_name || p.email || p.user_id} · {money(p.contribution_amount)} · <span className="font-semibold capitalize">{String(p.status).replaceAll("_", " ")}</span></p>
                  <p className="text-xs text-muted-foreground">{p.payment_method || "Payment method not entered"} · TXN {p.transaction_id} · {p.created_at ? new Date(p.created_at).toLocaleString() : "—"}</p>
                  <p className="mt-1 text-xs">Name: {p.full_name || "—"} · Father/Husband: {p.father_husband_name || "—"} · CNIC: {p.cnic_number || "—"} · Mobile: {p.mobile_number || "—"}<br />Address: {p.address || "—"}, {p.city || "—"}, {p.province || "—"} · Postal: {p.postal_code || "—"}</p>
                  {p.registration_number && <p className="mt-1 text-sm font-bold text-emerald-700">Registration: {p.registration_number}</p>}
                  {p.proof_url && <a href={p.proof_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-primary underline">View payment receipt</a>}
                </div>
                {p.status === "pending_approval" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => void review(p, "approved")}>Approve</Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => void review(p, "rejected")}>Reject</Button>
                  </div>
                )}
                {(p.status === "approved" || p.status === "active") && (
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => void selectWinner(p)}>Select winner</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
