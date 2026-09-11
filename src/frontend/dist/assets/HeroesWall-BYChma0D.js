import { e as useAuth, r as reactExports, l as jsxRuntimeExports, b2 as getHeroesWall, aY as toggleLike, p as ue, a_ as getPostComments, aZ as addComment } from "./main-Cdc0HMQw.js";
import { B as Button } from "./button-M4vBmj7v.js";
import { T as Trophy } from "./trophy-DoUAdAHv.js";
import { H as Heart } from "./heart-Bgucrxac.js";
import { M as MessageCircle } from "./message-circle-_f6w5SHu.js";
import { S as Share2 } from "./share-2-Cvl9gZeH.js";
import { C as ChevronLeft } from "./chevron-left-CeJ2fM9w.js";
import { C as ChevronRight } from "./chevron-right-INWSu2u0.js";
import { S as Send } from "./send-DmUDkVVN.js";
function money(currency, amount) {
  const symbol = currency === "PKR" ? "Rs" : currency || "PKR";
  return `${symbol} ${amount.toLocaleString()}`;
}
async function shareWallPost(title, text, path) {
  const url = new URL(path, window.location.origin).toString();
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }
  } catch (error) {
    if ((error == null ? void 0 : error.name) === "AbortError") return;
  }
  try {
    await navigator.clipboard.writeText(url);
    ue.success("Link copied. Share it with your community.");
  } catch {
    ue.error("Sharing is unavailable in this browser.");
  }
}
function HeroesWall() {
  const { user } = useAuth();
  const [items, setItems] = reactExports.useState([]);
  const [metrics, setMetrics] = reactExports.useState({ solved_cases: 0, total_amount: 0, currency: "PKR" });
  const [index, setIndex] = reactExports.useState(0);
  const [comments, setComments] = reactExports.useState({});
  const [commentText, setCommentText] = reactExports.useState({});
  const [openComments, setOpenComments] = reactExports.useState({});
  const [liked, setLiked] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(true);
  const [posting, setPosting] = reactExports.useState(false);
  const [loadError, setLoadError] = reactExports.useState("");
  async function loadWall() {
    try {
      const result = await getHeroesWall();
      setLoadError("");
      setItems(Array.isArray(result == null ? void 0 : result.cases) ? result.cases : []);
      setMetrics((result == null ? void 0 : result.metrics) || { solved_cases: 0, total_amount: 0, currency: "PKR" });
      setIndex(0);
    } catch (error) {
      setItems([]);
      setLoadError((error == null ? void 0 : error.message) || "Heroes Wall is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    void loadWall();
    const refresh = window.setInterval(() => void loadWall(), 10 * 60 * 1e3);
    return () => window.clearInterval(refresh);
  }, []);
  const current = items[index];
  const currentComments = current ? comments[current.post_id] || [] : [];
  const currentCommentText = current ? commentText[current.post_id] || "" : "";
  const currentLike = current ? liked[current.post_id] : false;
  const progress = reactExports.useMemo(() => {
    if (!current) return 100;
    const needed = Number(current.amount_needed || 0);
    const collected = Number(current.amount_collected || needed || 0);
    return needed > 0 ? Math.min(100, Math.round(collected / needed * 100)) : 100;
  }, [current]);
  async function handleShare() {
    if (!current) return;
    await shareWallPost(current.title || "Givethra Heroes Wall", current.post_message || "A completed case on Givethra", `/heroes-wall#${encodeURIComponent(current.post_id)}`);
  }
  async function handleLike() {
    if (!current) return;
    try {
      const result = await toggleLike(current.post_id);
      setLiked((prev) => ({ ...prev, [current.post_id]: Boolean(result.liked) }));
      setItems((prev) => prev.map((item) => item.post_id === current.post_id ? { ...item, likes_count: Math.max(0, Number(item.likes_count || 0) + (result.liked ? 1 : -1)) } : item));
    } catch (error) {
      ue.error((error == null ? void 0 : error.message) || "Unable to update kindness right now.");
    }
  }
  async function toggleComments() {
    if (!current) return;
    const next = !openComments[current.post_id];
    setOpenComments((prev) => ({ ...prev, [current.post_id]: next }));
    if (!next || comments[current.post_id]) return;
    try {
      const result = await getPostComments(current.post_id);
      setComments((prev) => ({ ...prev, [current.post_id]: result }));
    } catch (error) {
      ue.error((error == null ? void 0 : error.message) || "Unable to load comments.");
    }
  }
  async function handleComment() {
    if (!current || !currentCommentText.trim()) return;
    setPosting(true);
    try {
      const result = await addComment(current.post_id, currentCommentText.trim());
      setComments((prev) => ({ ...prev, [current.post_id]: [...prev[current.post_id] || [], result] }));
      setItems((prev) => prev.map((item) => item.post_id === current.post_id ? { ...item, comments_count: Number(item.comments_count || 0) + 1 } : item));
      setCommentText((prev) => ({ ...prev, [current.post_id]: "" }));
      setOpenComments((prev) => ({ ...prev, [current.post_id]: true }));
    } catch (error) {
      ue.error((error == null ? void 0 : error.message) || "Unable to post your comment.");
    } finally {
      setPosting(false);
    }
  }
  if (loading) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { "aria-labelledby": "heroes-wall-title", className: "bg-muted/20 px-4 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4" }),
          " Community impact"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "heroes-wall-title", className: "font-display text-2xl font-bold", children: "Heroes Wall" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-xl text-sm text-muted-foreground", children: "Real cases completed through verified help from Givethra Heroes." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-center sm:min-w-[270px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-primary", children: metrics.solved_cases }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Cases solved" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-teal-600", children: money(metrics.currency, Number(metrics.total_amount || 0)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Total help delivered" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm", children: !items.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-sm text-muted-foreground", children: loadError || "Completed cases will appear here after the verified help flow is finished." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "p-5 sm:p-7", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-600", children: [
            "Completed case ",
            index + 1,
            " of ",
            items.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 truncate text-xl font-bold", children: current.title || "A case completed with community help" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: current.category || "Verified help" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-700", children: "Help complete" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground", children: current.post_message || "A Givethra case was completed through verified help from Heroes." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Verified impact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-teal-600", children: money(current.currency, Number(current.amount_collected || current.amount_needed || 0)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-teal-500", style: { width: `${progress}%` } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleLike, className: `flex items-center gap-1.5 text-sm font-medium ${currentLike ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4", fill: currentLike ? "currentColor" : "none" }),
          " Like ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "(",
            Number(current.likes_count || 0),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: toggleComments, className: "flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
          " Comment ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "(",
            Number(current.comments_count || 0),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleShare, className: "flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary", "aria-label": "Share completed case", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }),
          " Share"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "icon", "aria-label": "Previous completed case", disabled: index === 0, onClick: () => setIndex((value) => Math.max(0, value - 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "icon", "aria-label": "Next completed case", disabled: index === items.length - 1, onClick: () => setIndex((value) => Math.min(items.length - 1, value + 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) })
        ] })
      ] }),
      openComments[current.post_id] && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 space-y-2 overflow-y-auto", children: currentComments.length ? currentComments.map((comment) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/40 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold", children: comment.user_name || "A Givethra member" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm break-words", children: comment.comment })
        ] }, comment.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No comments yet." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { "aria-label": "Comment on completed case", value: currentCommentText, onChange: (event) => setCommentText((prev) => ({ ...prev, [current.post_id]: event.target.value })), placeholder: "Write a kind comment...", rows: 2, className: "min-h-10 flex-1 resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "icon", "aria-label": "Post comment", disabled: posting || !currentCommentText.trim(), onClick: handleComment, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  HeroesWall as H
};
