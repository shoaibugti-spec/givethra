import type { MessagePublic, UserPublic } from "@/backend";

import Layout from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBackendActor } from "@/hooks/useBackend";
import { getBackendActor } from "@/lib/actor";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ArrowLeft, MessageCircle, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function useConversationMessages(conversationId: bigint) {
  const actor = getBackendActor();
  return useQuery<MessagePublic[]>({
    queryKey: ["conversation-messages", String(conversationId)],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversationMessages(conversationId);
    },
    enabled: !!actor,
    refetchInterval: 10_000,
  });
}

function formatMessageTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return `Yesterday ${format(date, "HH:mm")}`;
  return format(date, "MMM d, HH:mm");
}

function MessageBubble({
  message,
  isMine,
}: {
  message: MessagePublic;
  isMine: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-end gap-2 mb-1",
        isMine ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!isMine && (
        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mb-1">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words",
          isMine
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        <p>{message.content}</p>
        <p
          className={cn(
            "text-[10px] mt-1 text-right",
            isMine ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {formatMessageTime(message.createdAt)}
          {isMine && (
            <span className="ml-1">{message.isRead ? " ✓✓" : " ✓"}</span>
          )}
        </p>
      </div>
    </div>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4 px-2">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[11px] text-muted-foreground font-medium px-2">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function ConversationPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id: string };
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const conversationId = BigInt(id ?? "0");

  const { data: messages = [], isLoading } =
    useConversationMessages(conversationId);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Not connected");
      // Determine receiver from the conversation's messages
      const firstOther = messages.find(
        (m) => String(m.senderId) !== String(messages[0]?.receiverId),
      );
      const receiverId = firstOther?.senderId ?? messages[0]?.senderId;
      if (!receiverId) throw new Error("Cannot determine receiver");
      return actor.sendMessage(receiverId, null, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", String(conversationId)],
      });
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
      setNewMessage("");
    },
    onError: () => {
      toast.error("Failed to send message. Please try again.");
    },
  });

  // Auto-scroll to latest message
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const content = newMessage.trim();
    if (!content || sendMutation.isPending) return;
    sendMutation.mutate(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }

  // Group messages by date
  const groupedMessages: { label: string; messages: MessagePublic[] }[] = [];
  let currentLabel = "";
  for (const msg of messages) {
    const ms = Number(msg.createdAt) / 1_000_000;
    const date = new Date(ms);
    let label: string;
    if (isToday(date)) label = "Today";
    else if (isYesterday(date)) label = "Yesterday";
    else label = format(date, "MMMM d, yyyy");

    if (label !== currentLabel) {
      groupedMessages.push({ label, messages: [msg] });
      currentLabel = label;
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  }

  // Current user identification heuristic: mine = messages I sent
  // We use senderId vs receiverId of the first message to identify self
  const myId =
    messages.length > 0
      ? (messages.find((m) => m.isRead === false || m.receiverId !== m.senderId)
          ?.receiverId ?? null)
      : null;

  const isMine = (msg: MessagePublic) =>
    myId ? String(msg.senderId) !== String(myId) : false;

  const caseRef = messages[0]?.caseId;

  return (
    <Layout>
      <div
        data-ocid="conversation.page"
        className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-6.5rem)] max-w-2xl mx-auto"
      >
        {/* Conversation header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border shrink-0">
          <button
            type="button"
            onClick={() => navigate({ to: "/messages" })}
            data-ocid="conversation.back_button"
            aria-label="Back to messages"
            className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth -ml-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-4.5 w-4.5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {caseRef ? `Case #${String(caseRef)}` : `Conversation #${id}`}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Messages area */}
        <div
          data-ocid="conversation.messages_list"
          className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5 bg-background"
        >
          {isLoading && (
            <div
              className="flex justify-center py-12"
              data-ocid="conversation.loading_state"
            >
              <LoadingSpinner label="Loading messages..." />
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div
              data-ocid="conversation.empty_state"
              className="flex flex-col items-center justify-center h-full py-16 text-center"
            >
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                No messages yet
              </p>
              <p className="text-xs text-muted-foreground">
                Start the conversation below.
              </p>
            </div>
          )}

          {!isLoading &&
            groupedMessages.map(({ label, messages: group }) => (
              <div key={label}>
                <DateDivider label={label} />
                {group.map((msg) => (
                  <MessageBubble
                    key={String(msg.id)}
                    message={msg}
                    isMine={isMine(msg)}
                  />
                ))}
              </div>
            ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          data-ocid="conversation.input_area"
          className="flex items-end gap-2 px-4 py-3 bg-card border-t border-border shrink-0 pb-[max(12px,env(safe-area-inset-bottom))]"
        >
          <textarea
            ref={inputRef}
            data-ocid="conversation.message_input"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={sendMutation.isPending}
            className="flex-1 resize-none rounded-2xl px-4 py-2.5 text-sm bg-muted/60 border border-input focus:border-primary focus:bg-background outline-none transition-colors placeholder:text-muted-foreground text-foreground leading-relaxed min-h-[42px] max-h-[120px] overflow-y-auto disabled:opacity-60"
          />
          <Button
            type="button"
            data-ocid="conversation.send_button"
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMutation.isPending}
            size="icon"
            className="h-10 w-10 rounded-full shrink-0"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
