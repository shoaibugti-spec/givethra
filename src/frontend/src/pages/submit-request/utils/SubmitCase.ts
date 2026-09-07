// src/frontend/src/pages/submit-request/utils/SubmitCase.ts
import { insertCaseSubmission } from "@/lib/api";
import { sendNotification } from "@/lib/notify";
import { calculateDebtAmount } from "../constants";

export async function submitCase(formData: any, userId: string, isFree: boolean) {
  let finalAmount = 0;
  const category = formData.category;

  const fixedCats = ["Child Support", "Widow & Elderly Support", "Disability Support"];
  if (fixedCats.includes(category)) {
    finalAmount = 6000;
  } else if (category === "Debt Relief") {
    const debt = parseFloat(formData.debtTotalAmount) || 0;
    finalAmount = calculateDebtAmount(debt);
  } else {
    finalAmount = parseFloat(formData.amount) || 0;
  }

  const catDocUrls = formData.catDocUrls || {};
  const genderDocUrls = formData.genderDocUrls || {};

  // Merge all uploaded document URLs for photo_urls
  const photoUrls = [
    ...Object.values(catDocUrls),
    ...Object.values(genderDocUrls),
  ].filter(Boolean) as string[];

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
    institute_name: formData.catFields?.institute_name || formData.instituteName || "",
    institute_contact: formData.catFields?.institute_contact || "",
    institute_address: formData.catFields?.institute_address || "",
    payment_method: "Direct",
    account_title: formData.receiverName || "",
    account_number: formData.receiverAccount || formData.refNumber || "",
    account_iban: "",
    category_details: {
      ...formData.catFields,
      ...(formData.eduSubFields || {}),
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
      // Payment receiver (parity with SubmitRequestPage)
      receiver_name: formData.receiverName || "",
      receiver_contact: formData.receiverContact || "",
      receiver_bank: formData.receiverBank || "",
      receiver_account: formData.receiverAccount || "",
      receiver_address: formData.receiverAddress || "",
      receiver_shop_name: formData.receiverShopName || "",
      // Gender / identity documents
      gender_doc_urls: genderDocUrls,
      cat_doc_urls: catDocUrls,
      ref_number: formData.refNumber || "",
    },
    photo_urls: photoUrls,
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
      "Case Submitted FREE",
      `Your case "${formData.title}" was submitted FREE and is under review.`,
      "/my-cases"
    );
    return { success: true, message: "Your case is FREE! Submitted for review." };
  }

  await sendNotification(
    userId,
    "system",
    "Case Submitted",
    `Your case "${formData.title}" was submitted and is under review.`,
    "/my-cases"
  );
  return { success: true, message: "Case submitted! Under review." };
}
