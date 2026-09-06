// src/frontend/src/pages/submit-request/hooks/useSubmitDraft.ts
const SS_KEY = "givethra_submit_draft_v4";

export function saveDraft(data: any) {
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify(data));
  } catch {}
}

export function loadDraft(): any {
  try {
    const s = sessionStorage.getItem(SS_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(SS_KEY);
  } catch {}
}
