import { e as useAuth, u as useNavigate, r as reactExports, aR as getSupportMessages, aS as markSupportMessagesAsRead, l as jsxRuntimeExports, aT as sendSupportMessage, p as ue } from "./main-CgSpP0b-.js";
import { L as Layout } from "./Layout-BC0sq9z2.js";
import { A as ArrowLeft } from "./arrow-left-Csi-MKWE.js";
import { M as MessageCircle } from "./message-circle-mF9hUHZC.js";
import { B as BookOpen } from "./book-open-D5BOJED9.js";
import { E as ExternalLink } from "./external-link-xTFxx5Il.js";
import { F as FileText } from "./file-text-BnHG-vw6.js";
import { S as Send } from "./send-CITJ-3Mc.js";
import "./button-DvVM0rMM.js";
import "./users-Bfb9kgVK.js";
import "./x-bFsLRLYJ.js";
import "./heart-BsvgHhcI.js";
const FAQ_ARTICLES = [
  {
    id: "submit",
    title: "How to submit your case",
    body: "1. First complete your KYC (must be approved).\n2. Open 'Submit Request'.\n3. Fill each step: Basic Info, Case Details, Payment Details, Documents, Verification, Review.\n4. In Payment Details, enter the INSTITUTE's details (school, hospital, electricity company) — NOT your personal account. Heroes pay the institute directly.\n5. Upload clear documents (bill, challan, report).\n6. Take a selfie and record a video appeal of up to 90 seconds.\n7. A 1-credit listing fee is charged on submit.\n8. After our team approves, your case goes live for Heroes."
  },
  {
    id: "currency",
    title: "How to change currency",
    body: "1. Open Settings from the menu.\n2. Find the 'Currency' option.\n3. Select your currency (PKR, USD, etc.).\n4. Save.\n\nNow your case amounts will show in your selected currency. Note: platform credits are always in USD (1 credit = $1)."
  },
  {
    id: "hero",
    title: "How to become a Hero (help someone)",
    body: "1. Open 'Browse Cases'.\n2. Choose a verified case you want to help.\n3. Enter how much you want to help with (full or partial).\n4. Unlock the case (a small credit fee based on your share).\n5. You'll see the institute's payment details.\n6. Pay the institute DIRECTLY from your own bank/account.\n7. Submit your proof (receipt + transaction ID).\n8. When the seeker confirms, you get an affidavit as proof of your help."
  },
  {
    id: "credits",
    title: "How credits & wallet work",
    body: "Credits keep the platform genuine.\n- 1 credit = $1 USD.\n- Submitting a case: 1 credit fee.\n- Unlocking a case as a Hero: based on how much you pledge (full case = 1 credit).\n- Buy credits in the Wallet using NayaPay or USDT (TRC-20).\n- After you deposit, our team confirms and adds your credits.\n\nNote: the listing fee is NOT the help money — it only keeps fake cases away."
  }
];
function SupportChatPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = reactExports.useState([]);
  const [text, setText] = reactExports.useState("");
  const [sending, setSending] = reactExports.useState(false);
  const [openArticle, setOpenArticle] = reactExports.useState(null);
  const bottomRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadMessages();
    const interval = setInterval(loadMessages, 1e4);
    return () => clearInterval(interval);
  }, [isAuthenticated, user == null ? void 0 : user.id]);
  reactExports.useEffect(() => {
    var _a;
    (_a = bottomRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  async function loadMessages() {
    if (!(user == null ? void 0 : user.id)) return;
    try {
      const data = await getSupportMessages(user.id);
      setMessages(Array.isArray(data) ? data : []);
      await markSupportMessagesAsRead(user.id);
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  }
  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !(user == null ? void 0 : user.id)) return;
    const msgText = text.trim();
    setText("");
    setSending(true);
    try {
      const res = await sendSupportMessage({
        user_id: user.id,
        sender: "user",
        message: msgText
      });
      if (res && (res.id || res.success !== false || res.message)) {
        await loadMessages();
      } else {
        ue.error((res == null ? void 0 : res.error) || "Failed to send message.");
      }
    } catch (e2) {
      ue.error("Failed to send. Please try again.");
      console.error(e2);
    } finally {
      setSending(false);
    }
  }
  if (openArticle) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setOpenArticle(null),
          className: "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            " Back"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg", children: openArticle.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-line leading-relaxed", children: openArticle.body })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "Still need help? Go back and send us a message." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between border-b pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold", children: "Help & Support" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Read quick guides or chat directly with our support team" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: FAQ_ARTICLES.map((art) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: () => setOpenArticle(art),
        className: "rounded-xl border bg-card p-4 hover:border-primary transition-all cursor-pointer flex items-center justify-between group shadow-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: art.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" })
        ]
      },
      art.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card flex flex-col h-[500px] shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b bg-muted/30 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Support Conversation" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "We usually reply within a few hours" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: [
        messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-10 w-10 text-muted-foreground/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "No messages yet. Ask us anything!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs max-w-xs", children: "Whether you need help with KYC, your case submission, or wallet credits, our team is here for you." })
        ] }) : messages.map((m) => {
          const isUser = m.sender === "user";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `flex flex-col ${isUser ? "items-end" : "items-start"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap leading-relaxed", children: m.message }),
                      (m.attachment_url || m.attachmentUrl) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "a",
                        {
                          href: m.attachment_url || m.attachmentUrl,
                          target: "_blank",
                          rel: "noreferrer",
                          className: "mt-2 inline-flex items-center gap-1.5 text-xs underline font-medium opacity-90 hover:opacity-100",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3" }),
                            " ",
                            m.filename || "View attachment"
                          ]
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground mt-1 px-1", children: (() => {
                  const raw = m.created_at || m.createdAt;
                  if (!raw) return "";
                  const d = new Date(typeof raw === "number" ? raw : String(raw));
                  return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                })() })
              ]
            },
            m.id
          );
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: bottomRef })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSend, className: "p-3 border-t bg-background flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: text,
            onChange: (e) => setText(e.target.value),
            placeholder: "Type your message...",
            className: "flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "submit",
            disabled: sending || !text.trim(),
            className: "h-10 px-5 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-opacity",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Send" })
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
export {
  SupportChatPage as default
};
