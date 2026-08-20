import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو (Urdu)" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "fa", label: "فارسی (Persian)" },
  { code: "ps", label: "پښتو (Pashto)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "tr", label: "Türkçe (Turkish)" },
  { code: "id", label: "Indonesia" },
  { code: "ms", label: "Melayu (Malay)" },
  { code: "fr", label: "Français (French)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "zh-CN", label: "中文 (Chinese)" },
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("English");

  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;
    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element"
        );
      }
    };
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function setLanguage(code: string, label: string) {
    const trySet = (attempt: number) => {
      const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event("change"));
        setCurrent(label);
        setOpen(false);
      } else if (attempt < 20) {
        setTimeout(() => trySet(attempt + 1), 300);
      }
    };
    trySet(0);
  }

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }} />
      <div className="relative">
        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Change language">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-medium">{current}</span>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-1 w-44 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-lg z-50 py-1 notranslate">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLanguage(l.code, l.label)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">
                  {l.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
