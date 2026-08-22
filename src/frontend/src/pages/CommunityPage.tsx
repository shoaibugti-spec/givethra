import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  user_id: string | null;
  display_name: string;
  message: string;
  is_guest: boolean;
  created_at: string;
  likes?: Like[];
  comments?: Comment[];
}

interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
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
  const commentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const token = localStorage.getItem("token") || "";

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (isAuthenticated && token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch("/api/community-posts", { headers });
      if (res.ok) {
        const data = await res.json();
        setPosts(data || []);
        // Fetch likes for each post
        data?.forEach((post: Post) => {
          fetchLikes(post.id);
          fetchComments(post.id);
        });
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async (postId: string) => {
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (isAuthenticated && token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(`/api/post-likes/${postId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLikeCounts((prev) => ({ ...prev, [postId]: data.length || 0 }));
        if (isAuthenticated && user?.id) {
          const userLiked = data.some((like: Like) => like.user_id === user.id);
          setLikedPosts((prev) => ({ ...prev, [postId]: userLiked }));
        }
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
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

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like posts");
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
          toast.success("Post liked!");
        } else {
          setLikedPosts((prev) => ({ ...prev, [postId]: false }));
          setLikeCounts((prev) => ({ ...prev, [postId]: Math.max((prev[postId] || 0) - 1, 0) }));
          toast.info("Post unliked");
        }
      } else {
        const error = await res.json();
        toast.error(error?.error || "Failed to like post");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Network error. Please try again.");
    }
  };

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
        toast.success("Comment added!");
        // Scroll to the new comment
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

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

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
                      ref={(el) => (commentInputRefs.current[post.id] = el)}
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
