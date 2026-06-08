import type { FileRef, UserPublic } from "@/backend";
import Layout from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
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
import { getBackendActor } from "@/lib/actor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  Check,
  Globe,
  Loader2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  { value: "UTC+14:00", label: "UTC+14:00 (Kiribati)" },
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

interface FormState {
  fullName: string;
  country: string;
  city: string;
  phoneNumber: string;
  bio: string;
  preferredLanguage: string;
  timezone: string;
  avatarRef: FileRef | null;
  avatarPreview: string | null;
}

function ProfilePreview({
  form,
  kycStatus,
}: { form: FormState; kycStatus?: string }) {
  const langLabel =
    LANGUAGES.find((l) => l.value === form.preferredLanguage)?.label ??
    form.preferredLanguage;
  return (
    <Card
      className="border border-border shadow-sm"
      data-ocid="edit_profile.preview_card"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Profile Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center text-center gap-3">
          <Avatar className="h-20 w-20 ring-2 ring-primary/20">
            {form.avatarPreview ? (
              <AvatarImage src={form.avatarPreview} alt={form.fullName} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {form.fullName ? getInitials(form.fullName) : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground text-lg leading-tight">
              {form.fullName || "Your Name"}
            </p>
            {(form.country || form.city) && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {[form.city, form.country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          {kycStatus && (
            <Badge
              variant="outline"
              className={`text-xs ${
                kycStatus === "Approved"
                  ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950"
                  : "border-border text-muted-foreground"
              }`}
            >
              {kycStatus === "Approved" ? "Verified" : kycStatus}
            </Badge>
          )}
        </div>
        <Separator />
        {form.bio && (
          <p className="text-sm text-muted-foreground italic leading-relaxed text-center">
            {form.bio}
          </p>
        )}
        <div className="space-y-2 text-sm">
          {form.phoneNumber && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{form.phoneNumber}</span>
            </div>
          )}
          {form.preferredLanguage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span>{langLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function EditProfilePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const actor = getBackendActor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading: profileLoading } =
    useQuery<UserPublic | null>({
      queryKey: ["callerProfile"],
      queryFn: async () => {
        if (!actor) return null;
        return actor.getCallerUserProfile();
      },
      enabled: !!actor && isAuthenticated,
    });

  const [form, setForm] = useState<FormState>({
    fullName: "",
    country: "",
    city: "",
    phoneNumber: "",
    bio: "",
    preferredLanguage: "en",
    timezone: "UTC+00:00",
    avatarRef: null,
    avatarPreview: null,
  });

  useEffect(() => {
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
        avatarPreview: null,
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
        form.avatarRef ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      toast.success("Profile updated successfully!");
      navigate({ to: "/profile/$id", params: { id: "me" } });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again.",
      );
    },
  });

  function handleAvatarClick() {
    fileInputRef.current?.click();
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
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm((f) => ({ ...f, avatarPreview: dataUrl }));
    };
    reader.readAsDataURL(file);
    setForm((f) => ({
      ...f,
      avatarRef: {
        mimeType: file.type,
        fileName: file.name,
        storageId: `upload:${file.name}`,
      },
    }));
  }

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center p-6">
          <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-2">Sign in required</p>
          <p className="text-muted-foreground text-sm mb-4">
            Please sign in to edit your profile.
          </p>
          <Button
            onClick={() => navigate({ to: "/sign-in" })}
            data-ocid="edit_profile.sign_in_button"
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading profile..." />
      </div>
    );
  }

  const bioRemaining = BIO_MAX - form.bio.length;

  return (
    <div
      className="min-h-screen bg-background pb-24"
      data-ocid="edit_profile.page"
    >
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate({ to: "/profile/$id", params: { id: "me" } })
            }
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Back to profile"
            data-ocid="edit_profile.back_button"
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
          <div className="flex-1 min-w-0 space-y-5">
            <Card className="border border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                      {form.avatarPreview ? (
                        <AvatarImage
                          src={form.avatarPreview}
                          alt={form.fullName}
                        />
                      ) : form.avatarRef?.storageId &&
                        !form.avatarRef.storageId.startsWith("upload:") ? (
                        <AvatarImage
                          src={form.avatarRef.storageId}
                          alt={form.fullName}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                        {form.fullName ? getInitials(form.fullName) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="absolute -bottom-1 -right-1 h-7 w-7 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                      aria-label="Change profile photo"
                      data-ocid="edit_profile.avatar_upload_button"
                    >
                      <Camera className="h-3.5 w-3.5 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      aria-label="Upload profile photo"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Profile Photo</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      JPG, PNG or GIF up to 5 MB
                    </p>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="mt-2 text-sm text-primary hover:underline font-medium"
                      data-ocid="edit_profile.change_photo_link"
                    >
                      Change photo
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    placeholder="Your full legal name"
                    data-ocid="edit_profile.full_name_input"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country
                    </Label>
                    <Select
                      value={form.country || "none"}
                      onValueChange={(v) =>
                        setField("country", v === "none" ? "" : v)
                      }
                    >
                      <SelectTrigger
                        id="country"
                        data-ocid="edit_profile.country_select"
                      >
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
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
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                      placeholder="Your city"
                      data-ocid="edit_profile.city_input"
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
                    value={form.phoneNumber}
                    onChange={(e) => setField("phoneNumber", e.target.value)}
                    placeholder="+1 234 567 8900"
                    data-ocid="edit_profile.phone_input"
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
                      className={`text-xs ${bioRemaining < 20 ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {bioRemaining} / {BIO_MAX}
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) =>
                      setField("bio", e.target.value.slice(0, BIO_MAX))
                    }
                    placeholder="Tell others a little about yourself..."
                    rows={3}
                    className="resize-none"
                    maxLength={BIO_MAX}
                    data-ocid="edit_profile.bio_textarea"
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
                  <Label className="text-sm font-medium">
                    Preferred Language
                  </Label>
                  <Select
                    value={form.preferredLanguage}
                    onValueChange={(v) => setField("preferredLanguage", v)}
                  >
                    <SelectTrigger data-ocid="edit_profile.language_select">
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
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Timezone</Label>
                  <Select
                    value={form.timezone}
                    onValueChange={(v) => setField("timezone", v)}
                  >
                    <SelectTrigger data-ocid="edit_profile.timezone_select">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
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
                onClick={() =>
                  navigate({ to: "/profile/$id", params: { id: "me" } })
                }
                disabled={updateMutation.isPending}
                data-ocid="edit_profile.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => updateMutation.mutate()}
                disabled={
                  updateMutation.isPending || !form.fullName.trim() || !actor
                }
                data-ocid="edit_profile.save_button"
              >
                {updateMutation.isPending ? (
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
              <ProfilePreview form={form} kycStatus={profile?.kycStatus} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
