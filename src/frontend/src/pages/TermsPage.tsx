// src/pages/TermsPage.tsx
// Global Terms & Conditions — GDPR, CCPA, Play Store, DSA, COPPA, DMCA compliant.

import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/lib/siteConfig";

const operator = [SITE.operatorLegalName, [SITE.operatorProvince, SITE.operatorRegion].filter(Boolean).join(", ")].filter(Boolean).join(" - ");

const sections: LegalSection[] = [
  {
    title: "1. About These Terms",
    paragraphs: [
      `These Terms & Conditions ("Terms") constitute a legally binding agreement between you ("you", "your") and Givethra ("we", "us", "our") governing your access to and use of ${SITE.url}, our mobile applications, and all related services (collectively, "Givethra" or "the Platform").`,
      `Givethra is operated from ${operator}. These Terms apply globally and comply with applicable laws in every jurisdiction where Givethra operates, including the EU GDPR, California CCPA/CPRA, UK GDPR, Brazil LGPD, Canada PIPEDA, India IT Rules, Pakistan PECA, Australia OSA, and Google Play / Apple App Store Developer Policies.`,
      "By creating an account or using Givethra, you agree to these Terms together with our Privacy Policy, Cookie Policy, Community Guidelines, Donation Policy, and all other feature-specific policies linked in the footer. If you do not agree with any part, please do not use the Platform.",
      "If you are using Givethra on behalf of an organization, you represent that you have authority to bind that organization to these Terms.",
    ],
  },
  {
    title: "2. What Givethra Is — And Is Not",
    paragraphs: [
      "Givethra is a humanitarian technology platform that connects people who need help ('Help Seekers') with people who want to help ('Heroes') through verified requests and privacy-conscious processes. It also offers community posts, voluntary community donations, and a separate product-participation feature called 'Shop Dream Now.'",
      "Givethra is NOT any of the following, and by using the Platform you acknowledge and agree:",
    ],
    bullets: [
      "❌ Not an employer — we do not offer jobs, employment, or work contracts.",
      "❌ Not a bank, lender, or financial institution — we do not offer loans, credit, or instalment plans.",
      "❌ Not an instalment-sales business or layaway service.",
      "❌ Not a registered charity in any jurisdiction — donations may not be tax-deductible.",
      "❌ Not a guarantor of outcomes — we do not guarantee that any request will be approved, funded, resolved, or that any participant will receive a product.",
      "❌ Not a party to agreements between users — Givethra is a venue connecting users, not a broker, agent, or contracting party.",
    ],
  },
  {
    title: "3. Eligibility & Account Requirements",
    paragraphs: [
      "To use Givethra, you must meet all of the following requirements at all times:",
    ],
    bullets: [
      `👤 Age: You must be at least ${SITE.minAge} years old (or the legal age of majority in your country if higher). If you are under 18, you represent that you have parental/guardian consent.`,
      "🔐 Account Security: You sign in exclusively via Google OAuth. You are solely responsible for the security of your Google account and for all activity occurring under your Givethra account.",
      "1️⃣ One Account Per Person: You may hold only ONE Givethra account. Creating multiple accounts to circumvent suspensions or limits is strictly prohibited and will result in permanent bans.",
      "✅ Accurate Information: You must provide accurate, complete, and current information, and update it as needed.",
      "🌍 Geographic Availability: Some features or entire Platform access may be unavailable in certain countries due to legal, sanctions, payment provider, or regulatory requirements. You must not use Givethra where prohibited by law.",
      "🚫 Sanctions Compliance: You are not located in, or a national of, any country subject to comprehensive international sanctions (e.g., OFAC, EU, UN embargoes).",
      "🚔 Legal Capacity: You are not barred from using the Platform under any applicable law and have full legal capacity to enter this agreement.",
    ],
  },
  {
    title: "4. Help Seekers & Verification (KYC)",
    paragraphs: [
      "Anyone who submits a Help Request must complete identity verification (KYC) before the request can be approved. Heroes do not need Help Seeker verification merely to browse and provide assistance.",
    ],
    bullets: [
      "You must select the correct category, explain your need honestly, upload genuine evidence, record your own appeal video, and accept all declarations before submitting.",
      "You must NOT submit false, misleading, duplicate, fabricated, or forged information or documents.",
      "We may reject a request that is unclear, inconsistent, incomplete, or in the wrong category.",
      "Our Verification Team records the outcome and, for a rejection, the reason and how to correct it where correction is permitted.",
      "Approval means our team found the request consistent with the evidence provided. It is NOT a guarantee about any person's circumstances or future funding.",
      "See the Verification & Data Retention Policy and Eligibility Rules for details on free submissions, cooldowns, and suspensions.",
      "🇪🇺 GDPR Right: You have the right to request a human review of any automated decision made about your account.",
    ],
  },
  {
    title: "5. Heroes & Direct Help",
    paragraphs: [
      "Heroes provide direct assistance by paying institutions directly. Your obligations as a Hero include:",
    ],
    bullets: [
      "Where practical, you pay the relevant institution or provider directly (utility company, school, hospital, landlord, etc.) using the verified payment reference shown after unlocking a case.",
      "Givethra does NOT receive or forward Hero payments to Help Seekers. You upload payment proof through the Platform, and case status is updated after review.",
      "You decide at your own discretion whether to help. No obligation is created by viewing a case.",
      "You must NOT contact Help Seekers outside the Platform using information obtained here.",
      "You must NOT copy, share, resell, or redistribute any case information, appeal video, or personal data obtained through the Platform.",
      "Your access to a case's private appeal video ends according to our published policy once the case completes.",
    ],
  },
  {
    title: "6. Credits, Fees & Payments",
    paragraphs: [
      `Some features require credits. The reference value is 1 credit = USD ${SITE.creditValueUsd}, subject to published pricing, applicable taxes, and payment rules. The actual fee is displayed before you confirm any paid action.`,
    ],
    bullets: [
      "Credits are NOT money, deposits, or stored-value accounts.",
      "Credits CANNOT be withdrawn, transferred, sold, or exchanged for cash.",
      "Credits do NOT guarantee approval, funding, assistance, or any specific outcome.",
      "Refunds are governed by the Credits, Fees & Refunds Policy. Generally, credits spent on listing fees are non-refundable once a case is approved.",
      "🇪🇺 EU/UK Consumers: You have a 14-day right of withdrawal for paid digital services UNLESS you have already used the service (e.g., unlocked a case).",
      "🧾 Taxes: You are responsible for any taxes applicable to amounts you receive through Givethra.",
    ],
  },
  {
    title: "7. Community Posts, Support Units & Withdrawals",
    paragraphs: [
      "Eligible users may publish community posts and receive Support Units under the Community Support & Withdrawals Policy.",
    ],
    bullets: [
      "Support Units are a Platform feature — NOT cash, credits, donations, salary, or guaranteed income.",
      "You are NOT promised any earnings for registering, posting, or supporting others.",
      "Rates, limits, eligibility thresholds, and withdrawal windows are published in that policy and may change with notice.",
      "Withdrawals are subject to: verification, payment-provider availability, fraud checks, and applicable law.",
      "Minimum withdrawal: PKR 300 (or local equivalent).",
      "Withdrawal window: 30th of each month to 3rd of the next month.",
      "You are fully responsible for any taxes on amounts you receive.",
    ],
  },
  {
    title: "8. Community Donations",
    paragraphs: [
      "You may voluntarily donate to support the Givethra community and its humanitarian mission.",
    ],
    bullets: [
      "Donations are SEPARATE from payments for specific Help Requests and from Shop Dream Now.",
      "Donations fund the Platform's operational costs and verified community needs — see the Donation Policy for full allocation details.",
      "🇪🇺 EU/UK: Givethra is NOT a registered charity in any jurisdiction. Donations may NOT be tax-deductible. If you are uncertain, consult a tax advisor.",
      "Donations are generally non-refundable, except where required by law.",
    ],
  },
  {
    title: "9. Shop Dream Now",
    paragraphs: [
      "Shop Dream Now is a separate product-participation feature. It is NOT a Help Request, loan, employment, or instalment arrangement.",
    ],
    bullets: [
      "Each listing shows: the product, reference value, contribution amount, target, selection method, and fulfilment conditions.",
      "A product is NOT guaranteed to every participant.",
      "Previous recipients cannot be selected again.",
      "See the Shop Dream Now Rules for full mechanics.",
      "The feature is offered only where lawful and may be withdrawn or restricted in any country at any time.",
      "🇪🇺 EU/UK Consumers: If the target is not reached, contributions are refunded as stated on the listing, per EU Consumer Rights Directive.",
    ],
  },
  {
    title: "10. Your Content & Appeal Videos",
    paragraphs: [
      "You retain full ownership of all content you submit to Givethra (stories, documents, videos, photos, comments).",
    ],
    bullets: [
      "You grant Givethra a limited, non-exclusive, worldwide licence to host, process, display, and review your content ONLY to operate, secure, and improve the service as described in the Privacy Policy.",
      "Appeal videos are CONFIDENTIAL and must not be treated as public social-media content.",
      "We do NOT use your face, story, or feedback in promotion without separate, informed consent.",
      "You must NOT upload anything unlawful, infringing, hateful, sexually explicit, defamatory, or that violates another person's privacy.",
      "You warrant that you have the right to share all content you submit and that it does not infringe any third-party rights.",
    ],
  },
  {
    title: "11. Prohibited Conduct",
    paragraphs: [
      "The following activities are strictly prohibited and may result in immediate suspension, permanent ban, and/or legal action:",
    ],
    bullets: [
      "🚫 Fraud & Misrepresentation: False information, forged documents, impersonation, or duplicate requests.",
      "🚫 Circumvention: Bypassing verification, fees, cooldowns, access controls, or creating multiple accounts.",
      "🚫 Content Theft: Scraping, screen-recording to redistribute, reselling, or publicly sharing case information or appeal videos.",
      "🚫 Harassment: Threatening, harassing, stalking, or discriminating against other users.",
      "🚫 Solicitation: Soliciting or pressuring Heroes outside the Platform, or asking for money directly.",
      "🚫 Financial Crime: Money laundering, fraud, terrorist financing, sanctions evasion, or any illegal purpose.",
      "🚫 Platform Abuse: Interfering with security, introducing malware, exploiting vulnerabilities, or attempting to hack the Platform.",
      "🚫 Illegal Content: CSAM, extremist content, illegal goods, or content promoting violence.",
      "🚫 Automated Abuse: Bots, scrapers, or automated tools that overload or interfere with Givethra.",
    ],
  },
  {
    title: "12. Support Channels",
    paragraphs: [
      "Our official support channels (WhatsApp, Telegram, email) are for GUIDANCE and TECHNICAL SUPPORT only. Our staff will NEVER:",
    ],
    bullets: [
      "❌ Ask for your password, OTP, or verification codes.",
      "❌ Ask you to send money to a personal account in exchange for approval.",
      "❌ Personally provide financial assistance on behalf of Givethra.",
      "❌ Request gift cards, cryptocurrency, or payment outside official channels.",
      "⚠️ Report anyone who does any of the above IMMEDIATELY to " + SITE.supportEmail + " — they are impostors.",
    ],
  },
  {
    title: "13. Suspension & Termination",
    paragraphs: [
      "We may restrict, suspend, or terminate accounts that breach these Terms, involve fraud, or put the community at risk.",
    ],
    bullets: [
      "📋 Current Policy: An account is suspended after 5 rejected requests.",
      "🔓 Reactivation: Requires a published credit fee (currently 5 credits) and review.",
      "📧 Notice: We will explain the reason and available appeal/correction options.",
      "⚖️ Appeal Right (EU DSA Art. 20): EU users may appeal any decision within 30 days and request external dispute resolution via their national Digital Services Coordinator.",
      "🗑️ Voluntary Deletion: You may delete your account at any time from Privacy & Account.",
    ],
  },
  {
    title: "14. Disclaimers",
    paragraphs: [
      "Givethra verifies requests to the best of its ability but cannot guarantee that every statement made by a user is true or that any outcome will occur.",
      "Givethra is a venue and is NOT a party to arrangements between users.",
      "The Platform is provided 'as is' and 'as available' to the extent permitted by law.",
      "Nothing in these Terms excludes rights you have under MANDATORY consumer law in your country of residence.",
      "🇪🇺 EU/UK: Nothing excludes your statutory rights under the Consumer Rights Directive or Sale of Goods Act.",
    ],
  },
  {
    title: "15. Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, Givethra is NOT liable for:",
    ],
    bullets: [
      "Indirect, incidental, special, or consequential loss.",
      "Loss of profit, data, revenue, or business opportunity.",
      "Acts or omissions of users, institutions, or payment providers.",
      "Interruption, delay, or failure of service due to third-party providers.",
      "Unauthorized access to your account caused by your failure to secure credentials.",
      "Total Aggregate Liability: Our total liability for any claim is limited to the greater of (a) the fees you paid to Givethra in the 12 months before the claim or (b) USD 100.",
      "🚨 Exceptions (cannot be limited by law): This does not limit liability for fraud, gross negligence, death, personal injury caused by negligence, or any other liability that cannot be excluded under applicable law.",
    ],
  },
  {
    title: "16. Indemnity",
    paragraphs: [
      "You agree to compensate Givethra for losses arising from:",
    ],
    bullets: [
      "Your breach of these Terms.",
      "Your unlawful conduct or fraudulent activity.",
      "False or misleading information you submit.",
      "Third-party claims caused by your content or conduct.",
      "🇪🇺 EU/UK: This indemnity is limited to the extent permitted by your local consumer law.",
    ],
  },
  {
    title: "17. Governing Law & Dispute Resolution",
    paragraphs: [
      `These Terms are governed by ${SITE.governingLaw}, without affecting mandatory consumer-protection rights you have in your country of residence.`,
    ],
    bullets: [
      "🤝 Informal Resolution: Please contact us first at " + SITE.legalEmail + " — we will attempt to resolve any dispute within 30 days.",
      "⚖️ Formal Disputes: If unresolved informally, disputes are subject to the competent courts of the governing jurisdiction.",
      "🇪🇺 EU/UK: You may use the EU Online Dispute Resolution (ODR) platform at ec.europa.eu/consumers/odr OR your local consumer authority.",
      "🇺🇸 USA: Disputes are resolved individually — you waive any right to participate in class actions or class arbitrations, to the extent permitted by law.",
      "🇺🇸 Arbitration (US only): Any dispute may be resolved by binding arbitration under the American Arbitration Association (AAA) Consumer Arbitration Rules.",
      "🌍 Other Regions: Local consumer protection laws apply where mandatory.",
    ],
  },
  {
    title: "18. App Store Compliance",
    paragraphs: [
      "If you download our app from the Apple App Store or Google Play Store:",
    ],
    bullets: [
      "Apple Inc. and Google LLC are NOT parties to these Terms.",
      "Apple and Google have NO obligation to provide support, warranty, or maintenance for our app.",
      "Your download and use are also governed by the App Store's own Terms of Service.",
      "Apple is a third-party beneficiary of these Terms and may enforce them against you.",
      "In-app purchases are processed by Apple/Google and subject to their refund policies.",
      "🇪🇺 EU: Digital Markets Act (DMA) disclosures apply where relevant.",
    ],
  },
  {
    title: "19. Third-Party Services",
    paragraphs: [
      "Givethra uses third-party services to operate the Platform, including:",
    ],
    bullets: [
      "Google (authentication, cloud services)",
      "Cloudflare (hosting, security)",
      "Payment processors (withdrawals, deposits)",
      "Email providers (transactional emails)",
      "Analytics providers (with your consent)",
      "Each third party has its own Terms of Service and Privacy Policy, which apply in addition to ours.",
    ],
  },
  {
    title: "20. General Provisions",
    paragraphs: ["These provisions apply to all users worldwide:"],
    bullets: [
      "Severability: If any provision is held invalid, the remaining provisions remain in full force.",
      "No Waiver: Failure to enforce any right does not waive that right.",
      "Entire Agreement: These Terms, together with all linked policies, constitute the entire agreement.",
      "Assignment: You may not assign these Terms. Givethra may assign them in a merger or acquisition.",
      "Force Majeure: We are not liable for delays caused by events beyond our reasonable control.",
      "Language: These Terms are drafted in English. In case of conflict between translations, the English version prevails. Local language versions are provided for convenience.",
      "Survival: Sections 14-17 (Disclaimers, Liability, Indemnity, Governing Law) survive termination.",
    ],
  },
  {
    title: "21. Changes to These Terms",
    paragraphs: [
      "We may update these Terms from time to time. For material changes:",
    ],
    bullets: [
      "📧 We will give prominent notice in the app AND by email, at least 30 days before changes take effect (where practicable).",
      "📅 The 'Last Updated' date will always reflect the current version.",
      "✅ Continued use after the effective date means you accept the updated Terms.",
      "❌ If you do not agree, you must stop using Givethra and delete your account.",
      "📚 Previous versions are available on request.",
    ],
  },
  {
    title: "22. Contact Information",
    paragraphs: [
      "For any questions, concerns, or legal notices regarding these Terms:",
      `⚖️ Legal Team: ${SITE.legalEmail}`,
      `📧 General Support: ${SITE.supportEmail}`,
      `🔒 Privacy / DPO: ${SITE.privacyEmail}`,
      `🌐 Website: ${SITE.url}`,
      `🏢 Operator: ${operator}`,
      "We respond to all legal inquiries within 30 days (or sooner where required by law).",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="Please read these Terms carefully before using Givethra. They set out your rights and obligations as a user of the Platform, and they comply with GDPR, CCPA, Play Store, Apple App Store, and other applicable global regulations."
      sections={sections}
    />
  );
}
