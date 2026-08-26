import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createComment, getComments, getFeedbacks, getGuestId, getLikes, getProfile, toggleFeedbackLike } from "@/lib/api";

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
      .catch(() => {
        if (active) toast.error("Kindness Wall is temporarily unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const ordered = useMemo(() => [...feedbacks].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()), [feedbacks]);
  const current = ordered[index];
  const currentLikes = current ? likes.filter((like) => like.feedback_id === current.id) : [];
  const currentComments = current ? comments.filter((comment) => comment.feedback_id === current.id) : [];
  const actorId = isAuthenticated && user ? user.id : getGuestId();
  const liked = currentLikes.some((like) => like.user_id === actorId);

  async function handleLike() {
    if (!current) return;
    try {
      const existing = currentLikes.find((like) => like.user_id === actorId);
      const result = await toggleFeedbackLike(current.id, actorId, existing?.id);
      if (result.deleted) setLikes((items) => items.filter((item) => item.id !== result.id));
      if (result.created) setLikes((items) => [...items, result.created]);
    } catch (error: any) {
      toast.error(error?.message || "Unable to update kindness.");
    }
  }

  async function handleComment() {
    if (!current || !commentText.trim() || !actorId) return;
    setPosting(true);
    try {
      const firstName = isAuthenticated && user
        ? ((await getProfile(user.id))?.full_name || "User").split(" ")[0]
        : `Guest ${getGuestId().slice(-6)}`;
      const created = await createComment({ feedback_id: current.id, user_id: actorId, first_name: firstName, comment: commentText.trim() });
      if (created?.id) {
        setComments((items) => [...items, created]);
        setCommentText("");
      } else throw new Error("Comment could not be posted");
    } catch (error: any) {
      toast.error(error?.message || "Unable to post comment.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <section className="border-y border-border bg-muted/20 px-4 py-8" aria-labelledby="kindness-wall-title">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="text-center">
          <p className="mb-1 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary"><Sparkles className="h-4 w-4" /> Community gratitude</p>
          <h2 id="kindness-wall-title" className="font-display text-2xl font-bold">Kindness Wall</h2>
          <p className="mt-1 text-sm text-muted-foreground">Real feedback from people whose completed cases received verified help.</p>
        </div>
        {loading ? <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">Loading kindness stories...</div> : !current ? <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">Approved seeker feedback will appear here after a completed case.</div> : (
          <article className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Story {index + 1} of {ordered.length}</p><h3 className="mt-1 truncate text-lg font-bold">{current.case_title || "A completed Givethra case"}</h3><p className="mt-1 text-xs text-muted-foreground">{current.user_name || "A grateful seeker"} · {timeAgo(current.created_at)}</p></div><span className="shrink-0 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-700">Verified feedback</span></div>
            {current.comment && <p className="mt-5 whitespace-pre-line rounded-xl bg-muted/40 p-4 text-sm leading-relaxed">{current.comment}</p>}
            {current.video_url && <video src={current.video_url} controls playsInline className="mt-4 max-h-80 w-full rounded-xl border border-border bg-black" />}
            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-3"><button type="button" onClick={handleLike} className={`flex items-center gap-1.5 text-sm font-medium ${liked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}><Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} /> Like <span>({currentLikes.length})</span></button><button type="button" onClick={() => setOpenComments((value) => !value)} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"><MessageCircle className="h-4 w-4" /> Comment <span>({currentComments.length})</span></button><div className="ml-auto flex gap-1"><button type="button" aria-label="Previous kindness story" disabled={index === 0} onClick={() => { setIndex((value) => Math.max(0, value - 1)); setOpenComments(false); }} className="h-8 w-8 rounded-full border border-border disabled:opacity-40"><ChevronLeft className="mx-auto h-4 w-4" /></button><button type="button" aria-label="Next kindness story" disabled={index === ordered.length - 1} onClick={() => { setIndex((value) => Math.min(ordered.length - 1, value + 1)); setOpenComments(false); }} className="h-8 w-8 rounded-full border border-border disabled:opacity-40"><ChevronRight className="mx-auto h-4 w-4" /></button></div></div>
            {openComments && <div className="mt-4 space-y-3"><div className="max-h-48 space-y-2 overflow-y-auto">{currentComments.map((comment) => <div key={comment.id} className="rounded-xl bg-muted/40 px-3 py-2"><p className="text-xs font-semibold">{comment.first_name || comment.user_name || "A Givethra member"}</p><p className="break-words text-sm">{comment.comment}</p></div>)}</div><div className="flex items-end gap-2"><textarea aria-label="Comment on kindness story" value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a kind comment..." rows={2} className="min-h-10 min-w-0 flex-1 resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm" /><button type="button" aria-label="Post kindness comment" disabled={posting || !commentText.trim()} onClick={handleComment} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button></div></div>}
          </article>
        )}
      </div>
    </section>
  );
}
