// src/components/SocialLinks.tsx  - requires: npm i react-icons
import { SOCIALS } from "@/lib/siteConfig";
import {
  SiTiktok, SiX, SiThreads, SiYoutube, SiReddit, SiTelegram,
  SiFacebook, SiInstagram, SiWhatsapp,
} from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tiktok: SiTiktok, x: SiX, threads: SiThreads, youtube: SiYoutube, reddit: SiReddit,
  telegram: SiTelegram, facebook: SiFacebook, instagram: SiInstagram, linkedin: FaLinkedin, whatsapp: SiWhatsapp,
};

export default function SocialLinks() {
  return (
    <ul className="flex flex-wrap items-center gap-3" aria-label="Givethra on social media">
      {SOCIALS.filter((s) => s.url).map(({ key, label, url }) => {
        const Icon = ICONS[key];
        return (
          <li key={key}>
            <a href={url} target="_blank" rel="noopener noreferrer me" aria-label={`Givethra on ${label}`} title={label}
               className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-primary hover:border-primary">
              <Icon className="h-5 w-5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
