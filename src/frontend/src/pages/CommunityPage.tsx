import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, User } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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

  // ✅ ٹوکن حاصل کرنے کا فنکشن
  const getToken = () => localStorage.getItem("auth_token") || "";

  // --- پوسٹس لوڈ کریں ---
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      // اگر ٹوکن ہے تو بھیجیں، ورنہ مہمان کی حیثیت سے
      if (isAuthenticated && token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch("/api/community-posts", { headers });
      if (res.ok) {
        const data = await res.json();
        setPosts(data || []);
        // ہر پوسٹ کے لیے لائکس اور کمنٹس لوڈ کریں
        data?.forEach((post: Post) => {
          fetchLikes(post.id);
          fetchComments(post.id);
        });
      } else {
        console.error("Failed to fetch posts:", res.status);
        toast.error("Could not load posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Network error while loading posts");
    } finally {
      setLoading(false);
    }
  };

  // --- لائکس لوڈ کریں ---
  const fetchLikes = async (postId: string) => {
    try {
      const token = getToken();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (isAuthenticated && token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`/api/post-likes/${postId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLikeCounts((prev) => ({ ...prev, [postId]: data.length || 0 }));
        if (isAuthenticated && user?.id) {
          const userLiked = data.some((like: any) => like.user_id === user.id);
          setLikedPosts((prev) => ({ ...prev, [postId]: userLiked }));
        }
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  // --- کمنٹس لوڈ کریں ---
  const fetchComments = async (postId: string) => {
    try {
      const token = getToken();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (isAuthenticated && token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`/api/post-comments/${postId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, comments: data || [] } : post
          )
        );
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // --- لائک ٹوگل کریں ---
  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like posts");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("You are not logged in. Please sign in again.");
      return;
    }

    try {
      const res = await fetch(`/api/post-likes/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post_id: postId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.liked) {
          setLikedPosts((prev) => ({ ...prev, [postId]: true }));
          setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
          // اگر پوسٹ کا مالک خود نہیں ہے تو نوٹیفکیشن بھیجیں (بیک اینڈ کو)
          const postOwner = posts.find(p => p.id === postId)?.user_id;
          if (postOwner && postOwner !== user?.id) {
            await fetch("/api/notifications", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                user_id: postOwner,
                type: "like",
                title: "New Like",
                message: `${user?.fullName || "Someone"} liked your post.`,
                link: `/community`,
              }),
            });
          }
          toast.success("Liked!");
        } else {
          setLikedPosts((prev) => ({ ...prev, [postId]: false }));
          setLikeCounts((prev) => ({ ...prev, [postId]: Math.max((prev[postId] || 0) - 1, 0) }));
          toast.info("Unliked");
        }
      } else if (res.status === 401) {
        toast.error("Your session expired. Please sign in again.");
      } else {
        const error = await res.json();
        toast.error(error?.error || "Failed to like post");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Network error. Please check your connection.");
    }
  };

  // --- کمنٹ کریں ---
  const handleComment = async (postId: string) => {
    const comment = newComment[postId]?.trim();
    if (!comment) {
      toast.error("Please write a comment");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("You are not logged in. Please sign in again.");
      return;
    }

    try {
      const res = await fetch(`/api/post-comments/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post_id: postId, comment }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, comments: [...(post.comments || []), data] }
              : post
          )
        );
        setNewComment((prev) => ({ ...prev, [postId]: "" }));
        // پوسٹ کے مالک کو نوٹیفکیشن
        const postOwner = posts.find(p => p.id === postId)?.user_id;
        if (postOwner && postOwner !== user?.id) {
          await fetch("/api/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_id: postOwner,
              type: "comment",
              title: "New Comment",
              message: `${user?.fullName || "Someone"} commented on your post: "${comment.slice(0, 50)}..."`,
              link: `/community`,
            }),
          });
        }
        toast.success("Comment added!");
        // نئے کمنٹ پر اسکرول
        setTimeout(() => {
          const commentEl = document.getElementById(`comment-${data.id}`);
          if (commentEl) commentEl.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const error = await res.json();
        toast.error(error?.error || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Network error. Please try again.");
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading community posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Community Posts</h1>
        <span className="text-sm text-muted-foreground">{posts.length} posts</span>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="border rounded-lg p-5 bg-card space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{post.display_name || "User"}</span>
                  {post.is_guest ? (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Guest</span>
                  ) : (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Verified</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            <p className="text-foreground whitespace-pre-wrap break-words">{post.message}</p>

            <div className="flex items-center gap-4 pt-2 border-t">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  likedPosts[post.id] ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                }`}
                disabled={!isAuthenticated}
              >
                <Heart className={`h-5 w-5 ${likedPosts[post.id] ? "fill-red-500" : ""}`} />
                <span>{likeCounts[post.id] || 0}</span>
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments?.length || 0}</span>
              </button>
            </div>

            {showComments[post.id] && (
              <div className="space-y-3 pt-2 border-t">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} id={`comment-${comment.id}`} className="flex gap-2">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.user_name || "User"}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">No comments yet</p>
                )}

                {isAuthenticated && (
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment[post.id] || ""}
                      onChange={(e) =>
                        setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleComment(post.id);
                      }}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleComment(post.id)}
                      disabled={!newComment[post.id]?.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
