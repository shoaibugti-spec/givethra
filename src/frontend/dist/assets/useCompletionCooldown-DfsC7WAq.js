import { r as reactExports, S as getCasesByUser } from "./main-g9K_ERoM.js";
const COOLDOWN_DAYS = 30;
const EARLY_REQUEST_AFTER_DAYS = 15;
const MS_DAY = 24 * 60 * 60 * 1e3;
function parseDate(value) {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}
function formatRemaining(ms) {
  if (ms <= 0) return "0 Days 0 Hours";
  const totalMinutes = Math.floor(ms / 6e4);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor(totalMinutes % (60 * 24) / 60);
  return `${days} Days ${hours} Hours Remaining`;
}
function buildCooldownState(cases, options) {
  const empty = {
    phase: "none",
    lastCompletedCaseId: null,
    lastCompletedTitle: null,
    lastCompletedAt: null,
    remainingMs: 0,
    remainingDays: 0,
    remainingHours: 0,
    remainingMinutes: 0,
    elapsedDays: 0,
    canSubmitNormal: true,
    canRequestEarly: false,
    messageTitle: "",
    messageBody: ""
  };
  const list = Array.isArray(cases) ? cases : [];
  const completed = list.filter((c) => String(c.status || "").toLowerCase() === "completed").map((c) => ({
    id: String(c.id),
    title: String(c.title || "Your case"),
    at: parseDate(c.completed_at) || parseDate(c.updated_at) || parseDate(c.created_at) || 0,
    raw: c.completed_at || c.updated_at || c.created_at || null
  })).filter((c) => c.at > 0).sort((a, b) => b.at - a.at);
  if (completed.length === 0) return empty;
  const latest = completed[0];
  const now = Date.now();
  const elapsedMs = Math.max(0, now - latest.at);
  const elapsedDays = elapsedMs / MS_DAY;
  const remainingMs = Math.max(0, COOLDOWN_DAYS * MS_DAY - elapsedMs);
  const remainingDays = Math.floor(remainingMs / MS_DAY);
  const remainingHours = Math.floor(remainingMs % MS_DAY / (60 * 60 * 1e3));
  const remainingMinutes = Math.floor(remainingMs % (60 * 60 * 1e3) / 6e4);
  const earlyRejected = !!(options == null ? void 0 : options.earlyRequestRejected);
  if (remainingMs <= 0) {
    return {
      phase: "ready",
      lastCompletedCaseId: latest.id,
      lastCompletedTitle: latest.title,
      lastCompletedAt: latest.raw ? String(latest.raw) : null,
      remainingMs: 0,
      remainingDays: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      elapsedDays: Math.floor(elapsedDays),
      canSubmitNormal: true,
      canRequestEarly: false,
      messageTitle: "You can now submit a new Help Request",
      messageBody: "Your previous waiting period is over. You may submit a new case if you still need help."
    };
  }
  const base = {
    lastCompletedCaseId: latest.id,
    lastCompletedTitle: latest.title,
    lastCompletedAt: latest.raw ? String(latest.raw) : null,
    remainingMs,
    remainingDays,
    remainingHours,
    remainingMinutes,
    elapsedDays: Math.floor(elapsedDays),
    canSubmitNormal: false
  };
  if (earlyRejected) {
    return {
      ...base,
      phase: "early_locked",
      canRequestEarly: false,
      messageTitle: "Early request was not approved",
      messageBody: "Your early request was rejected. Please wait until the full 30-day period ends before submitting again."
    };
  }
  if (elapsedDays >= EARLY_REQUEST_AFTER_DAYS) {
    return {
      ...base,
      phase: "early_available",
      canRequestEarly: true,
      messageTitle: "Your Help Was Completed",
      messageBody: "You can submit another case after 30 days. After 15 days you may send one early request for admin review (approval is not guaranteed)."
    };
  }
  return {
    ...base,
    phase: "waiting",
    canRequestEarly: false,
    messageTitle: "Your Help Was Completed",
    messageBody: "You can submit another case after 30 days. A limited early-request option appears after 15 days."
  };
}
function detectEarlyRequestRejected(cases) {
  const list = Array.isArray(cases) ? cases : [];
  const completed = list.filter((c) => String(c.status || "").toLowerCase() === "completed").map((c) => ({
    id: String(c.id),
    at: parseDate(c.completed_at) || parseDate(c.updated_at) || parseDate(c.created_at) || 0
  })).filter((c) => c.at > 0).sort((a, b) => b.at - a.at);
  if (completed.length === 0) return false;
  const lastCompletedAt = completed[0].at;
  const earlyRejected = list.some((c) => {
    const st = String(c.status || "").toLowerCase();
    if (st !== "rejected") return false;
    const created = parseDate(c.created_at) || parseDate(c.submitted_at) || 0;
    if (created < lastCompletedAt) return false;
    const details = c.category_details || c.categoryDetails || {};
    return details.is_early_request === true || details.was_early_request === true || c.is_early_request === true || c.was_early_request === true;
  });
  return earlyRejected;
}
function useCompletionCooldown(userId) {
  const [cases, setCases] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [tick, setTick] = reactExports.useState(0);
  const load = reactExports.useCallback(async () => {
    if (!userId) {
      setCases([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getCasesByUser(userId);
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("useCompletionCooldown load error:", err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  reactExports.useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 6e4);
    return () => window.clearInterval(id);
  }, []);
  const cooldown = reactExports.useMemo(() => {
    const earlyRejected = detectEarlyRequestRejected(cases);
    return buildCooldownState(cases, { earlyRequestRejected: earlyRejected });
  }, [cases, tick]);
  const remainingLabel = formatRemaining(cooldown.remainingMs);
  return {
    loading,
    cases,
    cooldown,
    remainingLabel,
    refetch: load
  };
}
export {
  formatRemaining as f,
  useCompletionCooldown as u
};
