import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, User, Plus, Loader2 } from "lucide-react";
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

  // New post state
  const [newPost, setNewPost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- پوسٹس لوڈ کریں ---
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getCommunityPosts();
      setPosts(data || []);
      data?.forEach((post: Post) => {
        fetchLikes(post.id);
        fetchComments(post.id);
      });
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
      if (isAuthenticated && user?.id) {
        const userLiked = data.some((like: any) => like.user_id === user.id);
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
    if (!isAuthenticated) {
      toast.error("Please sign in to post.");
      return;
    }
    const message = newPost.trim();
    if (!message) {
      toast.error("Please write something.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        message,
        display_name: user?.full_name || user?.email?.split("@")[0] || "User",
        is_guest: false,
        user_id: user?.id || null,
      };
      const result = await createCommunityPost(payload);
      if (result?.id) {
        toast.success("Post shared!");
        setNewPost("");
        // Add new post to the top
        const newPostObj: Post = {
          id: result.id,
          user_id: user?.id || null,
          display_name: payload.display_name,
          message,
          is_guest: false,
          created_at: new Date().toISOString(),
          comments: [],
        };
        setPosts((prev) => [newPostObj, ...prev]);
        // Trigger post-updated event to update count in Layout
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
    if (!isAuthenticated) {
      toast.error("Please sign in to like.");
      return;
    }
    try {
      const result = await toggleLike(postId);
      if (result.liked) {
        setLikedPosts((prev) => ({ ...prev, [postId]: true }));
        setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
        // Send notification to post owner (if not self)
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
          } catch (e) {
            // silent fail for notification
          }
        }
        // toast.success("Liked!");
      } else {
        setLikedPosts((prev) => ({ ...prev, [postId]: false }));
        setLikeCounts((prev) => ({ ...prev, [postId]: Math.max((prev[postId] || 0) - 1, 0) }));
        // toast.info("Unliked");
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error(error?.message || "Failed to like.");
    }
  };

  // --- کمنٹ کریں ---
  const handleComment = async (postId: string) => {
    const comment = newComment[postId]?.trim();
    if (!comment) {
      toast.error("Please write a comment.");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please sign in to comment.");
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
      // Send notification to post owner
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
      // Scroll to the new comment after a moment
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
  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // --- پہلی بار اور وقتاً فوقتاً لوڈ کریں ---
  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000);
    const handlePostUpdate = () => fetchPosts();
    window.addEventListener("post-updated", handlePostUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("post-updated", handlePostUpdate);
    };
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
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

      {/* New Post Box (only for authenticated users) */}
      {isAuthenticated ? (
        <div className="rounded-2xl border border-primary/20 bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium text-sm">{user?.full_name || "User"}</span>
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

      {/* Posts List */}
      {posts.length === 0 ? (
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
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Verified</span>
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
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    likedPosts[post.id]
                      ? "text-red-500"
                      : "text-muted-foreground hover:text-red-500"
                  }`}
                  disabled={!isAuthenticated}
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
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="space-y-4 pt-2 border-t border-border">
                  {post.comments && post.comments.length > 0 ? (
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

                  {/* Comment Input */}
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
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
                        className="flex-1 rounded-full border-border focus:border-primary"
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
                      <button
                        onClick={() => window.location.href = "/sign-in"}
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </button>{" "}
                      to comment.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
