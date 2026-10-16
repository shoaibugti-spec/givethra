import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/lib/siteConfig";

const operator = [SITE.operatorLegalName, [SITE.operatorProvince, SITE.operatorRegion].filter(Boolean).join(", ")].filter(Boolean).join(" - ");

const sections: LegalSection[] = [
  { title: "About these Terms", paragraphs: [
    `These Terms & Conditions ("Terms") govern your use of Givethra, including ${SITE.url}, our mobile apps and related services ("Givethra", "we", "us"). Givethra is operated from ${operator}.`,
    "By creating an account or using Givethra you agree to these Terms together with our Privacy Policy, Cookie Policy, Community Guidelines and the feature policies linked in the footer. If you do not agree, please do not use the platform.",
  ]},
  { title: "What Givethra is - and is not", paragraphs: [
    "Givethra is a humanitarian technology platform that connects people who need help (Help Seekers) with people who want to help (Heroes), through verified requests and privacy-conscious processes. It also offers community posts and support, voluntary community donations, and a separate product-participation feature called Shop Dream Now.",
  ], bullets: [
    "Givethra is not an employer and does not offer jobs.",
    "Givethra is not a bank, lender or loan provider and does not offer loans or instalment plans.",
    "Givethra is not an instalment-sales business.",
    "Givethra does not guarantee that any request will be approved, funded or resolved.",
  ]},
  { title: "Eligibility and accounts", bullets: [
    `You must be at least ${SITE.minAge} years old, or the age of majority where you live if higher, and able to form a binding contract.`,
    "You sign in with Google (Gmail). You are responsible for the security of your Google account and for all activity under your Givethra account.",
    "One person may hold one account. A single account can be used for both Hero and Help Seeker activities, subject to verification requirements.",
    "You must give accurate information and keep it up to date.",
    "Givethra may be unavailable or restricted in some countries because of legal, payment or sanctions requirements. You must not use Givethra where it is prohibited by law.",
  ]},
  { title: "Help Seekers and verification", paragraphs: [
    "Heroes do not need Help Seeker verification merely to browse eligible cases and provide assistance. Anyone who submits a Help Request must complete identity verification (KYC) before it can be approved.",
  ], bullets: [
    "You must choose the correct category, explain your need in your own words, upload genuine evidence, record your own appeal video and accept the declarations before submitting.",
    "You must not submit false, misleading, duplicate or forged information or documents. We may reject a request that is unclear, inconsistent, incomplete or in the wrong category.",
    "Our Verification Team records the outcome and, for a rejection, the reason and how to correct it where correction is permitted.",
    "Approval means our team found the request consistent with the evidence provided. It is not a guarantee about any person's circumstances or about future funding.",
    "See the Verification & Data Retention Policy and Eligibility Rules for details of free submissions, cooldowns and suspensions.",
  ]},
  { title: "Heroes and direct help", bullets: [
    "Where practical, Heroes pay the relevant institution or provider directly (for example a utility company, school, hospital or landlord) using the verified payment reference shown after unlocking a case.",
    "Givethra does not receive or forward a Hero's payment to a Help Seeker for direct help. Heroes upload payment proof through the platform and the case status is updated after review.",
    "Heroes decide at their own discretion whether to help. A Hero must not contact a Help Seeker outside the platform using information obtained here, and must not copy, share or resell any case information.",
    "A Hero's access to a case's private appeal video ends according to our published policy once the case is completed.",
  ]},
  { title: "Credits, fees and payments", paragraphs: [
    `Some features use credits. The reference value is 1 credit = USD ${SITE.creditValueUsd}, subject to published pricing, applicable taxes and payment rules. The actual fee is shown before you confirm any paid action.`,
    "Credits are not money, are not a deposit or stored-value account, cannot be withdrawn or transferred, and are not a guarantee of approval, funding or assistance. Refunds are governed by the Credits, Fees & Refunds Policy.",
  ]},
  { title: "Community posts, support units and withdrawals", paragraphs: [
    "Eligible users may publish community posts and receive support units under the Community Support & Withdrawals Policy. Support units are a platform feature; they are not cash, credits, donations, salary or guaranteed income. You are not promised any earnings for registering, posting or supporting others.",
    "Rates, limits, eligibility thresholds and withdrawal windows are published in that policy and may change with notice. Withdrawals are subject to verification, payment-provider availability, our fraud checks and applicable law. You are responsible for any taxes on amounts you receive.",
  ]},
  { title: "Community donations", paragraphs: [
    "You may voluntarily donate to support the Givethra community and its humanitarian mission. Donations are separate from payments for a specific Help Request and from Shop Dream Now. How donations may be used is explained in the Donation Policy. Unless stated otherwise, Givethra is not a registered charity in any jurisdiction and donations may not be tax-deductible.",
  ]},
  { title: "Shop Dream Now", paragraphs: [
    "Shop Dream Now is a separate product-participation feature. It is not a Help Request, loan, employment or instalment arrangement. Each listing shows the product, reference value, contribution amount, target, selection method and fulfilment conditions. A product is not guaranteed to every participant. See the Shop Dream Now Rules. The feature is only offered where it is lawful and may be withdrawn or restricted in any country.",
  ]},
  { title: "Your content and appeal videos", bullets: [
    "You keep ownership of what you submit. You grant Givethra a limited, non-exclusive licence to host, process, display and review it only to operate, secure and improve the service as described in the Privacy Policy.",
    "Appeal videos are confidential and must not be treated as public social-media content. We do not use your face, story or feedback in promotion without separate, informed consent.",
    "Do not upload anything unlawful, infringing, hateful, sexually explicit or that violates another person's privacy.",
  ]},
  { title: "Prohibited conduct", bullets: [
    "False information, forged documents, impersonation or duplicate requests.",
    "Circumventing verification, fees, cooldowns or access controls, or creating multiple accounts.",
    "Scraping, screen-recording to redistribute, reselling or publicly sharing case information or appeal videos.",
    "Harassing, threatening or discriminating against others; soliciting or pressuring Heroes.",
    "Using Givethra for money laundering, fraud, terrorist financing or any illegal purpose.",
    "Interfering with the security or operation of the platform.",
  ]},
  { title: "Support channels", paragraphs: [
    "WhatsApp, Telegram and email are for guidance and technical support only. Our staff will never ask for your password or verification codes, never ask you to send money to a personal account in exchange for approval, and do not personally provide financial assistance. Report anyone who does so to us immediately.",
  ]},
  { title: "Suspension and termination", paragraphs: [
    "We may restrict, suspend or terminate accounts that breach these Terms, involve fraud, or put the community at risk. Under the current policy an account is suspended after five rejected requests; reactivation requires a published credit fee and review. We will explain the reason and the available appeal or correction options. You may delete your account at any time from Privacy & Account.",
  ]},
  { title: "Disclaimers", paragraphs: [
    "Givethra verifies requests to the best of its ability but cannot guarantee that every statement made by a user is true or that any outcome will occur. Givethra is a venue and is not a party to arrangements between users. The platform is provided \"as is\" and \"as available\" to the extent permitted by law. Nothing in these Terms excludes rights you have under mandatory consumer law.",
  ]},
  { title: "Limitation of liability", paragraphs: [
    "To the maximum extent permitted by law, Givethra is not liable for indirect, incidental or consequential loss, loss of profit or data, or for the acts or omissions of users, institutions or payment providers. Our total liability for any claim relating to the service is limited to the greater of the fees you paid to Givethra in the 12 months before the claim or USD 100. This does not limit liability that cannot be limited by law (for example for fraud or death or personal injury caused by negligence).",
  ]},
  { title: "Indemnity", paragraphs: [
    "You agree to compensate Givethra for losses arising from your breach of these Terms, your unlawful conduct or false information you submit, to the extent permitted by law.",
  ]},
  { title: "Changes to these Terms", paragraphs: [
    "We may update these Terms. For material changes we will give notice in the app or by email before they take effect where practicable. Continued use after the effective date means you accept the update.",
  ]},
  { title: "Governing law and disputes", paragraphs: [
    `These Terms are governed by ${SITE.governingLaw}, without affecting any mandatory consumer-protection rights you have in your country of residence. Please contact us first at ${SITE.legalEmail} so we can try to resolve a dispute informally. Where the law allows, disputes not resolved informally are subject to the competent courts of that jurisdiction. If you live in the EU/UK you may also use the EU Online Dispute Resolution platform or your local consumer authority.`,
  ]},
  { title: "App stores", paragraphs: [
    "If you use our app from the Apple App Store or Google Play, those companies are not parties to these Terms and have no obligation to provide support. Their own terms also apply to your download and use.",
  ]},
  { title: "Contact", paragraphs: [`Questions about these Terms: ${SITE.legalEmail}. General support: ${SITE.supportEmail}.`] },
];

export default function TermsPage() {
  return <LegalPage title="Terms & Conditions" intro="Please read these Terms carefully before using Givethra." sections={sections} />;
}
