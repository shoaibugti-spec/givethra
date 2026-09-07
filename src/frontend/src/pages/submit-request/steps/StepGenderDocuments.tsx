// src/frontend/src/pages/submit-request/steps/StepGenderDocuments.tsx
// Required identity / family documents based on gender + marital status + orphan
// Matches SubmitRequestPage rules

import { StepNavigation } from "../shared/StepNavigation";
import { DocBox } from "../shared/DocBox";
import { StepGuide } from "../shared/StepGuide";

type DocItem = {
  key: string;
  label: string;
  hint: string;
};

function getRequiredDocs(
  gender: string,
  maritalStatus: string,
  isOrphan: string
): DocItem[] {
  const list: DocItem[] = [];

  if (gender === "Male") {
    if (maritalStatus === "Single") {
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for single male",
      });
    }
    if (maritalStatus === "Married") {
      list.push({
        key: "nikah_nama",
        label: "Nikah Nama (Marriage Certificate)",
        hint: "Required for married male",
      });
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for married male",
      });
    }
    if (maritalStatus === "Widow") {
      list.push({
        key: "wife_death_cert",
        label: "Wife's Death Certificate",
        hint: "Death certificate of the deceased wife",
      });
      list.push({
        key: "nikah_nama",
        label: "Nikah Nama (Marriage Certificate)",
        hint: "Marriage certificate with the deceased wife",
      });
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for widower",
      });
    }
    if (maritalStatus === "Divorced") {
      list.push({
        key: "divorce_cert",
        label: "Divorce Certificate (Court issued)",
        hint: "Court-issued divorce certificate",
      });
      list.push({
        key: "nikah_nama",
        label: "Nikah Nama (Marriage Certificate from ex-spouse)",
        hint: "Marriage certificate from ex-spouse",
      });
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for divorced male",
      });
    }
  }

  if (gender === "Female") {
    if (maritalStatus === "Single") {
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for single female",
      });
    }
    if (maritalStatus === "Married") {
      list.push({
        key: "nikah_nama",
        label: "Nikah Nama (Marriage Certificate)",
        hint: "Required for married female",
      });
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for married female",
      });
    }
    if (maritalStatus === "Widow") {
      list.push({
        key: "husband_death_cert",
        label: "Husband's Death Certificate",
        hint: "Death certificate of the deceased husband",
      });
      list.push({
        key: "nikah_nama",
        label: "Nikah Nama (Marriage Certificate)",
        hint: "Marriage certificate with the deceased husband",
      });
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for widow",
      });
    }
    if (maritalStatus === "Divorced") {
      list.push({
        key: "divorce_cert",
        label: "Divorce Certificate (Court issued)",
        hint: "Court-issued divorce certificate",
      });
      list.push({
        key: "nikah_nama",
        label: "Nikah Nama (Marriage Certificate from ex-spouse)",
        hint: "Marriage certificate from ex-spouse",
      });
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for divorced female",
      });
    }
    if (isOrphan === "Yes") {
      list.push({
        key: "orphan_proof",
        label: "Orphan Proof (Parent's Death Certificate)",
        hint: "Required because you selected orphan",
      });
    }
  }

  if (gender === "Child") {
    list.push({
      key: "b_form",
      label: "B-Form (Child's ID)",
      hint: "Required for child cases",
    });
    list.push({
      key: "frc",
      label: "Family Registration Certificate (FRC)",
      hint: "Required for child cases",
    });
    if (isOrphan === "Yes") {
      list.push({
        key: "orphan_proof",
        label: "Orphan Proof (Parent's Death Certificate)",
        hint: "Required because the child is an orphan",
      });
    }
  }

  return list;
}

export default function StepGenderDocuments({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const gender = formData?.gender || "";
  const maritalStatus = formData?.maritalStatus || "";
  const isOrphan = formData?.isOrphan || "";
  const genderDocUrls = formData?.genderDocUrls || {};

  const requiredDocs = getRequiredDocs(gender, maritalStatus, isOrphan);

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({
      ...prev,
      genderDocUrls: { ...(prev.genderDocUrls || {}), [key]: url },
    }));
  };

  const allUploaded =
    requiredDocs.length === 0 ||
    requiredDocs.every((doc) => !!genderDocUrls[doc.key]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Upload identity documents</h2>
        <p className="text-sm text-muted-foreground">
          These documents depend on your gender, marital status, and orphan status.
          Clear photos are required for verification.
        </p>
      </div>

      {requiredDocs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No extra identity documents are required for this selection. You can continue.
        </p>
      ) : (
        <div className="space-y-4">
          {requiredDocs.map((doc) => (
            <DocBox
              key={doc.key}
              label={doc.label}
              required
              hint={doc.hint}
              onUpload={(url: string) => setDoc(doc.key, url)}
              value={genderDocUrls[doc.key]}
            />
          ))}
        </div>
      )}

      <StepGuide
        lines={[
          "Upload clear, readable photos of each required document.",
          "Documents must match the gender and marital status you selected.",
          "If you are an orphan, include the parent's death certificate.",
          "For a child case, B-Form and FRC are always required.",
        ]}
      />

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!allUploaded}
      />
    </div>
  );
}
