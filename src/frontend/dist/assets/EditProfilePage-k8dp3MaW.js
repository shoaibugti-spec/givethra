import { c as createLucideIcon, s as shimExports, r as reactExports, j as jsxRuntimeExports, d as cn, a as useAuth, u as useNavigate, h as useQueryClient, g as getBackendActor, U as User, b as LoadingSpinner, f as ue } from "./index-C7ZxjHlS.js";
import { c as createContextScope } from "./index--e3bBEMH.js";
import { u as useCallbackRef, a as useLayoutEffect2 } from "./index-CaBAJ_1p.js";
import { P as Primitive } from "./index-CgtCr000.js";
import { B as Badge } from "./badge-CwN3900c.js";
import { B as Button } from "./button-QIYvq4xc.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-BjpepsnO.js";
import { I as Input } from "./input-EIAk_KSS.js";
import { L as Label } from "./label-_UINz3UF.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, C as Check } from "./select-CVli9Hvl.js";
import { T as Textarea } from "./textarea-DknICY5B.js";
import { u as useQuery } from "./useQuery-Cb3pY6Kz.js";
import { u as useMutation } from "./useMutation-CfiX8LE0.js";
import { A as ArrowLeft } from "./arrow-left-D0_Gltp_.js";
import { L as LoaderCircle } from "./loader-circle-BcakTLIE.js";
import { M as MapPin } from "./map-pin-CXGl91yn.js";
import { P as Phone } from "./phone-BesfN5n8.js";
import { G as Globe } from "./globe-Csd0KhN9.js";
import "./index-DIHmeXX3.js";
import "./Combination-Ci1LmzzH.js";
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
      d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
      key: "1tc9qg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode);
function useIsHydrated() {
  return shimExports.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
function subscribe() {
  return () => {
  };
}
var AVATAR_NAME = "Avatar";
var [createAvatarContext] = createContextScope(AVATAR_NAME);
var [AvatarProvider, useAvatarContext] = createAvatarContext(AVATAR_NAME);
var Avatar$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, ...avatarProps } = props;
    const [imageLoadingStatus, setImageLoadingStatus] = reactExports.useState("idle");
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AvatarProvider,
      {
        scope: __scopeAvatar,
        imageLoadingStatus,
        onImageLoadingStatusChange: setImageLoadingStatus,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...avatarProps, ref: forwardedRef })
      }
    );
  }
);
Avatar$1.displayName = AVATAR_NAME;
var IMAGE_NAME = "AvatarImage";
var AvatarImage$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, src, onLoadingStatusChange = () => {
    }, ...imageProps } = props;
    const context = useAvatarContext(IMAGE_NAME, __scopeAvatar);
    const imageLoadingStatus = useImageLoadingStatus(src, imageProps);
    const handleLoadingStatusChange = useCallbackRef((status) => {
      onLoadingStatusChange(status);
      context.onImageLoadingStatusChange(status);
    });
    useLayoutEffect2(() => {
      if (imageLoadingStatus !== "idle") {
        handleLoadingStatusChange(imageLoadingStatus);
      }
    }, [imageLoadingStatus, handleLoadingStatusChange]);
    return imageLoadingStatus === "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.img, { ...imageProps, ref: forwardedRef, src }) : null;
  }
);
AvatarImage$1.displayName = IMAGE_NAME;
var FALLBACK_NAME = "AvatarFallback";
var AvatarFallback$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, delayMs, ...fallbackProps } = props;
    const context = useAvatarContext(FALLBACK_NAME, __scopeAvatar);
    const [canRender, setCanRender] = reactExports.useState(delayMs === void 0);
    reactExports.useEffect(() => {
      if (delayMs !== void 0) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs);
        return () => window.clearTimeout(timerId);
      }
    }, [delayMs]);
    return canRender && context.imageLoadingStatus !== "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...fallbackProps, ref: forwardedRef }) : null;
  }
);
AvatarFallback$1.displayName = FALLBACK_NAME;
function resolveLoadingStatus(image, src) {
  if (!image) {
    return "idle";
  }
  if (!src) {
    return "error";
  }
  if (image.src !== src) {
    image.src = src;
  }
  return image.complete && image.naturalWidth > 0 ? "loaded" : "loading";
}
function useImageLoadingStatus(src, { referrerPolicy, crossOrigin }) {
  const isHydrated = useIsHydrated();
  const imageRef = reactExports.useRef(null);
  const image = (() => {
    if (!isHydrated) return null;
    if (!imageRef.current) {
      imageRef.current = new window.Image();
    }
    return imageRef.current;
  })();
  const [loadingStatus, setLoadingStatus] = reactExports.useState(
    () => resolveLoadingStatus(image, src)
  );
  useLayoutEffect2(() => {
    setLoadingStatus(resolveLoadingStatus(image, src));
  }, [image, src]);
  useLayoutEffect2(() => {
    const updateStatus = (status) => () => {
      setLoadingStatus(status);
    };
    if (!image) return;
    const handleLoad = updateStatus("loaded");
    const handleError = updateStatus("error");
    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy;
    }
    if (typeof crossOrigin === "string") {
      image.crossOrigin = crossOrigin;
    }
    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };
  }, [image, crossOrigin, referrerPolicy]);
  return loadingStatus;
}
var Root$1 = Avatar$1;
var Image = AvatarImage$1;
var Fallback = AvatarFallback$1;
function Avatar({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root$1,
    {
      "data-slot": "avatar",
      className: cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      ),
      ...props
    }
  );
}
function AvatarImage({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Image,
    {
      "data-slot": "avatar-image",
      className: cn("aspect-square size-full", className),
      ...props
    }
  );
}
function AvatarFallback({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Fallback,
    {
      "data-slot": "avatar-fallback",
      className: cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      ),
      ...props
    }
  );
}
var NAME = "Separator";
var DEFAULT_ORIENTATION = "horizontal";
var ORIENTATIONS = ["horizontal", "vertical"];
var Separator$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { decorative, orientation: orientationProp = DEFAULT_ORIENTATION, ...domProps } = props;
  const orientation = isValidOrientation(orientationProp) ? orientationProp : DEFAULT_ORIENTATION;
  const ariaOrientation = orientation === "vertical" ? orientation : void 0;
  const semanticProps = decorative ? { role: "none" } : { "aria-orientation": ariaOrientation, role: "separator" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "data-orientation": orientation,
      ...semanticProps,
      ...domProps,
      ref: forwardedRef
    }
  );
});
Separator$1.displayName = NAME;
function isValidOrientation(orientation) {
  return ORIENTATIONS.includes(orientation);
}
var Root = Separator$1;
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root,
    {
      "data-slot": "separator",
      decorative,
      orientation,
      className: cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      ),
      ...props
    }
  );
}
const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belgium",
  "Bolivia",
  "Bosnia",
  "Brazil",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Ecuador",
  "Egypt",
  "Ethiopia",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Hungary",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Lebanon",
  "Libya",
  "Malaysia",
  "Mali",
  "Mexico",
  "Morocco",
  "Myanmar",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Palestine",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Senegal",
  "Sierra Leone",
  "Singapore",
  "Somalia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Sweden",
  "Switzerland",
  "Syria",
  "Tanzania",
  "Thailand",
  "Tunisia",
  "Turkey",
  "UAE",
  "Uganda",
  "Ukraine",
  "United Kingdom",
  "United States",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zimbabwe"
];
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
const TIMEZONES = [
  { value: "UTC-12:00", label: "UTC-12:00 (Baker Island)" },
  { value: "UTC-11:00", label: "UTC-11:00 (Samoa)" },
  { value: "UTC-10:00", label: "UTC-10:00 (Hawaii)" },
  { value: "UTC-09:00", label: "UTC-09:00 (Alaska)" },
  { value: "UTC-08:00", label: "UTC-08:00 (Pacific Time)" },
  { value: "UTC-07:00", label: "UTC-07:00 (Mountain Time)" },
  { value: "UTC-06:00", label: "UTC-06:00 (Central Time)" },
  { value: "UTC-05:00", label: "UTC-05:00 (Eastern Time)" },
  { value: "UTC-04:00", label: "UTC-04:00 (Atlantic Time)" },
  { value: "UTC-03:30", label: "UTC-03:30 (Newfoundland)" },
  { value: "UTC-03:00", label: "UTC-03:00 (Buenos Aires)" },
  { value: "UTC-02:00", label: "UTC-02:00 (Mid-Atlantic)" },
  { value: "UTC-01:00", label: "UTC-01:00 (Azores)" },
  { value: "UTC+00:00", label: "UTC+00:00 (London, Dublin)" },
  { value: "UTC+01:00", label: "UTC+01:00 (Paris, Berlin)" },
  { value: "UTC+02:00", label: "UTC+02:00 (Cairo, Johannesburg)" },
  { value: "UTC+03:00", label: "UTC+03:00 (Riyadh, Moscow)" },
  { value: "UTC+03:30", label: "UTC+03:30 (Tehran)" },
  { value: "UTC+04:00", label: "UTC+04:00 (Dubai, Baku)" },
  { value: "UTC+04:30", label: "UTC+04:30 (Kabul)" },
  { value: "UTC+05:00", label: "UTC+05:00 (Karachi, Tashkent)" },
  { value: "UTC+05:30", label: "UTC+05:30 (Mumbai, New Delhi)" },
  { value: "UTC+05:45", label: "UTC+05:45 (Kathmandu)" },
  { value: "UTC+06:00", label: "UTC+06:00 (Dhaka, Almaty)" },
  { value: "UTC+06:30", label: "UTC+06:30 (Yangon)" },
  { value: "UTC+07:00", label: "UTC+07:00 (Bangkok, Jakarta)" },
  { value: "UTC+08:00", label: "UTC+08:00 (Beijing, Singapore)" },
  { value: "UTC+09:00", label: "UTC+09:00 (Tokyo, Seoul)" },
  { value: "UTC+09:30", label: "UTC+09:30 (Adelaide, Darwin)" },
  { value: "UTC+10:00", label: "UTC+10:00 (Sydney, Canberra)" },
  { value: "UTC+11:00", label: "UTC+11:00 (Solomon Islands)" },
  { value: "UTC+12:00", label: "UTC+12:00 (Auckland, Fiji)" },
  { value: "UTC+13:00", label: "UTC+13:00 (Tonga)" },
  { value: "UTC+14:00", label: "UTC+14:00 (Kiribati)" }
];
const BIO_MAX = 200;
function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
function ProfilePreview({
  form,
  kycStatus
}) {
  var _a;
  const langLabel = ((_a = LANGUAGES.find((l) => l.value === form.preferredLanguage)) == null ? void 0 : _a.label) ?? form.preferredLanguage;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "border border-border shadow-sm",
      "data-ocid": "edit_profile.preview_card",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider", children: "Profile Preview" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-20 w-20 ring-2 ring-primary/20", children: [
              form.avatarPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: form.avatarPreview, alt: form.fullName }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-primary/10 text-primary font-bold text-xl", children: form.fullName ? getInitials(form.fullName) : "?" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground text-lg leading-tight", children: form.fullName || "Your Name" }),
              (form.country || form.city) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground flex items-center justify-center gap-1 mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
                [form.city, form.country].filter(Boolean).join(", ")
              ] })
            ] }),
            kycStatus && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: `text-xs ${kycStatus === "Approved" ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950" : "border-border text-muted-foreground"}`,
                children: kycStatus === "Approved" ? "Verified" : kycStatus
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          form.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic leading-relaxed text-center", children: form.bio }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            form.phoneNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: form.phoneNumber })
            ] }),
            form.preferredLanguage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: langLabel })
            ] })
          ] })
        ] })
      ]
    }
  );
}
function EditProfilePage() {
  var _a;
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const actor = getBackendActor();
  const fileInputRef = reactExports.useRef(null);
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && isAuthenticated
  });
  const [form, setForm] = reactExports.useState({
    fullName: "",
    country: "",
    city: "",
    phoneNumber: "",
    bio: "",
    preferredLanguage: "en",
    timezone: "UTC+00:00",
    avatarRef: null,
    avatarPreview: null
  });
  reactExports.useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName ?? "",
        country: profile.country ?? "",
        city: profile.city ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        bio: profile.bio ?? "",
        preferredLanguage: profile.preferredLanguage || "en",
        timezone: profile.timezone || "UTC+00:00",
        avatarRef: profile.avatarRef ?? null,
        avatarPreview: null
      });
    }
  }, [profile]);
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.updateUserProfileExtended(
        form.fullName,
        form.country,
        form.city,
        form.phoneNumber,
        form.bio,
        form.preferredLanguage,
        form.timezone,
        form.avatarRef ?? null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      ue.success("Profile updated successfully!");
      navigate({ to: "/profile/$id", params: { id: "me" } });
    },
    onError: (err) => {
      ue.error(
        err instanceof Error ? err.message : "Failed to update profile. Please try again."
      );
    }
  });
  function handleAvatarClick() {
    var _a2;
    (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
  }
  function handleFileChange(e) {
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      ue.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      ue.error("Image must be under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      var _a3;
      const dataUrl = (_a3 = ev.target) == null ? void 0 : _a3.result;
      setForm((f) => ({ ...f, avatarPreview: dataUrl }));
    };
    reader.readAsDataURL(file);
    setForm((f) => ({
      ...f,
      avatarRef: {
        mimeType: file.type,
        fileName: file.name,
        storageId: `upload:${file.name}`
      }
    }));
  }
  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-sm text-center p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground font-medium mb-2", children: "Sign in required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mb-4", children: "Please sign in to edit your profile." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: () => navigate({ to: "/sign-in" }),
          "data-ocid": "edit_profile.sign_in_button",
          children: "Sign In"
        }
      )
    ] }) });
  }
  if (profileLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: "lg", label: "Loading profile..." }) });
  }
  const bioRemaining = BIO_MAX - form.bio.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen bg-background pb-24",
      "data-ocid": "edit_profile.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 bg-card border-b border-border shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-4 h-14 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => navigate({ to: "/profile/$id", params: { id: "me" } }),
              className: "p-2 rounded-lg hover:bg-muted transition-colors",
              "aria-label": "Back to profile",
              "data-ocid": "edit_profile.back_button",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5 text-foreground" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-foreground text-lg", children: "Edit Profile" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "max-w-5xl mx-auto px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-20 w-20 ring-2 ring-primary/20", children: [
                  form.avatarPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AvatarImage,
                    {
                      src: form.avatarPreview,
                      alt: form.fullName
                    }
                  ) : ((_a = form.avatarRef) == null ? void 0 : _a.storageId) && !form.avatarRef.storageId.startsWith("upload:") ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AvatarImage,
                    {
                      src: form.avatarRef.storageId,
                      alt: form.fullName
                    }
                  ) : null,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-primary/10 text-primary font-bold text-2xl", children: form.fullName ? getInitials(form.fullName) : "?" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleAvatarClick,
                    className: "absolute -bottom-1 -right-1 h-7 w-7 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors",
                    "aria-label": "Change profile photo",
                    "data-ocid": "edit_profile.avatar_upload_button",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-3.5 w-3.5 text-white" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    ref: fileInputRef,
                    type: "file",
                    accept: "image/*",
                    className: "hidden",
                    onChange: handleFileChange,
                    "aria-label": "Upload profile photo"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: "Profile Photo" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "JPG, PNG or GIF up to 5 MB" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleAvatarClick,
                    className: "mt-2 text-sm text-primary hover:underline font-medium",
                    "data-ocid": "edit_profile.change_photo_link",
                    children: "Change photo"
                  }
                )
              ] })
            ] }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Personal Information" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fullName", className: "text-sm font-medium", children: "Full Name" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "fullName",
                      value: form.fullName,
                      onChange: (e) => setField("fullName", e.target.value),
                      placeholder: "Your full legal name",
                      "data-ocid": "edit_profile.full_name_input"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "country", className: "text-sm font-medium", children: "Country" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Select,
                      {
                        value: form.country || "none",
                        onValueChange: (v) => setField("country", v === "none" ? "" : v),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            SelectTrigger,
                            {
                              id: "country",
                              "data-ocid": "edit_profile.country_select",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select country" })
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Select country" }),
                            COUNTRIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                          ] })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "city", className: "text-sm font-medium", children: "City" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "city",
                        value: form.city,
                        onChange: (e) => setField("city", e.target.value),
                        placeholder: "Your city",
                        "data-ocid": "edit_profile.city_input"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", className: "text-sm font-medium", children: "Phone Number" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "phone",
                      type: "tel",
                      value: form.phoneNumber,
                      onChange: (e) => setField("phoneNumber", e.target.value),
                      placeholder: "+1 234 567 8900",
                      "data-ocid": "edit_profile.phone_input"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Include country code, e.g. +92 for Pakistan" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "bio", className: "text-sm font-medium", children: "Short Bio" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "span",
                      {
                        className: `text-xs ${bioRemaining < 20 ? "text-destructive" : "text-muted-foreground"}`,
                        children: [
                          bioRemaining,
                          " / ",
                          BIO_MAX
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      id: "bio",
                      value: form.bio,
                      onChange: (e) => setField("bio", e.target.value.slice(0, BIO_MAX)),
                      placeholder: "Tell others a little about yourself...",
                      rows: 3,
                      className: "resize-none",
                      maxLength: BIO_MAX,
                      "data-ocid": "edit_profile.bio_textarea"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Preferences" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Preferred Language" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: form.preferredLanguage,
                      onValueChange: (v) => setField("preferredLanguage", v),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "edit_profile.language_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select language" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LANGUAGES.map((lang) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: lang.value, children: lang.label }, lang.value)) })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Timezone" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: form.timezone,
                      onValueChange: (v) => setField("timezone", v),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "edit_profile.timezone_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select timezone" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIMEZONES.map((tz) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: tz.value, children: tz.label }, tz.value)) })
                      ]
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col-reverse sm:flex-row gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  className: "flex-1 sm:flex-none sm:w-32",
                  onClick: () => navigate({ to: "/profile/$id", params: { id: "me" } }),
                  disabled: updateMutation.isPending,
                  "data-ocid": "edit_profile.cancel_button",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  className: "flex-1 bg-primary hover:bg-primary/90",
                  onClick: () => updateMutation.mutate(),
                  disabled: updateMutation.isPending || !form.fullName.trim() || !actor,
                  "data-ocid": "edit_profile.save_button",
                  children: updateMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
                    "Saving..."
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mr-2" }),
                    "Save Changes"
                  ] })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "w-full lg:w-72 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:sticky lg:top-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilePreview, { form, kycStatus: profile == null ? void 0 : profile.kycStatus }) }) })
        ] }) })
      ]
    }
  );
}
export {
  EditProfilePage as default
};
