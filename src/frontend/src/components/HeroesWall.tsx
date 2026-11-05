// src/components/HeroesWall.tsx
// Premium + Globalized: Real currency conversion for every user.

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Share2, Trophy, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { addComment, getHeroesWall, getPostComments, toggleLike, getProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getCountryProfile, CURRENCY_SYMBOLS, scaleFromPKR } from "@/lib/countryProfiles";

type HeroCase = {
  id: string;
  title?: string;
  category?: string;
  currency?: string;
  amount_needed?: number | string;
  amount_collected?: number | string;
  updated_at?: string;
  post_id: string;
  post_message?: string;
  likes_count?: number;
  comments_count?: number;
};

type HeroMetrics = { solved_cases: number; total_amount: number; currency?: string };

async function shareWallPost(title: string, text: string, path: string) {
  const url = new URL(path, window.location.origin).toString();
  try { if (navigator.share) { await navigator.share({ title, text, url }); return; } }
  catch (error: any) { if (error?.name === "AbortError") return; }
  try { await navigator.clipboard.writeText(url); toast.success("Link copied."); }
  catch { toast.error("Sharing is unavailable."); }
}

export default function HeroesWall() {
  const { user } = useAuth();
  const [items, setItems] = useState<HeroCase[]>([]);
  const [metrics, setMetrics] = useState<HeroMetrics>({ solved_cases: 0, total_amount: 0, currency: "PKR" });
  const [index, setIndex] = useState(0);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [loadError, setLoadError] = useState("");
  
  // 🌍 User's local currency detection
  const [userCurrency, setUserCurrency] = useState<string>("USD");
  const [userCountry, setUserCountry] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      getProfile(user.id).then((profile) => {
        const countryName = profile?.country || "";
        setUserCountry(countryName);
        const profileData = getCountryProfile(countryName);
        setUserCurrency(profileData.currency || "USD");
      }).catch(() => { setUserCurrency("USD"); });
    }
  }, [user?.id]);

  // 💱 Real currency conversion
  function money(currency: string | undefined, amountInPKR: number) {
    const displayCurrency = userCurrency || currency || "USD";
    
    // If user is in Pakistan, show raw PKR
    if (displayCurrency === "PKR") {
      return `Rs ${Number(amountInPKR || 0).toLocaleString()}`;
    }
    
    // Otherwise, convert PKR → user's currency
    const converted = scaleFromPKR(Number(amountInPKR || 0), displayCurrency);
    const symbol = CURRENCY_SYMBOLS[displayCurrency] ?? displayCurrency;
    return `${symbol} ${converted.toLocaleString()}`;
  }

  async function loadWall() {
    try {
      const result = await getHeroesWall();
      setLoadError("");
      setItems(Array.isArray(result?.cases) ? result.cases : []);
      setMetrics(result?.metrics || { solved_cases: 0, total_amount: 0, currency: "PKR" });
      setIndex(0);
    } catch (error: any) {
      setItems([]);
      setLoadError(error?.message || "Heroes Wall is temporarily unavailable.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    void loadWall();
    const refresh = window.setInterval(() => void loadWall(), 10 * 60 * 1000);
    return () => window.clearInterval(refresh);
  }, []);

  const current = items[index];
  const currentComments = current ? comments[current.post_id] || [] : [];
  const currentCommentText = current ? commentText[current.post_id] || "" : "";
  const currentLike = current ? liked[current.post_id] : false;
  const progress = useMemo(() => {
    if (!current) return 100;
    const needed = Number(current.amount_needed || 0);
    const collected = Number(current.amount_collected || needed || 0);
    return needed > 0 ? Math.min(100, Math.round((collected / needed) * 100)) : 100;
  }, [current]);

  async function handleShare() {
    if (!current) return;
    await shareWallPost(current.title || "Givethra Heroes Wall", current.post_message || "A completed case", `/heroes-wall#${encodeURIComponent(current.post_id)}`);
  }

  async function handleLike() {
    if (!current) return;
    try {
      const result = await toggleLike(current.post_id);
      setLiked((prev) => ({ ...prev, [current.post_id]: Boolean(result.liked) }));
      setItems((prev) => prev.map((item) => item.post_id === current.post_id ? { ...item, likes_count: Math.max(0, Number(item.likes_count || 0) + (result.liked ? 1 : -1)) } : item));
    } catch (error: any) { toast.error(error?.message || "Unable to update."); }
  }

  async function toggleComments() {
    if (!current) return;
    const next = !openComments[current.post_id];
    setOpenComments((prev) => ({ ...prev, [current.post_id]: next }));
    if (!next || comments[current.post_id]) return;
    try { const result = await getPostComments(current.post_id); setComments((prev) => ({ ...prev, [current.post_id]: result })); }
    catch (error: any) { toast.error(error?.message || "Unable to load comments."); }
  }

  async function handleComment() {
    if (!current || !currentCommentText.trim()) return;
    setPosting(true);
    try {
      const result = await addComment(current.post_id, currentCommentText.trim());
      setComments((prev) => ({ ...prev, [current.post_id]: [...(prev[current.post_id] || []), result] }));
      setItems((prev) => prev.map((item) => item.post_id === current.post_id ? { ...item, comments_count: Number(item.comments_count || 0) + 1 } : item));
      setCommentText((prev) => ({ ...prev, [current.post_id]: "" }));
      setOpenComments((prev) => ({ ...prev, [current.post_id]: true }));
    } catch (error: any) { toast.error(error?.message || "Unable to post comment."); }
    finally { setPosting(false); }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" /></div>;

  return (
    <section aria-labelledby="heroes-wall-title" className="bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
              <Trophy className="h-3 w-3" /> Community Impact
            </div>
            <h2 id="heroes-wall-title" className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900">Heroes Wall</h2>
            <p className="mt-1 max-w-md text-sm font-medium text-slate-500">Real cases completed through verified help from Givethra Heroes.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <p className="text-2xl font-black text-teal-700">{metrics.solved_cases}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cases solved</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-3 text-center shadow-sm">
              <p className="text-xl font-black text-emerald-700">{money(metrics.currency, Number(metrics.total_amount || 0))}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total help ({userCurrency})</p>
            </div>
          </div>
        </div>

        {!items.length ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-400">{loadError || "Completed cases will appear here."}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.article key={current.post_id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
              <div className="relative bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 p-6 text-white md:p-8">
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200">Completed Case {index + 1} of {items.length}</p>
                    <h3 className="mt-2 text-xl font-black leading-tight md:text-2xl">{current.title || "A completed case"}</h3>
                    <p className="mt-1 text-sm font-medium text-teal-100">{current.category || "Verified help"}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-teal-800 shadow-md">✓ Help Complete</span>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                  <p className="text-sm leading-relaxed text-slate-700">{current.post_message || "A Givethra case was completed through verified help."}</p>
                </div>

                <div className="mt-5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-bold text-slate-600"><TrendingUp className="h-4 w-4 text-teal-600" /> Verified Impact</span>
                    <span className="font-black text-teal-700">{money(current.currency, Number(current.amount_collected || current.amount_needed || 0))}</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 shadow-sm" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-right text-[10px] font-semibold text-slate-400">Showing in {userCurrency}</p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">
                  <button onClick={handleLike} className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-all ${currentLike ? "bg-rose-50 text-rose-600" : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"}`}>
                    <Heart className="h-4 w-4 transition-transform group-hover:scale-110" fill={currentLike ? "currentColor" : "none"} /> Like <span className="font-black">({Number(current.likes_count || 0)})</span>
                  </button>
                  <button onClick={toggleComments} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-slate-500 transition-all hover:bg-teal-50 hover:text-teal-600">
                    <MessageCircle className="h-4 w-4" /> Comment <span className="font-black">({Number(current.comments_count || 0)})</span>
                  </button>
                  <button onClick={handleShare} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-slate-500 transition-all hover:bg-teal-50 hover:text-teal-600">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                  <div className="ml-auto flex gap-1.5">
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-full" disabled={index === 0} onClick={() => setIndex((v) => Math.max(0, v - 1))}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-full" disabled={index === items.length - 1} onClick={() => setIndex((v) => Math.min(items.length - 1, v + 1))}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>

                {openComments[current.post_id] && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    <div className="max-h-56 space-y-2 overflow-y-auto">
                      {currentComments.length ? currentComments.map((comment) => (
                        <div key={comment.id} className="rounded-xl bg-slate-50 px-3 py-2">
                          <p className="text-xs font-black text-teal-700">{comment.user_name || "A Givethra member"}</p>
                          <p className="mt-0.5 text-sm text-slate-700">{comment.comment}</p>
                        </div>
                      )) : <p className="py-4 text-center text-sm text-slate-400">No comments yet.</p>}
                    </div>
                    <div className="flex items-end gap-2">
                      <textarea value={currentCommentText} onChange={(e) => setCommentText((prev) => ({ ...prev, [current.post_id]: e.target.value }))} placeholder="Write a kind comment..." rows={2} className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:bg-white" />
                      <Button type="button" size="icon" className="h-11 w-11 shrink-0 rounded-xl bg-teal-600 hover:bg-teal-700" disabled={posting || !currentCommentText.trim()} onClick={handleComment}><Send className="h-4 w-4" /></Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.article>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
