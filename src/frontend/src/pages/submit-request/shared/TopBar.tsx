// src/frontend/src/pages/submit-request/shared/TopBar.tsx
// NO LanguageSwitcher / NO Urdu button
// Credits centered on top
// WhatsApp Channel | 24/7 Support one line below (same links as HomePage)

import { MessageCircle } from "lucide-react";

const WHATSAPP_CHANNEL_URL =
  "https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J";

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
    <div className="mb-4 border-b border-border pb-3 space-y-2">
      {/* Credits — center, top */}
      <div className="flex justify-center">
        <span
          className={
            isFree
              ? "text-green-600 font-semibold text-sm"
              : "text-primary font-semibold text-sm"
          }
        >
          {isFree ? "FREE Case" : `Credits: ${balance}`}
        </span>
      </div>

      {/* WhatsApp Channel | 24/7 Support — one line, center */}
      <div className="flex items-center justify-center gap-3 flex-wrap text-sm">
        <a
          href={WHATSAPP_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-green-600 transition-colors"
        >
          <MessageCircle className="h-4 w-4 text-green-600 shrink-0" />
          <span>WhatsApp Channel</span>
        </a>

        <span className="text-muted-foreground select-none">|</span>

        <a
          href={SUPPORT_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="h-4 w-4 text-primary shrink-0" />
          <span>24/7 Support</span>
        </a>
      </div>
    </div>
  );
}

export default SubmitTopBar;
