// src/frontend/src/pages/submit-request/utils/validation.ts
import {
  PROPERTY_RELEVANT_CATS,
  isDebtCategory,
  getMaxLimit,
  PAYMENT_RECEIVER_CATS,
  EDUCATION_ADMISSION_FIELDS,
  EDUCATION_FEE_FIELDS,
  getEducationDocs,
} from "../constants";

const MIN_WHY_HELP_WORDS = 200;

const hasValue = (value: unknown): boolean => {
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
};

const hasDoc = (docs: Record<string, unknown>, key: string): boolean =>
  typeof docs?.[key] === "string" && String(docs[key]).trim().length > 0;

function countWords(text: string): number {
  const trimmed = String(text || "").trim();
  return trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
}

export function getRequiredGenderDocKeys(
  gender: string,
  maritalStatus: string,
  isOrphan: string,
): string[] {
  const keys: string[] = [];
  if (gender === "Male") {
    if (maritalStatus === "Single") keys.push("frc");
    if (maritalStatus === "Married") keys.push("nikah_nama", "frc");
    if (maritalStatus === "Widow") keys.push("wife_death_cert", "nikah_nama", "frc");
    if (maritalStatus === "Divorced") keys.push("divorce_cert", "nikah_nama", "frc");
  }
  if (gender === "Female") {
    if (maritalStatus === "Single") keys.push("frc");
    if (maritalStatus === "Married") keys.push("nikah_nama", "frc");
    if (maritalStatus === "Widow") keys.push("husband_death_cert", "nikah_nama", "frc");
    if (maritalStatus === "Divorced") keys.push("divorce_cert", "nikah_nama", "frc");
    if (isOrphan === "Yes") keys.push("orphan_proof");
  }
  if (gender === "Child") {
    keys.push("b_form", "frc");
    if (isOrphan === "Yes") keys.push("orphan_proof");
  }
  return keys;
}

function validateCategoryDetails(formData: any): string | null {
  const fields = formData.catFields || {};
  const docs = formData.catDocUrls || {};
  const category = formData.category;
  const requireFields = (keys: string[], message: string) =>
    keys.some((key) => !hasValue(fields[key])) ? message : null;
  const requireDocs = (keys: string[], message: string) =>
    keys.some((key) => !hasDoc(docs, key)) ? message : null;

  if (["Electricity Bill", "Gas Bill", "Water Bill"].includes(category)) {
    if (!hasValue(formData.instituteName || fields.company)) return "Please select the service provider";
    if (!hasValue(formData.refNumber)) return "Please enter the consumer reference number";
    if (!hasValue(fields.bill_owner_name)) return "Please enter the bill owner's name";
    return requireDocs(["bill"], "Please upload the bill photo");
  }

  if (category === "School, College & University Fees") {
    if (!hasValue(fields.edu_sub_type || formData.eduSubType)) return "Please select the fee type";
    if (requireFields(["student_name", "father_name", "roll_no"], "Please complete the student details")) {
      return "Please complete the student details";
    }
    const subtype = fields.edu_sub_type || formData.eduSubType;
    const subFields = subtype === "school"
      ? EDUCATION_FEE_FIELDS.School
      : subtype === "college"
        ? EDUCATION_FEE_FIELDS.College
        : subtype === "university"
          ? EDUCATION_FEE_FIELDS.University
          : [];
    if (subFields.some((field: any) => field.required && !hasValue(fields[field.key]))) {
      return "Please complete all required education details";
    }
    return requireDocs(["fee_challan", "student_id_proof"], "Please upload the fee challan and student ID proof");
  }

  if (category === "Education, Books & Admission") {
    const subtype = fields.edu_sub_type || formData.eduSubType;
    if (!hasValue(subtype)) return "Please select the education help type";
    if (!hasValue(fields.student_name) || !hasValue(fields.student_class)) return "Please complete the student details";
    const level = fields.admission_level || formData.eduAdmissionLevel || "";
    if (subtype === "admission" && !hasValue(level)) return "Please select the admission level";
    const admissionFields = subtype === "admission"
      ? (EDUCATION_ADMISSION_FIELDS as any)[level] || []
      : [];
    if (admissionFields.some((field: any) => field.required && !hasValue(fields[field.key]))) {
      return "Please complete all required admission details";
    }
    const requiredDocs = getEducationDocs(subtype, level || subtype);
    return requireDocs(requiredDocs.filter((doc) => doc.required).map((doc) => doc.key), "Please upload all required education documents");
  }

  const rules: Record<string, { fields: string[]; docs: string[]; message: string }> = {
    "Medical & Treatment": { fields: ["patient_name", "illness", "hospital_name"], docs: ["medical_bill"], message: "Please complete the medical details and upload the medical bill" },
    Medicines: { fields: ["patient_name", "illness"], docs: ["medicine_estimate", "doctor_report"], message: "Please complete the medicine details and upload the required documents" },
    "Child Support": { fields: ["child_name", "child_age", "parents_status"], docs: ["child_b_form", "parents_proof"], message: "Please complete the child details and upload the required documents" },
    "Widow & Elderly Support": { fields: ["status", "full_name", "age"], docs: ["cnic"], message: "Please complete the support details and upload the CNIC" },
    "Disability Support": { fields: [], docs: ["disability_cnic", "disability_photo"], message: "Please select the disability details and upload the required documents" },
    "House Rent": { fields: ["landlord_name", "landlord_contact", "rent_amount"], docs: ["rental_agreement", "landlord_cnic"], message: "Please complete the rent details and upload the required documents" },
    "Food & Groceries": { fields: ["family_members", "shop_name", "groceries_amount"], docs: ["groceries_estimate"], message: "Please complete the grocery details and upload the estimate" },
    "Debt Relief": { fields: ["creditor_name", "total_debt"], docs: ["debt_proof"], message: "Please complete the debt details and upload proof" },
    "Emergency Help": { fields: ["emergency_type", "emergency_description"], docs: ["emergency_proof"], message: "Please complete the emergency details and upload proof" },
    "Marriage Support": { fields: ["relation", "person_name"], docs: ["relation_proof", "marriage_quotation"], message: "Please complete the marriage support details and upload proof" },
    "Funeral Expenses": { fields: ["deceased_relation", "deceased_name"], docs: ["death_certificate", "relation_proof"], message: "Please complete the funeral details and upload proof" },
    "Home Repair": { fields: ["property_type", "repair_type", "repair_amount"], docs: ["repair_estimate"], message: "Please complete the repair details and upload the estimate" },
    "Business / Work Help": { fields: ["business_name", "business_amount"], docs: ["business_quotation", "business_proof"], message: "Please complete the business details and upload proof" },
    "Livestock / Farming": { fields: ["farm_type", "farm_amount"], docs: ["livestock_quotation", "livestock_proof"], message: "Please complete the farming details and upload proof" },
  };
  const rule = rules[category];
  if (rule) {
    if (category === "Disability Support" && (!hasValue(formData.disabilityType) || !hasValue(formData.disabilityMode))) return rule.message;
    if (rule.fields.some((key) => !hasValue(fields[key])) || rule.docs.some((key) => !hasDoc(docs, key))) return rule.message;
    if (category === "Widow & Elderly Support" && fields.status === "Widow" && !hasDoc(docs, "death_cert")) return "Please upload the death certificate";
  }
  return null;
}

export function validateStep(stepId: string, formData: any): string | null {
  const fields = formData.catFields || {};
  const docs = formData.catDocUrls || {};
  switch (stepId) {
    case "category": return !hasValue(formData.category) ? "Please select a category" : null;
    case "title": return !hasValue(formData.title) ? "Please enter a title" : null;
    case "shortDesc": return !hasValue(formData.shortDesc) ? "Please enter a short description" : null;
    case "country": return !hasValue(formData.country) ? "Please select your country" : null;
    case "city": return !hasValue(formData.city) ? "Please enter your city" : null;
    case "urgency": return !hasValue(formData.urgency) ? "Please select an urgency level" : null;
    case "gender": return !hasValue(formData.gender) ? "Please select your gender" : null;
    case "maritalStatus": return ["Male", "Female"].includes(formData.gender) && !hasValue(formData.maritalStatus) ? "Please select your marital status" : null;
    case "orphan": return ["Female", "Child"].includes(formData.gender) && !hasValue(formData.isOrphan) ? "Please select your orphan status" : null;
    case "orphanParent": return formData.isOrphan === "Yes" && !hasValue(formData.orphanParent) ? "Please select which parent passed away" : null;
    case "genderDocuments": return getRequiredGenderDocKeys(formData.gender, formData.maritalStatus, formData.isOrphan).some((key) => !hasDoc(formData.genderDocUrls || {}, key)) ? "Please upload all required identity documents" : null;
    case "seekerName": return !hasValue(formData.seekerName) ? "Please enter your full name" : null;
    case "seekerContact": return !hasValue(formData.seekerContact) ? "Please enter your contact number" : null;
    case "jobStatus": return !hasValue(formData.jobStatus) ? "Please select your employment status" : null;
    case "jobDocuments": return formData.jobStatus === "Yes" && (!hasValue(formData.salarySlipUrl) || !hasValue(formData.statementUrl)) ? "Please upload your salary slip and bank statement" : null;
    case "noJobDocument": return formData.jobStatus === "No" && !hasValue(formData.statementUrl) ? "Please upload your bank statement" : null;
    case "categoryDetails": return validateCategoryDetails(formData);
    case "propertyOwnership": return PROPERTY_RELEVANT_CATS.has(formData.category) && !hasValue(formData.propertyOwnership) ? "Please select property ownership" : null;
    case "rentedDocuments": return formData.propertyOwnership === "rented" && (!hasValue(formData.rentalAgreementUrl) || !hasValue(formData.landlordCnicUrl)) ? "Please upload both rented property documents" : null;
    case "ownedDocuments": return formData.propertyOwnership === "owned" && (!hasValue(formData.ownerCnicUrl) || !hasValue(formData.ownerRelation)) ? "Please upload the owner's CNIC and select the relation" : null;
    case "paymentReceiver": {
      if (!PAYMENT_RECEIVER_CATS.has(formData.category)) return null;
      const required = ["receiverName", "receiverContact", "receiverBank", "receiverAccount", "receiverAddress"];
      if (required.some((key) => !hasValue(formData[key]))) return "Please complete the payment receiver details";
      if (["Food & Groceries", "Medicines", "Home Repair"].includes(formData.category) && !hasValue(formData.receiverShopName)) return "Please enter the shop name";
      return null;
    }
    case "whyHelp": {
      const text = String(formData.description || formData.whyHelp || "").trim();
      const words = countWords(text);
      return !text ? "Please explain your situation in detail" : words < MIN_WHY_HELP_WORDS ? `Please write at least ${MIN_WHY_HELP_WORDS} words (currently ${words}).` : null;
    }
    case "debtTotal": {
      const value = Number(formData.debtTotalAmount);
      return isDebtCategory(formData.category) && (!Number.isFinite(value) || value <= 0) ? "Please enter your total debt amount" : null;
    }
    case "amount": {
      if (isDebtCategory(formData.category)) return null;
      const value = Number(formData.amount);
      if (!Number.isFinite(value) || value <= 0) return "Please enter the amount needed";
      const max = getMaxLimit(formData.category);
      return max && value > max ? `Amount cannot exceed Rs ${max.toLocaleString()}` : null;
    }
    case "currency": return !hasValue(formData.currency) ? "Please select a currency" : null;
    case "deadline": return !hasValue(formData.deadline) ? "Please select a deadline" : new Date(formData.deadline) < new Date() ? "Deadline must be in the future" : null;
    case "selfie": return !hasValue(formData.selfieUrl) ? "Please take a live selfie" : null;
    case "video": return !hasValue(formData.videoUrl) ? "Please record a video appeal" : null;
    case "terms": return formData.confirmed === true || formData.confirmed === "true" ? null : "You must agree to the Terms & Conditions";
    default: return null;
  }
}
