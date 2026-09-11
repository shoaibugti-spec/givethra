import { w as createLucideIcon, r as reactExports, l as jsxRuntimeExports, Z as cn, e as useAuth, f as useRole, u as useNavigate, a as getProfile, g as getKycStatus, p as ue, aG as checkUsernameAvailability, J as uploadFileToStorage, aH as updateProfile } from "./main-CYM9BeWF.js";
import { L as Layout } from "./Layout-PIwTKxdu.js";
import { c as createContextScope, a as useCallbackRef, u as useLayoutEffect2 } from "./index-KZxXceaa.js";
import { P as Primitive } from "./index-CeDhMLko.js";
import { S as Slot, d as cva, B as Button } from "./button-BoXCjEAF.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-Bj4KFAll.js";
import { I as Input } from "./input-Bb6IchX3.js";
import { L as Label } from "./label-CT-R-jpA.js";
import { T as Textarea } from "./textarea-epIlHEst.js";
import { C as COUNTRIES } from "./countries-Au0MzsWq.js";
import { L as LoaderCircle } from "./loader-circle-D316IoOu.js";
import { A as ArrowLeft } from "./arrow-left-Dceb0HnT.js";
import { C as Camera } from "./camera-BZNMg1Tq.js";
import { C as ChevronDown } from "./chevron-down-DbuGCb17.js";
import { S as Search } from "./search-CyPCPHsd.js";
import { X } from "./x-z1TbCY5C.js";
import { C as Check } from "./check-BRvEjbqp.js";
import { M as MapPin } from "./map-pin-DLz8cT5m.js";
import { P as Phone } from "./phone-WnNnOPXU.js";
import { G as Globe } from "./globe-CbVKPOjB.js";
import "./users-DQ_fG41C.js";
import "./heart-BeKUzFrD.js";
import "./message-circle-CsflEQIJ.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ImagePlus = createLucideIcon("ImagePlus", [
  ["path", { d: "M16 5h6", key: "1vod17" }],
  ["path", { d: "M19 2v6", key: "4bpg5p" }],
  ["path", { d: "M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5", key: "1ue2ih" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }]
]);
var __defProp$1 = Object.defineProperty;
var __name$1 = (target, value) => __defProp$1(target, "name", { value, configurable: true });
var AVATAR_NAME = "Avatar";
var [createAvatarContext, createAvatarScope] = createContextScope(AVATAR_NAME);
var STATIC_IMAGE_COUNT_STATE = [
  0,
  () => void 0
];
var [AvatarProvider, useAvatarContext] = createAvatarContext(AVATAR_NAME);
var Avatar$1 = /* @__PURE__ */ reactExports.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name$1(function Avatar2(props, forwardedRef) {
    const { __scopeAvatar, ...avatarProps } = props;
    const [imageLoadingStatus, setImageLoadingStatus] = reactExports.useState("idle");
    const [imageCount, setImageCount] = useImageCount();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AvatarProvider,
      {
        scope: __scopeAvatar,
        imageLoadingStatus,
        setImageLoadingStatus,
        imageCount,
        setImageCount,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...avatarProps, ref: forwardedRef })
      }
    );
  }, "Avatar")
);
var IMAGE_NAME = "AvatarImage";
var AvatarImage$1 = /* @__PURE__ */ reactExports.forwardRef(
  /* @__PURE__ */ __name$1(function AvatarImage2(props, forwardedRef) {
    const { __scopeAvatar, src, onLoadingStatusChange, ...imageProps } = props;
    const context = useAvatarContext(IMAGE_NAME, __scopeAvatar);
    useUpdateImageCount(context.setImageCount);
    const imageLoadingStatus = useImageLoadingStatus(src, {
      referrerPolicy: imageProps.referrerPolicy,
      crossOrigin: imageProps.crossOrigin,
      loadingStatus: context.imageLoadingStatus,
      setLoadingStatus: context.setImageLoadingStatus
    });
    const handleLoadingStatusChange = useCallbackRef((status) => {
      onLoadingStatusChange == null ? void 0 : onLoadingStatusChange(status);
    });
    const loadingStatusRef = reactExports.useRef(imageLoadingStatus);
    useLayoutEffect2(() => {
      const previousLoadingStatus = loadingStatusRef.current;
      loadingStatusRef.current = imageLoadingStatus;
      if (imageLoadingStatus !== previousLoadingStatus) {
        handleLoadingStatusChange(imageLoadingStatus);
      }
    }, [imageLoadingStatus, handleLoadingStatusChange]);
    return imageLoadingStatus === "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.img, { ...imageProps, ref: forwardedRef, src }) : null;
  }, "AvatarImage")
);
var FALLBACK_NAME = "AvatarFallback";
var AvatarFallback$1 = /* @__PURE__ */ reactExports.forwardRef(
  /* @__PURE__ */ __name$1(function AvatarFallback2(props, forwardedRef) {
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
  }, "AvatarFallback")
);
function useImageLoadingStatus(src, {
  loadingStatus,
  setLoadingStatus,
  referrerPolicy,
  crossOrigin
}) {
  useLayoutEffect2(() => {
    if (!src) {
      setLoadingStatus("error");
      return;
    }
    const image = new window.Image();
    const handleLoad = /* @__PURE__ */ __name$1((event) => {
      const image2 = event.currentTarget;
      setLoadingStatus(getImageLoadingStatus(image2));
    }, "handleLoad");
    const handleError = /* @__PURE__ */ __name$1(() => setLoadingStatus("error"), "handleError");
    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy;
    }
    image.crossOrigin = crossOrigin ?? null;
    image.src = src;
    setLoadingStatus(getImageLoadingStatus(image));
    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      setLoadingStatus("idle");
    };
  }, [src, crossOrigin, referrerPolicy, setLoadingStatus]);
  return loadingStatus;
}
__name$1(useImageLoadingStatus, "useImageLoadingStatus");
function getImageLoadingStatus(image) {
  return image.complete ? image.naturalWidth > 0 ? "loaded" : "error" : "loading";
}
__name$1(getImageLoadingStatus, "getImageLoadingStatus");
function useImageCount() {
  let state = STATIC_IMAGE_COUNT_STATE;
  return state;
}
__name$1(useImageCount, "useImageCount");
function useUpdateImageCount(setImageCount) {
}
__name$1(useUpdateImageCount, "useUpdateImageCount");
function Avatar({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Avatar$1,
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
    AvatarImage$1,
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
    AvatarFallback$1,
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
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var DEFAULT_ORIENTATION = "horizontal";
var ORIENTATIONS = ["horizontal", "vertical"];
var Separator$1 = /* @__PURE__ */ reactExports.forwardRef(
  /* @__PURE__ */ __name(function Separator2(props, forwardedRef) {
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
  }, "Separator")
);
function isValidOrientation(orientation) {
  return ORIENTATIONS.includes(orientation);
}
__name(isValidOrientation, "isValidOrientation");
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
const BIO_MAX = 280;
const BIO_CONTACT_REGEX = /\d|@|https?:\/\/|www\.|whats?app|e[- ]?mail|email|phone|contact|telegram|signal|wechat|imo/i;
function getBioError(value) {
  return BIO_CONTACT_REGEX.test(value) ? "Bio میں نمبر، punctuation/contact details، @، email یا phone information شامل نہیں کر سکتے۔" : null;
}
function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
function EditProfilePage() {
  var _a;
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const setupMode = new URLSearchParams(window.location.search).get("setup") === "1";
  const avatarInputRef = reactExports.useRef(null);
  const coverInputRef = reactExports.useRef(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [kycStatus, setKycStatus] = reactExports.useState(null);
  const [fullName, setFullName] = reactExports.useState("");
  const [firstName, setFirstName] = reactExports.useState("");
  const [lastName, setLastName] = reactExports.useState("");
  const [username, setUsername] = reactExports.useState("");
  const [age, setAge] = reactExports.useState("");
  const [gender, setGender] = reactExports.useState("");
  const [idNumber, setIdNumber] = reactExports.useState("");
  const [usernameAvailability, setUsernameAvailability] = reactExports.useState(null);
  const [countryCode, setCountryCode] = reactExports.useState("");
  const [city, setCity] = reactExports.useState("");
  const [phoneNumber, setPhoneNumber] = reactExports.useState("");
  const [bio, setBio] = reactExports.useState("");
  const [bioError, setBioError] = reactExports.useState(null);
  const [preferredLanguage, setPreferredLanguage] = reactExports.useState("en");
  const [avatarUrl, setAvatarUrl] = reactExports.useState(null);
  const [coverUrl, setCoverUrl] = reactExports.useState(null);
  const [avatarFile, setAvatarFile] = reactExports.useState(null);
  const [coverFile, setCoverFile] = reactExports.useState(null);
  const [avatarUploading, setAvatarUploading] = reactExports.useState(false);
  const [coverUploading, setCoverUploading] = reactExports.useState(false);
  const [countryOpen, setCountryOpen] = reactExports.useState(false);
  const [countryQuery, setCountryQuery] = reactExports.useState("");
  async function validateUsername() {
    const value = username.trim().toLowerCase();
    if (!value || !/^[a-zA-Z0-9_]{3,24}$/.test(value)) {
      setUsernameAvailability(null);
      return;
    }
    try {
      setUsernameAvailability(await checkUsernameAvailability(value));
    } catch {
      setUsernameAvailability(null);
    }
  }
  reactExports.useEffect(() => {
    if (!isAuthenticated || !(user == null ? void 0 : user.id)) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadProfile();
  }, [isAuthenticated, user == null ? void 0 : user.id, role]);
  async function loadProfile() {
    if (!(user == null ? void 0 : user.id)) return;
    setLoading(true);
    try {
      const prof = await getProfile(user.id, role);
      if (prof) {
        setFullName(prof.full_name ?? user.fullName ?? "");
        setFirstName(prof.first_name ?? "");
        setLastName(prof.last_name ?? "");
        setUsername(prof.username ?? "");
        setAge(prof.age != null ? String(prof.age) : "");
        setGender(prof.gender ?? "");
        setIdNumber(prof.id_number ?? "");
        setCity(prof.city ?? "");
        setCountryCode(
          prof.country_code ?? prof.countryCode ?? prof.country ?? ""
        );
        setPhoneNumber(prof.phone_number ?? "");
        setBio(prof.bio ?? "");
        setPreferredLanguage(
          prof.preferred_language ?? prof.preferredLanguage ?? "en"
        );
        setAvatarUrl(prof.avatar_url ?? null);
        setCoverUrl(prof.cover_url ?? null);
      } else {
        setFullName(user.fullName ?? "");
        const nameParts = String(user.fullName || "").trim().split(/\s+/);
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" "));
      }
      try {
        const kyc = await getKycStatus(user.id);
        setKycStatus((kyc == null ? void 0 : kyc.status) ?? null);
      } catch {
        setKycStatus(null);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      ue.error("Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }
  const selectedCountry = COUNTRIES.find(
    (country) => country.code === countryCode
  );
  const filteredCountries = countryQuery.trim() ? COUNTRIES.filter(
    (country) => country.name.toLowerCase().includes(countryQuery.trim().toLowerCase())
  ) : COUNTRIES;
  const langLabel = ((_a = LANGUAGES.find(
    (language) => language.value === preferredLanguage
  )) == null ? void 0 : _a.label) ?? preferredLanguage;
  function validateImage(file) {
    if (!file.type.startsWith("image/")) {
      ue.error("Please select an image file.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      ue.error("Image must be under 5 MB.");
      return false;
    }
    return true;
  }
  async function handleAvatarChange(e) {
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file || !(user == null ? void 0 : user.id)) return;
    if (!validateImage(file)) return;
    setAvatarFile(file);
    const localPreview = URL.createObjectURL(file);
    setAvatarUrl(localPreview);
    setAvatarUploading(true);
    try {
      const safeName = file.name.replace(
        /[^a-zA-Z0-9._-]+/g,
        "_"
      );
      const path = `avatars/${user.id}/${Date.now()}-${safeName}`;
      const uploadedUrl = await uploadFileToStorage(
        file,
        path
      );
      await updateProfile(
        user.id,
        {
          avatar_url: uploadedUrl
        },
        role
      );
      setAvatarUrl(uploadedUrl);
      setAvatarFile(null);
      await refreshUser().catch(() => null);
      ue.success("Profile photo updated");
    } catch (err) {
      console.error("Avatar upload failed:", err);
      ue.error(
        err instanceof Error ? err.message : "Could not upload photo. Please try again."
      );
    } finally {
      setAvatarUploading(false);
    }
  }
  async function handleCoverChange(e) {
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file || !(user == null ? void 0 : user.id)) return;
    if (!validateImage(file)) return;
    setCoverFile(file);
    const localPreview = URL.createObjectURL(file);
    setCoverUrl(localPreview);
    setCoverUploading(true);
    try {
      const safeName = file.name.replace(
        /[^a-zA-Z0-9._-]+/g,
        "_"
      );
      const path = `covers/${user.id}/${Date.now()}-${safeName}`;
      const uploadedUrl = await uploadFileToStorage(
        file,
        path
      );
      await updateProfile(
        user.id,
        {
          cover_url: uploadedUrl
        },
        role
      );
      setCoverUrl(uploadedUrl);
      setCoverFile(null);
      await refreshUser().catch(() => null);
      ue.success("Cover photo updated");
    } catch (err) {
      console.error("Cover upload failed:", err);
      ue.error(
        err instanceof Error ? err.message : "Could not upload cover. Please try again."
      );
    } finally {
      setCoverUploading(false);
    }
  }
  async function handleSaveDetails() {
    if (!(user == null ? void 0 : user.id)) return;
    if (!fullName.trim()) {
      ue.error("Name can't be empty");
      return;
    }
    if (setupMode && !username.trim()) {
      ue.error("Username is required to create your profile");
      return;
    }
    if (username && !/^[a-zA-Z0-9_]{3,24}$/.test(username.trim())) {
      ue.error("Username must be 3–24 characters using letters, numbers, or underscore");
      return;
    }
    const validationError = getBioError(bio);
    if (validationError) {
      setBioError(validationError);
      ue.error(validationError);
      return;
    }
    setSaving(true);
    try {
      const savedProfile = await updateProfile(
        user.id,
        {
          full_name: fullName.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim().toLowerCase(),
          age: age ? Number(age) : null,
          gender: gender || null,
          id_number: idNumber.trim() || null,
          city: city.trim(),
          country_code: countryCode,
          country: (selectedCountry == null ? void 0 : selectedCountry.name) || (countryCode && !selectedCountry ? countryCode : ""),
          phone_number: phoneNumber.trim(),
          bio: bio.trim(),
          preferred_language: preferredLanguage,
          avatar_url: avatarUrl,
          cover_url: coverUrl,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        },
        role
      );
      if (savedProfile && savedProfile.user_id && savedProfile.user_id !== user.id) {
        throw new Error(
          "Profile was not saved. Please try again."
        );
      }
      if (savedProfile) {
        setFullName(
          savedProfile.full_name ?? fullName
        );
        setCity(savedProfile.city ?? city);
        setPhoneNumber(
          savedProfile.phone_number ?? phoneNumber
        );
        setBio(savedProfile.bio ?? bio);
        setAvatarUrl(
          savedProfile.avatar_url ?? avatarUrl
        );
        setCoverUrl(
          savedProfile.cover_url ?? coverUrl
        );
        setCountryCode(
          savedProfile.country_code ?? savedProfile.country ?? countryCode
        );
        setPreferredLanguage(
          savedProfile.preferred_language ?? preferredLanguage
        );
      }
      setAvatarFile(null);
      setCoverFile(null);
      await refreshUser().catch(() => null);
      ue.success("Profile updated successfully!");
      if (setupMode) {
        navigate({ to: "/" });
      } else {
        navigate({
          to: "/profile/$id",
          params: { id: "me" }
        });
      }
    } catch (err) {
      console.error("Profile save failed:", err);
      ue.error(
        err instanceof Error ? err.message : "Could not save changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-xl mx-auto px-4 pt-8 pb-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border bg-card p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 mx-auto animate-spin text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Loading profile..." })
    ] }) }) });
  }
  const bioRemaining = BIO_MAX - bio.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-28", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-4 h-14 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => navigate({
            to: "/profile/$id",
            params: { id: "me" }
          }),
          className: "p-2 rounded-lg hover:bg-muted transition-colors",
          "aria-label": "Back",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5 text-foreground" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-foreground text-lg", children: setupMode ? "Create Your Profile" : "Edit Profile" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "max-w-5xl mx-auto px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-32 bg-gradient-to-br from-primary via-primary/80 to-primary/40", children: [
            coverUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: coverUrl,
                alt: "Cover",
                className: "absolute inset-0 w-full h-full object-cover"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  var _a2;
                  return (_a2 = coverInputRef.current) == null ? void 0 : _a2.click();
                },
                disabled: coverUploading,
                className: "absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 hover:bg-black/70 transition-colors disabled:opacity-60",
                children: [
                  coverUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-3.5 w-3.5" }),
                  coverUploading ? "Uploading..." : "Change Cover"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: coverInputRef,
                type: "file",
                accept: "image/*",
                onChange: handleCoverChange,
                className: "hidden"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "px-5 pb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative -mt-12 mb-3 inline-block", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-24 w-24 rounded-3xl border-4 border-card ring-1 ring-border overflow-hidden shadow-xl", children: [
                avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  AvatarImage,
                  {
                    src: avatarUrl,
                    alt: fullName || "Avatar",
                    className: "object-cover"
                  }
                ) : null,
                /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "rounded-3xl bg-primary text-white font-bold text-2xl", children: fullName ? getInitials(fullName) : "G" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    var _a2;
                    return (_a2 = avatarInputRef.current) == null ? void 0 : _a2.click();
                  },
                  disabled: avatarUploading,
                  className: "absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60",
                  "aria-label": "Change photo",
                  children: avatarUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-3.5 w-3.5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: avatarInputRef,
                  type: "file",
                  accept: "image/*",
                  onChange: handleAvatarChange,
                  className: "hidden"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: 'Tap the camera icon to change your photo, or "Change Cover" above for your banner. Both save instantly.' })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Personal Information" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fullName", children: "Full Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "fullName",
                  value: fullName,
                  onChange: (e) => setFullName(e.target.value),
                  placeholder: "Your full legal name"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "firstName", children: "First Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "firstName", value: firstName, onChange: (e) => setFirstName(e.target.value), placeholder: "First name" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "lastName", children: "Last Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "lastName", value: lastName, onChange: (e) => setLastName(e.target.value), placeholder: "Last name" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "username", children: "Username" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "username", value: username, onChange: (e) => {
                  setUsername(e.target.value.replace(/\s/g, ""));
                  setUsernameAvailability(null);
                }, onBlur: validateUsername, placeholder: "e.g. shoaib_hope", maxLength: 24 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "People can find you by this username." }),
                usernameAvailability && (usernameAvailability.available ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-emerald-600", children: "Username is available." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-destructive", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Username is already taken." }),
                  usernameAvailability.suggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    "Try: ",
                    usernameAvailability.suggestions.map((suggestion) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "mr-1 underline", onClick: () => {
                      setUsername(suggestion);
                      setUsernameAvailability(null);
                    }, children: suggestion }, suggestion))
                  ] })
                ] }))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "age", children: "Age" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "age", type: "number", min: 13, max: 120, value: age, onChange: (e) => setAge(e.target.value), placeholder: "Your age" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "gender", children: "Gender" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "gender", value: gender, onChange: (e) => setGender(e.target.value), className: "w-full h-10 rounded-md border border-input bg-background px-3 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Prefer not to say" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Male", children: "Male" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Female", children: "Female" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Other", children: "Other" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "idNumber", children: "National ID / ID number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "idNumber", value: idNumber, onChange: (e) => setIdNumber(e.target.value), placeholder: "Optional" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Country" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setCountryOpen((v) => !v),
                  className: "w-full flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm bg-background",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center gap-2", children: selectedCountry ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg leading-none", children: selectedCountry.flag }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selectedCountry.name })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Select your country" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ChevronDown,
                      {
                        className: `h-4 w-4 text-muted-foreground transition-transform ${countryOpen ? "rotate-180" : ""}`
                      }
                    )
                  ]
                }
              ),
              countryOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card shadow-lg overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 border-b border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      autoFocus: true,
                      value: countryQuery,
                      onChange: (e) => setCountryQuery(
                        e.target.value
                      ),
                      placeholder: "Search country...",
                      className: "w-full bg-transparent text-sm outline-none"
                    }
                  ),
                  countryQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setCountryQuery(""),
                      className: "text-muted-foreground",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-56 overflow-y-auto", children: filteredCountries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "No country found." }) : filteredCountries.map(
                  (country) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setCountryCode(
                          country.code
                        );
                        setCountryOpen(false);
                        setCountryQuery("");
                      },
                      className: "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-left",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg leading-none", children: country.flag }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: country.name })
                        ] }),
                        countryCode === country.code && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-primary" })
                      ]
                    },
                    country.code
                  )
                ) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "city", children: "City" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "city",
                  value: city,
                  onChange: (e) => setCity(e.target.value),
                  placeholder: "Your city"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", children: "Phone Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "phone",
                  type: "tel",
                  value: phoneNumber,
                  onChange: (e) => setPhoneNumber(e.target.value),
                  placeholder: "+92 300 1234567"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Include country code, e.g. +92 for Pakistan" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "bio", children: "Short Bio" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `text-xs ${bioRemaining < 20 ? "text-destructive" : "text-muted-foreground"}`,
                    children: [
                      bio.length,
                      "/",
                      BIO_MAX
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Bio میں نمبر، punctuation، @، email یا phone/contact information نہیں لکھ سکتے۔" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "bio",
                  value: bio,
                  onChange: (e) => {
                    const next = e.target.value.slice(
                      0,
                      BIO_MAX
                    );
                    setBio(next);
                    setBioError(
                      getBioError(next)
                    );
                  },
                  placeholder: "Tell the community a little about yourself...",
                  rows: 4,
                  maxLength: BIO_MAX,
                  className: `resize-none ${bioError ? "border-destructive focus-visible:ring-destructive" : ""}`,
                  "aria-invalid": Boolean(
                    bioError
                  )
                }
              ),
              bioError && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  role: "alert",
                  className: "text-xs text-destructive font-medium",
                  children: bioError
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Preferences" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Preferred Language" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: preferredLanguage,
                onChange: (e) => setPreferredLanguage(
                  e.target.value
                ),
                className: "w-full h-10 rounded-md border border-input bg-background px-3 text-sm",
                children: LANGUAGES.map((language) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "option",
                  {
                    value: language.value,
                    children: language.label
                  },
                  language.value
                ))
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col-reverse sm:flex-row gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              className: "flex-1 sm:flex-none sm:w-32",
              onClick: () => navigate({
                to: "/profile/$id",
                params: { id: "me" }
              }),
              disabled: saving,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              className: "flex-1",
              onClick: handleSaveDetails,
              disabled: saving || avatarUploading || coverUploading || !fullName.trim(),
              children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "w-full lg:w-72 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:sticky lg:top-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border shadow-sm overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-20 bg-gradient-to-br from-primary via-primary/80 to-primary/40", children: coverUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: coverUrl,
            alt: "Cover",
            className: "absolute inset-0 w-full h-full object-cover"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 pt-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center gap-3 -mt-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-20 w-20 ring-4 ring-card", children: [
              avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                AvatarImage,
                {
                  src: avatarUrl,
                  alt: fullName || "Avatar",
                  className: "object-cover"
                }
              ) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-primary/10 text-primary font-bold text-xl", children: fullName ? getInitials(fullName) : "?" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground text-lg leading-tight", children: fullName || "Your Name" }),
              (countryCode || city) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground flex items-center justify-center gap-1 mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
                [
                  city,
                  (selectedCountry == null ? void 0 : selectedCountry.name) || (countryCode && !selectedCountry ? countryCode : "")
                ].filter(Boolean).join(", ")
              ] })
            ] }),
            kycStatus && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: `text-xs ${kycStatus === "approved" ? "border-teal-500 text-teal-600 bg-teal-50 dark:bg-teal-950" : "border-border text-muted-foreground"}`,
                children: kycStatus === "approved" ? "Verified" : kycStatus
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic leading-relaxed text-center", children: bio }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            phoneNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: phoneNumber })
            ] }),
            preferredLanguage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: langLabel })
            ] })
          ] })
        ] })
      ] }) }) })
    ] }) })
  ] }) });
}
export {
  EditProfilePage as default
};
