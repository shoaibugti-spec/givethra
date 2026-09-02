// src/frontend/src/pages/NotificationsPage.tsx
// Replaces Supabase with Cloudflare Worker APIs

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BellOff,
  CheckCheck,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Heart,
  MessageCircle,
  Repeat,
  UserPlus,
  FileText,
  Trash2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  markAllNotificationsAsRead,
  deleteAllNotifications,
} from "@/lib/api";

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  welcome: { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  kyc_approved: { icon: ShieldCheck, color: "text-teal-500", bg: "bg-teal-500/10" },
  kyc_rejected: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  kyc_pending: { icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
  case_approved: { icon: CheckCheck, color: "text-teal-500", bg: "bg-teal-500/10" },
  case_rejected: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  case_completed: { icon: CheckCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
  credits_added: { icon: CreditCard, color: "text-teal-500", bg: "bg-teal-500/10" },
  deposit_rejected: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  support_reply: { icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
  admin_broadcast: { icon: Bell, color: "text-primary", bg: "bg-primary/10" },
  message: { icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
  system: { icon: Bell, color: "text-primary", bg: "bg-primary/10" },
  like: { icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
  comment: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  new_follower: { icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
  follow: { icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
  repost: { icon: Repeat, color: "text-violet-500", bg: "bg-violet-500/10" },
  support: { icon: Repeat, color: "text-violet-500", bg: "bg-violet-500/10" },
  new_support: { icon: Repeat, color: "text-violet-500", bg: "bg-violet-500/10" },
  credit_earned: { icon: CreditCard, color: "text-amber-500", bg: "bg-amber-500/10" },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getNotifications(user.id);
      setNotifs(data ?? []);
      // Mark all as read because user opened the page
      await markAllNotificationsAsRead(user.id);
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user, loadNotifications, navigate]);

  async function markAllRead() {
    if (!user?.id) return;
    await markAllNotificationsAsRead(user.id);
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function clearAll() {
    if (!user?.id) return;
    await deleteAllNotifications(user.id);
    setNotifs([]);
  }

  function handleClick(n: any) {
    if (n.link) navigate({ to: n.link });
  }

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          {notifs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="text-xs text-primary"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <BellOff className="h-9 w-9 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                We'll let you know when something important happens.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map((n) => {
              const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
              const Icon = cfg.icon;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`w-full text-left flex gap-3 p-4 rounded-xl border transition-colors hover:bg-muted/30 ${
                    !n.is_read
                      ? "bg-primary/5 border-primary/20"
                      : "bg-card border-border"
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full shrink-0 flex items-center justify-center ${cfg.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-sm truncate">
                          {n.title}
                        </span>
                        {!n.is_read && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {relativeTime(n.created_at)}
                      </span>
                    </div>
                    {n.message && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-600 transition-colors pt-3"
            >
              <Trash2 className="h-4 w-4" /> Clear all notifications
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
