export type ShareableCase = {
  id: string | number;
  title?: string;
  short_description?: string;
  description?: string;
  amount_needed?: number | string;
  currency?: string;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", PKR: "Rs", GBP: "£", EUR: "€", INR: "₹", AED: "AED", SAR: "SAR",
};

export function buildCaseShareData(caseData: ShareableCase, origin = typeof window !== "undefined" ? window.location.origin : "https://givethra.org") {
  const title = String(caseData.title || "A Givethra help case").trim();
  const description = String(caseData.short_description || caseData.description || "Someone needs support today.").trim();
  const amount = Number(caseData.amount_needed || 0);
  const currency = String(caseData.currency || "USD").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const amountText = amount > 0 ? ` Goal: ${symbol} ${amount.toLocaleString()} .` : "";
  const url = new URL(`/cases/${encodeURIComponent(String(caseData.id))}`, origin).toString();
  const text = `Please help this Givethra case: ${title}. ${description}${amountText}`;
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
