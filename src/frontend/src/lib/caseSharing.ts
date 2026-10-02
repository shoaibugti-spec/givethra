export type ShareableCase = {
  id: string | number;
  title?: string;
  short_description?: string;
  description?: string;
  why_help?: string;
  selfie_url?: string;
  amount_needed?: number | string;
  amount_collected?: number | string;
  currency?: string;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", PKR: "Rs", GBP: "£", EUR: "€", INR: "₹", AED: "AED", SAR: "SAR",
};

export function buildCaseShareData(caseData: ShareableCase, origin = typeof window !== "undefined" ? window.location.origin : "https://givethra.org") {
  const title = String(caseData.title || "A Givethra help case").trim();
  const description = String(caseData.short_description || caseData.why_help || caseData.description || "Someone needs support today.")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 360);
  const amount = Number(caseData.amount_needed || 0);
  const collected = Math.max(Number(caseData.amount_collected || 0), 0);
  const currency = String(caseData.currency || "USD").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const progressText = amount > 0
    ? ` Contributed: ${symbol} ${collected.toLocaleString()} of ${symbol} ${amount.toLocaleString()}. Remaining: ${symbol} ${Math.max(amount - collected, 0).toLocaleString()}.`
    : " Contributions are welcome.";
  const helpOptions = " You can contribute any amount or pay the complete fee directly.";
  // Use a crawler-friendly preview endpoint. It returns rich Open Graph metadata
  // (including the approved selfie) and redirects human visitors to the SPA case page.
  const url = new URL(`/share/cases/${encodeURIComponent(String(caseData.id))}`, origin).toString();
  const text = `Please help this Givethra case: ${title}. ${description}${progressText}${helpOptions}`;
  return { title: `Help: ${title}`, text, url };
}

export async function shareCase(caseData: ShareableCase): Promise<"shared" | "copied" | "cancelled" | "unavailable"> {
  const payload = buildCaseShareData(caseData);
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`${payload.text}\n${payload.url}`);
      return "copied";
    } catch {
      return "unavailable";
    }
  }
  return "unavailable";
}
