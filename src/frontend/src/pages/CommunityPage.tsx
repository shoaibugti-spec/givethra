// src/frontend/src/pages/CommunityPage.tsx
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Send, User } from "lucide-react";
import { toast } from "sonner";

// Helper to get token from localStorage
function getToken() {
  try {
    return localStorage.getItem("auth_token");
  } catch { return null; }
}

// Authenticated fetch wrapper
async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  return fetch(url, { ...options, headers });
}

export default function CommunityPage() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);
  const [liking, setLiking] = useState<string | null>(null);

  // Fetch all posts with likes and comments
  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await authFetch("/api/community-posts");
      if (res.ok) {
        const data = await res.json();
        // Fetch likes and comments for each post in parallel
        const postsWithMeta = await Promise.all(
          data.map(async (post: any) => {
            const [likesRes, commentsRes] = await Promise.all([
              authFetch(`/api/post-likes/${post.id}`),
              authFetch(`/api/post-comments/${post.id}`),
            ]);
            const likes = likesRes.ok ? await likesRes.json() : [];
            const comments = commentsRes.ok ? await commentsRes.json() : [];
            return {
              ...post,
              likes,
              comments,
              likedByUser: isAuthenticated && likes.some((l: any) => l.user_id === user?.id),
            };
          })
        );
        setPosts(postsWithMeta);
      } else {
        const err = await res.json();
        toast.error(err?.error || "Failed to load posts");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error loading posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]); // Re-fetch when auth changes

  // Like / Unlike
  async function toggleLike(postId: string) {
    if (!isAuthenticated) {
      toast.error("Please login to like posts");
      return;
    }
    setLiking(postId);
    try {
      const res = await authFetch(`/api/post-likes`, {
        method: "POST",
        body: JSON.stringify({ post_id: postId }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state immediately without full refetch
        setPosts(prev =>
          prev.map(p => {
            if (p.id === postId) {
              const liked = data.liked;
              const updatedLikes = liked
                ? [...p.likes, { user_id: user?.id, id: data.id }]
                : p.likes.filter((l: any) => l.user_id !== user?.id);
              return { ...p, likes: updatedLikes, likedByUser: liked };
            }
            return p;
          })
        );
        toast.success(data.liked ? "Liked!" : "Unliked");
      } else {
        const err = await res.json();
        toast.error(err?.error || "Failed to like");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLiking(null);
    }
  }

  // Add comment
  async function addComment(postId: string) {
    const text = commentText[postId]?.trim();
    if (!text) {
      toast.error("Please write a comment");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please login to comment");
      return;
    }
    setSubmittingComment(postId);
    try {
      const res = await authFetch(`/api/post-comments`, {
        method: "POST",
        body: JSON.stringify({ post_id: postId, comment: text }),
      });
      if (res.ok) {
        const newComment = await res.json();
        // Add comment locally immediately
        setPosts(prev =>
          prev.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id: newComment.id,
                    user_id: user?.id,
                    user_name: user?.fullName || "User",
                    comment: text,
                    created_at: new Date().toISOString(),
                  },
                ],
              };
            }
            return p;
          })
        );
        setCommentText(prev => ({ ...prev, [postId]: "" }));
        toast.success("Comment added");
      } else {
        const err = await res.json();
        toast.error(err?.error || "Failed to comment");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSubmittingComment(null);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">
          Loading posts...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Community Posts</h1>
        {posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p>No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                {/* Post header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {post.display_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    {post.user_id ? (
                      <Link
                        to={`/profile/${post.user_id}`}
                        className="font-semibold text-sm hover:underline"
                      >
                        {post.display_name || "User"}
                      </Link>
                    ) : (
                      <span className="font-semibold text-sm">{post.display_name || "Guest"}</span>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Post message */}
                <p className="text-sm whitespace-pre-line mb-3">{post.message}</p>

                {/* Like & Comment counts */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                  <button
                    onClick={() => toggleLike(post.id)}
                    disabled={liking === post.id}
                    className={`flex items-center gap-1 hover:text-primary transition-colors ${
                      post.likedByUser ? "text-primary" : ""
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.likedByUser ? "fill-primary" : ""}`} />
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments?.length || 0}</span>
                  </div>
                </div>

                {/* Comments */}
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    {post.comments.map((c: any) => (
                      <div key={c.id} className="flex items-start gap-2 text-sm">
                        <span className="font-semibold text-xs">{c.user_name || "User"}</span>
                        <span className="text-muted-foreground">{c.comment}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment input */}
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={commentText[post.id] || ""}
                    onChange={(e) =>
                      setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    className="flex-1 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => addComment(post.id)}
                    disabled={submittingComment === post.id || !commentText[post.id]?.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
