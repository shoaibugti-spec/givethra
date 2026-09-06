// src/frontend/src/pages/submit-request/utils/validation.ts
export function validateStep(stepId: string, formData: any): string | null {
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
      if (!formData.maritalStatus) return "Please select marital status";
      return null;
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
    case "categoryDetails":
      // Category-specific validation handled in StepCategoryDetails
      return null;
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
