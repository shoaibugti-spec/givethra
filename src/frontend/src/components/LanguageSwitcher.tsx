import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const currentLang = i18n.language;

  useEffect(() => {
    const saved = localStorage.getItem('i18n_lang');
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  }, [i18n]);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18n_lang', code);
    setOpen(false);
  };

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'ur' : 'en';
    changeLanguage(newLang);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium text-sm border border-border/50"
      >
        <Languages className="h-4 w-4" />
        <span>{currentLang === 'ur' ? 'English' : 'اردو'}</span>
      </button>
    </div>
  );
}
