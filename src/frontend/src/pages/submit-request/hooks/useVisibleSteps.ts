// src/frontend/src/pages/submit-request/hooks/useVisibleSteps.ts
import { useMemo } from "react";
import { isEasyCat, PROPERTY_RELEVANT_CATS, isDebtCategory } from "../constants";

export function useVisibleSteps(formData: any): string[] {
  // ✅ صرف وہ فیلڈز جو واقعی steps کی فہرست بدلتی ہیں
  // اس سے ہر keystroke / category update پر نیا array نہیں بنتا
  const category = formData?.category ?? "";
  const gender = formData?.gender ?? "";
  const isOrphan = formData?.isOrphan ?? "";
  const jobStatus = formData?.jobStatus ?? "";
  const propertyOwnership = formData?.propertyOwnership ?? "";

  return useMemo(() => {
    const steps: string[] = [];

    // 1. Category (always)
    steps.push("category");

    // 2-5. Basic info (always)
    steps.push("title", "shortDesc", "country", "city");

    // 6. Urgency (only if not easy)
    if (!isEasyCat(category)) {
      steps.push("urgency");
    }

    // 7. Gender (always)
    steps.push("gender");

    // 8. Marital Status (only if Male or Female)
    if (gender === "Male" || gender === "Female") {
      steps.push("maritalStatus");
    }

    // 9-10. Orphan (only if Female)
    if (gender === "Female") {
      steps.push("orphan");
      if (isOrphan === "Yes") {
        steps.push("orphanParent");
      }
    }

    // 11-12. Seeker details (always)
    steps.push("seekerName", "seekerContact");

    // 13. Job Status (always)
    steps.push("jobStatus");

    // 14-15. Job documents
    if (jobStatus === "Yes") {
      steps.push("jobDocuments");
    } else if (jobStatus === "No") {
      steps.push("noJobDocument");
    }

    // 16. Category Details (always)
    steps.push("categoryDetails");

    // 17-19. Property (only for relevant categories)
    if (PROPERTY_RELEVANT_CATS.has(category)) {
      steps.push("propertyOwnership");
      if (propertyOwnership === "rented") {
        steps.push("rentedDocuments");
      } else if (propertyOwnership === "owned") {
        steps.push("ownedDocuments");
      }
    }

    // 20. Why Help (always)
    steps.push("whyHelp");

    // 21-22. Amount
    if (isDebtCategory(category)) {
      steps.push("debtTotal");
    } else {
      steps.push("amount");
    }

    // 23-27. Currency, Deadline, Selfie, Video, Terms
    steps.push("currency", "deadline", "selfie", "video", "terms");

    return steps;
  }, [category, gender, isOrphan, jobStatus, propertyOwnership]);
}
