// src/frontend/src/pages/HelpMePage.tsx
// Full-screen vertical reel of short video appeals. Immersive: no app header, no bottom navigation.
import { useAuth } from "@/contexts/AuthContext";
import { CommentsSheet, HelpSheet, ReportSheet } from "@/components/HelpMeSheets";
import { compact, consumeHelpMeReturnPath, convert, formatMoney, helpme, viewerCurrency, type Appeal, type HelpMeConfig } from "@/lib/helpme";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, CheckCircle2, Flag, HandHeart, Loader2, MessageCircle, Pause, Plus, Repeat2, Share2, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

type Entry = { type: "intro" } | { type: "appeal"; a: Appeal };
let configCache: HelpMeConfig | null = null;

function ReelVideo({ src, active, near, muted, paused }: { src: string; active: boolean; near: boolean; muted: boolean; paused: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [waiting, setWaiting] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = muted;
  }, [muted, near, attempt]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && !paused) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => undefined);
    } else {
      v.pause();
      if (!active) {
        try { v.currentTime = 0; } catch { /* ignore */ }
      }
    }
  }, [active, paused, near, attempt]);

  if (!near) return <div className="absolute inset-0 bg-black" />;
  return (
    <>
      <video
        key={attempt}
        ref={ref}
        src={src}
        loop
        playsInline
        muted={muted}
        preload={active ? "auto" : "metadata"}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onPlaying={() => { setWaiting(false); setFailed(false); }}
        onError={() => setFailed(true)}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0 h-full w-full bg-black object-cover"
      />
      {active && waiting && !failed && <div className="absolute inset-0 z-[5] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white/70" /></div>}
      {failed && (
        <div className="absolute inset-0 z-[15] flex flex-col items-center justify-center gap-3 bg-black/70 text-center text-sm text-white">
          Video could not be loaded.
          <button type="button" onClick={() => { setFailed(false); setWaiting(true); setAttempt((n) => n + 1); }} className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold">Try again</button>
        </div>
      )}
    </>
  );
}

function IntroCard({ signedIn, onCreate }: { signedIn: boolean; onCreate: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 px-8 text-center text-white">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-400/50">
        <HandHeart className="h-10 w-10 text-emerald-300" />
      </div>
      <h2 className="text-2xl font-extrabold tracking-wide">Help Me!</h2>
      <p className="mt-3 max-w-[300px] text-sm leading-relaxed text-gray-200">
        If you want to get help directly, tap the <b className="text-emerald-300">+</b> button, record a short video of your need, add your account details and submit it. After a quick review your appeal appears here for heroes to see.
      </p>
      <button type="button" onClick={onCreate} className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-extrabold shadow-lg active:scale-95">
        <Plus className="h-4 w-4" /> {signedIn ? "Make a video appeal" : "Sign in to make an appeal"}
      </button>
      <p className="mt-8 animate-bounce text-xs text-emerald-200/80">Swipe up to watch appeals ↑</p>
    </div>
  );
}

export default function HelpMePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"need" | "helped">("need");
  const [items, setItems] = useState<Appeal[]>([]);
  const [pinned, setPinned] = useState<Appeal | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [cfg, setCfg] = useState<HelpMeConfig | null>(configCache);
  const [helpFor, setHelpFor] = useState<Appeal | null>(null);
  const [commentsFor, setCommentsFor] = useState<Appeal | null>(null);
  const [reportFor, setReportFor] = useState<Appeal | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const seen = useRef<Set<string>>(new Set());
  const queue = useRef<string[]>([]);

  const patch = useCallback((id: string, fn: (a: Appeal) => Appeal) => {
    setItems((list) => list.map((a) => (a.id === id ? fn(a) : a)));
    setPinned((p) => (p && p.id === id ? fn(p) : p));
  }, []);

  const entries: Entry[] = useMemo(() => {
    const list: Entry[] = [];
    const rest = pinned ? items.filter((a) => a.id !== pinned.id) : items;
    if (pinned) list.push({ type: "appeal", a: pinned });
    else if (tab === "need") list.push({ type: "intro" });
    for (const a of rest) list.push({ type: "appeal", a });
    return list;
  }, [items, pinned, tab]);

  const needSignIn = useCallback(() => {
    toast("Please sign in to continue");
    navigate({ to: "/sign-in", search: { redirect: "/helpme" } as never });
  }, [navigate]);

  // config (rates) once per session
  useEffect(() => {
    if (configCache) return;
    helpme.config().then((c) => { configCache = c; setCfg(c); }).catch(() => undefined);
  }, []);

  // shared link: /helpme?v=<id>
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("v");
    if (!v) return;
    helpme.appeal(v).then((a) => { setPinned(a); setTab(a.helped ? "helped" : "need"); }).catch(() => toast.error("This appeal is no longer available"));
  }, []);

  // first page of the selected tab
  useEffect(() => {
    let live = true;
    setLoading(true);
    setLoadError("");
    setItems([]);
    setCursor(null);
    setActive(0);
    scroller.current?.scrollTo({ top: 0 });
    helpme.feed(tab).then((r) => { if (live) { setItems(r.items); setCursor(r.next_cursor); } })
      .catch((e) => live && setLoadError(e.message || "Could not load videos"))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [tab]);

  // next page when the 3rd-last video becomes active
  useEffect(() => {
    if (!cursor || loadingMore || active < entries.length - 3) return;
    setLoadingMore(true);
    helpme.feed(tab, cursor).then((r) => {
      setItems((list) => [...list, ...r.items.filter((n) => !list.some((o) => o.id === n.id))]);
      setCursor(r.next_cursor);
    }).catch(() => undefined).finally(() => setLoadingMore(false));
  }, [active, cursor, entries.length, loadingMore, tab]);

  // which card is on screen
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver((records) => {
      for (const r of records) if (r.isIntersecting) setActive(Number((r.target as HTMLElement).dataset.idx));
    }, { root, threshold: 0.65 });
    root.querySelectorAll("[data-idx]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [entries.length, loading]);

  useEffect(() => { setPaused(false); }, [active]);
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // view counting: ONE batched request at most every 15 seconds (never per swipe)
  const flush = useCallback(() => {
    if (!queue.current.length) return;
    const ids = queue.current.splice(0, 20);
    void helpme.views(ids);
  }, []);
  useEffect(() => {
    const e = entries[active];
    if (e?.type === "appeal" && !seen.current.has(e.a.id)) { seen.current.add(e.a.id); queue.current.push(e.a.id); }
  }, [active, entries]);
  useEffect(() => {
    const t = window.setInterval(flush, 15000);
    window.addEventListener("pagehide", flush);
    return () => { window.clearInterval(t); window.removeEventListener("pagehide", flush); flush(); };
  }, [flush]);

  function goBack() {
    const returnPath = consumeHelpMeReturnPath();
    navigate({ to: (returnPath || "/home") as never, replace: true });
  }

  function startCreate() {
    if (!isAuthenticated) return needSignIn();
    navigate({ to: "/helpme/new" });
  }

  async function togglePray(a: Appeal) {
    if (!isAuthenticated) return needSignIn();
    patch(a.id, (x) => ({ ...x, prayed: !x.prayed, counts: { ...x.counts, prays: Math.max(0, x.counts.prays + (x.prayed ? -1 : 1)) } }));
    try { await helpme.pray(a.id); } catch (e) {
      patch(a.id, (x) => ({ ...x, prayed: a.prayed, counts: { ...x.counts, prays: a.counts.prays } }));
      toast.error(e instanceof Error ? e.message : "Could not update");
    }
  }

  async function toggleRepost(a: Appeal) {
    if (!isAuthenticated) return needSignIn();
    if (a.is_owner) return toast("You cannot repost your own appeal");
    patch(a.id, (x) => ({ ...x, reposted: !x.reposted, counts: { ...x.counts, reposts: Math.max(0, x.counts.reposts + (x.reposted ? -1 : 1)) } }));
    try { await helpme.repost(a.id); } catch (e) {
      patch(a.id, (x) => ({ ...x, reposted: a.reposted, counts: { ...x.counts, reposts: a.counts.reposts } }));
      toast.error(e instanceof Error ? e.message : "Could not update");
    }
  }

  async function share(a: Appeal) {
    const url = `${window.location.origin}/helpme?v=${a.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "Help Me", text: a.description.slice(0, 120), url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
      void helpme.share(a.id);
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
      try { await navigator.clipboard.writeText(url); toast.success("Link copied"); } catch { toast.error("Could not share"); }
    }
  }

  function openHelp(a: Appeal) {
    if (!isAuthenticated) return needSignIn();
    setHelpFor(a);
  }

  function nextVideo() {
    const root = scroller.current;
    if (root) root.scrollTo({ top: (active + 1) * root.clientHeight, behavior: "smooth" });
  }

  const vCur = viewerCurrency(cfg);

  return (
    <div className="fixed inset-0 z-[60] bg-black text-white" style={{ height: "100dvh" }}>
      <div className="relative mx-auto h-full w-full max-w-[480px] overflow-hidden bg-black">
        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-3 pb-2" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
          <button type="button" onClick={goBack} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 backdrop-blur-md active:scale-95"><ArrowLeft className="h-4 w-4" /></button>
          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/55 p-0.5 backdrop-blur-md">
            {(["need", "helped"] as const).map((t) => (
              <button key={t} type="button" onClick={() => { setPinned(null); setTab(t); }} className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${tab === t ? "bg-emerald-500 text-white" : "text-white/70"}`}>
                {t === "need" ? "Need Help" : "Helped"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 backdrop-blur-md active:scale-95">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
            <button type="button" onClick={startCreate} aria-label="Make a video appeal" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 backdrop-blur-md active:scale-95"><Plus className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Reel */}
        <div ref={scroller} className="h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading && <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>}
          {!loading && loadError && (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-sm">
              {loadError}
              <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold">Reload</button>
            </div>
          )}
          {!loading && !loadError && tab === "helped" && entries.length === 0 && (
            <div className="flex h-full items-center justify-center px-8 text-center text-sm text-gray-300">No helped appeals yet.</div>
          )}
          {!loading && !loadError && entries.map((e, i) => (
            <section key={e.type === "intro" ? "intro" : e.a.id} data-idx={i} className="relative h-full w-full snap-start snap-always overflow-hidden" style={{ height: "100dvh" }}>
              {e.type === "intro" ? (
                <IntroCard signedIn={isAuthenticated} onCreate={startCreate} />
              ) : (
                <Card
                  a={e.a} cfg={cfg} vCur={vCur}
                  active={i === active && visible} near={i === active || i === active + 1}
                  muted={muted} paused={paused}
                  onTap={() => setPaused((p) => !p)}
                  onPray={() => togglePray(e.a)} onRepost={() => toggleRepost(e.a)} onShare={() => share(e.a)}
                  onComments={() => setCommentsFor(e.a)} onHelp={() => openHelp(e.a)} onReport={() => (isAuthenticated ? setReportFor(e.a) : needSignIn())}
                  onOwner={() => navigate({ to: "/helpme/u/$userId", params: { userId: e.a.owner.id } })}
                />
              )}
            </section>
          ))}
          {loadingMore && <div className="flex h-16 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-emerald-400" /></div>}
        </div>
      </div>

      <HelpSheet appeal={helpFor} onClose={() => setHelpFor(null)} onDone={() => { setHelpFor(null); nextVideo(); }} />
      <CommentsSheet appeal={commentsFor} signedIn={isAuthenticated} onClose={() => setCommentsFor(null)} onNeedSignIn={needSignIn}
        onCountChange={(id, d) => patch(id, (x) => ({ ...x, counts: { ...x.counts, comments: Math.max(0, x.counts.comments + d) } }))} />
      <ReportSheet appeal={reportFor} onClose={() => setReportFor(null)} />
    </div>
  );
}

function Card(p: {
  a: Appeal; cfg: HelpMeConfig | null; vCur: string; active: boolean; near: boolean; muted: boolean; paused: boolean;
  onTap: () => void; onPray: () => void; onRepost: () => void; onShare: () => void; onComments: () => void; onHelp: () => void; onReport: () => void; onOwner: () => void;
}) {
  const { a } = p;
  const goalEq = convert(a.goal_local, a.currency, p.vCur, p.cfg);
  const raisedEq = convert(a.raised_local, a.currency, p.vCur, p.cfg);
  return (
    <>
      {a.video_url ? <ReelVideo src={a.video_url} active={p.active} near={p.near} muted={p.muted} paused={p.paused} /> : <div className="absolute inset-0 bg-slate-900" />}
      <div className="pointer-events-none absolute inset-0 z-[6] bg-gradient-to-b from-black/55 via-transparent to-black/90" />
      <button type="button" aria-label="Play or pause" onClick={p.onTap} className="absolute inset-0 z-10 h-full w-full" />
      {p.paused && p.active && <div className="pointer-events-none absolute inset-0 z-[12] flex items-center justify-center"><div className="rounded-full bg-black/50 p-5"><Pause className="h-9 w-9" /></div></div>}

      {/* Watermark + helped stamp (CSS overlay, never burned into the video) */}
      <div className="pointer-events-none absolute left-4 z-[14] flex flex-col gap-2" style={{ top: "calc(env(safe-area-inset-top) + 64px)" }}>
        <span className="text-sm font-extrabold tracking-wide text-white/60 drop-shadow">Help Me!</span>
        {a.helped && (
          <span className="-rotate-6 self-start rounded-lg border-2 border-emerald-400 bg-black/40 px-3 py-1 text-center text-xs font-extrabold text-emerald-300 backdrop-blur-sm">
            Helped ✅<br /><span className="text-[11px]">مدد ہو چکی</span>
          </span>
        )}
      </div>

      {/* Right rail: pray, comment, repost, share */}
      <div className="absolute right-3 z-20 flex flex-col items-center gap-3.5" style={{ bottom: "calc(env(safe-area-inset-bottom) + 190px)" }}>
        <RailBtn label={compact(a.counts.prays)} onClick={p.onPray} aria="Pray">
          <span className={`text-xl transition ${a.prayed ? "scale-110" : "opacity-80 grayscale"}`}>🙏</span>
        </RailBtn>
        <RailBtn label={compact(a.counts.comments)} onClick={p.onComments} aria="Comments"><MessageCircle className="h-5 w-5" /></RailBtn>
        <RailBtn label={compact(a.counts.reposts)} onClick={p.onRepost} aria="Repost"><Repeat2 className={`h-5 w-5 ${a.reposted ? "text-emerald-400" : ""}`} /></RailBtn>
        <RailBtn label="Share" onClick={p.onShare} aria="Share"><Share2 className="h-5 w-5" /></RailBtn>
        <RailBtn label="" onClick={p.onReport} aria="Report"><Flag className="h-4 w-4 text-white/70" /></RailBtn>
      </div>

      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20 space-y-2.5 px-4 pr-[72px]" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}>
        <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold">
            <span className="text-emerald-400">Raised: <b>{formatMoney(a.raised_local, a.currency)}</b>{raisedEq !== null && a.raised_local > 0 && <span className="text-gray-400"> ≈ {formatMoney(Math.round(raisedEq * 100) / 100, p.vCur)}</span>}</span>
            <span className="text-gray-300">Goal: <b>{formatMoney(a.goal_local, a.currency)}</b>{goalEq !== null && <span className="text-gray-400"> ≈ {formatMoney(Math.round(goalEq * 100) / 100, p.vCur)}</span>}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
            <div className={`h-full rounded-full transition-all duration-700 ${a.helped ? "bg-green-500" : "bg-gradient-to-r from-emerald-500 to-green-400"}`} style={{ width: `${a.helped ? 100 : a.percent}%` }} />
          </div>
        </div>

        <button type="button" onClick={p.onOwner} className="flex items-center gap-2 text-left">
          {a.owner.avatar_url ? <img src={a.owner.avatar_url} alt="" className="h-9 w-9 rounded-full border-2 border-emerald-400 object-cover" /> : <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-800 text-sm font-bold">{a.owner.name.slice(0, 1).toUpperCase()}</div>}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold">{a.owner.name}{a.owner.verified && <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />}</div>
            {a.owner.username && <div className="text-[10px] text-gray-300">@{a.owner.username}</div>}
          </div>
        </button>
        <p className="line-clamp-3 text-[13px] leading-snug text-white/95 drop-shadow">{a.description}</p>

        {a.helped ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-green-600/90 py-3 text-sm font-extrabold"><CheckCircle2 className="h-4 w-4" /> Helped ✅ · مدد ہو چکی</div>
        ) : a.is_owner ? (
          <div className="rounded-xl bg-white/10 py-3 text-center text-xs font-semibold text-gray-200">This is your appeal</div>
        ) : (
          <button type="button" onClick={p.onHelp} className="flex w-full animate-pulse items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 py-3.5 text-sm font-extrabold uppercase tracking-wide shadow-lg active:scale-[0.99]">
            <HandHeart className="h-5 w-5" /> Help Me
          </button>
        )}
      </div>
    </>
  );
}

function RailBtn({ children, label, onClick, aria }: { children: ReactNode; label: string; onClick: () => void; aria: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button type="button" aria-label={aria} onClick={onClick} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-xl backdrop-blur-md active:scale-90">{children}</button>
      {label && <span className="text-[10px] font-bold drop-shadow">{label}</span>}
    </div>
  );
}
