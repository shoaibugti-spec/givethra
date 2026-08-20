// src/frontend/src/pages/SettingsPage.tsx
// Replaces Supabase with Cloudflare Worker APIs

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
import { useAuth } from "@/contexts/AuthContext";
import { Accessibility, AlertCircle, Bell, Globe, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getUserSettings, updateUserSettings } from "@/lib/api";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ur", label: "اردو" },
  { value: "ar", label: "العربية" },
  { value: "tr", label: "Türkçe" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "bn", label: "বাংলা" },
  { value: "hi", label: "हिंदी" },
  { value: "fa", label: "فارسی" },
  { value: "sw", label: "Swahili" },
  { value: "zh", label: "中文" },
  { value: "ru", label: "Русский" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
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
  { value: "LYD", label: "LYD 🇱🇾 Libyan Dinar" },
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

export default function SettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largerText, setLargerText] = useState(false);
  const [reducedAnimations, setReducedAnimations] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadSettings();
  }, [user]);

  async function loadSettings() {
    try {
      const data = await getUserSettings(user!.id);
      if (data) {
        setLanguage(data.language ?? "en");
        setTheme(data.theme ?? "light");
        setCurrency(data.currency ?? "USD");
        setTimezone(data.timezone ?? "UTC");
        setEmailNotif(data.email_notifications ?? true);
        setInAppNotif(data.inapp_notifications ?? true);
        setWeeklyDigest(data.weekly_digest ?? false);
        setHighContrast(data.high_contrast ?? false);
        setLargerText(data.larger_text ?? false);
        setReducedAnimations(data.reduced_animations ?? false);
        applyTheme(data.theme ?? "light");
      }
    } catch (e) {
      // ignore, use defaults
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
        updated_at: new Date().toISOString(),
      };
      await updateUserSettings(user.id, payload);
      applyTheme(theme);
      setDirty(false);
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  const mark = () => setDirty(true);

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Display</h2>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={language}
                  onValueChange={(v) => {
                    setLanguage(v);
                    mark();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
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
                <div className="flex gap-2">
                  {(["light", "dark", "system"] as Theme[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTheme(t);
                        applyTheme(t);
                        mark();
                      }}
                      className={`flex-1 py-2 px-3 text-sm rounded-xl border capitalize ${
                        theme === t
                          ? "bg-primary text-white border-primary font-semibold"
                          : "bg-background border-border"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Currency Display</Label>
                <Select
                  value={currency}
                  onValueChange={(v) => {
                    setCurrency(v);
                    mark();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={timezone}
                  onValueChange={(v) => {
                    setTimezone(v);
                    mark();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
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

          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            {[
              {
                label: "Email Notifications",
                desc: "Receive important updates to your email",
                val: emailNotif,
                set: setEmailNotif,
              },
              {
                label: "In-App Notifications",
                desc: "Show notifications inside the platform",
                val: inAppNotif,
                set: setInAppNotif,
              },
              {
                label: "Weekly Digest",
                desc: "A weekly summary of platform activity",
                val: weeklyDigest,
                set: setWeeklyDigest,
              },
            ].map(({ label, desc, val, set }) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <Switch
                  checked={val}
                  onCheckedChange={(v) => {
                    set(v);
                    mark();
                  }}
                />
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Accessibility className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Accessibility</h2>
            </div>
            {[
              {
                label: "High Contrast Mode",
                desc: "Increase contrast for better readability",
                val: highContrast,
                set: setHighContrast,
              },
              {
                label: "Larger Text",
                desc: "Increase base font size across the platform",
                val: largerText,
                set: setLargerText,
              },
              {
                label: "Reduced Animations",
                desc: "Minimize motion for a calmer experience",
                val: reducedAnimations,
                set: setReducedAnimations,
              },
            ].map(({ label, desc, val, set }) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <Switch
                  checked={val}
                  onCheckedChange={(v) => {
                    set(v);
                    mark();
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            {dirty ? (
              <div className="flex items-center gap-1.5 text-xs text-orange-500">
                <AlertCircle className="h-3.5 w-3.5" /> Unsaved changes
              </div>
            ) : (
              <div />
            )}
            <Button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="min-w-[130px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save All"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
