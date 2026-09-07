// src/frontend/src/pages/submit-request/utils/validation.ts
import { isEasyCat, PROPERTY_RELEVANT_CATS, isDebtCategory, getMaxLimit } from "../constants";

export function validateStep(stepId: string, formData: any): string | null {
  const f = formData.catFields || {};
  const d = formData.catDocUrls || {};
  const cat = formData.category;

  switch (stepId) {
    case "category":
      return !formData.category ? "Please select a category" : null;
    case "title":
      return !formData.title?.trim() ? "Please enter a title" : null;
    case "shortDesc":
      return !formData.shortDesc?.trim() ? "Please enter a short description" : null;
    case "country":
      return !formData.country ? "Please select your country" : null;
    case "city":
      return !formData.city?.trim() ? "Please enter your city" : null;
    case "urgency":
      return !formData.urgency ? "Please select urgency level" : null;
    case "gender":
      return !formData.gender ? "Please select gender" : null;
    case "maritalStatus":
      return !formData.maritalStatus ? "Please select marital status" : null;
    case "orphan":
      if (formData.gender === "Female" && !formData.isOrphan) {
        return "Please select if you are an orphan";
      }
      return null;
    case "orphanParent":
      if (formData.gender === "Female" && formData.isOrphan === "Yes" && !formData.orphanParent) {
        return "Please select which parent passed away";
      }
      return null;
    case "seekerName":
      return !formData.seekerName?.trim() ? "Please enter your full name" : null;
    case "seekerContact":
      return !formData.seekerContact?.trim() ? "Please enter your contact number" : null;
    case "jobStatus":
      return !formData.jobStatus ? "Please select if you have a job" : null;
    case "jobDocuments":
      if (formData.jobStatus === "Yes") {
        if (!formData.salarySlipUrl) return "Please upload your salary slip";
        if (!formData.statementUrl) return "Please upload your bank statement";
      }
      return null;
    case "noJobDocument":
      if (formData.jobStatus === "No" && !formData.statementUrl) {
        return "Please upload your bank statement";
      }
      return null;

    case "categoryDetails": {
      if (["Electricity Bill", "Gas Bill", "Water Bill"].includes(cat)) {
        if (!formData.refNumber?.trim()) return "Please enter consumer reference number";
        if (!f.bill_owner_name?.trim()) return "Please enter bill owner name";
        if (!d.bill) return "Please upload bill photo";
      }
      if (cat === "House Rent") {
        if (!f.landlord_name?.trim()) return "Please enter landlord name";
        if (!f.landlord_contact?.trim()) return "Please enter landlord contact";
        if (!f.rent_amount) return "Please enter rent amount";
        if (!d.rental_agreement) return "Please upload rental agreement";
        if (!d.landlord_cnic) return "Please upload landlord CNIC";
      }
      if (cat === "Child Support") {
        if (!f.child_name?.trim()) return "Please enter child's name";
        if (!f.child_age) return "Please enter child's age";
        if (!f.parents_status) return "Please select parents status";
        if (!d.child_b_form) return "Please upload B-Form / birth certificate";
        if (!d.parents_proof) return "Please upload proof of parents' status";
      }
      if (cat === "Widow & Elderly Support") {
        if (!f.status) return "Please select status";
        if (!f.full_name?.trim()) return "Please enter full name";
        if (!f.age) return "Please enter age";
        if (!d.cnic) return "Please upload CNIC photo";
        if (f.status === "Widow" && !d.death_cert) return "Please upload death certificate";
      }
      if (cat === "Disability Support") {
        if (!d.disability_cnic) return "Please upload disability CNIC/certificate";
        if (!d.disability_photo) return "Please upload disability photo";
        if (!formData.disabilityType) return "Please select disability type";
        if (!formData.disabilityMode) return "Please select type of help needed";
      }
      if (cat === "Food & Groceries") {
        if (!f.family_members) return "Please enter number of family members";
        if (!f.shop_name?.trim()) return "Please enter shop name";
        if (!f.groceries_amount) return "Please enter groceries amount";
        if (!d.groceries_estimate) return "Please upload groceries estimate";
      }
      if (cat === "Debt Relief") {
        if (!f.creditor_name?.trim()) return "Please enter creditor name";
        if (!f.total_debt) return "Please enter total debt";
        if (!d.debt_proof) return "Please upload debt proof";
      }
      if (cat === "Emergency Help") {
        if (!f.emergency_type) return "Please select emergency type";
        if (!f.emergency_description?.trim()) return "Please describe the emergency";
        if (!d.emergency_proof) return "Please upload emergency proof";
      }
      if (cat === "Marriage Support") {
        if (!f.relation) return "Please select relation";
        if (!f.person_name?.trim()) return "Please enter person's name";
        if (!d.relation_proof) return "Please upload relation proof";
        if (!d.marriage_quotation) return "Please upload marriage quotation";
      }
      if (cat === "Funeral Expenses") {
        if (!f.deceased_relation) return "Please select relation";
        if (!f.deceased_name?.trim()) return "Please enter deceased name";
        if (!d.death_certificate) return "Please upload death certificate";
        if (!d.relation_proof) return "Please upload relation proof";
      }
      if (cat === "Home Repair") {
        if (!f.property_type) return "Please select property type";
        if (!f.repair_type) return "Please select repair type";
        if (!f.repair_amount) return "Please enter repair amount";
        if (!d.repair_estimate) return "Please upload repair estimate";
      }
      if (cat === "Business / Work Help") {
        if (!f.business_name?.trim()) return "Please enter business name";
        if (!f.business_amount) return "Please enter amount needed";
        if (!d.business_quotation) return "Please upload business quotation";
        if (!d.business_proof) return "Please upload business proof";
      }
      if (cat === "Livestock / Farming") {
        if (!f.farm_type) return "Please select farm type";
        if (!f.farm_amount) return "Please enter amount needed";
        if (!d.livestock_quotation) return "Please upload quotation";
        if (!d.livestock_proof) return "Please upload proof";
      }
      return null;
    }

    case "propertyOwnership":
      if (PROPERTY_RELEVANT_CATS.has(formData.category) && !formData.propertyOwnership) {
        return "Please select property ownership";
      }
      return null;
    case "rentedDocuments":
      if (formData.propertyOwnership === "rented") {
        if (!formData.rentalAgreementUrl) return "Please upload rental agreement";
        if (!formData.landlordCnicUrl) return "Please upload landlord's CNIC";
      }
      return null;
    case "ownedDocuments":
      if (formData.propertyOwnership === "owned") {
        if (!formData.ownerCnicUrl) return "Please upload owner's CNIC";
        if (!formData.ownerRelation) return "Please select owner relation";
      }
      return null;
    case "whyHelp":
      return !formData.description?.trim() ? "Please explain your situation" : null;
    case "debtTotal":
      if (isDebtCategory(formData.category)) {
        const val = parseFloat(formData.debtTotalAmount);
        if (!val || val <= 0) return "Please enter your total debt amount";
      }
      return null;
    case "amount":
      if (!isDebtCategory(formData.category)) {
        const val = parseFloat(formData.amount);
        if (!val || val <= 0) return "Please enter the amount needed";
        const maxLimit = getMaxLimit(formData.category);
        if (maxLimit && val > maxLimit) {
          return `Amount cannot exceed Rs ${maxLimit.toLocaleString()}`;
        }
      }
      return null;
    case "currency":
      return !formData.currency ? "Please select currency" : null;
    case "deadline":
      if (!formData.deadline) return "Please select a deadline";
      if (new Date(formData.deadline) < new Date()) {
        return "Deadline must be in the future";
      }
      return null;
    case "selfie":
      return !formData.selfieUrl ? "Please take a live selfie" : null;
    case "video":
      return !formData.videoUrl ? "Please record a video appeal" : null;
    case "terms":
      return !formData.confirmed ? "You must agree to the Terms & Conditions" : null;
    default:
      return null;
  }
}
