import { useEffect, useRef, useState } from "react";

function waitForGoogleCombo(
  callback: (select: HTMLSelectElement) => void,
  attempts = 0
) {
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (select) {
    callback(select);
    return;
  }
  if (attempts > 40) return; // ~10 سیکنڈ کے بعد چھوڑ دیں
  setTimeout(() => waitForGoogleCombo(callback, attempts + 1), 250);
}

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<"en" | "ur">("en");
  const [ready, setReady] = useState(false);
  const isTranslating = useRef(false);

  useEffect(() => {
    waitForGoogleCombo(() => setReady(true));
  }, []);

  const toggleLanguage = () => {
    if (isTranslating.current) return; // دوران عمل دوبارہ کلک بلاک کریں — یہی وہیل کے مسلسل چلنے کی روک تھام ہے
    const newLang = currentLang === "en" ? "ur" : "en";

    isTranslating.current = true;

    waitForGoogleCombo((select) => {
      select.value = newLang;
      select.dispatchEvent(new Event("change"));
      setCurrentLang(newLang);

      // ترجمہ مکمل ہونے کا وقت دیں، پھر lock ہٹا دیں
      setTimeout(() => {
        isTranslating.current = false;
      }, 1200);
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={!ready}
      className="notranslate flex items-center h-9 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium text-sm border border-border/50 disabled:opacity-50"
    >
      {currentLang === "ur" ? "English" : "اردو"}
    </button>
  );
}
