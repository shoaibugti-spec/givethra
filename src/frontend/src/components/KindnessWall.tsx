// src/components/KindnessWall.tsx
// Premium Kindness Wall with social media style story cards.

import { useEffect, useMemo, useState } from "react";
import ProtectedVideoPlayer from "@/components/ProtectedVideoPlayer";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Share2, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createComment, getComments, getFeedbacks, getGuestId, getLikes, getProfile, toggleFeedbackLike } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { motion, AnimatePresence } from "framer-motion";

function timeAgo(value?: string) {
  if (!value) return "Recently";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function KindnessWall() {
  const { user, isAuthenticated } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [openComments, setOpenComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getFeedbacks(100), getLikes(), getComments()])
      .then(([nextFeedbacks, nextLikes, nextComments]) => {
        if (!active) return;
        setFeedbacks(Array.isArray(nextFeedbacks) ? nextFeedbacks : []);
        setLikes(Array.isArray(nextLikes) ? nextLikes : []);
        setComments(Array.isArray(nextComments) ? nextComments : []);
      })
      .catch(() => { if (active) toast.error("Kindness Wall is temporarily unavailable."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const ordered = useMemo(() => [...feedbacks].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()), [feedbacks]);
  const current = ordered[index];
  const currentLikes = current ? likes.filter((like) => like.feedback_id === current.id) : [];
  const currentComments = current ? comments.filter((comment) => comment.feedback_id === current.id) : [];
  const actorId = isAuthenticated && user ? user.id : getGuestId();
  const liked = currentLikes.some((like) => like.user_id === actorId);

  async function handleShare() {
    if (!current) return;
    const url = new URL(`/kindness-wall#${encodeURIComponent(current.id)}`, window.location.origin).toString();
    try { if (navigator.share) { await navigator.share({ title: current.case_title || "Givethra Kindness Wall", text: current.text_message || current.comment || "A verified Givethra feedback story", url }); return; } }
    catch (error: any) { if (error?.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); toast.success("Link copied."); }
    catch { toast.error("Sharing is unavailable."); }
  }

  async function handleLike() {
    if (!current) return;
    try {
      const existing = currentLikes.find((like) => like.user_id === actorId);
      const result = await toggleFeedbackLike(current.id, actorId, existing?.id);
      if (result.deleted) setLikes((items) => items.filter((item) => item.id !== result.id));
      if (result.created) setLikes((items) => [...items, result.created]);
    } catch (error: any) { toast.error(error?.message || "Unable to update kindness."); }
  }

  async function handleComment() {
    if (!current || !commentText.trim() || !actorId) return;
    setPosting(true);
    try {
      const firstName = isAuthenticated && user ? ((await getProfile(user.id))?.full_name || "User").split(" ")[0] : `Guest ${getGuestId().slice(-6)}`;
      const created = await createComment({ feedback_id: current.id, user_id: actorId, first_name: firstName, comment: commentText.trim() });
      if (created?.id) { setComments((items) => [...items, created]); setCommentText(""); }
      else throw new Error("Comment could not be posted");
    } catch (error: any) { toast.error(error?.message || "Unable to post comment."); }
    finally { setPosting(false); }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" /></div>;

  return (
    <section aria-labelledby="kindness-wall-title" className="bg-gradient-to-b from-pink-50/40 via-white to-white px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-pink-700">
            <Sparkles className="h-3 w-3" /> Community Gratitude
          </div>
          <h2 id="kindness-wall-title" className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900">Kindness Wall</h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">Real feedback from people whose completed cases received verified help.</p>
        </div>

        {!current ? (
          <div className="rounded-3xl border-2 border-dashed border-pink-200 bg-white p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-pink-300" />
            <p className="mt-3 text-sm font-semibold text-slate-400">Approved seeker feedback will appear here after a completed case.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.article key={current.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-pink-100/50">
              
              {/* Story Header */}
              <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-pink-700 p-6 text-white">
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/20 text-lg font-black text-white ring-2 ring-white/40 backdrop-blur-sm">
                      {current.avatar_url ? <img src={resolveMediaUrl(current.avatar_url)} alt={current.user_name || "Givethra member"} className="h-full w-full object-cover" /> : String(current.user_name || "G").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-100">Story {index + 1} of {ordered.length}</p>
                      <h3 className="mt-1 truncate text-lg font-black leading-tight">{current.case_title || "A completed Givethra case"}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-pink-100">
                        <Star className="h-3 w-3 fill-current" /> {current.user_name || "A grateful seeker"} · {timeAgo(current.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-pink-700 shadow-md">
                    ✓ Verified
                  </span>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6 md:p-8">
                {(current.text_message || current.comment) && (
                  <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50/50 to-white p-5">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                      <span className="mr-1 text-3xl text-pink-300">"</span>
                      {current.text_message || current.comment}
                    </p>
                  </div>
                )}

                {current.video_url && <div className="mt-4"><ProtectedVideoPlayer src={current.video_url} /></div>}

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">
                  <button onClick={handleLike} className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-all ${liked ? "bg-rose-50 text-rose-600" : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"}`}>
                    <Heart className="h-4 w-4 transition-transform group-hover:scale-110" fill={liked ? "currentColor" : "none"} /> Like <span className="font-black">({currentLikes.length})</span>
                  </button>
                  <button onClick={() => setOpenComments((v) => !v)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-slate-500 transition-all hover:bg-pink-50 hover:text-pink-600">
                    <MessageCircle className="h-4 w-4" /> Comment <span className="font-black">({currentComments.length})</span>
                  </button>
                  <button onClick={handleShare} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-slate-500 transition-all hover:bg-pink-50 hover:text-pink-600">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                  <div className="ml-auto flex gap-1.5">
                    <button disabled={index === 0} onClick={() => { setIndex((v) => Math.max(0, v - 1)); setOpenComments(false); }} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:border-pink-300 hover:text-pink-600 disabled:opacity-40">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button disabled={index === ordered.length - 1} onClick={() => { setIndex((v) => Math.min(ordered.length - 1, v + 1)); setOpenComments(false); }} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:border-pink-300 hover:text-pink-600 disabled:opacity-40">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Comments */}
                {openComments && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    <div className="max-h-56 space-y-2 overflow-y-auto">
                      {currentComments.length ? currentComments.map((comment) => (
                        <div key={comment.id} className="rounded-xl bg-pink-50/50 px-3 py-2">
                          <p className="text-xs font-black text-pink-700">{comment.first_name || comment.user_name || "A Givethra member"}</p>
                          <p className="mt-0.5 text-sm text-slate-700">{comment.comment}</p>
                        </div>
                      )) : <p className="py-4 text-center text-sm text-slate-400">No comments yet. Be the first to say something kind!</p>}
                    </div>
                    <div className="flex items-end gap-2">
                      <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a kind comment..." rows={2} className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-200" />
                      <button type="button" disabled={posting || !commentText.trim()} onClick={handleComment} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md transition hover:scale-105 disabled:opacity-50">
                        <Send className="h-4 w-4" />
                      </button>
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
