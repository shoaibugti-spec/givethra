import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/lib/siteConfig";

const sections: LegalSection[] = [
  { title: "What you can report", bullets: [
    "Fraud, fake or forged documents, or duplicate accounts.",
    "Anyone asking for money, passwords or codes, or impersonating Givethra.",
    "Harassment, hate, threats, sexual content or content involving minors.",
    "Privacy violations such as shared documents, videos or private details.",
    "Intellectual-property infringement.",
  ]},
  { title: "How to report", bullets: [
    "Use the report option on a post or case, or email " + SITE.supportEmail + " with links and screenshots.",
    "For copyright claims email " + SITE.legalEmail + " with the work, the infringing URL, your contact details and a good-faith statement.",
    "If someone is in immediate danger, contact local emergency services first.",
  ]},
  { title: "What we do", paragraphs: [
    "We review reports promptly, remove content that breaks our rules, restrict or ban accounts, and cooperate with law enforcement where the law requires. Reports of child sexual abuse material are removed immediately and reported to the relevant authorities. Where an account is actioned we explain why and offer an appeal.",
  ]},
  { title: "Blocking", paragraphs: ["You can block or mute another user to stop seeing their posts."] },
];

export default function ReportAbusePage() {
  return <LegalPage title="Report a Problem" sections={sections} intro="Help us keep Givethra safe and trustworthy." />;
}
