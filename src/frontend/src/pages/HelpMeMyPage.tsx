// src/frontend/src/pages/HelpMeMyPage.tsx
// My Help Me page: my appeals (status + progress + private video), help I received, help I gave.
import { useAuth } from "@/contexts/AuthContext";
import { formatMoney, helpme } from "@/lib/helpme";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

const STATUS: Record<string, { label: string; cls: string }> = {
  pending_review: { label: "Pending review", cls: "bg-amber-500/20 text-amber-300" },
  published: { label: "Live", cls: "bg-emerald-500/20 text-emerald-300" },
  under_review: { label: "Under review", cls: "bg-orange-500/20 text-orange-300" },
  helped: { label: "Helped ✅", cls: "bg-green-500/25 text-green-300" },
  rejected: { label: "Rejected", cls: "bg-red-500/20 text-red-300" },
  removed: { label: "Removed", cls: "bg-red-500/20 text-red-300" },
  expired: { label: "Expired", cls: "bg-gray-500/20 text-gray-300" },
};

function Chip({ status }: { status: string }) {
  const s = STATUS[status] || { label: status, cls: "bg-white/10 text-white" };
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${s.cls}`}>{s.label}</span>;
}

export default function HelpMeMyPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [video, setVideo] = useState<Record<string, string>>({});
  const [totals, setTotals] = useState<{ helped_count: number; helped_pkr: number; received_count: number; received_pkr: number } | null>(null);

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) { navigate({ to: "/sign-in", search: { redirect: "/helpme/my" } as never, replace: true }); return; }
    helpme.my().then(setData).catch((e) => setError(e.message || "Could not load"));
  }, [isAuthenticated, isInitializing, navigate]);

  const { user } = useAuth();
  useEffect(() => {
    if (user?.id) helpme.stats(user.id).then(setTotals).catch(() => undefined);
  }, [user?.id]);

  useEffect(() => () => { Object.values(video).forEach((u) => URL.revokeObjectURL(u)); }, [video]);

  async function loadVideo(id: string) {
    try { const u = await helpme.privateVideoBlob(id); setVideo((v) => ({ ...v, [id]: u })); } catch { setError("Video could not be loaded"); }
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950 text-white" style={{ height: "100dvh" }}>
      <div className="mx-auto w-full max-w-[520px] px-4 pb-10" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => navigate({ to: "/helpme" })} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 active:scale-95"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="text-base font-extrabold">My Help Me</h1>
          <button type="button" onClick={() => navigate({ to: "/helpme/new" })} aria-label="New appeal" className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 active:scale-95"><Plus className="h-5 w-5" /></button>
        </div>
        {!data && !error && <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-emerald-400" /></div>}
        {error && <p className="rounded-xl bg-red-500/15 p-4 text-sm text-red-200">{error}</p>}
        {data && (
          <div className="space-y-6">
            {!data.eligibility?.can_post && data.eligibility?.reason && <p className="rounded-xl bg-white/5 p-3 text-xs text-gray-300">{data.eligibility.reason}</p>}
            {totals && (totals.helped_count > 0 || totals.received_count > 0) && (
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-slate-900 p-3"><b className="block text-lg text-emerald-300">Rs {totals.helped_pkr.toLocaleString()}</b><span className="text-[10px] text-gray-400">Total I helped ({totals.helped_count})</span></div>
                <div className="rounded-xl bg-slate-900 p-3"><b className="block text-lg text-emerald-300">Rs {totals.received_pkr.toLocaleString()}</b><span className="text-[10px] text-gray-400">Total I received</span></div>
              </div>
            )}
            <section className="space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-emerald-400">My appeals</h2>
              {data.appeals.length === 0 && <p className="text-sm text-gray-400">You have not posted an appeal yet.</p>}
              {data.appeals.map((a: any) => {
                const pct = a.goal_local > 0 ? Math.min(100, Math.round((a.raised_local / a.goal_local) * 100)) : 0;
                const canSee = ["pending_review", "published", "under_review", "helped"].includes(a.status);
                return (
                  <div key={a.id} className="space-y-2 rounded-2xl border border-white/10 bg-slate-900 p-3">
                    <div className="flex items-center justify-between"><Chip status={a.status} /><span className="text-[10px] text-gray-500">{new Date(a.created_at).toLocaleDateString()}</span></div>
                    <p className="line-clamp-3 text-sm text-white/90">{a.description}</p>
                    <div>
                      <div className="mb-1 flex justify-between text-[10px] font-semibold"><span className="text-emerald-400">Raised {formatMoney(a.raised_local, a.currency)}</span><span className="text-gray-400">Goal {formatMoney(a.goal_local, a.currency)}</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-800"><div className="h-full bg-gradient-to-r from-emerald-500 to-green-400" style={{ width: `${pct}%` }} /></div>
                    </div>
                    {a.rejection_reason && ["rejected", "removed"].includes(a.status) && <p className="rounded-lg bg-red-500/10 p-2 text-xs text-red-200">Reason: {a.rejection_reason}</p>}
                    <div className="text-[10px] text-gray-400">🙏 {a.counts.prays} · 💬 {a.counts.comments} · 🔁 {a.counts.reposts} · 👁 {a.counts.views}</div>
                    {canSee && (video[a.id] ? <video src={video[a.id]} controls playsInline className="max-h-72 w-full rounded-xl bg-black" /> : <button type="button" onClick={() => loadVideo(a.id)} className="w-full rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-bold active:scale-[0.99]">Watch my video</button>)}
                  </div>
                );
              })}
            </section>
            <section className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-emerald-400">Help I received</h2>
              {data.helps_received.length === 0 && <p className="text-sm text-gray-400">No verified help yet.</p>}
              {data.helps_received.map((h: any) => <div key={h.id} className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 text-sm"><span>🙏 {h.hero_name}</span><b className="text-emerald-300">{formatMoney(h.amount_approved, h.currency)}</b></div>)}
            </section>
            <section className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-emerald-400">Help I gave</h2>
              {data.helps_given.length === 0 && <p className="text-sm text-gray-400">You have not helped anyone yet.</p>}
              {data.helps_given.map((h: any) => (
                <div key={h.id} className="space-y-1 rounded-xl bg-slate-900 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between"><b>{formatMoney(h.amount_approved ?? h.amount_claimed, h.currency)}</b><span className={`text-[10px] font-extrabold ${h.status === "approved" ? "text-green-300" : h.status === "rejected" ? "text-red-300" : "text-amber-300"}`}>{h.status === "pending" ? "Waiting for verification" : h.status === "approved" ? "Verified ✅" : "Rejected"}</span></div>
                  {h.rejection_reason && <p className="text-xs text-red-200">{h.rejection_reason}</p>}
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
