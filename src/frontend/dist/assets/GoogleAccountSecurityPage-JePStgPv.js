import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, f as ue } from "./index-BoYH-a4m.js";
import { L as Layout } from "./Layout-DyTGbA2S.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-BGakG8yP.js";
import { B as Badge } from "./badge-BcZEG4YE.js";
import { B as Button } from "./button-DXj5HeE2.js";
import { u as useBackendActor } from "./useBackend-FSH8Ysa0.js";
import { K as KeyRound } from "./key-round-DHIZA2Nd.js";
import { C as CircleCheck } from "./circle-check-owHgi_vk.js";
import { S as Shield } from "./shield-BJahHKMQ.js";
import { L as LogOut } from "./log-out-D6H8SlWf.js";
import "./input-BGHi7jlu.js";
import "./heart-qvi-jSMZ.js";
import "./bell-DSWTbU_S.js";
import "./x-Yn9x35TY.js";
import "./index-BjTlUSa6.js";
import "./index-C4hmo236.js";
import "./index-sQmzYE_i.js";
import "./Combination-DxUapp4-.js";
import "./index-D2a02oHk.js";
import "./backend-B2Q1poOu.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
];
const Info = createLucideIcon("info", __iconNode);
function GoogleAccountSecurityPage() {
  const { actor, isFetching } = useBackendActor();
  const [profile, setProfile] = reactExports.useState(null);
  const [logoutLoading, setLogoutLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    actor.getCallerUserProfile().then((p) => setProfile(p ?? null)).catch(() => setProfile(null));
  }, [actor, isFetching]);
  const handleSignOutAll = async () => {
    if (!actor) return;
    setLogoutLoading(true);
    try {
      const count = await actor.logoutAllOtherDevices();
      ue.success(
        `Signed out of ${Number(count)} other device${Number(count) !== 1 ? "s" : ""}.`
      );
    } catch {
      ue.error("Failed to sign out. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "max-w-xl mx-auto px-4 pt-6 pb-24",
      "data-ocid": "google-account-security.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-6 w-6 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "Account Security" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-card border border-border p-5 mb-4 shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 48 48", className: "h-7 w-7", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                fill: "#EA4335",
                d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                fill: "#4285F4",
                d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                fill: "#FBBC05",
                d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                fill: "#34A853",
                d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground text-sm", children: (profile == null ? void 0 : profile.fullName) ?? "Your Account" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1" }),
                "Connected via Google"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 truncate", children: (profile == null ? void 0 : profile.email) ?? "Loading..." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5 mb-4 shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-base font-semibold text-foreground", children: "Manage your Google Login" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Your account is secured by Google. To change your password or manage login methods, visit your Google Account settings." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              className: "w-full gap-2",
              "data-ocid": "google-account-security.open_google_button",
              onClick: () => window.open(
                "https://myaccount.google.com/security",
                "_blank",
                "noopener,noreferrer"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
                "Open Google Security Settings"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-muted/50 border border-border p-5 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-5 w-5 text-primary mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-base font-semibold text-foreground mb-1", children: "Google Recovery Options" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              "Recovery options such as a backup phone number, backup email, and recovery codes are managed through your Google Account. Visit",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: "https://myaccount.google.com/security",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-primary underline-offset-2 hover:underline",
                  children: "myaccount.google.com"
                }
              ),
              " ",
              "to update these settings."
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5 shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-5 w-5 text-destructive" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-base font-semibold text-foreground", children: "Sign out of all devices" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "This will end all active sessions on other devices. You will remain signed in on this device." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "destructive",
                className: "w-full",
                "data-ocid": "google-account-security.logout_all.open_modal_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4 mr-2" }),
                  "Sign out of all other devices"
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "google-account-security.logout_all.dialog", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Sign out of all other devices?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This will end all active sessions on other devices. You will remain signed in on this device." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "google-account-security.logout_all.cancel_button", children: "Cancel" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  AlertDialogAction,
                  {
                    "data-ocid": "google-account-security.logout_all.confirm_button",
                    onClick: handleSignOutAll,
                    disabled: logoutLoading,
                    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                    children: logoutLoading ? "Signing out..." : "Sign out"
                  }
                )
              ] })
            ] })
          ] })
        ] })
      ]
    }
  ) });
}
export {
  GoogleAccountSecurityPage as default
};
