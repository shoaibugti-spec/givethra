import { createActor } from "@/backend";
import type { NotificationPublic } from "@/backend";
import { NotificationType } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCheck,
  CreditCard,
  Heart,
  MessageCircle,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useNotifications() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<NotificationPublic[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

function useMarkAsRead() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notifId: bigint) => {
      if (!actor) return;
      await actor.markNotificationAsRead(notifId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

function useDismissNotification() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notifId: bigint) => {
      if (!actor) return;
      await actor.dismissNotification(notifId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NOTIF_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; label: string; bgColor: string }
> = {
  [NotificationType.VerificationUpdate]: {
    icon: ShieldCheck,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Verification",
  },
  [NotificationType.CaseApproved]: {
    icon: CheckCheck,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Case Approved",
  },
  [NotificationType.CaseRejected]: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Case Rejected",
  },
  [NotificationType.NewMessage]: {
    icon: MessageCircle,
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "Message",
  },
  [NotificationType.ProudHeartReceived]: {
    icon: Heart,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    label: "Proud ❤️",
  },
  [NotificationType.UnlockPurchased]: {
    icon: CreditCard,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Unlock",
  },
  [NotificationType.SupportSubmitted]: {
    icon: ShieldCheck,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    label: "Support",
  },
};

function formatRelativeTime(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotifSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      data-ocid="notifications.empty_state"
      className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
        <BellOff className="w-9 h-9 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold text-foreground font-display">
          No notifications yet
        </p>
        <p className="text-sm text-muted-foreground">
          We'll let you know when something important happens.
        </p>
      </div>
    </div>
  );
}

interface NotifItemProps {
  notif: NotificationPublic;
  onRead: (id: bigint) => void;
  onDismiss: (id: bigint) => void;
  isReadPending: boolean;
  isDismissPending: boolean;
}

function NotifItem({
  notif,
  onRead,
  onDismiss,
  isReadPending,
  isDismissPending,
}: NotifItemProps) {
  const navigate = useNavigate();
  const cfg = NOTIF_CONFIG[notif.notifType] ?? {
    icon: Bell,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Update",
  };
  const Icon = cfg.icon;

  function handleTap() {
    if (!notif.isRead) onRead(notif.id);
    // Navigate to relevant context
    if (
      notif.relatedCaseId !== undefined &&
      (notif.notifType === NotificationType.CaseApproved ||
        notif.notifType === NotificationType.CaseRejected ||
        notif.notifType === NotificationType.VerificationUpdate ||
        notif.notifType === NotificationType.UnlockPurchased ||
        notif.notifType === NotificationType.SupportSubmitted)
    ) {
      navigate({ to: `/cases/${notif.relatedCaseId}` });
    } else if (notif.notifType === NotificationType.NewMessage) {
      navigate({ to: "/messages" });
    } else if (
      notif.notifType === NotificationType.ProudHeartReceived &&
      notif.relatedUserId
    ) {
      navigate({ to: `/profile/${notif.relatedUserId}` });
    }
  }

  return (
    <button
      type="button"
      data-ocid={`notifications.item.${String(notif.id)}`}
      className={`w-full text-left flex gap-3 px-4 py-3.5 transition-colors active:bg-muted/60 border-b border-border/50 last:border-b-0 ${
        !notif.isRead ? "bg-primary/5" : "bg-transparent"
      }`}
      onClick={handleTap}
    >
      {/* Icon bubble */}
      <div
        className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${cfg.bgColor}`}
      >
        <Icon className={`w-5 h-5 ${cfg.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-semibold text-foreground font-display truncate">
              {notif.title}
            </span>
            {!notif.isRead && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
            {formatRelativeTime(notif.createdAt)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
          {notif.message}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant="secondary"
            className="text-xs px-1.5 py-0 h-5 font-normal"
          >
            {cfg.label}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 shrink-0">
        {!notif.isRead && (
          <button
            type="button"
            data-ocid={`notifications.read_button.${String(notif.id)}`}
            disabled={isReadPending}
            aria-label="Mark as read"
            className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onRead(notif.id);
            }}
          >
            <CheckCheck className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          data-ocid={`notifications.dismiss_button.${String(notif.id)}`}
          disabled={isDismissPending}
          aria-label="Dismiss notification"
          className="w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notif.id);
          }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkAsRead();
  const dismiss = useDismissNotification();
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const [selectedTab, setSelectedTab] = useState("all");

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  async function handleMarkAllRead() {
    if (!notifications || !actor) return;
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => actor.markNotificationAsRead(n.id)));
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground font-display">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge className="h-5 text-xs px-1.5">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              data-ocid="notifications.mark_all_read_button"
              onClick={handleMarkAllRead}
              className="text-xs text-primary"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide">
          {[
            { label: "All", value: "all" },
            { label: "Unread", value: "unread" },
            { label: "Cases", value: "cases" },
            { label: "Messages", value: "messages" },
            { label: "Payments", value: "payments" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              data-ocid={`notifications.${tab.value}.tab`}
              onClick={() => setSelectedTab(tab.value)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <main className="flex-1">
        {isLoading ? (
          <div
            data-ocid="notifications.loading_state"
            className="divide-y divide-border/50"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
              <NotifSkeleton key={i} />
            ))}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-border/50">
            {[...notifications]
              .sort((a, b) => Number(b.createdAt - a.createdAt))
              .map((notif) => (
                <NotifItem
                  key={String(notif.id)}
                  notif={notif}
                  onRead={(id) => markRead.mutate(id)}
                  onDismiss={(id) => dismiss.mutate(id)}
                  isReadPending={markRead.isPending}
                  isDismissPending={dismiss.isPending}
                />
              ))}
          </div>
        )}
      </main>

      {/* Bottom clear all when items exist */}
      {notifications && notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-card">
          <button
            type="button"
            data-ocid="notifications.clear_all_button"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => {
              for (const n of notifications) dismiss.mutate(n.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
}
