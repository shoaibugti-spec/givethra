import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { getSupportMessages, sendSupportMessage, markSupportMessagesAsRead, uploadFileToStorage } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, ArrowLeft, BookOpen, ExternalLink, ShieldCheck, FileText, Sparkles, Paperclip, X } from "lucide-react";
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
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openArticle, setOpenArticle] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  async function loadMessages() {
    if (!user?.id) return;
    try {
      const data = await getSupportMessages(user.id);
      setMessages(Array.isArray(data) ? data : []);
      await markSupportMessagesAsRead(user.id);
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!text.trim() && !attachmentFile) || !user?.id) return;
    const msgText = text.trim();
    setText("");
    setSending(true);
    try {
      let attachmentUrl = "";
      if (attachmentFile) {
        attachmentUrl = await uploadFileToStorage(attachmentFile, `support/${user.id}/${Date.now()}-${attachmentFile.name}`);
      }
      const res = await sendSupportMessage({
        user_id: user.id,
        sender: "user",
        message: msgText || null,
        attachment_url: attachmentUrl || null,
        filename: attachmentFile?.name || null,
      });
      if (res && (res.id || res.success !== false || res.message)) {
        setAttachmentFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await loadMessages();
      } else {
        toast.error(res?.error || "Failed to send message.");
      }
    } catch (e) {
      toast.error("Failed to send. Please try again.");
      console.error(e);
    } finally {
      setSending(false);
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
                      <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                      {(m.attachment_url || m.attachmentUrl) && (
                        <a
                          href={m.attachment_url || m.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs underline font-medium opacity-90 hover:opacity-100"
                        >
                          <FileText className="h-3 w-3" /> {m.filename || "View attachment"}
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

          <form onSubmit={handleSend} className="p-3 border-t bg-background space-y-2">
            {attachmentFile && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <Paperclip className="h-3.5 w-3.5" /> <span className="truncate flex-1">{attachmentFile.name}</span>
                <button type="button" onClick={() => { setAttachmentFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} aria-label="Remove attachment"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)} />
              <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Attach file" className="h-10 w-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-primary">
                <Paperclip className="h-4 w-4" />
              </button>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                className="flex-1 resize-y min-h-10 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
              type="submit"
              disabled={sending || (!text.trim() && !attachmentFile)}
              className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
