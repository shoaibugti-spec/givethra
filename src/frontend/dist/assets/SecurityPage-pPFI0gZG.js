import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, K as KycStatus, L as Link, f as ue, T as TriangleAlert } from "./index-C7ZxjHlS.js";
import { L as Layout } from "./Layout-BMq74Uxj.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-Cji7-A6n.js";
import { B as Badge } from "./badge-CwN3900c.js";
import { B as Button } from "./button-QIYvq4xc.js";
import { S as Skeleton } from "./skeleton-XJNy3M--.js";
import { u as useBackendActor } from "./useBackend-Dxqmakwa.js";
import { S as ShieldCheck } from "./shield-check--kD3Q-5L.js";
import { S as Shield } from "./shield-BEOLXRSd.js";
import { C as Clock } from "./clock-CB4B95xZ.js";
import { T as Trash2 } from "./trash-2-BN-AF3uI.js";
import { L as LogOut } from "./log-out-BQnQih7d.js";
import { C as CircleX } from "./circle-x-ivfTcJTk.js";
import { C as CircleCheck } from "./circle-check-BiLjReYf.js";
import "./input-EIAk_KSS.js";
import "./heart-VGojEH0R.js";
import "./bell-BDI-oIDm.js";
import "./x-BZLxzlHw.js";
import "./index-CaBAJ_1p.js";
import "./index-B3K-TOne.js";
import "./Combination-Ci1LmzzH.js";
import "./index-o7zQPoiM.js";
import "./useQuery-Cb3pY6Kz.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
];
const Monitor = createLucideIcon("monitor", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
];
const Smartphone = createLucideIcon("smartphone", __iconNode);
function SectionTitle({
  title,
  icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-primary", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: title })
  ] });
}
function StatusCard({
  label,
  description,
  status,
  action
}) {
  const cfgMap = {
    verified: {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
      text: "Verified",
      cls: "text-green-600 dark:text-green-400"
    },
    pending: {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
      text: "Pending",
      cls: "text-muted-foreground"
    },
    review: {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }),
      text: "Under Review",
      cls: "text-orange-500"
    },
    failed: {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }),
      text: "Rejected",
      cls: "text-destructive"
    },
    unknown: {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
      text: "Not Set",
      cls: "text-muted-foreground"
    }
  };
  const c = cfgMap[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 py-3 border-b border-border last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: label }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-2 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `flex items-center gap-1 text-xs font-semibold ${c.cls}`,
          children: [
            c.icon,
            c.text
          ]
        }
      ),
      action
    ] })
  ] });
}
function toStatusKind(s) {
  if (s === KycStatus.Approved) return "verified";
  if (s === KycStatus.UnderReview) return "review";
  if (s === KycStatus.Rejected) return "failed";
  return "pending";
}
function kycBadge(s) {
  if (s === KycStatus.Approved)
    return {
      label: "Approved",
      cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    };
  if (s === KycStatus.UnderReview)
    return {
      label: "Under Review",
      cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
    };
  if (s === KycStatus.Rejected)
    return { label: "Rejected", cls: "bg-destructive/10 text-destructive" };
  return { label: "Pending", cls: "bg-muted text-muted-foreground" };
}
function timeAgo(ts) {
  const diff = Date.now() - Number(ts) / 1e6;
  const m = Math.floor(diff / 6e4);
  const h = Math.floor(diff / 36e5);
  const d = Math.floor(diff / 864e5);
  if (m < 2) return "just now";
  if (m < 60) return `${m} minutes ago`;
  if (h < 24) return `${h} hours ago`;
  return `${d} day${d !== 1 ? "s" : ""} ago`;
}
function SecurityPage() {
  const { actor, isFetching } = useBackendActor();
  const [profile, setProfile] = reactExports.useState(null);
  const [devices, setDevices] = reactExports.useState([]);
  const [profileLoading, setProfileLoading] = reactExports.useState(true);
  const [devicesLoading, setDevicesLoading] = reactExports.useState(true);
  const [logoutAllLoading, setLogoutAllLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    setProfileLoading(true);
    actor.getCallerUserProfile().then((p) => setProfile(p ?? null)).catch(() => setProfile(null)).finally(() => setProfileLoading(false));
  }, [actor, isFetching]);
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    setDevicesLoading(true);
    actor.getLoginDevices().then((d) => setDevices(d)).catch(() => setDevices([])).finally(() => setDevicesLoading(false));
  }, [actor, isFetching]);
  const handleLogoutAll = async () => {
    if (!actor) return;
    setLogoutAllLoading(true);
    try {
      const count = await actor.logoutAllOtherDevices();
      ue.success(
        `Logged out ${Number(count)} other session${Number(count) !== 1 ? "s" : ""} successfully.`
      );
      const d = await actor.getLoginDevices();
      setDevices(d);
    } catch {
      ue.error("Failed to logout other sessions. Please try again.");
    } finally {
      setLogoutAllLoading(false);
    }
  };
  const isLoading = profileLoading || isFetching;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "max-w-xl mx-auto px-4 pt-6 pb-24",
      "data-ocid": "security.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-6 w-6 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "Security Center" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5 mb-4 shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionTitle,
            {
              title: "Verification Status",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5" })
            }
          ),
          isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full rounded-lg" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "security.verification_status.card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StatusCard,
              {
                label: "Email Verification",
                description: (profile == null ? void 0 : profile.email) ? `Verified: ${profile.email}` : "No email linked",
                status: (profile == null ? void 0 : profile.email) ? "verified" : "unknown"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StatusCard,
              {
                label: "Mobile Verification",
                description: (profile == null ? void 0 : profile.phoneNumber) ? `Linked: ${profile.phoneNumber}` : "No phone linked",
                status: (profile == null ? void 0 : profile.phoneNumber) ? "verified" : "unknown"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StatusCard,
              {
                label: "Identity Verification",
                description: "Government ID document check",
                status: profile ? toStatusKind(profile.kycStatus) : "unknown"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StatusCard,
              {
                label: "KYC Status",
                description: "Know Your Customer verification",
                status: profile ? toStatusKind(profile.kycStatus) : "unknown",
                action: profile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Badge,
                    {
                      className: `text-xs px-2 py-0.5 ${kycBadge(profile.kycStatus).cls}`,
                      children: kycBadge(profile.kycStatus).label
                    }
                  ),
                  profile.kycStatus === KycStatus.Rejected && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/edit-profile", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "destructive",
                      className: "text-xs h-7",
                      "data-ocid": "security.resubmit_kyc_button",
                      children: "Re-submit KYC"
                    }
                  ) })
                ] }) : null
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5 mb-4 shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionTitle,
            {
              title: "Session Info",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5" })
            }
          ),
          isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48 rounded" }) : profile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "security.session_info.card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              "Last seen:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: profile.lastLoginAt > 0n ? timeAgo(profile.lastLoginAt) : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
              "Member since:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: profile.createdAt > 0n ? new Date(
                Number(profile.createdAt) / 1e6
              ).toLocaleDateString() : "—" })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Sign in to view session info." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5 mb-4 shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionTitle,
            {
              title: "Login Devices",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "h-5 w-5" })
            }
          ),
          devicesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full rounded-xl" }, i)) }) : devices.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "security.devices.empty_state",
              className: "text-center py-6",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-8 w-8 text-muted-foreground mx-auto mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No devices found." })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", "data-ocid": "security.devices.list", children: devices.map((device, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": `security.devices.item.${i + 1}`,
              className: "flex items-start justify-between gap-3 p-3 rounded-xl bg-muted/50 border border-border",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 p-1.5 rounded-lg bg-card border border-border shrink-0", children: device.os.toLowerCase().includes("mobile") || device.os.toLowerCase().includes("android") || device.os.toLowerCase().includes("ios") ? /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "h-4 w-4 text-muted-foreground" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate", children: device.deviceName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: device.os }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                      "IP: ",
                      device.ipAddress,
                      " ·",
                      " ",
                      new Date(
                        Number(device.lastAccess) / 1e6
                      ).toLocaleString()
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-8 w-8 text-muted-foreground hover:text-destructive shrink-0",
                    "aria-label": "Remove device",
                    "data-ocid": `security.devices.delete_button.${i + 1}`,
                    onClick: () => ue.info("Device removal coming in a future update."),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                  }
                )
              ]
            },
            device.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5 shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionTitle,
            {
              title: "Active Sessions",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-5 w-5" })
            }
          ),
          devicesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full rounded" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: devices.length > 0 ? `You have ${devices.length} active session${devices.length !== 1 ? "s" : ""}.` : "No active sessions found." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "destructive",
                  className: "w-full",
                  "data-ocid": "security.logout_all.open_modal_button",
                  disabled: devices.length === 0,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4 mr-2" }),
                    "Logout All Other Devices"
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "security.logout_all.dialog", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Logout all other devices?" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This will end all active sessions on other devices. You will remain signed in on this device." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "security.logout_all.cancel_button", children: "Cancel" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AlertDialogAction,
                    {
                      "data-ocid": "security.logout_all.confirm_button",
                      onClick: handleLogoutAll,
                      disabled: logoutAllLoading,
                      className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                      children: logoutAllLoading ? "Logging out..." : "Logout All"
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ] })
      ]
    }
  ) });
}
export {
  SecurityPage as default
};
