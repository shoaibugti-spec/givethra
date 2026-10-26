// src/components/SocialLinks.tsx  - requires: npm i react-icons
// Single social-media row used everywhere (Home, Layout footer, About, Contact).
import { SITE, SOCIALS } from "@/lib/siteConfig";
import {
  SiTiktok, SiX, SiThreads, SiYoutube, SiReddit, SiTelegram,
  SiFacebook, SiInstagram, SiWhatsapp,
} from "react-icons/si";
import { Linkedin, Mail } from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tiktok: SiTiktok, x: SiX, threads: SiThreads, youtube: SiYoutube, reddit: SiReddit,
  telegram: SiTelegram, facebook: SiFacebook, instagram: SiInstagram, linkedin: Linkedin, whatsapp: SiWhatsapp,
};

const LINK_CLASS =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-primary hover:border-primary";

export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-3 ${className}`} aria-label="Givethra on social media">
      {SOCIALS.filter((s) => s.url).map(({ key, label, url }) => {
        const Icon = ICONS[key];
        if (!Icon) return null;
        return (
          <li key={key}>
            <a href={url} target="_blank" rel="noopener noreferrer me" aria-label={`Givethra on ${label}`} title={label}
               className={LINK_CLASS}>
              <Icon className="h-5 w-5" />
            </a>
          </li>
        );
      })}
      <li>
        <a href={`mailto:${SITE.contactEmail}`} aria-label="Email Givethra" title="Email" className={LINK_CLASS}>
          <Mail className="h-5 w-5" />
        </a>
      </li>
    </ul>
  );
}
