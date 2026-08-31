// src/components/LanguageSwitcher.tsx
import { useState, useEffect, useRef } from "react";
import { Languages, Search, Check } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ur", label: "Urdu (اردو)" },
  { code: "es", label: "Spanish (Español)" },
  { code: "fr", label: "French (Français)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "it", label: "Italian (Italiano)" },
  { code: "pt", label: "Portuguese (Português)" },
  { code: "ar", label: "Arabic (العربية)" },
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

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState("en");
  const [query, setQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load Google Translate
  useEffect(() => {
    if (document.getElementById("google-translate-script")) {
      setIsLoaded(true);
      return;
    }

    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element"
        );
        setIsLoaded(true);
      }
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function setLanguage(code: string) {
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
      setCurrentCode(code);
      localStorage.setItem("g_lang", code);
      setOpen(false);
    } else {
      setTimeout(() => setLanguage(code), 500);
    }
  }

  // Restore saved language
  useEffect(() => {
    const saved = localStorage.getItem("g_lang");
    if (saved && saved !== "en") {
      setTimeout(() => setLanguage(saved), 1500);
    }
  }, [isLoaded]);

  const filtered = LANGUAGES.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get button label - shows "اردو" when English, "English" when Urdu
  const getButtonLabel = () => {
    return currentCode === "ur" ? "English" : "اردو";
  };

  const getToggleCode = () => {
    return currentCode === "ur" ? "en" : "ur";
  };

  const handleToggle = () => {
    setLanguage(getToggleCode());
  };

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }} />
      <div className="relative flex items-center gap-1" ref={dropdownRef}>
        {/* Main toggle button - shows "اردو" or "English" */}
        <button
          onClick={handleToggle}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium text-sm border border-border/50"
          aria-label="Toggle language"
        >
          <Languages className="h-4 w-4" />
          <span>{getButtonLabel()}</span>
        </button>

        {/* Dropdown arrow */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center h-9 px-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown with search */}
        {open && (
          <div className="absolute right-0 top-full mt-1 w-64 rounded-xl border border-border bg-card shadow-lg z-50 p-2 notranslate flex flex-col gap-2">
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
            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {filtered.length === 0 ? (
                <div className="p-3 text-center text-sm text-muted-foreground">No language found</div>
              ) : (
                filtered.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors flex items-center justify-between ${
                      currentCode === l.code ? "bg-primary/10" : ""
                    }`}
                  >
                    <span>{l.label}</span>
                    {currentCode === l.code && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
