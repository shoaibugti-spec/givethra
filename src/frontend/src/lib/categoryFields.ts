export type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "number" | "textarea";
};

export type DocDef = {
  key: string;
  label: string;
  required?: boolean;
  hint?: string;
};

export type CategoryConfig = {
  fields: FieldDef[];
  documents: DocDef[];
  paymentNote: string;
  guide: string[];
  oneCaseNote: string;
};

const COMMON_GUIDE_TAIL = [
  "Upload clear documents (camera photo or file) so Givethra can verify your case.",
  "Take a live selfie and record a short video explaining your need in your own words.",
  "Your first case is FREE. Submit honestly — false information will be rejected.",
];

const JOB_FIELD: FieldDef = {
  key: "job_status",
  label: "Do you have a job?",
  placeholder: "e.g. Yes - I work as... / No",
  required: true,
};

const SALARY_DOC: DocDef = {
  key: "salary_slip",
  label: "Last Month's Salary Slip (if you have a job)",
  hint: "If employed, attach your last month's salary slip",
};

const STATEMENT_DOC: DocDef = {
  key: "statement",
  label: "Bank / Easypaisa / JazzCash Statement — Last 6 Months",
  required: true,
  hint: "Any account statement (bank, Easypaisa, or JazzCash) showing the last 6 months. Required if you don't have a salary slip.",
};

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  "Electricity Bill": {
    fields: [
      { key: "provider", label: "Electricity Company", placeholder: "e.g. K-Electric, FESCO, LESCO", required: true },
      { key: "consumer_no", label: "Consumer / Reference Number (from bill)", placeholder: "As printed on your bill", required: true },
      { key: "bill_owner_name", label: "Bill Owner Name (as on bill)", placeholder: "e.g. Muhammad Ali", required: true },
      { key: "bill_month", label: "Bill Month(s)", placeholder: "e.g. June 2026" },
      JOB_FIELD,
    ],
    documents: [
      { key: "bill", label: "Electricity Bill", required: true, hint: "Clear photo/scan of the actual bill showing consumer number & amount" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays your electricity company directly using your consumer/reference number.",
    guide: [
      "Enter your electricity company and the consumer/reference number exactly as on your bill.",
      "Upload a clear photo of the bill — the consumer number and amount must be readable.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE electricity bill only. Submit separate cases for separate bills.",
  },

  "Gas Bill": {
    fields: [
      { key: "provider", label: "Gas Company", placeholder: "e.g. SSGC, SNGPL", required: true },
      { key: "consumer_no", label: "Consumer Number (from bill)", placeholder: "As printed on your bill", required: true },
      { key: "bill_owner_name", label: "Bill Owner Name (as on bill)", placeholder: "e.g. Muhammad Ali", required: true },
      { key: "bill_month", label: "Bill Month(s)", placeholder: "e.g. June 2026" },
      JOB_FIELD,
    ],
    documents: [
      { key: "bill", label: "Gas Bill", required: true, hint: "Clear photo of the bill showing consumer number & amount" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays your gas company directly using your consumer number.",
    guide: [
      "Enter your gas company and consumer number exactly as on your bill.",
      "Upload a clear photo of the gas bill.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE gas bill only.",
  },

  "Water Bill": {
    fields: [
      { key: "provider", label: "Water Board / Company", placeholder: "e.g. KWSB, WASA", required: true },
      { key: "consumer_no", label: "Consumer / Account Number", placeholder: "As printed on your bill", required: true },
      { key: "bill_owner_name", label: "Bill Owner Name (as on bill)", placeholder: "e.g. Muhammad Ali", required: true },
      { key: "bill_month", label: "Bill Month(s)", placeholder: "e.g. June 2026" },
      JOB_FIELD,
    ],
    documents: [
      { key: "bill", label: "Water Bill", required: true, hint: "Clear photo of the bill" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays your water board directly using your account number.",
    guide: [
      "Enter your water board and account number as on your bill.",
      "Upload a clear photo of the water bill.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE water bill only.",
  },

  "House Rent": {
    fields: [
      { key: "landlord_name", label: "Landlord's Name", placeholder: "Full name of house owner", required: true },
      { key: "landlord_contact", label: "Landlord's Contact Number", placeholder: "So Givethra can verify", required: true },
      { key: "months", label: "How many months' rent?", placeholder: "e.g. 2 months", required: true },
      { key: "monthly_rent", label: "Monthly Rent Amount", placeholder: "e.g. 15000", required: true, type: "number" },
      { key: "family_members", label: "How many people in your household?", placeholder: "e.g. wife + 3 children = 5 members", required: true },
      JOB_FIELD,
    ],
    documents: [
      { key: "agreement", label: "Rent Agreement / Proof", required: true, hint: "Rent agreement, or a written note from the landlord" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays the landlord directly. Givethra may call the landlord to verify.",
    guide: [
      "Enter the landlord's name and contact number — Givethra may call to verify.",
      "Tell us how many months of rent, the monthly amount, and your household size.",
      "Upload the rent agreement or a proof from the landlord.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE household's rent.",
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
      JOB_FIELD,
    ],
    documents: [
      { key: "challan", label: "Fee Challan / Voucher", required: true, hint: "Clear photo showing student name, roll no & amount" },
      { key: "student_id", label: "Student's B-Form / Student ID Card", required: true, hint: "Photo of student's ID card or B-form — confirms whose child this is" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays the school/college directly. Givethra WILL call the institute to confirm the student, class and fee before approving.",
    guide: [
      "Enter the institute name and its OFFICE contact number — Givethra will call to verify.",
      "Enter details of ONE student only: name, father's name, class, and roll/registration number.",
      "Upload the fee challan (showing student name & amount) and the student's B-form/ID card.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE student only. Do NOT combine multiple children in one case — submit a separate case for each child.",
  },

  "Education & Books": {
    fields: [
      { key: "institute_name", label: "School / Institute / Shop Name", placeholder: "Where books/uniform will be bought", required: true },
      { key: "institute_contact", label: "Contact Number", placeholder: "Institute or shop number — for verification", required: true },
      { key: "student_name", label: "Student's Name (ONE student)", placeholder: "Full name", required: true },
      { key: "father_name", label: "Father's Name", placeholder: "Student's father's name", required: true },
      { key: "student_class", label: "Class / Grade", placeholder: "e.g. Class 5", required: true },
      { key: "needed_items", label: "What is needed?", placeholder: "e.g. books, uniform, stationery", required: true },
      JOB_FIELD,
    ],
    documents: [
      { key: "list", label: "Books/Items List or Quotation", required: true, hint: "List from school or shop with prices" },
      { key: "student_id", label: "Student's B-Form / Student ID Card", required: true, hint: "Confirms whose child this is" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays the shop/institute directly for the books/uniform.",
    guide: [
      "Enter the institute/shop name and a contact number for verification.",
      "Enter details of ONE student and exactly what is needed (books, uniform, etc.).",
      "Upload the items list/quotation and the student's B-form/ID card.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE student's education items.",
  },

  "Medical & Treatment": {
    fields: [
      { key: "hospital_name", label: "Hospital / Clinic Name", placeholder: "Full name of hospital", required: true },
      { key: "hospital_contact", label: "Hospital Contact Number", placeholder: "Reception/office — Givethra WILL verify", required: true },
      { key: "patient_name", label: "Patient's Name (ONE patient)", placeholder: "Full name of the patient", required: true },
      { key: "illness", label: "Illness / Treatment Needed", placeholder: "e.g. surgery, dialysis, medicine", required: true },
      { key: "mr_no", label: "MR No / Bill No", placeholder: "Medical record or bill number" },
      { key: "doctor_name", label: "Doctor's Name (optional)", placeholder: "Treating doctor" },
      JOB_FIELD,
    ],
    documents: [
      { key: "report", label: "Medical Report / Doctor's Prescription", required: true, hint: "Doctor's report, prescription, or diagnosis slip" },
      { key: "bill", label: "Hospital Bill / Cost Estimate", required: true, hint: "Hospital's bill or estimate slip showing the amount" },
      { key: "patient_id", label: "Patient's CNIC / B-Form (optional)" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays the hospital directly. Givethra WILL call the hospital to confirm the patient and treatment before approving.",
    guide: [
      "Enter the hospital name and its contact number — Givethra will call to verify.",
      "Enter details of ONE patient: name, illness/treatment, and MR/bill number.",
      "Upload the medical report/prescription AND the hospital bill/estimate — these are two separate documents.",
      "Answer the job question. Bank statement is optional here since medical needs can be urgent.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE patient and ONE treatment only.",
  },

  "Medicines": {
    fields: [
      { key: "pharmacy_name", label: "Which Medical Store will you buy from?", placeholder: "Store name — Heroes will pay this store directly", required: true },
      { key: "pharmacy_contact", label: "Medical Store Contact (optional)", placeholder: "For verification" },
      { key: "patient_name", label: "Patient's Name (ONE patient)", placeholder: "Full name", required: true },
      { key: "illness", label: "Illness / Condition", placeholder: "What is being treated", required: true },
      JOB_FIELD,
    ],
    documents: [
      { key: "prescription", label: "Doctor's Prescription Slip", required: true, hint: "Clear photo of the doctor's prescription" },
      { key: "estimate", label: "Medical Store's Bill / Estimate Slip", required: true, hint: "The medical store's own estimate showing medicines & price" },
      SALARY_DOC,
      { ...STATEMENT_DOC, required: true },
    ],
    paymentNote: "The Hero pays the medical store directly for the prescribed medicines.",
    guide: [
      "Enter which medical store you'll buy from (and contact if possible).",
      "Enter ONE patient's name and condition.",
      "Upload the doctor's prescription slip AND the medical store's separate bill/estimate slip.",
      "Answer the job question, and attach proof of income if available.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE patient's medicines.",
  },

  "Food & Groceries": {
    fields: [
      { key: "provider_name", label: "Which shop/store will you get groceries from?", placeholder: "Shop name — Heroes will pay this shop directly", required: true },
      { key: "provider_contact", label: "Shop Contact Number", placeholder: "For verification — Givethra may call", required: true },
      { key: "sons", label: "How many sons?", type: "number" },
      { key: "daughters", label: "How many daughters?", type: "number" },
      { key: "wife_status", label: "Wife / spouse included in household?", placeholder: "e.g. Yes, 1 wife" },
      JOB_FIELD,
    ],
    documents: [
      { key: "list", label: "Grocery List / Estimate (optional)", hint: "Ration list from the shop if available" },
      SALARY_DOC,
      { ...STATEMENT_DOC, required: true },
    ],
    paymentNote: "The Hero pays the shopkeeper directly. Givethra may call them to confirm you are genuinely in need.",
    guide: [
      "Enter the shop name and contact number — Heroes will pay this shop directly.",
      "Tell us your family details: sons, daughters, and spouse status.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement — this is required.",
      "Givethra may call the shopkeeper to confirm you are genuinely deserving.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE household's ration need.",
  },

  // FIXED: Removed provider_name and provider_contact from Child Support
  // because it has fixed stipend and payment receiver is handled separately
  "Child Support": {
    fields: [
      { key: "sons", label: "Number of sons", type: "number" },
      { key: "daughters", label: "Number of daughters", type: "number" },
      { key: "parents_status", label: "Are the parents alive?", placeholder: "e.g. father passed away, mother alive", required: true },
      JOB_FIELD,
    ],
    documents: [
      // FIXED: Removed frc from here - it's now handled by extraConditionalDocs() based on gender
      // { key: "frc", label: "Family Registration Certificate (FRC)", required: true, hint: "NADRA FRC showing family members" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "This is a fixed monthly support. The amount is set by Givethra and paid directly to the guardian.",
    guide: [
      "Enter the family details: number of sons, daughters, and parents' status.",
      "Select gender and marital status in the form above.",
      "Required documents (FRC, death certificates etc.) will be asked based on your gender selection.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE household.",
  },

  // FIXED: Removed provider_name and provider_contact from Widow & Elderly
  // Removed death_cert, nikah_nama, frc - they are handled by extraConditionalDocs() based on gender
  "Widow & Elderly Support": {
    fields: [
      { key: "sons", label: "Number of sons", type: "number" },
      { key: "daughters", label: "Number of daughters", type: "number" },
      { key: "support_type", label: "Monthly or one-time help?", placeholder: "e.g. one-time ration, monthly support", required: true },
      JOB_FIELD,
    ],
    documents: [
      // FIXED: Removed these - they are now handled by extraConditionalDocs() based on gender/marital status
      // { key: "death_cert", label: "Husband's Death Certificate (for widow cases)", required: true, hint: "REQUIRED for widow cases — husband's (not mother's) death certificate" },
      // { key: "nikah_nama", label: "Nikah Nama (Marriage Certificate)", required: true, hint: "REQUIRED for widow cases" },
      // { key: "frc", label: "Family Registration Certificate (FRC)", required: true, hint: "NADRA FRC" },
      STATEMENT_DOC,
    ],
    paymentNote: "This is a fixed monthly support. The amount is set by Givethra and paid directly to the beneficiary.",
    guide: [
      "Enter family details and whether help is one-time or monthly.",
      "Select gender and marital status in the form above.",
      "Required documents (death certificate, nikah nama, FRC etc.) will be asked based on your gender selection.",
      "Attach a 6-month bank/Easypaisa/JazzCash statement if you have one.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE widow/elderly person's household.",
  },

  "Home Repair": {
    fields: [
      { key: "repair_type", label: "What needs repair?", placeholder: "e.g. roof, plumbing, electricity", required: true },
      { key: "property_owner_name", label: "Property Owner Name", placeholder: "Full name of owner", required: true },
      { key: "property_owner_contact", label: "Owner Contact Number", placeholder: "For verification", required: true },
      { key: "repair_cost", label: "Estimated Repair Cost", placeholder: "e.g. 25000", required: true, type: "number" },
      { key: "contractor_name", label: "Contractor / Shop Name (optional)", placeholder: "Who will do the repair" },
      { key: "contractor_contact", label: "Contractor Contact (optional)", placeholder: "For payment arrangement" },
      JOB_FIELD,
    ],
    documents: [
      { key: "repair_estimate", label: "Repair Estimate / Quotation", required: true, hint: "Photo of the contractor's estimate or quotation slip" },
      { key: "property_photo", label: "Photo of the Damage / Area", required: true, hint: "Clear photo showing what needs repair" },
      { key: "ownership_proof", label: "Proof of Ownership (or Landlord Permission)", required: true, hint: "If owned: property document. If rented: landlord's written permission letter" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays the contractor/shop directly for the repair work.",
    guide: [
      "Enter what needs repair and the estimated cost.",
      "Enter the property owner's name and contact — Givethra may verify.",
      "Upload the repair estimate/quotation, a photo of the damage, and proof of ownership/permission.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE repair job for ONE property.",
  },

  // FIXED: Removed disability_type from here - it's handled separately in SubmitRequestPage
  "Disability Support": {
    fields: [
      // { key: "disability_type", label: "Type of disability", placeholder: "e.g. physical, visual", required: true },
      JOB_FIELD,
    ],
    documents: [
      { key: "disability_cnic", label: "CNIC showing Disability (or Disability Certificate)", required: true, hint: "REQUIRED — CNIC that marks the person as disabled, or an official disability certificate" },
      { key: "disability_photo", label: "Photo of the Disability", required: true, hint: "A clear photo showing the disability, for verification" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays according to what is needed — a shop (for equipment), a hospital (for treatment), or the person directly (for a stipend).",
    guide: [
      "Choose what kind of help is needed: Equipment, Treatment, or Monthly Stipend.",
      "You MUST upload the CNIC that shows disability status AND a clear photo of the disability.",
      "Answer the job question, and attach a salary slip (if employed) or a 6-month bank/Easypaisa/JazzCash statement.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE person with disability.",
  },

  "Marriage Support": {
    fields: [
      { key: "bride_name", label: "Bride's Name", placeholder: "Full name of the bride", required: true },
      { key: "groom_name", label: "Groom's Name", placeholder: "Full name of the groom", required: true },
      { key: "marriage_date", label: "Marriage Date (expected)", placeholder: "e.g. 15 July 2026" },
      { key: "expenses_breakdown", label: "What expenses are needed?", placeholder: "e.g. food, clothes, hall", required: true },
      { key: "provider_name", label: "Who will receive payment? (name)", placeholder: "Person, shop, or organization", required: true },
      { key: "provider_contact", label: "Contact Number", placeholder: "For verification", required: true },
      JOB_FIELD,
    ],
    documents: [
      { key: "nikah_nama", label: "Nikah Nama (Marriage Certificate) or engagement proof", required: true, hint: "Proof that the marriage is genuine" },
      { key: "expense_estimate", label: "Expense Estimate / Quotation", required: true, hint: "List of estimated expenses from vendors" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays the vendor/service provider directly.",
    guide: [
      "Enter bride and groom names, marriage date, and a breakdown of expenses.",
      "Upload the Nikah Nama or engagement proof and expense estimates.",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE marriage event.",
  },

  "Business / Work Help": {
    fields: [
      { key: "business_name", label: "Business Name", placeholder: "Name of your business", required: true },
      { key: "business_type", label: "Type of Business", placeholder: "e.g. shop, freelance, agriculture", required: true },
      { key: "help_needed", label: "What help do you need?", placeholder: "e.g. raw materials, equipment, rent", required: true },
      { key: "provider_name", label: "Who will receive payment? (name)", placeholder: "Supplier, shop, or person", required: true },
      { key: "provider_contact", label: "Contact Number", placeholder: "For verification", required: true },
      { key: "amount_needed", label: "Estimated Amount Needed", placeholder: "e.g. 50000", required: true, type: "number" },
      JOB_FIELD,
    ],
    documents: [
      { key: "business_proof", label: "Business Proof (e.g. shop photo, registration, invoice)", required: true, hint: "Show that you have a business" },
      { key: "estimate", label: "Estimate / Quotation for the help needed", required: true, hint: "From supplier or service provider" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays the supplier/provider directly.",
    guide: [
      "Enter your business name, type, and what help you need.",
      "Upload proof of your business and the estimate for the required help.",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE business or work-related help.",
  },

  "Funeral Expenses": {
    fields: [
      { key: "deceased_name", label: "Name of Deceased Person", placeholder: "Full name", required: true },
      { key: "deceased_relation", label: "Relation to you", placeholder: "e.g. My father, My mother", required: true },
      { key: "funeral_date", label: "Date of Funeral", placeholder: "e.g. 20 June 2026", required: true },
      { key: "expenses_needed", label: "What funeral expenses need coverage?", placeholder: "e.g. burial, transport, food", required: true },
      { key: "provider_name", label: "Who will receive payment? (name)", placeholder: "Funeral service provider or person", required: true },
      { key: "provider_contact", label: "Contact Number", placeholder: "For verification", required: true },
      JOB_FIELD,
    ],
    documents: [
      { key: "death_cert", label: "Death Certificate (or hospital report)", required: true, hint: "Proof of death" },
      { key: "funeral_bill", label: "Funeral Service Bill / Estimate", required: true, hint: "Bill or quotation from funeral service" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays the funeral service provider directly.",
    guide: [
      "Enter the deceased's name, your relation, and funeral date.",
      "Upload death certificate and funeral service bill.",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE funeral.",
  },

  "Livestock / Farming": {
    fields: [
      { key: "livestock_type", label: "Type of Livestock / Animals", placeholder: "e.g. cows, goats, poultry", required: true },
      { key: "number_of_animals", label: "Number of Animals", placeholder: "e.g. 5 cows", required: true },
      { key: "help_needed", label: "What help do you need?", placeholder: "e.g. feed, medicine, shelter", required: true },
      { key: "provider_name", label: "Who will receive payment? (name)", placeholder: "Feed shop, vet, or person", required: true },
      { key: "provider_contact", label: "Contact Number", placeholder: "For verification", required: true },
      JOB_FIELD,
    ],
    documents: [
      { key: "livestock_photo", label: "Photo of Livestock / Farm", required: true, hint: "Show your animals and condition" },
      { key: "estimate", label: "Estimate / Bill for needed supplies", required: true, hint: "From feed shop or vet" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays the supplier/vet directly.",
    guide: [
      "Enter the type and number of animals, and what help is needed.",
      "Upload a photo of the livestock and the estimate for supplies.",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE livestock/farming need.",
  },

  "Debt Relief": {
    fields: [
      { key: "creditor_name", label: "Creditor / Lender Name", placeholder: "Who do you owe money to?", required: true },
      { key: "creditor_contact", label: "Creditor Contact Number", placeholder: "For verification", required: true },
      { key: "debt_amount", label: "Total Debt Amount", placeholder: "e.g. 100000", required: true, type: "number" },
      { key: "debt_reason", label: "How did this debt occur?", placeholder: "e.g. medical emergency, business loss", required: true },
      JOB_FIELD,
    ],
    documents: [
      { key: "debt_proof", label: "Debt Proof (loan agreement, receipts)", required: true, hint: "Proof that you owe the money" },
      { key: "income_proof", label: "Income Proof (optional but helpful)", hint: "Payslip or bank statement" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays the creditor directly after verification.",
    guide: [
      "Enter creditor details, total debt, and the reason for debt.",
      "Upload proof of debt (loan agreement, receipts).",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE debt obligation.",
  },

  "Emergency Help": {
    fields: [
      { key: "emergency_type", label: "Type of Emergency", placeholder: "e.g. accident, fire, flood", required: true },
      { key: "help_needed", label: "What immediate help do you need?", placeholder: "e.g. medical, shelter, food", required: true },
      { key: "provider_name", label: "Who will receive payment? (name)", placeholder: "Hospital, shop, or person", required: true },
      { key: "provider_contact", label: "Contact Number", placeholder: "For verification", required: true },
      JOB_FIELD,
    ],
    documents: [
      { key: "emergency_photo", label: "Photo / Evidence of Emergency", required: true, hint: "Clear photo showing the situation" },
      { key: "estimate", label: "Estimate / Bill for needed help", required: true, hint: "From service provider" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays the provider directly for emergency relief.",
    guide: [
      "Enter the type of emergency and what help is needed immediately.",
      "Upload photo evidence and an estimate/bill.",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE emergency situation.",
  },

  "Other": {
    fields: [
      { key: "help_needed", label: "What help do you need?", placeholder: "Describe in detail", required: true },
      { key: "provider_name", label: "Who will receive payment? (name)", placeholder: "Person, shop, or organization", required: true },
      { key: "provider_contact", label: "Contact Number", placeholder: "For verification", required: true },
      JOB_FIELD,
    ],
    documents: [
      { key: "supporting_doc", label: "Supporting Document / Evidence", required: true, hint: "Any document that supports your request" },
      SALARY_DOC,
      STATEMENT_DOC,
    ],
    paymentNote: "The Hero pays the recipient directly after review.",
    guide: [
      "Clearly describe what help you need and why.",
      "Upload any supporting document that explains your situation.",
      "Answer the job question and attach income proof.",
      ...COMMON_GUIDE_TAIL,
    ],
    oneCaseNote: "One case = ONE request.",
  },
};

// ====== SINGLE EXPORT ======
export function getCategoryConfig(category: string): CategoryConfig | null {
  return CATEGORY_CONFIG[category] || null;
}
