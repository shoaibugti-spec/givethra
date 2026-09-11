import { r as reactExports, l as jsxRuntimeExports, e as useAuth, O as getFeedbacks, b3 as getLikes, b4 as getComments, p as ue, aX as getGuestId, b5 as toggleFeedbackLike, a as getProfile, b6 as createComment } from "./main-CYM9BeWF.js";
import { S as Sparkles } from "./sparkles-DZLzL1U9.js";
import { H as Heart } from "./heart-BeKUzFrD.js";
import { M as MessageCircle } from "./message-circle-CsflEQIJ.js";
import { S as Share2 } from "./share-2-BXMwQoQt.js";
import { C as ChevronLeft } from "./chevron-left-CeKDX7_K.js";
import { C as ChevronRight } from "./chevron-right-B8XRwpS3.js";
import { S as Send } from "./send-C_5P1ysy.js";
function ProtectedVideoPlayer({ src, className = "" }) {
  const videoRef = reactExports.useRef(null);
  const [playing, setPlaying] = reactExports.useState(false);
  const [duration, setDuration] = reactExports.useState(0);
  const [currentTime, setCurrentTime] = reactExports.useState(0);
  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  }
  function seek(value) {
    const video = videoRef.current;
    const nextTime = Number(value);
    if (!video || !Number.isFinite(nextTime)) return;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `overflow-hidden rounded-xl border border-border bg-black ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "video",
      {
        ref: videoRef,
        src,
        playsInline: true,
        preload: "metadata",
        onLoadedMetadata: (event) => setDuration(event.currentTarget.duration || 0),
        onTimeUpdate: (event) => setCurrentTime(event.currentTarget.currentTime),
        onPlay: () => setPlaying(true),
        onPause: () => setPlaying(false),
        onEnded: () => setPlaying(false),
        onContextMenu: (event) => event.preventDefault(),
        className: "block max-h-80 w-full select-none"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-3 py-2", "aria-label": "Video controls", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: togglePlayback, className: "min-w-16 rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25", "aria-label": playing ? "Pause video" : "Play video", children: playing ? "Pause" : "Play" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "range",
          min: "0",
          max: duration || 0,
          step: "0.1",
          value: Math.min(currentTime, duration || 0),
          onChange: (event) => seek(event.target.value),
          className: "min-w-0 flex-1 accent-white",
          "aria-label": "Video timeline"
        }
      )
    ] })
  ] });
}
function timeAgo(value) {
  if (!value) return "Recently";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1e3));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
function KindnessWall() {
  const { user, isAuthenticated } = useAuth();
  const [feedbacks, setFeedbacks] = reactExports.useState([]);
  const [likes, setLikes] = reactExports.useState([]);
  const [comments, setComments] = reactExports.useState([]);
  const [index, setIndex] = reactExports.useState(0);
  const [openComments, setOpenComments] = reactExports.useState(false);
  const [commentText, setCommentText] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  const [posting, setPosting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let active = true;
    Promise.all([getFeedbacks(100), getLikes(), getComments()]).then(([nextFeedbacks, nextLikes, nextComments]) => {
      if (!active) return;
      setFeedbacks(Array.isArray(nextFeedbacks) ? nextFeedbacks : []);
      setLikes(Array.isArray(nextLikes) ? nextLikes : []);
      setComments(Array.isArray(nextComments) ? nextComments : []);
    }).catch(() => {
      if (active) ue.error("Kindness Wall is temporarily unavailable.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  const ordered = reactExports.useMemo(() => [...feedbacks].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()), [feedbacks]);
  const current = ordered[index];
  const currentLikes = current ? likes.filter((like) => like.feedback_id === current.id) : [];
  const currentComments = current ? comments.filter((comment) => comment.feedback_id === current.id) : [];
  const actorId = isAuthenticated && user ? user.id : getGuestId();
  const liked = currentLikes.some((like) => like.user_id === actorId);
  async function handleShare() {
    if (!current) return;
    const url = new URL(`/kindness-wall#${encodeURIComponent(current.id)}`, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: current.case_title || "Givethra Kindness Wall", text: current.text_message || current.comment || "A verified Givethra feedback story", url });
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
  async function handleLike() {
    if (!current) return;
    try {
      const existing = currentLikes.find((like) => like.user_id === actorId);
      const result = await toggleFeedbackLike(current.id, actorId, existing == null ? void 0 : existing.id);
      if (result.deleted) setLikes((items) => items.filter((item) => item.id !== result.id));
      if (result.created) setLikes((items) => [...items, result.created]);
    } catch (error) {
      ue.error((error == null ? void 0 : error.message) || "Unable to update kindness.");
    }
  }
  async function handleComment() {
    var _a;
    if (!current || !commentText.trim() || !actorId) return;
    setPosting(true);
    try {
      const firstName = isAuthenticated && user ? (((_a = await getProfile(user.id)) == null ? void 0 : _a.full_name) || "User").split(" ")[0] : `Guest ${getGuestId().slice(-6)}`;
      const created = await createComment({ feedback_id: current.id, user_id: actorId, first_name: firstName, comment: commentText.trim() });
      if (created == null ? void 0 : created.id) {
        setComments((items) => [...items, created]);
        setCommentText("");
      } else throw new Error("Comment could not be posted");
    } catch (error) {
      ue.error((error == null ? void 0 : error.message) || "Unable to post comment.");
    } finally {
      setPosting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-y border-border bg-muted/20 px-4 py-8", "aria-labelledby": "kindness-wall-title", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-1 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
        " Community gratitude"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "kindness-wall-title", className: "font-display text-2xl font-bold", children: "Kindness Wall" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Real feedback from people whose completed cases received verified help." })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground", children: "Loading kindness stories..." }) : !current ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground", children: "Approved seeker feedback will appear here after a completed case." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold uppercase tracking-wide text-primary", children: [
            "Story ",
            index + 1,
            " of ",
            ordered.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 truncate text-lg font-bold", children: current.case_title || "A completed Givethra case" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            current.user_name || "A grateful seeker",
            " · ",
            timeAgo(current.created_at)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-700", children: "Verified feedback" })
      ] }),
      (current.text_message || current.comment) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 whitespace-pre-line rounded-xl bg-muted/40 p-4 text-sm leading-relaxed", children: current.text_message || current.comment }),
      current.video_url && /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedVideoPlayer, { src: current.video_url, className: "mt-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleLike, className: `flex items-center gap-1.5 text-sm font-medium ${liked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4", fill: liked ? "currentColor" : "none" }),
          " Like ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "(",
            currentLikes.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setOpenComments((value) => !value), className: "flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
          " Comment ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "(",
            currentComments.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleShare, className: "flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary", "aria-label": "Share kindness story", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }),
          " Share"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Previous kindness story", disabled: index === 0, onClick: () => {
            setIndex((value) => Math.max(0, value - 1));
            setOpenComments(false);
          }, className: "h-8 w-8 rounded-full border border-border disabled:opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "mx-auto h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Next kindness story", disabled: index === ordered.length - 1, onClick: () => {
            setIndex((value) => Math.min(ordered.length - 1, value + 1));
            setOpenComments(false);
          }, className: "h-8 w-8 rounded-full border border-border disabled:opacity-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "mx-auto h-4 w-4" }) })
        ] })
      ] }),
      openComments && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 space-y-2 overflow-y-auto", children: currentComments.map((comment) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/40 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold", children: comment.first_name || comment.user_name || "A Givethra member" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words text-sm", children: comment.comment })
        ] }, comment.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { "aria-label": "Comment on kindness story", value: commentText, onChange: (event) => setCommentText(event.target.value), placeholder: "Write a kind comment...", rows: 2, className: "min-h-10 min-w-0 flex-1 resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Post kindness comment", disabled: posting || !commentText.trim(), onClick: handleComment, className: "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  KindnessWall as K
};
