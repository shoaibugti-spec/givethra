// src/frontend/src/pages/EditProfilePage.tsx
// Replaces Supabase with Cloudflare Worker APIs

import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, Check, Globe, ImagePlus, Loader2, MapPin, Phone } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getProfile, updateProfile, getKycStatus, uploadFileToStorage } from "@/lib/api";

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
  "Zimbabwe",
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
  { value: "sw", label: "Swahili" },
];

const BIO_MAX = 200;

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
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadProfile();
  }, [isAuthenticated]);

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await getProfile(user!.id);
      if (data) {
        setFullName(data.full_name ?? user?.fullName ?? "");
        setCountry(data.country ?? "");
        setCity(data.city ?? "");
        setPhoneNumber(data.phone_number ?? "");
        setBio(data.bio ?? "");
        setPreferredLanguage(data.preferred_language ?? "en");
        setAvatarUrl(data.avatar_url ?? null);
        setCoverUrl(data.cover_url ?? null);
      } else {
        setFullName(user?.fullName ?? "");
      }
      const kyc = await getKycStatus(user!.id);
      setKycStatus(kyc?.status ?? null);
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File, prefix: string): Promise<string | null> {
    const path = `${prefix}/${user!.id}/${Date.now()}_${file.name}`;
    try {
      const url = await uploadFileToStorage(file, path);
      return url;
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    }
  }

  async function handleSave() {
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    setSaving(true);
    try {
      let finalAvatar = avatarUrl;
      let finalCover = coverUrl;
      if (avatarFile) {
        const u = await uploadImage(avatarFile, "avatars");
        if (u) finalAvatar = u;
      }
      if (coverFile) {
        const u = await uploadImage(coverFile, "covers");
        if (u) finalCover = u;
      }
      const savedProfile = await updateProfile(user!.id, {
        full_name: fullName.trim(),
        country: country.trim(),
        city: city.trim(),
        phone_number: phoneNumber.trim(),
        bio: bio.trim(),
        preferred_language: preferredLanguage,
        avatar_url: finalAvatar,
        cover_url: finalCover,
        updated_at: new Date().toISOString(),
      });
      if (!savedProfile || savedProfile.user_id !== user!.id) {
        throw new Error("Profile was not saved. Please try again.");
      }
      setFullName(savedProfile.full_name ?? fullName);
      setCountry(savedProfile.country ?? country);
      setCity(savedProfile.city ?? city);
      setPhoneNumber(savedProfile.phone_number ?? phoneNumber);
      setBio(savedProfile.bio ?? bio);
      setAvatarUrl(savedProfile.avatar_url ?? finalAvatar);
      setCoverUrl(savedProfile.cover_url ?? finalCover);
      setAvatarFile(null);
      setCoverFile(null);
      await refreshUser().catch(() => null);
      toast.success("Profile updated successfully!");
      navigate({ to: "/profile/$id", params: { id: "me" } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">Loading profile...</div>
      </Layout>
    );
  }

  const bioRemaining = BIO_MAX - bio.length;
  const langLabel = LANGUAGES.find((l) => l.value === preferredLanguage)?.label ?? preferredLanguage;
  const shownAvatar = avatarPreview || avatarUrl;
  const shownCover = coverPreview || coverUrl;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/profile/$id", params: { id: "me" } })}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground text-lg">Edit Profile</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-5">
            {/* Cover photo */}
            <Card className="border border-border overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-primary via-primary/80 to-primary/40">
                {shownCover && (
                  <img src={shownCover} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/50 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-black/70 transition-colors"
                >
                  <ImagePlus className="h-3.5 w-3.5" /> Change Cover
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>
              <CardContent className="pt-6">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                      {shownAvatar ? <AvatarImage src={shownAvatar} alt={fullName} /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                        {fullName ? getInitials(fullName) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 h-7 w-7 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                      aria-label="Change photo"
                    >
                      <Camera className="h-3.5 w-3.5 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Profile Photo</p>
                    <p className="text-sm text-muted-foreground mt-0.5">JPG, PNG or GIF up to 5 MB</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-sm text-primary hover:underline font-medium"
                    >
                      Change photo
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full legal name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country
                    </Label>
                    <Select
                      value={country || "none"}
                      onValueChange={(v) => setCountry(v === "none" ? "" : v)}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 overflow-y-auto">
                        <SelectItem value="none">Select country</SelectItem>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+92 300 1234567"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code, e.g. +92 for Pakistan
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio" className="text-sm font-medium">
                      Short Bio
                    </Label>
                    <span
                      className={`text-xs ${
                        bioRemaining < 20 ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {bioRemaining} / {BIO_MAX}
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
                    placeholder="Tell others a little about yourself..."
                    rows={3}
                    className="resize-none"
                    maxLength={BIO_MAX}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Preferred Language</Label>
                  <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none sm:w-32"
                onClick={() => navigate({ to: "/profile/$id", params: { id: "me" } })}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleSave}
                disabled={saving || !fullName.trim()}
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

          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-20">
              <Card className="border border-border shadow-sm overflow-hidden">
                <div className="relative h-20 bg-gradient-to-br from-primary via-primary/80 to-primary/40">
                  {shownCover && (
                    <img src={shownCover} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                </div>
                <CardContent className="space-y-4 pt-0">
                  <div className="flex flex-col items-center text-center gap-3 -mt-10">
                    <Avatar className="h-20 w-20 ring-4 ring-card">
                      {shownAvatar ? <AvatarImage src={shownAvatar} alt={fullName} /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                        {fullName ? getInitials(fullName) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground text-lg leading-tight">
                        {fullName || "Your Name"}
                      </p>
                      {(country || city) && (
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {[city, country].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                    {kycStatus && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          kycStatus === "approved"
                            ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {kycStatus === "approved" ? "Verified" : kycStatus}
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
                        <span className="truncate">{phoneNumber}</span>
                      </div>
                    )}
                    {preferredLanguage && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span>{langLabel}</span>
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
  );
}
