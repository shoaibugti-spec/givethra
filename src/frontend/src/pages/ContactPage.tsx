import LegalPage, { type LegalSection } from "@/components/LegalPage";
import SocialLinks from "@/components/SocialLinks";
import { SITE } from "@/lib/siteConfig";

const sections: LegalSection[] = [
  { title: "Get in touch", bullets: [
    `General and technical support: ${SITE.supportEmail}`,
    `Privacy requests (access, deletion, complaints): ${SITE.privacyEmail}`,
    `Legal notices, copyright and law-enforcement requests: ${SITE.legalEmail}`,
    "WhatsApp and Telegram are guidance and technical-support channels only.",
  ]},
  { title: "Stay safe", bullets: [
    "We will never ask for your password, verification codes or money for approval.",
    "Do not send documents over chat. Create your account on the official website and upload documents there.",
    `Official website: ${SITE.url}`,
  ]},
  { title: "Where we operate", paragraphs: [`${[SITE.operatorProvince, SITE.operatorRegion].filter(Boolean).join(", ")}.`] },
];

export default function ContactPage() {
  return (
    <LegalPage title="Contact Us" sections={sections} intro="We aim to reply within a few business days.">
      <div className="space-y-2"><p className="text-sm font-semibold">Follow our official accounts</p><SocialLinks /></div>
    </LegalPage>
  );
}
