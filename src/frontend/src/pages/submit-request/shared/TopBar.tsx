// src/frontend/src/pages/submit-request/shared/TopBar.tsx
import LanguageSwitcher from "@/components/LanguageSwitcher";

export function SubmitTopBar({ isFree, balance }: { isFree: boolean; balance: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b mb-4">
      <LanguageSwitcher />
      <span className={isFree ? "text-green-600 font-semibold" : "text-primary font-semibold"}>
        {isFree ? "🎁 FREE Case" : `💰 Credits: ${balance}`}
      </span>
    </div>
  );
}
