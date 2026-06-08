import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, f as ue } from "./index-BoYH-a4m.js";
import { L as Layout } from "./Layout-DyTGbA2S.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-BGakG8yP.js";
import { B as Button } from "./button-DXj5HeE2.js";
import { L as Label } from "./label-CBLHrnIN.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-5t566Auo.js";
import { S as Switch } from "./switch-CrIzQ4cc.js";
import { u as useBackendActor } from "./useBackend-FSH8Ysa0.js";
import { L as Lock } from "./lock-Ckm8ZJJy.js";
import { B as Bell } from "./bell-DSWTbU_S.js";
import { T as Trash2 } from "./trash-2-74HxVmBv.js";
import "./input-BGHi7jlu.js";
import "./heart-qvi-jSMZ.js";
import "./x-Yn9x35TY.js";
import "./shield-BJahHKMQ.js";
import "./index-BjTlUSa6.js";
import "./index-C4hmo236.js";
import "./index-sQmzYE_i.js";
import "./Combination-DxUapp4-.js";
import "./index-D2a02oHk.js";
import "./index-BGoXbzZj.js";
import "./index-NruUtonI.js";
import "./index-kbCWIHe_.js";
import "./backend-B2Q1poOu.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
  ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
  ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
];
const Database = createLucideIcon("database", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Eye = createLucideIcon("eye", __iconNode);
function SectionHeader({
  icon,
  title
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-primary", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: title })
  ] });
}
function CheckRow({
  label,
  description,
  checked,
  onCheckedChange,
  ocid
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 py-3 border-b border-border last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: label }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Switch,
      {
        checked,
        onCheckedChange,
        "data-ocid": ocid
      }
    )
  ] });
}
function PrivacyPage() {
  const { actor, isFetching } = useBackendActor();
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [downloadLoading, setDownloadLoading] = reactExports.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = reactExports.useState("");
  const [profileVisibility, setProfileVisibility] = reactExports.useState("public");
  const [countryVisibility, setCountryVisibility] = reactExports.useState(true);
  const [activityVisibility, setActivityVisibility] = reactExports.useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = reactExports.useState(true);
  const [inAppNotificationsEnabled, setInAppNotificationsEnabled] = reactExports.useState(true);
  const [caseUpdatesEnabled, setCaseUpdatesEnabled] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    actor.getPrivacySettings().then((s) => {
      if (s) {
        setProfileVisibility(s.profileVisibility || "public");
        setCountryVisibility(s.countryVisibility);
        setActivityVisibility(s.activityVisibility);
        setEmailNotificationsEnabled(s.emailNotificationsEnabled);
        setInAppNotificationsEnabled(s.inAppNotificationsEnabled);
        setCaseUpdatesEnabled(s.caseUpdatesEnabled);
      }
    }).catch(() => {
    }).finally(() => setLoading(false));
  }, [actor, isFetching]);
  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    try {
      await actor.updatePrivacySettings(
        profileVisibility,
        countryVisibility,
        activityVisibility,
        emailNotificationsEnabled,
        inAppNotificationsEnabled,
        caseUpdatesEnabled
      );
      ue.success("Privacy settings saved.");
    } catch {
      ue.error("Failed to save privacy settings.");
    } finally {
      setSaving(false);
    }
  }
  async function handleDataDownload() {
    if (!actor) return;
    setDownloadLoading(true);
    try {
      const msg = await actor.requestDataDownload();
      ue.success(
        msg || "Data download request submitted. We will email you within 48 hours."
      );
    } catch {
      ue.error("Failed to request data download.");
    } finally {
      setDownloadLoading(false);
    }
  }
  async function handleAccountDeletion() {
    if (!actor) return;
    try {
      const msg = await actor.requestAccountDeletion();
      ue.success(
        msg || "Account deletion requested. Your account will be deleted after a 30-day grace period."
      );
      setTimeout(() => {
        window.location.href = "/";
      }, 3e3);
    } catch {
      ue.error("Failed to request account deletion.");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "max-w-xl mx-auto px-4 pt-6 pb-28",
      "data-ocid": "privacy.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-6 w-6 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "Privacy Settings" })
        ] }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", "data-ocid": "privacy.loading_state", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "rounded-2xl bg-card border border-border p-5 h-40 animate-pulse"
          },
          i
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SectionHeader,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-5 w-5" }),
                title: "Visibility Controls"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "profile-visibility", children: "Profile Visibility" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: profileVisibility,
                    onValueChange: setProfileVisibility,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SelectTrigger,
                        {
                          id: "profile-visibility",
                          "data-ocid": "privacy.profile_visibility.select",
                          className: "w-full",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select visibility" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "public", children: "Public — Anyone can view your profile" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "friends", children: "Friends Only — Only your connections" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "private", children: "Private — Only you can see your profile" })
                      ] })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                CheckRow,
                {
                  label: "Country Visibility",
                  description: "Show your country to others on the platform",
                  checked: countryVisibility,
                  onCheckedChange: setCountryVisibility,
                  ocid: "privacy.country_visibility.switch"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                CheckRow,
                {
                  label: "Activity Visibility",
                  description: "Show your support history publicly",
                  checked: activityVisibility,
                  onCheckedChange: setActivityVisibility,
                  ocid: "privacy.activity_visibility.switch"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SectionHeader,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5" }),
                title: "Notification Preferences"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CheckRow,
              {
                label: "Email Notifications",
                description: "Receive case and account updates by email",
                checked: emailNotificationsEnabled,
                onCheckedChange: setEmailNotificationsEnabled,
                ocid: "privacy.email_notifications.switch"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CheckRow,
              {
                label: "In-App Notifications",
                description: "Show notifications inside the platform",
                checked: inAppNotificationsEnabled,
                onCheckedChange: setInAppNotificationsEnabled,
                ocid: "privacy.inapp_notifications.switch"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CheckRow,
              {
                label: "Case Updates",
                description: "Notify when a case you follow changes status",
                checked: caseUpdatesEnabled,
                onCheckedChange: setCaseUpdatesEnabled,
                ocid: "privacy.case_updates.switch"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleSave,
              disabled: saving,
              className: "min-w-[140px]",
              "data-ocid": "privacy.save_button",
              children: saving ? "Saving..." : "Save Changes"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SectionHeader,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-5 w-5" }),
                title: "Data & Account"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl bg-muted/40 border border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground mb-1", children: "Request Data Download" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "We will prepare your data and email it to you within 48 hours." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    onClick: handleDataDownload,
                    disabled: downloadLoading,
                    className: "border-primary text-primary hover:bg-primary/10",
                    "data-ocid": "privacy.data_download.button",
                    children: downloadLoading ? "Requesting..." : "Request Data Download"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl bg-destructive/5 border border-destructive/20", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground mb-1", children: "Request Account Deletion" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "This permanently deletes your account after a 30-day grace period." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      variant: "destructive",
                      "data-ocid": "privacy.delete_account.open_modal_button",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                        "Request Account Deletion"
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "privacy.delete_account.dialog", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete your account?" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                        "This will permanently delete your account and all associated data after a 30-day grace period. Type",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "DELETE" }),
                        " below to confirm."
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "text",
                        value: deleteConfirmText,
                        onChange: (e) => setDeleteConfirmText(e.target.value),
                        placeholder: "Type DELETE to confirm",
                        className: "w-full mt-2 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary",
                        "data-ocid": "privacy.delete_account.input"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        AlertDialogCancel,
                        {
                          onClick: () => setDeleteConfirmText(""),
                          "data-ocid": "privacy.delete_account.cancel_button",
                          children: "Cancel"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        AlertDialogAction,
                        {
                          disabled: deleteConfirmText !== "DELETE",
                          onClick: handleAccountDeletion,
                          className: "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50",
                          "data-ocid": "privacy.delete_account.confirm_button",
                          children: "Delete My Account"
                        }
                      )
                    ] })
                  ] })
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
  PrivacyPage as default
};
