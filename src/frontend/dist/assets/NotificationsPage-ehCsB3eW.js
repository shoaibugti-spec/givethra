import { c as createLucideIcon, g as useQueryClient, r as reactExports, j as jsxRuntimeExports, u as useNavigate, M as MessageCircle } from "./index-BoYH-a4m.js";
import { u as useActor, a as useQuery, N as NotificationType, c as createActor } from "./backend-B2Q1poOu.js";
import { B as Badge } from "./badge-BcZEG4YE.js";
import { B as Button } from "./button-DXj5HeE2.js";
import { S as Skeleton } from "./skeleton-D-OBt1mm.js";
import { u as useMutation } from "./useMutation-Caci9WDk.js";
import { B as Bell } from "./bell-DSWTbU_S.js";
import { T as Trash2 } from "./trash-2-74HxVmBv.js";
import { S as ShieldCheck } from "./shield-check-CV1UwXCf.js";
import { C as CreditCard } from "./credit-card-Qm0roWIo.js";
import { H as Heart } from "./heart-qvi-jSMZ.js";
import { C as CircleAlert } from "./circle-alert-CarhqOsL.js";
import { X } from "./x-Yn9x35TY.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  [
    "path",
    {
      d: "M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742",
      key: "178tsu"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  ["path", { d: "M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05", key: "1hqiys" }]
];
const BellOff = createLucideIcon("bell-off", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M18 6 7 17l-5-5", key: "116fxf" }],
  ["path", { d: "m22 10-7.5 7.5L13 16", key: "ke71qq" }]
];
const CheckCheck = createLucideIcon("check-check", __iconNode);
function useNotifications() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3e4
  });
}
function useMarkAsRead() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notifId) => {
      if (!actor) return;
      await actor.markNotificationAsRead(notifId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] })
  });
}
function useDismissNotification() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notifId) => {
      if (!actor) return;
      await actor.dismissNotification(notifId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] })
  });
}
const NOTIF_CONFIG = {
  [NotificationType.VerificationUpdate]: {
    icon: ShieldCheck,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Verification"
  },
  [NotificationType.CaseApproved]: {
    icon: CheckCheck,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Case Approved"
  },
  [NotificationType.CaseRejected]: {
    icon: CircleAlert,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Case Rejected"
  },
  [NotificationType.NewMessage]: {
    icon: MessageCircle,
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "Message"
  },
  [NotificationType.ProudHeartReceived]: {
    icon: Heart,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    label: "Proud ❤️"
  },
  [NotificationType.UnlockPurchased]: {
    icon: CreditCard,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Unlock"
  },
  [NotificationType.SupportSubmitted]: {
    icon: ShieldCheck,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    label: "Support"
  }
};
function formatRelativeTime(ts) {
  const ms = Number(ts / BigInt(1e6));
  const diff = Date.now() - ms;
  if (diff < 6e4) return "just now";
  if (diff < 36e5) return `${Math.floor(diff / 6e4)}m ago`;
  if (diff < 864e5) return `${Math.floor(diff / 36e5)}h ago`;
  return `${Math.floor(diff / 864e5)}d ago`;
}
function NotifSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "w-10 h-10 rounded-full shrink-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-1/4" })
    ] })
  ] });
}
function EmptyState() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "notifications.empty_state",
      className: "flex flex-col items-center justify-center gap-4 py-20 px-6 text-center",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "w-9 h-9 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-foreground font-display", children: "No notifications yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "We'll let you know when something important happens." })
        ] })
      ]
    }
  );
}
function NotifItem({
  notif,
  onRead,
  onDismiss,
  isReadPending,
  isDismissPending
}) {
  const navigate = useNavigate();
  const cfg = NOTIF_CONFIG[notif.notifType] ?? {
    icon: Bell,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Update"
  };
  const Icon = cfg.icon;
  function handleTap() {
    if (!notif.isRead) onRead(notif.id);
    if (notif.relatedCaseId !== void 0 && (notif.notifType === NotificationType.CaseApproved || notif.notifType === NotificationType.CaseRejected || notif.notifType === NotificationType.VerificationUpdate || notif.notifType === NotificationType.UnlockPurchased || notif.notifType === NotificationType.SupportSubmitted)) {
      navigate({ to: `/cases/${notif.relatedCaseId}` });
    } else if (notif.notifType === NotificationType.NewMessage) {
      navigate({ to: "/messages" });
    } else if (notif.notifType === NotificationType.ProudHeartReceived && notif.relatedUserId) {
      navigate({ to: `/profile/${notif.relatedUserId}` });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      "data-ocid": `notifications.item.${String(notif.id)}`,
      className: `w-full text-left flex gap-3 px-4 py-3.5 transition-colors active:bg-muted/60 border-b border-border/50 last:border-b-0 ${!notif.isRead ? "bg-primary/5" : "bg-transparent"}`,
      onClick: handleTap,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${cfg.bgColor}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `w-5 h-5 ${cfg.color}` })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground font-display truncate", children: notif.title }),
              !notif.isRead && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-primary shrink-0" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground shrink-0 mt-0.5", children: formatRelativeTime(notif.createdAt) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-snug", children: notif.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "secondary",
              className: "text-xs px-1.5 py-0 h-5 font-normal",
              children: cfg.label
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 shrink-0", children: [
          !notif.isRead && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": `notifications.read_button.${String(notif.id)}`,
              disabled: isReadPending,
              "aria-label": "Mark as read",
              className: "w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground",
              onClick: (e) => {
                e.stopPropagation();
                onRead(notif.id);
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "w-3.5 h-3.5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": `notifications.dismiss_button.${String(notif.id)}`,
              disabled: isDismissPending,
              "aria-label": "Dismiss notification",
              className: "w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-destructive",
              onClick: (e) => {
                e.stopPropagation();
                onDismiss(notif.id);
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
            }
          )
        ] })
      ]
    }
  );
}
function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkAsRead();
  const dismiss = useDismissNotification();
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  const [selectedTab, setSelectedTab] = reactExports.useState("all");
  const unreadCount = (notifications == null ? void 0 : notifications.filter((n) => !n.isRead).length) ?? 0;
  async function handleMarkAllRead() {
    if (!notifications || !actor) return;
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => actor.markNotificationAsRead(n.id)));
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col pb-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-10 bg-card border-b border-border shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 h-14", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-5 h-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-foreground font-display", children: "Notifications" }),
          unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "h-5 text-xs px-1.5", children: unreadCount })
        ] }),
        unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            "data-ocid": "notifications.mark_all_read_button",
            onClick: handleMarkAllRead,
            className: "text-xs text-primary",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "w-3.5 h-3.5 mr-1" }),
              "Mark all read"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide", children: [
        { label: "All", value: "all" },
        { label: "Unread", value: "unread" },
        { label: "Cases", value: "cases" },
        { label: "Messages", value: "messages" },
        { label: "Payments", value: "payments" }
      ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": `notifications.${tab.value}.tab`,
          onClick: () => setSelectedTab(tab.value),
          className: `shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedTab === tab.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`,
          children: tab.label
        },
        tab.value
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": "notifications.loading_state",
        className: "divide-y divide-border/50",
        children: Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
          /* @__PURE__ */ jsxRuntimeExports.jsx(NotifSkeleton, {}, i)
        ))
      }
    ) : !notifications || notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/50", children: [...notifications].sort((a, b) => Number(b.createdAt - a.createdAt)).map((notif) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      NotifItem,
      {
        notif,
        onRead: (id) => markRead.mutate(id),
        onDismiss: (id) => dismiss.mutate(id),
        isReadPending: markRead.isPending,
        isDismissPending: dismiss.isPending
      },
      String(notif.id)
    )) }) }),
    notifications && notifications.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-t border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        "data-ocid": "notifications.clear_all_button",
        className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors",
        onClick: () => {
          for (const n of notifications) dismiss.mutate(n.id);
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }),
          "Clear all notifications"
        ]
      }
    ) })
  ] });
}
export {
  NotificationsPage as default
};
