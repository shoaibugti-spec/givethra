import { useEffect, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

function getGoogTransCookie(): string {
  const match = document.cookie.match(/googtrans=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function setLanguage(targetLang: "en" | "ur") {
  const value = targetLang === "en" ? "" : `/en/${targetLang}`;

  // پرانی cookie صاف کریں (تمام ممکنہ paths/domains پر) تاکہ ٹکراؤ نہ ہو
  const hostname = window.location.hostname;
  const domain = hostname.startsWith("www.") ? hostname.slice(3) : hostname;

  document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
  document.cookie = `googtrans=; path=/; domain=.${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;

  if (value) {
    document.cookie = `googtrans=${value}; path=/`;
    document.cookie = `googtrans=${value}; path=/; domain=.${domain}`;
  }

  // ایک ہی بار ری لوڈ — بار بار ریفریش نہ ہو اس کے لیے flag لگاتے ہیں
  window.location.reload();
}

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<"en" | "ur">("en");

  useEffect(() => {
    const stored = getGoogTransCookie();
    setCurrentLang(stored.includes("ur") ? "ur" : "en");
  }, []);

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "ur" : "en";
    setLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="notranslate flex items-center h-9 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium text-sm border border-border/50"
    >
      {currentLang === "ur" ? "English" : "اردو"}
    </button>
  );
}
