import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  getChatMessages,
  sendChatMessage,
  getUnreadChatMessagesCount,
  markSupportMessagesAsRead,
  uploadFileToStorage,
} from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageCircle,
  ArrowLeft,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  FileText,
  Sparkles,
  Paperclip,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const FAQ_ARTICLES = [
  {
    id: "submit",
    title: "How to submit your case",
    body: "1. First complete your KYC (must be approved).\n2. Open 'Submit Request'.\n3. Fill each step: Basic Info, Case Details, Payment Details, Documents, Verification, Review.\n4. In Payment Details, enter the INSTITUTE's details (school, hospital, electricity company) — NOT your personal account. Heroes pay the institute directly.\n5. Upload clear documents (bill, challan, report).\n6. Take a selfie and record a 60-second video appeal.\n7. A 1-credit listing fee is charged on submit.\n8. After our team approves, your case goes live for Heroes.",
  },
  {
    id: "currency",
    title: "How to change currency",
    body: "1. Open Settings from the menu.\n2. Find the 'Currency' option.\n3. Select your currency (PKR, USD, etc.).\n4. Save.\n\nNow your case amounts will show in your selected currency. Note: platform credits are always in USD (1 credit = $1).",
  },
  {
    id: "hero",
    title: "How to become a Hero (help someone)",
    body: "1. Open 'Browse Cases'.\n2. Choose a verified case you want to help.\n3. Enter how much you want to help with (full or partial).\n4. Unlock the case (a small credit fee based on your share).\n5. You'll see the institute's payment details.\n6. Pay the institute DIRECTLY from your own bank/account.\n7. Submit your proof (receipt + transaction ID).\n8. When the seeker confirms, you get an affidavit as proof of your help.",
  },
  {
    id: "credits",
    title: "How credits & wallet work",
    body: "Credits keep the platform genuine.\n- 1 credit = $1 USD.\n- Submitting a case: 1 credit fee.\n- Unlocking a case as a Hero: based on how much you pledge (full case = 1 credit).\n- Buy credits in the Wallet using NayaPay or USDT (TRC-20).\n- After you deposit, our team confirms and adds your credits.\n\nNote: the listing fee is NOT the help money — it only keeps fake cases away.",
  },
];

export default function SupportChatPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [openArticle, setOpenArticle] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Attachment state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [text]);

  async function loadMessages() {
    if (!user?.id) return;
    try {
      const data = await getChatMessages(user.id);
      setMessages(Array.isArray(data) ? data : []);
      await markSupportMessagesAsRead(user.id);
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  }

  // File selection handler
  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large! Maximum 10MB allowed.");
      return;
    }
    setAttachmentFile(file);
    setAttachmentPreview(URL.createObjectURL(file));
    toast.success(`📎 ${file.name} selected`);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment() {
    setAttachmentFile(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!text.trim() && !attachmentFile) || !user?.id) return;

    setSending(true);
    let attachmentUrl = "";
    let filename = "";

    // Upload attachment if present
    if (attachmentFile) {
      setUploadingAttachment(true);
      try {
        // Sanitize filename for path
        const safeName = attachmentFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `support_attachments/${user.id}/${Date.now()}_${safeName}`;
        attachmentUrl = await uploadFileToStorage(attachmentFile, path);
        filename = attachmentFile.name;
        setUploadingAttachment(false);
      } catch (err) {
        toast.error("Failed to upload attachment. Please try again.");
        setSending(false);
        setUploadingAttachment(false);
        return;
      }
    }

    try {
      const payload: any = {
        user_id: user.id,
        sender: "user",
        message: text.trim() || null, // message can be null if only attachment
      };
      if (attachmentUrl) {
        payload.attachment_url = attachmentUrl;
        // Optionally send filename for display
        payload.filename = filename;
      }

      const res = await sendChatMessage(payload);

      // Check if response indicates success
      if (res && (res.id || res.success !== false)) {
        setText("");
        removeAttachment(); // Clear attachment after send
        await loadMessages();
        toast.success("Message sent!");
      } else {
        toast.error(res?.error || "Failed to send message. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send. Please try again.");
      console.error(err);
    } finally {
      setSending(false);
      setUploadingAttachment(false);
    }
  }

  if (openArticle) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <button
            onClick={() => setOpenArticle(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="rounded-2xl border bg-card p-6 space-y-3">
            <h2 className="font-bold text-lg">{openArticle.title}</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {openArticle.body}
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Still need help? Go back and send us a message.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Help & Support</h1>
              <p className="text-xs text-muted-foreground">
                Read quick guides or chat directly with our support team
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Quick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FAQ_ARTICLES.map((art) => (
            <div
              key={art.id}
              onClick={() => setOpenArticle(art)}
              className="rounded-xl border bg-card p-4 hover:border-primary transition-all cursor-pointer flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">{art.title}</span>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>

        {/* Chat Section */}
        <div className="rounded-2xl border bg-card flex flex-col h-[500px] shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Support Conversation
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              We usually reply within a few hours
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-2">
                <MessageCircle className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-medium">No messages yet. Ask us anything!</p>
                <p className="text-xs max-w-xs">
                  Whether you need help with KYC, your case submission, or wallet credits, our team is here for you.
                </p>
              </div>
            ) : (
              messages.map((m: any) => {
                const isUser = m.sender === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      }`}
                    >
                      {m.message && (
                        <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                      )}
                      {(m.attachment_url || m.attachmentUrl) && (
                        <a
                          href={m.attachment_url || m.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs underline font-medium opacity-90 hover:opacity-100"
                        >
                          <FileText className="h-3 w-3" />{" "}
                          {m.filename || m.filename || "View attachment"}
                        </a>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {(() => {
                        const raw = m.created_at || m.createdAt;
                        if (!raw) return "";
                        const d = new Date(typeof raw === "number" ? raw : String(raw));
                        return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                      })()}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area with Attachment */}
          <form onSubmit={handleSend} className="p-3 border-t bg-background">
            {/* Attachment preview */}
            {attachmentPreview && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-muted/50 rounded-lg border border-border">
                {attachmentFile?.type.startsWith("image/") ? (
                  <img
                    src={attachmentPreview}
                    alt="Attachment preview"
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <FileText className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="text-xs flex-1 truncate">{attachmentFile?.name}</span>
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="text-red-500 hover:text-red-700"
                  disabled={sending}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="w-full min-h-[44px] max-h-[200px] resize-none overflow-y-auto rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={1}
                  disabled={sending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
              </div>

              {/* Attachment button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx,.zip"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || uploadingAttachment}
                className="h-11 w-11 shrink-0 rounded-xl border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors disabled:opacity-50"
                title="Attach a file (max 10MB)"
              >
                {uploadingAttachment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </button>

              <button
                type="submit"
                disabled={sending || (!text.trim() && !attachmentFile)}
                className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{sending ? "Sending" : "Send"}</span>
              </button>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 px-1">
              <span>Supported: Images, PDF, DOC, DOCX, TXT, CSV, XLSX, PPTX, ZIP (max 10MB)</span>
              {attachmentFile && !uploadingAttachment && (
                <span className="text-green-600">📎 {attachmentFile.name}</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
