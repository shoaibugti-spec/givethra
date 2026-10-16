// src/components/LegalFooter.tsx  - drop into your Layout footer
import { Link } from "@tanstack/react-router";
import SocialLinks from "@/components/SocialLinks";
import { openCookieSettings } from "@/lib/consent";
import { SITE } from "@/lib/siteConfig";

const GROUPS = [
  { title: "Givethra", links: [["/about", "About"], ["/faq", "FAQ"], ["/contact", "Contact"], ["/report", "Report a problem"]] },
  { title: "Legal", links: [["/terms", "Terms & Conditions"], ["/privacy-policy", "Privacy Policy"], ["/cookies", "Cookie Policy"], ["/disclaimer", "Disclaimer"], ["/accessibility", "Accessibility"]] },
  { title: "Policies", links: [["/community-guidelines", "Community Guidelines"], ["/verification-policy", "Verification & Data Retention"], ["/credits-refunds", "Credits, Fees & Refunds"], ["/donation-policy", "Donation Policy"], ["/community-support", "Support & Withdrawals"], ["/shop-dream-now-rules", "Shop Dream Now Rules"]] },
] as const;

export default function LegalFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {GROUPS.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <h3 className="text-sm font-semibold mb-3">{g.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {g.links.map(([to, label]) => (
                  <li key={to}><Link to={to} className="hover:text-primary">{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <SocialLinks />
        <div className="flex flex-col gap-2 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. {SITE.tagline}</p>
          <button type="button" onClick={openCookieSettings} className="text-left underline hover:text-primary">Cookie settings</button>
        </div>
      </div>
    </footer>
  );
}
