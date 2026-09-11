import { w as createLucideIcon, p as ue, e as useAuth, u as useNavigate, r as reactExports, Q as getCategoryOffer, S as getOfferClaimCount, M as getCasesByUser, O as getFeedbacks, g as getKycStatus, b as getWallet, T as getUserSettings, U as getCaseCounts, l as jsxRuntimeExports, L as Link, W as Wallet, N as getUserSuspension, V as upsertUserSuspension, P as insertCaseSubmission, X as insertOfferClaim, Y as updateCategoryOfferUsage, J as uploadFileToStorage } from "./main-EspZtMZv.js";
import { L as Layout } from "./Layout-wYZkEQhc.js";
import { B as Button } from "./button-BrpTixLc.js";
import { I as Input } from "./input-DprFI1f6.js";
import { L as Label } from "./label-DOzeUvXs.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-RlYogfnt.js";
import { T as Textarea } from "./textarea-BqlLZurF.js";
import { C as COUNTRIES } from "./countries-Au0MzsWq.js";
import { a as sendNotification } from "./notify-dkf7JWdC.js";
import { W as WATER_COMPANIES, G as GAS_COMPANIES, E as ELECTRICITY_COMPANIES, H as HEALTH_REF_HINT, a as HEALTH_INSTITUTES, b as EDUCATION_INSTITUTES, c as EDUCATION_REF_HINT } from "./institutesList-K_M7HDTu.js";
import { H as Heart } from "./heart-CaEhMUxo.js";
import { C as CircleAlert } from "./circle-alert-CI1fNXYv.js";
import { S as ShieldAlert } from "./shield-alert-gURriS8x.js";
import { G as Gift } from "./gift-DyaKI6CV.js";
import { S as Search } from "./search-DlEEPgKI.js";
import { C as Camera } from "./camera-Bxcxd2pu.js";
import { C as CircleCheck } from "./circle-check-BPQn3gNr.js";
import { B as Building2 } from "./building-2-BVCM5BrX.js";
import { P as Phone } from "./phone-CT9V1oKs.js";
import { M as MapPin } from "./map-pin-C91oi1yI.js";
import { I as Info } from "./info-fWeUAJ7J.js";
import "./users-_6SD4cVf.js";
import "./x-Br49mtL5.js";
import "./message-circle-CqePZOv0.js";
import "./index-o8esZfzI.js";
import "./index-D1NJSY4H.js";
import "./index-BjBsYUTf.js";
import "./index-D7zt7y2w.js";
import "./Combination-BHE4JWne.js";
import "./index-C_XxiJMd.js";
import "./chevron-down-Dbk3kovR.js";
import "./check-Bg7ZFbn9.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Calculator = createLucideIcon("Calculator", [
  ["rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", key: "1nb95v" }],
  ["line", { x1: "8", x2: "16", y1: "6", y2: "6", key: "x4nwl0" }],
  ["line", { x1: "16", x2: "16", y1: "14", y2: "18", key: "wjye3r" }],
  ["path", { d: "M16 10h.01", key: "1m94wz" }],
  ["path", { d: "M12 10h.01", key: "1nrarc" }],
  ["path", { d: "M8 10h.01", key: "19clt8" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Languages = createLucideIcon("Languages", [
  ["path", { d: "m5 8 6 6", key: "1wu5hv" }],
  ["path", { d: "m4 14 6-6 2-3", key: "1k1g8d" }],
  ["path", { d: "M2 5h12", key: "or177f" }],
  ["path", { d: "M7 2h1", key: "1t2jsx" }],
  ["path", { d: "m22 22-5-10-5 10", key: "don7ne" }],
  ["path", { d: "M14 18h6", key: "1m8k6r" }]
]);
const COMMON_GUIDE_TAIL$1 = [
  "Upload clear documents (camera photo or file) so Givethra can verify your case.",
  "Take a live selfie and record a short video explaining your need in your own words.",
  "Your first case is FREE. Submit honestly — false information will be rejected."
];
const JOB_FIELD = {
  key: "job_status",
  label: "Do you have a job?",
  placeholder: "e.g. Yes - I work as... / No",
  required: true
};
const SALARY_DOC = {
  key: "salary_slip",
  label: "Last Month's Salary Slip (if you have a job)",
  hint: "If employed, attach your last month's salary slip"
};
const STATEMENT_DOC = {
  key: "statement",
  label: "Bank / Easypaisa / JazzCash Statement — Last 6 Months",
  required: true,
  hint: "Any account statement (bank, Easypaisa, or JazzCash) showing the last 6 months. Required if you don't have a salary slip."
};
const CATEGORY_CONFIG = {
  "Electricity Bill": {
    fields: [
      { key: "provider", label: "Electricity Company", placeholder: "e.g. K-Electric, FESCO, LESCO", required: true },
      { key: "consumer_no", label: "Consumer / Reference Number (from bill)", placeholder: "As printed on your bill", required: true },
      { key: "bill_owner_name", label: "Bill Owner Name (as on bill)", placeholder: "e.g. Muhammad Ali", required: true },
      { key: "bill_month", label: "Bill Month(s)", placeholder: "e.g. June 2026" },
      JOB_FIELD
    ],
    documents: [
      { key: "bill", label: "Electricity Bill", required: true, hint: "Clear photo/scan of the actual bill showing consumer number & amount" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays your electricity company directly using your consumer/reference number.",
    guide: [
      "Enter your electricity company and the consumer/reference number exactly as on your bill.",
      "Upload a clear photo of the bill — the consumer number and amount must be readable.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE electricity bill only. Submit separate cases for separate bills."
  },
  "Gas Bill": {
    fields: [
      { key: "provider", label: "Gas Company", placeholder: "e.g. SSGC, SNGPL", required: true },
      { key: "consumer_no", label: "Consumer Number (from bill)", placeholder: "As printed on your bill", required: true },
      { key: "bill_owner_name", label: "Bill Owner Name (as on bill)", placeholder: "e.g. Muhammad Ali", required: true },
      { key: "bill_month", label: "Bill Month(s)", placeholder: "e.g. June 2026" },
      JOB_FIELD
    ],
    documents: [
      { key: "bill", label: "Gas Bill", required: true, hint: "Clear photo of the bill showing consumer number & amount" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays your gas company directly using your consumer number.",
    guide: [
      "Enter your gas company and consumer number exactly as on your bill.",
      "Upload a clear photo of the gas bill.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE gas bill only."
  },
  "Water Bill": {
    fields: [
      { key: "provider", label: "Water Board / Company", placeholder: "e.g. KWSB, WASA", required: true },
      { key: "consumer_no", label: "Consumer / Account Number", placeholder: "As printed on your bill", required: true },
      { key: "bill_owner_name", label: "Bill Owner Name (as on bill)", placeholder: "e.g. Muhammad Ali", required: true },
      { key: "bill_month", label: "Bill Month(s)", placeholder: "e.g. June 2026" },
      JOB_FIELD
    ],
    documents: [
      { key: "bill", label: "Water Bill", required: true, hint: "Clear photo of the bill" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays your water board directly using your account number.",
    guide: [
      "Enter your water board and account number as on your bill.",
      "Upload a clear photo of the water bill.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE water bill only."
  },
  "House Rent": {
    fields: [
      { key: "landlord_name", label: "Landlord's Name", placeholder: "Full name of house owner", required: true },
      { key: "landlord_contact", label: "Landlord's Contact Number", placeholder: "So Givethra can verify", required: true },
      { key: "months", label: "How many months' rent?", placeholder: "e.g. 2 months", required: true },
      { key: "monthly_rent", label: "Monthly Rent Amount", placeholder: "e.g. 15000", required: true, type: "number" },
      { key: "family_members", label: "How many people in your household?", placeholder: "e.g. wife + 3 children = 5 members", required: true },
      JOB_FIELD
    ],
    documents: [
      { key: "agreement", label: "Rent Agreement / Proof", required: true, hint: "Rent agreement, or a written note from the landlord" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays the landlord directly. Givethra may call the landlord to verify.",
    guide: [
      "Enter the landlord's name and contact number — Givethra may call to verify.",
      "Tell us how many months of rent, the monthly amount, and your household size.",
      "Upload the rent agreement or a proof from the landlord.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE household's rent."
  },
  "School Fees": {
    fields: [
      { key: "institute_name", label: "School / College / University Name", placeholder: "Full name of the institute", required: true },
      { key: "institute_contact", label: "Institute Contact Number", placeholder: "Office number — Givethra WILL verify", required: true },
      { key: "student_name", label: "Student's Name (ONE student)", placeholder: "Full name of the student", required: true },
      { key: "father_name", label: "Father's Name", placeholder: "Student's father's name", required: true },
      { key: "student_class", label: "Class / Grade / Semester", placeholder: "e.g. Class 5, 2nd Year", required: true },
      { key: "roll_no", label: "Roll No / Registration No", placeholder: "Student's roll or registration number", required: true },
      { key: "challan_no", label: "Fee Challan / Voucher Number", placeholder: "As on the fee challan" },
      { key: "months", label: "Which months / period?", placeholder: "e.g. Sept-Nov 2026" },
      JOB_FIELD
    ],
    documents: [
      { key: "challan", label: "Fee Challan / Voucher", required: true, hint: "Clear photo showing student name, roll no & amount" },
      { key: "student_id", label: "Student's B-Form / Student ID Card", required: true, hint: "Photo of student's ID card or B-form — confirms whose child this is" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays the school/college directly. Givethra WILL call the institute to confirm the student, class and fee before approving.",
    guide: [
      "Enter the institute name and its OFFICE contact number — Givethra will call to verify.",
      "Enter details of ONE student only: name, father's name, class, and roll/registration number.",
      "Upload the fee challan (showing student name & amount) and the student's B-form/ID card.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE student only. Do NOT combine multiple children in one case — submit a separate case for each child."
  },
  "Education & Books": {
    fields: [
      { key: "institute_name", label: "School / Institute / Shop Name", placeholder: "Where books/uniform will be bought", required: true },
      { key: "institute_contact", label: "Contact Number", placeholder: "Institute or shop number — for verification", required: true },
      { key: "student_name", label: "Student's Name (ONE student)", placeholder: "Full name", required: true },
      { key: "father_name", label: "Father's Name", placeholder: "Student's father's name", required: true },
      { key: "student_class", label: "Class / Grade", placeholder: "e.g. Class 5", required: true },
      { key: "needed_items", label: "What is needed?", placeholder: "e.g. books, uniform, stationery", required: true },
      JOB_FIELD
    ],
    documents: [
      { key: "list", label: "Books/Items List or Quotation", required: true, hint: "List from school or shop with prices" },
      { key: "student_id", label: "Student's B-Form / Student ID Card", required: true, hint: "Confirms whose child this is" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays the shop/institute directly for the books/uniform.",
    guide: [
      "Enter the institute/shop name and a contact number for verification.",
      "Enter details of ONE student and exactly what is needed (books, uniform, etc.).",
      "Upload the items list/quotation and the student's B-form/ID card.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE student's education items."
  },
  "Medical & Treatment": {
    fields: [
      { key: "hospital_name", label: "Hospital / Clinic Name", placeholder: "Full name of hospital", required: true },
      { key: "hospital_contact", label: "Hospital Contact Number", placeholder: "Reception/office — Givethra WILL verify", required: true },
      { key: "patient_name", label: "Patient's Name (ONE patient)", placeholder: "Full name of the patient", required: true },
      { key: "illness", label: "Illness / Treatment Needed", placeholder: "e.g. surgery, dialysis, medicine", required: true },
      { key: "mr_no", label: "MR No / Bill No", placeholder: "Medical record or bill number" },
      { key: "doctor_name", label: "Doctor's Name (optional)", placeholder: "Treating doctor" },
      JOB_FIELD
    ],
    documents: [
      { key: "report", label: "Medical Report / Doctor's Prescription", required: true, hint: "Doctor's report, prescription, or diagnosis slip" },
      { key: "bill", label: "Hospital Bill / Cost Estimate", required: true, hint: "Hospital's bill or estimate slip showing the amount" },
      { key: "patient_id", label: "Patient's CNIC / B-Form (optional)" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays the hospital directly. Givethra WILL call the hospital to confirm the patient and treatment before approving.",
    guide: [
      "Enter the hospital name and its contact number — Givethra will call to verify.",
      "Enter details of ONE patient: name, illness/treatment, and MR/bill number.",
      "Upload the medical report/prescription AND the hospital bill/estimate — these are two separate documents.",
      "Answer the job question. Bank statement is optional here since medical needs can be urgent.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE patient and ONE treatment only."
  },
  "Medicines": {
    fields: [
      { key: "pharmacy_name", label: "Which Medical Store will you buy from?", placeholder: "Store name — Heroes will pay this store directly", required: true },
      { key: "pharmacy_contact", label: "Medical Store Contact (optional)", placeholder: "For verification" },
      { key: "patient_name", label: "Patient's Name (ONE patient)", placeholder: "Full name", required: true },
      { key: "illness", label: "Illness / Condition", placeholder: "What is being treated", required: true },
      JOB_FIELD
    ],
    documents: [
      { key: "prescription", label: "Doctor's Prescription Slip", required: true, hint: "Clear photo of the doctor's prescription" },
      { key: "estimate", label: "Medical Store's Bill / Estimate Slip", required: true, hint: "The medical store's own estimate showing medicines & price" },
      SALARY_DOC,
      { ...STATEMENT_DOC, required: true }
    ],
    paymentNote: "The Hero pays the medical store directly for the prescribed medicines.",
    guide: [
      "Enter which medical store you'll buy from (and contact if possible).",
      "Enter ONE patient's name and condition.",
      "Upload the doctor's prescription slip AND the medical store's separate bill/estimate slip.",
      "Answer the job question, and attach proof of income if available.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE patient's medicines."
  },
  "Food & Groceries": {
    fields: [
      { key: "provider_name", label: "Which shop/store will you get groceries from?", placeholder: "Shop name — Heroes will pay this shop directly", required: true },
      { key: "provider_contact", label: "Shop Contact Number", placeholder: "For verification — Givethra may call", required: true },
      { key: "sons", label: "How many sons?", type: "number" },
      { key: "daughters", label: "How many daughters?", type: "number" },
      { key: "wife_status", label: "Wife / spouse included in household?", placeholder: "e.g. Yes, 1 wife" },
      JOB_FIELD
    ],
    documents: [
      { key: "list", label: "Grocery List / Estimate (optional)", hint: "Ration list from the shop if available" },
      SALARY_DOC,
      { ...STATEMENT_DOC, required: true }
    ],
    paymentNote: "The Hero pays the shopkeeper directly. Givethra may call them to confirm you are genuinely in need.",
    guide: [
      "Enter the shop name and contact number — Heroes will pay this shop directly.",
      "Tell us your family details: sons, daughters, and spouse status.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement — this is required.",
      "Givethra may call the shopkeeper to confirm you are genuinely deserving.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE household's ration need."
  },
  // FIXED: Removed provider_name and provider_contact from Child Support
  // because it has fixed stipend and payment receiver is handled separately
  "Child Support": {
    fields: [
      { key: "sons", label: "Number of sons", type: "number" },
      { key: "daughters", label: "Number of daughters", type: "number" },
      { key: "parents_status", label: "Are the parents alive?", placeholder: "e.g. father passed away, mother alive", required: true },
      JOB_FIELD
    ],
    documents: [
      // FIXED: Removed frc from here - it's now handled by extraConditionalDocs() based on gender
      // { key: "frc", label: "Family Registration Certificate (FRC)", required: true, hint: "NADRA FRC showing family members" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "This is a fixed monthly support. The amount is set by Givethra and paid directly to the guardian.",
    guide: [
      "Enter the family details: number of sons, daughters, and parents' status.",
      "Select gender and marital status in the form above.",
      "Required documents (FRC, death certificates etc.) will be asked based on your gender selection.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE household."
  },
  // FIXED: Removed provider_name and provider_contact from Widow & Elderly
  // Removed death_cert, nikah_nama, frc - they are handled by extraConditionalDocs() based on gender
  "Widow & Elderly Support": {
    fields: [
      { key: "sons", label: "Number of sons", type: "number" },
      { key: "daughters", label: "Number of daughters", type: "number" },
      { key: "support_type", label: "Monthly or one-time help?", placeholder: "e.g. one-time ration, monthly support", required: true },
      JOB_FIELD
    ],
    documents: [
      // FIXED: Removed these - they are now handled by extraConditionalDocs() based on gender/marital status
      // { key: "death_cert", label: "Husband's Death Certificate (for widow cases)", required: true, hint: "REQUIRED for widow cases — husband's (not mother's) death certificate" },
      // { key: "nikah_nama", label: "Nikah Nama (Marriage Certificate)", required: true, hint: "REQUIRED for widow cases" },
      // { key: "frc", label: "Family Registration Certificate (FRC)", required: true, hint: "NADRA FRC" },
      STATEMENT_DOC
    ],
    paymentNote: "This is a fixed monthly support. The amount is set by Givethra and paid directly to the beneficiary.",
    guide: [
      "Enter family details and whether help is one-time or monthly.",
      "Select gender and marital status in the form above.",
      "Required documents (death certificate, nikah nama, FRC etc.) will be asked based on your gender selection.",
      "Attach a 6-month bank/Easypaisa/JazzCash statement if you have one.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE widow/elderly person's household."
  },
  "Home Repair": {
    fields: [
      { key: "repair_type", label: "What needs repair?", placeholder: "e.g. roof, plumbing, electricity", required: true },
      { key: "property_owner_name", label: "Property Owner Name", placeholder: "Full name of owner", required: true },
      { key: "property_owner_contact", label: "Owner Contact Number", placeholder: "For verification", required: true },
      { key: "repair_cost", label: "Estimated Repair Cost", placeholder: "e.g. 25000", required: true, type: "number" },
      { key: "contractor_name", label: "Contractor / Shop Name (optional)", placeholder: "Who will do the repair" },
      { key: "contractor_contact", label: "Contractor Contact (optional)", placeholder: "For payment arrangement" },
      JOB_FIELD
    ],
    documents: [
      { key: "repair_estimate", label: "Repair Estimate / Quotation", required: true, hint: "Photo of the contractor's estimate or quotation slip" },
      { key: "property_photo", label: "Photo of the Damage / Area", required: true, hint: "Clear photo showing what needs repair" },
      { key: "ownership_proof", label: "Proof of Ownership (or Landlord Permission)", required: true, hint: "If owned: property document. If rented: landlord's written permission letter" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays the contractor/shop directly for the repair work.",
    guide: [
      "Enter what needs repair and the estimated cost.",
      "Enter the property owner's name and contact — Givethra may verify.",
      "Upload the repair estimate/quotation, a photo of the damage, and proof of ownership/permission.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE repair job for ONE property."
  },
  // FIXED: Removed disability_type from here - it's handled separately in SubmitRequestPage
  "Disability Support": {
    fields: [
      // { key: "disability_type", label: "Type of disability", placeholder: "e.g. physical, visual", required: true },
      JOB_FIELD
    ],
    documents: [
      { key: "disability_cnic", label: "CNIC showing Disability (or Disability Certificate)", required: true, hint: "REQUIRED — CNIC that marks the person as disabled, or an official disability certificate" },
      { key: "disability_photo", label: "Photo of the Disability", required: true, hint: "A clear photo showing the disability, for verification" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays according to what is needed — a shop (for equipment), a hospital (for treatment), or the person directly (for a stipend).",
    guide: [
      "Choose what kind of help is needed: Equipment, Treatment, or Monthly Stipend.",
      "You MUST upload the CNIC that shows disability status AND a clear photo of the disability.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE person with disability."
  },
  "Marriage Support": {
    fields: [
      { key: "bride_name", label: "Bride's Name", placeholder: "Full name of the bride", required: true },
      { key: "groom_name", label: "Groom's Name", placeholder: "Full name of the groom", required: true },
      { key: "marriage_date", label: "Marriage Date (expected)", placeholder: "e.g. 15 July 2026" },
      { key: "expenses_breakdown", label: "What expenses are needed?", placeholder: "e.g. food, clothes, hall", required: true },
      { key: "provider_name", label: "Who will receive payment? (name)", placeholder: "Person, shop, or organization", required: true },
      { key: "provider_contact", label: "Contact Number", placeholder: "For verification", required: true },
      JOB_FIELD
    ],
    documents: [
      { key: "nikah_nama", label: "Nikah Nama (Marriage Certificate) or engagement proof", required: true, hint: "Proof that the marriage is genuine" },
      { key: "expense_estimate", label: "Expense Estimate / Quotation", required: true, hint: "List of estimated expenses from vendors" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays the vendor/service provider directly.",
    guide: [
      "Enter bride and groom names, marriage date, and a breakdown of expenses.",
      "Upload the Nikah Nama or engagement proof and expense estimates.",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE marriage event."
  },
  "Business / Work Help": {
    fields: [
      { key: "business_name", label: "Business Name", placeholder: "Name of your business", required: true },
      { key: "business_type", label: "Type of Business", placeholder: "e.g. shop, freelance, agriculture", required: true },
      { key: "help_needed", label: "What help do you need?", placeholder: "e.g. raw materials, equipment, rent", required: true },
      { key: "provider_name", label: "Who will receive payment? (name)", placeholder: "Supplier, shop, or person", required: true },
      { key: "provider_contact", label: "Contact Number", placeholder: "For verification", required: true },
      { key: "amount_needed", label: "Estimated Amount Needed", placeholder: "e.g. 50000", required: true, type: "number" },
      JOB_FIELD
    ],
    documents: [
      { key: "business_proof", label: "Business Proof (e.g. shop photo, registration, invoice)", required: true, hint: "Show that you have a business" },
      { key: "estimate", label: "Estimate / Quotation for the help needed", required: true, hint: "From supplier or service provider" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays the supplier/provider directly.",
    guide: [
      "Enter your business name, type, and what help you need.",
      "Upload proof of your business and the estimate for the required help.",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE business or work-related help."
  },
  "Funeral Expenses": {
    fields: [
      { key: "deceased_name", label: "Name of Deceased Person", placeholder: "Full name", required: true },
      { key: "deceased_relation", label: "Relation to you", placeholder: "e.g. My father, My mother", required: true },
      { key: "funeral_date", label: "Date of Funeral", placeholder: "e.g. 20 June 2026", required: true },
      { key: "expenses_needed", label: "What funeral expenses need coverage?", placeholder: "e.g. burial, transport, food", required: true },
      { key: "provider_name", label: "Who will receive payment? (name)", placeholder: "Funeral service provider or person", required: true },
      { key: "provider_contact", label: "Contact Number", placeholder: "For verification", required: true },
      JOB_FIELD
    ],
    documents: [
      { key: "death_cert", label: "Death Certificate (or hospital report)", required: true, hint: "Proof of death" },
      { key: "funeral_bill", label: "Funeral Service Bill / Estimate", required: true, hint: "Bill or quotation from funeral service" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays the funeral service provider directly.",
    guide: [
      "Enter the deceased's name, your relation, and funeral date.",
      "Upload death certificate and funeral service bill.",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE funeral."
  },
  "Livestock / Farming": {
    fields: [
      { key: "livestock_type", label: "Type of Livestock / Animals", placeholder: "e.g. cows, goats, poultry", required: true },
      { key: "number_of_animals", label: "Number of Animals", placeholder: "e.g. 5 cows", required: true },
      { key: "help_needed", label: "What help do you need?", placeholder: "e.g. feed, medicine, shelter", required: true },
      { key: "provider_name", label: "Who will receive payment? (name)", placeholder: "Feed shop, vet, or person", required: true },
      { key: "provider_contact", label: "Contact Number", placeholder: "For verification", required: true },
      JOB_FIELD
    ],
    documents: [
      { key: "livestock_photo", label: "Photo of Livestock / Farm", required: true, hint: "Show your animals and condition" },
      { key: "estimate", label: "Estimate / Bill for needed supplies", required: true, hint: "From feed shop or vet" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays the supplier/vet directly.",
    guide: [
      "Enter the type and number of animals, and what help is needed.",
      "Upload a photo of the livestock and the estimate for supplies.",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE livestock/farming need."
  },
  "Debt Relief": {
    fields: [
      { key: "creditor_name", label: "Creditor / Lender Name", placeholder: "Who do you owe money to?", required: true },
      { key: "creditor_contact", label: "Creditor Contact Number", placeholder: "For verification", required: true },
      { key: "debt_amount", label: "Total Debt Amount", placeholder: "e.g. 100000", required: true, type: "number" },
      { key: "debt_reason", label: "How did this debt occur?", placeholder: "e.g. medical emergency, business loss", required: true },
      JOB_FIELD
    ],
    documents: [
      { key: "debt_proof", label: "Debt Proof (loan agreement, receipts)", required: true, hint: "Proof that you owe the money" },
      { key: "income_proof", label: "Income Proof (optional but helpful)", hint: "Payslip or bank statement" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays the creditor directly after verification.",
    guide: [
      "Enter creditor details, total debt, and the reason for debt.",
      "Upload proof of debt (loan agreement, receipts).",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE debt obligation."
  },
  "Emergency Help": {
    fields: [
      { key: "emergency_type", label: "Type of Emergency", placeholder: "e.g. accident, fire, flood", required: true },
      { key: "help_needed", label: "What immediate help do you need?", placeholder: "e.g. medical, shelter, food", required: true },
      { key: "provider_name", label: "Who will receive payment? (name)", placeholder: "Hospital, shop, or person", required: true },
      { key: "provider_contact", label: "Contact Number", placeholder: "For verification", required: true },
      JOB_FIELD
    ],
    documents: [
      { key: "emergency_photo", label: "Photo / Evidence of Emergency", required: true, hint: "Clear photo showing the situation" },
      { key: "estimate", label: "Estimate / Bill for needed help", required: true, hint: "From service provider" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays the provider directly for emergency relief.",
    guide: [
      "Enter the type of emergency and what help is needed immediately.",
      "Upload photo evidence and an estimate/bill.",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE emergency situation."
  },
  "Other": {
    fields: [
      { key: "help_needed", label: "What help do you need?", placeholder: "Describe in detail", required: true },
      { key: "provider_name", label: "Who will receive payment? (name)", placeholder: "Person, shop, or organization", required: true },
      { key: "provider_contact", label: "Contact Number", placeholder: "For verification", required: true },
      JOB_FIELD
    ],
    documents: [
      { key: "supporting_doc", label: "Supporting Document / Evidence", required: true, hint: "Any document that supports your request" },
      SALARY_DOC,
      STATEMENT_DOC
    ],
    paymentNote: "The Hero pays the recipient directly after review.",
    guide: [
      "Clearly describe what help you need and why.",
      "Upload any supporting document that explains your situation.",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL$1
    ],
    oneCaseNote: "One case = ONE request."
  }
};
function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] || null;
}
function checkCreditGate({
  balance,
  required = 1,
  isFreeAllowed = false,
  navigate
}) {
  if (isFreeAllowed || balance >= required) return true;
  ue.error(`You need ${required} credit${required === 1 ? "" : "s"} to continue.`);
  navigate({ to: "/wallet" });
  return false;
}
const CATEGORY_LIMITS = {
  "Widow & Elderly Support": { type: "fixed", amount: 6e3, label: "Fixed Stipend" },
  "Child Support": { type: "fixed", amount: 6e3, label: "Fixed Stipend" },
  "Disability Support": { type: "fixed", amount: 6e3, label: "Fixed Stipend" },
  "Electricity Bill": { type: "verified", label: "1 Month Verified Bill" },
  "Gas Bill": { type: "verified", label: "1 Month Verified Bill" },
  "Water Bill": { type: "verified", label: "1 Month Verified Bill" },
  "House Rent": { type: "verified", label: "1 Month Verified Rent" },
  "School, College & University Fees": { type: "verified", label: "1 Student / 1 Month Verified Fee" },
  "Education, Books & Admission": { type: "verified", label: "Verified Cost" },
  "Food & Groceries": { type: "max", maxAmount: 12e3, label: "Max Rs 12,000 per family" },
  "Medicines": { type: "verified", label: "Verified Prescription Cost" },
  "Medical & Treatment": { type: "verified", label: "Verified Treatment Bill" },
  "Home Repair": { type: "max", maxAmount: 18e3, label: "Max Rs 18,000" },
  "Debt Relief": { type: "debt_percentage", percentage: 5, maxAmount: 25e3, label: "5% of debt (max Rs 25,000)" },
  "Business / Work Help": { type: "max", maxAmount: 2e4, label: "Rs 8,000–20,000" },
  "Marriage Support": { type: "verified", label: "Verified Need" },
  "Funeral Expenses": { type: "verified", label: "Verified Need" },
  "Livestock / Farming": { type: "verified", label: "Verified Need" },
  "Emergency Help": { type: "verified", label: "Verified Need" }
};
const CATEGORIES = [
  "Electricity Bill",
  "Gas Bill",
  "Water Bill",
  "House Rent",
  "School, College & University Fees",
  "Education, Books & Admission",
  "Medical & Treatment",
  "Medicines",
  "Food & Groceries",
  "Child Support",
  "Widow & Elderly Support",
  "Disability Support",
  "Marriage Support",
  "Business / Work Help",
  "Home Repair",
  "Funeral Expenses",
  "Livestock / Farming",
  "Debt Relief",
  "Emergency Help"
];
const STEPS = ["Basic Info", "Category Details", "Verification", "Review"];
const CASE_CURRENCIES = ["PKR", "USD", "SAR", "AED", "GBP", "EUR", "INR", "BDT", "TRY"];
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
  NPR: "Rs",
  LKR: "Rs"
};
const SS_KEY = "givethra_submit_draft_v4";
const COMMON_GUIDE_TAIL = [
  "Upload clear documents so Givethra can verify your case.",
  "Take a live selfie and record a video explaining your need in your own words.",
  "Your first case is FREE. After that, a 1 credit listing fee applies."
];
const MAX_REJECTIONS_BEFORE_SUSPENSION = 5;
const UNLOCK_CREDITS_REQUIRED = 5;
const MAX_FREE_CASES = 2;
const UTILITY_CATS = {
  "Electricity Bill": { companies: ELECTRICITY_COMPANIES },
  "Gas Bill": { companies: GAS_COMPANIES },
  "Water Bill": { companies: WATER_COMPANIES }
};
const EDUCATION_SUB_OPTIONS = [
  { value: "admission", label: "🎓 Admission Fee" },
  { value: "books", label: "📚 Books / Study Materials" },
  { value: "uniform", label: "👕 Uniform / Shoes" }
];
const FEE_SUB_OPTIONS = [
  { value: "school", label: "🏫 School Fee" },
  { value: "college", label: "🎓 College Fee" },
  { value: "university", label: "🏛️ University Fee" }
];
const EDUCATION_ADMISSION_FIELDS = {
  School: [
    { key: "institute_name", label: "School Name", required: true, placeholder: "e.g. Beaconhouse School System" },
    { key: "class_grade", label: "Class / Grade", required: true, placeholder: "e.g. Grade 8" },
    { key: "admission_type", label: "Admission Type", required: true, choices: ["New Admission", "Re-admission", "Transfer"] },
    { key: "admission_status", label: "Admission Status", required: true, choices: ["Selected", "Admission Offered", "Confirmed"] }
  ],
  College: [
    { key: "institute_name", label: "College Name", required: true, placeholder: "e.g. Government College University" },
    { key: "program", label: "Program / Class", required: true, choices: ["FA", "FSc", "ICS", "I.Com", "Other"] },
    { key: "year", label: "Year", required: true, choices: ["1st Year", "2nd Year"] },
    { key: "admission_status", label: "Admission Status", required: true, choices: ["Selected", "Admission Offered", "Confirmed"] }
  ],
  University: [
    { key: "institute_name", label: "University Name", required: true, placeholder: "e.g. National University of Modern Languages" },
    { key: "program_degree", label: "Program / Degree", required: true, placeholder: "e.g. BS Psychology" },
    { key: "semester_year", label: "Semester / Year", required: true, placeholder: "e.g. Fall 2026" },
    { key: "admission_status", label: "Admission Status", required: true, choices: ["Selected", "Admission Offered", "Confirmed", "Waiting List"] }
  ]
};
const EDUCATION_FEE_FIELDS = {
  School: [
    { key: "institute_name", label: "School Name", required: true, placeholder: "e.g. Beaconhouse School System" },
    { key: "class_grade", label: "Class / Grade", required: true, placeholder: "e.g. Grade 8" },
    { key: "fee_month", label: "Fee Month", required: true, placeholder: "e.g. August 2026" }
  ],
  College: [
    { key: "institute_name", label: "College Name", required: true, placeholder: "e.g. Government College University" },
    { key: "program", label: "Program / Class", required: true, choices: ["FA", "FSc", "ICS", "I.Com", "Other"] },
    { key: "year", label: "Year", required: true, choices: ["1st Year", "2nd Year"] },
    { key: "fee_month", label: "Fee Month", required: true, placeholder: "e.g. August 2026" }
  ],
  University: [
    { key: "institute_name", label: "University Name", required: true, placeholder: "e.g. National University of Modern Languages" },
    { key: "program_degree", label: "Program / Degree", required: true, placeholder: "e.g. BS Psychology" },
    { key: "semester_year", label: "Semester / Year", required: true, placeholder: "e.g. Fall 2026" },
    { key: "fee_month", label: "Fee Month", required: true, placeholder: "e.g. August 2026" }
  ]
};
function getEducationDocs(type, subType) {
  const docs = [];
  if (type === "admission") {
    docs.push({
      key: "admission_proof",
      label: "Admission / Selection Proof (Offer Letter / Merit List)",
      required: true,
      hint: "Clear photo of offer letter or merit list"
    });
    docs.push({
      key: "fee_challan",
      label: "Fee Challan / Voucher (with amount & due date)",
      required: true,
      hint: "Challan should clearly show amount and due date"
    });
    docs.push({
      key: "student_id_proof",
      label: "Student B-Form / CNIC / School ID",
      required: true,
      hint: "Clear proof of student identity"
    });
  } else if (type === "fee") {
    docs.push({
      key: "fee_challan",
      label: "Fee Challan / Voucher (with amount & due date)",
      required: true,
      hint: "Challan should clearly show amount and due date"
    });
    docs.push({
      key: "student_id_proof",
      label: "Student B-Form / CNIC / School ID",
      required: true,
      hint: "Clear proof of student identity"
    });
  } else if (type === "books") {
    docs.push({
      key: "books_quotation",
      label: "Books List / Quotation from Shop",
      required: true,
      hint: "Clear photo of book list and price quotation"
    });
    docs.push({
      key: "student_id_proof",
      label: "Student B-Form / School/College ID",
      required: true,
      hint: "Student identity proof"
    });
  } else if (type === "uniform") {
    docs.push({
      key: "uniform_quotation",
      label: "Uniform List / Quotation from Shop",
      required: true,
      hint: "Clear photo of uniform items and price quotation"
    });
    docs.push({
      key: "student_id_proof",
      label: "Student B-Form / School/College ID",
      required: true,
      hint: "Student identity proof"
    });
    docs.push({
      key: "uniform_items",
      label: "Items Needed (List photo or written)",
      required: true,
      hint: "List of uniform items (shoes, bag, winter uniform etc.)"
    });
  }
  return docs;
}
const PAYMENT_RECEIVER_CATS = /* @__PURE__ */ new Set([
  "House Rent",
  "Food & Groceries",
  "Medicines",
  "Home Repair",
  "Debt Relief",
  "Business / Work Help",
  "Marriage Support",
  "Funeral Expenses",
  "Livestock / Farming",
  "Emergency Help",
  "Other"
]);
const LIST_CATS = {
  "School, College & University Fees": {
    list: EDUCATION_INSTITUTES,
    refLabel: "Fee Challan / Voucher Number",
    refHint: EDUCATION_REF_HINT,
    personFields: [
      { key: "student_name", label: "Student's Name (ONE student)", required: true, placeholder: "Full name of student" },
      { key: "father_name", label: "Father's Name", required: true, placeholder: "Father's full name" },
      { key: "roll_no", label: "Roll No / Registration No", required: true, placeholder: "Student's roll number" }
    ],
    billLabel: "Fee Challan / Voucher Photo",
    isEducationCategory: true,
    subOptions: FEE_SUB_OPTIONS,
    getSubFields: (subType, subValue) => {
      if (subType === "school") return EDUCATION_FEE_FIELDS.School;
      if (subType === "college") return EDUCATION_FEE_FIELDS.College;
      if (subType === "university") return EDUCATION_FEE_FIELDS.University;
      return [];
    },
    getSubDocs: (subType, subValue) => {
      return getEducationDocs("fee");
    }
  },
  "Education, Books & Admission": {
    list: EDUCATION_INSTITUTES,
    refLabel: "Challan / Reference Number",
    refHint: "If available, enter the challan or quotation reference number",
    personFields: [
      { key: "student_name", label: "Student's Name (ONE student)", required: true, placeholder: "Full name of student" },
      { key: "student_class", label: "Class / Grade / Program", required: true, placeholder: "e.g. Grade 8, FA, BS" }
    ],
    billLabel: "Bill / Challan / Quotation Photo",
    isEducationCategory: true,
    subOptions: EDUCATION_SUB_OPTIONS,
    getSubFields: (subType, subValue) => {
      if (subType === "admission") {
        if (subValue === "School") return EDUCATION_ADMISSION_FIELDS.School;
        if (subValue === "College") return EDUCATION_ADMISSION_FIELDS.College;
        if (subValue === "University") return EDUCATION_ADMISSION_FIELDS.University;
        return [];
      }
      return [];
    },
    getSubDocs: (subType, subValue) => {
      return getEducationDocs(subType);
    }
  },
  "Medical & Treatment": {
    list: HEALTH_INSTITUTES,
    refLabel: "Bill / Invoice / MR Number",
    refHint: HEALTH_REF_HINT,
    personFields: [
      { key: "patient_name", label: "Patient's Name (ONE patient)", required: true, placeholder: "Full name of patient" },
      { key: "illness", label: "Illness / Treatment Needed", required: true, placeholder: "Brief description of illness" }
    ],
    billLabel: "Hospital Bill / Medical Receipt Photo"
  },
  "Medicines": {
    list: HEALTH_INSTITUTES,
    refLabel: "Invoice / Prescription Number (if any)",
    refHint: HEALTH_REF_HINT,
    personFields: [
      { key: "patient_name", label: "Patient's Name (ONE patient)", required: true, placeholder: "Full name of patient" },
      { key: "illness", label: "Illness / Condition", required: true, placeholder: "Brief description of condition" }
    ],
    billLabel: "Prescription / Medicine Estimate Photo",
    extraDocs: [
      {
        key: "doctor_report",
        label: "Doctor's Report / Prescription",
        required: true,
        hint: "Clear photo of the doctor's written report or prescription"
      }
    ]
  }
};
function isEasyCat(cat) {
  return !!UTILITY_CATS[cat] || !!LIST_CATS[cat];
}
const DISABILITY_STIPEND_AMOUNT = 6e3;
const PROPERTY_RELEVANT_CATS = /* @__PURE__ */ new Set([
  "Electricity Bill",
  "Gas Bill",
  "Water Bill",
  "House Rent",
  "Food & Groceries"
]);
const PERSONAL_PAYMENT_CATS = /* @__PURE__ */ new Set([
  "House Rent",
  "Marriage Support",
  "Business / Work Help",
  "Home Repair",
  "Funeral Expenses",
  "Livestock / Farming",
  "Debt Relief",
  "Emergency Help",
  "Other",
  "Food & Groceries",
  "Medicines"
]);
const FIXED_STIPEND_CATS = /* @__PURE__ */ new Set(["Child Support", "Widow & Elderly Support", "Disability Support"]);
const SKIP_FIELDS = /* @__PURE__ */ new Set([
  "provider_name",
  "provider_contact",
  "landlord_name",
  "landlord_contact",
  "creditor_name",
  "creditor_contact",
  "receiver_name",
  "receiver_contact"
]);
function getCategoryLimit(category) {
  return CATEGORY_LIMITS[category] || null;
}
function isFixedAmountCategory(category) {
  const limit = getCategoryLimit(category);
  return (limit == null ? void 0 : limit.type) === "fixed";
}
function getFixedAmount(category) {
  const limit = getCategoryLimit(category);
  return (limit == null ? void 0 : limit.type) === "fixed" ? limit.amount || null : null;
}
function getMaxAmount(category) {
  const limit = getCategoryLimit(category);
  if ((limit == null ? void 0 : limit.type) === "max") return limit.maxAmount || null;
  if ((limit == null ? void 0 : limit.type) === "debt_percentage") return limit.maxAmount || null;
  return null;
}
function calculateDebtAmount(debtTotal) {
  const limit = CATEGORY_LIMITS["Debt Relief"];
  if (!limit || limit.type !== "debt_percentage") return 0;
  const percentage = limit.percentage;
  const maxAmount = limit.maxAmount;
  const calculated = debtTotal * percentage / 100;
  return Math.min(calculated, maxAmount);
}
function urgencyFromDue(due) {
  if (!due) return "";
  const days = Math.ceil((new Date(due).getTime() - Date.now()) / (1e3 * 60 * 60 * 24));
  if (days <= 31) return "Emergency";
  if (days <= 62) return "Medium";
  return "Low";
}
function StepGuide({ lines }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm text-foreground/80 space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-primary font-semibold text-xs uppercase tracking-wide", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3.5 w-3.5" }),
      " How to fill this page"
    ] }),
    lines.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      "• ",
      l
    ] }, i))
  ] });
}
function saveDraft(data) {
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify(data));
  } catch {
  }
}
function loadDraft() {
  try {
    const s = sessionStorage.getItem(SS_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
function clearDraft() {
  try {
    sessionStorage.removeItem(SS_KEY);
  } catch {
  }
}
const YES_NO_FIELDS = /* @__PURE__ */ new Set(["job_status", "wife_status"]);
const COUNTER_FIELDS = /* @__PURE__ */ new Set(["sons", "daughters"]);
const CHOICE_FIELDS = {
  parents_status: ["Both alive", "Father passed away", "Mother passed away", "Both passed away"],
  support_type: ["One-time help", "Monthly support"],
  disability_type: ["Physical", "Visual", "Hearing", "Intellectual", "Other"],
  relation: ["My daughter", "My son", "My sister", "My brother", "Myself", "Other relative"],
  deceased_relation: ["My father", "My mother", "My husband", "My wife", "My child", "Other relative"],
  pay_to_type: ["Shopkeeper", "Person", "Organization / Institute"]
};
const GENDER_OPTIONS = ["Male", "Female", "Child"];
const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Widow", "Divorced"];
function SubmitRequestPage() {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = reactExports.useState(1);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [kycStatus, setKycStatus] = reactExports.useState(null);
  const [kycLoading, setKycLoading] = reactExports.useState(true);
  const [balance, setBalance] = reactExports.useState(0);
  const [currency, setCurrency] = reactExports.useState("PKR");
  const [userRejectionCount, setUserRejectionCount] = reactExports.useState(0);
  const [userTotalCases, setUserTotalCases] = reactExports.useState(0);
  const [userFreeCasesUsed, setUserFreeCasesUsed] = reactExports.useState(0);
  const [isFreeDisabled, setIsFreeDisabled] = reactExports.useState(false);
  const [isSuspended, setIsSuspended] = reactExports.useState(false);
  const [suspensionCount, setSuspensionCount] = reactExports.useState(0);
  const [loadingUserStats, setLoadingUserStats] = reactExports.useState(true);
  const [unlocking, setUnlocking] = reactExports.useState(false);
  const [tried1, setTried1] = reactExports.useState(false);
  const [tried2, setTried2] = reactExports.useState(false);
  const [category, setCategory] = reactExports.useState("");
  const [title, setTitle] = reactExports.useState("");
  const [shortDesc, setShortDesc] = reactExports.useState("");
  const [country, setCountry] = reactExports.useState("");
  const [city, setCity] = reactExports.useState("");
  const [urgency, setUrgency] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [amount, setAmount] = reactExports.useState("");
  const [debtTotalAmount, setDebtTotalAmount] = reactExports.useState("");
  const [calculatedDebtAmount, setCalculatedDebtAmount] = reactExports.useState(0);
  const [deadline, setDeadline] = reactExports.useState("");
  const [instituteName, setInstituteName] = reactExports.useState("");
  const [instituteSearch, setInstituteSearch] = reactExports.useState("");
  const [isOtherInstitute, setIsOtherInstitute] = reactExports.useState(false);
  const [otherName, setOtherName] = reactExports.useState("");
  const [otherContact, setOtherContact] = reactExports.useState("");
  const [otherAddress, setOtherAddress] = reactExports.useState("");
  const [refNumber, setRefNumber] = reactExports.useState("");
  const [jobStatus, setJobStatus] = reactExports.useState("");
  const [gender, setGender] = reactExports.useState("");
  const [maritalStatus, setMaritalStatus] = reactExports.useState("");
  const [isOrphan, setIsOrphan] = reactExports.useState("");
  const [orphanParent, setOrphanParent] = reactExports.useState("");
  const [seekerName, setSeekerName] = reactExports.useState("");
  const [seekerContact, setSeekerContact] = reactExports.useState("");
  const [receiverName, setReceiverName] = reactExports.useState("");
  const [receiverContact, setReceiverContact] = reactExports.useState("");
  const [receiverBank, setReceiverBank] = reactExports.useState("");
  const [receiverAccount, setReceiverAccount] = reactExports.useState("");
  const [receiverAddress, setReceiverAddress] = reactExports.useState("");
  const [receiverShopName, setReceiverShopName] = reactExports.useState("");
  const [disabilityMode, setDisabilityMode] = reactExports.useState("");
  const [disabilityShopName, setDisabilityShopName] = reactExports.useState("");
  const [disabilityShopContact, setDisabilityShopContact] = reactExports.useState("");
  const [disabilityHospital, setDisabilityHospital] = reactExports.useState("");
  const [disabilityHospitalSearch, setDisabilityHospitalSearch] = reactExports.useState("");
  const [disabilityHospitalOther, setDisabilityHospitalOther] = reactExports.useState(false);
  const [disabilityBankTitle, setDisabilityBankTitle] = reactExports.useState("");
  const [disabilityBankNumber, setDisabilityBankNumber] = reactExports.useState("");
  const [treatmentAmount, setTreatmentAmount] = reactExports.useState("");
  const [treatmentExpiry, setTreatmentExpiry] = reactExports.useState("");
  const [treatmentPatientNumber, setTreatmentPatientNumber] = reactExports.useState("");
  const [disabilityType, setDisabilityType] = reactExports.useState("");
  const [disabilityReason, setDisabilityReason] = reactExports.useState("");
  const [eduSubType, setEduSubType] = reactExports.useState(
    ""
  );
  const [eduAdmissionLevel, setEduAdmissionLevel] = reactExports.useState("");
  const [eduSubFields, setEduSubFields] = reactExports.useState({});
  const [propertyOwnership, setPropertyOwnership] = reactExports.useState("");
  const [catFields, setCatFields] = reactExports.useState({});
  const [catDocUrls, setCatDocUrls] = reactExports.useState({});
  const [catDocNames, setCatDocNames] = reactExports.useState({});
  const [uploadingDoc, setUploadingDoc] = reactExports.useState(null);
  const [selfieUrl, setSelfieUrl] = reactExports.useState("");
  const [selfiePreview, setSelfiePreview] = reactExports.useState(null);
  const [videoUrl, setVideoUrl] = reactExports.useState("");
  const [videoPreview, setVideoPreview] = reactExports.useState(null);
  const [confirmed, setConfirmed] = reactExports.useState(false);
  const [uploadingSelfie, setUploadingSelfie] = reactExports.useState(false);
  const [uploadingVideo, setUploadingVideo] = reactExports.useState(false);
  const [cameraOn, setCameraOn] = reactExports.useState(false);
  const [stream, setStream] = reactExports.useState(null);
  const videoRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const [videoRecording, setVideoRecording] = reactExports.useState(false);
  const [videoTimer, setVideoTimer] = reactExports.useState(0);
  const liveVideoRef = reactExports.useRef(null);
  const mediaRecorderRef = reactExports.useRef(null);
  const videoChunksRef = reactExports.useRef([]);
  const [offer, setOffer] = reactExports.useState(null);
  const [hasClaimedOfferBefore, setHasClaimedOfferBefore] = reactExports.useState(false);
  const [activeCaseCount, setActiveCaseCount] = reactExports.useState(0);
  const [restored, setRestored] = reactExports.useState(false);
  const [blockedByFeedback, setBlockedByFeedback] = reactExports.useState(null);
  const [checkingFeedback, setCheckingFeedback] = reactExports.useState(true);
  const easy = isEasyCat(category);
  const utilCfg = UTILITY_CATS[category];
  const listCfg = LIST_CATS[category];
  const config = category && !easy ? getCategoryConfig(category) : null;
  const cfgFields = (config == null ? void 0 : config.fields) ?? [];
  const cfgDocs = (config == null ? void 0 : config.documents) ?? [];
  (config == null ? void 0 : config.guide) ?? [];
  const cfgOneCase = (config == null ? void 0 : config.oneCaseNote) ?? "";
  const selectedCompany = utilCfg == null ? void 0 : utilCfg.companies.find((c) => c.name === instituteName);
  const autoUrgency = easy ? urgencyFromDue(deadline) : "";
  const treatmentAutoUrgency = treatmentExpiry ? urgencyFromDue(treatmentExpiry) : "";
  const isEducationCategory = category === "Education, Books & Admission" || category === "School, College & University Fees";
  const needsPaymentReceiver = PAYMENT_RECEIVER_CATS.has(category);
  const canUseFreeCase = () => {
    if (isSuspended || isFreeDisabled) return false;
    return userFreeCasesUsed < MAX_FREE_CASES;
  };
  const hasFixedStipend = () => {
    if (category === "Disability Support" && disabilityMode === "stipend") return true;
    if (FIXED_STIPEND_CATS.has(category)) return true;
    return false;
  };
  const shouldShowPaymentReceiver = () => {
    return PERSONAL_PAYMENT_CATS.has(category) && !hasFixedStipend();
  };
  const isFixedAmount = (cat) => {
    if (cat === "Disability Support" && disabilityMode === "stipend") return true;
    return isFixedAmountCategory(cat);
  };
  const getFixedAmountValue = (cat) => {
    if (cat === "Disability Support" && disabilityMode === "stipend") return DISABILITY_STIPEND_AMOUNT;
    return getFixedAmount(cat);
  };
  const getMaxLimit = (cat) => {
    return getMaxAmount(cat);
  };
  const isDebtCategory = (cat) => {
    return cat === "Debt Relief";
  };
  reactExports.useEffect(() => {
    if (isDebtCategory(category) && debtTotalAmount) {
      const total = parseFloat(debtTotalAmount);
      if (!isNaN(total) && total > 0) {
        const calculated = calculateDebtAmount(total);
        setCalculatedDebtAmount(calculated);
        setAmount(calculated.toString());
      } else {
        setCalculatedDebtAmount(0);
        setAmount("");
      }
    }
  }, [debtTotalAmount, category]);
  async function loadUserStats() {
    if (!(user == null ? void 0 : user.id)) {
      setLoadingUserStats(false);
      return;
    }
    setLoadingUserStats(true);
    try {
      const cases = await getCasesByUser(user.id);
      const totalCases = (cases == null ? void 0 : cases.length) || 0;
      const rejectedCases = (cases == null ? void 0 : cases.filter((c) => c.status === "rejected").length) || 0;
      const freeCasesUsed = (cases == null ? void 0 : cases.filter((c) => c.was_free === true).length) || 0;
      setUserTotalCases(totalCases);
      setUserRejectionCount(rejectedCases);
      setUserFreeCasesUsed(freeCasesUsed);
      const lastFreeRejected = (cases == null ? void 0 : cases.some((c) => c.was_free === true && String(c.status || "").toLowerCase() === "rejected")) || false;
      const canUseFree = freeCasesUsed === 0 || freeCasesUsed === 1 && lastFreeRejected;
      const freeDisabled = rejectedCases >= 3 || freeCasesUsed >= MAX_FREE_CASES || !canUseFree;
      setIsFreeDisabled(freeDisabled);
      const suspensionData = await getUserSuspension(user.id);
      if (suspensionData) {
        setIsSuspended(suspensionData.is_active);
        setSuspensionCount(suspensionData.suspension_count || 0);
      } else if (rejectedCases >= MAX_REJECTIONS_BEFORE_SUSPENSION) {
        await upsertUserSuspension({
          user_id: user.id,
          suspension_count: 1,
          is_active: true,
          suspended_at: (/* @__PURE__ */ new Date()).toISOString(),
          rejection_count_at_suspension: rejectedCases
        });
        setIsSuspended(true);
        setSuspensionCount(1);
      }
    } catch (err) {
      console.error("Error loading user stats:", err);
    } finally {
      setLoadingUserStats(false);
    }
  }
  async function handleUnlockAccount() {
    if (!(user == null ? void 0 : user.id)) return;
    setUnlocking(true);
    try {
      await upsertUserSuspension({
        user_id: user.id,
        is_active: false
      });
      setIsSuspended(false);
      setSuspensionCount(suspensionCount + 1);
      setUserRejectionCount(0);
      await sendNotification(
        user.id,
        "system",
        "🔓 Account Unlocked",
        `Your account has been unlocked using ${UNLOCK_CREDITS_REQUIRED} credits.`,
        "/dashboard"
      );
      ue.success(`✅ Account unlocked! ${UNLOCK_CREDITS_REQUIRED} credits deducted.`);
      await loadUserStats();
    } catch (err) {
      ue.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUnlocking(false);
    }
  }
  function extraConditionalDocs() {
    const list = [];
    if (category === "Child Support") {
      const ps = catFields.parents_status;
      if (ps === "Father passed away" || ps === "Both passed away") {
        list.push({ key: "father_death_cert", label: "Father's Death Certificate", hint: "Required since you selected father as deceased" });
      }
      if (ps === "Mother passed away" || ps === "Both passed away") {
        list.push({ key: "mother_death_cert", label: "Mother's Death Certificate", hint: "Required since you selected mother as deceased" });
      }
    }
    if (category === "Funeral Expenses") {
      const rel = catFields.deceased_relation;
      if (rel === "My husband" || rel === "My wife") {
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate)", hint: "Proof of relation to spouse" });
      } else if (rel === "My father" || rel === "My mother" || rel === "My child") {
        list.push({ key: "relation_proof", label: "B-Form / FRC (Proof of Relation)", hint: "Proof of relation to parent/child" });
      }
    }
    if (category === "Home Repair") {
      if (catFields.contractor_name && catFields.contractor_name.trim()) {
        list.push({ key: "contractor_agreement", label: "Contractor Agreement / Work Order", hint: "If you have a contractor, attach the agreement" });
      }
    }
    if (category === "Marriage Support") {
      if (catFields.relation && catFields.relation !== "Myself") {
        list.push({ key: "relation_proof", label: "Proof of Relation (B-Form / FRC)", hint: "Proof that you are related to the person getting married" });
      }
      list.push({ key: "marriage_quotation", label: "Marriage Expenses Quotation / List", hint: "List of items needed for the marriage" });
    }
    if (category === "Business / Work Help") {
      list.push({ key: "business_quotation", label: "Business Equipment / Supply Quotation", hint: "Quotation for the items needed for business" });
      list.push({ key: "business_proof", label: "Business Proof (License / Registration)", hint: "Proof that you have a business" });
    }
    if (category === "Livestock / Farming") {
      list.push({ key: "livestock_quotation", label: "Livestock / Farming Equipment Quotation", hint: "Quotation for the animals or equipment needed" });
      list.push({ key: "livestock_proof", label: "Proof of Livestock / Farming", hint: "Photo or document showing your livestock/farming" });
    }
    if (gender === "Male") {
      if (maritalStatus === "Single") {
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for single male" });
      }
      if (maritalStatus === "Married") {
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate)", hint: "Required for married male" });
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for married male" });
      }
      if (maritalStatus === "Widow") {
        list.push({ key: "wife_death_cert", label: "Wife's Death Certificate", hint: "Required for widow - death certificate of wife" });
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate from wife)", hint: "Required for widow - marriage certificate from deceased wife" });
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for widow - family registration certificate" });
      }
      if (maritalStatus === "Divorced") {
        list.push({ key: "divorce_cert", label: "Divorce Certificate (Court issued)", hint: "Required for divorced - court issued divorce certificate" });
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate from ex-spouse)", hint: "Required for divorced - marriage certificate from ex-spouse" });
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for divorced - family registration certificate" });
      }
    }
    if (gender === "Female") {
      if (maritalStatus === "Single") {
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for single female" });
      }
      if (maritalStatus === "Married") {
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate)", hint: "Required for married female" });
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for married female" });
      }
      if (maritalStatus === "Widow") {
        list.push({ key: "husband_death_cert", label: "Husband's Death Certificate", hint: "Required for widow - death certificate of husband" });
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate from husband)", hint: "Required for widow - marriage certificate from deceased husband" });
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for widow - family registration certificate" });
      }
      if (maritalStatus === "Divorced") {
        list.push({ key: "divorce_cert", label: "Divorce Certificate (Court issued)", hint: "Required for divorced - court issued divorce certificate" });
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate from ex-spouse)", hint: "Required for divorced - marriage certificate from ex-spouse" });
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for divorced - family registration certificate" });
      }
      if (isOrphan === "Yes") {
        list.push({ key: "orphan_proof", label: "Orphan Proof (Parent's Death Certificate)", hint: "Required since you selected orphan" });
      }
    }
    if (gender === "Child") {
      if (isOrphan === "Yes") {
        list.push({ key: "orphan_proof", label: "Orphan Proof (Parent's Death Certificate)", hint: "Required since child is orphan" });
      }
      list.push({ key: "b_form", label: "B-Form (Child's ID)", hint: "Required for child" });
      list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for child" });
    }
    return list;
  }
  reactExports.useEffect(() => {
    const d = loadDraft();
    if (d && d.category) {
      setStep(Math.min(d.step ?? 1, 4));
      setCategory(d.category ?? "");
      setTitle(d.title ?? "");
      setShortDesc(d.shortDesc ?? "");
      setCountry(d.country ?? "");
      setCity(d.city ?? "");
      setUrgency(d.urgency ?? "");
      setDescription(d.description ?? "");
      setAmount(d.amount ?? "");
      setDebtTotalAmount(d.debtTotalAmount ?? "");
      setDeadline(d.deadline ?? "");
      setInstituteName(d.instituteName ?? "");
      setIsOtherInstitute(d.isOtherInstitute ?? false);
      setOtherName(d.otherName ?? "");
      setOtherContact(d.otherContact ?? "");
      setOtherAddress(d.otherAddress ?? "");
      setRefNumber(d.refNumber ?? "");
      setJobStatus(d.jobStatus ?? "");
      setGender(d.gender ?? "");
      setMaritalStatus(d.maritalStatus ?? "");
      setIsOrphan(d.isOrphan ?? "");
      setOrphanParent(d.orphanParent ?? "");
      setSeekerName(d.seekerName ?? "");
      setSeekerContact(d.seekerContact ?? "");
      setReceiverName(d.receiverName ?? "");
      setReceiverContact(d.receiverContact ?? "");
      setReceiverBank(d.receiverBank ?? "");
      setReceiverAccount(d.receiverAccount ?? "");
      setReceiverAddress(d.receiverAddress ?? "");
      setReceiverShopName(d.receiverShopName ?? "");
      setCatFields(d.catFields ?? {});
      setCatDocUrls(d.catDocUrls ?? {});
      setCatDocNames(d.catDocNames ?? {});
      setSelfieUrl(d.selfieUrl ?? "");
      setSelfiePreview(d.selfieUrl || null);
      setVideoUrl(d.videoUrl ?? "");
      setVideoPreview(d.videoUrl || null);
      if (d.eduSubType) setEduSubType(d.eduSubType);
      if (d.eduAdmissionLevel) setEduAdmissionLevel(d.eduAdmissionLevel);
      if (d.eduSubFields) setEduSubFields(d.eduSubFields);
      if (d.currency) setCurrency(d.currency);
      if (d.propertyOwnership) setPropertyOwnership(d.propertyOwnership);
      if (d.disabilityMode) setDisabilityMode(d.disabilityMode);
      if (d.disabilityShopName) setDisabilityShopName(d.disabilityShopName);
      if (d.disabilityShopContact) setDisabilityShopContact(d.disabilityShopContact);
      if (d.disabilityHospital) setDisabilityHospital(d.disabilityHospital);
      if (d.disabilityHospitalOther) setDisabilityHospitalOther(d.disabilityHospitalOther);
      if (d.disabilityBankTitle) setDisabilityBankTitle(d.disabilityBankTitle);
      if (d.disabilityBankNumber) setDisabilityBankNumber(d.disabilityBankNumber);
      if (d.treatmentAmount) setTreatmentAmount(d.treatmentAmount);
      if (d.treatmentExpiry) setTreatmentExpiry(d.treatmentExpiry);
      if (d.treatmentPatientNumber) setTreatmentPatientNumber(d.treatmentPatientNumber);
      if (d.disabilityType) setDisabilityType(d.disabilityType);
      if (d.disabilityReason) setDisabilityReason(d.disabilityReason);
    }
    setRestored(true);
  }, []);
  reactExports.useEffect(() => {
    if (!restored) return;
    saveDraft({
      step,
      category,
      title,
      shortDesc,
      country,
      city,
      urgency,
      description,
      amount,
      debtTotalAmount,
      deadline,
      instituteName,
      isOtherInstitute,
      otherName,
      otherContact,
      otherAddress,
      refNumber,
      jobStatus,
      gender,
      maritalStatus,
      isOrphan,
      orphanParent,
      seekerName,
      seekerContact,
      receiverName,
      receiverContact,
      receiverBank,
      receiverAccount,
      receiverAddress,
      receiverShopName,
      catFields,
      catDocUrls,
      catDocNames,
      selfieUrl,
      videoUrl,
      currency,
      propertyOwnership,
      disabilityMode,
      disabilityShopName,
      disabilityShopContact,
      disabilityHospital,
      disabilityHospitalOther,
      disabilityBankTitle,
      disabilityBankNumber,
      treatmentAmount,
      treatmentExpiry,
      treatmentPatientNumber,
      disabilityType,
      disabilityReason,
      eduSubType,
      eduAdmissionLevel,
      eduSubFields
    });
  }, [
    restored,
    step,
    category,
    title,
    shortDesc,
    country,
    city,
    urgency,
    description,
    amount,
    debtTotalAmount,
    deadline,
    instituteName,
    isOtherInstitute,
    otherName,
    otherContact,
    otherAddress,
    refNumber,
    jobStatus,
    gender,
    maritalStatus,
    isOrphan,
    orphanParent,
    seekerName,
    seekerContact,
    receiverName,
    receiverContact,
    receiverBank,
    receiverAccount,
    receiverAddress,
    receiverShopName,
    catFields,
    catDocUrls,
    catDocNames,
    selfieUrl,
    videoUrl,
    currency,
    propertyOwnership,
    disabilityMode,
    disabilityShopName,
    disabilityShopContact,
    disabilityHospital,
    disabilityHospitalOther,
    disabilityBankTitle,
    disabilityBankNumber,
    treatmentAmount,
    treatmentExpiry,
    treatmentPatientNumber,
    disabilityType,
    disabilityReason,
    eduSubType,
    eduAdmissionLevel,
    eduSubFields
  ]);
  reactExports.useEffect(() => {
    if (restored && step >= 2 && !category) setStep(1);
  }, [restored, step, category]);
  reactExports.useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    if (user == null ? void 0 : user.id) {
      loadData();
      checkPendingFeedback();
      loadUserStats();
    }
  }, [isAuthenticated, user]);
  reactExports.useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);
  reactExports.useEffect(() => {
    if (!category || !(user == null ? void 0 : user.id)) {
      setOffer(null);
      return;
    }
    checkOffer(category);
  }, [category, user]);
  async function checkOffer(cat) {
    if (!(user == null ? void 0 : user.id)) return;
    const off = await getCategoryOffer(cat);
    setOffer(off ?? null);
    const count = await getOfferClaimCount(user.id);
    setHasClaimedOfferBefore((count ?? 0) > 0);
  }
  const isFirstCaseFree = canUseFreeCase();
  const offerApplies = !!offer && offer.is_active && (offer.used_count ?? 0) < (offer.free_limit ?? 0) && !hasClaimedOfferBefore && canUseFreeCase();
  const willBeFree = offerApplies || isFirstCaseFree;
  async function checkPendingFeedback() {
    if (!(user == null ? void 0 : user.id)) {
      setCheckingFeedback(false);
      return;
    }
    setCheckingFeedback(true);
    try {
      const cases = await getCasesByUser(user.id);
      const completedCases = (cases == null ? void 0 : cases.filter((c) => c.status === "completed")) || [];
      if (completedCases.length > 0) {
        const feedbackRows = await getFeedbacks(200);
        const feedbackList = Array.isArray(feedbackRows) ? feedbackRows : Array.isArray(feedbackRows == null ? void 0 : feedbackRows.data) ? feedbackRows.data : [];
        const now = Date.now();
        const overdue = completedCases.find((completed) => {
          const completedAt = new Date(String(completed.completed_at || completed.updated_at || completed.created_at || "")).getTime();
          if (!Number.isFinite(completedAt) || now - completedAt < 24 * 60 * 60 * 1e3) return false;
          const caseId = String(completed.id);
          const submitted = feedbackList.some((feedback) => String(feedback.case_id) === caseId && String(feedback.user_id) === String(user.id) && ["pending_review", "approved"].includes(String(feedback.status || "").toLowerCase()));
          return !submitted;
        });
        setBlockedByFeedback(overdue ? { caseId: String(overdue.id), caseTitle: String(overdue.title || "your completed case") } : null);
      } else {
        setBlockedByFeedback(null);
      }
    } catch (err) {
      console.error("Error checking feedback:", err);
      setBlockedByFeedback(null);
    } finally {
      setCheckingFeedback(false);
    }
  }
  async function loadData() {
    if (!(user == null ? void 0 : user.id)) {
      setKycLoading(false);
      return;
    }
    setKycLoading(true);
    try {
      const kyc = await getKycStatus(user.id);
      setKycStatus((kyc == null ? void 0 : kyc.status) ?? null);
      const wallet = await getWallet(user.id);
      setBalance((wallet == null ? void 0 : wallet.balance) ?? 0);
      const settings = await getUserSettings(user.id);
      if ((settings == null ? void 0 : settings.currency) && settings.currency !== "USD") setCurrency(settings.currency);
      const counts = await getCaseCounts(user.id);
      const activeCount = ((counts == null ? void 0 : counts.pending) || 0) + ((counts == null ? void 0 : counts.approved) || 0) + ((counts == null ? void 0 : counts.completed) || 0);
      setActiveCaseCount(activeCount);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setKycLoading(false);
    }
  }
  async function uploadFile(file, path) {
    const fileSizeMB = file.size / (1024 * 1024);
    console.log(`Uploading file: ${file.name}, Size: ${fileSizeMB.toFixed(2)} MB`);
    if (fileSizeMB > 48) {
      throw new Error(`File size (${fileSizeMB.toFixed(1)}MB) exceeds 50MB limit. Please record a shorter video.`);
    }
    try {
      const url = await uploadFileToStorage(file, path);
      return url;
    } catch (error) {
      if (error.message.includes("limit") || error.message.includes("size")) {
        throw new Error(`File too large: ${fileSizeMB.toFixed(1)}MB (max 50MB)`);
      }
      throw new Error(error.message);
    }
  }
  async function handleDocSelect(key, file) {
    if (!file) return;
    setUploadingDoc(key);
    try {
      const url = await uploadFile(file, `cases/${user == null ? void 0 : user.id}/${Date.now()}_${key}`);
      setCatDocUrls((p) => ({ ...p, [key]: url }));
      setCatDocNames((p) => ({ ...p, [key]: file.name }));
      ue.success("Uploaded ✓");
    } catch {
      ue.error("Upload failed — please attach again.");
      setCatDocUrls((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
      setCatDocNames((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
    } finally {
      setUploadingDoc(null);
    }
  }
  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(s);
      setCameraOn(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 100);
    } catch {
      ue.error("Camera access denied.");
    }
  }
  async function takeSelfie() {
    var _a2;
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    (_a2 = canvas.getContext("2d")) == null ? void 0 : _a2.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      if (blob) {
        stream == null ? void 0 : stream.getTracks().forEach((t) => t.stop());
        setCameraOn(false);
        setSelfiePreview(canvas.toDataURL("image/jpeg"));
        setUploadingSelfie(true);
        try {
          const url = await uploadFile(
            new File([blob], "selfie.jpg", { type: "image/jpeg" }),
            `cases/${user == null ? void 0 : user.id}/${Date.now()}_selfie.jpg`
          );
          setSelfieUrl(url);
        } catch {
          ue.error("Selfie upload failed — retake please.");
          setSelfiePreview(null);
        } finally {
          setUploadingSelfie(false);
        }
      }
    }, "image/jpeg");
  }
  async function startVideoRecording() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some((d) => d.kind === "videoinput");
      if (!hasCamera) {
        ue.error("No camera found on your device.");
        return;
      }
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
          channelCount: 1,
          sampleRate: 44100
        }
      });
      setStream(s);
      setVideoRecording(true);
      setVideoTimer(0);
      setTimeout(() => {
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = s;
          liveVideoRef.current.onloadedmetadata = () => {
            var _a2;
            (_a2 = liveVideoRef.current) == null ? void 0 : _a2.play().catch((err) => console.warn("Auto-play failed:", err));
          };
        }
      }, 50);
      const preferredMime = "video/webm;codecs=vp9,opus";
      const fallbackMime = "video/webm;codecs=vp8,opus";
      const recorder = new MediaRecorder(s, {
        mimeType: MediaRecorder.isTypeSupported(preferredMime) ? preferredMime : fallbackMime,
        videoBitsPerSecond: 22e5,
        audioBitsPerSecond: 128e3
      });
      mediaRecorderRef.current = recorder;
      videoChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        if (videoTimer < 60) {
          ue.error("Please record at least 60 seconds so your story can be verified clearly.");
          setVideoRecording(false);
          setUploadingVideo(false);
          s.getTracks().forEach((t) => t.stop());
          videoChunksRef.current = [];
          return;
        }
        const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
        const fileSizeMB = blob.size / (1024 * 1024);
        console.log(`Video size: ${fileSizeMB.toFixed(2)} MB`);
        if (fileSizeMB > 48) {
          ue.error(`Video is ${fileSizeMB.toFixed(1)}MB (max 50MB). Please record shorter video.`);
          setVideoPreview(URL.createObjectURL(blob));
          setUploadingVideo(false);
          setVideoRecording(false);
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        s.getTracks().forEach((t) => t.stop());
        setVideoRecording(false);
        setVideoPreview(URL.createObjectURL(blob));
        setUploadingVideo(true);
        try {
          const url = await uploadFile(
            new File([blob], "appeal.webm", { type: "video/webm" }),
            `cases/${user == null ? void 0 : user.id}/${Date.now()}_appeal.webm`
          );
          setVideoUrl(url);
          ue.success(`Video uploaded successfully! (${fileSizeMB.toFixed(1)}MB)`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          if (msg.includes("size") || msg.includes("limit")) {
            ue.error(`Video too large (${fileSizeMB.toFixed(1)}MB). Please record shorter video.`);
          } else {
            ue.error(`Video upload failed: ${msg}`);
          }
          setVideoPreview(null);
        } finally {
          setUploadingVideo(false);
        }
      };
      recorder.start(1e3);
      let sec = 0;
      const interval = setInterval(() => {
        sec++;
        setVideoTimer(sec);
        if (sec >= 90) {
          clearInterval(interval);
          if (recorder.state === "recording") recorder.stop();
          ue.info("Recording stopped at 90 seconds. Your video must be at least 60 seconds.");
        }
      }, 1e3);
      window._videoInterval = interval;
    } catch (err) {
      console.error("Recording error:", err);
      ue.error("Camera/microphone access denied. Please allow permissions and try again.");
    }
  }
  function stopVideoRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (window._videoInterval) {
      clearInterval(window._videoInterval);
    }
  }
  function getReceiverLabel() {
    const labels = {
      "House Rent": "Landlord",
      "Food & Groceries": "Shop Owner",
      "Medicines": "Pharmacy / Shop Owner",
      "Home Repair": "Contractor / Material Shop",
      "Debt Relief": "Creditor",
      "Business / Work Help": "Business Owner / Supplier",
      "Marriage Support": "Marriage Vendor",
      "Funeral Expenses": "Funeral Service Provider",
      "Livestock / Farming": "Supplier / Farm Owner",
      "Emergency Help": "Emergency Recipient",
      "Other": "Recipient"
    };
    return labels[category] || "Payment Receiver";
  }
  function validateStep2() {
    var _a2, _b2, _c2, _d2;
    if (!jobStatus) return "Please answer: Do you have a job?";
    if (jobStatus === "Yes" && !catDocUrls["salary_slip"]) return "Please attach your last 6 months salary slip.";
    if (jobStatus === "Yes" && !catDocUrls["statement"]) return "Please attach your last 6 months bank statement.";
    if (jobStatus === "No" && !catDocUrls["statement"]) return "Please attach your last 6 months bank statement.";
    if (!gender) return "Please select the gender (Male/Female/Child).";
    if (gender === "Male" || gender === "Female") {
      if (!maritalStatus) return "Please select marital status (Single/Married/Widow/Divorced).";
    }
    if (gender === "Female") {
      if (!isOrphan) return "Please select: Are you an orphan?";
      if (isOrphan === "Yes" && !orphanParent) return "Please select which parent passed away.";
    }
    if (gender === "Child") {
      if (!isOrphan) return "Please select: Is this child an orphan?";
    }
    if (!seekerName.trim()) return "Please enter your full name.";
    if (!seekerContact.trim()) return "Please enter your contact number.";
    if (needsPaymentReceiver) {
      if (!receiverName.trim()) return `Please enter the ${getReceiverLabel()} name.`;
      if (!receiverContact.trim()) return `Please enter the ${getReceiverLabel()} contact number.`;
      if (!receiverBank.trim()) return `Please enter the ${getReceiverLabel()} bank name.`;
      if (!receiverAccount.trim()) return `Please enter the ${getReceiverLabel()} account number.`;
      if (!receiverAddress.trim()) return `Please enter the ${getReceiverLabel()} address / shop address.`;
      if (category === "Food & Groceries" || category === "Medicines" || category === "Home Repair") {
        if (!receiverShopName.trim()) return `Please enter the shop name.`;
      }
    }
    if (category === "Disability Support") {
      if (!catDocUrls["disability_cnic"]) return "Please attach Disability CNIC (Front & Back).";
      if (!catDocUrls["disability_photo"]) return "Please attach a clear photo of the disability.";
      if (!disabilityType) return "Please select the type of disability.";
      if (!disabilityMode) return "Please choose: Product, Treatment, or Monthly Stipend.";
      if (disabilityMode === "product") {
        if (!disabilityShopName.trim() || !disabilityShopContact.trim()) return "Please enter the shop's name and contact number.";
        if (!catDocUrls["product_receipt"]) return "Please attach the shop's quotation/receipt.";
      }
      if (disabilityMode === "treatment") {
        if (!disabilityHospital.trim() && !disabilityHospitalOther) return "Please select the hospital.";
        if (disabilityHospitalOther && !disabilityHospital.trim()) return "Please enter the hospital name.";
        if (!treatmentAmount.trim() || parseFloat(treatmentAmount) <= 0) return "Please enter the treatment amount.";
        if (!treatmentExpiry) return "Please select the bill expiry date.";
        if (!treatmentPatientNumber.trim()) return "Please enter the patient / bill number.";
      }
      if (disabilityMode === "stipend") {
        if (!disabilityBankTitle.trim() || !disabilityBankNumber.trim()) return "Please enter your bank/account title and number.";
      }
    }
    if (isEducationCategory && listCfg) {
      if (!eduSubType) return "Please select what you need help with.";
      for (const f of listCfg.personFields) {
        if (f.required && !(catFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
      }
      if (category === "Education, Books & Admission" && eduSubType === "admission") {
        if (!eduAdmissionLevel) return "Please select School, College, or University for admission.";
        const subFields = ((_a2 = listCfg.getSubFields) == null ? void 0 : _a2.call(listCfg, eduSubType, eduAdmissionLevel)) || [];
        for (const f of subFields) {
          if (f.required && !(eduSubFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
        }
      }
      if (category === "School, College & University Fees") {
        const subFields = ((_b2 = listCfg.getSubFields) == null ? void 0 : _b2.call(listCfg, eduSubType, "")) || [];
        for (const f of subFields) {
          if (f.required && !(eduSubFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
        }
      }
      if (isOtherInstitute) {
        if (!otherName.trim()) return "Please enter the institute name.";
        if (!otherContact.trim()) return "Please enter the institute contact number.";
        if (!otherAddress.trim()) return "Please enter the institute address (city, area, street).";
      }
      let subDocs = [];
      if (category === "Education, Books & Admission") {
        subDocs = ((_c2 = listCfg.getSubDocs) == null ? void 0 : _c2.call(listCfg, eduSubType, eduSubType === "admission" ? eduAdmissionLevel : "")) || [];
      } else if (category === "School, College & University Fees") {
        subDocs = ((_d2 = listCfg.getSubDocs) == null ? void 0 : _d2.call(listCfg, eduSubType, "")) || [];
      }
      for (const doc of subDocs) {
        if (doc.required && !catDocUrls[doc.key]) return `Please attach: ${doc.label}`;
      }
      if (!catDocUrls["student_id_proof"] && !catDocUrls["student_id"]) {
        const hasStudentId = subDocs.some((d) => d.key === "student_id_proof" || d.key === "student_id");
        if (!hasStudentId) {
          if (!catDocUrls["student_id"]) return "Please attach student's B-Form / ID card.";
        }
      }
      if (!isFixedAmount(category)) {
        if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter the amount needed.";
        const maxLimit = getMaxLimit(category);
        if (maxLimit && parseFloat(amount) > maxLimit) {
          return `Amount cannot exceed Rs ${maxLimit.toLocaleString()}. Please enter a valid amount.`;
        }
      }
      if (!deadline) return "Please select the expiry date.";
      return null;
    }
    if (easy) {
      const selectedInstitute = (instituteName || catFields.institute_name || "").trim();
      if (!isOtherInstitute && !selectedInstitute) return "Please select your institute/company from the list.";
      if (isOtherInstitute) {
        if (!otherName.trim()) return "Please enter the institute name.";
        if (!otherContact.trim()) return "Please enter the institute contact number.";
        if (!otherAddress.trim()) return "Please enter the institute address (city, area, street).";
      }
      if (utilCfg) {
        if (!refNumber.trim()) return `Please enter your ${(selectedCompany == null ? void 0 : selectedCompany.ref) ?? "Consumer/Reference Number"}.`;
        if (!(catFields.bill_owner_name || "").trim()) return "Please enter the bill owner name as it appears on the bill.";
      }
      if (listCfg && !isEducationCategory) {
        for (const f of listCfg.personFields) {
          if (f.required && !(catFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
        }
        if (listCfg.extraDocs) {
          for (const doc of listCfg.extraDocs) {
            if (doc.required && !catDocUrls[doc.key]) return `Please attach: ${doc.label}`;
          }
        }
      }
      if (!catDocUrls["bill"]) return "Please attach the bill/challan photo.";
      if (category === "Medical & Treatment" && !catDocUrls["doctor_prescription"])
        return "Please attach the Doctor's written prescription/report.";
      if (!isFixedAmount(category)) {
        if (isDebtCategory(category)) {
          if (!debtTotalAmount.trim() || parseFloat(debtTotalAmount) <= 0) {
            return "Please enter your total outstanding debt amount.";
          }
          if (!amount.trim() || parseFloat(amount) <= 0) {
            return "Please enter your total outstanding debt amount to calculate 5%.";
          }
        } else {
          if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter the amount needed.";
          const maxLimit = getMaxLimit(category);
          if (maxLimit && parseFloat(amount) > maxLimit) {
            return `Amount cannot exceed Rs ${maxLimit.toLocaleString()}. Please enter a valid amount.`;
          }
        }
      }
    }
    if (!easy && config && category !== "Disability Support" && !isEducationCategory) {
      for (const f of cfgFields) {
        if (f.key === "job_status") continue;
        if (SKIP_FIELDS.has(f.key)) continue;
        if (f.required && !(catFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
      }
      for (const d of cfgDocs) {
        if (d.key === "salary_slip" || d.key === "statement") continue;
        if (d.required && !catDocUrls[d.key]) return `Please attach: ${d.label}`;
      }
      for (const d of extraConditionalDocs()) {
        if (!catDocUrls[d.key]) return `Please attach: ${d.label}`;
      }
      if (!isFixedAmount(category)) {
        if (isDebtCategory(category)) {
          if (!debtTotalAmount.trim() || parseFloat(debtTotalAmount) <= 0) {
            return "Please enter your total outstanding debt amount.";
          }
          if (!amount.trim() || parseFloat(amount) <= 0) {
            return "Please enter your total outstanding debt amount to calculate 5%.";
          }
        } else {
          if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter the amount needed.";
          const maxLimit = getMaxLimit(category);
          if (maxLimit && parseFloat(amount) > maxLimit) {
            return `Amount cannot exceed Rs ${maxLimit.toLocaleString()}. Please enter a valid amount.`;
          }
        }
      }
    }
    if (!description.trim()) return "Please explain your situation.";
    if (!isFixedAmount(category) && !isEducationCategory) {
      if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter the amount needed.";
    }
    if (!deadline) return "Please select the expiry date.";
    if (PROPERTY_RELEVANT_CATS.has(category) && !isEducationCategory) {
      if (!propertyOwnership) return "Please select property ownership (Owned or Rented).";
      if (propertyOwnership === "rented") {
        if (!catDocUrls["rental_agreement"]) return "Please attach the Rental Agreement.";
        if (!catDocUrls["landlord_cnic"]) return "Please attach the Landlord's CNIC.";
      }
      if (propertyOwnership === "owned") {
        if (!catFields.owner_relation) return "Please select whose name the house is in.";
        if (!catDocUrls["owner_cnic"]) return "Please attach the owner's CNIC.";
      }
    }
    return null;
  }
  async function handleSubmit() {
    if (!confirmed) {
      ue.error("You must agree to the Terms & Conditions.");
      return;
    }
    if (!selfieUrl) {
      ue.error("Please take a live selfie");
      return;
    }
    if (!videoUrl) {
      ue.error("Please record a video appeal (up to 90 seconds)");
      return;
    }
    if (isSuspended) {
      ue.error("Your account is suspended. Please unlock it first.");
      return;
    }
    if (!(user == null ? void 0 : user.id)) {
      ue.error("User not authenticated.");
      return;
    }
    setSubmitting(true);
    try {
      const uid = user.id;
      const freshCases = await getCasesByUser(uid);
      const freshRejections = (freshCases == null ? void 0 : freshCases.filter((c) => c.status === "rejected").length) || 0;
      const freshFreeUsed = (freshCases == null ? void 0 : freshCases.filter((c) => c.was_free === true).length) || 0;
      const lastFreeRejected = (freshCases == null ? void 0 : freshCases.some((c) => c.was_free === true && String(c.status || "").toLowerCase() === "rejected")) || false;
      const canUseFree = freshFreeUsed === 0 || freshFreeUsed === 1 && lastFreeRejected;
      const freeDisabled = freshRejections >= 3 || freshFreeUsed >= MAX_FREE_CASES || !canUseFree;
      const userSuspended = freshRejections >= MAX_REJECTIONS_BEFORE_SUSPENSION;
      if (userSuspended) {
        await upsertUserSuspension({
          user_id: uid,
          suspension_count: suspensionCount + 1,
          is_active: true,
          suspended_at: (/* @__PURE__ */ new Date()).toISOString(),
          rejection_count_at_suspension: freshRejections
        });
        setIsSuspended(true);
        ue.error("Your account has been suspended due to multiple rejections.");
        setSubmitting(false);
        return;
      }
      const firstFree = canUseFree && !freeDisabled;
      let offerFree = false;
      let currentOffer = null;
      if (category && !firstFree) {
        const off = await getCategoryOffer(category);
        currentOffer = off;
        const claimCount = await getOfferClaimCount(uid);
        offerFree = !!off && off.is_active && (off.used_count ?? 0) < (off.free_limit ?? 0) && (claimCount ?? 0) === 0 && !freeDisabled;
      }
      const free = firstFree || offerFree;
      if (!free) {
        const isFreeAllowed = false;
        const result = checkCreditGate({
          balance,
          required: 1,
          isFreeAllowed,
          navigate,
          context: "case_submit"
        });
        if (!result) {
          setSubmitting(false);
          return;
        }
      }
      const allDocUrls = { ...catDocUrls };
      const photoUrls = Object.values(allDocUrls);
      const docMeta = {};
      Object.keys(allDocUrls).forEach((k) => {
        docMeta[k] = allDocUrls[k];
      });
      const finalInstitute = easy ? isOtherInstitute ? otherName : instituteName || catFields.institute_name || "" : catFields.institute_name || catFields.hospital_name || catFields.provider || catFields.provider_name || catFields.landlord_name || catFields.pharmacy_name || catFields.lender_name || "";
      const finalContact = easy ? isOtherInstitute ? otherContact : "" : catFields.institute_contact || catFields.hospital_contact || catFields.provider_contact || catFields.landlord_contact || catFields.pharmacy_contact || catFields.lender_contact || "";
      const finalAddress = isOtherInstitute ? otherAddress : catFields.institute_address || "";
      const finalUrgency = easy ? autoUrgency || "Medium" : urgency;
      const categoryDetails = {
        ...catFields,
        _documents: docMeta,
        property_ownership: propertyOwnership,
        rental_agreement_url: catDocUrls["rental_agreement"] || "",
        landlord_cnic_url: catDocUrls["landlord_cnic"] || "",
        job_status: jobStatus,
        gender,
        marital_status: maritalStatus,
        is_orphan: isOrphan,
        orphan_parent: orphanParent,
        seeker_name: seekerName,
        seeker_contact: seekerContact,
        institute_name: finalInstitute,
        institute_contact: finalContact,
        institute_address: finalAddress,
        is_institute_in_list: !isOtherInstitute
      };
      if (needsPaymentReceiver) {
        categoryDetails.receiver_name = receiverName;
        categoryDetails.receiver_contact = receiverContact;
        categoryDetails.receiver_bank = receiverBank;
        categoryDetails.receiver_account = receiverAccount;
        categoryDetails.receiver_address = receiverAddress;
        categoryDetails.receiver_shop_name = receiverShopName;
      }
      if (isDebtCategory(category)) {
        categoryDetails.debt_total_amount = parseFloat(debtTotalAmount) || 0;
        categoryDetails.debt_percentage = 5;
        categoryDetails.debt_calculated_amount = calculatedDebtAmount;
        categoryDetails.debt_max_limit = 25e3;
      }
      if (isEducationCategory) {
        categoryDetails.edu_sub_type = eduSubType;
        categoryDetails.edu_sub_fields = eduSubFields;
        if (eduSubType === "admission") {
          categoryDetails.edu_admission_level = eduAdmissionLevel;
        }
        categoryDetails.edu_documents = {
          admission_proof: catDocUrls["admission_proof"] || "",
          fee_challan: catDocUrls["fee_challan"] || "",
          student_id_proof: catDocUrls["student_id_proof"] || "",
          books_quotation: catDocUrls["books_quotation"] || "",
          uniform_quotation: catDocUrls["uniform_quotation"] || "",
          uniform_items: catDocUrls["uniform_items"] || ""
        };
      }
      if (shouldShowPaymentReceiver()) {
        categoryDetails.receiver_name = receiverName;
        categoryDetails.receiver_contact = receiverContact;
        categoryDetails.receiver_bank = receiverBank;
        categoryDetails.receiver_account = receiverAccount;
      }
      if (category === "Disability Support") {
        categoryDetails.disability_mode = disabilityMode;
        categoryDetails.disability_shop_name = disabilityShopName;
        categoryDetails.disability_shop_contact = disabilityShopContact;
        categoryDetails.disability_hospital = disabilityHospital;
        categoryDetails.disability_stipend_amount = disabilityMode === "stipend" ? DISABILITY_STIPEND_AMOUNT : void 0;
        categoryDetails.disability_bank_title = disabilityBankTitle;
        categoryDetails.disability_bank_number = disabilityBankNumber;
        categoryDetails.disability_type = disabilityType;
        categoryDetails.disability_reason = disabilityReason;
        if (disabilityMode === "treatment") {
          categoryDetails.treatment_amount = parseFloat(treatmentAmount);
          categoryDetails.treatment_expiry = treatmentExpiry;
          categoryDetails.treatment_patient_number = treatmentPatientNumber;
          categoryDetails.treatment_urgency = treatmentAutoUrgency;
        }
      }
      if (easy && !isEducationCategory) {
        categoryDetails.institute = finalInstitute;
        categoryDetails.institute_in_list = !isOtherInstitute;
        categoryDetails.reference_type = utilCfg ? (selectedCompany == null ? void 0 : selectedCompany.ref) ?? "Reference" : (listCfg == null ? void 0 : listCfg.refLabel) ?? "Reference";
        categoryDetails.reference_number = refNumber;
        categoryDetails.due_date = deadline;
      }
      let finalAmount;
      if (isFixedAmount(category)) {
        const fixedVal = getFixedAmountValue(category);
        finalAmount = fixedVal || 0;
      } else if (hasFixedStipend()) {
        finalAmount = DISABILITY_STIPEND_AMOUNT;
      } else if (isDebtCategory(category)) {
        finalAmount = calculatedDebtAmount;
      } else {
        finalAmount = parseFloat(amount) || 0;
      }
      const caseData = {
        user_id: uid,
        category,
        title,
        short_description: shortDesc,
        country,
        city,
        urgency: finalUrgency,
        description,
        amount_needed: finalAmount,
        currency,
        why_help: description,
        deadline: deadline || null,
        institute_name: finalInstitute,
        institute_contact: finalContact,
        institute_address: finalAddress,
        payment_method: easy ? "1Bill / Direct" : needsPaymentReceiver ? "Direct to Receiver" : "Direct to Provider",
        account_title: "",
        account_number: refNumber || "",
        account_iban: "",
        category_details: categoryDetails,
        photo_urls: photoUrls,
        selfie_url: selfieUrl,
        video_url: videoUrl,
        status: "pending",
        submitted_at: (/* @__PURE__ */ new Date()).toISOString(),
        was_free: free
      };
      await insertCaseSubmission(caseData);
      await loadUserStats();
      if (firstFree) {
        if (uid)
          await sendNotification(
            uid,
            "system",
            "Case Submitted FREE 🎉",
            `Your case "${title}" was submitted FREE and is under review.`,
            "/my-cases"
          );
        ue.success("🎉 Your case is FREE! Submitted for review.");
      } else if (offerFree && currentOffer) {
        await insertOfferClaim({ user_id: uid, category });
        await updateCategoryOfferUsage(category, (currentOffer.used_count ?? 0) + 1);
        if (uid)
          await sendNotification(
            uid,
            "system",
            "Case Submitted (FREE) 🎉",
            `Your case "${title}" was submitted FREE!`,
            "/my-cases"
          );
        ue.success(`🎉 Free under ${currentOffer.label || "offer"}! Case submitted.`);
      } else {
        if (uid)
          await sendNotification(
            uid,
            "system",
            "Case Submitted ⏳",
            `Your case "${title}" was submitted and is under review.`,
            "/my-cases"
          );
        ue.success("Case submitted! 1 credit deducted. Under review.");
      }
      clearDraft();
      navigate({ to: "/my-cases" });
    } catch (err) {
      ue.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  }
  function renderField(f) {
    if (YES_NO_FIELDS.has(f.key)) {
      const questionLabel = f.key === "wife_status" ? "Do you have a wife / spouse in this household?" : f.label;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          questionLabel,
          " ",
          f.required && "*"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: ["Yes", "No"].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setCatFields((p) => ({ ...p, [f.key]: opt })),
            className: `px-3 py-2.5 rounded-lg border text-sm font-medium ${catFields[f.key] === opt ? "bg-primary text-white border-primary" : "border-border"}`,
            children: opt
          },
          opt
        )) })
      ] }, f.key);
    }
    if (COUNTER_FIELDS.has(f.key)) {
      const val = parseInt(catFields[f.key] || "0", 10);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: f.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setCatFields((p) => ({ ...p, [f.key]: String(Math.max(0, val - 1)) })),
              className: "h-9 w-9 rounded-lg border border-border font-bold text-lg",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-10 text-center font-semibold", children: val }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setCatFields((p) => ({ ...p, [f.key]: String(Math.min(15, val + 1)) })),
              className: "h-9 w-9 rounded-lg border border-border font-bold text-lg",
              children: "+"
            }
          )
        ] })
      ] }, f.key);
    }
    if (CHOICE_FIELDS[f.key]) {
      const opts = CHOICE_FIELDS[f.key];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          f.label,
          " ",
          f.required && "*"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: opts.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setCatFields((p) => ({ ...p, [f.key]: opt })),
            className: `px-2 py-2 rounded-lg border text-xs font-medium text-left ${catFields[f.key] === opt ? "bg-primary text-white border-primary" : "border-border"}`,
            children: opt
          },
          opt
        )) })
      ] }, f.key);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
        f.label,
        " ",
        f.required && "*"
      ] }),
      f.type === "textarea" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: catFields[f.key] ?? "",
          onChange: (e) => setCatFields((p) => ({ ...p, [f.key]: e.target.value })),
          placeholder: f.placeholder,
          rows: 3
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: f.type === "number" ? "number" : "text",
          value: catFields[f.key] ?? "",
          onChange: (e) => setCatFields((p) => ({ ...p, [f.key]: e.target.value })),
          placeholder: f.placeholder
        }
      )
    ] }, f.key);
  }
  function renderSeekerDetails() {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 space-y-3 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/20 bg-primary/5 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-primary mb-2", children: "📌 Your Details (Seeker)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: seekerName,
              onChange: (e) => setSeekerName(e.target.value),
              placeholder: "Enter your full name"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact Number *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: seekerContact,
              onChange: (e) => setSeekerContact(e.target.value),
              placeholder: "Your phone number for verification"
            }
          )
        ] })
      ] })
    ] }) });
  }
  function renderPaymentReceiverDetails() {
    if (!needsPaymentReceiver) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 space-y-3 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/20 bg-primary/5 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-primary mb-2", children: [
        "📌 ",
        getReceiverLabel(),
        " Payment Details"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mb-2", children: "💡 Provide the official institute, school, hospital, or supplier details where funds should be sent so Givethra can verify." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            getReceiverLabel(),
            " Name *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: receiverName,
              onChange: (e) => setReceiverName(e.target.value),
              placeholder: `Enter ${getReceiverLabel()} full name`
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            getReceiverLabel(),
            " Contact Number *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: receiverContact,
              onChange: (e) => setReceiverContact(e.target.value),
              placeholder: "Phone number for verification"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Shop / Business Name ",
            ["Food & Groceries", "Medicines", "Home Repair"].includes(category) ? "*" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: receiverShopName,
              onChange: (e) => setReceiverShopName(e.target.value),
              placeholder: "Shop or business name"
            }
          ),
          ["Food & Groceries", "Medicines", "Home Repair"].includes(category) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "💡 Required for shop purchases" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            getReceiverLabel(),
            " Bank Name *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: receiverBank,
              onChange: (e) => setReceiverBank(e.target.value),
              placeholder: "Bank name"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            getReceiverLabel(),
            " Account Number *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: receiverAccount,
              onChange: (e) => setReceiverAccount(e.target.value),
              placeholder: "Account number"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            getReceiverLabel(),
            " Address / Shop Address *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: receiverAddress,
              onChange: (e) => setReceiverAddress(e.target.value),
              placeholder: "Complete address of the receiver/shop",
              rows: 2
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "💡 Complete address for verification purposes" })
        ] })
      ] })
    ] }) });
  }
  function renderPaymentReceiver() {
    if (!shouldShowPaymentReceiver()) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 space-y-3 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/20 bg-primary/5 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-primary mb-2", children: [
        "📌 ",
        getReceiverLabel(),
        " Payment Details"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            getReceiverLabel(),
            " Name *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: receiverName,
              onChange: (e) => setReceiverName(e.target.value),
              placeholder: `Enter ${getReceiverLabel()} name`
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            getReceiverLabel(),
            " Contact Number *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: receiverContact,
              onChange: (e) => setReceiverContact(e.target.value),
              placeholder: "Phone number for verification"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            getReceiverLabel(),
            " Bank Name"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: receiverBank,
              onChange: (e) => setReceiverBank(e.target.value),
              placeholder: "Bank name"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            getReceiverLabel(),
            " Account Number"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: receiverAccount,
              onChange: (e) => setReceiverAccount(e.target.value),
              placeholder: "Account number"
            }
          )
        ] })
      ] })
    ] }) });
  }
  function renderEducationCategory() {
    var _a2, _b2, _c2, _d2;
    if (!listCfg || !isEducationCategory) return null;
    const subOptions = listCfg.subOptions || [];
    const isAdmissionCategory = category === "Education, Books & Admission";
    const isFeeCategory = category === "School, College & University Fees";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "What do you need help with? *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: subOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setEduSubType(opt.value);
              setEduAdmissionLevel("");
              setEduSubFields({});
            },
            className: `px-3 py-3 rounded-lg border text-sm font-medium text-center ${eduSubType === opt.value ? "bg-primary text-white border-primary" : "border-border"}`,
            children: opt.label
          },
          opt.value
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        !isOtherInstitute && !instituteName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Search & Select Your Institute *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: instituteSearch,
                onChange: (e) => setInstituteSearch(e.target.value),
                placeholder: "Type institute name...",
                className: "pl-9"
              }
            )
          ] }),
          instituteSearch.trim().length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border divide-y divide-border overflow-hidden max-h-48 overflow-y-auto", children: [
            filteredInstitutes.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setIsOtherInstitute(false);
                  setInstituteName(n);
                  setCatFields((p) => ({ ...p, institute_name: n }));
                  setInstituteSearch("");
                },
                className: "w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5",
                children: n
              },
              n
            )),
            filteredInstitutes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-2.5 text-sm text-muted-foreground", children: "No match found." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setIsOtherInstitute(true);
                setInstituteName("");
                setCatFields((p) => {
                  const next = { ...p };
                  delete next.institute_name;
                  return next;
                });
              },
              className: "text-xs text-primary font-medium underline",
              children: "My institute is not in the list — add manually"
            }
          )
        ] }),
        instituteName && !isOtherInstitute && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-300 p-3 flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-green-700", children: [
            "✓ ",
            instituteName,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", children: "(1Bill listed)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setInstituteName("");
                setCatFields((p) => {
                  const next = { ...p };
                  delete next.institute_name;
                  return next;
                });
              },
              className: "text-xs text-primary underline shrink-0",
              children: "Change"
            }
          )
        ] }),
        isOtherInstitute && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Institute (not in list)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setIsOtherInstitute(false);
                  setOtherName("");
                  setOtherContact("");
                  setOtherAddress("");
                },
                className: "text-xs text-primary underline",
                children: "Back to list"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4" }),
              " Institute Full Name *"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: otherName,
                onChange: (e) => setOtherName(e.target.value),
                placeholder: "e.g. Beaconhouse School System"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
              " Institute Contact Number *"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: otherContact,
                onChange: (e) => setOtherContact(e.target.value),
                placeholder: "Office number — Givethra will verify"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
              " Institute Address (City, Area, Street) *"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: otherAddress,
                onChange: (e) => setOtherAddress(e.target.value),
                placeholder: "e.g. Main Boulevard, Gulberg 3, Lahore",
                rows: 2,
                className: "resize-none"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "💡 Please provide complete address so Givethra can verify the institute's location." })
          ] })
        ] })
      ] }),
      (instituteName || isOtherInstitute) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2 border-t border-border", children: [
        listCfg.personFields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            f.label,
            " ",
            f.required && "*"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: catFields[f.key] ?? "",
              onChange: (e) => setCatFields((p) => ({ ...p, [f.key]: e.target.value })),
              placeholder: f.placeholder || f.label
            }
          )
        ] }, f.key)),
        isAdmissionCategory && eduSubType === "admission" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Where are you seeking admission? *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["School", "College", "University"].map((level) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setEduAdmissionLevel(level);
                setEduSubFields({});
              },
              className: `px-3 py-2.5 rounded-lg border text-sm font-medium ${eduAdmissionLevel === level ? "bg-primary text-white border-primary" : "border-border"}`,
              children: level
            },
            level
          )) })
        ] }),
        (isAdmissionCategory && eduSubType === "admission" && eduAdmissionLevel || isFeeCategory && eduSubType) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: isAdmissionCategory ? `📋 ${eduAdmissionLevel} Admission Details` : `📋 ${eduSubType.charAt(0).toUpperCase() + eduSubType.slice(1)} Fee Details` }),
          (_b2 = (_a2 = listCfg.getSubFields) == null ? void 0 : _a2.call(listCfg, eduSubType, isAdmissionCategory ? eduAdmissionLevel : "")) == null ? void 0 : _b2.map((f) => {
            if (f.choices) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  f.label,
                  " *"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: f.choices.map((choice) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setEduSubFields((p) => ({ ...p, [f.key]: choice })),
                    className: `px-2 py-2 rounded-lg border text-xs font-medium text-left ${eduSubFields[f.key] === choice ? "bg-primary text-white border-primary" : "border-border"}`,
                    children: choice
                  },
                  choice
                )) })
              ] }, f.key);
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                f.label,
                " *"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: eduSubFields[f.key] ?? "",
                  onChange: (e) => setEduSubFields((p) => ({ ...p, [f.key]: e.target.value })),
                  placeholder: f.placeholder || f.label
                }
              )
            ] }, f.key);
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: listCfg.refLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: refNumber,
              onChange: (e) => setRefNumber(e.target.value),
              placeholder: listCfg.refHint
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            "💡 ",
            listCfg.refHint
          ] })
        ] }),
        (isAdmissionCategory && eduSubType === "admission" && eduAdmissionLevel || isFeeCategory && eduSubType) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "📎 Required Documents" }),
          (_d2 = (_c2 = listCfg.getSubDocs) == null ? void 0 : _c2.call(listCfg, eduSubType, isAdmissionCategory ? eduAdmissionLevel : "")) == null ? void 0 : _d2.map((doc) => docBox(doc.key, doc.label, doc.required, doc.hint))
        ] })
      ] })
    ] });
  }
  const sym = CURRENCY_SYMBOLS[currency] ?? currency;
  const filteredInstitutes = listCfg ? listCfg.list.filter((n) => n.toLowerCase().includes(instituteSearch.toLowerCase())).slice(0, 8) : [];
  const docBox = (key, label, required, hint, accept = "image/*,.pdf") => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-3 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
      label,
      " ",
      required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
    ] }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: hint }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "file",
        accept,
        onChange: (e) => {
          var _a2;
          return handleDocSelect(key, ((_a2 = e.target.files) == null ? void 0 : _a2[0]) ?? null);
        },
        className: "block w-full text-sm text-muted-foreground"
      }
    ),
    uploadingDoc === key && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600", children: "⏳ Uploading... please wait" }),
    catDocUrls[key] && uploadingDoc !== key && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600 flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
      " ",
      catDocNames[key] || "Document",
      " — Uploaded ✓"
    ] }),
    tried2 && required && !catDocUrls[key] && uploadingDoc !== key && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500 font-medium", children: "⚠️ Required — attach and wait for Uploaded ✓." })
  ] });
  function TermsAndConditions() {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "📜 Terms & Conditions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-60 overflow-y-auto rounded-xl border border-border bg-muted/30 p-4 text-xs space-y-2.5 leading-relaxed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "1. Truthfulness & Accuracy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "I confirm that all information, documents, and statements provided in my case are completely true and accurate. Any falsehood or fraud will result in permanent account closure."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "2. Video Privacy & Access" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "a." }),
          " My identity documents (CNIC, bills, etc.) and my selfie will ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "never" }),
          " be shown to any contributor. They are only for Givethra's verification team.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "b." }),
          " My verification video (the appeal video I record) ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "will be shown only to the Hero who unlocks my case" }),
          " by paying the required credit. No one else can see it.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "c." }),
          " The video is provided in ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "stream-only mode" }),
          " — it cannot be downloaded, shared, or saved by anyone.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "d." }),
          " Once my case is successfully completed (payment made), the video will be ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "permanently hidden" }),
          " from that Hero and will never be shown again."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3. Feedback Mandate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "If my case is successfully completed, I must submit a ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "feedback video (minimum 60 seconds) + a written caption" }),
          " within ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "24 hours" }),
          " of completion. Failure to do so will result in my account being ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "suspended" }),
          ". To unsuspend, I must pay ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "5 credits" }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "4. Public Usage Rights" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "I grant Givethra the right to use my ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "case description, feedback video, and caption" }),
          " as public property. Givethra may publish these on social media, the community wall, or other public platforms where viewers can watch, like, and comment."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "5. Listing Fee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "I understand that if my case is not my first case or part of a free offer, a ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "1 credit listing fee" }),
          " will be deducted, which is ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "non-refundable" }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "6. Consent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "I have read and fully agree to all the above terms and conditions."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            id: "termsCheck",
            checked: confirmed,
            onChange: (e) => setConfirmed(e.target.checked),
            className: "h-4 w-4"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "termsCheck", className: "text-sm", children: "I have read all the Terms & Conditions and I agree to them." })
      ] })
    ] });
  }
  if (kycLoading || loadingUserStats) return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-20", children: "Loading..." }) });
  if (checkingFeedback) return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-20", children: "Loading..." }) });
  if (blockedByFeedback) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-xl mx-auto px-4 py-16 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-12 w-12 text-primary mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Please Share Your Feedback First" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        'Your case "',
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: blockedByFeedback.caseTitle }),
        `" was completed with a Hero's help. Before submitting a new case, please share your feedback (message + 90-second video) — this builds trust for Givethra and future Heroes.`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "w-full h-11", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cases/$id", params: { id: blockedByFeedback.caseId }, children: "Go to My Completed Case" }) })
    ] }) }) });
  }
  if (kycStatus === "pending") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-xl mx-auto px-4 py-16 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-12 w-12 text-orange-500 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "KYC Under Review" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Your KYC is being reviewed. Please wait for approval before submitting a case." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "Go to Home" }) })
    ] }) }) });
  }
  if (kycStatus !== "approved") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-xl mx-auto px-4 py-16 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-12 w-12 text-orange-500 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "KYC Verification Required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Complete identity verification before submitting a request." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/kyc", onClick: () => {
        try {
          sessionStorage.setItem("givethra_kyc_return_to", "/submit-request");
        } catch {
        }
      }, children: "Complete KYC" }) })
    ] }) }) });
  }
  if (isSuspended) {
    const canUnlock = balance >= UNLOCK_CREDITS_REQUIRED;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-xl mx-auto px-4 py-16 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-16 w-16 text-red-500 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-red-700", children: "🚫 Account Suspended" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-red-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Your account has been suspended due to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: MAX_REJECTIONS_BEFORE_SUSPENSION }),
          " rejected cases."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          "This is your ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            "#",
            suspensionCount
          ] }),
          " suspension."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          "Total rejected cases: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: userRejectionCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Case submission and helping other cases are disabled while this account is suspended." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "You can still view your dashboard, profile, wallet, posts, likes, comments, notifications, and existing case records." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-xl border p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "🔓 How to Unlock Your Account:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Deposit ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            UNLOCK_CREDITS_REQUIRED,
            " credits"
          ] }),
          " to your wallet and click the button below."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center bg-primary/5 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Your Balance:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold text-lg ${canUnlock ? "text-green-600" : "text-red-600"}`, children: [
            balance,
            " credits"
          ] })
        ] }),
        canUnlock ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "w-full h-12 font-semibold bg-green-600 hover:bg-green-700",
            onClick: handleUnlockAccount,
            disabled: unlocking,
            children: unlocking ? "Unlocking..." : `🔓 Unlock Account (${UNLOCK_CREDITS_REQUIRED} Credits)`
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full h-12 font-semibold", onClick: () => navigate({ to: "/wallet" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4 mr-2" }),
            " Add Credits to Wallet"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "You need ",
            UNLOCK_CREDITS_REQUIRED - balance,
            " more credits to unlock."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left text-xs text-muted-foreground border-t border-border pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "⚠️ Important:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "After unlocking, your rejection count will reset to 0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "If you get ",
            MAX_REJECTIONS_BEFORE_SUSPENSION,
            " rejections again, your account will be suspended again"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Each suspension costs ",
            UNLOCK_CREDITS_REQUIRED,
            " credits to unlock"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "w-full", onClick: () => navigate({ to: "/" }), children: "Go to Dashboard" })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-2", children: "Submit a Help Request" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-3", children: "Your first case is FREE. After that, a 1 credit listing fee applies." }),
    !loadingUserStats && user && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-xl border bg-card p-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/5 rounded-lg p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Cases" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-lg", children: userTotalCases })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 dark:bg-red-950/20 rounded-lg p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Rejected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-lg text-red-600", children: userRejectionCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 dark:bg-green-950/20 rounded-lg p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Free Cases Used" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-lg text-green-600", children: [
            userFreeCasesUsed,
            "/",
            MAX_FREE_CASES
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-bold text-lg ${isFreeDisabled ? "text-red-600" : "text-green-600"}`, children: isFreeDisabled ? "🔒 Free Disabled" : "✅ Free Active" })
        ] })
      ] }),
      isFreeDisabled && !isSuspended && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs text-center text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg p-2", children: "⚠️ Your free case access has been disabled. You can still submit cases using credits." }),
      userRejectionCount >= 3 && userRejectionCount < MAX_REJECTIONS_BEFORE_SUSPENSION && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs text-center text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2", children: [
        "⚠️ Warning: ",
        userRejectionCount,
        " rejections. After ",
        MAX_REJECTIONS_BEFORE_SUSPENSION,
        " rejections, your account will be suspended."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Don't understand English?" }),
        " In your phone browser menu, tap",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Translate"' }),
        " to read this page in Urdu or any language."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 inline-flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full", children: [
      "💰 Your Balance: ",
      balance,
      " Credits"
    ] }),
    willBeFree && !isFreeDisabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-300 p-4 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-5 w-5 text-green-600 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-green-700", children: "🎉 This Case is FREE!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-green-700", children: [
          isFirstCaseFree ? "Your first case is FREE!" : "This category has a FREE offer!",
          userFreeCasesUsed > 0 && ` (You've used ${userFreeCasesUsed}/${MAX_FREE_CASES} free cases)`
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center mb-8 overflow-x-auto pb-2", children: STEPS.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${i + 1 < step ? "bg-primary border-primary text-white" : i + 1 === step ? "border-primary text-primary" : "border-border text-muted-foreground"}`,
            children: i + 1 < step ? "✓" : i + 1
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] mt-1 text-muted-foreground whitespace-nowrap", children: label })
      ] }),
      i < STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-px w-6 mx-1 mb-4 ${i + 1 < step ? "bg-primary" : "bg-border"}` })
    ] }, label)) }),
    step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg", children: "📝 Basic Information" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Help Category *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "notranslate", translate: "no", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: category,
            onValueChange: (v) => {
              setCategory(v);
              setInstituteName("");
              setIsOtherInstitute(false);
              setInstituteSearch("");
              setEduSubType("");
              setEduAdmissionLevel("");
              setEduSubFields({});
              setRefNumber("");
              setOtherName("");
              setOtherContact("");
              setOtherAddress("");
              setCatFields({});
              setCatDocUrls({});
              setCatDocNames({});
              setPropertyOwnership("");
              setGender("");
              setMaritalStatus("");
              setIsOrphan("");
              setOrphanParent("");
              setSeekerName("");
              setSeekerContact("");
              setReceiverName("");
              setReceiverContact("");
              setReceiverBank("");
              setReceiverAccount("");
              setReceiverAddress("");
              setReceiverShopName("");
              setDisabilityMode("");
              setAmount("");
              setDebtTotalAmount("");
              setEduSubType("");
              setEduAdmissionLevel("");
              setEduSubFields({});
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: !category ? "border-red-400" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-72", children: CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ]
          }
        ) }),
        willBeFree && !isFreeDisabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600 font-medium flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-3 w-3" }),
          " ",
          isFirstCaseFree ? "Your first case is FREE!" : "This category has a FREE offer!"
        ] }),
        category && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-primary", children: [
            "📋 ",
            ((_a = CATEGORY_LIMITS[category]) == null ? void 0 : _a.label) || "Verified Need"
          ] }),
          isFixedAmount(category) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-green-600 font-bold", children: [
            "💰 Fixed Amount: Rs ",
            (_b = getFixedAmountValue(category)) == null ? void 0 : _b.toLocaleString()
          ] }),
          getMaxLimit(category) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-amber-600", children: [
            "⚠️ Maximum Limit: Rs ",
            (_c = getMaxLimit(category)) == null ? void 0 : _c.toLocaleString()
          ] }),
          isDebtCategory(category) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-600", children: "📊 5% of total debt (max Rs 25,000)" }),
          needsPaymentReceiver && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-purple-600", children: "📌 Payment receiver details required" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Request Title *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: title,
            onChange: (e) => setTitle(e.target.value),
            placeholder: "e.g. Help with School Fee"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Short Description *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: shortDesc,
            onChange: (e) => setShortDesc(e.target.value),
            placeholder: "One line summary"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Country *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: country, onValueChange: setCountry, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select your country" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-72", children: COUNTRIES.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: option.name, children: option.name }, option.code)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "City *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: city, onChange: (e) => setCity(e.target.value), placeholder: "Karachi" })
        ] })
      ] }),
      !easy && category && category !== "Disability Support" && !isEducationCategory && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Urgency Level *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: ["Low", "Medium", "High", "Emergency"].map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setUrgency(u),
            className: `px-3 py-2 rounded-lg border text-sm font-medium ${urgency === u ? "bg-primary text-white border-primary" : "border-border"}`,
            children: u
          },
          u
        )) })
      ] }),
      easy && !isEducationCategory && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "ℹ️ Urgency will be set automatically from your bill's due date." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "w-full",
          onClick: () => {
            setTried1(true);
            if (!category || !title.trim() || !shortDesc.trim() || !country.trim() || !city.trim()) {
              ue.error("Please fill all required fields (marked red)");
              return;
            }
            if (!easy && category !== "Disability Support" && !isEducationCategory && !urgency) {
              ue.error("Please choose urgency level");
              return;
            }
            setStep(2);
          },
          children: "Continue"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StepGuide,
        {
          lines: [
            "Choose the category that matches your need.",
            "Write a short title and one-line description.",
            "Enter your country and city, then tap Continue."
          ]
        }
      )
    ] }),
    step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold text-lg", children: [
        "🗂 ",
        category || "Category",
        " — Details"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 space-y-3 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Do you have a job? *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: ["Yes", "No"].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setJobStatus(opt),
            className: `px-3 py-2.5 rounded-lg border text-sm font-medium ${jobStatus === opt ? "bg-primary text-white border-primary" : "border-border"}`,
            children: opt === "Yes" ? "✅ Yes, I have a job" : "❌ No job"
          },
          opt
        )) }),
        jobStatus === "Yes" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-green-300 bg-green-50 dark:bg-green-950/20 p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-green-700", children: "📎 Required Documents (Job)" }),
          docBox("salary_slip", "Last 6 Months Salary Slip", true),
          docBox("statement", "Last 6 Months Bank Statement", true, "Bank, EasyPaisa or JazzCash", ".pdf,image/*")
        ] }) }),
        jobStatus === "No" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-amber-700", children: "📎 Required Document (No Job)" }),
          docBox("statement", "Last 6 Months Bank Statement", true, "Bank, EasyPaisa or JazzCash", ".pdf,image/*")
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 space-y-3 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gender *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: GENDER_OPTIONS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setGender(g),
              className: `px-3 py-2 rounded-lg border text-sm font-medium ${gender === g ? "bg-primary text-white border-primary" : "border-border"}`,
              children: g
            },
            g
          )) })
        ] }),
        (gender === "Male" || gender === "Female") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Marital Status *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: MARITAL_STATUS_OPTIONS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setMaritalStatus(m),
              className: `px-3 py-2 rounded-lg border text-sm font-medium ${maritalStatus === m ? "bg-primary text-white border-primary" : "border-border"}`,
              children: m
            },
            m
          )) })
        ] }),
        gender === "Female" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Are you an orphan? *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: ["Yes", "No"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setIsOrphan(o),
                className: `px-3 py-2 rounded-lg border text-sm font-medium ${isOrphan === o ? "bg-primary text-white border-primary" : "border-border"}`,
                children: o === "Yes" ? "✅ Yes, I am an orphan" : "❌ No, I am not an orphan"
              },
              o
            )) })
          ] }),
          isOrphan === "Yes" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Which parent passed away? *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["Father", "Mother", "Both"].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setOrphanParent(p),
                className: `px-3 py-2 rounded-lg border text-sm font-medium ${orphanParent === p ? "bg-primary text-white border-primary" : "border-border"}`,
                children: p
              },
              p
            )) })
          ] })
        ] }),
        gender === "Child" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Is this child an orphan? *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: ["Yes", "No"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setIsOrphan(o),
              className: `px-3 py-2 rounded-lg border text-sm font-medium ${isOrphan === o ? "bg-primary text-white border-primary" : "border-border"}`,
              children: o === "Yes" ? "✅ Yes, child is orphan" : "❌ No, child is not orphan"
            },
            o
          )) })
        ] })
      ] }),
      gender && extraConditionalDocs().length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 space-y-3 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "📎 Required Documents — Based on Your Profile" }),
        extraConditionalDocs().map((d) => docBox(d.key, d.label, true, d.hint))
      ] }),
      renderSeekerDetails(),
      renderPaymentReceiverDetails(),
      utilCfg && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-700 dark:text-red-400 font-medium", children: "⚠️ One case = ONE bill only." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Select Your Company *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: utilCfg.companies.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setInstituteName(c.name);
                setCatFields((p) => ({ ...p, institute_name: c.name }));
                setIsOtherInstitute(false);
              },
              className: `px-3 py-2.5 rounded-lg border text-xs font-medium text-left ${instituteName === c.name ? "bg-primary text-white border-primary" : "border-border"}`,
              children: c.name
            },
            c.name
          )) })
        ] }),
        selectedCompany && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              selectedCompany.ref,
              " *"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: refNumber,
                onChange: (e) => setRefNumber(e.target.value),
                placeholder: selectedCompany.refHint
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
              "💡 ",
              selectedCompany.refHint
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bill Owner Name (as on bill) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.bill_owner_name || "",
                onChange: (e) => setCatFields((p) => ({ ...p, bill_owner_name: e.target.value })),
                placeholder: "e.g. Muhammad Ali"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "💡 Enter the name exactly as it appears on the bill." })
          ] })
        ] }),
        docBox("bill", "Bill Photo (clear & readable)", true, "Bill should clearly show consumer/reference number and amount")
      ] }),
      listCfg && !isEducationCategory && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-700 dark:text-red-400 font-medium", children: [
          "⚠️ One case = ONE ",
          category.includes("Medic") ? "patient" : "student",
          " only."
        ] }),
        !isOtherInstitute && !instituteName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Search & Select Your Institute *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: instituteSearch,
                onChange: (e) => setInstituteSearch(e.target.value),
                placeholder: "Type institute name...",
                className: "pl-9"
              }
            )
          ] }),
          instituteSearch.trim().length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border divide-y divide-border overflow-hidden max-h-48 overflow-y-auto", children: [
            filteredInstitutes.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setInstituteName(n);
                  setInstituteSearch("");
                },
                className: "w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5",
                children: n
              },
              n
            )),
            filteredInstitutes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-2.5 text-sm text-muted-foreground", children: "No match found." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setIsOtherInstitute(true),
              className: "text-xs text-primary font-medium underline",
              children: "My institute is not in the list — add manually"
            }
          )
        ] }),
        instituteName && !isOtherInstitute && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-300 p-3 flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-green-700", children: [
            "✓ ",
            instituteName,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", children: "(1Bill listed)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setInstituteName(""),
              className: "text-xs text-primary underline shrink-0",
              children: "Change"
            }
          )
        ] }),
        isOtherInstitute && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Institute (not in list)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setIsOtherInstitute(false);
                  setOtherName("");
                  setOtherContact("");
                  setOtherAddress("");
                },
                className: "text-xs text-primary underline",
                children: "Back to list"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Institute Full Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: otherName,
                onChange: (e) => setOtherName(e.target.value),
                placeholder: "Complete official name"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Institute Contact Number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: otherContact,
                onChange: (e) => setOtherContact(e.target.value),
                placeholder: "Office number — Givethra will verify"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Institute Address (City, Area, Street) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: otherAddress,
                onChange: (e) => setOtherAddress(e.target.value),
                placeholder: "e.g. Main Boulevard, Gulberg 3, Lahore",
                rows: 2
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "💡 Please provide complete address so Givethra can verify the institute's location." })
          ] })
        ] }),
        (instituteName || isOtherInstitute) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          listCfg.personFields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              f.label,
              " ",
              f.required && "*"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields[f.key] ?? "",
                onChange: (e) => setCatFields((p) => ({ ...p, [f.key]: e.target.value })),
                placeholder: f.placeholder || f.label
              }
            )
          ] }, f.key)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: listCfg.refLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: refNumber,
                onChange: (e) => setRefNumber(e.target.value),
                placeholder: listCfg.refHint
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
              "💡 ",
              listCfg.refHint
            ] })
          ] }),
          docBox("bill", listCfg.billLabel, true),
          listCfg.extraDocs && listCfg.extraDocs.map((doc) => docBox(doc.key, doc.label, doc.required, doc.hint)),
          category === "Medical & Treatment" && docBox(
            "doctor_prescription",
            "Doctor's Written Prescription / Report",
            true,
            "A clear photo of the doctor's handwritten or official report"
          )
        ] })
      ] }),
      isEducationCategory && renderEducationCategory(),
      !easy && config && category !== "Disability Support" && !isEducationCategory && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        cfgOneCase && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-700 dark:text-red-400 font-medium", children: [
          "⚠️ ",
          cfgOneCase
        ] }),
        cfgFields.filter((f) => {
          if (f.key === "job_status") return false;
          if (SKIP_FIELDS.has(f.key)) return false;
          return true;
        }).map((f) => renderField(f)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 space-y-3 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "📎 Required Documents" }),
          cfgDocs.filter((d) => d.key !== "salary_slip" && d.key !== "statement").map((d) => docBox(d.key, d.label, !!d.required, d.hint))
        ] })
      ] }),
      category === "Disability Support" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border-2 border-amber-300 bg-amber-50/30 dark:bg-amber-950/10 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2", children: "📎 First — Required Documents (Upload these first)" }),
        docBox(
          "disability_cnic",
          "CNIC showing Disability (or Disability Certificate)",
          true,
          "REQUIRED — CNIC that marks the person as disabled, or an official disability certificate"
        ),
        docBox("disability_photo", "Clear Photo of Disability", true, "A clear photo showing the disability, for verification"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-amber-200 dark:border-amber-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold mb-3", children: "What kind of help is needed? *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2", children: [
            { v: "product", l: "🦽 Equipment / Product (e.g. wheelchair, hearing aid)" },
            { v: "treatment", l: "🏥 Hospital Treatment" },
            { v: "stipend", l: `💰 Monthly Stipend (Rs ${DISABILITY_STIPEND_AMOUNT})` }
          ].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setDisabilityMode(o.v),
              className: `px-3 py-2.5 rounded-lg border text-sm font-medium text-left ${disabilityMode === o.v ? "bg-primary text-white border-primary" : "border-border"}`,
              children: o.l
            },
            o.v
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type of Disability *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: CHOICE_FIELDS.disability_type.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setDisabilityType(opt),
              className: `px-2 py-2 rounded-lg border text-xs font-medium text-left ${disabilityType === opt ? "bg-primary text-white border-primary" : "border-border"}`,
              children: opt
            },
            opt
          )) })
        ] }),
        disabilityMode === "product" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border border-border p-3 bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-green-700", children: "🛒 Product — Shop Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Enter the shop where you'll buy the equipment." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Shop Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: disabilityShopName,
                onChange: (e) => setDisabilityShopName(e.target.value),
                placeholder: "Shop name"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Shop Contact Number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: disabilityShopContact,
                onChange: (e) => setDisabilityShopContact(e.target.value),
                placeholder: "Phone number"
              }
            )
          ] }),
          docBox("product_receipt", "Shop Quotation / Price Estimate", true, "Photo of the shop's quotation showing the product & price")
        ] }),
        disabilityMode === "treatment" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border border-border p-3 bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-green-700", children: "🏥 Treatment — Select Hospital" }),
          !disabilityHospitalOther && !disabilityHospital && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Search & Select Hospital *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: disabilityHospitalSearch,
                  onChange: (e) => setDisabilityHospitalSearch(e.target.value),
                  placeholder: "Type hospital name...",
                  className: "pl-9"
                }
              )
            ] }),
            disabilityHospitalSearch.trim().length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border divide-y divide-border overflow-hidden max-h-48 overflow-y-auto", children: HEALTH_INSTITUTES.filter(
              (n) => n.toLowerCase().includes(disabilityHospitalSearch.toLowerCase())
            ).slice(0, 8).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setDisabilityHospital(n);
                  setDisabilityHospitalSearch("");
                },
                className: "w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5",
                children: n
              },
              n
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setDisabilityHospitalOther(true),
                className: "text-xs text-primary font-medium underline",
                children: "My hospital is not in the list — add manually"
              }
            )
          ] }),
          disabilityHospital && !disabilityHospitalOther && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-300 p-3 flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-green-700", children: [
              "✓ ",
              disabilityHospital
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setDisabilityHospital(""),
                className: "text-xs text-primary underline shrink-0",
                children: "Change"
              }
            )
          ] }),
          disabilityHospitalOther && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hospital Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: disabilityHospital,
                onChange: (e) => setDisabilityHospital(e.target.value),
                placeholder: "Full hospital name"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setDisabilityHospitalOther(false);
                  setDisabilityHospital("");
                },
                className: "text-xs text-primary underline",
                children: "Back to list"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 space-y-3 border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Amount *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  value: treatmentAmount,
                  onChange: (e) => setTreatmentAmount(e.target.value),
                  placeholder: "Total amount on hospital bill"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bill Expiry Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  value: treatmentExpiry,
                  onChange: (e) => setTreatmentExpiry(e.target.value)
                }
              )
            ] }),
            treatmentExpiry && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium", children: [
              "Urgency (auto):",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: treatmentAutoUrgency === "Emergency" ? "text-red-600" : treatmentAutoUrgency === "Medium" ? "text-orange-600" : "text-green-600",
                  children: treatmentAutoUrgency
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Patient / Bill Number *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: treatmentPatientNumber,
                  onChange: (e) => setTreatmentPatientNumber(e.target.value),
                  placeholder: "Patient number or bill number from hospital"
                }
              )
            ] })
          ] })
        ] }),
        disabilityMode === "stipend" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border border-border p-3 bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-green-700", children: [
            "💰 Monthly Stipend — Rs ",
            DISABILITY_STIPEND_AMOUNT
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This amount will be sent directly to your own account." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account Title *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: disabilityBankTitle,
                onChange: (e) => setDisabilityBankTitle(e.target.value),
                placeholder: "Your name as on account"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bank Account / EasyPaisa / JazzCash Number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: disabilityBankNumber,
                onChange: (e) => setDisabilityBankNumber(e.target.value),
                placeholder: "Account number"
              }
            )
          ] })
        ] })
      ] }),
      PROPERTY_RELEVANT_CATS.has(category) && !isEducationCategory && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-semibold", children: "🏠 Property Ownership *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Is the property where you live owned by you or are you a tenant (renting)?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setPropertyOwnership("owned"),
              className: `px-3 py-2.5 rounded-lg border text-sm font-medium ${propertyOwnership === "owned" ? "bg-primary text-white border-primary" : "border-border"}`,
              children: "🏠 Owned"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setPropertyOwnership("rented"),
              className: `px-3 py-2.5 rounded-lg border text-sm font-medium ${propertyOwnership === "rented" ? "bg-primary text-white border-primary" : "border-border"}`,
              children: "🏢 Rented (Tenant)"
            }
          )
        ] }),
        propertyOwnership === "rented" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "📎 Tenant Documents (Required)" }),
          docBox(
            "rental_agreement",
            "Rental Agreement / Contract",
            true,
            "Clear photo of your rental agreement or lease document"
          ),
          docBox(
            "landlord_cnic",
            "Landlord's CNIC (or any proof of landlord ownership)",
            true,
            "CNIC of the landlord or any document proving property ownership"
          )
        ] }),
        propertyOwnership === "owned" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "House is in whose name? *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["Myself", "Father", "Mother"].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setCatFields((p) => ({ ...p, owner_relation: opt })),
              className: `px-2 py-2 rounded-lg border text-xs font-medium ${catFields.owner_relation === opt ? "bg-primary text-white border-primary" : "border-border"}`,
              children: opt
            },
            opt
          )) }),
          docBox(
            "owner_cnic",
            `${catFields.owner_relation || "Owner"}'s CNIC`,
            true,
            "CNIC of the person whose name the house/utility bill is registered under"
          )
        ] })
      ] }),
      renderPaymentReceiver(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 space-y-3 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Why do you need this help? Explain your situation *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: description,
              onChange: (e) => setDescription(e.target.value),
              rows: 6,
              placeholder: "Describe your situation in detail — Heroes read this to understand your need and decide to help."
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "💡 Write in detail so Heroes understand your situation and can help better." })
        ] }),
        isFixedAmount(category) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-300 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-green-700", children: "💰 Fixed Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-green-700", children: [
            "Rs ",
            (_d = getFixedAmountValue(category)) == null ? void 0 : _d.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This amount is fixed for this category. You cannot change it." })
        ] }) : isDebtCategory(category) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-300 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-blue-700 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-4 w-4" }),
              " 5% of Total Debt (Max Rs 25,000)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Enter your total outstanding debt below. Givethra will automatically calculate 5% of it." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Outstanding Debt Amount *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: currency, onValueChange: setCurrency, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-60", children: CASE_CURRENCIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none", children: sym }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    value: debtTotalAmount,
                    onChange: (e) => setDebtTotalAmount(e.target.value),
                    placeholder: "e.g. 500000",
                    className: "pl-12"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "💡 Enter your total debt amount (e.g. 500,000 for 5 lakh)" })
          ] }),
          debtTotalAmount && parseFloat(debtTotalAmount) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-primary/5 border border-primary/20 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Calculated 5% Amount:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-bold text-primary", children: [
                sym,
                " ",
                calculatedDebtAmount.toLocaleString(),
                calculatedDebtAmount >= 25e3 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-600 ml-2", children: "(Max limit reached)" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "5% of ",
                parseFloat(debtTotalAmount).toLocaleString()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Max: Rs 25,000" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "hidden", value: amount })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Amount Needed *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: currency, onValueChange: setCurrency, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-60", children: CASE_CURRENCIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none", children: sym }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  value: amount,
                  onChange: (e) => setAmount(e.target.value),
                  placeholder: "e.g. 31000",
                  className: "pl-12"
                }
              )
            ] })
          ] }),
          getMaxLimit(category) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600", children: [
            "⚠️ Maximum allowed: Rs ",
            (_e = getMaxLimit(category)) == null ? void 0 : _e.toLocaleString()
          ] }),
          category === "Education, Books & Admission" && eduSubType === "admission" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "💡 Enter the admission fee / installment amount from your challan." }),
          category === "School, College & University Fees" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "💡 Enter the 1 month fee amount from your challan." }),
          category === "Food & Groceries" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "💡 Maximum Rs 12,000 per family." }),
          category === "Home Repair" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "💡 Maximum Rs 18,000." }),
          category === "Business / Work Help" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "💡 Rs 8,000–20,000 based on verified need." }),
          needsPaymentReceiver && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-purple-600", children: [
            "💡 This amount will be sent to the ",
            getReceiverLabel(),
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: easy ? "Bill / Challan Due Date (Expiry) *" : "Expected Resolution Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: deadline, onChange: (e) => setDeadline(e.target.value) }),
          easy && deadline && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium", children: [
            "Urgency (auto):",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: autoUrgency === "Emergency" ? "text-red-600" : autoUrgency === "Medium" ? "text-orange-600" : "text-green-600",
                children: autoUrgency
              }
            )
          ] }),
          easy && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "⚠️ If the due date passes and the case is not completed, the case will EXPIRE. Givethra verifies this date from your bill." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1", onClick: () => setStep(1), children: "Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "flex-1",
            onClick: () => {
              setTried2(true);
              if (uploadingDoc) {
                ue.error("Please wait — a document is still uploading.");
                return;
              }
              const err = validateStep2();
              if (err) {
                ue.error(err);
                return;
              }
              setStep(3);
            },
            children: "Continue"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StepGuide,
        {
          lines: [
            "Answer the job question first.",
            "Select your gender and provide required documents.",
            "Fill your personal details (Seeker).",
            ...needsPaymentReceiver ? [
              `Fill the ${getReceiverLabel()} payment details completely.`,
              "Provide full name, contact, bank details, and address."
            ] : [],
            ...isEducationCategory ? [
              "For Education, first select what you need.",
              "Search and select your institute from the list, or add manually.",
              "If adding manually, provide FULL NAME, CONTACT, and ADDRESS.",
              "Fill all required fields and attach documents."
            ] : [],
            ...isFixedAmount(category) ? [`💰 This category has a FIXED amount of Rs ${(_f = getFixedAmountValue(category)) == null ? void 0 : _f.toLocaleString()}.`] : isDebtCategory(category) ? [
              "📊 Enter your total debt amount.",
              "5% will be automatically calculated.",
              "Maximum assistance is Rs 25,000."
            ] : [
              "💰 Enter the verified amount needed.",
              ...getMaxLimit(category) ? [`⚠️ Maximum limit: Rs ${(_g = getMaxLimit(category)) == null ? void 0 : _g.toLocaleString()}`] : []
            ],
            "Finally, explain your situation, amount, and expiry date.",
            ...COMMON_GUIDE_TAIL
          ]
        }
      )
    ] }),
    step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg", children: "🛡 Identity Verification" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-semibold", children: "📸 Live Selfie *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Take a clear selfie to verify your identity. This must be a live photo, not a pre-existing image." }),
        !selfiePreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          !cameraOn ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startCamera, className: "w-full", variant: "outline", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4 mr-2" }),
            " Open Camera for Selfie"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, className: "w-full rounded-xl border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: takeSelfie, className: "w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4 mr-2" }),
              " Take Selfie"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "hidden" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: selfiePreview, alt: "Selfie", className: "w-full rounded-xl border max-h-48 object-cover" }),
          uploadingSelfie && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600", children: "⏳ Uploading selfie..." }),
          selfieUrl && !uploadingSelfie && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
            " Selfie ready ✓"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "w-full", onClick: () => {
            setSelfiePreview(null);
            setSelfieUrl("");
          }, children: "Retake Selfie" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-semibold", children: "🎥 Video Statement (60 Seconds)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Explain the following details clearly in your video statement:" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs text-muted-foreground list-disc list-inside space-y-1 ml-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "What challenge are you facing and why do you need help?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "What is your financial situation and how does this impact your daily life?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "What do you hope to achieve with this support?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 mt-1", children: [
          "⚠️ ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "The video must be up to 90 seconds to keep file size under 50 MB." })
        ] }),
        !videoPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: !videoRecording ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: startVideoRecording, className: "w-full", variant: "outline", children: "🎥 Start Recording (max 60 sec)" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-black/5 rounded-xl overflow-hidden border-2 border-primary/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "video",
              {
                ref: liveVideoRef,
                autoPlay: true,
                playsInline: true,
                muted: true,
                className: "w-full aspect-video object-cover"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full", children: "● Live" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-red-500", children: [
              "● Recording... ",
              videoTimer,
              "s / 90s"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "destructive", onClick: stopVideoRecording, children: "Stop" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "bg-red-500 h-2 rounded-full transition-all",
              style: { width: `${videoTimer / 90 * 100}%` }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600", children: "⏳ Max 90 seconds to keep file under 50MB" }),
          videoTimer >= 80 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 font-bold", children: "⚠️ Will auto-stop at 90 seconds!" })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: videoPreview, controls: true, className: "w-full rounded-xl border max-h-48" }),
          uploadingVideo && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600", children: "⏳ Uploading video..." }),
          videoUrl && !uploadingVideo && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
            " Video ready ✓"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "w-full", onClick: () => {
            setVideoPreview(null);
            setVideoUrl("");
          }, children: "Re-record Video" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1", onClick: () => setStep(2), children: "Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "flex-1",
            onClick: () => {
              if (uploadingSelfie || uploadingVideo) {
                ue.error("Please wait — upload in progress.");
                return;
              }
              if (!selfieUrl) {
                ue.error("Please take a live selfie");
                return;
              }
              if (!videoUrl) {
                ue.error("Please record a video appeal (up to 90 seconds)");
                return;
              }
              setStep(4);
            },
            children: "Continue"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StepGuide,
        {
          lines: [
            "Take a clear live selfie in good lighting.",
            "Record a 60-second video explaining your situation in detail.",
            "Tell Heroes what problem you're facing and why you need help.",
            "Explain your financial situation and how this help will make a difference.",
            "Wait for 'ready ✓', then Continue."
          ]
        }
      )
    ] }),
    step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg", children: "✅ Review & Submit" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: category })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: title })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            city,
            ", ",
            country
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Urgency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: easy ? (autoUrgency || "—") + " (auto)" : urgency })
        ] }),
        isFixedAmount(category) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount (Fixed)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-green-600", children: [
            "Rs ",
            (_h = getFixedAmountValue(category)) == null ? void 0 : _h.toLocaleString()
          ] })
        ] }) : isDebtCategory(category) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Total Debt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            sym,
            " ",
            parseFloat(debtTotalAmount || "0").toLocaleString(),
            " ",
            currency
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            sym,
            " ",
            amount,
            " ",
            currency
          ] })
        ] }),
        isDebtCategory(category) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "5% Assistance Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-primary font-bold", children: [
            sym,
            " ",
            calculatedDebtAmount.toLocaleString(),
            " ",
            currency
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Expiry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: deadline })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Job Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: jobStatus || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Gender" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: gender || "—" })
        ] }),
        (gender === "Male" || gender === "Female") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Marital Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: maritalStatus || "—" })
        ] }),
        gender === "Female" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Orphan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: isOrphan || "—" })
          ] }),
          isOrphan === "Yes" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Orphan Parent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: orphanParent || "—" })
          ] })
        ] }),
        gender === "Child" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Orphan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: isOrphan || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Seeker" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: seekerName || "—" })
        ] }),
        needsPaymentReceiver && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: getReceiverLabel() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: receiverName || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Receiver Contact" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: receiverContact || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Receiver Bank" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: receiverBank || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Receiver Account" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: receiverAccount || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Receiver Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: receiverAddress || "—" })
          ] }),
          (category === "Food & Groceries" || category === "Medicines" || category === "Home Repair") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Shop Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: receiverShopName || "—" })
          ] })
        ] }),
        shouldShowPaymentReceiver() && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Payment Receiver" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: receiverName || "—" })
        ] }),
        isEducationCategory && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Help Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: category === "Education, Books & Admission" ? eduSubType === "admission" ? "🎓 Admission" : eduSubType === "books" ? "📚 Books" : eduSubType === "uniform" ? "👕 Uniform" : "—" : eduSubType === "school" ? "🏫 School Fee" : eduSubType === "college" ? "🎓 College Fee" : eduSubType === "university" ? "🏛️ University Fee" : "—" })
          ] }),
          category === "Education, Books & Admission" && eduSubType === "admission" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Admission Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: eduAdmissionLevel || "—" })
          ] }),
          Object.keys(eduSubFields).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: Object.entries(eduSubFields).map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: key.replace(/_/g, " ").toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: value || "—" })
          ] }, key)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Institute" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: isOtherInstitute ? otherName : instituteName || "—" })
          ] }),
          isOtherInstitute && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Institute Contact" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: otherContact || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Institute Address" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: otherAddress || "—" })
            ] })
          ] })
        ] }),
        category === "Disability Support" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Disability Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: disabilityType })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Disability Mode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium capitalize", children: disabilityMode })
          ] }),
          disabilityMode === "product" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Shop" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: disabilityShopName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Shop Contact" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: disabilityShopContact })
            ] })
          ] }),
          disabilityMode === "treatment" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Hospital" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: disabilityHospital })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Treatment Amount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: treatmentAmount })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Expiry Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: treatmentExpiry })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Urgency (auto)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: treatmentAutoUrgency })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Patient/Bill No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: treatmentPatientNumber })
            ] })
          ] }),
          disabilityMode === "stipend" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Stipend Amount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                "Rs ",
                DISABILITY_STIPEND_AMOUNT
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Bank Title" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: disabilityBankTitle })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Bank Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: disabilityBankNumber })
            ] })
          ] })
        ] }),
        easy && !isEducationCategory && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground shrink-0", children: "Institute / Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right", children: isOtherInstitute ? otherName : instituteName })
          ] }),
          isOtherInstitute && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground shrink-0", children: "Institute Contact" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right", children: otherContact })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground shrink-0", children: "Institute Address" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right", children: otherAddress })
            ] })
          ] }),
          refNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground shrink-0", children: "Reference No" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium text-right", children: refNumber })
          ] })
        ] }),
        !easy && cfgFields.filter((f) => f.key !== "job_status" && !SKIP_FIELDS.has(f.key) && catFields[f.key]).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground shrink-0", children: f.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right", children: catFields[f.key] })
        ] }, f.key)),
        PROPERTY_RELEVANT_CATS.has(category) && !isEducationCategory && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Property" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: propertyOwnership === "owned" ? "Owned" : propertyOwnership === "rented" ? "Rented" : "—" })
        ] }),
        propertyOwnership === "rented" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Rental Agreement" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-green-600", children: catDocUrls["rental_agreement"] ? "✓" : "✗" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Landlord's CNIC" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-green-600", children: catDocUrls["landlord_cnic"] ? "✓" : "✗" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Documents" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            Object.keys(catDocUrls).length,
            " uploaded ✓"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Selfie" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-green-600", children: selfieUrl ? "✓ Done" : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Video" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-green-600", children: videoUrl ? "✓ Done" : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Listing Fee" }),
          willBeFree ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-green-600", children: [
            "FREE 🎉 ",
            isFirstCaseFree ? "(First Case)" : `(${(offer == null ? void 0 : offer.label) || "Offer"})`
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-primary", children: "1 Credit" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "w-full", onClick: () => setStep(1), children: "Edit" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TermsAndConditions, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full h-11 font-semibold", disabled: submitting, onClick: handleSubmit, children: submitting ? "Submitting..." : willBeFree ? "Submit Request — FREE 🎉" : "Pay 1 Credit & Submit Request" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "w-full", onClick: () => setStep(3), children: "Back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StepGuide,
        {
          lines: [
            "Check all details are correct. Tap Edit to fix anything.",
            willBeFree ? "Your case is FREE." : "A 1 Credit fee is charged when you submit.",
            "Read and agree to the Terms & Conditions.",
            "Tap Submit. Our verification team will review and approve your case."
          ]
        }
      )
    ] })
  ] }) });
}
export {
  SubmitRequestPage as default
};
