// src/frontend/src/pages/submit-request/shared/TopBar.tsx
import { MessageCircle } from "lucide-react";

const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J";
const SUPPORT_WHATSAPP_URL = "https://wa.me/message/42CJXLUYEI2KM1?src=qr";

export default function SubmitTopBar({
  isFree,
  balance,
}: {
  isFree: boolean;
  balance: number;
}) {
  return (
    <div className="mb-4 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-950/30 p-4 space-y-3">
      <div className="flex justify-center">
        <span className={isFree ? "text-green-700 font-bold text-base" : "text-primary font-bold text-base"}>
          {isFree ? "FREE Case" : `Credits: ${balance}`}
        </span>
      </div>
      <div className="flex items-center justify-center gap-3 flex-wrap text-sm">
        <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-green-700 hover:underline">
          <MessageCircle className="h-4 w-4 shrink-0" /> WhatsApp Channel
        </a>
        <span className="text-muted-foreground">|</span>
        <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
          <MessageCircle className="h-4 w-4 shrink-0" /> 24/7 Support
        </a>
      </div>
    </div>
  );
}
