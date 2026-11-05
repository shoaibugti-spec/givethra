// src/pages/CommunityPage.tsx
// Premium Twitter/Facebook-style Community — with Slide-up Profile.
// 100% system preserved. Only UI upgraded.

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Heart, MessageCircle, Send, User, Loader2, CheckCircle2, Share2,
  MoreHorizontal, X, MapPin, ShieldCheck, Clock, ChevronRight,
  Sparkles, TrendingUp, Award, Users, Zap, Gift,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "@tanstack/react-router";
import {
  getCommunityPosts, toggleLike, addComment, getPostComments,
  createCommunityPost, getGuestId, followUser, unfollowUser,
  supportPost, deleteCommunityPost, getProfile, getUserSupports, getWallet,
} from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
  id: string;
  user_id: string | null;
  display_name: string;
  message: string;
  is_guest: boolean;
  created_at: string;
  comments?: Comment[];
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  avatar_url?: string | null;
  is_following?: boolean;
  is_pinned?: boolean;
  support_count?: number;
  supported_by_me?: boolean;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
  avatar_url?: string | null;
}

const COMMUNITY_POSTS_CACHE_KEY = "givethra:community-posts:v1";

function safeDisplayName(value: unknown, fallback: string): string {
  const name = String(value || "").trim();
  return name && !name.includes("@") ? name.slice(0, 120) : fallback;
}

function guestDisplayName(userId: unknown): string {
  const raw = String(userId || "").replace(/^guest:/, "");
  const suffix = raw.replace(/[^0-9]/g, "").slice(-6) || raw.slice(-6) || "Guest";
  return `Guest ${suffix}`;
}

function normalizeCachedPost(post: any): Post {
  const isGuest = Boolean(post?.is_guest) || String(post?.user_id || "").startsWith("guest:");
  return {
    ...post,
    is_guest: isGuest,
    display_name: safeDisplayName(post?.display_name, isGuest ? guestDisplayName(post?.user_id) : "User"),
    comments: undefined,
    support_count: Number(post?.support_count || 0),
    supported_by_me: Boolean(post?.supported_by_me),
  };
}

function normalizeComment(comment: any): Comment {
  const isGuest = String(comment?.user_id || "").startsWith("guest:");
  return { ...comment, user_name: safeDisplayName(comment?.user_name, isGuest ? guestDisplayName(comment?.user_id) : "User") };
}

function readCachedCommunityPosts(): Post[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(COMMUNITY_POSTS_CACHE_KEY) || "null");
    const cached = Array.isArray(parsed) ? parsed : parsed?.posts;
    return Array.isArray(cached) ? cached.filter(p => p && typeof p.id === "string" && typeof p.message === "string").map(normalizeCachedPost) : [];
  } catch { return []; }
}

function writeCachedCommunityPosts(posts: Post[]) {
  if (typeof window === "undefined") return;
  try {
    const cacheable = posts.map(({ comments: _c, is_liked: _i, ...p }) => p);
    localStorage.setItem(COMMUNITY_POSTS_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), posts: cacheable }));
  } catch {}
}

// ============================================================
// Slide-Up Profile — a beautiful bottom sheet showing user profile
// ============================================================
function SlideUpProfile({
  userId,
  displayName,
  avatarUrl,
  isFollowing,
  onClose,
  onFollowToggle,
}: {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  isFollowing?: boolean;
  onClose: () => void;
  onFollowToggle?: () => void;
}) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [supports, setSupports] = useState(0);
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.allSettled([
      getProfile(userId),
      getUserSupports(userId),
      getWallet(userId),
    ]).then(([profileRes, supportsRes, walletRes]) => {
      if (profileRes.status === "fulfilled") setProfile(profileRes.value);
      if (supportsRes.status === "fulfilled") setSupports(Number((supportsRes.value as any)?.supports || 0));
      if (walletRes.status === "fulfilled") setWallet(Number((walletRes.value as any)?.balance || 0));
      setLoading(false);
    });
  }, [userId]);

  const initials = (profile?.full_name || displayName || "U").slice(0, 2).toUpperCase();
  const kycStatus = String(profile?.kyc_status || "none").toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl"
      >
        {/* Cover */}
        <div className="relative h-28 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-yellow-300/20 blur-2xl" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute left-4 top-3 flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
            <Sparkles className="h-3 w-3" /> Profile Preview
          </div>
        </div>

        <div className="px-5 pb-6">
          {/* Avatar + Name */}
          <div className="-mt-12 flex items-end gap-4">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-br from-teal-500 to-emerald-600 text-2xl font-black text-white shadow-xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {kycStatus === "approved" && (
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-md">
                  <ShieldCheck className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <h2 className="font-display text-xl font-black tracking-tight text-slate-900">{displayName}</h2>
            {profile?.username && (
              <p className="text-sm font-medium text-slate-500">@{profile.username}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {kycStatus === "approved" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  New Member
                </span>
              )}
              {profile?.city && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                  <MapPin className="h-3 w-3" /> {profile.city}{profile.country ? `, ${profile.country}` : ""}
                </span>
              )}
            </div>
          </div>

          {profile?.bio && (
            <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          {!loading && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-3 text-center">
                <Gift className="mx-auto h-4 w-4 text-teal-600" />
                <p className="mt-1 text-lg font-black text-teal-700">{supports.toLocaleString()}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Supports</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                <Users className="mx-auto h-4 w-4 text-slate-500" />
                <p className="mt-1 text-lg font-black text-slate-800">{profile?.heroes_count || 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Followers</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-3 text-center">
                <TrendingUp className="mx-auto h-4 w-4 text-amber-600" />
                <p className="mt-1 text-lg font-black text-amber-700">{wallet.toLocaleString()}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Credits</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex gap-2">
            <Button
              onClick={() => { onClose(); navigate({ to: "/profile/$id", params: { id: userId } }); }}
              className="h-12 flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 font-black text-white shadow-lg"
            >
              View Full Profile <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            {onFollowToggle && (
              <Button
                onClick={onFollowToggle}
                variant="outline"
                className={`h-12 rounded-xl font-bold ${isFollowing ? "border-teal-300 text-teal-700 bg-teal-50" : "border-slate-300"}`}
              >
                {isFollowing ? <><CheckCircle2 className="mr-1 h-4 w-4" /> Hero ✓</> : <><Heart className="mr-1 h-4 w-4" /> Make Hero</>}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Main Community Page
// ============================================================
export default function CommunityPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin, isAssistant } = useAuth();
  const canModerateCommunity = isAdmin || isAssistant || new Set(["shoaibugti@gmail.com", "shoaibahmedbugti5@gmail.com"]).has(String(user?.email || "").toLowerCase());

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [liking, setLiking] = useState<string | null>(null);
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [feedTab, setFeedTab] = useState<"for-you" | "latest" | "most-supported" | "my-posts">("for-you");
  const [supportingPostId, setSupportingPostId] = useState<string | null>(null);
  const [newPost, setNewPost] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Profile sheet state
  const [profileSheet, setProfileSheet] = useState<{ userId: string; displayName: string; avatarUrl?: string | null; isFollowing?: boolean } | null>(null);

  const visiblePosts = posts;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in", search: { redirect: "/community" } });
    }
  }, [isAuthenticated, navigate]);

  const fetchPosts = async (showLoader = false) => {
    if (showLoader && posts.length === 0) setLoading(true);
    try {
      const rankSeed = feedTab === "for-you" ? (Date.now() ^ Math.floor(Math.random() * 2147483647)) % 2147483647 : undefined;
      const data = await getCommunityPosts(feedTab, rankSeed);
      const nextPosts = Array.isArray(data) ? data.map(normalizeCachedPost) : [];
      setPosts(nextPosts);
      setLikeCounts(prev => {
        const next = { ...prev };
        nextPosts.forEach((post: Post) => { next[post.id] = Number(post.likes_count || 0); });
        return next;
      });
      setLikedPosts(prev => {
        const next = { ...prev };
        nextPosts.forEach((post: Post) => { next[post.id] = Boolean(post.is_liked); });
        return next;
      });
      writeCachedCommunityPosts(nextPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally { setLoading(false); }
  };

  const fetchComments = async (postId: string) => {
    try {
      const data = await getPostComments(postId);
      setPosts(prev => prev.map(post => post.id === postId ? {
        ...post,
        comments: Array.isArray(data) ? data.map(normalizeComment) : [],
        comments_count: Array.isArray(data) ? data.length : 0,
      } : post));
    } catch (error) { console.error("Error fetching comments:", error); }
  };

  const handleCreatePost = async () => {
    const message = newPost.trim();
    if (!message) { toast.error("Please write something."); return; }
    setSubmitting(true);
    try {
      const payload = {
        message,
        display_name: isAuthenticated ? user?.fullName || "User" : undefined,
        is_guest: !isAuthenticated,
        user_id: isAuthenticated ? user?.id || null : null,
        guest_id: isAuthenticated ? undefined : getGuestId(),
      };
      const result = await createCommunityPost(payload);
      if (result?.id) {
        toast.success("Post shared!");
        setNewPost("");
        const newPostObj: Post = {
          id: result.id,
          user_id: user?.id || null,
          display_name: safeDisplayName(result.display_name || payload.display_name, isAuthenticated ? user?.fullName || "User" : `Guest ${getGuestId().slice(-6)}`),
          message, is_guest: !isAuthenticated,
          created_at: new Date().toISOString(),
          comments: [], likes_count: 0, comments_count: 0, is_liked: false,
          avatar_url: user?.photo || null,
          support_count: 0, supported_by_me: false,
        };
        setPosts(prev => { const next = [newPostObj, ...prev]; writeCachedCommunityPosts(next); return next; });
        window.dispatchEvent(new CustomEvent("post-updated"));
      } else { toast.error("Failed to post. Please try again."); }
    } catch (error: any) { console.error("Error creating post:", error); toast.error(error?.message || "Failed to post."); }
    finally { setSubmitting(false); }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Delete this community post and its engagement?")) return;
    setDeletingPostId(postId);
    try {
      await deleteCommunityPost(postId);
      setPosts(prev => { const next = prev.filter(post => post.id !== postId); writeCachedCommunityPosts(next); return next; });
      toast.success("Post deleted.");
      window.dispatchEvent(new CustomEvent("post-updated"));
    } catch (error: any) { toast.error(error?.message || "Failed to delete post."); }
    finally { setDeletingPostId(null); }
  };

  const handleLike = async (postId: string) => {
    if (liking === postId) return;
    setLiking(postId);
    try {
      const result = await toggleLike(postId);
      const postSnapshot = posts.find(post => post.id === postId);
      const currentCount = likeCounts[postId] ?? postSnapshot?.likes_count ?? 0;
      const nextLiked = Boolean(result.liked);
      const nextCount = Math.max(currentCount + (nextLiked ? 1 : -1), 0);
      setLikedPosts(prev => ({ ...prev, [postId]: nextLiked }));
      setLikeCounts(prev => ({ ...prev, [postId]: nextCount }));
      setPosts(prev => { const next = prev.map(post => post.id === postId ? { ...post, is_liked: nextLiked, likes_count: nextCount } : post); writeCachedCommunityPosts(next); return next; });
    } catch (error: any) { toast.error(error?.message || "Failed to like."); }
    finally { setLiking(null); }
  };

  const handleSupportReaction = async (post: Post) => {
    if (supportingPostId === post.id || post.supported_by_me) return;
    const previousCount = Number(post.support_count || 0);
    const optimisticCount = previousCount + 1;
    setSupportingPostId(post.id);
    setPosts(prev => prev.map(item => item.id === post.id ? { ...item, supported_by_me: true, support_count: optimisticCount } : item));
    try {
      const result = await supportPost(post.id);
      const confirmedCount = Number(result?.support_count ?? optimisticCount);
      setPosts(prev => { const next = prev.map(item => item.id === post.id ? { ...item, supported_by_me: true, support_count: confirmedCount } : item); writeCachedCommunityPosts(next); return next; });
      toast.success(result?.alreadySupported ? "You already supported this post." : "Support sent!");
    } catch (error: any) {
      setPosts(prev => prev.map(item => item.id === post.id ? { ...item, supported_by_me: false, support_count: previousCount } : item));
      toast.error(error?.message || "Failed to send Support.");
    } finally { setSupportingPostId(null); }
  };

  const handleComment = async (postId: string) => {
    const comment = newComment[postId]?.trim();
    if (!comment) { toast.error("Please write a comment."); return; }
    try {
      const data = await addComment(postId, comment);
      setPosts(prev => prev.map(post => post.id === postId ? {
        ...post,
        comments: [...(post.comments || []), normalizeComment(data)],
        comments_count: (post.comments_count ?? post.comments?.length ?? 0) + 1,
      } : post));
      setNewComment(prev => ({ ...prev, [postId]: "" }));
      toast.success("Comment added!");
      setTimeout(() => { document.getElementById(`comment-${data.id}`)?.scrollIntoView({ behavior: "smooth" }); }, 100);
    } catch (error: any) { toast.error(error?.message || "Failed to add comment."); }
  };

  const toggleComments = async (postId: string) => {
    const shouldOpen = !showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: shouldOpen }));
    if (!shouldOpen || posts.find(post => post.id === postId)?.comments !== undefined || commentsLoading[postId]) return;
    setCommentsLoading(prev => ({ ...prev, [postId]: true }));
    try { await fetchComments(postId); } finally { setCommentsLoading(prev => ({ ...prev, [postId]: false })); }
  };

  useEffect(() => {
    setPosts([]); setLoading(true); void fetchPosts(true);
    const interval = setInterval(() => { void fetchPosts(false); }, 600000);
    const handlePostUpdate = () => { void fetchPosts(false); };
    window.addEventListener("post-updated", handlePostUpdate);
    return () => { clearInterval(interval); window.removeEventListener("post-updated", handlePostUpdate); };
  }, [isAuthenticated, feedTab]);

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/community?post=${postId}`;
    if (navigator.share) navigator.share({ title: "Check out this post on Givethra Community", text: "Join the conversation on Givethra Community!", url }).catch(() => {});
    else navigator.clipboard?.writeText(url).then(() => toast.success("Link copied!")).catch(() => toast.info(`Share this link: ${url}`));
  };

  const handleFollow = async (post: Post) => {
    if (!post.user_id) return;
    if (!isAuthenticated) { window.location.href = "/sign-in"; return; }
    try {
      if (post.is_following) await unfollowUser(post.user_id);
      else await followUser(post.user_id);
      setPosts(prev => prev.map(item => item.user_id === post.user_id ? { ...item, is_following: !post.is_following } : item));
    } catch (error: any) { toast.error(error?.message || "Unable to update Hero status"); }
  };

  const openProfileSheet = (post: Post) => {
    if (!post.user_id || post.is_guest) return;
    setProfileSheet({ userId: String(post.user_id), displayName: post.display_name, avatarUrl: post.avatar_url, isFollowing: post.is_following });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-3 py-5 md:px-4 md:py-8">

        {/* ===== HEADER ===== */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight text-slate-900">Community</h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500">Share, connect, and inspire the Givethra family.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* ===== FEED TABS ===== */}
        <div className="mb-5 flex gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {[
            { k: "for-you", label: "For You", icon: Sparkles },
            { k: "latest", label: "Latest", icon: Clock },
            { k: "most-supported", label: "Popular", icon: TrendingUp },
            { k: "my-posts", label: "My Posts", icon: User },
          ].map(({ k, label, icon: Icon }) => (
            <button
              key={k}
              type="button"
              onClick={() => setFeedTab(k as typeof feedTab)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-black transition-all ${
                feedTab === k
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ===== COMPOSE BOX (Twitter-style) ===== */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex gap-3 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 font-black text-white shadow-md">
              {user?.photo ? <img src={user.photo} alt="" className="h-full w-full object-cover" /> : (user?.fullName || "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <Textarea
                placeholder="What's happening in your community?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border-0 bg-transparent p-0 text-base font-medium text-slate-900 placeholder:text-slate-400 focus-visible:ring-0"
                maxLength={500}
              />
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                  <span className={newPost.length > 450 ? "text-amber-600" : ""}>{newPost.length}/500</span>
                  <span className="hidden sm:inline">· Share your thoughts with the Givethra family</span>
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={submitting || !newPost.trim()}
                  className="h-10 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 px-6 font-black text-white shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />}
                  {submitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== POSTS ===== */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex gap-3">
                  <div className="h-11 w-11 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2"><div className="h-3 w-1/3 rounded bg-slate-200" /><div className="h-2.5 w-1/4 rounded bg-slate-100" /></div>
                </div>
                <div className="mt-4 space-y-2"><div className="h-3 w-5/6 rounded bg-slate-200" /><div className="h-3 w-4/6 rounded bg-slate-100" /></div>
                <div className="mt-4 flex gap-3"><div className="h-6 w-16 rounded-full bg-slate-100" /><div className="h-6 w-16 rounded-full bg-slate-100" /></div>
              </div>
            ))}
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-700">{feedTab === "my-posts" ? "You haven't shared a post yet." : "No posts yet."}</p>
            <p className="mt-1 text-xs text-slate-500">Be the first to share with the community!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visiblePosts.map(post => {
              const isSupported = Boolean(post.supported_by_me);
              const supportCount = Number(post.support_count || 0);
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  {/* Post Header */}
                  <div className="flex items-start gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => openProfileSheet(post)}
                      className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 font-black text-white shadow-sm ring-2 ring-white transition hover:ring-teal-300"
                      disabled={!post.user_id || post.is_guest}
                    >
                      {post.avatar_url ? (
                        <img src={post.avatar_url} alt={post.display_name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">
                          {(post.display_name || "U").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openProfileSheet(post)}
                          disabled={!post.user_id || post.is_guest}
                          className="truncate text-sm font-black text-slate-900 transition hover:text-teal-600 disabled:hover:text-slate-900"
                        >
                          {post.display_name || "User"}
                        </button>
                        {post.user_id && !post.is_guest && (
                          <button
                            type="button"
                            onClick={() => handleFollow(post)}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-black transition ${
                              post.is_following
                                ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200"
                                : "bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 shadow-sm"
                            }`}
                          >
                            {post.is_following ? "Hero ✓" : "Make Hero"}
                          </button>
                        )}
                        {post.is_guest ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Guest</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {canModerateCommunity && (
                      <button
                        onClick={() => void handleDeletePost(post.id)}
                        disabled={deletingPostId === post.id}
                        className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete post"
                      >
                        {deletingPostId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-5 w-5" />}
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <p className="whitespace-pre-wrap break-words px-4 pb-3 text-[15px] leading-relaxed text-slate-800">{post.message}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-1 border-t border-slate-100 px-2 py-2">
                    <button
                      onClick={() => handleLike(post.id)}
                      disabled={liking === post.id}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                        likedPosts[post.id] ? "text-rose-600" : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${likedPosts[post.id] ? "fill-current" : ""}`} />
                      {likeCounts[post.id] ?? post.likes_count ?? 0}
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold text-slate-500 transition hover:bg-teal-50 hover:text-teal-600"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {post.comments_count ?? post.comments?.length ?? 0}
                    </button>
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold text-slate-500 transition hover:bg-teal-50 hover:text-teal-600"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleSupportReaction(post)}
                      disabled={supportingPostId === post.id || isSupported}
                      className={`ml-1 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black transition-all ${
                        isSupported
                          ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-md"
                          : "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm hover:scale-105"
                      } disabled:opacity-60`}
                    >
                      <span className="text-sm leading-none">{isSupported ? "🫳🏻" : "🫴🏻"}</span>
                      <span>{isSupported ? "Supported" : "Support"}</span>
                      <span className={`text-[10px] ${isSupported ? "text-amber-900" : "text-white/80"}`}>{supportCount}</span>
                    </button>
                  </div>

                  {/* Comments */}
                  {showComments[post.id] && (
                    <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 p-4">
                      {commentsLoading[post.id] ? (
                        <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading comments...
                        </div>
                      ) : post.comments && post.comments.length > 0 ? (
                        <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
                          {post.comments.map(comment => (
                            <div key={comment.id} id={`comment-${comment.id}`} className="flex gap-2.5">
                              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-200">
                                {comment.avatar_url ? (
                                  <img src={comment.avatar_url} alt={comment.user_name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-black text-slate-500">
                                    {(comment.user_name || "U").slice(0, 1).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1 rounded-xl bg-white p-2.5 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-slate-900">{comment.user_name || "User"}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="mt-1 break-words text-sm text-slate-700">{comment.comment}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="py-2 text-center text-xs font-medium text-slate-400">No comments yet. Be the first!</p>
                      )}
                      <div className="flex items-end gap-2">
                        <textarea
                          placeholder="Write a comment..."
                          value={newComment[post.id] || ""}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleComment(post.id);
                            }
                          }}
                          rows={1}
                          className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                        />
                        <Button
                          size="icon"
                          onClick={() => handleComment(post.id)}
                          disabled={!newComment[post.id]?.trim()}
                          className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ===== SLIDE-UP PROFILE ===== */}
        <AnimatePresence>
          {profileSheet && (
            <SlideUpProfile
              userId={profileSheet.userId}
              displayName={profileSheet.displayName}
              avatarUrl={profileSheet.avatarUrl}
              isFollowing={profileSheet.isFollowing}
              onClose={() => setProfileSheet(null)}
              onFollowToggle={() => {
                const post = posts.find(p => String(p.user_id) === profileSheet.userId);
                if (post) {
                  handleFollow(post);
                  setProfileSheet(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null);
                }
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
