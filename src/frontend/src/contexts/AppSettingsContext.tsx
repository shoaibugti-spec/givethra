import type { UserSettingsPublic } from "@/backend";
import { useBackendActor } from "@/hooks/useBackend";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";

export interface AppSettingsState {
  language: string;
  theme: Theme;
  currencyDisplay: string;
  timezone: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  weeklyDigest: boolean;
  highContrast: boolean;
  largerText: boolean;
  reducedAnimations: boolean;
}

export interface AppSettingsContextValue extends AppSettingsState {
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const DEFAULT_SETTINGS: AppSettingsState = {
  language: "en",
  theme: "light",
  currencyDisplay: "USD",
  timezone: "UTC",
  emailNotifications: true,
  inAppNotifications: true,
  weeklyDigest: false,
  highContrast: false,
  largerText: false,
  reducedAnimations: false,
};

const CURRENCY_LOCALES: Record<string, string> = {
  USD: "en-US",
  PKR: "en-PK",
  SAR: "ar-SA",
  TRY: "tr-TR",
  AED: "en-AE",
  INR: "en-IN",
  GBP: "en-GB",
};

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    // 'light' and 'system' both resolve to light mode by default.
    // Dark mode is only applied when the user explicitly saved 'dark' in settings.
    root.classList.remove("dark");
  }
}

function applyAccessibilityClasses(
  highContrast: boolean,
  largerText: boolean,
  reducedAnimations: boolean,
) {
  const root = document.documentElement;
  root.classList.toggle("givethra-high-contrast", highContrast);
  root.classList.toggle("givethra-larger-text", largerText);
  root.classList.toggle("givethra-reduced-animations", reducedAnimations);
}

function normalizeSettings(s: UserSettingsPublic | null): AppSettingsState {
  if (!s) return DEFAULT_SETTINGS;
  return {
    language: s.language || DEFAULT_SETTINGS.language,
    theme: (s.theme as Theme) || DEFAULT_SETTINGS.theme,
    currencyDisplay: s.currencyDisplay || DEFAULT_SETTINGS.currencyDisplay,
    timezone: s.timezone || DEFAULT_SETTINGS.timezone,
    emailNotifications: s.emailNotifications,
    inAppNotifications: s.inAppNotifications,
    weeklyDigest: s.weeklyDigest,
    highContrast: s.highContrast,
    largerText: s.largerText,
    reducedAnimations: s.reducedAnimations,
  };
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useBackendActor();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettingsState>(DEFAULT_SETTINGS);

  const refreshSettings = useCallback(async () => {
    if (!actor) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // getUserSettings() uses the caller principal — no userId needed
      const raw = await actor.getUserSettings();
      const next = normalizeSettings(raw);
      setSettings(next);
      applyThemeClass(next.theme);
      applyAccessibilityClasses(
        next.highContrast,
        next.largerText,
        next.reducedAnimations,
      );
    } catch (err) {
      console.error("[AppSettings] Failed to load settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  // Load settings on mount when actor becomes available
  useEffect(() => {
    if (!actor || isFetching) return;
    refreshSettings();
  }, [actor, isFetching, refreshSettings]);

  // Re-apply theme/accessibility whenever settings change
  useEffect(() => {
    applyThemeClass(settings.theme);
    applyAccessibilityClasses(
      settings.highContrast,
      settings.largerText,
      settings.reducedAnimations,
    );
  }, [
    settings.theme,
    settings.highContrast,
    settings.largerText,
    settings.reducedAnimations,
  ]);

  const formatCurrency = useCallback(
    (amount: number) => {
      const locale = CURRENCY_LOCALES[settings.currencyDisplay] || "en-US";
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: settings.currencyDisplay,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    },
    [settings.currencyDisplay],
  );

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      ...settings,
      isLoading,
      refreshSettings,
      formatCurrency,
    }),
    [settings, isLoading, refreshSettings, formatCurrency],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    // Graceful fallback so components don't crash if used outside provider
    return {
      ...DEFAULT_SETTINGS,
      isLoading: false,
      refreshSettings: async () => undefined,
      formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
    };
  }
  return ctx;
}
