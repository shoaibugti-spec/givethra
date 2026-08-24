// src/frontend/src/components/FeedbackWall.tsx
// Replaces Supabase with Cloudflare Worker APIs

import { useAuth } from "@/contexts/AuthContext";
import {
  getFeedbacks,
  getLikes,
  getComments,
  toggleFeedbackLike,
  createComment,
  getProfile,
  getGuestId,
} from "@/lib/api";
import { Heart, MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export default function FeedbackWall() {
  const { user, isAuthenticated } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularIndex, setPopularIndex] = useState(0);

  useEffect(() => {
    void loadWall(false);
    const refresh = window.setInterval(() => { void loadWall(true); }, 60 * 60 * 1000);
    return () => window.clearInterval(refresh);
  }, [user]);

  async function loadWall(silent = false) {
    if (!silent) setLoading(true);
    try {
      const [fbs, lks, cms] = await Promise.all([
        getFeedbacks(),
        getLikes(),
        getComments(),
      ]);
      setFeedbacks(fbs ?? []);
      setLikes(lks ?? []);
      setComments(cms ?? []);
    } catch (e) {
      console.error("Failed to load feedback wall:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleLike(feedbackId: string) {
    const actorId = isAuthenticated && user ? user.id : getGuestId();
    const existing = likes.find(
      (l) => l.feedback_id === feedbackId && l.user_id === actorId
    );
    try {
      const result = await toggleFeedbackLike(feedbackId, actorId, existing?.id);
      if (result) {
        if (result.deleted) {
          setLikes((prev) => prev.filter((l) => l.id !== result.id));
        } else if (result.created) {
          setLikes((prev) => [...prev, result.created]);
        }
      }
    } catch (e) {
      toast.error("Failed to toggle like.");
    }
  }

  if (loading) {
    return (
      <section className="py-8 px-4 bg-background border-y border-border">
        <div className="max-w-2xl mx-auto text-center text-muted-foreground text-sm">
          Loading community wall...
        </div>
      </section>
    );
  }

  if (feedbacks.length === 0) return null;

  const score = (fb: any) =>
    likes.filter((l) => l.feedback_id === fb.id).length * 2 +
    comments.filter((c) => c.feedback_id === fb.id).length;
  const popularFeedbacks = [...feedbacks].sort((a, b) => score(b) - score(a)).slice(0, 10);
  const activePopularIndex = Math.min(popularIndex, Math.max(popularFeedbacks.length - 1, 0));
  const activePopularPost = popularFeedbacks[activePopularIndex];

  return (
    <section className="py-8 px-4 bg-muted/20 border-y border-border">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="text-center space-y-1">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center justify-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" fill="currentColor" /> Community Wall
          </h2>
          <p className="text-sm text-muted-foreground">
            Real stories from people Givethra helped — together we made a difference 🤲
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Popular posts</p>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Previous popular post" onClick={() => setPopularIndex((current) => (current - 1 + popularFeedbacks.length) % popularFeedbacks.length)} disabled={popularFeedbacks.length < 2} className="h-8 w-8 rounded-full border border-border bg-card text-foreground disabled:opacity-40">‹</button>
              <span className="text-xs text-muted-foreground">{activePopularIndex + 1} / {popularFeedbacks.length}</span>
              <button type="button" aria-label="Next popular post" onClick={() => setPopularIndex((current) => (current + 1) % popularFeedbacks.length)} disabled={popularFeedbacks.length < 2} className="h-8 w-8 rounded-full border border-border bg-card text-foreground disabled:opacity-40">›</button>
            </div>
          </div>
          {activePopularPost && (
            <FeedbackPost
              key={activePopularPost.id}
              fb={activePopularPost}
              likes={likes.filter((l) => l.feedback_id === activePopularPost.id)}
              comments={comments.filter((c) => c.feedback_id === activePopularPost.id)}
              currentUserId={isAuthenticated && user ? user.id : getGuestId()}
              isAuthenticated={isAuthenticated}
              onToggleLike={() => handleToggleLike(activePopularPost.id)}
              onCommentAdded={(c: any) => setComments((prev) => [...prev, c])}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function FeedbackPost({
  fb,
  likes,
  comments,
  currentUserId,
  isAuthenticated,
  onToggleLike,
  onCommentAdded,
}: any) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const iLiked = likes.some((l: any) => l.user_id === currentUserId);
  const firstName = fb.first_name || "A grateful person";
  const initial = firstName[0]?.toUpperCase() ?? "G";

  async function handlePostComment() {
    if (!currentUserId || !commentText.trim()) return;
    setPosting(true);
    try {
      const isGuest = !isAuthenticated;
      const cFirst = isGuest
        ? `Guest ${getGuestId().slice(-6)}`
        : ((await getProfile(currentUserId))?.full_name || "User").split(" ")[0] || "User";
      const data = await createComment({
        feedback_id: fb.id,
        user_id: currentUserId,
        first_name: cFirst,
        comment: commentText.trim(),
      });
      if (data) {
        onCommentAdded(data);
        setCommentText("");
      }
    } catch (e) {
      toast.error("Failed to post comment.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground">{firstName}</p>
          <p className="text-xs text-muted-foreground">{timeAgo(fb.created_at)}</p>
        </div>
        <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold shrink-0">
          Givethra Verified
        </span>
      </div>

      {/* Body */}
      {fb.text_message && (
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {fb.text_message}
        </p>
      )}
      {fb.video_url && (
        <video
          src={fb.video_url}
          controls
          className="w-full rounded-xl border border-border max-h-72 bg-black"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-border">
        <button
          onClick={onToggleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors pt-2 ${
            iLiked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
          }`}
        >
          <Heart className="h-4 w-4" fill={iLiked ? "currentColor" : "none"} />
          Kindness {likes.length > 0 && <span>({likes.length})</span>}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors pt-2"
        >
          <MessageCircle className="h-4 w-4" />
          Comment {comments.length > 0 && <span>({comments.length})</span>}
          {comments.length > 0 &&
            (showComments ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            ))}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="space-y-3 pt-1">
          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((c: any) => (
                <div key={c.id} className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground shrink-0">
                    {(c.first_name?.[0] ?? "U").toUpperCase()}
                  </div>
                  <div className="rounded-2xl bg-muted/50 px-3 py-1.5 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {c.first_name || "User"}
                    </p>
                    <p className="text-sm text-foreground break-words">{c.comment}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {timeAgo(c.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a kind comment..."
                rows={3}
                className="flex-1 min-h-10 resize-y px-3 py-2 rounded-xl border border-border bg-background text-sm"
              />
              <button
                onClick={handlePostComment}
                disabled={posting || !commentText.trim()}
                className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
        </div>
      )}
    </div>
  );
}
