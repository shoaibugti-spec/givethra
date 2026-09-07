// src/frontend/src/pages/submit-request/hooks/useVisibleSteps.ts
import { useMemo } from "react";
import { isEasyCat, PROPERTY_RELEVANT_CATS, isDebtCategory } from "../constants";

export function useVisibleSteps(formData: any): string[] {
  const category = formData?.category ?? "";
  const gender = formData?.gender ?? "";
  const isOrphan = formData?.isOrphan ?? "";
  const jobStatus = formData?.jobStatus ?? "";
  const propertyOwnership = formData?.propertyOwnership ?? "";

  return useMemo(() => {
    const steps: string[] = [];

    steps.push("category");
    steps.push("title", "shortDesc", "country", "city");

    if (!isEasyCat(category)) {
      steps.push("urgency");
    }

    steps.push("gender");

    // Marital status for adult Male / Female only
    if (gender === "Male" || gender === "Female") {
      steps.push("maritalStatus");
    }

    // Orphan for Female and Child
    if (gender === "Female" || gender === "Child") {
      steps.push("orphan");
      if (isOrphan === "Yes") {
        steps.push("orphanParent");
      }
    }

    // Identity / family documents after gender flow
    if (gender) {
      steps.push("genderDocuments");
    }

    steps.push("seekerName", "seekerContact");
    steps.push("jobStatus");

    if (jobStatus === "Yes") {
      steps.push("jobDocuments");
    } else if (jobStatus === "No") {
      steps.push("noJobDocument");
    }

    steps.push("categoryDetails");

    if (PROPERTY_RELEVANT_CATS.has(category)) {
      steps.push("propertyOwnership");
      if (propertyOwnership === "rented") {
        steps.push("rentedDocuments");
      } else if (propertyOwnership === "owned") {
        steps.push("ownedDocuments");
      }
    }

    steps.push("whyHelp");

    if (isDebtCategory(category)) {
      steps.push("debtTotal");
    } else {
      steps.push("amount");
    }

    steps.push("currency", "deadline", "selfie", "video", "terms");

    return steps;
  }, [category, gender, isOrphan, jobStatus, propertyOwnership]);
}
