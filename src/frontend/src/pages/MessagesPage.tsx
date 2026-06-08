import type { ConversationPublic, UserPublic } from "@/backend";

import Layout from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useBackendActor } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, MessageCircle, User } from "lucide-react";

function useConversations() {
  const actor = getBackendActor();
  return useQuery<ConversationPublic[]>({
    queryKey: ["my-conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyConversations();
    },
    enabled: !!actor,
  });
}

// unused hook intentionally removed – kept imports for type use only
import type { UserPublic as _UserPublic } from "@/backend";
import { getBackendActor } from "@/lib/actor";

function formatTimestamp(ts?: bigint): string {
  if (!ts) return "";
  try {
    const ms = Number(ts) / 1_000_000;
    return formatDistanceToNow(new Date(ms), { addSuffix: true });
  } catch {
    return "";
  }
}

function ConversationItem({
  conversation,
  index,
}: {
  conversation: ConversationPublic;
  index: number;
}) {
  const navigate = useNavigate();
  const unread = Number(conversation.unreadCount);

  return (
    <button
      type="button"
      data-ocid={`messages.conversation.item.${index + 1}`}
      onClick={() =>
        navigate({
          to: "/conversations/$id",
          params: { id: String(conversation.id) },
        })
      }
      className="w-full flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-muted/40 active:bg-muted/60 transition-colors duration-150 border-b border-border last:border-b-0 text-left"
    >
      {/* Avatar */}
      <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <User className="h-5 w-5 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm font-semibold truncate text-foreground",
              unread > 0 && "text-foreground",
            )}
          >
            Case #{String(conversation.caseId ?? conversation.id)}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatTimestamp(conversation.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              "text-sm truncate",
              unread > 0
                ? "text-foreground font-medium"
                : "text-muted-foreground",
            )}
          >
            {conversation.lastMessageContent ?? "No messages yet"}
          </p>
          {unread > 0 && (
            <Badge
              data-ocid={`messages.unread_badge.${index + 1}`}
              className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0"
            >
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

export default function MessagesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: conversations = [], isLoading } = useConversations();

  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }

  // Sort by most recent
  const sorted = [...conversations].sort((a, b) => {
    const aTime = a.lastMessageAt ? Number(a.lastMessageAt) : 0;
    const bTime = b.lastMessageAt ? Number(b.lastMessageAt) : 0;
    return bTime - aTime;
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pb-20" data-ocid="messages.page">
        {/* Page header */}
        <div className="sticky top-14 md:top-[104px] z-10 bg-background border-b border-border px-4 py-3">
          <h1 className="font-display text-lg font-bold text-foreground">
            Messages
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sorted.length > 0
              ? `${sorted.length} conversation${sorted.length !== 1 ? "s" : ""}`
              : "Your conversations will appear here"}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div
            className="flex justify-center py-16"
            data-ocid="messages.loading_state"
          >
            <LoadingSpinner label="Loading conversations..." />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && sorted.length === 0 && (
          <div
            data-ocid="messages.empty_state"
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
          >
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">
              No conversations yet
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              When you unlock a case or a Hero contacts you, your conversations
              will appear here.
            </p>
          </div>
        )}

        {/* Conversation list */}
        {!isLoading && sorted.length > 0 && (
          <div
            data-ocid="messages.conversation.list"
            className="divide-y divide-border"
          >
            {sorted.map((conv, i) => (
              <ConversationItem
                key={String(conv.id)}
                conversation={conv}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
