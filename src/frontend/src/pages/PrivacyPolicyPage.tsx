import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/lib/siteConfig";
import { Link } from "@tanstack/react-router";

const sections: LegalSection[] = [
  { title: "Who we are", paragraphs: [
    `Givethra ("we") is the controller of personal data processed through ${SITE.url} and our apps. Operating location: ${[SITE.operatorProvince, SITE.operatorRegion].filter(Boolean).join(", ")}. Contact for privacy: ${SITE.privacyEmail}.`,
  ]},
  { title: "Data we collect", bullets: [
    "Account data: name, email address and profile picture from Google sign-in; profile details you add.",
    "Verification data (Help Seekers only): ID document, selfie or identity recording, appeal video, bank statements, bills, fee slips, medical reports, rental or landlord evidence and any other evidence you provide or we request.",
    "Case and activity data: category, description, amounts, status, payment proofs, contribution records, posts, support given and received, withdrawal requests.",
    "Payment and credit data: deposit receipts, transaction references, credit balance. We do not store full card numbers; payment providers handle those.",
    "Technical data: IP address, device and browser type, app version, language, time zone, log and security events.",
    "Cookies and similar technologies, based on your choices (see the Cookie Policy).",
    "Support messages you send us by email, WhatsApp or Telegram.",
  ]},
  { title: "How and why we use data (legal bases)", paragraphs: [
    "Where laws such as the EU/UK GDPR apply, we rely on these bases:",
  ], bullets: [
    "Contract: to create your account, run verification, deliver features and process credits and withdrawals.",
    "Legitimate interests: fraud prevention, platform security, service improvement and enforcing our rules, balanced against your rights.",
    "Consent: optional cookies, and publishing your image, story or video for promotion. You can withdraw consent at any time.",
    "Legal obligation: record-keeping, sanctions, anti-money-laundering and responding to lawful requests.",
    "Explicit consent / necessity: identity documents and recordings are used only for verification; they may include sensitive information (for example health records) which we use only for the purpose you provided it.",
  ]},
  { title: "Who can see your information", bullets: [
    "Private verification documents are visible only to authorised Verification Team members who need them. Heroes, direct contributors, other users and the public cannot access them.",
    "Public case pages show only the approved description, purpose, status, amount needed and, where you consented, a limited identity-confirmation image.",
    "An eligible Hero who unlocks your case can view your appeal video through authenticated, time-limited, play-only streaming without a download button, and sees only the payment reference needed to help. We cannot promise that streaming can never be captured by external tools.",
    "Service providers (processors) acting on our instructions: cloud hosting and storage, authentication (Google), email, analytics (if you consent) and payment providers.",
    "Authorities or advisers where required by law, to protect rights and safety, or in a business transfer, with safeguards.",
    "We do not sell your personal data and we do not share it for cross-context behavioural advertising.",
  ]},
  { title: "International transfers", paragraphs: [
    "Givethra is used worldwide and our providers may process data in countries other than yours. Where required, we use safeguards such as standard contractual clauses or equivalent mechanisms.",
  ]},
  { title: "Retention", bullets: [
    "Rejected applications: documents and recordings are deleted according to a documented schedule after the review and correction period ends, except where law requires longer retention; backups are overwritten on their normal cycle.",
    "Approved and completed cases: only the limited records needed to evidence verification and completed assistance are kept, for a defined period. Hero access to private videos ends when a case is completed.",
    "Account and transaction records: kept as long as your account is active and afterwards for legal, tax, accounting and dispute purposes.",
    "Security logs: kept for a limited period for audit and abuse prevention.",
  ]},
  { title: "Security", paragraphs: [
    "We use role-based access control, encrypted transmission, protected storage, audit logs, backups and incident-response procedures, and we restrict sensitive documents technically rather than only by policy. No system is perfectly secure; if a breach affecting you occurs we will notify you and regulators as required by law.",
  ]},
  { title: "Your rights", paragraphs: [
    "Depending on where you live (for example under the GDPR/UK GDPR, CCPA/CPRA and other US state laws, Brazil's LGPD, Canada's PIPEDA, Pakistan's data-protection rules, and similar laws), you may have the right to access, correct, delete, restrict or object to processing, port your data, withdraw consent and not be discriminated against for exercising rights. You can also opt out of the sale or sharing of personal data - we do not sell or share it.",
  ], bullets: [
    "Download your data and delete your account yourself under Privacy & Account.",
    `Or email ${SITE.privacyEmail}. We may need to verify your identity and will respond within the time required by law (generally within one month).`,
    "You may complain to your local data-protection authority (for example your national supervisory authority in the EU/UK, or the relevant state attorney general in the US).",
    "We honour the Global Privacy Control signal for optional cookies.",
  ]},
  { title: "Children", paragraphs: [
    `Givethra is for adults aged ${SITE.minAge}+. We do not knowingly collect data from children. If you believe a child has given us data, contact ${SITE.privacyEmail} and we will delete it. Education requests may refer to a student; they must be submitted by an adult guardian.`,
  ]},
  { title: "Google sign-in", paragraphs: [
    "We use Google Sign-In and receive only your basic profile (name, email, picture). Our use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. You can revoke access in your Google Account settings.",
  ]},
  { title: "Automated decisions", paragraphs: [
    "Verification decisions are made by people, assisted by tools. Cooldown, fee and suspension rules are applied automatically by the system; you can ask for human review of any decision by contacting us.",
  ]},
  { title: "Changes and contact", paragraphs: [
    `We will post updates here and notify you of material changes. Contact: ${SITE.privacyEmail}.`,
  ]},
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" sections={sections}
      intro="We take dignity and privacy seriously. This policy explains what we collect, why, who can see it and the choices you have.">
      <p className="text-sm">
        Manage your data now: <Link to="/privacy" className="text-primary underline">Privacy &amp; Account</Link>
      </p>
    </LegalPage>
  );
}
