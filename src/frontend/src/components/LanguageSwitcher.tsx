import { useState, useEffect } from "react";
import { Languages, Search } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish (Español)" },
  { code: "fr", label: "French (Français)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "it", label: "Italian (Italiano)" },
  { code: "pt", label: "Portuguese (Português)" },
  { code: "ar", label: "Arabic (العربية)" },
  { code: "ur", label: "Urdu (اردو)" },
  { code: "hi", label: "Hindi (हिन्दी)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "fa", label: "Persian (فارسی)" },
  { code: "ps", label: "Pashto (پښتو)" },
  { code: "tr", label: "Turkish (Türkçe)" },
  { code: "zh-CN", label: "Chinese Simplified (中文)" },
  { code: "zh-TW", label: "Chinese Traditional (繁體中文)" },
  { code: "ja", label: "Japanese (日本語)" },
  { code: "ko", label: "Korean (한국어)" },
  { code: "ru", label: "Russian (Русский)" },
  { code: "id", label: "Indonesian (Indonesia)" },
  { code: "ms", label: "Malay (Melayu)" },
  { code: "vi", label: "Vietnamese (Tiếng Việt)" },
  { code: "th", label: "Thai (ไทย)" },
  { code: "nl", label: "Dutch (Nederlands)" },
  { code: "pl", label: "Polish (Polski)" },
  { code: "uk", label: "Ukrainian (Українська)" },
  { code: "el", label: "Greek (Ελληνικά)" },
  { code: "sv", label: "Swedish (Svenska)" },
  { code: "fi", label: "Finnish (Suomi)" },
  { code: "no", label: "Norwegian (Norsk)" },
  { code: "da", label: "Danish (Dansk)" },
  { code: "ro", label: "Romanian (Română)" },
  { code: "hu", label: "Hungarian (Magyar)" },
  { code: "cs", label: "Czech (Čeština)" },
  { code: "sk", label: "Slovak (Slovenčina)" },
  { code: "bg", label: "Bulgarian (Български)" },
  { code: "hr", label: "Croatian (Hrvatski)" },
  { code: "sr", label: "Serbian (Српски)" },
  { code: "he", label: "Hebrew (עברית)" },
  { code: "sw", label: "Swahili (Kiswahili)" },
  { code: "fil", label: "Filipino (Tagalog)" },
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
  const [query, setQuery] = useState("");

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
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function setLanguage(code: string, label: string) {
    const trySet = (attempt: number) => {
      const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event("change"));
        setCurrent(label.split(" ")[0]);
        setOpen(false);
      } else if (attempt < 20) {
        setTimeout(() => trySet(attempt + 1), 300);
      }
    };
    trySet(0);
  }

  const filtered = LANGUAGES.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }} />
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Change language"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-medium">{current}</span>
        </button>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 mt-1 w-64 rounded-xl border border-border bg-card shadow-lg z-50 p-2 notranslate flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search language..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-0.5">
                {filtered.length === 0 ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    No language found
                  </div>
                ) : (
                  filtered.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code, l.label)}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors font-medium"
                    >
                      {l.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
