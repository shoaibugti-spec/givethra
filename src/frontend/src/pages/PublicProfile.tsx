// src/frontend/src/pages/PublicProfile.tsx
import Layout from "@/components/Layout";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { User, FileText, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicProfile() {
  const { userId } = useParams({ from: "/profile/$userId" });
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/public-profile/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">User not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate({ to: "/" })}>
            Go Home
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-8">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="rounded-2xl border bg-card p-6 shadow-sm text-center">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-primary text-3xl font-bold">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              profile.display_name?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>

          <h2 className="text-xl font-bold mt-4">{profile.display_name || "User"}</h2>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-border">
            <div className="bg-muted/30 rounded-xl p-4">
              <FileText className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{profile.total_cases || 0}</p>
              <p className="text-xs text-muted-foreground">Cases Submitted</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4">
              <Heart className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{profile.total_helps || 0}</p>
              <p className="text-xs text-muted-foreground">Helps Given</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
