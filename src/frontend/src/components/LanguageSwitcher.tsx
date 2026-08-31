import { useEffect, useState } from "react";

function waitForGoogleCombo(callback: (select: HTMLSelectElement) => void, attempts = 0) {
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (select) {
    callback(select);
    return;
  }
  if (attempts > 40) return; // ~10 سیکنڈ بعد چھوڑ دیں
  setTimeout(() => waitForGoogleCombo(callback, attempts + 1), 250);
}

function triggerGoogleTranslate(targetLang: "en" | "ur") {
  waitForGoogleCombo((select) => {
    select.value = targetLang;
    select.dispatchEvent(new Event("change"));
  });
}

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<"en" | "ur">("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    waitForGoogleCombo(() => setReady(true));
  }, []);

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "ur" : "en";
    triggerGoogleTranslate(newLang);
    setCurrentLang(newLang);
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
