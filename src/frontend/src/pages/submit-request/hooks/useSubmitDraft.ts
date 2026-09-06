const SS_KEY = "givethra_submit_draft_v4";

export function useSubmitDraft() {
  const saveDraft = (data: any) => {
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify(data));
    } catch {}
  };

  const loadDraft = (): any => {
    try {
      const s = sessionStorage.getItem(SS_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  };

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(SS_KEY);
    } catch {}
  };

  return { saveDraft, loadDraft, clearDraft };
}
