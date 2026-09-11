import { x as useParams, u as useNavigate, e as useAuth, r as reactExports, y as getFeedbackForCase, z as getCaseById, A as getCaseUnlock, B as getUserUnlockCount, C as getCaseResolutions, D as getKycSubmission, a as getProfile, b as getWallet, p as ue, l as jsxRuntimeExports, R as RefreshCw, E as insertCaseUnlock, F as insertCaseResolution, G as updateCaseResolution, I as insertFeedback, J as uploadFileToStorage } from "./main-EspZtMZv.js";
import { L as Layout } from "./Layout-wYZkEQhc.js";
import { B as Button } from "./button-BrpTixLc.js";
import { I as Input } from "./input-DprFI1f6.js";
import { L as Label } from "./label-DOzeUvXs.js";
import { T as Textarea } from "./textarea-BqlLZurF.js";
import { a as sendNotification } from "./notify-dkf7JWdC.js";
import { s as shareCase } from "./caseSharing-DzTdnRpU.js";
import { i as isContributionResolution, a as isTrulyCompletedHelp } from "./resolutionStatus-DHDdhFyW.js";
import { C as ChevronLeft } from "./chevron-left-2OUBR-Qm.js";
import { C as CircleX } from "./circle-x-B0-Jayhr.js";
import { C as CircleAlert } from "./circle-alert-CI1fNXYv.js";
import { C as CalendarClock } from "./calendar-clock-BHBWcgCV.js";
import { E as Eye } from "./eye-BF5sercH.js";
import { M as MapPin } from "./map-pin-C91oi1yI.js";
import { S as Share2 } from "./share-2-CjdTjd5b.js";
import { C as CircleCheck } from "./circle-check-BPQn3gNr.js";
import { F as FileText } from "./file-text-BcVokOSk.js";
import { S as Star } from "./star-DmS7G2ro.js";
import { V as Video } from "./video-BvcVw5TN.js";
import { b as Lock } from "./message-circle-CqePZOv0.js";
import { H as Heart } from "./heart-CaEhMUxo.js";
import { B as Building2 } from "./building-2-BVCM5BrX.js";
import { E as ExternalLink } from "./external-link-C_0p3t5T.js";
import { L as LockOpen } from "./lock-open-CgD6KL-6.js";
import { H as HandCoins } from "./hand-coins-Dd8RmQaF.js";
import { C as Copy } from "./copy-D4uu5b68.js";
import { C as Clock } from "./clock-mK-y2hDF.js";
import "./users-_6SD4cVf.js";
import "./x-Br49mtL5.js";
import "./index-o8esZfzI.js";
const DOCUMENT_LABELS = {
  bill: "Bill Verification",
  rent_bill: "Rent Bill Verification",
  rental_agreement: "Rental Agreement Verification",
  landlord_cnic: "Landlord CNIC Verification",
  birth_certificate: "Birth Certificate Verification",
  b_form: "B-Form Verification",
  b_form_id: "B-Form / ID Verification",
  family_tree: "Family Tree Verification",
  income_proof: "Income Proof Verification",
  admission_proof: "Admission Proof Verification",
  fee_challan: "Fee Challan Verification",
  student_id: "Student ID Verification",
  student_id_proof: "Student ID Verification",
  books_quotation: "Books Quotation Verification",
  uniform_quotation: "Uniform Quotation Verification",
  uniform_items: "Uniform Items Verification",
  doctor_prescription: "Doctor Prescription Verification",
  medical_report: "Medical Report Verification",
  disability_cnic: "Disability CNIC Verification",
  disability_photo: "Disability Photo Verification",
  product_receipt: "Product Receipt Verification",
  death_certificate: "Death Certificate Verification",
  police_report: "Police Report Verification"
};
function humanizeKey(value) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function documentLabel(key) {
  const normalized = key.toLowerCase().replace(/[-\s]+/g, "_");
  return DOCUMENT_LABELS[normalized] || `${humanizeKey(key)} Verification`;
}
function addUnique(items, seen, label, source) {
  if (typeof label !== "string" || !label.trim()) return;
  const cleanLabel = label.trim();
  const key = cleanLabel.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (!key || seen.has(key)) return;
  seen.add(key);
  items.push({ label: cleanLabel, source });
}
function hasFileValue(value) {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasFileValue);
  if (!value || typeof value !== "object") return Boolean(value);
  const record = value;
  if (record.url || record.file_url || record.download_url || record.href || record.path || record.original_name || record.filename || record.name) return true;
  return Object.values(record).some(hasFileValue);
}
function collectDocumentContainer(value, key, items, seen) {
  if (!hasFileValue(value)) return;
  if (Array.isArray(value)) {
    value.forEach((entry) => collectDocumentContainer(entry, key, items, seen));
    return;
  }
  if (value && typeof value === "object") {
    const record = value;
    const hasDirectFile = Boolean(record.url || record.file_url || record.download_url || record.href || record.path);
    if (hasDirectFile || record.original_name || record.filename || record.name) {
      const fileName = record.original_name || record.filename || record.name;
      const fileKey = typeof fileName === "string" ? fileName.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() : "";
      if (fileKey && seen.has(fileKey)) return;
      const recordKey = typeof record.key === "string" ? record.key : typeof record.field === "string" ? record.field : key;
      addUnique(items, seen, documentLabel(recordKey), "document");
      if (fileKey) seen.add(fileKey);
      return;
    }
    Object.entries(record).forEach(([childKey, childValue]) => collectDocumentContainer(childValue, childKey, items, seen));
    return;
  }
  addUnique(items, seen, documentLabel(key), "document");
}
function getApprovedCaseItems(caseData) {
  const items = [];
  const seen = /* @__PURE__ */ new Set();
  if (Array.isArray(caseData.photo_urls) && caseData.photo_urls.some(Boolean)) {
    addUnique(items, seen, "Case Photos", "media");
  }
  if (caseData.selfie_url) addUnique(items, seen, "Live Selfie", "media");
  if (caseData.video_url) addUnique(items, seen, "Video Statement", "media");
  const rawDetails = caseData.category_details ?? caseData.categoryDetails ?? caseData.documents ?? caseData.verification_documents;
  let details = {};
  let detailList = null;
  if (Array.isArray(rawDetails)) {
    detailList = rawDetails;
  } else if (rawDetails && typeof rawDetails === "object") {
    details = rawDetails;
  } else if (typeof rawDetails === "string") {
    try {
      const parsed = JSON.parse(rawDetails);
      if (Array.isArray(parsed)) detailList = parsed;
      else if (parsed && typeof parsed === "object") details = parsed;
    } catch {
    }
  }
  if (detailList) collectDocumentContainer(detailList, "document", items, seen);
  const containerKeys = /* @__PURE__ */ new Set(["_documents", "edu_documents", "documents", "uploaded_documents", "verification_documents"]);
  for (const [key, value] of Object.entries(details)) {
    if (containerKeys.has(key)) continue;
    collectDocumentContainer(value, key, items, seen);
  }
  for (const containerKey of containerKeys) {
    if (details[containerKey] != null) {
      collectDocumentContainer(details[containerKey], containerKey === "_documents" ? "document" : containerKey, items, seen);
    }
  }
  for (const key of Object.keys(DOCUMENT_LABELS)) {
    if (caseData[key] != null) collectDocumentContainer(caseData[key], key, items, seen);
  }
  return items;
}
const GRATITUDE = {
  "Electricity Bill": { direct: "You cleared this family's electricity bill of {amount}. Their home is lit again because of you. May Allah light up your life just the same. 🤲", contribution: "Your contribution of {amount} brought this family closer to keeping the lights on. Every rupee matters. Keep being a hero! 🤲", unlock: "You unlocked this case and took the first step of a hero's journey. Browse more cases and turn your kindness into complete help! 💪" },
  "Gas Bill": { direct: "You paid this family's gas bill of {amount} — a warm home and a warm meal, because of you. May your own home always be filled with warmth. 🤲", contribution: "Your contribution of {amount} helped keep this family's home warm this month. Small acts, huge mercy. 🤲", unlock: "You took the first step by unlocking this case. Don't stop here — your next case is waiting for a hero like you!" },
  "Water Bill": { direct: "You settled this family's water bill of {amount}. Clean water flows because of your generosity. May Allah bless your every need. 🤲", contribution: "Your {amount} contribution helped this family access clean water. Blessed are those who give water to the thirsty. 🤲", unlock: "You unlocked this case — the beginning of a hero's journey. Browse more cases and complete the mission!" },
  "House Rent": { direct: "You paid this family's rent of {amount}. They will live peacefully in their home for another month because of you. May your own home always be protected. 🤲", contribution: "Your contribution of {amount} helped this family keep their roof this month. You are part of their shelter. 🤲", unlock: "You unlocked this case and gave hope to a struggling family. Now browse and complete a full act of kindness!" },
  "School Fees": { direct: "You paid {amount} of school fees. A child's education continues because of you. May Allah grant you knowledge and blessings in return. 🤲", contribution: "Your contribution of {amount} keeps a child in school. Every rupee is a seed of a brighter future. 🤲", unlock: "By unlocking this case, you opened the door to a child's education. Walk through and finish what you started!" },
  "Education & Books": { direct: "You provided {amount} towards education and books. Knowledge reached a deserving mind because of you. May your own mind always stay blessed. 🤲", contribution: "Your {amount} contribution put books in a learner's hands. Invest in knowledge, and you invest in generations. 🤲", unlock: "You unlocked this case — now complete the journey and put real books in real hands!" },
  "Medical & Treatment": { direct: "You paid {amount} for medical treatment. A life received care because of your mercy. May Allah heal you in your time of need. 🤲", contribution: "Your contribution of {amount} went towards saving a life. In helping the sick, you healed your own soul. 🤲", unlock: "You unlocked a medical case — a brave first step. Now don't let this patient wait; complete your help!" },
  "Medicines": { direct: "You paid {amount} for medicines. Pain was relieved and health restored because of you. May Allah grant you perfect health. 🤲", contribution: "Your {amount} contribution bought essential medicines for someone in pain. A simple act, a mountain of reward. 🤲", unlock: "You unlocked this case and gave a patient hope. Complete your mission — buy the medicine that saves the day!" },
  "Food & Groceries": { direct: "You provided {amount} worth of food to a hungry family. No one slept hungry tonight because of you. May your own table always be full. 🤲", contribution: "Your {amount} contribution filled a family's kitchen for days. Feeding the hungry is the highest charity. 🤲", unlock: "You unlocked this case — the first step to feeding a family. Continue and let no plate stay empty!" },
  "Child Support": { direct: "You supported a child with {amount}. A child smiles and sleeps safely because of you. May Allah protect your own children. 🤲", contribution: "Your contribution of {amount} supported an innocent child in need. The Prophet (PBUH) said: the best house is one where orphans are cared for. 🤲", unlock: "You unlocked this case and became a child's hope. Finish strong — turn that hope into real support!" },
  "Widow & Elderly Support": { direct: "You supported a widow or elderly person with {amount}. Their dignity and comfort were preserved because of you. May Allah honor you in return. 🤲", contribution: "Your {amount} contribution brought comfort to a widow or elder. Serving the helpless is serving Allah. 🤲", unlock: "You unlocked this case for a widow or elder — a blessed start. Complete your help and be their strength!" },
  "Home Repair": { direct: "You paid {amount} for home repair. A family now lives in a safer home because of you. May your own home be a fortress of peace. 🤲", contribution: "Your contribution of {amount} helped repair a damaged home. You rebuilt a family's shelter. 🤲", unlock: "You unlocked this repair case — the first brick of a hero's work. Lay the rest and finish the house!" },
  "Disability Support": { direct: "You supported a person with disability by {amount}. Their burden was lightened because of your compassion. May Allah grant you strength. 🤲", contribution: "Your {amount} contribution supported someone living with disability. True heroes lift those who need it most. 🤲", unlock: "You unlocked this case — you saw a need others missed. See it through and be their helping hand!" },
  "Marriage Support": { direct: "You contributed {amount} towards a marriage. A family's joy was completed because of you. May Allah bless your own happiness. 🤲", contribution: "Your {amount} contribution helped make a wedding possible. Sharing in joy is sharing in reward. 🤲", unlock: "You unlocked this case to help a family celebrate. Continue and be part of their happiest day!" },
  "Business / Work Help": { direct: "You invested {amount} in someone's work and livelihood. A family now earns with dignity because of you. May your own rizq multiply. 🤲", contribution: "Your {amount} contribution helped a small business or work opportunity survive. Helping someone earn is helping them forever. 🤲", unlock: "You unlocked this livelihood case — the first step to someone's independence. Complete it and change a family's future!" },
  "Funeral Expenses": { direct: "You paid {amount} towards funeral expenses. A family buried their loved one with dignity because of your mercy. May Allah forgive your sins. 🤲", contribution: "Your {amount} contribution helped honor a departed soul and ease a grieving family. The reward of this charity is immense. 🤲", unlock: "You unlocked this case in a family's hardest moment. See it through — they will never forget your kindness." },
  "Livestock / Farming": { direct: "You supported farming/livestock with {amount}. A farmer's hope grows again because of you. May your own harvest be abundant. 🤲", contribution: "Your {amount} contribution helped a farmer keep their livestock. Feeding the nation starts with people like you. 🤲", unlock: "You unlocked this farming case — plant the seed of help and watch it grow. Complete your support!" },
  "Debt Relief": { direct: "You paid {amount} to relieve someone's debt. A heavy burden was lifted from their shoulders because of you. May Allah relieve your own burdens. 🤲", contribution: "Your {amount} contribution helped free someone from the weight of debt. Relieving debtors is among the most beloved deeds. 🤲", unlock: "You unlocked this debt-relief case — you chose mercy. Complete it and free a family from worry!" },
  "Emergency Help": { direct: "You provided {amount} in an emergency. In their darkest hour, you became their light. May Allah be your shield in emergencies. 🤲", contribution: "Your {amount} contribution arrived exactly when it was needed most. Heroes are made in moments like this. 🤲", unlock: "You unlocked this emergency case at a critical time. Don't stop — your help may be the lifeline they need!" },
  "Other": { direct: "You helped with {amount} in a time of need. Your silent generosity changed a life. May Allah reward you beyond measure. 🤲", contribution: "Your contribution of {amount} made a real difference. Every act of kindness counts. Keep going! 🤲", unlock: "You unlocked this case and chose to care. Step forward and turn your care into complete help!" }
};
const FALLBACK = {
  direct: "Thank you for completing direct help of {amount}! Because of your generosity a family's burden has been lifted. May Allah bless you! 🤲",
  contribution: "Your generous contribution of {amount} helped complete this case! Combined with other heroes, you brought real relief. Keep being a hero! 🤲",
  unlock: "You unlocked this case and took the first step of a hero's journey. Don't lose hope — browse more cases and make a difference! 💪"
};
function getCategoryGratitude(category) {
  const key = typeof category === "string" && Object.prototype.hasOwnProperty.call(GRATITUDE, category) ? category : "";
  return key ? GRATITUDE[key] : FALLBACK;
}
const CURRENCY_SYMBOLS = {
  USD: "$",
  PKR: "Rs",
  SAR: "SAR",
  AED: "AED",
  GBP: "£",
  EUR: "€",
  INR: "₹",
  TRY: "₺",
  BDT: "৳",
  EGP: "E£",
  NGN: "₦",
  KES: "KSh",
  ZAR: "R",
  BRL: "R$",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  IDR: "Rp",
  MYR: "RM",
  THB: "฿",
  PHP: "₱",
  VND: "₫",
  SGD: "S$",
  AFN: "؋",
  NPR: "Rs",
  LKR: "Rs",
  QAR: "QAR",
  KWD: "KWD",
  BHD: "BHD",
  OMR: "OMR",
  JOD: "JOD",
  MAD: "MAD"
};
const GIVETHRA_NAYAPAY_TITLE = "Shoaib Ahmed";
const GIVETHRA_NAYAPAY_IBAN = "PK93NAYA1234503331641604";
const GIVETHRA_USDT_TRC20 = "TNjaCQjQ5Yzm5tiVF8s121rUv5BH7y6hAC";
function maskCnic(cnic) {
  if (!cnic) return "—";
  const digits = cnic.replace(/\D/g, "");
  if (digits.length < 6) return cnic;
  digits.slice(0, 6);
  "*".repeat(Math.max(digits.length - 6, 4));
  return `${digits.slice(0, 4)}${"*".repeat(Math.max(digits.length - 4, 4))}`;
}
function maskAccount(acc) {
  if (!acc) return "—";
  const d = acc.replace(/\s/g, "");
  if (d.length <= 4) return acc;
  const last = d.slice(-4);
  return `${"*".repeat(Math.max(d.length - 4, 4))}${last}`;
}
function copyToClipboard(text, label) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(
    () => ue.success(`${label} copied!`),
    () => ue.error("Copy failed")
  );
}
function getEligibleAffidavitResolutions(resolutions) {
  return resolutions.filter(isTrulyCompletedHelp);
}
function getHeroBadgeForCase(verifiedResolutions) {
  const hasDirect = verifiedResolutions.some((r) => !isContributionResolution(r));
  const hasContribution = verifiedResolutions.some((r) => isContributionResolution(r));
  if (hasDirect && hasContribution) return { label: "Super Hero", emoji: "🦸‍♂️" };
  if (hasDirect) return { label: "Hero", emoji: "🦸" };
  if (hasContribution) return { label: "Young Hero", emoji: "🌱" };
  return { label: "Newborn Hero", emoji: "🐣" };
}
function generateAffidavit(caseData, resolution, seekerKyc, heroName) {
  const caseId = (caseData.id ?? "").slice(0, 8).toUpperCase();
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString();
  const seekerName = (resolution == null ? void 0 : resolution.seeker_name) || (seekerKyc == null ? void 0 : seekerKyc.full_name) || caseData.full_name || "Verified Help Seeker";
  maskCnic(resolution == null ? void 0 : resolution.hero_cnic_number);
  (resolution == null ? void 0 : resolution.hero_name) || heroName;
  const country = caseData.country || (resolution == null ? void 0 : resolution.case_country) || "";
  const location = [caseData.city || (resolution == null ? void 0 : resolution.case_city), country].filter(Boolean).join(", ");
  const participantType = (resolution == null ? void 0 : resolution.resolution_type) || "—";
  (resolution == null ? void 0 : resolution.case_account_number) || caseData.account_number || "";
  const seekerCnic = maskCnic(seekerKyc == null ? void 0 : seekerKyc.cnic_number);
  const completedDate = (resolution == null ? void 0 : resolution.completed_at) ? new Date(resolution.completed_at).toLocaleDateString() : today;
  const verifyCode = `GVT-${caseId}-${Date.now().toString(36).toUpperCase()}`;
  const cur = caseData.currency || "USD";
  const sym = CURRENCY_SYMBOLS[cur] ?? cur;
  const paidAmount = (resolution == null ? void 0 : resolution.seeker_confirmed_amount) ?? (resolution == null ? void 0 : resolution.amount_paid);
  const isFundraising = (resolution == null ? void 0 : resolution.paid_to) === "givethra";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Givethra Affidavit - ${caseId}</title>
<style>
body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px;color:#1a1a1a;line-height:1.7}
.header{text-align:center;border-bottom:3px solid #03707B;padding-bottom:20px;margin-bottom:25px}
.logo{width:54px;height:54px;background:#03707B;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:bold}
h1{color:#03707B;font-size:24px;margin:12px 0 4px;letter-spacing:1px}
.subtitle{color:#666;font-size:13px}
.seal{display:inline-block;border:2px solid #03707B;border-radius:30px;padding:6px 16px;color:#03707B;font-size:11px;font-weight:bold;margin-top:10px;letter-spacing:.5px}
.intro{font-size:13.5px;text-align:justify;margin:18px 0}
.section{margin:22px 0}
.section h2{font-size:14px;color:#03707B;border-bottom:1px solid #ddd;padding-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.row{display:flex;justify-content:space-between;padding:5px 0;font-size:13.5px;border-bottom:1px dotted #eee}
.row .label{color:#666}
.row .value{font-weight:bold;text-align:right}
.note{background:#f0f9fa;border-left:4px solid #03707B;padding:10px 14px;margin:14px 0;font-size:12px;color:#444}
.declaration{background:#f7f7f7;border-left:4px solid #999;padding:12px 15px;margin:12px 0;font-size:12.5px;font-style:italic}
.signatures{display:flex;justify-content:space-between;margin-top:45px}
.sig-box{width:45%;text-align:center}
.sig-line{border-top:2px solid #333;margin-top:40px;padding-top:8px;font-size:12.5px;font-weight:bold}
.footer{text-align:center;margin-top:35px;padding-top:18px;border-top:1px solid #ddd;font-size:10.5px;color:#999}
.verify{text-align:center;margin:18px 0;font-family:monospace;font-size:11px;color:#03707B;background:#f0f9fa;padding:10px;border-radius:8px}
@media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div class="logo">G+</div>
  <h1>AFFIDAVIT OF ASSISTANCE</h1>
  <div class="subtitle">Givethra — Verified Help. Real Impact.</div>
  <div class="seal">✓ DIGITALLY VERIFIED</div>
</div>

<p class="intro">This affidavit certifies that, through the <strong>Givethra</strong> platform, a verified act of assistance was completed between the parties named below, with mutual consent and confirmation. Personal identifiers are partially masked to protect privacy; full records are retained securely by Givethra and released only upon a formal audit or dispute.</p>

<div class="section">
  <h2>Case Information</h2>
  <div class="row"><span class="label">Case ID</span><span class="value">GVT-${caseId}</span></div>
  <div class="row"><span class="label">Category</span><span class="value">${caseData.category || "—"}</span></div>
  <div class="row"><span class="label">Title</span><span class="value">${caseData.title || "—"}</span></div>
  <div class="row"><span class="label">Location</span><span class="value">${caseData.city || ""}, ${caseData.country || ""}</span></div>
  <div class="row"><span class="label">Date Issued</span><span class="value">${today}</span></div>
</div>

<div class="section">
  <h2>Help Seeker — ${seekerName}</h2>
  <div>${seekerName}</div>
  <div class="row"><span class="label">Full Name</span><span class="value">${seekerName}</span></div>
  <div class="row"><span class="label">CNIC (partially masked)</span><span class="value">${seekerCnic}</span></div>
  <div class="row"><span class="label">Location</span><span class="value">${location}</span></div>
  <div class="row"><span class="label">Type / Category</span><span class="value">${participantType}</span></div>
  <div class="row"><span class="label">Country</span><span class="value">${caseData.country || "—"}</span></div>
  <div class="note">Note: Only the first 4 CNIC digits are shown. Remaining digits and contact details are kept private.</div>
</div>

<div class="section">
  <h2>${isFundraising ? "Contribution Details" : "Institute / Provider Paid"}</h2>
  ${isFundraising ? `<div class="row"><span class="label">Contributed Via</span><span class="value">Givethra Fundraising</span></div>
       <div class="row"><span class="label">For Institute</span><span class="value">${caseData.institute_name || "—"}</span></div>` : `<div class="row"><span class="label">Institute / Provider</span><span class="value">${caseData.institute_name || "—"}</span></div>
       <div class="row"><span class="label">Payment Method</span><span class="value">${caseData.payment_method || "—"}</span></div>
       <div class="row"><span class="label">Account / Reference (masked)</span><span class="value">${maskAccount(caseData.account_number)}</span></div>`}
</div>

<div class="section">
  <h2>Resolution Details</h2>
  <div class="row"><span class="label">Helped By (Hero)</span><span class="value">${heroName || "Verified Hero"}</span></div>
  <div class="row"><span class="label">Type</span><span class="value">${(resolution == null ? void 0 : resolution.resolution_type) || "—"}</span></div>
  <div class="row"><span class="label">Amount Provided</span><span class="value">${paidAmount ? sym + " " + paidAmount + " " + cur : "—"}</span></div>
  <div class="row"><span class="label">Completion Date</span><span class="value">${completedDate}</span></div>
</div>

<div class="section">
  <h2>Declarations</h2>
  <div class="declaration"><strong>Help Seeker:</strong> "I confirm that I have received the assistance described above through the Givethra platform, and that all information I provided was true and accurate."</div>
  <div class="declaration"><strong>Hero (Helper):</strong> "I, ${heroName || "the helper"}, confirm that I provided the assistance described above ${isFundraising ? "through Givethra's fundraising for this case" : "directly to the institute"}, willingly and in good faith."</div>
  <div class="note">By accepting this resolution, both parties agree this matter is fully and finally settled. Neither party shall contact or solicit the other outside Givethra. Disputes must be raised through Givethra's official audit process.</div>
</div>

<div class="signatures">
  <div class="sig-box"><div class="sig-line">Help Seeker</div><div style="font-size:11px;color:#666;">Digitally Confirmed</div></div>
  <div class="sig-box"><div class="sig-line">${heroName || "Hero (Helper)"}</div><div style="font-size:11px;color:#666;">Digitally Confirmed</div></div>
</div>

<div class="verify">Verification Code: ${verifyCode}<br>Issued by Givethra · givethra.org</div>

<div class="footer">
  This is a digitally generated affidavit issued by Givethra.<br>
  © ${(/* @__PURE__ */ new Date()).getFullYear()} Givethra · Verified Help. Real Impact.
</div>
<script>window.onload=()=>window.print();<\/script>
</body></html>`;
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  } else ue.error("Please allow pop-ups to download the affidavit.");
}
function CopyRow({ label, value, mono }) {
  if (!value) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 py-2 border-b border-border last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-medium text-foreground truncate ${mono ? "font-mono" : ""}`, children: value })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => copyToClipboard(value, label),
        className: "shrink-0 h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors",
        "aria-label": `Copy ${label}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" })
      }
    )
  ] });
}
function CaseDetailPage() {
  var _a;
  const { id } = useParams({ from: "/cases/$id" });
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [caseData, setCaseData] = reactExports.useState(null);
  const [seekerKyc, setSeekerKyc] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [unlocked, setUnlocked] = reactExports.useState(false);
  const [unlocking, setUnlocking] = reactExports.useState(false);
  const [showResolution, setShowResolution] = reactExports.useState(false);
  const [myResolutions, setMyResolutions] = reactExports.useState([]);
  const [myUnlock, setMyUnlock] = reactExports.useState(null);
  const [mediaUnlocked, setMediaUnlocked] = reactExports.useState(false);
  const [mediaUnlocking, setMediaUnlocking] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [heroName, setHeroName] = reactExports.useState("Verified Hero");
  const [payMode, setPayMode] = reactExports.useState("choose");
  const [contributionOpen, setContributionOpen] = reactExports.useState(false);
  const [pledgeAmount, setPledgeAmount] = reactExports.useState("");
  const [resType, setResType] = reactExports.useState("");
  const [amountPaid, setAmountPaid] = reactExports.useState("");
  const [txId, setTxId] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [receiptFile, setReceiptFile] = reactExports.useState(null);
  const [receiptName, setReceiptName] = reactExports.useState("");
  const [existingFeedback, setExistingFeedback] = reactExports.useState(null);
  const [fbText, setFbText] = reactExports.useState("");
  const [fbVideoFile, setFbVideoFile] = reactExports.useState(null);
  const [fbVideoName, setFbVideoName] = reactExports.useState("");
  const [fbVideoBlob, setFbVideoBlob] = reactExports.useState(null);
  const [fbSubmitting, setFbSubmitting] = reactExports.useState(false);
  const [recording, setRecording] = reactExports.useState(false);
  const [paused, setPaused] = reactExports.useState(false);
  const [recTimer, setRecTimer] = reactExports.useState(0);
  const [videoDuration, setVideoDuration] = reactExports.useState(0);
  const [stream, setStream] = reactExports.useState(null);
  const liveVideoRef = reactExports.useRef(null);
  const mediaRecorderRef = reactExports.useRef(null);
  const videoChunksRef = reactExports.useRef([]);
  const timerRef = reactExports.useRef(null);
  const [userUnlockCount, setUserUnlockCount] = reactExports.useState(0);
  const [walletBalance, setWalletBalance] = reactExports.useState(0);
  const [walletLoading, setWalletLoading] = reactExports.useState(true);
  const isFirstThreeUnlocks = userUnlockCount < 3;
  reactExports.useEffect(() => {
    loadCase();
  }, [id, user]);
  reactExports.useEffect(() => {
    if ((caseData == null ? void 0 : caseData.id) && (user == null ? void 0 : user.id)) {
      checkExistingFeedback();
    }
  }, [caseData, user]);
  reactExports.useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stream]);
  async function checkExistingFeedback() {
    if (!(user == null ? void 0 : user.id) || !(caseData == null ? void 0 : caseData.id)) return;
    try {
      const data = await getFeedbackForCase(caseData.id, user.id);
      setExistingFeedback(data);
    } catch (err) {
      console.error("Error checking feedback:", err);
    }
  }
  async function handleCaseShare() {
    if (!caseData) return;
    const result = await shareCase(caseData);
    if (result === "shared") ue.success("Case shared!");
    else if (result === "copied") ue.success("Case message and link copied!");
  }
  async function loadCase() {
    setLoading(true);
    try {
      const data = await getCaseById(id);
      setCaseData(data);
      if (user && data) {
        const owner = data.user_id === user.id;
        const results = await Promise.allSettled([
          getCaseUnlock(id, user.id, "full"),
          getCaseUnlock(id, user.id, "partial"),
          getCaseUnlock(id, user.id, "media"),
          getUserUnlockCount(user.id),
          getCaseResolutions(id, user.id),
          getKycSubmission(data.user_id),
          getProfile(user.id)
        ]);
        const [fullUnlock, contributionUnlock, mediaUnlock, count, res, kyc, prof] = results.map((r) => r.status === "fulfilled" ? r.value : null);
        const activeUnlock2 = fullUnlock || contributionUnlock || null;
        setMyUnlock(activeUnlock2);
        setUnlocked(!!activeUnlock2 || owner);
        setContributionOpen(!!contributionUnlock);
        setPayMode(contributionUnlock ? "partial" : fullUnlock ? "full" : "choose");
        setMediaUnlocked(!!mediaUnlock || !!fullUnlock || owner);
        setUserUnlockCount(count ?? 0);
        const loadedResolutions2 = (res ?? []).slice().reverse();
        setMyResolutions(loadedResolutions2);
        setShowResolution(Boolean(activeUnlock2 && loadedResolutions2.length === 0));
        setSeekerKyc(kyc);
        const nm = ((prof == null ? void 0 : prof.full_name) || "").split(" ")[0];
        if (nm) setHeroName(nm);
        setWalletLoading(true);
        try {
          const wallet = await getWallet(user.id);
          setWalletBalance(Number((wallet == null ? void 0 : wallet.balance) ?? 0));
        } catch {
          setWalletBalance(0);
        } finally {
          setWalletLoading(false);
        }
      }
    } catch (err) {
      console.error("Error loading case:", err);
      ue.error("Failed to load case details.");
    } finally {
      setLoading(false);
    }
  }
  async function uploadFile(file, path) {
    return await uploadFileToStorage(file, path);
  }
  async function startRecording() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: { ideal: 1 },
          sampleRate: { ideal: 48e3 }
        }
      });
      setStream(s);
      setRecording(true);
      setPaused(false);
      setRecTimer(0);
      setVideoDuration(0);
      setFbVideoBlob(null);
      setFbVideoFile(null);
      setFbVideoName("");
      setTimeout(() => {
        if (liveVideoRef.current) liveVideoRef.current.srcObject = s;
      }, 100);
      const preferredMimeType = "video/webm;codecs=vp8,opus";
      const mimeType = typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(preferredMimeType) ? preferredMimeType : "video/webm";
      const recorder = new MediaRecorder(s, {
        mimeType,
        videoBitsPerSecond: 15e5,
        audioBitsPerSecond: 128e3
      });
      mediaRecorderRef.current = recorder;
      videoChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        setVideoDuration(recTimer);
        const recordedType = recorder.mimeType || mimeType;
        const blob = new Blob(videoChunksRef.current, { type: recordedType });
        setFbVideoFile(new File([blob], "feedback.webm", { type: recordedType }));
        setFbVideoBlob(URL.createObjectURL(blob));
        setFbVideoName("feedback.webm");
        s.getTracks().forEach((t) => t.stop());
        setStream(null);
        setRecording(false);
        setPaused(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };
      recorder.start();
      timerRef.current = setInterval(() => {
        setRecTimer((prev) => {
          if (prev + 1 >= 90) {
            stopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1e3);
    } catch {
      ue.error("Camera/microphone access denied.");
    }
  }
  function pauseRecording() {
    const r = mediaRecorderRef.current;
    if (r && r.state === "recording") {
      r.pause();
      setPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }
  function resumeRecording() {
    const r = mediaRecorderRef.current;
    if (r && r.state === "paused") {
      r.resume();
      setPaused(false);
      timerRef.current = setInterval(() => {
        setRecTimer((prev) => {
          if (prev + 1 >= 90) {
            stopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1e3);
    }
  }
  function stopRecording() {
    const r = mediaRecorderRef.current;
    if (r && r.state !== "inactive") r.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }
  function discardVideo() {
    setFbVideoBlob(null);
    setFbVideoFile(null);
    setFbVideoName("");
    setVideoDuration(0);
  }
  const cur = (caseData == null ? void 0 : caseData.currency) || "USD";
  const sym = CURRENCY_SYMBOLS[cur] ?? cur;
  const amountNeeded = Number((caseData == null ? void 0 : caseData.amount_needed) ?? 0);
  const amountCollected = Number((caseData == null ? void 0 : caseData.amount_collected) ?? 0);
  const remaining = Math.max(amountNeeded - amountCollected, 0);
  const percentDone = amountNeeded > 0 ? Math.min(Math.round(amountCollected / amountNeeded * 100), 100) : 0;
  const pledgeNum = parseFloat(pledgeAmount) || 0;
  const freeContributionRemaining = Math.max(3 - userUnlockCount, 0);
  const hasUnlockCredit = walletBalance >= 1;
  const isRejected = (caseData == null ? void 0 : caseData.status) === "rejected";
  const isExpired = (caseData == null ? void 0 : caseData.status) === "expired";
  const isOwner = (user == null ? void 0 : user.id) === (caseData == null ? void 0 : caseData.user_id);
  const isCompleted = (caseData == null ? void 0 : caseData.status) === "completed";
  const categoryDetails = (caseData == null ? void 0 : caseData.category_details) && typeof caseData.category_details === "object" ? caseData.category_details : {};
  const directPaymentRows = [
    { label: "Receiver Name", value: (caseData == null ? void 0 : caseData.receiver_name) || categoryDetails.receiver_name },
    { label: "Receiver Contact", value: (caseData == null ? void 0 : caseData.receiver_contact) || categoryDetails.receiver_contact, mono: true },
    { label: "Receiver Bank", value: (caseData == null ? void 0 : caseData.receiver_bank) || categoryDetails.receiver_bank },
    { label: "Receiver Account Number", value: (caseData == null ? void 0 : caseData.receiver_account) || categoryDetails.receiver_account, mono: true },
    { label: "Receiver Address", value: (caseData == null ? void 0 : caseData.receiver_address) || categoryDetails.receiver_address },
    { label: "Receiver Shop / Business", value: (caseData == null ? void 0 : caseData.receiver_shop_name) || categoryDetails.receiver_shop_name },
    { label: "Provider / Institute", value: (caseData == null ? void 0 : caseData.institute_name) || categoryDetails.provider },
    { label: "Consumer / Reference Number", value: (caseData == null ? void 0 : caseData.consumer_no) || categoryDetails.consumer_no || categoryDetails.consumer_number || categoryDetails.reference_no, mono: true },
    { label: "Payment Method", value: (caseData == null ? void 0 : caseData.payment_method) || categoryDetails.payment_method },
    { label: "Account Title / Reference", value: (caseData == null ? void 0 : caseData.account_title) || categoryDetails.account_title },
    { label: "Account / Bill Number", value: (caseData == null ? void 0 : caseData.account_number) || categoryDetails.account_number, mono: true },
    { label: "IBAN", value: (caseData == null ? void 0 : caseData.account_iban) || categoryDetails.account_iban, mono: true },
    { label: "Institute Contact", value: (caseData == null ? void 0 : caseData.institute_contact) || categoryDetails.institute_contact, mono: true },
    { label: "Institute Address", value: (caseData == null ? void 0 : caseData.institute_address) || categoryDetails.institute_address }
  ].filter((row) => Boolean(row.value));
  const unlockMode = (myUnlock == null ? void 0 : myUnlock.payment_type) || payMode;
  const canHelpAgain = (unlocked || contributionOpen) && !isOwner && !isCompleted && !isRejected && !isExpired;
  const submittedResType = unlockMode === "full" ? String((caseData == null ? void 0 : caseData.category) || "Direct Payment") : resType;
  [1, "1", true, "true", "yes"].includes(caseData == null ? void 0 : caseData.admin_confirmed);
  getEligibleAffidavitResolutions(myResolutions);
  myResolutions.filter((r) => !isContributionResolution(r));
  async function handleUnlock(mode) {
    if (!user) {
      navigate({ to: "/sign-in" });
      return;
    }
    if (mode === "full" && !walletLoading && !hasUnlockCredit) {
      ue.error("You have no credits. Please add credits in your Wallet before unlocking Direct Help.");
      return;
    }
    if (mode === "partial") {
      if (remaining <= 0) {
        ue.error("This case has already reached its fundraising goal.");
        return;
      }
      if (pledgeNum < 100) {
        ue.error(`The minimum Contribution is ${sym} 100.`);
        return;
      }
      if (pledgeNum > remaining) {
        ue.error(`The maximum Contribution is ${sym} ${remaining} ${cur} still needed.`);
        return;
      }
      if (freeContributionRemaining === 0 && !walletLoading && !hasUnlockCredit) {
        ue.error("Your 3 free Contributions are complete. Please add 1 credit in your Wallet to continue.");
        return;
      }
    }
    setUnlocking(true);
    try {
      const isFreeContribution = mode === "partial" && userUnlockCount < 3;
      const charge = isFreeContribution ? 0 : 1;
      await insertCaseUnlock({
        case_id: id,
        hero_id: user.id,
        pledged_amount: mode === "partial" ? pledgeNum : amountNeeded > 0 ? remaining : 0,
        credits_charged: charge,
        payment_type: mode
      });
      if (mode === "partial") {
        setAmountPaid(String(pledgeNum));
        setContributionOpen(true);
      } else if (amountNeeded > 0) setAmountPaid(String(remaining));
      setUnlocked(true);
      setWalletBalance((prev) => Math.max(prev - charge, 0));
      setPayMode(mode);
      ue.success(isFreeContribution ? "🎉 Contribution unlocked FREE! This is your #" + (userUnlockCount + 1) + " free contribution help." : mode === "full" ? "Direct Help unlocked! 1 credit deducted." : "Contribution unlocked! 1 credit deducted.");
      loadCase();
    } catch (err) {
      ue.error("Failed to unlock case: " + err.message);
    } finally {
      setUnlocking(false);
    }
  }
  async function handleUnlockMedia() {
    if (!user) {
      navigate({ to: "/sign-in" });
      return;
    }
    if (walletLoading) return;
    if (walletBalance < 1) {
      ue.error("You have no credits. Please add 1 credit in your Wallet to view verification media.");
      return;
    }
    setMediaUnlocking(true);
    try {
      await insertCaseUnlock({ case_id: id, hero_id: user.id, pledged_amount: null, credits_charged: 1, payment_type: "media" });
      setMediaUnlocked(true);
      setWalletBalance((prev) => Math.max(prev - 1, 0));
      ue.success("Verification Media unlocked. 1 credit deducted.");
    } catch (err) {
      ue.error("Failed to unlock Verification Media: " + ((err == null ? void 0 : err.message) || "Please try again."));
    } finally {
      setMediaUnlocking(false);
    }
  }
  async function handleSubmitResolution() {
    if (unlockMode !== "full" && !resType) {
      ue.error("Please select what you did");
      return;
    }
    if (!txId.trim()) {
      ue.error("Please enter transaction ID / payment reference");
      return;
    }
    const paidNum = amountPaid ? parseFloat(amountPaid) : contributionOpen ? pledgeNum : (myUnlock == null ? void 0 : myUnlock.pledged_amount) ?? null;
    if (!paidNum || paidNum <= 0) {
      ue.error("Please enter the total amount you paid.");
      return;
    }
    if (unlockMode === "partial" && paidNum < 100) {
      ue.error(`Contribution must be at least ${sym} 100.`);
      return;
    }
    if (unlockMode === "partial" && paidNum > remaining) {
      ue.error(`Contribution cannot exceed ${sym} ${remaining}.`);
      return;
    }
    if (unlockMode === "full" && amountNeeded > 0 && paidNum < amountNeeded) {
      ue.error(`Direct Help requires the full amount: ${sym} ${amountNeeded} ${cur}.`);
      return;
    }
    if (!receiptFile) {
      ue.error("Please attach your payment receipt before submitting proof.");
      return;
    }
    setSubmitting(true);
    try {
      const receiptUrl = await uploadFile(receiptFile, `resolutions/${id}/${Date.now()}_receipt`);
      const paidTo = contributionOpen || (myUnlock == null ? void 0 : myUnlock.payment_type) === "partial" ? "givethra" : "institute";
      await insertCaseResolution({
        case_id: id,
        hero_id: user == null ? void 0 : user.id,
        seeker_id: caseData.user_id,
        resolution_type: submittedResType,
        amount_paid: paidNum,
        transaction_id: txId,
        receipt_url: receiptUrl,
        notes,
        status: paidTo === "givethra" ? "seeker_confirmed" : "pending_confirmation",
        hero_confirmed: true,
        seeker_confirmed: paidTo === "givethra" ? true : false,
        seeker_confirmed_amount: paidTo === "givethra" ? paidNum : null,
        paid_to: paidTo
      });
      if (paidTo === "givethra") {
        if (caseData == null ? void 0 : caseData.user_id) await sendNotification(caseData.user_id, "system", "Someone is helping your case! 🤝", `A kind person contributed towards your case "${caseData.title}". Givethra is verifying it — you'll see your fundraising progress soon.`, `/cases/${id}`);
        ue.success("Thank you! Givethra will verify your contribution and add it to the fundraising.");
      } else {
        if (caseData == null ? void 0 : caseData.user_id) await sendNotification(caseData.user_id, "system", "Please confirm help received ✅", `A Hero submitted proof of paying your case "${caseData.title}". Please review and confirm.`, `/cases/${id}`);
        ue.success("Resolution submitted! Waiting for seeker confirmation.");
      }
      setShowResolution(false);
      setResType("");
      setTxId("");
      setNotes("");
      setReceiptFile(null);
      setReceiptName("");
      loadCase();
    } catch (err) {
      ue.error(`Error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setSubmitting(false);
    }
  }
  async function handleSeekerConfirm(confirmedAmount, res) {
    if (!res) return;
    try {
      await updateCaseResolution(res.id, {
        seeker_confirmed: true,
        seeker_confirmed_amount: confirmedAmount,
        status: "seeker_confirmed"
      });
      if (res.hero_id) await sendNotification(res.hero_id, "system", "Seeker confirmed your help ✅", `The seeker confirmed receiving ${sym} ${confirmedAmount} ${cur} on "${caseData.title}". Givethra will now verify and finalize.`, `/cases/${id}`);
      ue.success("Confirmed! Givethra will verify and finalize this help.");
    } catch (err) {
      ue.error("Failed to confirm.");
    }
    loadCase();
  }
  async function handleSeekerDispute(res) {
    if (!res) return;
    try {
      await updateCaseResolution(res.id, { seeker_confirmed: false, status: "disputed" });
      ue.success("Marked as disputed. Givethra will investigate.");
    } catch (err) {
      ue.error("Failed to dispute.");
    }
    loadCase();
  }
  async function submitFeedback() {
    if (!fbText.trim() || !fbVideoFile) {
      ue.error("Please write a message AND record a 90-second video — both are required.");
      return;
    }
    if (recording) {
      ue.error("Please finish (Done) your video first.");
      return;
    }
    if (videoDuration < 60) {
      ue.error(`Video must be at least 60 seconds long. Current duration: ${videoDuration}s.`);
      return;
    }
    if (!(user == null ? void 0 : user.id)) {
      ue.error("Please sign in before submitting feedback.");
      return;
    }
    setFbSubmitting(true);
    try {
      let fbVideoUrl = "";
      if (fbVideoFile) fbVideoUrl = await uploadFile(fbVideoFile, `feedbacks/${id}/${Date.now()}_video`);
      const prof = await getProfile(user.id);
      const firstName = ((prof == null ? void 0 : prof.full_name) || (seekerKyc == null ? void 0 : seekerKyc.full_name) || "A grateful person").split(" ")[0];
      const savedFeedback = await insertFeedback({
        case_id: id,
        user_id: user == null ? void 0 : user.id,
        first_name: firstName,
        text_message: fbText.trim() || null,
        video_url: fbVideoUrl || null,
        status: "pending_review"
      });
      setExistingFeedback({ ...savedFeedback || {}, status: "pending_review" });
      ue.success("Thank you! Your feedback is submitted for Givethra's review. Once approved, it will appear on the wall and you can submit a new case.");
      setFbText("");
      setFbVideoFile(null);
      setFbVideoName("");
      setFbVideoBlob(null);
      setVideoDuration(0);
      await checkExistingFeedback();
      loadCase();
    } catch (err) {
      ue.error(`Error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setFbSubmitting(false);
    }
  }
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-20", children: "Loading..." }) });
  if (!caseData) return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-20 text-muted-foreground", children: "Case not found." }) });
  if (isRejected) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate({ to: "/my-cases" }), className: "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
        " Back to My Cases"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 p-8 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-100 dark:bg-red-900/30 p-3 rounded-full shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-8 w-8 text-red-600 dark:text-red-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-red-800 dark:text-red-300", children: "❌ Case Rejected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: "Your case was reviewed and could not be approved for the following reason(s)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-red-950/50 rounded-xl border-2 border-red-200 dark:border-red-800 p-6 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-red-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-red-700 dark:text-red-300", children: "Rejection Reason" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-red-900 dark:text-red-200 font-medium leading-relaxed whitespace-pre-line", children: caseData.rejection_reason || "No specific reason provided. Please contact support for details." }),
          caseData.reviewed_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-400 dark:text-red-500 mt-2 border-t border-red-100 dark:border-red-800 pt-2", children: [
            "Reviewed on: ",
            new Date(caseData.reviewed_at).toLocaleDateString(),
            " at ",
            new Date(caseData.reviewed_at).toLocaleTimeString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-xl border p-4 ${caseData.was_free ? "bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800" : "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-5 w-5 mt-0.5 shrink-0 ${caseData.was_free ? "text-teal-600 dark:text-teal-400" : "text-blue-600 dark:text-blue-400"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-semibold ${caseData.was_free ? "text-teal-800 dark:text-teal-300" : "text-blue-800 dark:text-blue-300"}`, children: caseData.was_free ? "🎁 Your free submission has been returned!" : "💳 1 credit has been refunded to your account!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${caseData.was_free ? "text-teal-700 dark:text-teal-400" : "text-blue-700 dark:text-blue-400"}`, children: caseData.was_free ? "You can submit a new case for FREE again. Your free case allowance is restored." : "You can re-submit this case using your refunded credit. No extra cost." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-amber-800 dark:text-amber-300 text-sm mb-2", children: "📌 What to do next?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-amber-700 dark:text-amber-400 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "1." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Review the rejection reason above carefully" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "2." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Fix the issues mentioned in the reason" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "3." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Submit a new case with corrected information" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "4." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "If you need help, contact our support team" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-1 gap-2 bg-red-600 hover:bg-red-700 text-white h-12", onClick: () => navigate({ to: "/submit-request" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
            " Submit New Case"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "flex-1 gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-12", onClick: () => navigate({ to: "/support" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
            " Contact Support"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center pt-2 border-t border-red-200 dark:border-red-800", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-400 dark:text-red-500", children: "⚠️ All case details have been hidden for rejected cases. Please submit a new case." }) })
      ] })
    ] }) });
  }
  if (isExpired) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate({ to: "/my-cases" }), className: "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
        " Back to My Cases"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 p-8 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-8 w-8 text-amber-600 dark:text-amber-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-amber-800 dark:text-amber-300", children: "⏰ Case Expired" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-600 dark:text-amber-400", children: "No one helped in time, but you can try again" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-amber-950/50 rounded-xl border-2 border-amber-200 dark:border-amber-800 p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base text-amber-900 dark:text-amber-200 font-medium leading-relaxed", children: [
            "Your case remained active until the deadline but no Hero stepped forward to help.",
            caseData.was_free ? " Since this was your free case, you can submit a new case for FREE." : " The 1 credit you used has been refunded to your account."
          ] }),
          caseData.deadline && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-400 dark:text-amber-500 mt-3 border-t border-amber-100 dark:border-amber-800 pt-2", children: [
            "Expired on: ",
            new Date(caseData.deadline).toLocaleDateString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-1 gap-2 bg-amber-600 hover:bg-amber-700 text-white h-12", onClick: () => navigate({ to: "/submit-request" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
            " Submit New Case"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "flex-1 gap-2 border-amber-300 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 h-12", onClick: () => navigate({ to: "/cases" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
            " Browse Other Cases"
          ] })
        ] })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate({ to: "/cases" }), className: "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
      " Back to cases"
    ] }),
    !isCompleted && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-teal-50 dark:bg-teal-950/20 border-2 border-teal-400 p-4 text-sm text-teal-700 dark:text-teal-300 text-center font-medium", children: [
      "🎉 Your first ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3 contribution helps are FREE" }),
      "! Direct Help always costs 1 credit."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold px-2.5 py-1 rounded-full ${caseData.status === "approved" ? "bg-teal-100 text-teal-700" : caseData.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`, children: (_a = caseData.status) == null ? void 0 : _a.toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium", children: caseData.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2.5 py-1 rounded-full font-medium ${caseData.urgency === "Emergency" ? "bg-red-100 text-red-700" : caseData.urgency === "High" ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`, children: caseData.urgency })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground break-words", children: caseData.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 shrink-0" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "break-words", children: [
              caseData.city,
              ", ",
              caseData.country
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", className: "shrink-0 gap-1.5 border-primary/25 text-primary hover:bg-primary/10", onClick: handleCaseShare, "aria-label": `Share ${caseData.title}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }),
            " Share"
          ] }),
          !isCompleted && caseData.deadline && (() => {
            const daysLeft = Math.ceil((new Date(caseData.deadline).getTime() - Date.now()) / (1e3 * 60 * 60 * 24));
            if (daysLeft < 0) return null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 sm:flex-none ${daysLeft <= 3 ? "bg-red-50 dark:bg-red-950/20 border border-red-300" : "bg-amber-50 dark:bg-amber-950/20 border border-amber-300"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-lg", children: "⏳" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `whitespace-nowrap text-xs font-bold ${daysLeft <= 3 ? "text-red-700" : "text-amber-700"}`, children: daysLeft === 0 ? "Expires TODAY — Help Now" : daysLeft === 1 ? "Only 1 day left — Help Now" : `Only ${daysLeft} days left to help` })
            ] });
          })()
        ] })
      ] }),
      amountNeeded > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-teal-600", children: [
            sym,
            " ",
            amountCollected,
            " collected"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            percentDone,
            "% · ",
            sym,
            " ",
            remaining,
            " left"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-2.5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary h-2.5 rounded-full transition-all", style: { width: `${percentDone}%` } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap rounded-xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 px-3 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-teal-700 dark:text-teal-300 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 shrink-0" }),
          " Identity Verified"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-teal-700 dark:text-teal-300 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 shrink-0" }),
          " KYC Approved"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-teal-700 dark:text-teal-300 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 shrink-0" }),
          " Givethra Verified"
        ] })
      ] }),
      (() => {
        const approvedItems = getApprovedCaseItems(caseData);
        const documentItems = approvedItems.filter((item) => item.source === "document");
        const isPublishedCase = ["approved", "published", "active"].includes(String(caseData.status || "").toLowerCase());
        if (!isPublishedCase && approvedItems.length === 0) return null;
        caseData.currency || "USD";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-300 p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-teal-600 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-teal-700", children: "Case Verification Documents" })
          ] }),
          documentItems.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: documentItems.map(({ label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium bg-white dark:bg-teal-900/30 text-teal-700 border border-teal-300 rounded-full px-2.5 py-1", children: [
            "✅ ",
            label
          ] }, label)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-teal-600", children: "No additional case-specific documents are recorded in this case." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] leading-relaxed text-teal-600", children: "Only the reviewed document names are shown publicly; document contents remain private." })
        ] });
      })()
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground", children: "Case Story (What You Need Help With)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed whitespace-pre-line", children: [caseData.description, caseData.why_help].filter((text, index, values) => Boolean(text == null ? void 0 : text.trim()) && values.findIndex((value) => (value == null ? void 0 : value.trim()) === text.trim()) === index).join("\n\n") })
        ] }),
        isOwner && isCompleted && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-teal-50 dark:bg-teal-950/20 border-2 border-teal-200 p-5 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl", children: "🎉🤲" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg text-teal-700", children: "Your case is complete!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-teal-700", children: caseData.closed_by_admin ? "Many kind people came together and Givethra paid your bill. May Allah bless everyone who helped." : "A kind Hero helped you directly. May Allah bless them." })
          ] }),
          caseData.paid_receipt_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: caseData.paid_receipt_url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center justify-center gap-2 rounded-lg bg-card border border-teal-300 p-3 text-sm text-teal-700 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
            " View Payment Receipt"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OwnerCompletedResolutions, { caseId: id, caseData, seekerKyc, heroName, sym, cur }),
          existingFeedback ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-card border border-border p-4 text-center space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-6 w-6 text-amber-400 mx-auto", fill: "currentColor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Thank you for sharing your feedback! 🤲" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Your message is now on the Givethra community wall." })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-card border border-border p-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm text-foreground", children: "Share your feedback 🙏" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Tell everyone how Givethra helped you. Your message (with your first name) will appear on our community wall." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: fbText, onChange: (e) => setFbText(e.target.value), rows: 4, placeholder: "Write your thank-you message..." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Add a video (optional)" }),
              fbVideoBlob ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: fbVideoBlob, controls: true, className: "w-full rounded-lg border max-h-48" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "Duration: ",
                  videoDuration,
                  "s ",
                  videoDuration < 60 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "(minimum 60s required)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", className: "w-full", onClick: discardVideo, children: "Remove / Re-record" })
              ] }) : recording ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: liveVideoRef, autoPlay: true, playsInline: true, muted: true, className: "w-full rounded-lg border" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-red-500", children: [
                  paused ? "⏸ Paused" : "● Recording",
                  " ",
                  recTimer,
                  "s / 90s"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-500 h-2 rounded-full transition-all", style: { width: `${recTimer / 90 * 100}%` } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  !paused ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "flex-1", onClick: pauseRecording, children: "⏸ Pause" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "flex-1", onClick: resumeRecording, children: "▶ Resume" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", className: "flex-1 bg-teal-600 hover:bg-teal-700", onClick: stopRecording, children: "✓ Done" })
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", className: "w-full min-h-12 touch-manipulation select-none", variant: "outline", onClick: startRecording, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-4 w-4" }),
                  " Record a Video (up to 90s)"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground text-center", children: "Or upload a video file" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "file", accept: "video/*", onChange: (e) => {
                  var _a2;
                  const f = ((_a2 = e.target.files) == null ? void 0 : _a2[0]) ?? null;
                  setFbVideoFile(f);
                  setFbVideoName((f == null ? void 0 : f.name) ?? "");
                  setFbVideoBlob(f ? URL.createObjectURL(f) : null);
                  setVideoDuration(0);
                } }),
                fbVideoName && !fbVideoBlob && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-teal-600", children: [
                  "✓ ",
                  fbVideoName
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: submitFeedback, disabled: fbSubmitting || recording || !!fbVideoFile && videoDuration < 60, children: fbSubmitting ? "Posting..." : "Post Feedback to Community Wall 🤲" }),
            fbVideoFile && videoDuration < 60 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-500", children: [
              "⏳ Video must be at least 60 seconds. Current: ",
              videoDuration,
              "s"
            ] })
          ] })
        ] }),
        !isCompleted && !unlocked && !isOwner && !contributionOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 flex flex-col items-center text-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-6 w-6 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground", children: "Choose how you want to help" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: isFirstThreeUnlocks ? `🎉 This is your #${userUnlockCount + 1} contribution help — it's FREE! (${3 - userUnlockCount} contribution helps remaining)` : `Contribution helps after the first 3 require 1 credit.` })
          ] }),
          !isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate({ to: "/sign-in" }), className: "px-8", children: "Sign in to help" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5 text-primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-sm", children: "Help Now" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wide text-primary", children: "Choose one" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "You can help this case directly or contribute any amount." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-5 w-5 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-sm", children: "Pay the full bill directly" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "You'll get the institute's payment details and pay the full amount ",
                amountNeeded > 0 ? `(${sym} ${amountNeeded} ${cur})` : "",
                " directly. Best if you can cover it all at once."
              ] }),
              !walletLoading && !hasUnlockCredit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-300 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "You have 0 credits." }),
                  " Direct Help requires 1 credit to unlock."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: () => navigate({ to: "/wallet" }), className: "w-full gap-2 border-amber-400 text-amber-800 dark:text-amber-300", children: [
                  "Add Credits in Wallet ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => handleUnlock("full"), disabled: unlocking || walletLoading, className: "w-full gap-2 mt-1 bg-teal-600 hover:bg-teal-700 text-white shadow-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "h-4 w-4" }),
                "Help Now — Direct Payment (1 credit)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-5 w-5 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-sm", children: "Contribute any amount (Fundraising)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Contribute any amount to Givethra's fundraising. When the goal is reached, Givethra pays the institute. Many help together 🤝" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-teal-300 bg-teal-50 dark:bg-teal-950/20 p-2.5 text-xs text-teal-800 dark:text-teal-300", children: freeContributionRemaining > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  freeContributionRemaining,
                  " of 3 free Contribution unlocks remaining."
                ] }),
                " Your next Contribution unlock is free."
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Your 3 free Contribution unlocks are complete." }),
                " This Contribution unlock requires 1 credit."
              ] }) }),
              freeContributionRemaining === 0 && !walletLoading && !hasUnlockCredit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-300 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "You have 0 credits." }),
                  " Add 1 credit in your Wallet to unlock another Contribution."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: () => navigate({ to: "/wallet" }), className: "w-full gap-2 border-amber-400 text-amber-800 dark:text-amber-300", children: [
                  "Add Credits in Wallet ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" })
                ] })
              ] }),
              amountNeeded > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
                  "How much will you contribute? (",
                  cur,
                  ") — minimum ",
                  sym,
                  " 100, maximum ",
                  sym,
                  " ",
                  remaining,
                  " still needed"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground", children: sym }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 100, value: pledgeAmount, onChange: (e) => setPledgeAmount(e.target.value), placeholder: `100–${remaining}`, className: "pl-12 bg-card", max: remaining })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => handleUnlock("partial"), disabled: unlocking || walletLoading || remaining < 100, className: "w-full gap-2 mt-1 bg-teal-600 hover:bg-teal-700 text-white shadow-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-4 w-4" }),
                "Help Now — Contribute"
              ] })
            ] })
          ] })
        ] }) : !isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          !isOwner && unlockMode === "full" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "order-2 min-w-0 overflow-hidden rounded-2xl bg-card border-2 border-primary/20 p-5 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-5 w-5 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Direct Payment Receiver Details" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-xs text-primary font-medium mb-1", children: [
              "Send the full amount ",
              amountNeeded > 0 ? `(${sym} ${amountNeeded} ${cur})` : "",
              " to the verified receiver below. For bills, use the listed provider and consumer/reference number."
            ] }),
            directPaymentRows.length > 0 ? directPaymentRows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(CopyRow, { label: row.label, value: String(row.value), mono: row.mono }, row.label)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700", children: "Receiver payment details are not available yet. Please contact Givethra before sending money." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400 mt-2", children: "Pay only to the receiver details shown above. Keep the payment receipt and transaction/reference number, then submit both below for Givethra review." })
          ] }),
          !isOwner && unlockMode === "partial" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "order-2 min-w-0 overflow-hidden rounded-2xl bg-card border-2 border-primary/20 p-5 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-5 w-5 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Contribute to Givethra Fundraising" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-xs text-primary font-medium mb-1", children: "Send your contribution to Givethra. We collect all contributions and pay the institute once the goal is reached. You can contribute as many times as you like until the case is complete." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CopyRow, { label: "NayaPay Title", value: GIVETHRA_NAYAPAY_TITLE }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CopyRow, { label: "NayaPay Account / IBAN", value: GIVETHRA_NAYAPAY_IBAN, mono: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CopyRow, { label: "Binance USDT (TRC20) — International", value: GIVETHRA_USDT_TRC20, mono: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400 mt-2", children: "🤝 After sending, submit your receipt below. Givethra verifies it and adds your contribution. When the goal is reached, Givethra pays the bill." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "order-1 min-w-0 overflow-hidden rounded-2xl bg-card border border-border p-5 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "🎥 Verification Media" }),
              mediaUnlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wide text-teal-600", children: "Unlocked" })
            ] }),
            mediaUnlocked ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
              caseData.selfie_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "Live Selfie" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: caseData.selfie_url, alt: "Selfie", className: "w-full rounded-lg border max-h-40 object-cover" })
              ] }),
              caseData.video_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "Verification Appeal Video (View Only)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: caseData.video_url, controls: true, controlsList: "nodownload noplaybackrate", disablePictureInPicture: true, playsInline: true, onContextMenu: (e) => e.preventDefault(), className: "w-full rounded-lg border max-h-40" })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-2 text-sm text-amber-800 dark:text-amber-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Verification Media is locked." }),
                " Unlock it with 1 credit to view the approved selfie and appeal video."
              ] }),
              isAuthenticated && !walletLoading && walletBalance < 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: () => navigate({ to: "/wallet" }), className: "w-full gap-2 border-amber-400 text-amber-800 dark:text-amber-300", children: [
                "Add 1 Credit in Wallet ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: handleUnlockMedia, disabled: !isAuthenticated || mediaUnlocking || walletLoading, className: "w-full gap-2", children: mediaUnlocking ? "Unlocking..." : "Unlock Verification Media (1 credit)" })
            ] })
          ] }),
          !isOwner && myResolutions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4 text-primary" }),
              " My Help on this case (",
              myResolutions.length,
              ")"
            ] }),
            myResolutions.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-3 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full ${r.status === "completed" ? "bg-teal-100 text-teal-700" : r.status === "disputed" ? "bg-red-100 text-red-700" : r.status === "seeker_confirmed" ? "bg-amber-100 text-amber-700" : "bg-orange-100 text-orange-700"}`, children: r.status === "completed" ? "VERIFIED ✓" : r.status === "seeker_confirmed" ? "UNDER VERIFICATION" : r.status === "disputed" ? "DISPUTED" : "PENDING" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-primary", children: [
                  sym,
                  " ",
                  r.seeker_confirmed_amount ?? r.amount_paid,
                  " ",
                  cur
                ] })
              ] }),
              r.status === "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "w-full gap-2 border-teal-300 text-teal-700", onClick: () => generateAffidavit(caseData, r, seekerKyc, heroName), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                " Download Affidavit"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: r.status === "seeker_confirmed" ? "Givethra is verifying this contribution." : r.status === "disputed" ? "This was disputed — Givethra will investigate." : "Waiting for confirmation." })
            ] }, r.id))
          ] }),
          canHelpAgain && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "order-3 min-w-0 overflow-hidden rounded-2xl bg-card border border-border p-5 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold", children: [
              "🤝 ",
              myResolutions.length > 0 ? "Help Again" : unlockMode === "partial" ? "Submit Your Contribution Proof" : "Resolve This Case"
            ] }),
            myResolutions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "You can help this case as many times as you like until it's complete. ",
              sym,
              " ",
              remaining,
              " still needed."
            ] }),
            !showResolution ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
              setShowResolution(true);
            }, className: "w-full gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4" }),
              " ",
              myResolutions.length > 0 ? "Add More Help" : unlockMode === "partial" ? "I Contributed — Submit Proof" : "I Helped — Submit Proof"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: unlockMode === "partial" ? "Contribution Type *" : "Payment Category *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: (unlockMode === "partial" ? ["Contribution", "Partial Help", "Other"] : [(caseData == null ? void 0 : caseData.category) || "Direct Payment"]).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setResType(t), className: `px-3 py-2 rounded-lg border text-xs font-medium text-left ${resType === t ? "bg-primary text-white border-primary" : "border-border"}`, children: t }, t)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  "Amount Paid (",
                  cur,
                  ") *"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: amountPaid, onChange: (e) => setAmountPaid(e.target.value), placeholder: `e.g. ${remaining || amountNeeded || 500}` })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transaction ID / Payment Reference *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: txId, onChange: (e) => setTxId(e.target.value), placeholder: "TXN123456789" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Attach Payment Receipt *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Upload the receipt or payment slip so Givethra can verify the amount and reference with the receiver." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*,.pdf", onChange: (e) => {
                  var _a2;
                  const f = ((_a2 = e.target.files) == null ? void 0 : _a2[0]) ?? null;
                  setReceiptFile(f);
                  setReceiptName((f == null ? void 0 : f.name) ?? "");
                }, className: "block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm" }),
                receiptName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-teal-600 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
                  " ",
                  receiptName,
                  " (will upload when you submit)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: notes, onChange: (e) => setNotes(e.target.value), rows: 3, placeholder: "Any details..." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "flex-1", onClick: handleSubmitResolution, disabled: submitting, children: submitting ? "Submitting..." : unlockMode === "full" ? "Submit Direct Payment Proof" : "Submit Contribution Proof" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowResolution(false), children: "Cancel" })
              ] })
            ] })
          ] }),
          isOwner && !isCompleted && /* @__PURE__ */ jsxRuntimeExports.jsx(OwnerResolutions, { caseId: id, caseData, seekerKyc, onConfirm: handleSeekerConfirm, onDispute: handleSeekerDispute, sym, cur })
        ] }) : null,
        !isOwner && isCompleted && (myUnlock || myResolutions.length > 0) && (() => {
          const verified = getEligibleAffidavitResolutions(myResolutions);
          const badge = getHeroBadgeForCase(verified);
          const helpedDirect = verified.some((r) => !isContributionResolution(r));
          const totalVerified = verified.reduce(
            (sum, r) => sum + (Number(r.seeker_confirmed_amount ?? r.amount_paid) || 0),
            0
          );
          const gratitude = getCategoryGratitude(caseData.category);
          const message = verified.length > 0 ? (helpedDirect ? gratitude.direct : gratitude.contribution).replace(
            "{amount}",
            `${sym} ${totalVerified} ${cur}`
          ) : gratitude.unlock;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 p-5 text-center space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: "🤲" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-teal-600 text-white", children: [
              badge.emoji,
              " ",
              badge.label
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-teal-700", children: "This case is complete!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-teal-700", children: message }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              caseData.title,
              " · ",
              caseData.category
            ] }),
            verified.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 pt-1 text-left", children: verified.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-teal-200 bg-card p-3 flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground", children: isContributionResolution(r) ? "Contribution" : "Direct Help" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "Payment proof received · ",
                  sym,
                  " ",
                  r.seeker_confirmed_amount ?? r.amount_paid,
                  " ",
                  cur
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "shrink-0 gap-2 border-teal-300 text-teal-700", onClick: () => generateAffidavit(caseData, r, seekerKyc, heroName), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                " Affidavit"
              ] })
            ] }, r.id)) })
          ] });
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Case Info" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: caseData.category })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Urgency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: caseData.urgency })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium capitalize", children: caseData.status })
          ] }),
          caseData.deadline && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Deadline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: new Date(caseData.deadline).toLocaleDateString() })
          ] }),
          amountNeeded > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-primary", children: [
              sym,
              " ",
              amountNeeded,
              " ",
              cur
            ] })
          ] }),
          amountNeeded > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Collected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-teal-600", children: [
              sym,
              " ",
              amountCollected,
              " (",
              percentDone,
              "%)"
            ] })
          ] })
        ] })
      ] }) })
    ] })
  ] }) });
}
function OwnerCompletedResolutions({ caseId, caseData, seekerKyc, heroName, sym, cur }) {
  const [resolutions, setResolutions] = reactExports.useState([]);
  reactExports.useEffect(() => {
    getCaseResolutions(caseId).then((data) => {
      const completed = (data ?? []).filter(isTrulyCompletedHelp);
      setResolutions(completed);
    }).catch(() => {
    });
  }, [caseId]);
  if (resolutions.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2 border-t border-teal-200 dark:border-teal-800", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm text-teal-700", children: "📄 Help Received (Completed Resolutions)" }),
    resolutions.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-teal-200 bg-card p-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-foreground", children: [
            isContributionResolution(r) ? "Contribution" : "Direct Help",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-[10px] font-medium text-muted-foreground", children: r.resolution_type || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-primary", children: [
            sym,
            " ",
            r.seeker_confirmed_amount ?? r.amount_paid,
            " ",
            cur
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wide text-teal-600 bg-teal-100 dark:bg-teal-900/30 px-2 py-1 rounded-full", children: "Completed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        r.receipt_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: r.receipt_url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-xs text-primary hover:underline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" }),
          " View Receipt"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-2 border-teal-300 text-teal-700", onClick: () => generateAffidavit(caseData, r, seekerKyc, heroName), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
          " Affidavit"
        ] })
      ] }),
      r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: r.notes })
    ] }, r.id))
  ] });
}
function OwnerResolutions({ caseId, caseData, seekerKyc, onConfirm, onDispute, sym, cur }) {
  const [resolutions, setResolutions] = reactExports.useState([]);
  const [confirmingId, setConfirmingId] = reactExports.useState(null);
  const [confirmAmount, setConfirmAmount] = reactExports.useState("");
  reactExports.useEffect(() => {
    getCaseResolutions(caseId).then((data) => {
      setResolutions((data ?? []).slice().reverse());
    }).catch(() => {
    });
  }, [caseId]);
  const visible = resolutions.filter((r) => r.paid_to !== "givethra");
  if (visible.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: visible.map((res) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-card border-2 border-primary/30 p-5 space-y-4", children: res.status === "pending_confirmation" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-primary", children: "✅ A Hero Claims They Helped You" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Type:" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: res.resolution_type })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Hero says they paid:" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
          sym,
          " ",
          res.amount_paid,
          " ",
          cur
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "TXN ID:" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium", children: res.transaction_id })
      ] }),
      res.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
        " ",
        res.notes
      ] }),
      res.receipt_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: res.receipt_url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-primary text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" }),
        " View Receipt"
      ] })
    ] }),
    confirmingId === res.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl bg-primary/5 border border-primary/20 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
          "How much help did you actually receive? (",
          cur,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground", children: sym }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: confirmAmount, onChange: (e) => setConfirmAmount(e.target.value), placeholder: String(res.amount_paid ?? ""), className: "pl-12" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setConfirmAmount(String(res.amount_paid ?? "")), className: "text-xs px-2 py-1 rounded-lg border border-border hover:border-primary", children: [
          "Same as Hero (",
          sym,
          res.amount_paid,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Enter the amount you truly received. Givethra will verify this." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-1 bg-teal-600 hover:bg-teal-700", onClick: () => {
          const amt = parseFloat(confirmAmount);
          if (!amt || amt <= 0) {
            ue.error("Please enter the amount you received.");
            return;
          }
          onConfirm(amt, res);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 mr-2" }),
          " Confirm this amount"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setConfirmingId(null), children: "Cancel" })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-1 bg-teal-600 hover:bg-teal-700", onClick: () => {
        setConfirmingId(res.id);
        setConfirmAmount(String(res.amount_paid ?? ""));
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 mr-2" }),
        " Confirm Help"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1 text-red-600 border-red-300", onClick: () => onDispute(res), children: "Dispute" })
    ] })
  ] }) : res.status === "seeker_confirmed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-amber-600", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Confirmed — Under Verification" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "You confirmed receiving ",
      sym,
      " ",
      res.seeker_confirmed_amount ?? res.amount_paid,
      " ",
      cur,
      ". Givethra is verifying this help."
    ] })
  ] }) : res.status === "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-teal-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Help Confirmed" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      sym,
      " ",
      res.seeker_confirmed_amount ?? res.amount_paid,
      " ",
      cur,
      " — ",
      res.resolution_type
    ] })
  ] }) : res.status === "disputed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "⚠️ Disputed" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "You marked this as disputed. Givethra will investigate." })
  ] }) : null }, res.id)) });
}
export {
  CaseDetailPage as default
};
