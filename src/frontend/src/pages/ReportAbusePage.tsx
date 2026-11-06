// src/pages/ReportAbusePage.tsx
// Global Report/Abuse Page — DSA, COPPA, DMCA, GDPR compliant.

import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/lib/siteConfig";

const sections: LegalSection[] = [
  {
    title: "What You Can Report",
    paragraphs: [
      "Givethra takes all reports seriously. If you encounter any of the following, please report immediately:",
    ],
    bullets: [
      "🚨 Fraud & Scams: Fake or forged documents, duplicate accounts, fake cases, or any attempt to defraud users.",
      "💰 Financial Theft: Anyone asking for money, passwords, OTPs, or codes outside the official platform.",
      "👤 Impersonation: Someone pretending to be a Givethra staff member, Hero, or another user.",
      "💬 Harassment & Abuse: Threats, hate speech, cyberbullying, or targeted harassment.",
      "🔞 Sexual Content: Any sexually explicit content, or content that sexualizes adults without consent.",
      "👶 Child Safety (Immediate Action): Any content involving minors in abuse, exploitation, or sexual contexts. This is our highest priority.",
      "🔒 Privacy Violations: Sharing someone's private documents, videos, personal details, or KYC data without consent.",
      "⚖️ Copyright/DMCA: Unauthorized use of copyrighted images, videos, text, or intellectual property.",
      "🎭 Fake Accounts: Impersonation of public figures, celebrities, or organizations.",
      "🏴 Extremist Content: Terrorism, violent extremism, or content promoting illegal activities.",
      "💊 Illegal Goods: Sale or promotion of drugs, weapons, or other illegal items.",
      "🎯 Spam & Manipulation: Repetitive spam, bot activity, or coordinated inauthentic behavior.",
    ],
  },
  {
    title: "How to Report",
    paragraphs: [
      "We provide multiple reporting channels for global accessibility. Choose what's easiest for you:",
    ],
    bullets: [
      "📱 In-App: Tap the ⋯ (three dots) menu on any post, comment, or case → Select 'Report' → Choose a reason.",
      "📧 Email (General): Send details to " + SITE.supportEmail + " — include screenshots, links, and a description.",
      "📧 Email (Legal/Copyright): Send DMCA or legal notices to " + SITE.legalEmail + " with: the copyrighted work, the infringing URL, your contact details, and a good-faith statement.",
      "📧 Email (Privacy/GDPR): For data protection violations, email " + SITE.privacyEmail + " (response within 30 days per GDPR Art. 12).",
      "📧 Email (Child Safety): For CSAM or child exploitation, email " + SITE.supportEmail + " AND report to your local authority / NCMEC (US) / INHOPE (EU) / relevant national hotline.",
      "🚔 Emergency: If someone is in immediate danger or a life-threatening situation, call your local emergency services first (112 in EU, 911 in US, 15 in Pakistan, 999 in UK, etc.).",
      "🎭 Anonymous: You may submit reports anonymously. We'll still investigate, though follow-up communication won't be possible.",
    ],
  },
  {
    title: "Response Timeline (Our Promise)",
    paragraphs: [
      "We commit to the following response times based on severity and legal requirements:",
    ],
    bullets: [
      "⚡ IMMEDIATE (Within 1 hour): CSAM, active threats to life, or ongoing harm to minors. Content is removed immediately and reported to authorities.",
      "🔴 URGENT (Within 24 hours): Threats, doxxing, active fraud, or financial scams in progress.",
      "🟠 HIGH PRIORITY (Within 72 hours): Harassment, hate speech, impersonation, privacy violations (per EU Digital Services Act).",
      "🟡 STANDARD (Within 7 days): Spam, minor content issues, non-urgent reports.",
      "🟢 COPYRIGHT/DMCA (Within 10 business days): Per DMCA §512 requirements.",
    ],
    afterParagraphs: [
      "Every report receives a unique tracking number via email. You can follow up anytime by referencing that number.",
    ],
  },
  {
    title: "What We Do After You Report",
    paragraphs: [
      "Our Trust & Safety team follows a transparent process:",
    ],
    bullets: [
      "1. Acknowledge: We confirm receipt of your report within 24 hours (immediately for critical issues).",
      "2. Review: A trained human moderator — not an automated bot — reviews your report within the stated timeline.",
      "3. Investigate: We cross-check evidence, view the reported content, and contact the accused party where appropriate.",
      "4. Decide: We take action based on our Community Guidelines and applicable laws.",
      "5. Communicate: We inform you of the outcome (except when legally restricted or confidentiality is required).",
      "6. Appeal: The reported party receives notice and can appeal within 30 days (per EU DSA Art. 20).",
      "7. Enforce: Enforcement actions include warning, content removal, feature restriction, temporary suspension, or permanent ban.",
      "8. Cooperate: We cooperate fully with law enforcement where legally required — subpoenas, court orders, or emergency disclosures.",
    ],
  },
  {
    title: "Actions We May Take",
    paragraphs: ["Depending on the severity and history, we may apply:"],
    bullets: [
      "📝 Warning: First-time minor violations receive a formal warning with guidance.",
      "🗑️ Content Removal: Violating content is deleted permanently.",
      "⏸️ Feature Restriction: Temporary limits on posting, commenting, or messaging.",
      "🔒 Account Suspension: 7 to 90 days depending on severity and history.",
      "🚫 Permanent Ban: For serious or repeated violations (fraud, CSAM, threats).",
      "💳 Financial Freeze: Wallet balance frozen during fraud investigations (with legal notice).",
      "👮 Legal Referral: Reported to law enforcement for criminal matters.",
    ],
    afterParagraphs: [
      "We issue a clear reason with every action. You can appeal any decision — see 'Appeal Process' below.",
    ],
  },
  {
    title: "Child Safety — Zero Tolerance",
    paragraphs: [
      "Givethra has ZERO TOLERANCE for child sexual abuse material (CSAM) or any form of child exploitation:",
    ],
    bullets: [
      "🔴 Immediate Removal: Any CSAM content is removed within minutes of detection.",
      "👮 Law Enforcement: All CSAM incidents are reported to NCMEC (US), Interpol (international), and local authorities.",
      "🚫 Permanent Ban: Accounts are permanently banned — no appeals accepted.",
      "📞 Global Reporting: We cooperate with INHOPE (EU), NCMEC (US), CEOP (UK), and other national hotlines.",
      "👶 Age Verification: Users must be " + SITE.minAge + "+ years old (COPPA / local law compliance).",
      "📋 Guardian Requirement: Education-related cases involving minors must be submitted by an adult guardian.",
    ],
    afterParagraphs: [
      "If you spot CSAM anywhere on Givethra, email " + SITE.supportEmail + " with the subject 'CSAM URGENT' and the exact URL — we will respond within 1 hour, 24/7.",
    ],
  },
  {
    title: "Copyright & DMCA",
    paragraphs: [
      "We respect intellectual property rights under DMCA (§512), EU Copyright Directive, and international copyright laws:",
    ],
    bullets: [
      "📄 DMCA Notice: Email " + SITE.legalEmail + " with: (1) your physical/electronic signature, (2) identification of the copyrighted work, (3) the infringing URL, (4) your contact info, (5) a good-faith statement, (6) statement under penalty of perjury.",
      "🔄 Counter-Notice: If you believe your content was wrongly removed, you may submit a counter-notice with the same requirements plus consent to jurisdiction.",
      "⏱️ Processing: Valid DMCA notices are processed within 10 business days. Repeat infringers are permanently banned.",
      "🌍 International: For non-US copyright issues, we follow Berne Convention and applicable local copyright laws.",
    ],
  },
  {
    title: "Data Protection & GDPR Reports",
    paragraphs: [
      "For privacy violations or data protection concerns (GDPR Art. 77, CCPA, LGPD, PIPEDA):",
    ],
    bullets: [
      "📧 Data Protection Officer: Email " + SITE.privacyEmail + " — acknowledged within 72 hours.",
      "📋 Your Rights: Access, correction, deletion, restriction, portability, objection — all honored within 30 days.",
      "🏛️ Regulatory Complaint: You may also complain directly to your local Data Protection Authority (DPA) — you don't need our permission.",
      "🔍 Investigation: We cooperate fully with DPAs and regulators.",
    ],
  },
  {
    title: "Appeal Process (EU DSA Article 20)",
    paragraphs: [
      "If you disagree with our decision, you have the right to appeal. Per EU Digital Services Act Art. 20 and our own commitment:",
    ],
    bullets: [
      "📧 File Appeal: Email " + SITE.supportEmail + " with subject 'APPEAL' + your case ID, within 30 days of the decision.",
      "⏱️ Timeline: We respond within 14 days of receiving your appeal.",
      "🧑‍⚖️ Human Review: Your appeal is reviewed by a senior moderator who was not involved in the original decision.",
      "🎯 Outcome: Decision may be upheld, overturned, or modified with clear explanation.",
      "⚖️ External Resolution: EU users may escalate to their national Digital Services Coordinator. Other regions: contact local consumer protection body.",
      "🆓 Cost: Appeals are always free of charge.",
    ],
  },
  {
    title: "Blocking, Muting & Safety Tools",
    paragraphs: [
      "We provide tools to protect yourself immediately, without waiting for moderation:",
    ],
    bullets: [
      "🚫 Block User: Stops the user from seeing your profile, messaging you, or interacting with your content.",
      "🔇 Mute User: You won't see their posts, but they can still see yours (silent).",
      "🔒 Private Account: Approve who can follow you and see your posts.",
      "📸 Story Privacy: Control who sees your activity and updates.",
      "🗑️ Delete Comments: Remove unwanted comments from your posts anytime.",
      "📍 Location Privacy: Disable precise location sharing in Settings.",
    ],
  },
  {
    title: "What Happens to Reporters (Anti-Retaliation)",
    paragraphs: [
      "We protect those who report in good faith:",
    ],
    bullets: [
      "🔒 Confidentiality: Your identity as a reporter is kept confidential unless legally required.",
      "🛡️ No Retaliation: We do not tolerate retaliation against reporters. Any user who retaliates will be banned.",
      "📋 Documentation: Every report is logged for accountability and regulatory audit.",
      "⚖️ Bad-Faith Reports: Intentionally false reports may result in a warning or ban of the reporter.",
    ],
  },
  {
    title: "Regional & Regulatory Compliance",
    paragraphs: [
      "Our reporting system complies with all applicable global regulations:",
    ],
    bullets: [
      "🇪🇺 EU: Digital Services Act (DSA) — Art. 16 (Notice), Art. 20 (Appeal), Art. 22 (Trusted Flaggers).",
      "🇺🇸 USA: DMCA (§512), COPPA (children), FOSTA-SESTA (trafficking), state-level consumer protection.",
      "🇬🇧 UK: Online Safety Act (OSA) — mandatory illegal content reporting.",
      "🇮🇳 India: IT Rules 2021 — 24h acknowledgement, 15-day resolution for grievances.",
      "🇧🇷 Brazil: Marco Civil da Internet + LGPD.",
      "🇨🇦 Canada: PIPEDA for privacy; Bill C-63 (online harms) compliance.",
      "🇦🇺 Australia: Online Safety Act 2021 — rapid takedown for abhorrent content.",
      "🇵🇰 Pakistan: PECA 2016 — illegal content and cybercrime reporting.",
      "🌐 Global: Berne Convention (copyright), ICESCR (rights), and Google Play/Apple App Store policies.",
    ],
  },
  {
    title: "Contact All Reporting Channels",
    paragraphs: [
      "Save these contacts for quick access:",
    ],
    bullets: [
      "🚨 CSAM / Child Safety: " + SITE.supportEmail + " (Subject: 'CSAM URGENT') — 1 hour response.",
      "⚖️ Copyright / DMCA: " + SITE.legalEmail,
      "🔒 Privacy / GDPR / Data Rights: " + SITE.privacyEmail,
      "🛡️ General Abuse / Report: " + SITE.supportEmail,
      "💬 In-App Support Chat: Available 24/7 in the app menu.",
      "📞 WhatsApp Support: Available via official channel (see footer).",
      "🚔 Emergency (Immediate Danger): Call your local emergency services first.",
    ],
    afterParagraphs: [
      "We are committed to a safe, dignified, and transparent Givethra for every user worldwide.",
    ],
  },
];

export default function ReportAbusePage() {
  return (
    <LegalPage
      title="Report a Problem"
      sections={sections}
      intro="Your reports help us keep Givethra safe. We respond to every report with transparency, respect for human rights, and full compliance with GDPR, the EU Digital Services Act, DMCA, COPPA, and local laws worldwide."
    />
  );
}
