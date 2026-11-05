// src/frontend/src/pages/EditProfilePage.tsx
// Premium Edit Profile — Live previews, searchable country selector, glassmorphism.

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
  ArrowLeft, Camera, Check, ChevronDown, Globe, ImagePlus, Loader2,
  MapPin, Phone, Search, X, Sparkles, User, Mail, ShieldCheck, Save,
} from "lucide-react";

import { toast } from "sonner";

import {
  checkUsernameAvailability, getProfile, updateProfile, getKycStatus, uploadFileToStorage,
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
const BIO_CONTACT_REGEX = /\d|@|https?:\/\/|www\.|whats?app|e[- ]?mail|email|phone|contact|telegram|signal|wechat|imo/i;

function getBioError(value: string): string | null {
  return BIO_CONTACT_REGEX.test(value)
    ? "Bio میں نمبر، punctuation/contact details، @، email یا phone information شامل نہیں کر سکتے۔"
    : null;
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function EditProfilePage() {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const setupParam = String(new URLSearchParams(window.location.search).get("setup") ?? "").replace(/["']/g, "").trim().toLowerCase();
  const setupMode = setupParam === "1" || setupParam === "true";

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [setupCompletedAt, setSetupCompletedAt] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [usernameAvailability, setUsernameAvailability] = useState<{ available: boolean; suggestions: string[] } | null>(null);
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

  async function validateUsername() {
    const value = username.trim().toLowerCase();
    if (!value || !/^[a-zA-Z0-9_]{3,24}$/.test(value)) { setUsernameAvailability(null); return; }
    try { setUsernameAvailability(await checkUsernameAvailability(value)); } catch { setUsernameAvailability(null); }
  }

  useEffect(() => {
    if (!isAuthenticated || !user?.id) { navigate({ to: "/sign-in" }); return; }
    loadProfile();
  }, [isAuthenticated, user?.id, role]);

  async function loadProfile() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const prof = await getProfile(user.id, role);
      if (prof) {
        setFullName(prof.full_name ?? user.fullName ?? "");
        setFirstName(prof.first_name ?? ""); setLastName(prof.last_name ?? "");
        setUsername(prof.username ?? "");
        setAge(prof.age != null ? String(prof.age) : "");
        setGender(prof.gender ?? ""); setIdNumber(prof.id_number ?? "");
        setCity(prof.city ?? "");
        setCountryCode(prof.country_code ?? prof.countryCode ?? prof.country ?? "");
        setPhoneNumber(prof.phone_number ?? "");
        setBio(prof.bio ?? "");
        setPreferredLanguage(prof.preferred_language ?? prof.preferredLanguage ?? "en");
        setAvatarUrl(prof.avatar_url ?? null); setCoverUrl(prof.cover_url ?? null);
        setSetupCompletedAt(prof.profile_setup_completed_at ?? null);
      } else {
        setFullName(user.fullName ?? "");
        const nameParts = String(user.fullName || "").trim().split(/\s+/);
        setFirstName(nameParts[0] || ""); setLastName(nameParts.slice(1).join(" "));
      }
      try { const kyc = await getKycStatus(user.id); setKycStatus(kyc?.status ?? null); } catch { setKycStatus(null); }
    } catch (err) { console.error("Failed to load profile:", err); toast.error("Could not load your profile."); }
    finally { setLoading(false); }
  }

  const selectedCountry = COUNTRIES.find((country) => country.code === countryCode);
  const filteredCountries = countryQuery.trim() ? COUNTRIES.filter((country) => country.name.toLowerCase().includes(countryQuery.trim().toLowerCase())) : COUNTRIES;
  const langLabel = LANGUAGES.find((language) => language.value === preferredLanguage)?.label ?? preferredLanguage;

  function validateImage(file: File): boolean {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file."); return false; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB."); return false; }
    return true;
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !user?.id) return;
    if (!validateImage(file)) return;
    setAvatarFile(file); const localPreview = URL.createObjectURL(file); setAvatarUrl(localPreview); setAvatarUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
      const path = `avatars/${user.id}/${Date.now()}-${safeName}`;
      const uploadedUrl = await uploadFileToStorage(file, path);
      await updateProfile(user.id, { avatar_url: uploadedUrl }, role);
      setAvatarUrl(uploadedUrl); setAvatarFile(null); await refreshUser().catch(() => null);
      toast.success("Profile photo updated");
    } catch (err) {
      console.error("Avatar upload failed:", err); toast.error(err instanceof Error ? err.message : "Could not upload photo.");
    } finally { setAvatarUploading(false); }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !user?.id) return;
    if (!validateImage(file)) return;
    setCoverFile(file); const localPreview = URL.createObjectURL(file); setCoverUrl(localPreview); setCoverUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
      const path = `covers/${user.id}/${Date.now()}-${safeName}`;
      const uploadedUrl = await uploadFileToStorage(file, path);
      await updateProfile(user.id, { cover_url: uploadedUrl }, role);
      setCoverUrl(uploadedUrl); setCoverFile(null); await refreshUser().catch(() => null);
      toast.success("Cover photo updated");
    } catch (err) {
      console.error("Cover upload failed:", err); toast.error(err instanceof Error ? err.message : "Could not upload cover.");
    } finally { setCoverUploading(false); }
  }

  async function handleSaveDetails() {
    if (!user?.id) return;
    if (!fullName.trim()) { toast.error("Name can't be empty"); return; }
    if (username && !/^[a-zA-Z0-9_]{3,24}$/.test(username.trim())) { toast.error("Username must be 3–24 characters using letters, numbers, or underscore"); return; }
    const validationError = getBioError(bio);
    if (validationError) { setBioError(validationError); toast.error(validationError); return; }
    setSaving(true);
    const markSetupDone = setupMode || !setupCompletedAt;
    try {
      const profilePayload: Record<string, unknown> = {
        full_name: fullName.trim(), first_name: firstName.trim(), last_name: lastName.trim(),
        username: username.trim().toLowerCase(), age: age ? Number(age) : null, gender: gender || null,
        id_number: idNumber.trim() || null, city: city.trim(), country_code: countryCode,
        country: selectedCountry?.name || (countryCode && !selectedCountry ? countryCode : ""),
        phone_number: phoneNumber.trim(), bio: bio.trim(), preferred_language: preferredLanguage,
        avatar_url: avatarUrl, cover_url: coverUrl,
        profile_setup_completed_at: markSetupDone ? (setupCompletedAt || new Date().toISOString()) : undefined,
        updated_at: new Date().toISOString(),
      };
      let savedProfile: any;
      try { savedProfile = await updateProfile(user.id, profilePayload, role); }
      catch (firstError) {
        if (!markSetupDone) throw firstError;
        const { profile_setup_completed_at: _ignored, ...payloadWithoutMarker } = profilePayload;
        savedProfile = await updateProfile(user.id, payloadWithoutMarker, role);
      }
      if (savedProfile && savedProfile.user_id && savedProfile.user_id !== user.id) throw new Error("Profile was not saved. Please try again.");
      if (savedProfile) {
        setFullName(savedProfile.full_name ?? fullName); setCity(savedProfile.city ?? city);
        setPhoneNumber(savedProfile.phone_number ?? phoneNumber); setBio(savedProfile.bio ?? bio);
        setAvatarUrl(savedProfile.avatar_url ?? avatarUrl); setCoverUrl(savedProfile.cover_url ?? coverUrl);
        setCountryCode(savedProfile.country_code ?? savedProfile.country ?? countryCode);
        setPreferredLanguage(savedProfile.preferred_language ?? preferredLanguage);
      }
      setAvatarFile(null); setCoverFile(null);
      if (markSetupDone) { try { localStorage.setItem(`givethra_profile_setup_completed:${user.id}`, "1"); } catch {} }
      await refreshUser().catch(() => null);
      toast.success("Profile updated successfully!");
      if (markSetupDone) { setSetupCompletedAt(savedProfile?.profile_setup_completed_at ?? new Date().toISOString()); try { localStorage.setItem(`givethra_profile_setup_completed:${user.id}`, "1"); } catch {} }
      if (setupMode) { try { sessionStorage.setItem("givethra_kyc_return_to", "/"); } catch {} navigate({ to: "/kyc" }); }
      else navigate({ to: "/profile/$id", params: { id: "me" } });
    } catch (err) {
      console.error("Profile save failed:", err); toast.error(err instanceof Error ? err.message : "Could not save changes.");
    } finally { setSaving(false); }
  }

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 pb-24 pt-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
            <p className="mt-4 text-sm font-semibold text-slate-500">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const bioRemaining = BIO_MAX - bio.length;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 pb-28">
        
        {/* GLASSMORPHIC HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
            <button
              type="button"
              onClick={() => navigate({ to: "/profile/$id", params: { id: "me" } })}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">
                {setupMode ? "Create Your Profile" : "Edit Profile"}
              </h1>
              <p className="text-[11px] font-medium text-slate-500">
                {setupMode ? "Complete it once to continue" : "Update your info anytime"}
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-6 lg:flex-row">
            
            {/* MAIN FORM */}
            <div className="min-w-0 flex-1 space-y-5">
              
              {/* COVER + AVATAR CARD */}
              <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-40 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800">
                  {coverUrl && <img src={coverUrl} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={coverUploading}
                    className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-slate-900 shadow-lg backdrop-blur transition hover:bg-white disabled:opacity-70"
                  >
                    {coverUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                    {coverUploading ? "Uploading..." : "Change Cover"}
                  </button>
                  <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </div>

                <CardContent className="px-5 pb-6 pt-0">
                  <div className="relative -mt-16 mb-3 inline-block">
                    <Avatar className="h-32 w-32 rounded-3xl border-4 border-white shadow-2xl ring-1 ring-slate-200">
                      {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName || "Avatar"} className="object-cover" /> : null}
                      <AvatarFallback className="rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 text-3xl font-black text-white">
                        {fullName ? getInitials(fullName) : "G"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-950 shadow-lg transition hover:scale-110 disabled:opacity-70"
                    >
                      {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </div>

                  <p className="text-xs font-medium text-slate-500">
                    Tap the yellow camera icon to change your profile picture. Both save instantly.
                  </p>
                </CardContent>
              </Card>

              {setupMode && (
                <div className="flex items-start gap-3 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-4">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                  <div>
                    <p className="text-sm font-black text-teal-900">Complete your profile once</p>
                    <p className="mt-1 text-xs font-medium text-teal-800/80">
                      Add your name, contact, bio and images, then save. You'll be redirected to KYC next.
                    </p>
                  </div>
                </div>
              )}

              {/* PERSONAL INFO */}
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-black text-slate-900">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50"><User className="h-4 w-4 text-teal-600" /></span>
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <Input id="email" value={user?.email || ""} readOnly aria-readonly="true" className="border-0 bg-transparent p-0 py-3 focus-visible:ring-0" />
                    </div>
                    <p className="text-xs font-medium text-slate-500">Your verified sign-in email cannot be changed.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name *</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full legal name" className="h-12 rounded-xl" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-slate-500">First Name</Label><Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="h-12 rounded-xl" /></div>
                    <div className="space-y-2"><Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</Label><Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="h-12 rounded-xl" /></div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</Label>
                      <Input id="username" value={username} onChange={(e) => { setUsername(e.target.value.replace(/\s/g, "")); setUsernameAvailability(null); }} onBlur={validateUsername} placeholder="e.g. shoaib_hope" maxLength={24} className="h-12 rounded-xl" />
                      {usernameAvailability && (usernameAvailability.available ? (
                        <p className="text-xs font-bold text-emerald-600">✓ Username is available.</p>
                      ) : (
                        <div className="text-xs font-medium text-red-600">
                          <p className="font-bold">✗ Username is already taken.</p>
                          {usernameAvailability.suggestions.length > 0 && (
                            <p className="mt-1">Try: {usernameAvailability.suggestions.map((s) => (
                              <button key={s} type="button" onClick={() => { setUsername(s); setUsernameAvailability(null); }} className="mr-1 underline">{s}</button>
                            ))}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2"><Label htmlFor="age" className="text-xs font-bold uppercase tracking-wider text-slate-500">Age</Label><Input id="age" type="number" min={13} max={120} value={age} onChange={(e) => setAge(e.target.value)} placeholder="Your age" className="h-12 rounded-xl" /></div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-xs font-bold uppercase tracking-wider text-slate-500">Gender</Label>
                      <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
                        <option value="">Prefer not to say</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2"><Label htmlFor="idNumber" className="text-xs font-bold uppercase tracking-wider text-slate-500">National ID / ID Number</Label><Input id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Optional" className="h-12 rounded-xl" /></div>
                  </div>
                </CardContent>
              </Card>

              {/* LOCATION & CONTACT */}
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-black text-slate-900">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50"><MapPin className="h-4 w-4 text-teal-600" /></span>
                    Location & Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  
                  {/* Country Searchable Selector */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Country</Label>
                    <button
                      type="button"
                      onClick={() => setCountryOpen(!countryOpen)}
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium transition hover:border-teal-300"
                    >
                      <span className="flex items-center gap-3">
                        {selectedCountry ? (
                          <>
                            <span className="text-xl">{selectedCountry.flag}</span>
                            <span className="font-bold text-slate-900">{selectedCountry.name}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">Select your country</span>
                        )}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${countryOpen ? "rotate-180" : ""}`} />
                    </button>

                    {countryOpen && (
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                        <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
                          <Search className="h-4 w-4 shrink-0 text-slate-400" />
                          <input autoFocus value={countryQuery} onChange={(e) => setCountryQuery(e.target.value)} placeholder="Search country..." className="w-full bg-transparent text-sm font-medium outline-none" />
                          {countryQuery && <button type="button" onClick={() => setCountryQuery("")} className="text-slate-400"><X className="h-4 w-4" /></button>}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {filteredCountries.length === 0 ? (
                            <p className="py-6 text-center text-sm text-slate-400">No country found.</p>
                          ) : filteredCountries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => { setCountryCode(country.code); setCountryOpen(false); setCountryQuery(""); }}
                              className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50"
                            >
                              <span className="flex items-center gap-3"><span className="text-xl">{country.flag}</span><span className="font-medium">{country.name}</span></span>
                              {countryCode === country.code && <Check className="h-4 w-4 text-teal-600" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-slate-500">City</Label><Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city" className="h-12 rounded-xl" /></div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</Label>
                      <Input id="phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+92 300 1234567" className="h-12 rounded-xl" />
                      <p className="text-[11px] font-medium text-slate-500">Include country code (e.g. +92)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* BIO */}
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-black text-slate-900">Short Bio</CardTitle>
                    <span className={`text-xs font-bold ${bioRemaining < 20 ? "text-red-600" : "text-slate-400"}`}>{bio.length}/{BIO_MAX}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    id="bio" value={bio}
                    onChange={(e) => { const next = e.target.value.slice(0, BIO_MAX); setBio(next); setBioError(getBioError(next)); }}
                    placeholder="Tell the community a little about yourself..."
                    rows={4} maxLength={BIO_MAX}
                    className={`resize-none rounded-xl ${bioError ? "border-red-400 focus-visible:ring-red-300" : ""}`}
                    aria-invalid={Boolean(bioError)}
                  />
                  {bioError ? <p role="alert" className="text-xs font-bold text-red-600">{bioError}</p> : <p className="text-[11px] font-medium text-slate-500">Bio میں نمبر، punctuation، @، email یا phone information شامل نہ کریں۔</p>}
                </CardContent>
              </Card>

              {/* PREFERENCES */}
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-black text-slate-900">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50"><Globe className="h-4 w-4 text-teal-600" /></span>
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Preferred Language</Label>
                    <select value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
                      {LANGUAGES.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* STICKY ACTION BUTTONS */}
              <div className="sticky bottom-4 z-20 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row">
                <Button type="button" variant="outline" className="h-12 flex-1 rounded-xl font-bold sm:w-32" onClick={() => navigate({ to: "/profile/$id", params: { id: "me" } })} disabled={saving}>Cancel</Button>
                <Button
                  type="button"
                  className="h-12 flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 font-black text-white shadow-lg transition-transform hover:scale-[1.02]"
                  onClick={handleSaveDetails}
                  disabled={saving || avatarUploading || coverUploading || !fullName.trim()}
                >
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                </Button>
              </div>
            </div>

            {/* LIVE PREVIEW SIDEBAR */}
            <aside className="w-full shrink-0 lg:w-80">
              <div className="lg:sticky lg:top-24">
                <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                  <div className="relative h-24 bg-gradient-to-br from-teal-600 to-emerald-700">
                    {coverUrl && <img src={coverUrl} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />}
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                  <CardContent className="space-y-4 pt-0">
                    <div className="-mt-12 flex flex-col items-center gap-3 text-center">
                      <Avatar className="h-24 w-24 rounded-3xl border-4 border-white shadow-xl ring-1 ring-slate-200">
                        {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName || "Avatar"} className="object-cover" /> : null}
                        <AvatarFallback className="rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 text-2xl font-black text-white">{fullName ? getInitials(fullName) : "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-black leading-tight text-slate-900">{fullName || "Your Name"}</p>
                        {(countryCode || city) && (
                          <p className="mt-0.5 flex items-center justify-center gap-1 text-sm font-medium text-slate-500">
                            <MapPin className="h-3 w-3" />
                            {[city, selectedCountry?.name || countryCode].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                      {kycStatus && (
                        <Badge variant="outline" className={`rounded-full text-xs font-bold ${kycStatus === "approved" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-500"}`}>
                          <ShieldCheck className="mr-1 h-3 w-3" /> {kycStatus === "approved" ? "Verified" : kycStatus}
                        </Badge>
                      )}
                    </div>

                    <Separator />
                    {bio && <p className="text-center text-sm italic leading-relaxed text-slate-600">{bio}</p>}
                    <div className="space-y-2 text-sm">
                      {phoneNumber && <div className="flex items-center gap-2 text-slate-500"><Phone className="h-3.5 w-3.5 shrink-0" /><span className="truncate font-medium">{phoneNumber}</span></div>}
                      {preferredLanguage && <div className="flex items-center gap-2 text-slate-500"><Globe className="h-3.5 w-3.5 shrink-0" /><span className="font-medium">{langLabel}</span></div>}
                    </div>
                  </CardContent>
                </Card>
                <p className="mt-3 text-center text-[11px] font-semibold text-slate-400">
                  This is how others see your profile.
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </Layout>
  );
}
