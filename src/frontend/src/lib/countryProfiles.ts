// src/frontend/src/lib/countryProfiles.ts
// Givethra - Global Country Profiles & Currency Config
// 🌍 100% Global, covering all 195+ countries. Fallback to GLOBAL_PROFILE.

export type CountryProfile = {
  currency: string;
  dialCode: string;
  idLabel: string;
  familyProofLabel: string;
  childIdLabel: string;
  marriageCertLabel: string;
  walletHint: string;
  cityExample: string;
  hasLocalProviderLists: boolean;
};

export const GLOBAL_PROFILE: CountryProfile = {
  currency: "USD",
  dialCode: "+1",
  idLabel: "National ID or Passport",
  familyProofLabel: "Family Registration Document",
  childIdLabel: "Child Birth Certificate or ID",
  marriageCertLabel: "Marriage Certificate",
  walletHint: "Bank Account",
  cityExample: "Your City",
  hasLocalProviderLists: false,
};

function p(over: Partial<CountryProfile>): CountryProfile {
  return { ...GLOBAL_PROFILE, ...over };
}

// Curated profiles for countries where Givethra has specific document names or local provider lists.
const PROFILES: Record<string, CountryProfile> = {
  pakistan: p({ currency: "PKR", dialCode: "+92", idLabel: "CNIC", familyProofLabel: "Family Registration Certificate (FRC)", childIdLabel: "B-Form", marriageCertLabel: "Nikah Nama", walletHint: "EasyPaisa / JazzCash", cityExample: "Karachi", hasLocalProviderLists: true }),
  india: p({ currency: "INR", dialCode: "+91", idLabel: "Aadhaar / Voter ID", walletHint: "UPI ID", cityExample: "Mumbai" }),
  bangladesh: p({ currency: "BDT", dialCode: "+880", idLabel: "NID", walletHint: "bKash / Nagad", cityExample: "Dhaka" }),
  nepal: p({ currency: "NPR", dialCode: "+977", idLabel: "Citizenship Certificate", cityExample: "Kathmandu" }),
  "sri lanka": p({ currency: "LKR", dialCode: "+94", idLabel: "NIC", cityExample: "Colombo" }),
  afghanistan: p({ currency: "AFN", dialCode: "+93", idLabel: "Tazkira", cityExample: "Kabul" }),
  "saudi arabia": p({ currency: "SAR", dialCode: "+966", idLabel: "National ID or Iqama", cityExample: "Riyadh" }),
  "united arab emirates": p({ currency: "AED", dialCode: "+971", idLabel: "Emirates ID", cityExample: "Dubai" }),
  turkey: p({ currency: "TRY", dialCode: "+90", idLabel: "National ID", cityExample: "Istanbul" }),
  "united kingdom": p({ currency: "GBP", dialCode: "+44", idLabel: "Passport / Driving Licence", cityExample: "London" }),
  "united states": p({ currency: "USD", dialCode: "+1", idLabel: "State ID / Driver's License", cityExample: "New York" }),
  canada: p({ currency: "CAD", dialCode: "+1", idLabel: "Provincial ID", cityExample: "Toronto" }),
  australia: p({ currency: "AUD", dialCode: "+61", idLabel: "Driver's Licence", cityExample: "Sydney" }),
  germany: p({ currency: "EUR", dialCode: "+49", idLabel: "Personalausweis", cityExample: "Berlin" }),
  france: p({ currency: "EUR", dialCode: "+33", idLabel: "Carte d'identité", cityExample: "Paris" }),
  italy: p({ currency: "EUR", dialCode: "+39", idLabel: "Carta d'identità", cityExample: "Rome" }),
  spain: p({ currency: "EUR", dialCode: "+34", idLabel: "DNI / NIE", cityExample: "Madrid" }),
  netherlands: p({ currency: "EUR", dialCode: "+31", idLabel: "ID Card", cityExample: "Amsterdam" }),
  nigeria: p({ currency: "NGN", dialCode: "+234", idLabel: "NIN slip / Voter's card", cityExample: "Lagos" }),
  kenya: p({ currency: "KES", dialCode: "+254", idLabel: "National ID", walletHint: "M-Pesa", cityExample: "Nairobi" }),
  egypt: p({ currency: "EGP", dialCode: "+20", idLabel: "National ID", cityExample: "Cairo" }),
  indonesia: p({ currency: "IDR", dialCode: "+62", idLabel: "KTP", cityExample: "Jakarta" }),
  malaysia: p({ currency: "MYR", dialCode: "+60", idLabel: "MyKad", cityExample: "Kuala Lumpur" }),
  // Add more as needed; rest fallback to USD
};

const ALIASES: Record<string, string> = { uae: "united arab emirates", uk: "united kingdom", "great britain": "united kingdom", england: "united kingdom", usa: "united states", "united states of america": "united states", türkiye: "turkey", turkiye: "turkey", ksa: "saudi arabia" };

export function getCountryProfile(countryName: string | null | undefined): CountryProfile {
  const key = (countryName ?? "").trim().toLowerCase();
  if (!key) return GLOBAL_PROFILE;
  return PROFILES[ALIASES[key] ?? key] ?? GLOBAL_PROFILE;
}

// 🌍 Expanded Currency Coverage
const PER_PKR: Record<string, number> = {
  PKR: 1, USD: 0.0036, EUR: 0.0031, GBP: 0.0027, CAD: 0.005, AUD: 0.0055, SAR: 0.0135, AED: 0.0131,
  TRY: 0.15, INR: 0.3, BDT: 0.43, NPR: 0.48, LKR: 1.07, AFN: 0.25, NGN: 5.5, KES: 0.46, EGP: 0.18,
  IDR: 58, MYR: 0.016, CNY: 0.026, JPY: 0.55, KRW: 4.9, RUB: 0.33, BRL: 0.018, MXN: 0.062,
  ZAR: 0.065, NZD: 0.006, CHF: 0.0032, SEK: 0.038, NOK: 0.039, DKK: 0.024, PLN: 0.014,
  CZK: 0.084, HUF: 1.3, RON: 0.016, UAH: 0.15, ILS: 0.013, QAR: 0.0131, KWD: 0.0011,
  BHD: 0.0013, OMR: 0.0013, JOD: 0.0025, BGN: 0.0062, HRK: 0.024, RSD: 0.4, PHP: 0.21,
  THB: 0.13, VND: 90, TWD: 0.12, HKD: 0.028, SGD: 0.0048, MMK: 7.5, KHR: 14.5, LAK: 75,
  MNT: 12.5, KZT: 1.7, UZS: 45, AZN: 0.0061, GEL: 0.0095, AMD: 1.4, BYN: 0.012,
  ETB: 0.2, GHS: 0.02, UGX: 13.5, TZS: 9, RWF: 4.7, MWK: 6.3, ZMW: 0.1, BWP: 0.05,
  MAD: 0.036, DZD: 0.48, TND: 0.011, LYD: 0.017, SDG: 2, MUR: 0.16, SCR: 0.05,
};

export const CURRENCY_CODES = Object.keys(PER_PKR);

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", PKR: "Rs", SAR: "SAR", AED: "AED", GBP: "£", EUR: "€", INR: "₹", TRY: "₺", BDT: "৳",
  NPR: "Rs", LKR: "Rs", AFN: "؋", CAD: "CA$", AUD: "A$", NGN: "₦", KES: "KSh", EGP: "E£",
  IDR: "Rp", MYR: "RM", CNY: "¥", JPY: "¥", KRW: "₩", RUB: "₽", BRL: "R$", MXN: "MX$",
  ZAR: "R", NZD: "NZ$", CHF: "Fr", SEK: "kr", NOK: "kr", DKK: "kr", PLN: "zł", CZK: "Kč",
  HUF: "Ft", RON: "lei", UAH: "₴", ILS: "₪", QAR: "QR", KWD: "KD", BHD: "BD", OMR: "OMR",
  JOD: "JD", BGN: "лв", HRK: "kn", RSD: "дин", PHP: "₱", THB: "฿", VND: "₫", TWD: "NT$",
  HKD: "HK$", SGD: "S$", MMK: "K", KHR: "៛", LAK: "₭", MNT: "₮", KZT: "₸", UZS: "so'm",
  AZN: "₼", GEL: "₾", AMD: "֏", BYN: "Br", ETB: "Br", GHS: "₵", UGX: "USh", TZS: "TSh",
  RWF: "FRw", MWK: "MK", ZMW: "ZK", BWP: "P", MAD: "DH", DZD: "دج", TND: "د.ت", LYD: "ل.د", SDG: "ج.س",
  MUR: "₨", SCR: "₨",
};

export function scaleFromPKR(amountPKR: number, currency: string): number {
  if (!amountPKR) return 0;
  if (currency === "PKR") return amountPKR;
  const rate = PER_PKR[currency] ?? PER_PKR.USD;
  const raw = amountPKR * rate;
  if (raw < 10) return Math.max(1, Math.round(raw));
  const step = Math.pow(10, Math.floor(Math.log10(raw))) / 2;
  return Math.round(raw / step) * step;
}

export function isPhoneValid(raw: string): boolean {
  const digits = raw.replace(/[\s\-()+.]/g, "");
  return /^\d{7,15}$/.test(digits);
}
