import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, f as ue } from "./index-BoYH-a4m.js";
import { L as Layout } from "./Layout-DyTGbA2S.js";
import { B as Button } from "./button-DXj5HeE2.js";
import { L as Label } from "./label-CBLHrnIN.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-5t566Auo.js";
import { S as Switch } from "./switch-CrIzQ4cc.js";
import { u as useBackendActor } from "./useBackend-FSH8Ysa0.js";
import { S as Settings } from "./settings-CaziLsJA.js";
import { G as Globe } from "./globe-DDM3hcyG.js";
import { B as Bell } from "./bell-DSWTbU_S.js";
import { A as Accessibility } from "./accessibility-4Oz1kowy.js";
import { C as CircleAlert } from "./circle-alert-CarhqOsL.js";
import "./input-BGHi7jlu.js";
import "./heart-qvi-jSMZ.js";
import "./x-Yn9x35TY.js";
import "./shield-BJahHKMQ.js";
import "./index-BGoXbzZj.js";
import "./index-BjTlUSa6.js";
import "./index-NruUtonI.js";
import "./Combination-DxUapp4-.js";
import "./index-sQmzYE_i.js";
import "./index-kbCWIHe_.js";
import "./backend-B2Q1poOu.js";
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
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
];
const Save = createLucideIcon("save", __iconNode);
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ur", label: "Urdu" },
  { value: "ar", label: "Arabic" },
  { value: "tr", label: "Turkish" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "bn", label: "Bengali" },
  { value: "hi", label: "Hindi" },
  { value: "fa", label: "Persian" },
  { value: "sw", label: "Swahili" }
];
const CURRENCIES = [
  { value: "USD", label: "USD 🇺🇸" },
  { value: "PKR", label: "PKR 🇵🇰" },
  { value: "SAR", label: "SAR 🇸🇦" },
  { value: "TRY", label: "TRY 🇹🇷" },
  { value: "AED", label: "AED 🇦🇪" },
  { value: "INR", label: "INR 🇮🇳" },
  { value: "GBP", label: "GBP 🇬🇧" }
];
const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "UTC-5 New York" },
  { value: "America/Chicago", label: "UTC-6 Chicago" },
  { value: "America/Denver", label: "UTC-7 Denver" },
  { value: "America/Los_Angeles", label: "UTC-8 Los Angeles" },
  { value: "America/Sao_Paulo", label: "UTC-3 São Paulo" },
  { value: "Europe/London", label: "UTC+0 London" },
  { value: "Europe/Paris", label: "UTC+1 Paris" },
  { value: "Europe/Berlin", label: "UTC+1 Berlin" },
  { value: "Europe/Istanbul", label: "UTC+3 Istanbul" },
  { value: "Europe/Moscow", label: "UTC+3 Moscow" },
  { value: "Africa/Cairo", label: "UTC+2 Cairo" },
  { value: "Africa/Lagos", label: "UTC+1 Lagos" },
  { value: "Africa/Nairobi", label: "UTC+3 Nairobi" },
  { value: "Asia/Dubai", label: "UTC+4 Dubai" },
  { value: "Asia/Karachi", label: "UTC+5 Karachi" },
  { value: "Asia/Kolkata", label: "UTC+5:30 Kolkata" },
  { value: "Asia/Dhaka", label: "UTC+6 Dhaka" },
  { value: "Asia/Bangkok", label: "UTC+7 Bangkok" },
  { value: "Asia/Shanghai", label: "UTC+8 Shanghai" },
  { value: "Asia/Tokyo", label: "UTC+9 Tokyo" },
  { value: "Australia/Sydney", label: "UTC+10 Sydney" },
  { value: "Pacific/Auckland", label: "UTC+12 Auckland" }
];
function applyTheme(t) {
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else if (t === "light") root.classList.remove("dark");
  else {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      root.classList.add("dark");
    else root.classList.remove("dark");
  }
}
function SectionHeader({
  icon,
  title
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-primary", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: title })
  ] });
}
function ToggleRow({
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
function SettingsPage() {
  const { actor, isFetching } = useBackendActor();
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [dirty, setDirty] = reactExports.useState(false);
  const [language, setLanguage] = reactExports.useState("en");
  const [theme, setTheme] = reactExports.useState("system");
  const [currencyDisplay, setCurrencyDisplay] = reactExports.useState("USD");
  const [timezone, setTimezone] = reactExports.useState("UTC");
  const [emailNotifications, setEmailNotifications] = reactExports.useState(true);
  const [inAppNotifications, setInAppNotifications] = reactExports.useState(true);
  const [weeklyDigest, setWeeklyDigest] = reactExports.useState(false);
  const [highContrast, setHighContrast] = reactExports.useState(false);
  const [largerText, setLargerText] = reactExports.useState(false);
  const [reducedAnimations, setReducedAnimations] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    actor.getUserSettings().then((s) => {
      if (s) {
        setLanguage(s.language || "en");
        setTheme(s.theme || "system");
        setCurrencyDisplay(s.currencyDisplay || "USD");
        setTimezone(s.timezone || "UTC");
        setEmailNotifications(s.emailNotifications);
        setInAppNotifications(s.inAppNotifications);
        setWeeklyDigest(s.weeklyDigest);
        setHighContrast(s.highContrast);
        setLargerText(s.largerText);
        setReducedAnimations(s.reducedAnimations);
      }
    }).catch(() => {
    }).finally(() => setLoading(false));
  }, [actor, isFetching]);
  const mark = () => setDirty(true);
  function handleThemeChange(val) {
    setTheme(val);
    applyTheme(val);
    mark();
  }
  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    try {
      await actor.updateUserSettings(
        language,
        theme,
        currencyDisplay,
        timezone,
        emailNotifications,
        inAppNotifications,
        weeklyDigest,
        highContrast,
        largerText,
        reducedAnimations
      );
      setDirty(false);
      ue.success("Settings saved successfully.");
    } catch {
      ue.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "max-w-xl mx-auto px-4 pt-6 pb-28",
      "data-ocid": "settings.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-6 w-6 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "Settings" })
        ] }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", "data-ocid": "settings.loading_state", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "rounded-2xl bg-card border border-border p-5 h-48 animate-pulse"
          },
          i
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SectionHeader,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-5 w-5" }),
                title: "Display"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "language", children: "Language" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: language,
                    onValueChange: (v) => {
                      setLanguage(v);
                      mark();
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SelectTrigger,
                        {
                          id: "language",
                          "data-ocid": "settings.language.select",
                          className: "w-full",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select language" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LANGUAGES.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: l.value, children: l.label }, l.value)) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Theme" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", "data-ocid": "settings.theme.toggle", children: ["light", "dark", "system"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleThemeChange(t),
                    className: `flex-1 py-2 px-3 text-sm rounded-xl border transition-colors duration-200 capitalize ${theme === t ? "bg-primary text-primary-foreground border-primary font-semibold" : "bg-background text-foreground border-border hover:border-primary/50"}`,
                    "data-ocid": `settings.theme.${t}`,
                    children: t.charAt(0).toUpperCase() + t.slice(1)
                  },
                  t
                )) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currency", children: "Currency Display" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: currencyDisplay,
                    onValueChange: (v) => {
                      setCurrencyDisplay(v);
                      mark();
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SelectTrigger,
                        {
                          id: "currency",
                          "data-ocid": "settings.currency.select",
                          className: "w-full",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select currency" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CURRENCIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.value, children: c.label }, c.value)) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "timezone", children: "Timezone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: timezone,
                    onValueChange: (v) => {
                      setTimezone(v);
                      mark();
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SelectTrigger,
                        {
                          id: "timezone",
                          "data-ocid": "settings.timezone.select",
                          className: "w-full",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select timezone" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-64", children: TIMEZONES.map((tz) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: tz.value, children: tz.label }, tz.value)) })
                    ]
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SectionHeader,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5" }),
                title: "Notifications"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ToggleRow,
              {
                label: "Email Notifications",
                description: "Receive important updates to your email",
                checked: emailNotifications,
                onCheckedChange: (v) => {
                  setEmailNotifications(v);
                  mark();
                },
                ocid: "settings.email_notifications.switch"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ToggleRow,
              {
                label: "In-App Notifications",
                description: "Show notifications inside the platform",
                checked: inAppNotifications,
                onCheckedChange: (v) => {
                  setInAppNotifications(v);
                  mark();
                },
                ocid: "settings.inapp_notifications.switch"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ToggleRow,
              {
                label: "Weekly Digest",
                description: "A weekly summary of platform activity",
                checked: weeklyDigest,
                onCheckedChange: (v) => {
                  setWeeklyDigest(v);
                  mark();
                },
                ocid: "settings.weekly_digest.switch"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SectionHeader,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Accessibility, { className: "h-5 w-5" }),
                title: "Accessibility"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ToggleRow,
              {
                label: "High Contrast Mode",
                description: "Increase contrast for better readability",
                checked: highContrast,
                onCheckedChange: (v) => {
                  setHighContrast(v);
                  mark();
                },
                ocid: "settings.high_contrast.switch"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ToggleRow,
              {
                label: "Larger Text",
                description: "Increase base font size across the platform",
                checked: largerText,
                onCheckedChange: (v) => {
                  setLargerText(v);
                  mark();
                },
                ocid: "settings.larger_text.switch"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ToggleRow,
              {
                label: "Reduced Animations",
                description: "Minimize motion for a calmer experience",
                checked: reducedAnimations,
                onCheckedChange: (v) => {
                  setReducedAnimations(v);
                  mark();
                },
                ocid: "settings.reduced_animations.switch"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 pt-1", children: [
            dirty ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-orange-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5" }),
              "Unsaved changes"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handleSave,
                disabled: saving || !dirty,
                className: "min-w-[130px]",
                "data-ocid": "settings.save_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
                  saving ? "Saving..." : "Save All"
                ]
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
export {
  SettingsPage as default
};
