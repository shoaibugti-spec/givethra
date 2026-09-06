import { insertCaseSubmission } from "@/lib/api";
import { sendNotification } from "@/lib/notify";
import { calculateDebtAmount } from "../constants";

export async function submitCase(formData: any, userId: string, isFree: boolean) {
  // Compute final amount
  let finalAmount = 0;
  const category = formData.category;

  // Check if fixed amount
  const fixedCats = ["Child Support", "Widow & Elderly Support", "Disability Support"];
  if (fixedCats.includes(category)) {
    finalAmount = 6000;
  } else if (category === "Debt Relief") {
    const debt = parseFloat(formData.debtTotalAmount) || 0;
    finalAmount = calculateDebtAmount(debt);
  } else {
    finalAmount = parseFloat(formData.amount) || 0;
  }

  const caseData = {
    user_id: userId,
    category: formData.category,
    title: formData.title,
    short_description: formData.shortDesc,
    country: formData.country,
    city: formData.city,
    urgency: formData.urgency || "Medium",
    description: formData.description,
    amount_needed: finalAmount,
    currency: formData.currency || "PKR",
    why_help: formData.description,
    deadline: formData.deadline,
    institute_name: formData.catFields?.institute_name || "",
    institute_contact: formData.catFields?.institute_contact || "",
    institute_address: formData.catFields?.institute_address || "",
    payment_method: "Direct",
    account_title: "",
    account_number: formData.refNumber || "",
    account_iban: "",
    category_details: {
      ...formData.catFields,
      ...formData.eduSubFields,
      property_ownership: formData.propertyOwnership,
      job_status: formData.jobStatus,
      gender: formData.gender,
      marital_status: formData.maritalStatus,
      is_orphan: formData.isOrphan,
      orphan_parent: formData.orphanParent,
      seeker_name: formData.seekerName,
      seeker_contact: formData.seekerContact,
      disability_mode: formData.disabilityMode,
      disability_type: formData.disabilityType,
      salary_slip_url: formData.salarySlipUrl,
      statement_url: formData.statementUrl,
      rental_agreement_url: formData.rentalAgreementUrl,
      landlord_cnic_url: formData.landlordCnicUrl,
      owner_cnic_url: formData.ownerCnicUrl,
      owner_relation: formData.ownerRelation,
    },
    photo_urls: Object.values(formData.catDocUrls || {}),
    selfie_url: formData.selfieUrl,
    video_url: formData.videoUrl,
    status: "pending",
    submitted_at: new Date().toISOString(),
    was_free: isFree,
  };

  await insertCaseSubmission(caseData);

  if (isFree) {
    await sendNotification(
      userId,
      "system",
      "Case Submitted FREE 🎉",
      `Your case "${formData.title}" was submitted FREE and is under review.`,
      "/my-cases"
    );
    return { success: true, message: "🎉 Your case is FREE! Submitted for review." };
  } else {
    await sendNotification(
      userId,
      "system",
      "Case Submitted ⏳",
      `Your case "${formData.title}" was submitted and is under review.`,
      "/my-cases"
    );
    return { success: true, message: "Case submitted! 1 credit deducted. Under review." };
  }
}
