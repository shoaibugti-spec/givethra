import { w as createLucideIcon, e as useAuth, u as useNavigate, r as reactExports, aD as getNotifications, aE as markAllNotificationsAsRead, l as jsxRuntimeExports, aF as deleteAllNotifications } from "./main-Cdc0HMQw.js";
import { L as Layout } from "./Layout-DA0EcIPU.js";
import { B as Button } from "./button-M4vBmj7v.js";
import { B as Bell, M as MessageCircle } from "./message-circle-_f6w5SHu.js";
import { C as CreditCard } from "./credit-card-DBJ13Lyf.js";
import { U as UserPlus } from "./user-plus-CH9bpIyt.js";
import { H as Heart } from "./heart-Bgucrxac.js";
import { C as CircleAlert } from "./circle-alert-BePJhF6b.js";
import { S as ShieldCheck } from "./shield-check-C124rJP9.js";
import { T as Trash2 } from "./trash-2-CcpdV9Db.js";
import "./users-DNTUunjV.js";
import "./x-DexM1Xlt.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const BellOff = createLucideIcon("BellOff", [
  ["path", { d: "M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5", key: "o7mx20" }],
  ["path", { d: "M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7", key: "16f1lm" }],
  ["path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0", key: "qgo35s" }],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CheckCheck = createLucideIcon("CheckCheck", [
  ["path", { d: "M18 6 7 17l-5-5", key: "116fxf" }],
  ["path", { d: "m22 10-7.5 7.5L13 16", key: "ke71qq" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Repeat = createLucideIcon("Repeat", [
  ["path", { d: "m17 2 4 4-4 4", key: "nntrym" }],
  ["path", { d: "M3 11v-1a4 4 0 0 1 4-4h14", key: "84bu3i" }],
  ["path", { d: "m7 22-4-4 4-4", key: "1wqhfi" }],
  ["path", { d: "M21 13v1a4 4 0 0 1-4 4H3", key: "1rx37r" }]
]);
const TYPE_CONFIG = {
  welcome: { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  kyc_approved: { icon: ShieldCheck, color: "text-teal-500", bg: "bg-teal-500/10" },
  kyc_rejected: { icon: CircleAlert, color: "text-red-500", bg: "bg-red-500/10" },
  kyc_pending: { icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
  case_approved: { icon: CheckCheck, color: "text-teal-500", bg: "bg-teal-500/10" },
  case_rejected: { icon: CircleAlert, color: "text-red-500", bg: "bg-red-500/10" },
  case_completed: { icon: CheckCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
  credits_added: { icon: CreditCard, color: "text-teal-500", bg: "bg-teal-500/10" },
  deposit_rejected: { icon: CircleAlert, color: "text-red-500", bg: "bg-red-500/10" },
  support_reply: { icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
  admin_broadcast: { icon: Bell, color: "text-primary", bg: "bg-primary/10" },
  message: { icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
  system: { icon: Bell, color: "text-primary", bg: "bg-primary/10" },
  like: { icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
  comment: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  new_follower: { icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
  follow: { icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
  repost: { icon: Repeat, color: "text-violet-500", bg: "bg-violet-500/10" },
  support: { icon: Repeat, color: "text-violet-500", bg: "bg-violet-500/10" },
  new_support: { icon: Repeat, color: "text-violet-500", bg: "bg-violet-500/10" },
  credit_earned: { icon: CreditCard, color: "text-amber-500", bg: "bg-amber-500/10" }
};
function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 6e4) return "just now";
  if (diff < 36e5) return `${Math.floor(diff / 6e4)}m ago`;
  if (diff < 864e5) return `${Math.floor(diff / 36e5)}h ago`;
  return `${Math.floor(diff / 864e5)}d ago`;
}
function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const loadNotifications = reactExports.useCallback(async () => {
    if (!(user == null ? void 0 : user.id)) return;
    setLoading(true);
    try {
      const data = await getNotifications(user.id);
      setNotifs(data ?? []);
      await markAllNotificationsAsRead(user.id);
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  }, [user]);
  reactExports.useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 3e4);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, loadNotifications, navigate]);
  async function markAllRead() {
    if (!(user == null ? void 0 : user.id)) return;
    await markAllNotificationsAsRead(user.id);
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }
  async function clearAll() {
    if (!(user == null ? void 0 : user.id)) return;
    await deleteAllNotifications(user.id);
    setNotifs([]);
  }
  function handleClick(n) {
    if (n.link) navigate({ to: n.link });
  }
  const unreadCount = notifs.filter((n) => !n.is_read).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-6 w-6 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Notifications" }),
        unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold", children: unreadCount })
      ] }),
      notifs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: markAllRead,
          className: "text-xs text-primary",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3.5 w-3.5 mr-1" }),
            " Mark all read"
          ]
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-20 text-muted-foreground", children: "Loading..." }) : notifs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-4 py-20 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 w-20 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "h-9 w-9 text-muted-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold", children: "No notifications yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "We'll let you know when something important happens." })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      notifs.map((n) => {
        const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
        const Icon = cfg.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => handleClick(n),
            className: `w-full text-left flex gap-3 p-4 rounded-xl border transition-colors hover:bg-muted/30 ${!n.is_read ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `h-10 w-10 rounded-full shrink-0 flex items-center justify-center ${cfg.bg}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-5 w-5 ${cfg.color}` })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm truncate", children: n.title }),
                    !n.is_read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-primary shrink-0" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground shrink-0", children: relativeTime(n.created_at) })
                ] }),
                n.message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5 line-clamp-2", children: n.message })
              ] })
            ]
          },
          n.id
        );
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: clearAll,
          className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-red-600 transition-colors pt-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
            " Clear all notifications"
          ]
        }
      )
    ] })
  ] }) });
}
export {
  NotificationsPage as default
};
