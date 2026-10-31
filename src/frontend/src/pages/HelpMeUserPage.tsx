// src/frontend/src/pages/HelpMeUserPage.tsx
// A person's Help Me profile: their appeals and reposts as a video grid. Tap a tile to watch it in the reel.
import { helpme, type Appeal } from "@/lib/helpme";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function HelpMeUserPage() {
  const navigate = useNavigate();
  const { userId } = useParams({ strict: false }) as { userId?: string };
  const [data, setData] = useState<{ user: Appeal["owner"]; appeals: Appeal[]; reposts: Appeal[] } | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"appeals" | "reposts">("appeals");
  const [totals, setTotals] = useState<{ helped_count: number; helped_pkr: number; received_count: number; received_pkr: number } | null>(null);

  useEffect(() => {
    if (!userId) return;
    helpme.user(userId).then(setData).catch((e) => setError(e.message || "Could not load"));
    helpme.stats(userId).then(setTotals).catch(() => undefined);
  }, [userId]);

  const list = data ? data[tab].slice(0, 24) : [];
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950 text-white" style={{ height: "100dvh" }}>
      <div className="mx-auto w-full max-w-[520px] px-4 pb-10" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <button type="button" onClick={() => navigate({ to: "/helpme", replace: true })} aria-label="Back" className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 active:scale-95"><ArrowLeft className="h-4 w-4" /></button>
        {!data && !error && <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-emerald-400" /></div>}
        {error && <p className="rounded-xl bg-red-500/15 p-4 text-sm text-red-200">{error}</p>}
        {data && (
          <>
            <div className="flex flex-col items-center gap-2 pb-4">
              {data.user.avatar_url ? <img src={data.user.avatar_url} alt="" className="h-20 w-20 rounded-full border-2 border-emerald-400 object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-800 text-2xl font-bold">{data.user.name.slice(0, 1).toUpperCase()}</div>}
              <div className="flex items-center gap-1.5 text-base font-extrabold">{data.user.name}{data.user.verified && <BadgeCheck className="h-4 w-4 text-emerald-400" />}</div>
              {data.user.username && <div className="text-xs text-gray-400">@{data.user.username}</div>}
              {totals && (totals.helped_count > 0 || totals.received_count > 0) && (
                <div className="mt-1 flex gap-4 text-center text-[11px] text-gray-300">
                  {totals.helped_count > 0 && <span>Helped <b className="text-emerald-300">Rs {totals.helped_pkr.toLocaleString()}</b> ({totals.helped_count})</span>}
                  {totals.received_count > 0 && <span>Received <b className="text-emerald-300">Rs {totals.received_pkr.toLocaleString()}</b></span>}
                </div>
              )}
            </div>
            <div className="mb-3 grid grid-cols-2 rounded-xl bg-white/5 p-1">
              {(["appeals", "reposts"] as const).map((t) => <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-lg py-2 text-xs font-extrabold ${tab === t ? "bg-emerald-500" : "text-gray-300"}`}>{t === "appeals" ? "Videos" : "Reposts"}</button>)}
            </div>
            {list.length === 0 ? <p className="py-10 text-center text-sm text-gray-400">Nothing here yet.</p> : (
              <div className="grid grid-cols-3 gap-1.5">
                {list.map((a) => (
                  <button key={a.id} type="button" onClick={() => navigate({ to: "/helpme", search: { v: a.id } as never })} className="relative aspect-[9/16] overflow-hidden rounded-lg bg-slate-900 active:scale-95">
                    {a.video_url && <video src={`${a.video_url}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />}
                    {a.helped && <span className="absolute left-1 top-1 rounded bg-green-600 px-1.5 py-0.5 text-[9px] font-extrabold">Helped ✅</span>}
                    <span className="absolute bottom-1 left-1 text-[10px] font-bold drop-shadow">🙏 {a.counts.prays}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
