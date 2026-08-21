// src/frontend/src/pages/SupportChatPage.tsx
// Replaces Supabase with Cloudflare Worker APIs

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import {
  Send,
  Plus,
  ChevronLeft,
  MessageCircle,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  getSupportMessages,
  sendSupportMessage,
  markSupportMessagesAsRead,
} from "@/lib/api";

const FAQ_ARTICLES = [
  {
    id: "kyc",
    title_en: "How to complete KYC",
    title_ur: "KYC کیسے مکمل کریں",
    body_en:
      "1. Open the KYC page from the menu.\n2. Choose your document type (CNIC or Passport).\n3. Enter your full name, date of birth, and address.\n4. For CNIC: take clear, well-lit photos of the front, back, and a selfie holding your CNIC. Make sure the CNIC number is readable.\n5. Record a 15-second face video.\n6. Submit. Review takes 1-3 days.\n\nTip: If your photo is blurry, your KYC may be rejected. Use good lighting and a clean camera. If rejected, you can simply submit again.",
    body_ur:
      "1. مینو سے KYC صفحہ کھولیں۔\n2. اپنی دستاویز کی قسم چنیں (شناختی کارڈ یا پاسپورٹ)۔\n3. اپنا پورا نام، تاریخِ پیدائش اور پتہ لکھیں۔\n4. شناختی کارڈ کے لیے: کارڈ کے آگے، پیچھے، اور اپنی سیلفی (کارڈ ہاتھ میں پکڑ کر) کی صاف، اچھی روشنی والی تصویریں لیں۔ نمبر صاف نظر آنا چاہیے۔\n5. 15 سیکنڈ کی چہرے کی ویڈیو ریکارڈ کریں۔\n6. جمع کریں۔ جانچ 1-3 دن میں ہوتی ہے۔\n\nٹِپ: اگر تصویر دھندلی ہو تو KYC reject ہو سکتا ہے۔ اچھی روشنی اور صاف کیمرہ استعمال کریں۔ reject ہونے پر دوبارہ جمع کر سکتے ہیں۔",
  },
  {
    id: "submit",
    title_en: "How to submit your case",
    title_ur: "اپنا کیس کیسے جمع کریں",
    body_en:
      "1. First complete your KYC (must be approved).\n2. Open 'Submit Request'.\n3. Fill each step: Basic Info, Case Details, Payment Details, Documents, Verification, Review.\n4. In Payment Details, enter the INSTITUTE's details (school, hospital, electricity company) — NOT your personal account. Heroes pay the institute directly.\n5. Upload clear documents (bill, challan, report).\n6. Take a selfie and record a 60-second video appeal.\n7. A 1-credit listing fee is charged on submit.\n8. After our team approves, your case goes live for Heroes.",
    body_ur:
      "1. پہلے اپنا KYC مکمل کریں (منظور ہونا ضروری)۔\n2. 'Submit Request' کھولیں۔\n3. ہر مرحلہ پُر کریں: بنیادی معلومات، کیس تفصیل، ادائیگی تفصیل، دستاویزات، تصدیق، جائزہ۔\n4. ادائیگی تفصیل میں ادارے کی تفصیل لکھیں (اسکول، اسپتال، بجلی کمپنی) — اپنا ذاتی اکاؤنٹ نہیں۔ ہیروز سیدھا ادارے کو ادائیگی کرتے ہیں۔\n5. صاف دستاویزات لگائیں (بل، چالان، رپورٹ)۔\n6. سیلفی لیں اور 60 سیکنڈ کی ویڈیو ریکارڈ کریں۔\n7. جمع کرنے پر 1 کریڈٹ فیس لگتی ہے۔\n8. ہماری ٹیم کی منظوری کے بعد آپ کا کیس ہیروز کے لیے لائیو ہو جاتا ہے۔",
  },
  {
    id: "currency",
    title_en: "How to change currency",
    title_ur: "کرنسی کیسے بدلیں",
    body_en:
      "1. Open Settings from the menu.\n2. Find the 'Currency' option.\n3. Select your currency (PKR, USD, etc.).\n4. Save.\n\nNow your case amounts will show in your selected currency. Note: platform credits are always in USD (1 credit = $1).",
    body_ur:
      "1. مینو سے Settings کھولیں۔\n2. 'Currency' کا option ڈھونڈیں۔\n3. اپنی کرنسی چنیں (PKR، USD، وغیرہ)۔\n4. Save کریں۔\n\nاب آپ کے کیس کی رقم آپ کی چنی ہوئی کرنسی میں دکھے گی۔ نوٹ: پلیٹ فارم کریڈٹ ہمیشہ USD میں ہیں (1 کریڈٹ = $1)۔",
  },
  {
    id: "hero",
    title_en: "How to become a Hero (help someone)",
    title_ur: "ہیرو کیسے بنیں (کسی کی مدد کریں)",
    body_en:
      "1. Open 'Browse Cases'.\n2. Choose a verified case you want to help.\n3. Enter how much you want to help with (full or partial).\n4. Unlock the case (a small credit fee based on your share).\n5. You'll see the institute's payment details.\n6. Pay the institute DIRECTLY from your own bank/account.\n7. Submit your proof (receipt + transaction ID).\n8. When the seeker confirms, you get an affidavit as proof of your help.",
    body_ur:
      "1. 'Browse Cases' کھولیں۔\n2. ایک تصدیق شدہ کیس چنیں جس کی مدد کرنا چاہتے ہیں۔\n3. لکھیں کتنی مدد کرنا چاہتے ہیں (پوری یا کچھ حصہ)۔\n4. کیس unlock کریں (آپ کے حصے کے مطابق چھوٹی کریڈٹ فیس)۔\n5. آپ کو ادارے کی ادائیگی تفصیل ملے گی۔\n6. اپنے بینک سے سیدھا ادارے کو ادائیگی کریں۔\n7. اپنا ثبوت جمع کریں (رسید + ٹرانزیکشن آئی ڈی)۔\n8. جب ضرورت مند تصدیق کرے، آپ کو مدد کے ثبوت کے طور پر affidavit ملے گا۔",
  },
  {
    id: "credits",
    title_en: "How credits & wallet work",
    title_ur: "کریڈٹ اور والیٹ کیسے کام کرتے ہیں",
    body_en:
      "Credits keep the platform genuine.\n- 1 credit = $1 USD.\n- Submitting a case: 1 credit fee.\n- Unlocking a case as a Hero: based on how much you pledge (full case = 1 credit).\n- Buy credits in the Wallet using NayaPay or USDT (TRC-20).\n- After you deposit, our team confirms and adds your credits.\n\nNote: the listing fee is NOT the help money — it only keeps fake cases away.",
    body_ur:
      "کریڈٹ پلیٹ فارم کو سچا رکھتے ہیں۔\n- 1 کریڈٹ = $1 USD۔\n- کیس جمع کرنا: 1 کریڈٹ فیس۔\n- ہیرو کے طور پر کیس unlock کرنا: آپ کتنی مدد کرتے ہیں اس پر منحصر (پورا کیس = 1 کریڈٹ)۔\n- Wallet میں NayaPay یا USDT (TRC-20) سے کریڈٹ خریدیں۔\n- جمع کرنے کے بعد ہماری ٹیم تصدیق کر کے کریڈٹ شامل کرتی ہے۔\n\nنوٹ: یہ فیس مدد کی رقم نہیں — صرف جھوٹے کیسز روکنے کے لیے ہے۔",
  },
];

export default function SupportChatPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [lang, setLang] = useState<"en" | "ur" | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [openArticle, setOpenArticle] = useState<any>(null);
  // File attachment temporarily disabled (will be added with R2)
  // const [file, setFile] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      loadMessages(false); // load without showing loading state
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages(showLoading = true) {
    if (!user?.id) return;
    try {
      const data = await getSupportMessages(user.id);
      setMessages(data ?? []);
      // Mark all admin messages as read
      await markSupportMessagesAsRead(user.id);
    } catch (e) {
      // ignore
    }
  }

  async function sendMessage() {
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendSupportMessage({
        user_id: user?.id,
        message: text.trim(),
        sender: "user",
        language: lang || "en",
        is_read: false,
        // attachment_url: null, // will be added later
      });
      setText("");
      // Immediately add the message to the local state for instant feedback
      const newMsg = {
        id: Date.now().toString(), // temporary ID
        user_id: user?.id,
        sender: "user",
        message: text.trim(),
        attachment_url: null,
        language: lang || "en",
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
    } catch (e) {
      toast.error("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (!lang) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Help & Support</h1>
            <p className="text-muted-foreground mt-1">
              Please choose your language / اپنی زبان منتخب کریں
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLang("en")}
              className="rounded-2xl border-2 border-border hover:border-primary p-6 font-semibold transition-colors"
            >
              🌐 English
            </button>
            <button
              onClick={() => setLang("ur")}
              className="rounded-2xl border-2 border-border hover:border-primary p-6 font-semibold transition-colors"
            >
              🇵🇰 اردو
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const t = (en: string, ur: string) => (lang === "ur" ? ur : en);

  if (openArticle) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <button
            onClick={() => setOpenArticle(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t("Back", "واپس")}
          </button>
          <div
            className="rounded-2xl border bg-card p-6 space-y-3"
            dir={lang === "ur" ? "rtl" : "ltr"}
          >
            <h2 className="font-bold text-lg">
              {lang === "ur" ? openArticle.title_ur : openArticle.title_en}
            </h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {lang === "ur" ? openArticle.body_ur : openArticle.body_en}
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {t(
              "Still need help? Go back and send us a message.",
              "اب بھی مدد چاہیے؟ واپس جا کر ہمیں پیغام بھیجیں۔"
            )}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="max-w-2xl mx-auto px-4 py-4 flex flex-col"
        style={{ minHeight: "calc(100vh - 120px)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setLang(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <MessageCircle className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">{t("Help & Support", "مدد اور سپورٹ")}</h1>
        </div>

        <div className="space-y-2 mb-4" dir={lang === "ur" ? "rtl" : "ltr"}>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            {t("Quick help topics", "فوری مدد کے موضوعات")}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {FAQ_ARTICLES.map((a) => (
              <button
                key={a.id}
                onClick={() => setOpenArticle(a)}
                className="flex items-center gap-2 text-left rounded-xl border border-border bg-card hover:border-primary hover:bg-muted/30 p-3 text-sm font-medium transition-colors"
              >
                <FileText className="h-4 w-4 text-primary shrink-0" />
                {lang === "ur" ? a.title_ur : a.title_en}
              </button>
            ))}
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl border border-border bg-muted/20 p-4 space-y-3 overflow-y-auto mb-3"
          dir={lang === "ur" ? "rtl" : "ltr"}
        >
          <div className="text-center text-xs text-muted-foreground bg-card rounded-full px-3 py-1.5 inline-block mx-auto">
            {t(
              "Send us a message — we'll reply here.",
              "ہمیں پیغام بھیجیں — ہم یہیں جواب دیں گے۔"
            )}
          </div>
          {messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              {t("No messages yet. Ask us anything!", "ابھی کوئی پیغام نہیں۔ ہم سے کچھ بھی پوچھیں!")}
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.sender === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-card border border-border rounded-bl-sm"
                  }`}
                >
                  {m.message && <p className="whitespace-pre-line">{m.message}</p>}
                  {m.attachment_url && (
                    <a
                      href={m.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs underline mt-1"
                    >
                      <FileText className="h-3 w-3" /> {t("View attachment", "منسلکہ دیکھیں")}
                    </a>
                  )}
                  <p
                    className={`text-[10px] mt-1 ${
                      m.sender === "user" ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* File attachment temporarily disabled
        {file && (
          <div className="flex items-center gap-2 text-xs text-primary mb-1 px-2">
            <FileText className="h-3 w-3" /> {file.name}
            <button onClick={() => setFile(null)} className="text-red-500">✕</button>
          </div>
        )}
        */}
        <div className="flex items-center gap-2">
          {/* Attachment button temporarily hidden
          <label className="h-10 w-10 rounded-full border border-border flex items-center justify-center cursor-pointer hover:bg-muted shrink-0">
            <Plus className="h-5 w-5 text-muted-foreground" />
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </label>
          */}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={t("Type your message...", "اپنا پیغام لکھیں...")}
            rows={4}
            className="min-h-[104px] flex-1 resize-y whitespace-pre-wrap"
            dir={lang === "ur" ? "rtl" : "ltr"}
          />
          <Button
            onClick={sendMessage}
            disabled={sending || !text.trim()}
            size="icon"
            className="shrink-0 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
