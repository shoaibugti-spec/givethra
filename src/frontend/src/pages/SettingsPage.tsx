import type { UserSettingsPublic } from "@/backend";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useBackendActor } from "@/hooks/useBackend";
import {
  Accessibility,
  AlertCircle,
  Bell,
  Globe,
  Save,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

const CURRENCIES = [
  { value: "USD", label: "USD \ud83c\uddfa\ud83c\uddf8" },
  { value: "PKR", label: "PKR \ud83c\uddf5\ud83c\uddf0" },
  { value: "SAR", label: "SAR \ud83c\uddf8\ud83c\udde6" },
  { value: "TRY", label: "TRY \ud83c\uddf9\ud83c\uddf7" },
  { value: "AED", label: "AED \ud83c\udde6\ud83c\uddea" },
  { value: "INR", label: "INR \ud83c\uddee\ud83c\uddf3" },
  { value: "GBP", label: "GBP \ud83c\uddec\ud83c\udde7" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "UTC-5 New York" },
  { value: "America/Chicago", label: "UTC-6 Chicago" },
  { value: "America/Denver", label: "UTC-7 Denver" },
  { value: "America/Los_Angeles", label: "UTC-8 Los Angeles" },
  { value: "America/Sao_Paulo", label: "UTC-3 S\u00e3o Paulo" },
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
  { value: "Pacific/Auckland", label: "UTC+12 Auckland" },
];

type Theme = "light" | "dark" | "system";

function applyTheme(t: Theme) {
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
  title,
}: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-primary">{icon}</div>
      <h2 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h2>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  ocid,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  ocid?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        data-ocid={ocid}
      />
    </div>
  );
}

export default function SettingsPage() {
  const { actor, isFetching } = useBackendActor();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState<Theme>("system");
  const [currencyDisplay, setCurrencyDisplay] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largerText, setLargerText] = useState(false);
  const [reducedAnimations, setReducedAnimations] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    actor
      .getUserSettings()
      .then((s: UserSettingsPublic | null) => {
        if (s) {
          setLanguage(s.language || "en");
          setTheme((s.theme as Theme) || "system");
          setCurrencyDisplay(s.currencyDisplay || "USD");
          setTimezone(s.timezone || "UTC");
          setEmailNotifications(s.emailNotifications);
          setInAppNotifications(s.inAppNotifications);
          setWeeklyDigest(s.weeklyDigest);
          setHighContrast(s.highContrast);
          setLargerText(s.largerText);
          setReducedAnimations(s.reducedAnimations);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor, isFetching]);

  const mark = () => setDirty(true);

  function handleThemeChange(val: Theme) {
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
        reducedAnimations,
      );
      setDirty(false);
      toast.success("Settings saved successfully.");
    } catch {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div
        className="max-w-xl mx-auto px-4 pt-6 pb-28"
        data-ocid="settings.page"
      >
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Settings
          </h1>
        </div>

        {loading ? (
          <div className="space-y-4" data-ocid="settings.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-card border border-border p-5 h-48 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Display */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <SectionHeader
                icon={<Globe className="h-5 w-5" />}
                title="Display"
              />
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={language}
                    onValueChange={(v) => {
                      setLanguage(v);
                      mark();
                    }}
                  >
                    <SelectTrigger
                      id="language"
                      data-ocid="settings.language.select"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-2" data-ocid="settings.theme.toggle">
                    {(["light", "dark", "system"] as Theme[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleThemeChange(t)}
                        className={`flex-1 py-2 px-3 text-sm rounded-xl border transition-colors duration-200 capitalize ${
                          theme === t
                            ? "bg-primary text-primary-foreground border-primary font-semibold"
                            : "bg-background text-foreground border-border hover:border-primary/50"
                        }`}
                        data-ocid={`settings.theme.${t}`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Display</Label>
                  <Select
                    value={currencyDisplay}
                    onValueChange={(v) => {
                      setCurrencyDisplay(v);
                      mark();
                    }}
                  >
                    <SelectTrigger
                      id="currency"
                      data-ocid="settings.currency.select"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={timezone}
                    onValueChange={(v) => {
                      setTimezone(v);
                      mark();
                    }}
                  >
                    <SelectTrigger
                      id="timezone"
                      data-ocid="settings.timezone.select"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <SectionHeader
                icon={<Bell className="h-5 w-5" />}
                title="Notifications"
              />
              <ToggleRow
                label="Email Notifications"
                description="Receive important updates to your email"
                checked={emailNotifications}
                onCheckedChange={(v) => {
                  setEmailNotifications(v);
                  mark();
                }}
                ocid="settings.email_notifications.switch"
              />
              <ToggleRow
                label="In-App Notifications"
                description="Show notifications inside the platform"
                checked={inAppNotifications}
                onCheckedChange={(v) => {
                  setInAppNotifications(v);
                  mark();
                }}
                ocid="settings.inapp_notifications.switch"
              />
              <ToggleRow
                label="Weekly Digest"
                description="A weekly summary of platform activity"
                checked={weeklyDigest}
                onCheckedChange={(v) => {
                  setWeeklyDigest(v);
                  mark();
                }}
                ocid="settings.weekly_digest.switch"
              />
            </div>

            {/* Accessibility */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <SectionHeader
                icon={<Accessibility className="h-5 w-5" />}
                title="Accessibility"
              />
              <ToggleRow
                label="High Contrast Mode"
                description="Increase contrast for better readability"
                checked={highContrast}
                onCheckedChange={(v) => {
                  setHighContrast(v);
                  mark();
                }}
                ocid="settings.high_contrast.switch"
              />
              <ToggleRow
                label="Larger Text"
                description="Increase base font size across the platform"
                checked={largerText}
                onCheckedChange={(v) => {
                  setLargerText(v);
                  mark();
                }}
                ocid="settings.larger_text.switch"
              />
              <ToggleRow
                label="Reduced Animations"
                description="Minimize motion for a calmer experience"
                checked={reducedAnimations}
                onCheckedChange={(v) => {
                  setReducedAnimations(v);
                  mark();
                }}
                ocid="settings.reduced_animations.switch"
              />
            </div>

            {/* Save */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {dirty ? (
                <div className="flex items-center gap-1.5 text-xs text-orange-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Unsaved changes
                </div>
              ) : (
                <div />
              )}
              <Button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="min-w-[130px]"
                data-ocid="settings.save_button"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save All"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
