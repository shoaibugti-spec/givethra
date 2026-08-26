import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { addComment, getHeroesWall, getPostComments, toggleLike } from "@/lib/api";
import { Button } from "@/components/ui/button";

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

function money(currency: string | undefined, amount: number) {
  const symbol = currency === "PKR" ? "Rs" : currency || "PKR";
  return `${symbol} ${amount.toLocaleString()}`;
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

  async function loadWall() {
    try {
      const result = await getHeroesWall();
      setItems(Array.isArray(result?.cases) ? result.cases : []);
      setMetrics(result?.metrics || { solved_cases: 0, total_amount: 0, currency: "PKR" });
      setIndex(0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
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

  async function handleLike() {
    if (!current) return;
    try {
      const result = await toggleLike(current.post_id);
      setLiked((prev) => ({ ...prev, [current.post_id]: Boolean(result.liked) }));
      setItems((prev) => prev.map((item) => item.post_id === current.post_id ? { ...item, likes_count: Math.max(0, Number(item.likes_count || 0) + (result.liked ? 1 : -1)) } : item));
    } catch (error: any) {
      toast.error(error?.message || "Unable to update kindness right now.");
    }
  }

  async function toggleComments() {
    if (!current) return;
    const next = !openComments[current.post_id];
    setOpenComments((prev) => ({ ...prev, [current.post_id]: next }));
    if (!next || comments[current.post_id]) return;
    try {
      const result = await getPostComments(current.post_id);
      setComments((prev) => ({ ...prev, [current.post_id]: result }));
    } catch (error: any) {
      toast.error(error?.message || "Unable to load comments.");
    }
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
    } catch (error: any) {
      toast.error(error?.message || "Unable to post your comment.");
    } finally {
      setPosting(false);
    }
  }

  if (loading || !items.length) return null;

  return (
    <section aria-labelledby="heroes-wall-title" className="bg-muted/20 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary"><Trophy className="h-4 w-4" /> Community impact</p>
            <h2 id="heroes-wall-title" className="font-display text-2xl font-bold">Heroes Wall</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">Real cases completed through verified help from Givethra Heroes.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:min-w-[270px]">
            <div className="rounded-xl border border-border bg-card px-3 py-2"><p className="text-lg font-bold text-primary">{metrics.solved_cases}</p><p className="text-[11px] text-muted-foreground">Cases solved</p></div>
            <div className="rounded-xl border border-border bg-card px-3 py-2"><p className="text-lg font-bold text-teal-600">{money(metrics.currency, Number(metrics.total_amount || 0))}</p><p className="text-[11px] text-muted-foreground">Total help delivered</p></div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <article className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Completed case {index + 1} of {items.length}</p><h3 className="mt-1 truncate text-xl font-bold">{current.title || "A case completed with community help"}</h3><p className="mt-1 text-sm text-muted-foreground">{current.category || "Verified help"}</p></div>
              <span className="shrink-0 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-700">Help complete</span>
            </div>
            <p className="mt-5 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground">{current.post_message || "A Givethra case was completed through verified help from Heroes."}</p>
            <div className="mt-5"><div className="mb-2 flex justify-between text-sm"><span className="font-semibold">Verified impact</span><span className="font-bold text-teal-600">{money(current.currency, Number(current.amount_collected || current.amount_needed || 0))}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-teal-500" style={{ width: `${progress}%` }} /></div></div>
            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-3"><button type="button" onClick={handleLike} className={`flex items-center gap-1.5 text-sm font-medium ${currentLike ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}><Heart className="h-4 w-4" fill={currentLike ? "currentColor" : "none"} /> Like <span>({Number(current.likes_count || 0)})</span></button><button type="button" onClick={toggleComments} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"><MessageCircle className="h-4 w-4" /> Comment <span>({Number(current.comments_count || 0)})</span></button><div className="ml-auto flex gap-1"><Button type="button" variant="outline" size="icon" aria-label="Previous completed case" disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))}><ChevronLeft className="h-4 w-4" /></Button><Button type="button" variant="outline" size="icon" aria-label="Next completed case" disabled={index === items.length - 1} onClick={() => setIndex((value) => Math.min(items.length - 1, value + 1))}><ChevronRight className="h-4 w-4" /></Button></div></div>
            {openComments[current.post_id] && <div className="mt-4 space-y-3"><div className="max-h-48 space-y-2 overflow-y-auto">{currentComments.length ? currentComments.map((comment) => <div key={comment.id} className="rounded-xl bg-muted/40 px-3 py-2"><p className="text-xs font-semibold">{comment.user_name || "A Givethra member"}</p><p className="text-sm break-words">{comment.comment}</p></div>) : <p className="text-sm text-muted-foreground">No comments yet.</p>}</div><div className="flex items-end gap-2"><textarea aria-label="Comment on completed case" value={currentCommentText} onChange={(event) => setCommentText((prev) => ({ ...prev, [current.post_id]: event.target.value }))} placeholder="Write a kind comment..." rows={2} className="min-h-10 flex-1 resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm" /><Button type="button" size="icon" aria-label="Post comment" disabled={posting || !currentCommentText.trim()} onClick={handleComment}><Send className="h-4 w-4" /></Button></div></div>}
          </article>
        </div>
      </div>
    </section>
  );
}
