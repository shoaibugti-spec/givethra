export type ApprovedCaseItem = {
  label: string;
  source: "document" | "media";
};

const DOCUMENT_LABELS: Record<string, string> = {
  bill: "Bill Verification",
  rent_bill: "Rent Bill Verification",
  rental_agreement: "Rental Agreement Verification",
  landlord_cnic: "Landlord CNIC Verification",
  birth_certificate: "Birth Certificate Verification",
  b_form: "B-Form Verification",
  b_form_id: "B-Form / ID Verification",
  family_tree: "Family Tree Verification",
  income_proof: "Income Proof Verification",
  admission_proof: "Admission Proof Verification",
  fee_challan: "Fee Challan Verification",
  student_id: "Student ID Verification",
  student_id_proof: "Student ID Verification",
  books_quotation: "Books Quotation Verification",
  uniform_quotation: "Uniform Quotation Verification",
  uniform_items: "Uniform Items Verification",
  doctor_prescription: "Doctor Prescription Verification",
  medical_report: "Medical Report Verification",
  disability_cnic: "Disability CNIC Verification",
  disability_photo: "Disability Photo Verification",
  product_receipt: "Product Receipt Verification",
  death_certificate: "Death Certificate Verification",
  police_report: "Police Report Verification",
};

function humanizeKey(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function documentLabel(key: string): string {
  const normalized = key.toLowerCase().replace(/[-\s]+/g, "_");
  return DOCUMENT_LABELS[normalized] || `${humanizeKey(key)} Verification`;
}

function addUnique(items: ApprovedCaseItem[], seen: Set<string>, label: unknown, source: ApprovedCaseItem["source"]): void {
  if (typeof label !== "string" || !label.trim()) return;
  const cleanLabel = label.trim();
  const key = cleanLabel.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (!key || seen.has(key)) return;
  seen.add(key);
  items.push({ label: cleanLabel, source });
}

function hasFileValue(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasFileValue);
  if (!value || typeof value !== "object") return Boolean(value);
  const record = value as Record<string, unknown>;
  if (record.url || record.file_url || record.download_url || record.href || record.path || record.original_name || record.filename || record.name) return true;
  return Object.values(record).some(hasFileValue);
}

function collectDocumentContainer(value: unknown, key: string, items: ApprovedCaseItem[], seen: Set<string>): void {
  if (!hasFileValue(value)) return;
  if (Array.isArray(value)) {
    value.forEach((entry) => collectDocumentContainer(entry, key, items, seen));
    return;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const hasDirectFile = Boolean(record.url || record.file_url || record.download_url || record.href || record.path);
    if (hasDirectFile || record.original_name || record.filename || record.name) {
      const fileName = record.original_name || record.filename || record.name;
      const fileKey = typeof fileName === "string" ? fileName.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() : "";
      if (fileKey && seen.has(fileKey)) return;
      const recordKey = typeof record.key === "string" ? record.key : typeof record.field === "string" ? record.field : key;
      addUnique(items, seen, documentLabel(recordKey), "document");
      if (fileKey) seen.add(fileKey);
      return;
    }
    Object.entries(record).forEach(([childKey, childValue]) => collectDocumentContainer(childValue, childKey, items, seen));
    return;
  }
  addUnique(items, seen, documentLabel(key), "document");
}

export function getApprovedCaseItems(caseData: Record<string, any>): ApprovedCaseItem[] {
  const items: ApprovedCaseItem[] = [];
  const seen = new Set<string>();

  if (Array.isArray(caseData.photo_urls) && caseData.photo_urls.some(Boolean)) {
    addUnique(items, seen, "Case Photos", "media");
  }
  if (caseData.selfie_url) addUnique(items, seen, "Live Selfie", "media");
  if (caseData.video_url) addUnique(items, seen, "Video Statement", "media");

  const rawDetails = caseData.category_details ?? caseData.categoryDetails ?? caseData.documents ?? caseData.verification_documents;
  let details: Record<string, unknown> = {};
  let detailList: unknown[] | null = null;
  if (Array.isArray(rawDetails)) {
    detailList = rawDetails;
  } else if (rawDetails && typeof rawDetails === "object") {
    details = rawDetails as Record<string, unknown>;
  } else if (typeof rawDetails === "string") {
    try {
      const parsed = JSON.parse(rawDetails);
      if (Array.isArray(parsed)) detailList = parsed;
      else if (parsed && typeof parsed === "object") details = parsed as Record<string, unknown>;
    } catch {
      // Preserve compatibility with legacy plain-string payloads.
    }
  }

  if (detailList) collectDocumentContainer(detailList, "document", items, seen);
  const containerKeys = new Set(["_documents", "edu_documents", "documents", "uploaded_documents", "verification_documents"]);
  for (const [key, value] of Object.entries(details)) {
    if (containerKeys.has(key)) continue;
    collectDocumentContainer(value, key, items, seen);
  }

  for (const containerKey of containerKeys) {
    if (details[containerKey] != null) {
      collectDocumentContainer(details[containerKey], containerKey === "_documents" ? "document" : containerKey, items, seen);
    }
  }

  for (const key of Object.keys(DOCUMENT_LABELS)) {
    if (caseData[key] != null) collectDocumentContainer(caseData[key], key, items, seen);
  }

  return items;
}
