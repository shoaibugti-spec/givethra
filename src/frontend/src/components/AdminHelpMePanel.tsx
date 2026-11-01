// src/frontend/src/components/AdminHelpMePanel.tsx
// Admin tab for Help Me: appeals queue, payment-proof queue, reports, FX rates and settings.
import { Button } from "@/components/ui/button";
import { displayHelpMePaymentMethod, formatMoney, helpme, type HelpMeConfig } from "@/lib/helpme";
import { Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Section = "appeals" | "proofs" | "reports" | "settings";

export default function AdminHelpMePanel({ onQueueChanged }: { onQueueChanged?: () => void | Promise<void> } = {}) {
  const [section, setSection] = useState<Section>("appeals");
  const [q, setQ] = useState<{ appeals: any[]; helps: any[]; reports: any[] } | null>(null);
  const [cfg, setCfg] = useState<HelpMeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [video, setVideo] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [fx, setFx] = useState({ currency: "", per_usd: "" });
  const [settings, setSettings] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [queue, config] = await Promise.all([helpme.admin.queue(), helpme.config()]);
      setQ(queue);
      setCfg(config);
      setAmounts((a) => {
        const next = { ...a };
        for (const h of queue.helps || []) if (next[h.id] === undefined) next[h.id] = String(h.amount_claimed);
        return next;
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load Help Me queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => () => { Object.values(video).forEach((u) => URL.revokeObjectURL(u)); }, [video]);

  async function run(key: string, fn: () => Promise<unknown>, ok: string) {
    setBusy(key);
    try { await fn(); toast.success(ok); await load(); await onQueueChanged?.(); } catch (e) { toast.error(e instanceof Error ? e.message : "Action failed"); } finally { setBusy(""); }
  }

  async function refreshQueue() {
    await load();
    await onQueueChanged?.();
  }

  async function loadVideo(id: string) {
    try { const u = await helpme.privateVideoBlob(id); setVideo((v) => ({ ...v, [id]: u })); } catch { toast.error("Video could not be loaded"); }
  }

  const tabBtn = (s: Section, label: string, n?: number) => (
    <button key={s} type="button" onClick={() => setSection(s)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${section === s ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
      {label}{n ? <span className="ml-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">{n}</span> : null}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {tabBtn("appeals", "Appeals", q?.appeals.length)}
        {tabBtn("proofs", "Payment proofs", q?.helps.length)}
        {tabBtn("reports", "Reports", q?.reports.length)}
        {tabBtn("settings", "FX & settings")}
        <Button type="button" variant="outline" size="sm" onClick={() => void refreshQueue()} className="ml-auto"><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
      </div>
      {loading && !q && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>}

      {section === "appeals" && q && (
        <div className="space-y-3">
          {q.appeals.length === 0 && <p className="text-sm text-muted-foreground">No appeals waiting.</p>}
          {q.appeals.map((a) => (
            <div key={a.id} className="space-y-2 rounded-xl border border-border bg-card p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <b>{a.owner_name}</b>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.status === "under_review" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>{a.status === "under_review" ? `Under review · ${a.open_reports} reports` : "Pending"}</span>
              </div>
              <p className="text-muted-foreground">{a.description}</p>
              <p className="text-xs">Goal: <b>{formatMoney(a.goal_local, a.currency)}</b> · {displayHelpMePaymentMethod(a.pay_method)} · {a.pay_account_title} · <span className="font-mono">{a.pay_account_number}</span></p>
              {video[a.id] ? <video src={video[a.id]} controls playsInline className="max-h-80 w-full rounded-lg bg-black" /> : <Button type="button" variant="outline" size="sm" onClick={() => loadVideo(a.id)}>Load video</Button>}
              <input value={reasons[a.id] || ""} onChange={(e) => setReasons((r) => ({ ...r, [a.id]: e.target.value }))} placeholder="Reason (for reject / remove)" className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
              <div className="flex flex-wrap gap-2">
                {a.status === "pending_review" && <Button type="button" size="sm" disabled={!!busy} onClick={() => run(`a${a.id}`, () => helpme.admin.appeal(a.id, "approve"), "Approved")}>Approve</Button>}
                {a.status === "under_review" && <Button type="button" size="sm" disabled={!!busy} onClick={() => run(`a${a.id}`, () => helpme.admin.appeal(a.id, "restore"), "Restored")}>Restore</Button>}
                <Button type="button" size="sm" variant="outline" disabled={!!busy} onClick={() => run(`a${a.id}`, () => helpme.admin.appeal(a.id, "reject", reasons[a.id]), "Rejected")}>Reject</Button>
                <Button type="button" size="sm" variant="destructive" disabled={!!busy} onClick={() => run(`a${a.id}`, () => helpme.admin.appeal(a.id, "remove", reasons[a.id]), "Removed")}>Remove</Button>
                {busy === `a${a.id}` && <Loader2 className="h-4 w-4 animate-spin self-center" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {section === "proofs" && q && (
        <div className="space-y-3">
          {q.helps.length === 0 && <p className="text-sm text-muted-foreground">No payment proofs waiting.</p>}
          {q.helps.map((h) => {
            const remaining = Math.max(0, h.goal_local - h.raised_local);
            return (
              <div key={h.id} className="space-y-2 rounded-xl border border-border bg-card p-3 text-sm">
                <p><b>{h.hero_name}</b> → <b>{h.owner_name}</b></p>
                <p className="text-xs text-muted-foreground">Owner account: {h.pay_method} · {h.pay_account_title} · <span className="font-mono">{h.pay_account_number}</span></p>
                <p className="text-xs">TRX: <span className="font-mono font-bold">{h.trx_id}</span> · Claimed <b>{formatMoney(h.amount_claimed, h.currency)}</b> · Remaining <b>{formatMoney(remaining, h.appeal_currency)}</b></p>
                <a href={h.proof_url} target="_blank" rel="noreferrer"><img src={h.proof_url} alt="Payment proof" loading="lazy" className="max-h-72 w-full rounded-lg border border-border object-contain" /></a>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold">Verified amount</label>
                  <input inputMode="decimal" value={amounts[h.id] ?? ""} onChange={(e) => setAmounts((a) => ({ ...a, [h.id]: e.target.value.replace(/[^0-9.]/g, "") }))} className="w-28 rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
                </div>
                <input value={reasons[h.id] || ""} onChange={(e) => setReasons((r) => ({ ...r, [h.id]: e.target.value }))} placeholder="Reason (for reject)" className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                <div className="flex gap-2">
                  <Button type="button" size="sm" disabled={!!busy} onClick={() => run(`h${h.id}`, () => helpme.admin.help(h.id, "approve", Number(amounts[h.id])), "Verified")}>Approve</Button>
                  <Button type="button" size="sm" variant="destructive" disabled={!!busy} onClick={() => run(`h${h.id}`, () => helpme.admin.help(h.id, "reject", undefined, reasons[h.id]), "Rejected")}>Reject</Button>
                  {busy === `h${h.id}` && <Loader2 className="h-4 w-4 animate-spin self-center" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {section === "reports" && q && (
        <div className="space-y-2">
          {q.reports.length === 0 && <p className="text-sm text-muted-foreground">No open reports.</p>}
          {q.reports.map((r) => (
            <div key={`${r.target_type}${r.target_id}`} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 text-sm">
              <div className="min-w-0"><b>{r.target_type}</b> · {r.n} report(s)<p className="truncate text-xs text-muted-foreground">{r.reasons}</p><p className="font-mono text-[10px] text-muted-foreground">{r.target_id}</p></div>
              <Button type="button" size="sm" variant="outline" disabled={!!busy} onClick={() => run(`r${r.target_id}`, () => helpme.admin.resolveReport(r.target_type, r.target_id), "Resolved")}>Resolve</Button>
            </div>
          ))}
        </div>
      )}

      {section === "settings" && (
        <div className="space-y-5">
          <div className="space-y-2 rounded-xl border border-border bg-card p-3">
            <h3 className="text-sm font-bold">Exchange rates (per 1 USD)</h3>
            <div className="flex flex-wrap gap-1.5 text-xs">{(cfg?.rates || []).map((r) => <button key={r.currency} type="button" onClick={() => setFx({ currency: r.currency, per_usd: String(r.per_usd) })} className="rounded-md bg-muted px-2 py-1 font-mono">{r.currency} {r.per_usd}</button>)}</div>
            <div className="flex gap-2">
              <input value={fx.currency} onChange={(e) => setFx((f) => ({ ...f, currency: e.target.value.toUpperCase().slice(0, 3) }))} placeholder="PKR" className="w-20 rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
              <input value={fx.per_usd} inputMode="decimal" onChange={(e) => setFx((f) => ({ ...f, per_usd: e.target.value.replace(/[^0-9.]/g, "") }))} placeholder="280" className="w-28 rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
              <Button type="button" size="sm" disabled={!!busy || !fx.currency || !fx.per_usd} onClick={() => run("fx", () => helpme.admin.fx(fx.currency, Number(fx.per_usd)), "Rate saved")}>Save rate</Button>
            </div>
            <p className="text-[11px] text-muted-foreground">New appeals use the rate at the moment they are created; existing appeals keep their goal.</p>
          </div>
          <div className="space-y-2 rounded-xl border border-border bg-card p-3">
            <h3 className="text-sm font-bold">Settings (leave empty to keep current)</h3>
            {[
              ["goal_usd_cents", "Goal in USD cents (210 = $2.10)"],
              ["post_gap_days", "Days between two appeals"],
              ["helped_cooldown_days", "Days to wait after an appeal is helped"],
              ["retention_days", "Days a video stays online"],
              ["report_hide_threshold", "Reports that auto-hide an appeal"],
              ["pending_expiry_days", "Days before an unreviewed appeal auto-rejects"],
            ].map(([k, label]) => (
              <label key={k} className="flex items-center justify-between gap-2 text-xs">
                <span>{label}</span>
                <input inputMode="numeric" value={settings[k] || ""} onChange={(e) => setSettings((s) => ({ ...s, [k]: e.target.value.replace(/[^0-9]/g, "") }))} placeholder={k === "goal_usd_cents" && cfg ? String(cfg.goal_usd_cents) : k === "retention_days" && cfg ? String(cfg.retention_days) : ""} className="w-24 rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
              </label>
            ))}
            <Button type="button" size="sm" disabled={!!busy} onClick={() => { const body: Record<string, number> = {}; for (const [k, v] of Object.entries(settings)) if (v !== "") body[k] = Number(v); if (!Object.keys(body).length) return toast("Nothing to save"); void run("settings", () => helpme.admin.settings(body), "Settings saved").then(() => setSettings({})); }}>Save settings</Button>
          </div>
        </div>
      )}
    </div>
  );
}
