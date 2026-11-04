// src/frontend/src/lib/countryProfiles.ts
// Givethra - Global Country Profiles & Currency Config

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
  dialCode: "",
  idLabel: "National ID or passport",
  familyProofLabel: "Family proof (household / family registration, ration card, or any official document showing your family)",
  childIdLabel: "Child's birth certificate or ID",
  marriageCertLabel: "Marriage certificate",
  walletHint: "",
  cityExample: "Your city",
  hasLocalProviderLists: false,
};

function p(over: Partial<CountryProfile>): CountryProfile {
  return { ...GLOBAL_PROFILE, ...over };
}

const PROFILES: Record<string, CountryProfile> = {
  pakistan: p({ currency: "PKR", dialCode: "+92", idLabel: "CNIC", familyProofLabel: "Family Registration Certificate (FRC)", childIdLabel: "B-Form (child's ID)", marriageCertLabel: "Nikah Nama (marriage certificate)", walletHint: "EasyPaisa / JazzCash", cityExample: "Karachi", hasLocalProviderLists: true }),
  india: p({ currency: "INR", dialCode: "+91", idLabel: "Aadhaar or voter ID", walletHint: "UPI ID", cityExample: "Mumbai" }),
  bangladesh: p({ currency: "BDT", dialCode: "+880", idLabel: "NID", walletHint: "bKash / Nagad", cityExample: "Dhaka" }),
  nepal: p({ currency: "NPR", dialCode: "+977", idLabel: "Citizenship certificate", cityExample: "Kathmandu" }),
  "sri lanka": p({ currency: "LKR", dialCode: "+94", idLabel: "NIC", cityExample: "Colombo" }),
  afghanistan: p({ currency: "AFN", dialCode: "+93", idLabel: "Tazkira", cityExample: "Kabul" }),
  "saudi arabia": p({ currency: "SAR", dialCode: "+966", idLabel: "National ID or Iqama", cityExample: "Riyadh" }),
  "united arab emirates": p({ currency: "AED", dialCode: "+971", idLabel: "Emirates ID", cityExample: "Dubai" }),
  turkey: p({ currency: "TRY", dialCode: "+90", idLabel: "T.C. Kimlik (national ID)", cityExample: "Istanbul" }),
  "united kingdom": p({ currency: "GBP", dialCode: "+44", idLabel: "Passport or driving licence", cityExample: "Manchester" }),
  "united states": p({ currency: "USD", dialCode: "+1", idLabel: "Driver's license, state ID or passport", cityExample: "Houston" }),
  canada: p({ currency: "CAD", dialCode: "+1", idLabel: "Driver's licence, provincial ID or passport", cityExample: "Toronto" }),
  australia: p({ currency: "AUD", dialCode: "+61", idLabel: "Driver's licence or passport", cityExample: "Sydney" }),
  germany: p({ currency: "EUR", dialCode: "+49", idLabel: "Personalausweis or passport", cityExample: "Berlin" }),
  france: p({ currency: "EUR", dialCode: "+33", idLabel: "Carte d'identité or passport", cityExample: "Paris" }),
  italy: p({ currency: "EUR", dialCode: "+39", idLabel: "Carta d'identità or passport", cityExample: "Milan" }),
  spain: p({ currency: "EUR", dialCode: "+34", idLabel: "DNI / NIE or passport", cityExample: "Madrid" }),
  netherlands: p({ currency: "EUR", dialCode: "+31", idLabel: "ID card or passport", cityExample: "Amsterdam" }),
  nigeria: p({ currency: "NGN", dialCode: "+234", idLabel: "NIN slip or voter's card", cityExample: "Lagos" }),
  kenya: p({ currency: "KES", dialCode: "+254", idLabel: "National ID", walletHint: "M-Pesa", cityExample: "Nairobi" }),
  egypt: p({ currency: "EGP", dialCode: "+20", idLabel: "National ID", cityExample: "Cairo" }),
  indonesia: p({ currency: "IDR", dialCode: "+62", idLabel: "KTP", cityExample: "Jakarta" }),
  malaysia: p({ currency: "MYR", dialCode: "+60", idLabel: "MyKad", cityExample: "Kuala Lumpur" }),
};

const ALIASES: Record<string, string> = { uae: "united arab emirates", uk: "united kingdom", "great britain": "united kingdom", england: "united kingdom", usa: "united states", "united states of america": "united states", türkiye: "turkey", turkiye: "turkey", ksa: "saudi arabia" };

export function getCountryProfile(countryName: string | null | undefined): CountryProfile {
  const key = (countryName ?? "").trim().toLowerCase();
  if (!key) return GLOBAL_PROFILE;
  return PROFILES[ALIASES[key] ?? key] ?? GLOBAL_PROFILE;
}

const PER_PKR: Record<string, number> = { PKR: 1, USD: 0.0036, EUR: 0.0031, GBP: 0.0027, CAD: 0.005, AUD: 0.0055, SAR: 0.0135, AED: 0.0131, TRY: 0.15, INR: 0.3, BDT: 0.43, NPR: 0.48, LKR: 1.07, AFN: 0.25, NGN: 5.5, KES: 0.46, EGP: 0.18, IDR: 58, MYR: 0.016 };
export const CURRENCY_CODES = Object.keys(PER_PKR);
export const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", PKR: "Rs", SAR: "SAR", AED: "AED", GBP: "£", EUR: "€", INR: "₹", TRY: "₺", BDT: "৳", NPR: "Rs", LKR: "Rs", AFN: "AFN", CAD: "CA$", AUD: "A$", NGN: "₦", KES: "KSh", EGP: "E£", IDR: "Rp", MYR: "RM" };

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
