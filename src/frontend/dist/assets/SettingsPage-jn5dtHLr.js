import { w as createLucideIcon, r as reactExports, l as jsxRuntimeExports, Z as cn, e as useAuth, T as getUserSettings, aK as updateUserSettings, p as ue } from "./main-XWGl9bfu.js";
import { L as Layout, S as Settings } from "./Layout-B37pWsjx.js";
import { u as useComposedRefs, B as Button } from "./button-QyTBuXi2.js";
import { L as Label } from "./label-CIqc7hSc.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BTmoliKO.js";
import { c as composeEventHandlers, a as useControllableState } from "./index-5X8hNaAw.js";
import { c as createContextScope } from "./index-CSocGDoZ.js";
import { u as useSize } from "./index-COEGIzpx.js";
import { P as Primitive } from "./index-DN9KZDz1.js";
import { G as Globe } from "./globe-C1ALVPjQ.js";
import { B as Bell } from "./message-circle-Cc089LoD.js";
import { A as Accessibility } from "./accessibility-D1cZv8DF.js";
import { C as CircleAlert } from "./circle-alert-CvD11aZh.js";
import "./users-DwDKFISD.js";
import "./x-DZawEjNS.js";
import "./heart-Br4iiKEI.js";
import "./index-DWWQzNyi.js";
import "./Combination-VjWgoRzP.js";
import "./chevron-down-DlKgqB3T.js";
import "./check-gsHmgI_k.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Save = createLucideIcon("Save", [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
]);
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var SWITCH_NAME = "Switch";
var [createSwitchContext, createSwitchScope] = createContextScope(SWITCH_NAME);
var [SwitchProviderImpl, useSwitchContext] = createSwitchContext(SWITCH_NAME);
function SwitchProvider(props) {
  const {
    __scopeSwitch,
    checked: checkedProp,
    children,
    defaultChecked,
    disabled,
    form,
    name,
    onCheckedChange,
    required,
    value = "on",
    // @ts-expect-error
    internal_do_not_use_render
  } = props;
  const [checked, setChecked] = useControllableState({
    prop: checkedProp,
    defaultProp: defaultChecked ?? false,
    onChange: onCheckedChange,
    caller: SWITCH_NAME
  });
  const [control, setControl] = reactExports.useState(null);
  const [bubbleInput, setBubbleInput] = reactExports.useState(null);
  const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
  const [userInteractionCount, onUserInteraction] = reactExports.useReducer(
    (count) => count + 1,
    0
  );
  const isFormControl = control ? !!form || !!control.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    true
  );
  const context = {
    checked,
    setChecked,
    disabled,
    control,
    setControl,
    name,
    form,
    value,
    hasConsumerStoppedPropagationRef,
    userInteractionCount,
    onUserInteraction,
    required,
    defaultChecked,
    isFormControl,
    bubbleInput,
    setBubbleInput
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SwitchProviderImpl, { scope: __scopeSwitch, ...context, children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children });
}
__name(SwitchProvider, "SwitchProvider");
var TRIGGER_NAME = "SwitchTrigger";
var SwitchTrigger = /* @__PURE__ */ reactExports.forwardRef(
  /* @__PURE__ */ __name(function SwitchTrigger2({ __scopeSwitch, onClick, ...switchProps }, forwardedRef) {
    const {
      control,
      form,
      value,
      disabled,
      checked,
      required,
      setControl,
      setChecked,
      hasConsumerStoppedPropagationRef,
      onUserInteraction,
      isFormControl,
      bubbleInput
    } = useSwitchContext(TRIGGER_NAME, __scopeSwitch);
    const composedRefs = useComposedRefs(forwardedRef, setControl);
    const initialCheckedStateRef = reactExports.useRef(checked);
    reactExports.useEffect(() => {
      const associatedForm = form ? control == null ? void 0 : control.ownerDocument.getElementById(form) : control == null ? void 0 : control.form;
      if (associatedForm instanceof HTMLFormElement) {
        const reset = /* @__PURE__ */ __name(() => setChecked(initialCheckedStateRef.current), "reset");
        associatedForm.addEventListener("reset", reset);
        return () => associatedForm.removeEventListener("reset", reset);
      }
    }, [control, form, setChecked]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        role: "switch",
        "aria-checked": checked,
        "aria-required": required,
        "data-state": getState(checked),
        "data-disabled": disabled ? "" : void 0,
        disabled,
        value,
        ...switchProps,
        ref: composedRefs,
        onClick: composeEventHandlers(onClick, (event) => {
          onUserInteraction();
          setChecked((prevChecked) => !prevChecked);
          if (bubbleInput && isFormControl) {
            hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
            if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
          }
        })
      }
    );
  }, "SwitchTrigger")
);
var Switch$1 = /* @__PURE__ */ reactExports.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name(function Switch2(props, forwardedRef) {
    const {
      __scopeSwitch,
      name,
      checked,
      defaultChecked,
      required,
      disabled,
      value,
      onCheckedChange,
      form,
      ...switchProps
    } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwitchProvider,
      {
        __scopeSwitch,
        checked,
        defaultChecked,
        disabled,
        required,
        onCheckedChange,
        name,
        form,
        value,
        internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SwitchTrigger,
            {
              ...switchProps,
              ref: forwardedRef,
              __scopeSwitch
            }
          ),
          isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            SwitchBubbleInput,
            {
              __scopeSwitch
            }
          )
        ] })
      }
    );
  }, "Switch")
);
var THUMB_NAME = "SwitchThumb";
var SwitchThumb = /* @__PURE__ */ reactExports.forwardRef(
  /* @__PURE__ */ __name(function SwitchThumb2(props, forwardedRef) {
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...thumbProps,
        ref: forwardedRef
      }
    );
  }, "SwitchThumb")
);
var BUBBLE_INPUT_NAME = "SwitchBubbleInput";
var SwitchBubbleInput = /* @__PURE__ */ reactExports.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name(function SwitchBubbleInput2({ __scopeSwitch, onClick, ...props }, forwardedRef) {
    const {
      control,
      hasConsumerStoppedPropagationRef,
      userInteractionCount,
      checked,
      defaultChecked,
      required,
      disabled,
      name,
      value,
      form,
      bubbleInput,
      setBubbleInput
    } = useSwitchContext(BUBBLE_INPUT_NAME, __scopeSwitch);
    const composedRefs = useComposedRefs(forwardedRef, setBubbleInput);
    const controlSize = useSize(control);
    const shouldStopClickPropagationRef = reactExports.useRef(false);
    const prevCheckedRef = reactExports.useRef(checked);
    const prevUserInteractionCountRef = reactExports.useRef(userInteractionCount);
    reactExports.useEffect(() => {
      const input = bubbleInput;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      const isUserInteraction = userInteractionCount !== prevUserInteractionCountRef.current;
      prevUserInteractionCountRef.current = userInteractionCount;
      const checkedChanged = prevCheckedRef.current !== checked;
      prevCheckedRef.current = checked;
      const bubbles = !(isUserInteraction && hasConsumerStoppedPropagationRef.current);
      if (checkedChanged && setChecked) {
        shouldStopClickPropagationRef.current = !isUserInteraction;
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
        shouldStopClickPropagationRef.current = false;
      }
    }, [bubbleInput, checked, hasConsumerStoppedPropagationRef, userInteractionCount]);
    const defaultCheckedRef = reactExports.useRef(checked);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.input,
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: defaultChecked ?? defaultCheckedRef.current,
        required,
        disabled,
        name,
        value,
        form,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        onClick: composeEventHandlers(onClick, (event) => {
          if (shouldStopClickPropagationRef.current) {
            event.stopPropagation();
          }
        }),
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          transform: "translateX(-100%)"
        }
      }
    );
  }, "SwitchBubbleInput")
);
function isFunction(value) {
  return typeof value === "function";
}
__name(isFunction, "isFunction");
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
__name(getState, "getState");
function Switch({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Switch$1,
    {
      "data-slot": "switch",
      className: cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        SwitchThumb,
        {
          "data-slot": "switch-thumb",
          className: cn(
            "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
          )
        }
      )
    }
  );
}
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
  { value: "sw", label: "Swahili" },
  { value: "zh", label: "Chinese" },
  { value: "ru", label: "Russian" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" }
];
const CURRENCIES = [
  { value: "USD", label: "USD 🇺🇸 US Dollar" },
  { value: "PKR", label: "PKR 🇵🇰 Pakistani Rupee" },
  { value: "SAR", label: "SAR 🇸🇦 Saudi Riyal" },
  { value: "AED", label: "AED 🇦🇪 UAE Dirham" },
  { value: "GBP", label: "GBP 🇬🇧 British Pound" },
  { value: "EUR", label: "EUR 🇪🇺 Euro" },
  { value: "INR", label: "INR 🇮🇳 Indian Rupee" },
  { value: "TRY", label: "TRY 🇹🇷 Turkish Lira" },
  { value: "BDT", label: "BDT 🇧🇩 Bangladeshi Taka" },
  { value: "EGP", label: "EGP 🇪🇬 Egyptian Pound" },
  { value: "NGN", label: "NGN 🇳🇬 Nigerian Naira" },
  { value: "KES", label: "KES 🇰🇪 Kenyan Shilling" },
  { value: "ZAR", label: "ZAR 🇿🇦 South African Rand" },
  { value: "BRL", label: "BRL 🇧🇷 Brazilian Real" },
  { value: "CAD", label: "CAD 🇨🇦 Canadian Dollar" },
  { value: "AUD", label: "AUD 🇦🇺 Australian Dollar" },
  { value: "JPY", label: "JPY 🇯🇵 Japanese Yen" },
  { value: "CNY", label: "CNY 🇨🇳 Chinese Yuan" },
  { value: "KRW", label: "KRW 🇰🇷 South Korean Won" },
  { value: "IDR", label: "IDR 🇮🇩 Indonesian Rupiah" },
  { value: "MYR", label: "MYR 🇲🇾 Malaysian Ringgit" },
  { value: "THB", label: "THB 🇹🇭 Thai Baht" },
  { value: "PHP", label: "PHP 🇵🇭 Philippine Peso" },
  { value: "VND", label: "VND 🇻🇳 Vietnamese Dong" },
  { value: "SGD", label: "SGD 🇸🇬 Singapore Dollar" },
  { value: "HKD", label: "HKD 🇭🇰 Hong Kong Dollar" },
  { value: "NZD", label: "NZD 🇳🇿 New Zealand Dollar" },
  { value: "CHF", label: "CHF 🇨🇭 Swiss Franc" },
  { value: "SEK", label: "SEK 🇸🇪 Swedish Krona" },
  { value: "NOK", label: "NOK 🇳🇴 Norwegian Krone" },
  { value: "DKK", label: "DKK 🇩🇰 Danish Krone" },
  { value: "RUB", label: "RUB 🇷🇺 Russian Ruble" },
  { value: "UAH", label: "UAH 🇺🇦 Ukrainian Hryvnia" },
  { value: "PLN", label: "PLN 🇵🇱 Polish Zloty" },
  { value: "CZK", label: "CZK 🇨🇿 Czech Koruna" },
  { value: "HUF", label: "HUF 🇭🇺 Hungarian Forint" },
  { value: "RON", label: "RON 🇷🇴 Romanian Leu" },
  { value: "ILS", label: "ILS 🇮🇱 Israeli Shekel" },
  { value: "QAR", label: "QAR 🇶🇦 Qatari Riyal" },
  { value: "KWD", label: "KWD 🇰🇼 Kuwaiti Dinar" },
  { value: "BHD", label: "BHD 🇧🇭 Bahraini Dinar" },
  { value: "OMR", label: "OMR 🇴🇲 Omani Rial" },
  { value: "JOD", label: "JOD 🇯🇴 Jordanian Dinar" },
  { value: "LBP", label: "LBP 🇱🇧 Lebanese Pound" },
  { value: "IQD", label: "IQD 🇮🇶 Iraqi Dinar" },
  { value: "IRR", label: "IRR 🇮🇷 Iranian Rial" },
  { value: "AFN", label: "AFN 🇦🇫 Afghan Afghani" },
  { value: "NPR", label: "NPR 🇳🇵 Nepalese Rupee" },
  { value: "LKR", label: "LKR 🇱🇰 Sri Lankan Rupee" },
  { value: "MMK", label: "MMK 🇲🇲 Myanmar Kyat" },
  { value: "KHR", label: "KHR 🇰🇭 Cambodian Riel" },
  { value: "MXN", label: "MXN 🇲🇽 Mexican Peso" },
  { value: "COP", label: "COP 🇨🇴 Colombian Peso" },
  { value: "ARS", label: "ARS 🇦🇷 Argentine Peso" },
  { value: "CLP", label: "CLP 🇨🇱 Chilean Peso" },
  { value: "PEN", label: "PEN 🇵🇪 Peruvian Sol" },
  { value: "UYU", label: "UYU 🇺🇾 Uruguayan Peso" },
  { value: "GHS", label: "GHS 🇬🇭 Ghanaian Cedi" },
  { value: "TZS", label: "TZS 🇹🇿 Tanzanian Shilling" },
  { value: "UGX", label: "UGX 🇺🇬 Ugandan Shilling" },
  { value: "ETB", label: "ETB 🇪🇹 Ethiopian Birr" },
  { value: "MAD", label: "MAD 🇲🇦 Moroccan Dirham" },
  { value: "TND", label: "TND 🇹🇳 Tunisian Dinar" },
  { value: "DZD", label: "DZD 🇩🇿 Algerian Dinar" },
  { value: "SDG", label: "SDG 🇸🇩 Sudanese Pound" },
  { value: "LYD", label: "LYD 🇱🇾 Libyan Dinar" }
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
function SettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = reactExports.useState(false);
  const [dirty, setDirty] = reactExports.useState(false);
  const [language, setLanguage] = reactExports.useState("en");
  const [theme, setTheme] = reactExports.useState("light");
  const [currency, setCurrency] = reactExports.useState("USD");
  const [timezone, setTimezone] = reactExports.useState("UTC");
  const [emailNotif, setEmailNotif] = reactExports.useState(true);
  const [inAppNotif, setInAppNotif] = reactExports.useState(true);
  const [weeklyDigest, setWeeklyDigest] = reactExports.useState(false);
  const [highContrast, setHighContrast] = reactExports.useState(false);
  const [largerText, setLargerText] = reactExports.useState(false);
  const [reducedAnimations, setReducedAnimations] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!user) return;
    loadSettings();
  }, [user]);
  async function loadSettings() {
    try {
      const data = await getUserSettings(user.id);
      if (data) {
        setLanguage(data.language ?? "en");
        setTheme(data.theme ?? "light");
        setCurrency(data.currency ?? "USD");
        setTimezone(data.timezone ?? "UTC");
        setEmailNotif(data.email_notifications === void 0 ? true : Boolean(data.email_notifications));
        setInAppNotif(data.inapp_notifications === void 0 ? true : Boolean(data.inapp_notifications));
        setWeeklyDigest(data.weekly_digest === void 0 ? false : Boolean(data.weekly_digest));
        setHighContrast(data.high_contrast === void 0 ? false : Boolean(data.high_contrast));
        setLargerText(data.larger_text === void 0 ? false : Boolean(data.larger_text));
        setReducedAnimations(data.reduced_animations === void 0 ? false : Boolean(data.reduced_animations));
        applyTheme(data.theme ?? "light");
      }
    } catch (e) {
    }
  }
  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        language,
        theme,
        currency,
        timezone,
        email_notifications: emailNotif,
        inapp_notifications: inAppNotif,
        weekly_digest: weeklyDigest,
        high_contrast: highContrast,
        larger_text: largerText,
        reduced_animations: reducedAnimations,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const saved = await updateUserSettings(user.id, payload);
      if (!saved || saved.user_id !== user.id) throw new Error("Settings were not persisted");
      setLanguage(saved.language ?? language);
      setTheme(saved.theme ?? theme);
      setCurrency(saved.currency ?? currency);
      setTimezone(saved.timezone ?? timezone);
      setEmailNotif(saved.email_notifications === void 0 ? emailNotif : Boolean(saved.email_notifications));
      setInAppNotif(saved.inapp_notifications === void 0 ? inAppNotif : Boolean(saved.inapp_notifications));
      setWeeklyDigest(saved.weekly_digest === void 0 ? weeklyDigest : Boolean(saved.weekly_digest));
      setHighContrast(saved.high_contrast === void 0 ? highContrast : Boolean(saved.high_contrast));
      setLargerText(saved.larger_text === void 0 ? largerText : Boolean(saved.larger_text));
      setReducedAnimations(saved.reduced_animations === void 0 ? reducedAnimations : Boolean(saved.reduced_animations));
      applyTheme(saved.theme ?? theme);
      setDirty(false);
      ue.success("Settings saved successfully!");
    } catch (err) {
      ue.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }
  const mark = () => setDirty(true);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl mx-auto px-4 pt-6 pb-28", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-6 w-6 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Settings" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Display" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Language" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: language,
                onValueChange: (v) => {
                  setLanguage(v);
                  mark();
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-64", children: LANGUAGES.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: l.value, children: l.label }, l.value)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Theme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["light", "dark", "system"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setTheme(t);
                  applyTheme(t);
                  mark();
                },
                className: `flex-1 py-2 px-3 text-sm rounded-xl border capitalize ${theme === t ? "bg-primary text-white border-primary font-semibold" : "bg-background border-border"}`,
                children: t
              },
              t
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Currency Display" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: currency,
                onValueChange: (v) => {
                  setCurrency(v);
                  mark();
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-64", children: CURRENCIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.value, children: c.label }, c.value)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Timezone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: timezone,
                onValueChange: (v) => {
                  setTimezone(v);
                  mark();
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-64", children: TIMEZONES.map((tz) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: tz.value, children: tz.label }, tz.value)) })
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Notifications" })
        ] }),
        [
          {
            label: "Email Notifications",
            desc: "Receive important updates to your email",
            val: emailNotif,
            set: setEmailNotif
          },
          {
            label: "In-App Notifications",
            desc: "Show notifications inside the platform",
            val: inAppNotif,
            set: setInAppNotif
          },
          {
            label: "Weekly Digest",
            desc: "A weekly summary of platform activity",
            val: weeklyDigest,
            set: setWeeklyDigest
          }
        ].map(({ label, desc, val, set }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-start justify-between gap-4 py-3 border-b border-border last:border-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: desc })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: val,
                  onCheckedChange: (v) => {
                    set(v);
                    mark();
                  }
                }
              )
            ]
          },
          label
        ))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Accessibility, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Accessibility" })
        ] }),
        [
          {
            label: "High Contrast Mode",
            desc: "Increase contrast for better readability",
            val: highContrast,
            set: setHighContrast
          },
          {
            label: "Larger Text",
            desc: "Increase base font size across the platform",
            val: largerText,
            set: setLargerText
          },
          {
            label: "Reduced Animations",
            desc: "Minimize motion for a calmer experience",
            val: reducedAnimations,
            set: setReducedAnimations
          }
        ].map(({ label, desc, val, set }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-start justify-between gap-4 py-3 border-b border-border last:border-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: desc })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: val,
                  onCheckedChange: (v) => {
                    set(v);
                    mark();
                  }
                }
              )
            ]
          },
          label
        ))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 pt-1", children: [
        dirty ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-orange-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5" }),
          " Unsaved changes"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleSave,
            disabled: saving || !dirty,
            className: "min-w-[130px]",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
              saving ? "Saving..." : "Save All"
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
export {
  SettingsPage as default
};
