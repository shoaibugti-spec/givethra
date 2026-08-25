export type ApprovedCaseItem = {
  label: string;
  source: "document" | "media";
};

function humanizeKey(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function addUnique(items: ApprovedCaseItem[], seen: Set<string>, label: unknown, source: ApprovedCaseItem["source"]): void {
  if (typeof label !== "string" || !label.trim()) return;
  const cleanLabel = label.trim();
  const key = cleanLabel.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (!key || seen.has(key)) return;
  seen.add(key);
  items.push({ label: cleanLabel, source });
}

export function getApprovedCaseItems(caseData: Record<string, any>): ApprovedCaseItem[] {
  const items: ApprovedCaseItem[] = [];
  const seen = new Set<string>();

  if (Array.isArray(caseData.photo_urls) && caseData.photo_urls.some(Boolean)) {
    addUnique(items, seen, "Case Photos", "media");
  }
  if (caseData.selfie_url) addUnique(items, seen, "Live Selfie", "media");
  if (caseData.video_url) addUnique(items, seen, "Video Statement", "media");

  const documents = caseData.category_details?._documents;
  if (documents && typeof documents === "object" && !Array.isArray(documents)) {
    for (const [key, value] of Object.entries(documents)) {
      if (!value) continue;
      const metadata = value && typeof value === "object" ? value as Record<string, any> : {};
      addUnique(items, seen, metadata.original_name || metadata.filename || metadata.name || humanizeKey(key), "document");
    }
  }

  return items;
}
