// src/frontend/src/pages/CommunityPage.tsx
// Givethra Community
// Existing features preserved:
// Posts + Comments + Likes + Share + Hero/Follow + Guest users
// + For You / My Heroes / My Posts
// + Community cache
// + Persisted Support action with 100 Supports = 1 Credit conversion
//
// IMPORTANT:
// Support is a one-time community action. It is NOT a donation, repost, or Like.

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart,
  MessageCircle,
  Send,
  User,
  Loader2,
  CheckCircle2,
  Share2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "@tanstack/react-router";
import {
  getCommunityPosts,
  toggleLike,
  addComment,
  getPostComments,
  createCommunityPost,
  getGuestId,
  followUser,
  unfollowUser,
  supportPost,
} from "@/lib/api";

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
  repost_count?: number;
  is_pinned?: boolean;

  // Support reaction fields
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
}

const COMMUNITY_POSTS_CACHE_KEY = "givethra:community-posts:v1";

function safeDisplayName(value: unknown, fallback: string): string {
  const name = String(value || "").trim();
  return name && !name.includes("@") ? name.slice(0, 120) : fallback;
}

function guestDisplayName(userId: unknown): string {
  const raw = String(userId || "").replace(/^guest:/, "");
  const suffix =
    raw.replace(/[^0-9]/g, "").slice(-6) ||
    raw.slice(-6) ||
    "Guest";

  return `Guest ${suffix}`;
}

function normalizeCachedPost(post: any): Post {
  const isGuest =
    Boolean(post?.is_guest) ||
    String(post?.user_id || "").startsWith("guest:");

  return {
    ...post,
    is_guest: isGuest,
    display_name: safeDisplayName(
      post?.display_name,
      isGuest ? guestDisplayName(post?.user_id) : "User"
    ),
    comments: undefined,

    // Preserve backend values if they exist.
    support_count: Number(post?.support_count || 0),
    supported_by_me: Boolean(post?.supported_by_me),
  };
}

function normalizeComment(comment: any): Comment {
  const isGuest = String(comment?.user_id || "").startsWith("guest:");

  return {
    ...comment,
    user_name: safeDisplayName(
      comment?.user_name,
      isGuest ? guestDisplayName(comment?.user_id) : "User"
    ),
  };
}

function readCachedCommunityPosts(): Post[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(
      localStorage.getItem(COMMUNITY_POSTS_CACHE_KEY) || "null"
    );

    const cached = Array.isArray(parsed) ? parsed : parsed?.posts;

    return Array.isArray(cached)
      ? cached
          .filter(
            (post) =>
              post &&
              typeof post.id === "string" &&
              typeof post.message === "string"
          )
          .map(normalizeCachedPost)
      : [];
  } catch {
    return [];
  }
}

function writeCachedCommunityPosts(posts: Post[]) {
  if (typeof window === "undefined") return;

  try {
    const cacheablePosts = posts.map(
      ({ comments: _comments, is_liked: _isLiked, ...post }) => post
    );

    localStorage.setItem(
      COMMUNITY_POSTS_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        posts: cacheablePosts,
      })
    );
  } catch {
    // A full or restricted browser cache must never block the feed.
  }
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [posts, setPosts] = useState<Post[]>(readCachedCommunityPosts);

  const [loading, setLoading] = useState(
    () => readCachedCommunityPosts().length === 0
  );

  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<
    Record<string, boolean>
  >({});

  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [liking, setLiking] = useState<string | null>(null);

  const [commentsLoading, setCommentsLoading] = useState<
    Record<string, boolean>
  >({});

  const [feedTab, setFeedTab] = useState<
    "for-you" | "my-heroes" | "my-posts"
  >("for-you");

  const [supportingPostId, setSupportingPostId] = useState<string | null>(null);

  // New post state
  const [newPost, setNewPost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const visiblePosts = posts;


  // ------------------------------------------------------------
  // Posts load
  // ------------------------------------------------------------

  const fetchPosts = async (showLoader = false) => {
    if (showLoader && posts.length === 0) {
      setLoading(true);
    }

    try {
      const data = await getCommunityPosts(feedTab);

      const nextPosts = Array.isArray(data)
        ? data.map(normalizeCachedPost)
        : [];

      setPosts(nextPosts);

      setLikeCounts((prev) => {
        const next = { ...prev };

        nextPosts.forEach((post: Post) => {
          next[post.id] = Number(post.likes_count || 0);
        });

        return next;
      });

      setLikedPosts((prev) => {
        const next = { ...prev };

        nextPosts.forEach((post: Post) => {
          next[post.id] = Boolean(post.is_liked);
        });

        return next;
      });

      writeCachedCommunityPosts(nextPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Comments
  // ------------------------------------------------------------

  const fetchComments = async (postId: string) => {
    try {
      const data = await getPostComments(postId);

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: Array.isArray(data)
                  ? data.map(normalizeComment)
                  : [],
                comments_count: Array.isArray(data) ? data.length : 0,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // ------------------------------------------------------------
  // Create post
  // ------------------------------------------------------------

  const handleCreatePost = async () => {
    const message = newPost.trim();

    if (!message) {
      toast.error("Please write something.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        message,
        display_name: isAuthenticated
          ? user?.fullName || "User"
          : undefined,
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

          display_name: safeDisplayName(
            result.display_name || payload.display_name,
            isAuthenticated
              ? user?.fullName || "User"
              : `Guest ${getGuestId().slice(-6)}`
          ),

          message,

          is_guest: !isAuthenticated,

          created_at: new Date().toISOString(),

          comments: [],

          likes_count: 0,
          comments_count: 0,
          is_liked: false,

          // New Support Reaction
          support_count: 0,
          supported_by_me: false,
        };

        setPosts((prev) => {
          const next = [newPostObj, ...prev];

          writeCachedCommunityPosts(next);

          return next;
        });

        window.dispatchEvent(new CustomEvent("post-updated"));
      } else {
        toast.error("Failed to post. Please try again.");
      }
    } catch (error: any) {
      console.error("Error creating post:", error);

      toast.error(error?.message || "Failed to post.");
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // Like
  // ------------------------------------------------------------

  const handleLike = async (postId: string) => {
    if (liking === postId) return;

    setLiking(postId);

    try {
      const result = await toggleLike(postId);

      const postSnapshot = posts.find(
        (post) => post.id === postId
      );

      const currentCount =
        likeCounts[postId] ??
        postSnapshot?.likes_count ??
        0;

      const nextLiked = Boolean(result.liked);

      const nextCount = Math.max(
        currentCount + (nextLiked ? 1 : -1),
        0
      );

      setLikedPosts((prev) => ({
        ...prev,
        [postId]: nextLiked,
      }));

      setLikeCounts((prev) => ({
        ...prev,
        [postId]: nextCount,
      }));

      setPosts((prev) => {
        const next = prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: nextLiked,
                likes_count: nextCount,
              }
            : post
        );

        writeCachedCommunityPosts(next);

        return next;
      });
    } catch (error: any) {
      console.error("Error toggling like:", error);

      toast.error(error?.message || "Failed to like.");
    } finally {
      setLiking(null);
    }
  };

  // ------------------------------------------------------------
  // Persisted Support action
  //
  // A Support is counted once per person (or stable guest identity) and
  // cannot be toggled back, so it contributes to the author's 100 Supports
  // to 1 Credit progress.
  // ------------------------------------------------------------

  const handleSupportReaction = async (post: Post) => {
    if (supportingPostId === post.id || post.supported_by_me) return;

    const previousCount = Number(post.support_count || 0);
    const optimisticCount = previousCount + 1;
    setSupportingPostId(post.id);
    setPosts((prev) => prev.map((item) => item.id === post.id
      ? { ...item, supported_by_me: true, support_count: optimisticCount }
      : item));

    try {
      const result = await supportPost(post.id);
      const confirmedCount = Number(result?.support_count ?? optimisticCount);
      setPosts((prev) => {
        const next = prev.map((item) => item.id === post.id
          ? { ...item, supported_by_me: true, support_count: confirmedCount }
          : item);
        writeCachedCommunityPosts(next);
        return next;
      });
      toast.success(result?.alreadySupported ? "You already supported this post." : "Support sent!");
    } catch (error: any) {
      setPosts((prev) => prev.map((item) => item.id === post.id
        ? { ...item, supported_by_me: false, support_count: previousCount }
        : item));
      toast.error(error?.message || "Failed to send Support.");
    } finally {
      setSupportingPostId(null);
    }
  };

  // ------------------------------------------------------------
  // Comments
  // ------------------------------------------------------------

  const handleComment = async (postId: string) => {
    const comment = newComment[postId]?.trim();

    if (!comment) {
      toast.error("Please write a comment.");
      return;
    }

    try {
      const data = await addComment(postId, comment);

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,

                comments: [
                  ...(post.comments || []),
                  normalizeComment(data),
                ],

                comments_count:
                  (post.comments_count ??
                    post.comments?.length ??
                    0) + 1,
              }
            : post
        )
      );

      setNewComment((prev) => ({
        ...prev,
        [postId]: "",
      }));

      toast.success("Comment added!");

      setTimeout(() => {
        const commentEl = document.getElementById(
          `comment-${data.id}`
        );

        if (commentEl) {
          commentEl.scrollIntoView({
            behavior: "smooth",
          });
        }
      }, 100);
    } catch (error: any) {
      console.error("Error adding comment:", error);

      toast.error(
        error?.message || "Failed to add comment."
      );
    }
  };

  // ------------------------------------------------------------
  // Toggle comments
  // ------------------------------------------------------------

  const toggleComments = async (postId: string) => {
    const shouldOpen = !showComments[postId];

    setShowComments((prev) => ({
      ...prev,
      [postId]: shouldOpen,
    }));

    if (
      !shouldOpen ||
      posts.find((post) => post.id === postId)?.comments !==
        undefined ||
      commentsLoading[postId]
    ) {
      return;
    }

    setCommentsLoading((prev) => ({
      ...prev,
      [postId]: true,
    }));

    try {
      await fetchComments(postId);
    } finally {
      setCommentsLoading((prev) => ({
        ...prev,
        [postId]: false,
      }));
    }
  };

  // ------------------------------------------------------------
  // Initial load + refresh
  // ------------------------------------------------------------

  useEffect(() => {
    void fetchPosts(true);

    const interval = setInterval(() => {
      void fetchPosts(false);
    }, 600000);

    const handlePostUpdate = () => {
      void fetchPosts(false);
    };

    window.addEventListener(
      "post-updated",
      handlePostUpdate
    );

    return () => {
      clearInterval(interval);

      window.removeEventListener(
        "post-updated",
        handlePostUpdate
      );
    };

    // feedTab intentionally controls this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, feedTab]);

  // ------------------------------------------------------------
  // Share
  // ------------------------------------------------------------

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/community?post=${postId}`;

    if (navigator.share) {
      navigator
        .share({
          title:
            "Check out this post on Givethra Community",
          text:
            "Join the conversation on Givethra Community!",
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard
        ?.writeText(url)
        .then(() => {
          toast.success("Link copied to clipboard!");
        })
        .catch(() => {
          toast.info(`Share this link: ${url}`);
        });
    }
  };

  // ------------------------------------------------------------
  // Follow / Hero
  // ------------------------------------------------------------

  const handleFollow = async (post: Post) => {
    if (!post.user_id) return;

    if (!isAuthenticated) {
      window.location.href = "/sign-in";
      return;
    }

    try {
      if (post.is_following) {
        await unfollowUser(post.user_id);
      } else {
        await followUser(post.user_id);
      }

      setPosts((prev) =>
        prev.map((item) =>
          item.user_id === post.user_id
            ? {
                ...item,
                is_following: !post.is_following,
              }
            : item
        )
      );
    } catch (error: any) {
      toast.error(
        error?.message || "Unable to update Hero status"
      );
    }
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Community
            </h1>

            <p className="text-sm text-muted-foreground">
              Share and connect with the Givethra family
            </p>
          </div>

          <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
            {posts.length} posts
          </span>
        </div>

        {/* Feed Tabs */}
        <div
          className="grid grid-cols-3 rounded-xl border border-border bg-muted/30 p-1"
          role="tablist"
          aria-label="Community post feeds"
        >
          <button
            type="button"
            role="tab"
            aria-selected={feedTab === "for-you"}
            onClick={() => setFeedTab("for-you")}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              feedTab === "for-you"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            For You
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={feedTab === "my-heroes"}
            onClick={() => setFeedTab("my-heroes")}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              feedTab === "my-heroes"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="inline h-4 w-4 mr-1" />
            My Heroes
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={feedTab === "my-posts"}
            onClick={() => setFeedTab("my-posts")}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              feedTab === "my-posts"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Posts
          </button>
        </div>

        {/* New Post */}
        <div className="rounded-2xl border border-primary/20 bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>

            <span className="font-medium text-sm">
              {isAuthenticated
                ? user?.fullName || "User"
                : `Guest ${getGuestId().slice(-6)}`}
            </span>

            {isAuthenticated && (
              <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          <Textarea
            placeholder="What's on your mind? Share your thoughts..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
            className="resize-none border-border focus:border-primary"
          />

          <div className="flex justify-end">
            <Button
              onClick={handleCreatePost}
              disabled={submitting || !newPost.trim()}
              className="px-6 rounded-full"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}

              {submitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div
            className="rounded-2xl border border-border bg-card p-8 text-center"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto" />

            <p className="mt-3 text-sm text-muted-foreground">
              Loading posts...
            </p>
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="text-center py-16 border rounded-2xl bg-muted/10">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />

            <p className="text-muted-foreground">
              {feedTab === "my-posts"
                ? "You have not shared a post yet."
                : feedTab === "my-heroes"
                ? "Follow Heroes to see their posts here."
                : "No posts yet. Be the first to share!"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {visiblePosts.map((post) => {
              const isSupported = Boolean(
                post.supported_by_me
              );

              const supportCount = Number(
                post.support_count || 0
              );

              return (
                <div
                  key={post.id}
                  className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
                >

                  {/* Post Header */}
                  <div className="flex items-start gap-3">

                    {post.user_id && !post.is_guest ? (
                      <button
                        type="button"
                        aria-label={`Open ${
                          post.display_name || "user"
                        } profile`}
                        onClick={() =>
                          navigate({
                            to: "/profile/$id",
                            params: {
                              id: String(post.user_id),
                            },
                          })
                        }
                        className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all"
                      >
                        {post.avatar_url ? (
                          <img
                            src={post.avatar_url}
                            alt={
                              post.display_name || "User"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {post.avatar_url ? (
                          <img
                            src={post.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">

                      <div className="flex items-center gap-2 flex-wrap">

                        {post.user_id &&
                        !post.is_guest ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate({
                                to: "/profile/$id",
                                params: {
                                  id: String(
                                    post.user_id
                                  ),
                                },
                              })
                            }
                            className="font-semibold text-foreground hover:text-primary transition-colors text-left"
                          >
                            {post.display_name || "User"}
                          </button>
                        ) : (
                          <span className="font-semibold text-foreground">
                            {post.display_name || "User"}
                          </span>
                        )}

                        {post.user_id &&
                          !post.is_guest && (
                            <button
                              type="button"
                              onClick={() =>
                                handleFollow(post)
                              }
                              className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${
                                post.is_following
                                  ? "bg-primary/10 text-primary border border-primary/30"
                                  : "bg-primary text-primary-foreground"
                              }`}
                            >
                              {post.is_following
                                ? "Hero ✓"
                                : "Hero"}
                            </button>
                          )}

                        {post.is_guest ? (
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            Guest
                          </span>
                        ) : (
                          <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(post.created_at),
                          {
                            addSuffix: true,
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed">
                    {post.message}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-5 pt-2 border-t border-border">

                    {/* LIKE */}
                    <button
                      type="button"
                      onClick={() =>
                        handleLike(post.id)
                      }
                      disabled={liking === post.id}
                      className={`flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50 ${
                        likedPosts[post.id]
                          ? "text-red-500"
                          : "text-muted-foreground hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`h-5 w-5 transition-all ${
                          likedPosts[post.id]
                            ? "fill-red-500"
                            : ""
                        }`}
                      />

                      <span className="font-medium">
                        {likeCounts[post.id] ??
                          post.likes_count ??
                          0}
                      </span>
                    </button>

                    {/* COMMENTS */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleComments(post.id)
                      }
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />

                      <span className="font-medium">
                        {post.comments_count ??
                          post.comments?.length ??
                          0}
                      </span>
                    </button>

                    {/* SHARE */}
                    <button
                      type="button"
                      onClick={() =>
                        handleShare(post.id)
                      }
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>

                    {/* SUPPORT REACTION */}
                    <button
                      type="button"
                      onClick={() =>
                        handleSupportReaction(post)
                      }
                      disabled={supportingPostId === post.id || isSupported}
                      aria-label={
                        isSupported
                          ? "Supported"
                          : "Support this post"
                      }
                      aria-pressed={isSupported}
                      className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold border transition-all duration-200 disabled:opacity-60 ${
                        isSupported
                          ? "bg-amber-500 border-amber-500 text-white scale-105 shadow-sm"
                          : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`text-lg leading-none transition-transform duration-200 ${
                          isSupported
                            ? "-translate-y-0.5"
                            : ""
                        }`}
                      >
                        {isSupported
                          ? "🫳🏻"
                          : "🫴🏻"}
                      </span>

                      <span>
                        {isSupported ? "Supported" : "Support"}
                      </span>

                      <span
                        className={`text-xs ${
                          isSupported
                            ? "text-white/90"
                            : "text-muted-foreground"
                        }`}
                      >
                        {supportCount.toLocaleString()}
                      </span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div className="space-y-4 pt-2 border-t border-border">

                      {commentsLoading[post.id] ? (
                        <div
                          className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground"
                          role="status"
                        >
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading comments...
                        </div>
                      ) : post.comments &&
                        post.comments.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">

                          {post.comments.map(
                            (comment) => (
                              <div
                                key={comment.id}
                                id={`comment-${comment.id}`}
                                className="flex gap-3"
                              >
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                </div>

                                <div className="flex-1 min-w-0">

                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                      {comment.user_name ||
                                        "User"}
                                    </span>

                                    <span className="text-[10px] text-muted-foreground">
                                      {formatDistanceToNow(
                                        new Date(
                                          comment.created_at
                                        ),
                                        {
                                          addSuffix:
                                            true,
                                        }
                                      )}
                                    </span>
                                  </div>

                                  <p className="text-sm text-foreground break-words">
                                    {comment.comment}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No comments yet.
                        </p>
                      )}

                      {/* Comment Input */}
                      <div className="flex items-end gap-2 mt-2">

                        <textarea
                          placeholder="Write a comment..."
                          value={
                            newComment[post.id] || ""
                          }
                          onChange={(e) =>
                            setNewComment(
                              (prev) => ({
                                ...prev,
                                [post.id]:
                                  e.target.value,
                              })
                            )
                          }
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              !e.shiftKey
                            ) {
                              e.preventDefault();
                              handleComment(
                                post.id
                              );
                            }
                          }}
                          rows={3}
                          className="flex-1 min-h-12 resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />

                        <Button
                          size="icon"
                          onClick={() =>
                            handleComment(
                              post.id
                            )
                          }
                          disabled={
                            !newComment[
                              post.id
                            ]?.trim()
                          }
                          className="rounded-full shrink-0 h-10 w-10"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
