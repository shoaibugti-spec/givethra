// src/frontend/src/pages/submit-request/hooks/useVisibleSteps.ts
import { useMemo } from "react";
import { isEasyCat, PROPERTY_RELEVANT_CATS, isDebtCategory } from "../constants";

export function useVisibleSteps(formData: any): string[] {
  return useMemo(() => {
    const steps: string[] = [];

    // 1. Category (always)
    steps.push("category");

    // 2-5. Basic info (always)
    steps.push("title", "shortDesc", "country", "city");

    // 6. Urgency (only if not easy)
    if (!isEasyCat(formData.category)) {
      steps.push("urgency");
    }

    // 7. Gender (always)
    steps.push("gender");

    // 8. Marital Status (only if Male or Female)
    if (formData.gender === "Male" || formData.gender === "Female") {
      steps.push("maritalStatus");
    }

    // 9-10. Orphan (only if Female)
    if (formData.gender === "Female") {
      steps.push("orphan");
      if (formData.isOrphan === "Yes") {
        steps.push("orphanParent");
      }
    }

    // 11-12. Seeker details (always)
    steps.push("seekerName", "seekerContact");

    // 13. Job Status (always)
    steps.push("jobStatus");

    // 14-15. Job documents
    if (formData.jobStatus === "Yes") {
      steps.push("jobDocuments");
    } else if (formData.jobStatus === "No") {
      steps.push("noJobDocument");
    }

    // 16. Category Details (always, but content depends on category)
    steps.push("categoryDetails");

    // 17-19. Property (only for relevant categories)
    if (PROPERTY_RELEVANT_CATS.has(formData.category)) {
      steps.push("propertyOwnership");
      if (formData.propertyOwnership === "rented") {
        steps.push("rentedDocuments");
      } else if (formData.propertyOwnership === "owned") {
        steps.push("ownedDocuments");
      }
    }

    // 20. Why Help (always)
    steps.push("whyHelp");

    // 21-22. Amount
    if (isDebtCategory(formData.category)) {
      steps.push("debtTotal");
    } else {
      steps.push("amount");
    }

    // 23-25. Currency, Deadline, Selfie, Video, Terms
    steps.push("currency", "deadline", "selfie", "video", "terms");

    return steps;
  }, [formData]);
}
