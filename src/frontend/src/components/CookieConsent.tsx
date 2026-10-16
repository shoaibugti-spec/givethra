// src/components/CookieConsent.tsx
// Mount once in the root layout:  <CookieConsent />   Footer link: <button onClick={openCookieSettings}>Cookie settings</button>
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { getConsent, saveConsent, initConsentDefaults, hasGpc, OPEN_SETTINGS_EVENT } from "@/lib/consent";

const CATS = [
  { id: "necessary", title: "Strictly necessary", locked: true,
    text: "Sign-in (Google), security, fraud prevention, load balancing and remembering your choices. The site cannot work without these." },
  { id: "preferences", title: "Preferences", locked: false,
    text: "Remember settings such as language, theme and display options." },
  { id: "analytics", title: "Analytics", locked: false,
    text: "Help us understand how the site is used so we can fix problems and improve it. Data is aggregated." },
  { id: "marketing", title: "Marketing & social media", locked: false,
    text: "Used to measure campaigns and to load embedded content from social platforms that may set their own cookies." },
] as const;

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs] = useState({ preferences: false, analytics: false, marketing: false });

  useEffect(() => {
    initConsentDefaults();
    const existing = getConsent();
    if (existing) setPrefs({ preferences: existing.preferences, analytics: existing.analytics, marketing: existing.marketing });
    else if (!hasGpc()) setOpen(true);
    const reopen = () => { setCustomize(true); setOpen(true); };
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  const commit = (p: typeof prefs, src: "banner" | "settings" = "banner") => { saveConsent(p, src); setOpen(false); setCustomize(false); };
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="false" aria-labelledby="cc-title"
         className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center gap-2">
          <Cookie className="h-5 w-5 text-primary" />
          <h2 id="cc-title" className="font-semibold text-foreground">Your privacy choices</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We use essential cookies to run Givethra securely. With your permission we also use optional cookies for
          preferences, analytics and marketing. You can accept, reject or choose, and change your mind at any time via
          "Cookie settings" in the footer. See our <Link to="/cookies" className="text-primary underline">Cookie Policy</Link> and{" "}
          <Link to="/privacy-policy" className="text-primary underline">Privacy Policy</Link>.
        </p>

        {customize && (
          <ul className="space-y-3">
            {CATS.map((c) => (
              <li key={c.id} className="rounded-xl border border-border p-3">
                <label className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-medium text-foreground">{c.title}</span>
                    <span className="block text-xs text-muted-foreground mt-1">{c.text}</span>
                  </span>
                  <input
                    type="checkbox" className="mt-1 h-5 w-5 accent-[hsl(var(--primary))] shrink-0"
                    checked={c.locked ? true : prefs[c.id as keyof typeof prefs]} disabled={c.locked}
                    onChange={(e) => setPrefs({ ...prefs, [c.id]: e.target.checked })}
                    aria-label={c.title}
                  />
                </label>
              </li>
            ))}
          </ul>
        )}

        {/* Equal prominence for Accept / Reject (required by EU/UK regulators) */}
        <div className="grid gap-2 sm:grid-cols-3">
          <Button variant="outline" onClick={() => commit({ preferences: false, analytics: false, marketing: false })}>Reject all</Button>
          {customize
            ? <Button variant="outline" onClick={() => commit(prefs, "settings")}>Save choices</Button>
            : <Button variant="outline" onClick={() => setCustomize(true)}>Customize</Button>}
          <Button onClick={() => commit({ preferences: true, analytics: true, marketing: true })}>Accept all</Button>
        </div>
      </div>
    </div>
  );
}
