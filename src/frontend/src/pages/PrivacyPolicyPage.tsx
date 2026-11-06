// src/pages/PrivacyPolicyPage.tsx
// Global Privacy Policy — GDPR, CCPA, Play Store, Google API Compliance.

import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/lib/siteConfig";
import { Link } from "@tanstack/react-router";

const sections: LegalSection[] = [
  {
    title: "Who We Are",
    paragraphs: [
      `Givethra ("we", "us", "our") is the data controller for personal information processed through ${SITE.url} and our mobile applications. We operate globally and comply with applicable data protection laws in every region we serve.`,
      `Operating location: ${[SITE.operatorProvince, SITE.operatorRegion].filter(Boolean).join(", ")}.`,
      `Data Protection Contact (DPO): ${SITE.privacyEmail}. All data requests are acknowledged within 72 hours and resolved within the legally required timeframe (usually 30 days).`,
    ],
  },
  {
    title: "Data We Collect",
    paragraphs: [
      "We collect only the minimum data necessary to operate Givethra safely and lawfully. Categories:",
    ],
    bullets: [
      "Account Data: Name, email address, and profile picture from Google Sign-In; profile details you add (phone, city, bio, language).",
      "Verification Data (Help Seekers): Government-issued ID, selfie, live video recording, bank statements, utility bills, fee challans, medical reports, rental agreements, landlord information, and any other evidence you provide for verification.",
      "Case & Activity Data: Case category, description, amounts, status, payment proofs, contribution records, posts, comments, support given/received, withdrawal requests.",
      "Payment & Credit Data: Deposit receipts, transaction references, credit balance. We never store full card numbers — payment providers handle card data directly under PCI-DSS compliance.",
      "Technical Data: IP address, device type, browser, app version, language, time zone, and security logs.",
      "Cookies & Similar Technologies: Only with your consent (see our Cookie Policy for full details).",
      "Support Communications: Messages sent via email, WhatsApp, Telegram, or in-app support.",
    ],
  },
  {
    title: "Legal Bases for Processing (GDPR Article 6)",
    paragraphs: [
      "Where GDPR, UK GDPR, or similar laws apply, we process data under these legal bases:",
    ],
    bullets: [
      "Contract (Art. 6(1)(b)): To create your account, verify identity, deliver services, process credits and withdrawals.",
      "Legitimate Interests (Art. 6(1)(f)): Fraud prevention, platform security, service improvement, and enforcing our Terms — balanced against your rights.",
      "Consent (Art. 6(1)(a)): Optional cookies, and publishing your story/image/video for promotional purposes. You may withdraw consent at any time.",
      "Legal Obligation (Art. 6(1)(c)): Record-keeping, sanctions screening, anti-money-laundering, and responding to lawful requests from authorities.",
      "Explicit Consent (Art. 9(2)(a)): Sensitive documents (health records, disability certificates) are processed ONLY for the purpose you provided them and NEVER shared publicly.",
    ],
  },
  {
    title: "How We Use Your Data",
    paragraphs: ["We use personal data strictly for the following purposes:"],
    bullets: [
      "To create and manage your account",
      "To verify identity and prevent fraud",
      "To display your case to eligible Heroes after approval",
      "To process credits, withdrawals, and payments",
      "To communicate important account updates",
      "To comply with legal and regulatory obligations",
      "To improve our platform (anonymized analytics only, with your consent)",
    ],
  },
  {
    title: "Who Can See Your Information",
    paragraphs: [
      "We are transparent about who sees what. Below is the full disclosure:",
    ],
    bullets: [
      "Private Verification Documents (ID, selfie, video, financial documents): Visible ONLY to authorized Givethra Verification Team members. Heroes, contributors, and public users CANNOT access them.",
      "Public Case Pages: Show only the approved story, category, city, amount needed, and (with your consent) a limited identity-confirmation image.",
      "Heroes Who Unlock Your Case: Can view your appeal video through authenticated, time-limited, play-only streaming with no download button. They see only the payment reference needed to help. Note: no streaming system is 100% capture-proof.",
      "Service Providers (Processors): Cloud hosting, authentication (Google), email delivery, analytics (only with consent), and payment processors — all under strict data processing agreements.",
      "Authorities: Only when legally required (court order, law enforcement, tax authorities, or AML regulations).",
      "Business Transfers: If Givethra is acquired or merges with another entity, your data may transfer with appropriate safeguards.",
    ],
    afterParagraphs: [
      "❌ We DO NOT sell your data. ❌ We DO NOT share your data for cross-context behavioral advertising. ✅ We DO honor Global Privacy Control (GPC) signals.",
    ],
  },
  {
    title: "International Data Transfers",
    paragraphs: [
      "Givethra is used worldwide, and our service providers may process data in countries other than yours. Where required by GDPR Article 45–49, we use safeguards including:",
    ],
    bullets: [
      "Standard Contractual Clauses (SCCs) approved by the European Commission",
      "UK International Data Transfer Addendum",
      "Adequacy decisions where applicable",
      "Additional technical measures (encryption in transit and at rest)",
    ],
  },
  {
    title: "Data Retention Schedule",
    paragraphs: ["We retain your data only as long as necessary, per GDPR Article 5:"],
    bullets: [
      "Rejected Applications: Verification documents and recordings are deleted after the review period ends (typically 90 days), unless legally required to retain longer.",
      "Approved & Completed Cases: Only limited records needed to evidence verification are kept for a defined period (usually 3 years). Hero access to private videos ends when the case completes.",
      "Account & Transaction Records: Kept while your account is active and for up to 7 years after deletion, per tax and accounting laws.",
      "Security Logs: Retained for 12 months for audit and abuse prevention.",
      "Cookies: Per your preferences, typically 6–24 months.",
    ],
  },
  {
    title: "Security Measures (GDPR Article 32)",
    paragraphs: [
      "We implement industry-standard security measures:",
    ],
    bullets: [
      "Role-Based Access Control (RBAC) — only staff with legitimate need can view sensitive documents",
      "End-to-end encrypted transmission (TLS 1.3)",
      "Encrypted storage at rest (AES-256)",
      "Regular security audits and penetration testing",
      "Incident response procedures with 72-hour breach notification",
      "Physical and logical separation of sensitive KYC data from public data",
    ],
    afterParagraphs: [
      "No system is perfectly secure. If a breach affecting your data occurs, we will notify you and relevant regulators as required by applicable law (GDPR Art. 33, CCPA §1798.150, etc.).",
    ],
  },
  {
    title: "Your Privacy Rights (GDPR, CCPA, LGPD, PIPEDA)",
    paragraphs: [
      "Depending on where you live, you have the following rights:",
    ],
    bullets: [
      "Right to Access (Art. 15): Request a copy of all personal data we hold.",
      "Right to Rectification (Art. 16): Correct inaccurate data anytime via Edit Profile.",
      "Right to Erasure / Deletion (Art. 17): Request full account deletion; processed within 30 days.",
      "Right to Restrict Processing (Art. 18): Limit how we use your data.",
      "Right to Data Portability (Art. 20): Export your data in machine-readable JSON via Privacy & Account.",
      "Right to Object (Art. 21): Object to any processing, including direct marketing.",
      "Right to Withdraw Consent (Art. 7(3)): Withdraw at any time via Cookie Settings.",
      "Right to Not Be Discriminated Against (CCPA): Exercising your rights will never penalize you.",
      "Right to Opt-Out (CCPA/CPRA): We do not sell or share data, so no opt-out is needed — but GPC signals are honored.",
      "Right to Know (CCPA): What data we collect, how it's used, and who it's shared with — all disclosed in this policy.",
    ],
    afterParagraphs: [
      `To exercise any right: use Privacy & Account in your profile, or email ${SITE.privacyEmail}. We may verify identity before responding. Response within 30 days (or as required by local law).`,
    ],
  },
  {
    title: "Your Right to Complain",
    paragraphs: [
      "If you believe we have violated your privacy rights, you may lodge a complaint with:",
    ],
    bullets: [
      "EU/EEA: Your national Data Protection Authority (list: edpb.europa.eu)",
      "UK: Information Commissioner's Office (ico.org.uk)",
      "California: California Attorney General (oag.ca.gov/privacy)",
      "Brazil: ANPD (gov.br/anpd)",
      "Canada: Office of the Privacy Commissioner (priv.gc.ca)",
      "Pakistan: Relevant data protection authority or cybercrime wing as applicable",
      "Any other region: Your local data protection authority",
    ],
    afterParagraphs: [
      "We encourage you to contact us first so we can resolve concerns directly. You may complain to regulators regardless of our internal resolution.",
    ],
  },
  {
    title: "Children's Privacy (COPPA)",
    paragraphs: [
      `Givethra is designed for adults aged ${SITE.minAge}+. We do not knowingly collect data from children under ${SITE.minAge}. If you believe a child has provided data to us:`,
    ],
    bullets: [
      `Contact ${SITE.privacyEmail} immediately`,
      "We will verify and permanently delete the data within 7 business days",
      "Education-related cases referring to a minor student must be submitted by an adult guardian — never by the child themselves",
    ],
  },
  {
    title: "Google Sign-In & Google API Limited Use",
    paragraphs: [
      "We use Google Sign-In for secure authentication. When you sign in with Google, we receive only your basic profile information: name, email address, and profile picture.",
      "Our use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. We:",
    ],
    bullets: [
      "Do not use Google user data for advertising",
      "Do not sell Google user data to third parties",
      "Do not transfer Google user data except as necessary to provide the service",
      "Do not use Google user data for surveillance",
      "Comply with all other Limited Use requirements",
    ],
    afterParagraphs: [
      "You can revoke Givethra's access to your Google account at any time at myaccount.google.com/permissions.",
    ],
  },
  {
    title: "Automated Decision-Making",
    paragraphs: [
      "Some platform actions are automated, but final verification decisions are made by trained human reviewers:",
    ],
    bullets: [
      "Automated: Cooldown timers, fee calculations, suspension thresholds (5 rejections), credit deductions",
      "Human review: KYC approval, case approval, feedback moderation, and any suspension/appeal decision",
      "Right to human review (GDPR Art. 22): You may request human review of any automated decision by contacting us",
    ],
  },
  {
    title: "Cookies & Tracking Technologies",
    paragraphs: [
      "We use cookies and similar technologies for essential functionality (login, security) and optional analytics. You have full control:",
    ],
    bullets: [
      "Essential Cookies: Required for login, security, and preferences — cannot be disabled",
      "Analytics Cookies: Optional, only set with your consent",
      "Advertising Cookies: We do NOT use any advertising or tracking cookies",
      "Manage preferences anytime in Cookie Settings",
    ],
  },
  {
    title: "Third-Party Services",
    paragraphs: [
      "We work with trusted service providers to operate the platform:",
    ],
    bullets: [
      "Cloudflare: Hosting, security, CDN (Privacy: cloudflare.com/privacypolicy)",
      "Google: Authentication, Gmail API (Privacy: policies.google.com/privacy)",
      "Payment Processors: Only for withdrawals, under strict contracts",
      "Email Service: Transactional emails only (no marketing without consent)",
      "Analytics: Only with your consent, anonymized data only",
    ],
    afterParagraphs: [
      "All third parties are bound by Data Processing Agreements (DPAs) and can only process your data on our documented instructions.",
    ],
  },
  {
    title: "Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy to reflect changes in our practices, technology, or legal requirements.",
    ],
    bullets: [
      "Material changes will be notified by email and prominent in-app notice",
      "The \"Last Updated\" date at the top will always reflect the latest version",
      "Your continued use after updates means you accept the revised policy",
      "Previous versions are available on request",
    ],
  },
  {
    title: "Contact Us",
    paragraphs: [
      "For any privacy-related questions, data requests, or complaints:",
      `📧 Privacy Team: ${SITE.privacyEmail}`,
      `📧 General Support: support@givethra.org`,
      `📧 Abuse Reports: report@givethra.org`,
      `🌐 Web: ${SITE.url}`,
      "We respond to all data requests within 30 days (or sooner where required by local law).",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      sections={sections}
      intro="We take dignity and privacy seriously. This policy explains what we collect, why, who can see it, and the choices you have. It is designed to comply with GDPR, CCPA/CPRA, PIPEDA, LGPD, PDPA, Google Play policies, and other applicable global laws."
    >
      <div className="space-y-3">
        <p className="text-sm">
          <strong>Manage your data now:</strong>{" "}
          <Link to="/privacy" className="text-primary underline font-bold">
            Privacy & Account
          </Link>{" "}
          — download a copy or delete your account anytime.
        </p>
        <p className="text-sm">
          <strong>Cookie settings:</strong>{" "}
          <Link to="/cookies" className="text-primary underline font-bold">
            Cookie Policy
          </Link>
        </p>
        <p className="text-sm">
          <strong>Contact us:</strong>{" "}
          <a href={`mailto:${SITE.privacyEmail}`} className="text-primary underline font-bold">
            {SITE.privacyEmail}
          </a>
        </p>
      </div>
    </LegalPage>
  );
}
