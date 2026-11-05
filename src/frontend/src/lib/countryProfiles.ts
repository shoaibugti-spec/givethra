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


// ============================================================
//  ALL COUNTRIES — 250 countries and territories (ISO 3166-1 + Kosovo).
//  Every country has a currency and phone prefix; the curated PROFILES above add
//  local ID names where known. Any country not curated uses GLOBAL_PROFILE wording.
// ============================================================
export type CountryEntry = { code: string; name: string; currency: string; dialCode: string };

// code|name|currency|phone prefix
const RAW_COUNTRIES = `AF|Afghanistan|AFN|93
AX|Åland Islands (Aland)|EUR|358
AL|Albania|ALL|355
DZ|Algeria|DZD|213
AS|American Samoa|USD|1
AD|Andorra|EUR|376
AO|Angola|AOA|244
AI|Anguilla|XCD|1
AQ|Antarctica|USD|672
AG|Antigua and Barbuda|XCD|1
AR|Argentina|ARS|54
AM|Armenia|AMD|374
AW|Aruba|AWG|297
AU|Australia|AUD|61
AT|Austria|EUR|43
AZ|Azerbaijan|AZN|994
BS|Bahamas|BSD|1
BH|Bahrain|BHD|973
BD|Bangladesh|BDT|880
BB|Barbados|BBD|1
BY|Belarus|BYN|375
BE|Belgium|EUR|32
BZ|Belize|BZD|501
BJ|Benin|XOF|229
BM|Bermuda|BMD|1
BT|Bhutan|BTN|975
BO|Bolivia|BOB|591
BQ|Bonaire, Sint Eustatius and Saba|USD|599
BA|Bosnia and Herzegovina|BAM|387
BW|Botswana|BWP|267
BV|Bouvet Island|NOK|47
BR|Brazil|BRL|55
IO|British Indian Ocean Territory|USD|246
VG|British Virgin Islands|USD|1
BN|Brunei|BND|673
BG|Bulgaria|EUR|359
BF|Burkina Faso|XOF|226
BI|Burundi|BIF|257
CV|Cabo Verde (Cape Verde)|CVE|238
KH|Cambodia|KHR|855
CM|Cameroon|XAF|237
CA|Canada|CAD|1
KY|Cayman Islands|KYD|1
CF|Central African Republic|XAF|236
TD|Chad|XAF|235
CL|Chile|CLP|56
CN|China|CNY|86
CX|Christmas Island|AUD|61
CC|Cocos (Keeling) Islands|AUD|61
CO|Colombia|COP|57
KM|Comoros|KMF|269
CG|Republic of the Congo|XAF|242
CD|Democratic Republic of the Congo|CDF|243
CK|Cook Islands|NZD|682
CR|Costa Rica|CRC|506
CI|Côte d'Ivoire (Ivory Coast)|XOF|225
HR|Croatia|EUR|385
CU|Cuba|CUP|53
CW|Curaçao (Curacao)|ANG|599
CY|Cyprus|EUR|357
CZ|Czechia (Czech Republic)|CZK|420
DK|Denmark|DKK|45
DJ|Djibouti|DJF|253
DM|Dominica|XCD|1
DO|Dominican Republic|DOP|1
EC|Ecuador|USD|593
EG|Egypt|EGP|20
SV|El Salvador|USD|503
GQ|Equatorial Guinea|XAF|240
ER|Eritrea|ERN|291
EE|Estonia|EUR|372
SZ|Eswatini (Swaziland)|SZL|268
ET|Ethiopia|ETB|251
FK|Falkland Islands|FKP|500
FO|Faroe Islands|DKK|298
FJ|Fiji|FJD|679
FI|Finland|EUR|358
FR|France|EUR|33
GF|French Guiana|EUR|594
PF|French Polynesia|XPF|689
TF|French Southern Territories|EUR|262
GA|Gabon|XAF|241
GM|Gambia|GMD|220
GE|Georgia|GEL|995
DE|Germany|EUR|49
GH|Ghana|GHS|233
GI|Gibraltar|GIP|350
GR|Greece|EUR|30
GL|Greenland|DKK|299
GD|Grenada|XCD|1
GP|Guadeloupe|EUR|590
GU|Guam|USD|1
GT|Guatemala|GTQ|502
GG|Guernsey|GBP|44
GN|Guinea|GNF|224
GW|Guinea-Bissau|XOF|245
GY|Guyana|GYD|592
HT|Haiti|HTG|509
HM|Heard Island and McDonald Islands|AUD|672
VA|Vatican City (Holy See)|EUR|39
HN|Honduras|HNL|504
HK|Hong Kong|HKD|852
HU|Hungary|HUF|36
IS|Iceland|ISK|354
IN|India|INR|91
ID|Indonesia|IDR|62
IR|Iran|IRR|98
IQ|Iraq|IQD|964
IE|Ireland|EUR|353
IM|Isle of Man|GBP|44
IL|Israel|ILS|972
IT|Italy|EUR|39
JM|Jamaica|JMD|1
JP|Japan|JPY|81
JE|Jersey|GBP|44
JO|Jordan|JOD|962
KZ|Kazakhstan|KZT|7
KE|Kenya|KES|254
KI|Kiribati|AUD|686
XK|Kosovo|EUR|383
KW|Kuwait|KWD|965
KG|Kyrgyzstan|KGS|996
LA|Laos|LAK|856
LV|Latvia|EUR|371
LB|Lebanon|LBP|961
LS|Lesotho|LSL|266
LR|Liberia|LRD|231
LY|Libya|LYD|218
LI|Liechtenstein|CHF|423
LT|Lithuania|EUR|370
LU|Luxembourg|EUR|352
MO|Macao (Macau)|MOP|853
MG|Madagascar|MGA|261
MW|Malawi|MWK|265
MY|Malaysia|MYR|60
MV|Maldives|MVR|960
ML|Mali|XOF|223
MT|Malta|EUR|356
MH|Marshall Islands|USD|692
MQ|Martinique|EUR|596
MR|Mauritania|MRU|222
MU|Mauritius|MUR|230
YT|Mayotte|EUR|262
MX|Mexico|MXN|52
FM|Micronesia|USD|691
MD|Moldova|MDL|373
MC|Monaco|EUR|377
MN|Mongolia|MNT|976
ME|Montenegro|EUR|382
MS|Montserrat|XCD|1
MA|Morocco|MAD|212
MZ|Mozambique|MZN|258
MM|Myanmar (Burma)|MMK|95
NA|Namibia|NAD|264
NR|Nauru|AUD|674
NP|Nepal|NPR|977
NL|Netherlands|EUR|31
NC|New Caledonia|XPF|687
NZ|New Zealand|NZD|64
NI|Nicaragua|NIO|505
NE|Niger|XOF|227
NG|Nigeria|NGN|234
NU|Niue|NZD|683
NF|Norfolk Island|AUD|672
KP|North Korea|KPW|850
MK|North Macedonia|MKD|389
MP|Northern Mariana Islands|USD|1
NO|Norway|NOK|47
OM|Oman|OMR|968
PK|Pakistan|PKR|92
PW|Palau|USD|680
PS|Palestine|ILS|970
PA|Panama|USD|507
PG|Papua New Guinea|PGK|675
PY|Paraguay|PYG|595
PE|Peru|PEN|51
PH|Philippines|PHP|63
PN|Pitcairn Islands|NZD|64
PL|Poland|PLN|48
PT|Portugal|EUR|351
PR|Puerto Rico|USD|1
QA|Qatar|QAR|974
RE|Réunion (Reunion)|EUR|262
RO|Romania|RON|40
RU|Russia|RUB|7
RW|Rwanda|RWF|250
BL|Saint Barthélemy (Saint Barthelemy)|EUR|590
SH|Saint Helena, Ascension and Tristan da Cunha|SHP|290
KN|Saint Kitts and Nevis|XCD|1
LC|Saint Lucia|XCD|1
MF|Saint Martin|EUR|590
PM|Saint Pierre and Miquelon|EUR|508
VC|Saint Vincent and the Grenadines|XCD|1
WS|Samoa|WST|685
SM|San Marino|EUR|378
ST|São Tomé and Príncipe (Sao Tome)|STN|239
SA|Saudi Arabia|SAR|966
SN|Senegal|XOF|221
RS|Serbia|RSD|381
SC|Seychelles|SCR|248
SL|Sierra Leone|SLE|232
SG|Singapore|SGD|65
SX|Sint Maarten|ANG|1
SK|Slovakia|EUR|421
SI|Slovenia|EUR|386
SB|Solomon Islands|SBD|677
SO|Somalia|SOS|252
ZA|South Africa|ZAR|27
GS|South Georgia and the South Sandwich Islands|GBP|500
KR|South Korea|KRW|82
SS|South Sudan|SSP|211
ES|Spain|EUR|34
LK|Sri Lanka|LKR|94
SD|Sudan|SDG|249
SR|Suriname|SRD|597
SJ|Svalbard and Jan Mayen|NOK|47
SE|Sweden|SEK|46
CH|Switzerland|CHF|41
SY|Syria|SYP|963
TW|Taiwan|TWD|886
TJ|Tajikistan|TJS|992
TZ|Tanzania|TZS|255
TH|Thailand|THB|66
TL|Timor-Leste (East Timor)|USD|670
TG|Togo|XOF|228
TK|Tokelau|NZD|690
TO|Tonga|TOP|676
TT|Trinidad and Tobago|TTD|1
TN|Tunisia|TND|216
TR|Turkey|TRY|90
TM|Turkmenistan|TMT|993
TC|Turks and Caicos Islands|USD|1
TV|Tuvalu|AUD|688
UG|Uganda|UGX|256
UA|Ukraine|UAH|380
AE|United Arab Emirates|AED|971
GB|United Kingdom|GBP|44
US|United States|USD|1
UM|United States Minor Outlying Islands|USD|1
VI|US Virgin Islands|USD|1
UY|Uruguay|UYU|598
UZ|Uzbekistan|UZS|998
VU|Vanuatu|VUV|678
VE|Venezuela|VES|58
VN|Vietnam|VND|84
WF|Wallis and Futuna|XPF|681
EH|Western Sahara|MAD|212
YE|Yemen|YER|967
ZM|Zambia|ZMW|260
ZW|Zimbabwe|ZWG|263`;

export const ALL_COUNTRIES: CountryEntry[] = RAW_COUNTRIES.split("\n")
  .map((line) => line.split("|"))
  .map(([code, name, currency, dial]) => ({ code, name, currency, dialCode: "+" + dial }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** Same list under the name KycPage already imports. */
export const COUNTRIES_LIST = ALL_COUNTRIES;

// Other spellings, lowercase without accents or punctuation -> ISO code.
const ENTRY_ALIASES: Record<string, string> = {
  "uae": "AE",
  "uk": "GB",
  "great britain": "GB",
  "england": "GB",
  "scotland": "GB",
  "wales": "GB",
  "northern ireland": "GB",
  "usa": "US",
  "united states of america": "US",
  "america": "US",
  "turkiye": "TR",
  "ksa": "SA",
  "russian federation": "RU",
  "korea south": "KR",
  "republic of korea": "KR",
  "korea republic of": "KR",
  "korea north": "KP",
  "democratic peoples republic of korea": "KP",
  "ivory coast": "CI",
  "cote d ivoire": "CI",
  "czech republic": "CZ",
  "czechia": "CZ",
  "swaziland": "SZ",
  "eswatini": "SZ",
  "burma": "MM",
  "myanmar": "MM",
  "macedonia": "MK",
  "cape verde": "CV",
  "cabo verde": "CV",
  "east timor": "TL",
  "timor leste": "TL",
  "palestinian territories": "PS",
  "state of palestine": "PS",
  "palestinian territory": "PS",
  "vatican": "VA",
  "vatican city": "VA",
  "holy see": "VA",
  "the bahamas": "BS",
  "the gambia": "GM",
  "drc": "CD",
  "dr congo": "CD",
  "democratic republic of congo": "CD",
  "congo kinshasa": "CD",
  "congo brazzaville": "CG",
  "congo republic": "CG",
  "congo": "CG",
  "hong kong sar": "HK",
  "macau": "MO",
  "macao": "MO",
  "macao sar": "MO",
  "viet nam": "VN",
  "lao pdr": "LA",
  "syrian arab republic": "SY",
  "iran islamic republic of": "IR",
  "islamic republic of iran": "IR",
  "brunei darussalam": "BN",
  "moldova republic of": "MD",
  "republic of moldova": "MD",
  "tanzania united republic of": "TZ",
  "united republic of tanzania": "TZ",
  "micronesia federated states of": "FM",
  "federated states of micronesia": "FM",
  "bolivia plurinational state of": "BO",
  "venezuela bolivarian republic of": "VE",
  "st kitts and nevis": "KN",
  "st lucia": "LC",
  "st vincent and the grenadines": "VC",
  "sao tome and principe": "ST",
  "netherlands the": "NL",
  "holland": "NL",
  "taiwan province of china": "TW",
  "china hong kong": "HK",
  "saint helena": "SH",
  "pitcairn": "PN",
  "us virgin islands": "VI",
  "virgin islands us": "VI",
  "british virgin islands": "VG",
  "virgin islands british": "VG",
  "falklands": "FK",
  "reunion": "RE",
  "curacao": "CW",
  "aland islands": "AX",
  "aland": "AX",
  "saint barthelemy": "BL",
  "st barthelemy": "BL",
};

function normName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const ENTRY_INDEX: Record<string, CountryEntry> = {};
for (const c of ALL_COUNTRIES) {
  ENTRY_INDEX[normName(c.name)] = c;
  ENTRY_INDEX[normName(c.name.replace(/\s*\(.*\)\s*$/, ""))] = c; // name without the "(alternate)" part
  ENTRY_INDEX[c.code.toLowerCase()] = c;
}
for (const [alias, code] of Object.entries(ENTRY_ALIASES)) {
  const hit = ALL_COUNTRIES.find((c) => c.code === code);
  if (hit) ENTRY_INDEX[alias] = hit;
}

export function getCountryEntry(countryName: string | null | undefined): CountryEntry | null {
  const key = normName(countryName ?? "");
  return key ? ENTRY_INDEX[key] ?? null : null;
}

export function getCountryProfile(countryName: string | null | undefined): CountryProfile {
  const key = (countryName ?? "").trim().toLowerCase();
  if (!key) return GLOBAL_PROFILE;
  const entry = getCountryEntry(countryName);
  const curated =
    PROFILES[ALIASES[key] ?? key] ??
    (entry ? PROFILES[entry.name.replace(/\s*\(.*\)\s*$/, "").toLowerCase()] : undefined);
  const base = curated ?? GLOBAL_PROFILE;
  // every known country gets its own currency and phone prefix, even without curated wording
  return entry ? { ...base, currency: entry.currency, dialCode: entry.dialCode } : base;
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
  // added so every country has a rate (approximate, REVIEW before launch)
  ALL: 0.3286, ANG: 0.006393, AOA: 3.286, ARS: 5.357, AWG: 0.006429, BAM: 0.006071,
  BBD: 0.007143, BIF: 10.54, BMD: 0.003571, BND: 0.004643, BOB: 0.02464, BSD: 0.003571,
  BTN: 0.3143, BZD: 0.007143, CDF: 8.214, CLP: 3.393, COP: 14.29, CRC: 1.786,
  CUP: 0.08571, CVE: 0.35, DJF: 0.6357, DOP: 0.225, ERN: 0.05357, FJD: 0.008036,
  FKP: 0.002714, GIP: 0.002714, GMD: 0.2571, GNF: 31.07, GTQ: 0.0275, GYD: 0.7464,
  HNL: 0.09286, HTG: 0.4679, IQD: 4.679, IRR: 3571, ISK: 0.4464, JMD: 0.5643,
  KGS: 0.3107, KMF: 1.5, KPW: 3.214, KYD: 0.002964, LBP: 319.6, LRD: 0.6786,
  LSL: 0.06429, MDL: 0.06071, MGA: 16.07, MKD: 0.1893, MOP: 0.02857, MRU: 0.1429,
  MVR: 0.055, MZN: 0.2286, NAD: 0.06429, NIO: 0.1314, PEN: 0.0125, PGK: 0.015,
  PYG: 26.79, SBD: 0.03, SHP: 0.002714, SLE: 0.08214, SOS: 2.039, SRD: 0.1357,
  SSP: 16.07, STN: 0.075, SYP: 46.43, SZL: 0.06429, TJS: 0.03321, TMT: 0.0125,
  TOP: 0.008571, TTD: 0.02429, UYU: 0.1429, VES: 0.8929, VUV: 0.4286, WST: 0.009643,
  XAF: 2, XCD: 0.009643, XOF: 2, XPF: 0.3643, YER: 5.357, ZWG: 0.09643,
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
