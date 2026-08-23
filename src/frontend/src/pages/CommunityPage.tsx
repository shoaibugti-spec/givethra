// src/frontend/src/pages/CommunityPage.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, User, Loader2, CheckCircle2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  getCommunityPosts,
  toggleLike,
  addComment,
  getPostLikes,
  getPostComments,
  createNotification,
  createCommunityPost,
  getGuestId,
} from "@/lib/api";

interface Post {
  id: string;
  user_id: string | null;
  display_name: string;
  message: string;
  is_guest: boolean;
  created_at: string;
  comments?: Comment[];
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export default function CommunityPage() {
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [liking, setLiking] = useState<string | null>(null);
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});

  // New post state
  const [newPost, setNewPost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- پوسٹس لوڈ کریں ---
  const fetchPosts = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const data = await getCommunityPosts();
      setPosts(data || []);
      // Like counts are shown on every card; comments are fetched lazily when opened.
      data?.forEach((post: Post) => { fetchLikes(post.id); });
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // --- لائکس لوڈ کریں ---
  const fetchLikes = async (postId: string) => {
    try {
      const data = await getPostLikes(postId);
      setLikeCounts((prev) => ({ ...prev, [postId]: data.length || 0 }));
      const actorId = isAuthenticated && user?.id ? user.id : `guest:${getGuestId()}`;
      if (actorId) {
        const userLiked = data.some((like: any) => like.user_id === actorId);
        setLikedPosts((prev) => ({ ...prev, [postId]: userLiked }));
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  // --- کمنٹس لوڈ کریں ---
  const fetchComments = async (postId: string) => {
    try {
      const data = await getPostComments(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments: data || [] } : post
        )
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // --- نئی پوسٹ کریں ---
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
        display_name: isAuthenticated ? (user?.fullName || user?.email?.split("@")[0] || "User") : undefined,
        is_guest: !isAuthenticated,
        user_id: isAuthenticated ? (user?.id || null) : null,
        guest_id: isAuthenticated ? undefined : getGuestId(),
      };
      const result = await createCommunityPost(payload);
      if (result?.id) {
        toast.success("Post shared!");
        setNewPost("");
        const newPostObj: Post = {
          id: result.id,
          user_id: user?.id || null,
          display_name: result.display_name || payload.display_name || `Guest ${getGuestId().slice(-6)}`,
          message,
          is_guest: !isAuthenticated,
          created_at: new Date().toISOString(),
          comments: [],
        };
        setPosts((prev) => [newPostObj, ...prev]);
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

  // --- لائک ٹوگل کریں ---
  const handleLike = async (postId: string) => {
    if (liking === postId) return;
    setLiking(postId);
    try {
      const result = await toggleLike(postId);
      if (result.liked) {
        setLikedPosts((prev) => ({ ...prev, [postId]: true }));
        setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
        const postOwner = posts.find((p) => p.id === postId)?.user_id;
        if (postOwner && postOwner !== user?.id) {
          try {
            await createNotification({
              user_id: postOwner,
              type: "like",
              title: "New Like ❤️",
              message: `${user?.fullName || "Someone"} liked your post.`,
              link: "/community",
            });
          } catch (e) {}
        }
      } else {
        setLikedPosts((prev) => ({ ...prev, [postId]: false }));
        setLikeCounts((prev) => ({ ...prev, [postId]: Math.max((prev[postId] || 0) - 1, 0) }));
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error(error?.message || "Failed to like.");
    } finally {
      setLiking(null);
    }
  };

  // --- کمنٹ کریں ---
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
            ? { ...post, comments: [...(post.comments || []), data] }
            : post
        )
      );
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
      const postOwner = posts.find((p) => p.id === postId)?.user_id;
      if (postOwner && postOwner !== user?.id) {
        try {
          await createNotification({
            user_id: postOwner,
            type: "comment",
            title: "New Comment 💬",
            message: `${user?.fullName || "Someone"} commented: "${comment.slice(0, 50)}${comment.length > 50 ? "..." : ""}"`,
            link: "/community",
          });
        } catch (e) {}
      }
      toast.success("Comment added!");
      setTimeout(() => {
        const commentEl = document.getElementById(`comment-${data.id}`);
        if (commentEl) commentEl.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(error?.message || "Failed to add comment.");
    }
  };

  // --- کمنٹس دکھائیں/چھپائیں ---
  const toggleComments = async (postId: string) => {
    const shouldOpen = !showComments[postId];
    setShowComments((prev) => ({ ...prev, [postId]: shouldOpen }));
    if (!shouldOpen || posts.find((post) => post.id === postId)?.comments !== undefined || commentsLoading[postId]) return;
    setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      await fetchComments(postId);
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // --- پہلی بار اور وقتاً فوقتاً لوڈ کریں ---
  useEffect(() => {
    void fetchPosts(true);
    const interval = setInterval(() => { void fetchPosts(false); }, 600000);
    const handlePostUpdate = () => { void fetchPosts(false); };
    window.addEventListener("post-updated", handlePostUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("post-updated", handlePostUpdate);
    };
  }, [isAuthenticated]);

  // --- شیئر کرنا ---
  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/community?post=${postId}`;
    if (navigator.share) {
      navigator.share({
        title: "Check out this post on Givethra Community",
        text: "Join the conversation on Givethra Community!",
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).then(() => {
        toast.success("Link copied to clipboard!");
      }).catch(() => {
        toast.info(`Share this link: ${url}`);
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Community</h1>
            <p className="text-sm text-muted-foreground">Share and connect with the Givethra family</p>
          </div>
          <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
            {posts.length} posts
          </span>
        </div>

        {/* Public New Post Box: guests and signed-in users can post */}
        {true ? (
          <div className="rounded-2xl border border-primary/20 bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-sm">
                {isAuthenticated ? (user?.fullName || "User") : `Guest ${getGuestId().slice(-6)}`}
              </span>
              {isAuthenticated && (
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
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
                Post
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
            <p className="text-muted-foreground">Sign in to share your thoughts with the community.</p>
            <Button
              variant="outline"
              className="mt-3 rounded-full"
              onClick={() => window.location.href = "/sign-in"}
            >
              Sign In
            </Button>
          </div>
        )}

        {/* Posts List: the shell and composer stay interactive while the feed request is pending */}
        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center" role="status" aria-live="polite">
            <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 border rounded-2xl bg-muted/10">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Post Header */}
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">
                        {post.display_name || "User"}
                      </span>
                      {post.is_guest ? (
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Guest</span>
                      ) : (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed">
                  {post.message}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-6 pt-2 border-t border-border">
                  <button
                    onClick={() => handleLike(post.id)}
                    disabled={liking === post.id}
                    className={`flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50 ${
                      likedPosts[post.id]
                        ? "text-red-500"
                        : "text-muted-foreground hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 transition-all ${
                        likedPosts[post.id] ? "fill-red-500" : ""
                      }`}
                    />
                    <span className="font-medium">{likeCounts[post.id] || 0}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">{post.comments?.length || 0}</span>
                  </button>

                  <button
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Comments Section */}
                    {showComments[post.id] && (
                  <div className="space-y-4 pt-2 border-t border-border">
                    {commentsLoading[post.id] ? (
                      <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground" role="status">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading comments...
                      </div>
                    ) : post.comments && post.comments.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {post.comments.map((comment) => (
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
                                  {comment.user_name || "User"}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.created_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-foreground break-words">
                                {comment.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No comments yet.
                      </p>
                    )}

                    {/* Public Comment Input */}
                    {true ? (
                      <div className="flex items-end gap-2 mt-2">
                        <textarea
                          placeholder="Write a comment..."
                          value={newComment[post.id] || ""}
                          onChange={(e) =>
                            setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleComment(post.id);
                            }
                          }}
                          rows={3}
                          className="flex-1 min-h-12 resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />
                        <Button
                          size="icon"
                          onClick={() => handleComment(post.id)}
                          disabled={!newComment[post.id]?.trim()}
                          className="rounded-full shrink-0 h-10 w-10"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center">
                        Public comments are welcome.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
