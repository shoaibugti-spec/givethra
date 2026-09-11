import { g as getKycStatus, a as getProfile, b as getWallet, c as getCaseCount, d as getHelpCount, u as useNavigate, e as useAuth, f as useRole, r as reactExports, h as getUnreadNotificationsCount, i as getUnlockCount, j as getApprovedCases, k as getCategoryCounts, l as jsxRuntimeExports, s as searchUsers, L as Link, m as getUserSupports, n as getCommunityPosts, o as createCommunityPost, p as ue, q as unfollowUser, t as followUser, v as supportPost } from "./main-Cdc0HMQw.js";
import { B as Button } from "./button-M4vBmj7v.js";
import { L as Layout } from "./Layout-DA0EcIPU.js";
import { s as sendGuideOnce } from "./notify-CZ5LMHYj.js";
import { G as Gift } from "./gift-laQhpJLm.js";
import { F as FileText } from "./file-text-jLG3nX9k.js";
import { S as ShieldCheck } from "./shield-check-C124rJP9.js";
import { H as Heart } from "./heart-Bgucrxac.js";
import { S as ShoppingCart, B as Battery } from "./shopping-cart-CuRYUnt-.js";
import { S as Stethoscope, G as GraduationCap, D as Droplets, F as Flame } from "./stethoscope-BRjxIsAO.js";
import { S as Search } from "./search-BiP6ro5P.js";
import { C as ChevronRight } from "./chevron-right-INWSu2u0.js";
import { S as Share2 } from "./share-2-Cvl9gZeH.js";
import "./users-DNTUunjV.js";
import "./x-DexM1Xlt.js";
import "./message-circle-_f6w5SHu.js";
async function runUserGuide(userId) {
  if (!userId) return;
  try {
    const kyc = await getKycStatus(userId);
    const kycStatus = (kyc == null ? void 0 : kyc.status) ?? "none";
    const profile = await getProfile(userId);
    const hasPhone = !!(profile == null ? void 0 : profile.phone_number);
    const wallet = await getWallet(userId);
    const balance = (wallet == null ? void 0 : wallet.balance) ?? 0;
    const caseCount = await getCaseCount(userId) ?? 0;
    const helpCount = await getHelpCount(userId) ?? 0;
    await sendGuideOnce(
      userId,
      "guide_welcome",
      "Welcome to Givethra! 🤝",
      "We're glad you're here. Let's set up your account so you can give and receive verified help.",
      "/profile/me"
    );
    if (kycStatus === "none") {
      await sendGuideOnce(
        userId,
        "guide_kyc",
        "Next step: Verify your identity 🪪",
        "Complete your KYC to unlock all features — submit cases and help others. It only takes a few minutes.",
        "/kyc"
      );
      return;
    }
    if (kycStatus === "approved" && !hasPhone) {
      await sendGuideOnce(
        userId,
        "guide_profile",
        "Complete your profile 📝",
        "Add your mobile number and details to build trust. A complete profile helps people connect with you.",
        "/edit-profile"
      );
    }
    if (kycStatus === "approved" && balance < 1) {
      await sendGuideOnce(
        userId,
        "guide_deposit",
        "Add credits to your wallet 💰",
        "You need credits to submit a case (1 credit) or help someone as a Hero. Add credits easily via NayaPay or USDT.",
        "/wallet"
      );
    }
    if (kycStatus === "approved" && balance >= 1 && caseCount === 0 && helpCount === 0) {
      await sendGuideOnce(
        userId,
        "guide_first_action",
        "You're all set! 🎉",
        "Submit your own case if you need help, or browse verified cases and help someone directly.",
        "/cases"
      );
    }
  } catch (e) {
    console.error("userGuide error", e);
  }
}
function normalized(value) {
  return String(value ?? "").trim().toLocaleLowerCase();
}
function orderCasesForViewer(cases, preferredCountry, sortBy) {
  const country = normalized(preferredCountry);
  const urgencyOrder = { Emergency: 4, High: 3, Medium: 2, Low: 1 };
  return [...cases].sort((a, b) => {
    if (country) {
      const localDifference = Number(normalized(b.country) === country) - Number(normalized(a.country) === country);
      if (localDifference !== 0) return localDifference;
    }
    if (sortBy === "newest") return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    if (sortBy === "oldest") return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    if (sortBy === "amount_low") return (a.amount_needed ?? 0) - (b.amount_needed ?? 0);
    if (sortBy === "amount_high") return (b.amount_needed ?? 0) - (a.amount_needed ?? 0);
    if (sortBy === "urgent") return (urgencyOrder[b.urgency] ?? 0) - (urgencyOrder[a.urgency] ?? 0);
    return 0;
  });
}
const CATEGORY_SLIDE_STYLE = {
  "Electricity Bill": {
    icon: Battery,
    color: "text-amber-600",
    bg: "bg-amber-500/10"
  },
  "Gas Bill": {
    icon: Flame,
    color: "text-orange-600",
    bg: "bg-orange-500/10"
  },
  "Water Bill": {
    icon: Droplets,
    color: "text-sky-600",
    bg: "bg-sky-500/10"
  },
  "School Fees": {
    icon: GraduationCap,
    color: "text-indigo-600",
    bg: "bg-indigo-500/10"
  },
  "Medical & Treatment": {
    icon: Stethoscope,
    color: "text-rose-600",
    bg: "bg-rose-500/10"
  },
  "Business / Work Help": {
    icon: ShoppingCart,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10"
  },
  Other: {
    icon: Gift,
    color: "text-teal-600",
    bg: "bg-teal-600"
  }
};
const FILTER_CATEGORIES = [
  "Electricity Bill",
  "Gas Bill",
  "Water Bill",
  "House Rent",
  "School Fees",
  "Education & Books",
  "Medical & Treatment",
  "Medicines",
  "Food & Groceries",
  "Child Support",
  "Widow & Elderly Support",
  "Disability Support",
  "Marriage Support",
  "Business / Work Help",
  "Home Repair",
  "Funeral Expenses",
  "Livestock / Farming",
  "Debt Relief",
  "Emergency Help",
  "Other"
];
const HELP_NOW_CATEGORY_SLIDES = FILTER_CATEGORIES.map((category) => ({
  key: `category_${category}`,
  category,
  to: "/submit-request",
  style: CATEGORY_SLIDE_STYLE[category] || CATEGORY_SLIDE_STYLE.Other
}));
const CATEGORY_APPEAL = {
  "Electricity Bill": "Help bring light back to a home 💡",
  "Gas Bill": "Help light a family's stove again 🔥",
  "Water Bill": "Help restore clean water to a home 💧",
  "House Rent": "Help keep a roof over a family's head 🏠",
  "School Fees": "Help a child stay in school 📚",
  "Education & Books": "Help a student keep learning 📖",
  "Medical & Treatment": "Help save a life through treatment 🏥",
  Medicines: "Help a patient get their medicine 💊",
  "Food & Groceries": "Help fill an empty plate 🍚",
  "Child Support": "Help brighten a child's future 👶",
  "Widow & Elderly Support": "Be a support for a widow or elder 🤲",
  "Disability Support": "Help someone live with dignity ♿",
  "Marriage Support": "Help a family celebrate with dignity 💍",
  "Business / Work Help": "Help someone stand on their feet 🛒",
  "Home Repair": "Help rebuild a safe home 🏚️",
  "Funeral Expenses": "Help a family in their hardest hour 🤲",
  "Livestock / Farming": "Help a farmer earn a living 🐄",
  "Debt Relief": "Help free someone from debt's burden 🙏",
  "Emergency Help": "Help someone in an urgent crisis 🚨",
  Other: "Be someone's hope today 🤲"
};
function relativePostTime(value) {
  const timestamp = new Date(String(value || "")).getTime();
  if (!Number.isFinite(timestamp)) return "Recently";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1e3));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
function HomeSocialDashboard() {
  const { user } = useAuth();
  const { role } = useRole();
  const [walletBalance, setWalletBalance] = reactExports.useState(0);
  const [supports, setSupports] = reactExports.useState(0);
  const [supportsGiven, setSupportsGiven] = reactExports.useState(0);
  const [supportEarningsUsd, setSupportEarningsUsd] = reactExports.useState(0);
  const [posts, setPosts] = reactExports.useState([]);
  const [feedTab, setFeedTab] = reactExports.useState("for-you");
  const [message, setMessage] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  const [posting, setPosting] = reactExports.useState(false);
  const [busyPost, setBusyPost] = reactExports.useState(null);
  const [postCooldownUntil, setPostCooldownUntil] = reactExports.useState(null);
  const [clockMs, setClockMs] = reactExports.useState(() => Date.now());
  const [userQuery, setUserQuery] = reactExports.useState("");
  const [submittedUserQuery, setSubmittedUserQuery] = reactExports.useState("");
  const [userResults, setUserResults] = reactExports.useState([]);
  const [searchingUsers, setSearchingUsers] = reactExports.useState(false);
  const loadHomeData = async () => {
    var _a, _b;
    if (!(user == null ? void 0 : user.id)) return;
    setLoading(true);
    const [walletResult, supportResult, postsResult, ownPostsResult] = await Promise.allSettled([
      getWallet(user.id),
      getUserSupports(user.id),
      getCommunityPosts(feedTab),
      getCommunityPosts("my-posts")
    ]);
    if (walletResult.status === "fulfilled") setWalletBalance(Number(((_a = walletResult.value) == null ? void 0 : _a.balance) || 0));
    if (supportResult.status === "fulfilled") setSupports(Number(((_b = supportResult.value) == null ? void 0 : _b.supports) || 0));
    if (supportResult.status === "fulfilled") {
      const supportData = supportResult.value;
      setSupportsGiven(Number((supportData == null ? void 0 : supportData.supportsGiven) || 0));
      setSupportEarningsUsd(Number((supportData == null ? void 0 : supportData.supportEarningsUsd) || 0));
    }
    if (postsResult.status === "fulfilled") setPosts(Array.isArray(postsResult.value) ? postsResult.value : []);
    if (ownPostsResult.status === "fulfilled") {
      const latest = ownPostsResult.value.filter((post) => post.user_id === user.id && post.created_at).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      const next = latest ? new Date(latest.created_at).getTime() + 24 * 60 * 60 * 1e3 : 0;
      setPostCooldownUntil(next > Date.now() ? next : null);
    }
    setLoading(false);
  };
  reactExports.useEffect(() => {
    loadHomeData();
  }, [user == null ? void 0 : user.id, feedTab]);
  reactExports.useEffect(() => {
    const timer = window.setInterval(() => setClockMs(Date.now()), 1e3);
    return () => window.clearInterval(timer);
  }, []);
  reactExports.useEffect(() => {
    const query = submittedUserQuery.trim();
    if (query.length < 2) {
      setUserResults([]);
      setSearchingUsers(false);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const results = await searchUsers(query);
        if (!cancelled) setUserResults(Array.isArray(results) ? results : []);
      } catch {
        if (!cancelled) setUserResults([]);
      } finally {
        if (!cancelled) setSearchingUsers(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [submittedUserQuery]);
  const submitPost = async () => {
    const text = message.trim();
    if (!text || !(user == null ? void 0 : user.id) || postCooldownUntil != null && postCooldownUntil > Date.now()) return;
    setPosting(true);
    try {
      const created = await createCommunityPost({ message: text, user_id: user.id, display_name: user.fullName || "User", is_guest: false });
      setPosts((current) => [{ ...created, display_name: (created == null ? void 0 : created.display_name) || user.fullName || "User", message: text, likes_count: 0, support_count: 0 }, ...current]);
      setMessage("");
      setPostCooldownUntil(Date.now() + 24 * 60 * 60 * 1e3);
      ue.success("Your post is live. You can publish again after 24 hours.");
    } catch (error) {
      const nextPostAt = Number((error == null ? void 0 : error.nextPostAt) ? new Date(error.nextPostAt).getTime() : 0);
      if (nextPostAt > Date.now()) setPostCooldownUntil(nextPostAt);
      ue.error(error instanceof Error ? error.message : "Post could not be published");
    } finally {
      setPosting(false);
    }
  };
  const cooldownRemainingMs = Math.max(0, (postCooldownUntil || 0) - clockMs);
  const cooldownHours = Math.floor(cooldownRemainingMs / (1e3 * 60 * 60));
  const cooldownMinutes = Math.floor(cooldownRemainingMs % (1e3 * 60 * 60) / (1e3 * 60));
  const cooldownSeconds = Math.floor(cooldownRemainingMs % (1e3 * 60) / 1e3);
  const postLocked = cooldownRemainingMs > 0;
  const sharePost = async (post) => {
    var _a;
    const text = `${post.display_name || "Givethra member"}: ${post.message || ""}`;
    const url = `${window.location.origin}/community`;
    if (navigator.share) await navigator.share({ title: "Givethra post", text, url });
    else await ((_a = navigator.clipboard) == null ? void 0 : _a.writeText(`${text}
${url}`));
  };
  const reactToPost = async (post) => {
    if (!(post == null ? void 0 : post.id) || post.supported_by_me || post.user_id === (user == null ? void 0 : user.id)) return;
    setBusyPost(`support:${post.id}`);
    try {
      const result = await supportPost(String(post.id));
      setPosts((current) => current.map((item) => item.id === post.id ? {
        ...item,
        support_count: Number((result == null ? void 0 : result.support_count) ?? Number(item.support_count || 0) + 1),
        supported_by_me: true
      } : item));
      setSupports((value) => value + 1);
      if ((result == null ? void 0 : result.supportEarningsUsd) != null) setSupportEarningsUsd(Number(result.supportEarningsUsd));
    } catch (error) {
      ue.error(error instanceof Error ? error.message : "Support could not be added");
    } finally {
      setBusyPost(null);
    }
  };
  const togglePostHero = async (post) => {
    if (!(post == null ? void 0 : post.user_id) || post.user_id === (user == null ? void 0 : user.id)) return;
    setBusyPost(`hero:${post.id}`);
    try {
      if (post.is_following) await unfollowUser(String(post.user_id));
      else await followUser(String(post.user_id));
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, is_following: !post.is_following } : item));
    } finally {
      setBusyPost(null);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-muted/20 pb-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-4 px-3 py-4 md:px-5 md:py-7", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl bg-card px-5 py-5 shadow-sm border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary", children: "Givethra Home" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-1 text-2xl font-bold text-foreground md:text-3xl", children: [
            "Welcome ",
            role === "hero" ? "Hero" : "Requester"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: role === "hero" ? "Your kindness creates real impact." : "Share your journey and connect with support." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary", children: ((user == null ? void 0 : user.fullName) || "U").slice(0, 1).toUpperCase() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-2 gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/15 bg-primary/5 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Wallet credits" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xl font-bold text-primary", children: walletBalance.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Used for platform actions" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-200 bg-amber-50 p-3 dark:bg-amber-950/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Support earnings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xl font-bold text-amber-600", children: [
            "$",
            supportEarningsUsd.toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
            supports.toLocaleString(),
            " received · 10,000 = $1"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          supportsGiven.toLocaleString(),
          " Supports given to others"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-700", children: "Withdrawal coming soon" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold text-foreground", children: "Find people in Givethra" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Search by name or username, then open their profile." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: userQuery, onChange: (event) => setUserQuery(event.target.value), onKeyDown: (event) => {
          if (event.key === "Enter") setSubmittedUserQuery(userQuery);
        }, placeholder: "Search name or @username", className: "h-11 w-full rounded-xl border border-border bg-muted/20 pl-10 pr-24 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSubmittedUserQuery(userQuery), disabled: userQuery.trim().length < 2, className: "absolute right-1 top-1 h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50", children: "Search" })
      ] }),
      submittedUserQuery.trim().length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2", children: searchingUsers ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-3 text-center text-xs text-muted-foreground", children: "Searching…" }) : userResults.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-3 text-center text-xs text-muted-foreground", children: "No users found." }) : userResults.map((result) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/profile/$id", params: { id: String(result.user_id) }, className: "flex items-center gap-3 rounded-xl border border-border/70 p-3 transition hover:border-primary/40 hover:bg-primary/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary", children: result.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: result.avatar_url, alt: "", className: "h-full w-full object-cover" }) : String(result.full_name || "U").slice(0, 1).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-semibold", children: result.full_name || "Givethra member" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-xs text-muted-foreground", children: [
            result.username ? `@${result.username}` : "Givethra member",
            result.city ? ` · ${result.city}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-auto h-4 w-4 shrink-0 text-muted-foreground" })
      ] }, result.user_id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary", children: ((user == null ? void 0 : user.fullName) || "U").slice(0, 1).toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-sm font-semibold", children: (user == null ? void 0 : user.fullName) || "Your profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: message, onChange: (event) => setMessage(event.target.value), placeholder: "What’s on your mind to share?", rows: 3, className: "w-full resize-none rounded-xl border border-border bg-muted/20 p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: postLocked ? `Post locked · ${cooldownHours}h ${cooldownMinutes}m ${cooldownSeconds}s left` : "One post per 24 hours · Support others to grow the community" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submitPost, disabled: posting || !message.trim() || postLocked, children: posting ? "Posting..." : postLocked ? "Post Locked" : "Post" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-sm", children: [["for-you", "For You"], ["latest", "Latest"], ["most-supported", "Most Supported"], ["my-posts", "My Posts"]].map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setFeedTab(value), className: `flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${feedTab === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`, children: label }, value)) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-sm text-muted-foreground", children: "Loading your feed..." }) : posts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed bg-card py-12 text-center text-sm text-muted-foreground", children: "No posts yet. Be the first to share something." }) : posts.map((post) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/profile/$id", params: { id: String(post.user_id || "me") }, className: "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary", children: post.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: post.avatar_url, alt: "", className: "h-full w-full object-cover" }) : String(post.display_name || "U").slice(0, 1).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/profile/$id", params: { id: String(post.user_id || "me") }, className: "truncate text-sm font-semibold hover:text-primary", children: post.display_name || "User" }),
            post.user_id && post.user_id !== (user == null ? void 0 : user.id) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: busyPost === `hero:${post.id}`, onClick: () => togglePostHero(post), className: "rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground", children: post.is_following ? "Hero ✓" : "Hero" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            relativePostTime(post.created_at),
            " · ",
            post.is_verified ? "Verified member" : "Givethra member"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground", children: post.message }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2 border-t border-border pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: busyPost === `support:${post.id}` || Boolean(post.supported_by_me) || post.user_id === (user == null ? void 0 : user.id), onClick: () => reactToPost(post), className: `rounded-full border px-3 py-1.5 text-xs font-semibold ${post.supported_by_me ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-primary/20 text-primary hover:bg-primary/10"}`, children: [
          post.supported_by_me ? "Supported ✓" : "🫴🏻 Support",
          " · ",
          Number(post.support_count || 0)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => sharePost(post), className: "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }),
          " Share"
        ] })
      ] })
    ] }, post.id))
  ] }) }) });
}
function HomePage() {
  useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { role } = useRole();
  const [cases, setCases] = reactExports.useState([]);
  const [categoryCounts, setCategoryCounts] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(true);
  const [notifCount, setNotifCount] = reactExports.useState(0);
  const [kycStatus, setKycStatus] = reactExports.useState("none");
  const [balance, setBalance] = reactExports.useState(0);
  const [unlockCount, setUnlockCount] = reactExports.useState(0);
  const [slideIndex, setSlideIndex] = reactExports.useState(0);
  const [search, setSearch] = reactExports.useState("");
  const [showFilters, setShowFilters] = reactExports.useState(false);
  const [filterCountry, setFilterCountry] = reactExports.useState("all");
  const [filterCity, setFilterCity] = reactExports.useState("all");
  const [filterCat, setFilterCat] = reactExports.useState("all");
  const [filterUrgency, setFilterUrgency] = reactExports.useState("all");
  const [sortBy, setSortBy] = reactExports.useState("newest");
  const [detectedCountry, setDetectedCountry] = reactExports.useState(null);
  const [userCountry, setUserCountry] = reactExports.useState(null);
  const [detectedCity, setDetectedCity] = reactExports.useState(null);
  reactExports.useRef(null);
  reactExports.useEffect(() => {
    loadCases();
    loadCategoryCounts();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`
            );
            const data = await res.json();
            if (data == null ? void 0 : data.countryName) {
              setDetectedCountry(data.countryName);
            }
            if ((data == null ? void 0 : data.city) || (data == null ? void 0 : data.locality)) {
              setDetectedCity(
                data.city || data.locality
              );
            }
          } catch {
          }
        },
        () => {
        },
        { timeout: 8e3 }
      );
    }
  }, []);
  reactExports.useEffect(() => {
    if (!(user == null ? void 0 : user.id)) {
      setUserCountry(null);
      return;
    }
    getProfile(user.id).then(
      (profile) => setUserCountry(
        (profile == null ? void 0 : profile.country) || null
      )
    ).catch(() => setUserCountry(null));
  }, [user == null ? void 0 : user.id]);
  reactExports.useEffect(() => {
    if (isAuthenticated && (user == null ? void 0 : user.id)) {
      runUserGuide(user.id);
      loadNotifCount();
      loadGuideStatus();
      loadUnlockCount();
      const interval = setInterval(
        loadNotifCount,
        2e4
      );
      const caseInterval = setInterval(
        loadCases,
        6e4
      );
      return () => {
        clearInterval(interval);
        clearInterval(caseInterval);
      };
    }
  }, [isAuthenticated, user]);
  async function loadNotifCount() {
    if (!(user == null ? void 0 : user.id)) return;
    try {
      const count = await getUnreadNotificationsCount(
        user.id
      );
      setNotifCount(count ?? 0);
    } catch {
    }
  }
  async function loadGuideStatus() {
    if (!(user == null ? void 0 : user.id)) return;
    try {
      const kyc = await getKycStatus(user.id);
      setKycStatus(
        (kyc == null ? void 0 : kyc.status) ?? "none"
      );
      const wallet = await getWallet(user.id);
      setBalance(
        (wallet == null ? void 0 : wallet.balance) ?? 0
      );
    } catch {
    }
  }
  async function loadUnlockCount() {
    if (!(user == null ? void 0 : user.id)) return;
    try {
      const count = await getUnlockCount(user.id);
      setUnlockCount(count ?? 0);
    } catch {
    }
  }
  async function loadCases() {
    setLoading(true);
    try {
      const data = await getApprovedCases();
      setCases(data ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }
  async function loadCategoryCounts() {
    try {
      const counts = await getCategoryCounts();
      setCategoryCounts(
        counts ?? {}
      );
    } catch {
    }
  }
  const HAND_SLIDE = {
    key: "hero",
    type: "image",
    image: "/assets/generated/hero-givethra.dim_1200x500.jpg"
  };
  const guideSlides = [];
  guideSlides.push(HAND_SLIDE);
  if (!isAuthenticated) {
    guideSlides.push({
      key: "free_helps",
      type: "action",
      icon: Gift,
      title: "🎉 First 3 helps are FREE!",
      desc: "Become a Hero and unlock your first 3 cases for free. After that, 1 credit per help. Start today.",
      cta: "Become a Hero — Free",
      to: "/sign-in",
      color: "text-green-600",
      bg: "bg-green-500/10"
    });
    guideSlides.push({
      key: "free_case",
      type: "action",
      icon: FileText,
      title: "📝 Submit your FIRST case FREE!",
      desc: "Complete KYC and submit your first case with no fee. Heroes will verify and help you.",
      cta: "Submit Free Case",
      to: "/sign-in",
      color: "text-primary",
      bg: "bg-primary/10"
    });
  } else {
    if (kycStatus !== "approved") {
      guideSlides.push({
        key: "announce",
        type: "announce",
        to: "/kyc"
      });
      guideSlides.push({
        key: "kyc",
        type: "guide",
        icon: ShieldCheck,
        title: "Step 1: Verify your identity",
        desc: "You've signed up — now complete your KYC. Add your CNIC photos (front, back, selfie) as shown on the KYC page. Tap here to start.",
        to: "/kyc",
        color: "text-violet-600",
        bg: "bg-violet-500/10"
      });
    }
    if (kycStatus === "approved") {
      guideSlides.push({
        key: "submit",
        type: "guide",
        icon: FileText,
        title: "Submit your FIRST case — FREE! 🎉",
        desc: "Your identity is verified! Your first case is completely free to submit. Tap here to start your request.",
        to: "/submit-request",
        color: "text-primary",
        bg: "bg-primary/10"
      });
      if (unlockCount < 3) {
        guideSlides.push({
          key: "free_helps_auth",
          type: "guide",
          icon: Gift,
          title: "🎉 Your first 3 helps are FREE!",
          desc: `As a Hero, your first ${3 - unlockCount} unlocks are completely free. After that, 1 credit per help. Start helping now!`,
          to: "/cases",
          color: "text-green-600",
          bg: "bg-green-500/10"
        });
      }
      guideSlides.push({
        key: "help",
        type: "guide",
        icon: Heart,
        title: "Help someone — become a Hero",
        desc: "Browse verified cases and help a real person by paying their institute directly. You'll get an affidavit as proof. Tap here to help.",
        to: "/cases",
        cta: "Help Now",
        color: "text-rose-600",
        bg: "bg-rose-500/10"
      });
    }
  }
  guideSlides.push(
    ...HELP_NOW_CATEGORY_SLIDES.map(
      (slide) => ({
        key: slide.key,
        type: "category",
        category: slide.category,
        icon: slide.style.icon,
        title: slide.category,
        desc: CATEGORY_APPEAL[slide.category] || `Submit a verified ${slide.category} case.`,
        cta: "Submit this case",
        to: slide.to,
        color: slide.style.color,
        bg: slide.style.bg
      })
    )
  );
  reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (guideSlides.length <= 1) return;
    const t = setInterval(() => {
      setSlideIndex(
        (prev) => (prev + 1) % guideSlides.length
      );
    }, 6e3);
    return () => clearInterval(t);
  }, [guideSlides.length]);
  reactExports.useEffect(() => {
    if (slideIndex >= guideSlides.length) {
      setSlideIndex(0);
    }
  }, [
    guideSlides.length,
    slideIndex
  ]);
  Array.from(
    new Set(
      cases.map((c) => c.country).filter(Boolean)
    )
  ).sort();
  Array.from(
    new Set(
      cases.filter(
        (c) => filterCountry === "all" || c.country === filterCountry
      ).map((c) => c.city).filter(Boolean)
    )
  ).sort();
  let filtered = cases.filter((c) => {
    var _a, _b, _c, _d, _e;
    if (filterCountry !== "all" && c.country !== filterCountry)
      return false;
    if (filterCity !== "all" && c.city !== filterCity)
      return false;
    if (filterCat !== "all" && c.category !== filterCat)
      return false;
    if (filterUrgency !== "all" && c.urgency !== filterUrgency)
      return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!((_a = c.title) == null ? void 0 : _a.toLowerCase().includes(q)) && !((_b = c.short_description) == null ? void 0 : _b.toLowerCase().includes(q)) && !((_c = c.description) == null ? void 0 : _c.toLowerCase().includes(q)) && !((_d = c.institute_name) == null ? void 0 : _d.toLowerCase().includes(q)) && !((_e = c.city) == null ? void 0 : _e.toLowerCase().includes(q))) {
        return false;
      }
    }
    return true;
  });
  filtered = orderCasesForViewer(
    filtered,
    userCountry || detectedCountry,
    sortBy
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(HomeSocialDashboard, {});
}
export {
  HomePage as default
};
