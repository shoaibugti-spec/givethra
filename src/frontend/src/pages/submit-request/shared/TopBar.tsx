// src/frontend/src/pages/submit-request/shared/TopBar.tsx
import { MessageCircle } from "lucide-react";

/** Same 24/7 support link as HomePage */
const SUPPORT_WHATSAPP_URL =
  "https://wa.me/message/42CJXLUYEI2KM1?src=qr";

export function SubmitTopBar({
  isFree,
  balance,
}: {
  isFree: boolean;
  balance: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-1 py-2 border-b mb-4">
      <a
        href={SUPPORT_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-green-600 transition-colors min-w-0"
      >
        <MessageCircle className="h-5 w-5 text-green-600 shrink-0" />
        <span className="truncate">24/7 Support</span>
      </a>

      <span
        className={
          isFree
            ? "text-green-600 font-semibold text-sm shrink-0"
            : "text-primary font-semibold text-sm shrink-0"
        }
      >
        {isFree ? "FREE Case" : `Credits: ${balance}`}
      </span>
    </div>
  );
}
