// src/frontend/src/pages/EditProfilePage.tsx
// Givethra - Complete merged Edit Profile
// Keeps existing functionality while adding the new searchable country selector,
// instant avatar/cover upload, live previews, KYC status, language preference,
// profile-role support, bio validation, and Cloudflare Worker APIs.

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { useNavigate } from "@tanstack/react-router";
import Layout from "@/components/Layout";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";

import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  Globe,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  Search,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  getProfile,
  updateProfile,
  getKycStatus,
  uploadFileToStorage,
} from "@/lib/api";

import { COUNTRIES } from "@/lib/countries";

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
];

const BIO_MAX = 280;

const BIO_CONTACT_REGEX =
  /\d|@|https?:\/\/|www\.|whats?app|e[- ]?mail|email|phone|contact|telegram|signal|wechat|imo/i;

function getBioError(value: string): string | null {
  return BIO_CONTACT_REGEX.test(value)
    ? "Bio میں نمبر، punctuation/contact details، @، email یا phone information شامل نہیں کر سکتے۔"
    : null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function EditProfilePage() {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [kycStatus, setKycStatus] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [bioError, setBioError] = useState<string | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      navigate({ to: "/sign-in" });
      return;
    }

    loadProfile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, role]);

  async function loadProfile() {
    if (!user?.id) return;

    setLoading(true);

    try {
      const prof = await getProfile(user.id, role);

      if (prof) {
        setFullName(prof.full_name ?? user.fullName ?? "");

        setCity(prof.city ?? "");

        setCountryCode(
          prof.country_code ??
            prof.countryCode ??
            prof.country ??
            ""
        );

        setPhoneNumber(prof.phone_number ?? "");

        setBio(prof.bio ?? "");

        setPreferredLanguage(
          prof.preferred_language ??
            prof.preferredLanguage ??
            "en"
        );

        setAvatarUrl(prof.avatar_url ?? null);
        setCoverUrl(prof.cover_url ?? null);
      } else {
        setFullName(user.fullName ?? "");
      }

      try {
        const kyc = await getKycStatus(user.id);
        setKycStatus(kyc?.status ?? null);
      } catch {
        setKycStatus(null);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error("Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }

  const selectedCountry = COUNTRIES.find(
    (country) => country.code === countryCode
  );

  const filteredCountries = countryQuery.trim()
    ? COUNTRIES.filter((country) =>
        country.name
          .toLowerCase()
          .includes(countryQuery.trim().toLowerCase())
      )
    : COUNTRIES;

  const langLabel =
    LANGUAGES.find(
      (language) => language.value === preferredLanguage
    )?.label ?? preferredLanguage;

  function validateImage(file: File): boolean {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return false;
    }

    return true;
  }

  // Avatar: instant local preview + upload + API save
  async function handleAvatarChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file || !user?.id) return;

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
          avatar_url: uploadedUrl,
        },
        role
      );

      setAvatarUrl(uploadedUrl);
      setAvatarFile(null);

      await refreshUser().catch(() => null);

      toast.success("Profile photo updated");
    } catch (err) {
      console.error("Avatar upload failed:", err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Could not upload photo. Please try again."
      );
    } finally {
      setAvatarUploading(false);
    }
  }

  // Cover: instant local preview + upload + API save
  async function handleCoverChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file || !user?.id) return;

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
          cover_url: uploadedUrl,
        },
        role
      );

      setCoverUrl(uploadedUrl);
      setCoverFile(null);

      await refreshUser().catch(() => null);

      toast.success("Cover photo updated");
    } catch (err) {
      console.error("Cover upload failed:", err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Could not upload cover. Please try again."
      );
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleSaveDetails() {
    if (!user?.id) return;

    if (!fullName.trim()) {
      toast.error("Name can't be empty");
      return;
    }

    const validationError = getBioError(bio);

    if (validationError) {
      setBioError(validationError);
      toast.error(validationError);
      return;
    }

    setSaving(true);

    try {
      const savedProfile = await updateProfile(
        user.id,
        {
          full_name: fullName.trim(),
          city: city.trim(),

          country_code: countryCode,

          country:
            selectedCountry?.name ||
            (countryCode && !selectedCountry
              ? countryCode
              : ""),

          phone_number: phoneNumber.trim(),

          bio: bio.trim(),

          preferred_language: preferredLanguage,

          avatar_url: avatarUrl,
          cover_url: coverUrl,

          updated_at: new Date().toISOString(),
        },
        role
      );

      if (
        savedProfile &&
        savedProfile.user_id &&
        savedProfile.user_id !== user.id
      ) {
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
          savedProfile.country_code ??
            savedProfile.country ??
            countryCode
        );

        setPreferredLanguage(
          savedProfile.preferred_language ??
            preferredLanguage
        );
      }

      setAvatarFile(null);
      setCoverFile(null);

      await refreshUser().catch(() => null);

      toast.success("Profile updated successfully!");

      navigate({
        to: "/profile/$id",
        params: { id: "me" },
      });
    } catch (err) {
      console.error("Profile save failed:", err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Could not save changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 pt-8 pb-24">
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              Loading profile...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const bioRemaining = BIO_MAX - bio.length;

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-28">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/profile/$id",
                  params: { id: "me" },
                })
              }
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>

            <h1 className="font-semibold text-foreground text-lg">
              Edit Profile
            </h1>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Main */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Cover + Avatar */}
              <Card className="border border-border overflow-hidden">

                <div className="relative h-32 bg-gradient-to-br from-primary via-primary/80 to-primary/40">

                  {coverUrl && (
                    <img
                      src={coverUrl}
                      alt="Cover"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/10" />

                  <button
                    type="button"
                    onClick={() =>
                      coverInputRef.current?.click()
                    }
                    disabled={coverUploading}
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 hover:bg-black/70 transition-colors disabled:opacity-60"
                  >
                    {coverUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ImagePlus className="h-3.5 w-3.5" />
                    )}

                    {coverUploading
                      ? "Uploading..."
                      : "Change Cover"}
                  </button>

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </div>

                <CardContent className="px-5 pb-5">
                  <div className="relative -mt-12 mb-3 inline-block">

                    <Avatar className="h-24 w-24 rounded-3xl border-4 border-card ring-1 ring-border overflow-hidden shadow-xl">
                      {avatarUrl ? (
                        <AvatarImage
                          src={avatarUrl}
                          alt={fullName || "Avatar"}
                          className="object-cover"
                        />
                      ) : null}

                      <AvatarFallback className="rounded-3xl bg-primary text-white font-bold text-2xl">
                        {fullName
                          ? getInitials(fullName)
                          : "G"}
                      </AvatarFallback>
                    </Avatar>

                    <button
                      type="button"
                      onClick={() =>
                        avatarInputRef.current?.click()
                      }
                      disabled={avatarUploading}
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                      aria-label="Change photo"
                    >
                      {avatarUploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Camera className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Tap the camera icon to change your photo,
                    or "Change Cover" above for your banner.
                    Both save instantly.
                  </p>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Personal Information
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name
                    </Label>

                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) =>
                        setFullName(e.target.value)
                      }
                      placeholder="Your full legal name"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <Label>Country</Label>

                    <button
                      type="button"
                      onClick={() =>
                        setCountryOpen((v) => !v)
                      }
                      className="w-full flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm bg-background"
                    >
                      <span className="flex items-center gap-2">

                        {selectedCountry ? (
                          <>
                            <span className="text-lg leading-none">
                              {selectedCountry.flag}
                            </span>

                            <span>
                              {selectedCountry.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">
                            Select your country
                          </span>
                        )}

                      </span>

                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          countryOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {countryOpen && (
                      <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">

                        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

                          <input
                            autoFocus
                            value={countryQuery}
                            onChange={(e) =>
                              setCountryQuery(
                                e.target.value
                              )
                            }
                            placeholder="Search country..."
                            className="w-full bg-transparent text-sm outline-none"
                          />

                          {countryQuery && (
                            <button
                              type="button"
                              onClick={() =>
                                setCountryQuery("")
                              }
                              className="text-muted-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="max-h-56 overflow-y-auto">
                          {filteredCountries.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">
                              No country found.
                            </p>
                          ) : (
                            filteredCountries.map(
                              (country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => {
                                    setCountryCode(
                                      country.code
                                    );
                                    setCountryOpen(false);
                                    setCountryQuery("");
                                  }}
                                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-left"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="text-lg leading-none">
                                      {country.flag}
                                    </span>

                                    <span>
                                      {country.name}
                                    </span>
                                  </span>

                                  {countryCode ===
                                    country.code && (
                                    <Check className="h-4 w-4 text-primary" />
                                  )}
                                </button>
                              )
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City
                    </Label>

                    <Input
                      id="city"
                      value={city}
                      onChange={(e) =>
                        setCity(e.target.value)
                      }
                      placeholder="Your city"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number
                    </Label>

                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(e.target.value)
                      }
                      placeholder="+92 300 1234567"
                    />

                    <p className="text-xs text-muted-foreground">
                      Include country code, e.g. +92 for
                      Pakistan
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">

                    <div className="flex items-center justify-between">
                      <Label htmlFor="bio">
                        Short Bio
                      </Label>

                      <span
                        className={`text-xs ${
                          bioRemaining < 20
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {bio.length}/{BIO_MAX}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Bio میں نمبر، punctuation، @، email
                      یا phone/contact information نہیں لکھ
                      سکتے۔
                    </p>

                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => {
                        const next =
                          e.target.value.slice(
                            0,
                            BIO_MAX
                          );

                        setBio(next);
                        setBioError(
                          getBioError(next)
                        );
                      }}
                      placeholder="Tell the community a little about yourself..."
                      rows={4}
                      maxLength={BIO_MAX}
                      className={`resize-none ${
                        bioError
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      aria-invalid={Boolean(
                        bioError
                      )}
                    />

                    {bioError && (
                      <p
                        role="alert"
                        className="text-xs text-destructive font-medium"
                      >
                        {bioError}
                      </p>
                    )}
                  </div>

                </CardContent>
              </Card>

              {/* Preferences */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Preferences
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Preferred Language
                    </Label>

                    <select
                      value={preferredLanguage}
                      onChange={(e) =>
                        setPreferredLanguage(
                          e.target.value
                        )
                      }
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {LANGUAGES.map((language) => (
                        <option
                          key={language.value}
                          value={language.value}
                        >
                          {language.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3">

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 sm:flex-none sm:w-32"
                  onClick={() =>
                    navigate({
                      to: "/profile/$id",
                      params: { id: "me" },
                    })
                  }
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleSaveDetails}
                  disabled={
                    saving ||
                    avatarUploading ||
                    coverUploading ||
                    !fullName.trim()
                  }
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>

              </div>
            </div>

            {/* Preview */}
            <aside className="w-full lg:w-72 shrink-0">
              <div className="lg:sticky lg:top-20">

                <Card className="border border-border shadow-sm overflow-hidden">

                  <div className="relative h-20 bg-gradient-to-br from-primary via-primary/80 to-primary/40">
                    {coverUrl && (
                      <img
                        src={coverUrl}
                        alt="Cover"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <CardContent className="space-y-4 pt-0">

                    <div className="flex flex-col items-center text-center gap-3 -mt-10">

                      <Avatar className="h-20 w-20 ring-4 ring-card">
                        {avatarUrl ? (
                          <AvatarImage
                            src={avatarUrl}
                            alt={fullName || "Avatar"}
                            className="object-cover"
                          />
                        ) : null}

                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                          {fullName
                            ? getInitials(fullName)
                            : "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-semibold text-foreground text-lg leading-tight">
                          {fullName || "Your Name"}
                        </p>

                        {(countryCode || city) && (
                          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />

                            {[
                              city,
                              selectedCountry?.name ||
                                (countryCode &&
                                  !selectedCountry
                                  ? countryCode
                                  : ""),
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </div>

                      {kycStatus && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            kycStatus === "approved"
                              ? "border-teal-500 text-teal-600 bg-teal-50 dark:bg-teal-950"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {kycStatus === "approved"
                            ? "Verified"
                            : kycStatus}
                        </Badge>
                      )}

                    </div>

                    <Separator />

                    {bio && (
                      <p className="text-sm text-muted-foreground italic leading-relaxed text-center">
                        {bio}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">

                      {phoneNumber && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />

                          <span className="truncate">
                            {phoneNumber}
                          </span>
                        </div>
                      )}

                      {preferredLanguage && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="h-3.5 w-3.5 shrink-0" />

                          <span>
                            {langLabel}
                          </span>
                        </div>
                      )}

                    </div>

                  </CardContent>
                </Card>

              </div>
            </aside>

          </div>
        </main>
      </div>
    </Layout>
  );
}
