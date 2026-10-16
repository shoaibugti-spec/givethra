import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/lib/siteConfig";

const sections: LegalSection[] = [
  { title: "What credits are", paragraphs: [
    `Credits pay for specified platform features and service costs. Reference value: 1 credit = USD ${SITE.creditValueUsd}, subject to published pricing, taxes and payment rules. Credits are not money, cannot be withdrawn or transferred, and are not a guarantee of approval, funding or assistance.`,
  ]},
  { title: "Free Help Request submissions", bullets: [
    "Your first eligible Help Request submission is free.",
    "If it is rejected, a second submission is also free so you can correct mistakes.",
    "A request approved under a free offer does not incur a listing credit fee.",
    "If both free attempts are rejected, the next submission may require the published credit fee. The fee is always displayed before you submit.",
  ]},
  { title: "Eligibility and cooldown rules", paragraphs: [
    "Rules are set by category and are applied automatically; the app shows when you can next submit.",
  ], bullets: [
    "Utility bills and rent: one eligible monthly bill or rental period per request.",
    "School, college and university fees: may be submitted monthly for a distinct eligible fee period, identifying the student and the specific expense.",
    "Other categories: a three-month interval after a successfully completed request in the same category, unless a published category exception applies.",
    "Rejected request: retry after 30 days, or after 15 days where a category explicitly permits correction.",
    "Disability, widow, orphan and elderly support follow separate review intervals that reflect continuing needs.",
  ]},
  { title: "Repeated or false requests", bullets: [
    "After five rejected requests the account may be suspended. The reason, rule, appeal options and amount are communicated before any action.",
    "Reactivation requires the published fee (currently 5 credits) and review. You can ask for a fair review of any disputed decision.",
  ]},
  { title: "Hero unlock credit", paragraphs: [
    "A Hero uses the published credit amount to unlock an eligible case and view the approved payment instructions and the appeal video. The credit is a platform fee; it is not a payment to the Help Seeker.",
  ]},
  { title: "Refunds", bullets: [
    "Credits already used for a service delivered (for example a completed review or an unlocked case) are generally non-refundable.",
    "We will refund or re-credit where we charged you in error, where a technical fault prevented delivery, where a payment was duplicated, or where the law requires.",
    `Consumers in the EU/UK/other regions with statutory rights keep them; digital-content withdrawal rights may end once delivery begins with your consent, as permitted by law.`,
    `Request a refund within 30 days of the charge at ${SITE.supportEmail} with your transaction reference.`,
  ]},
  { title: "Adding credits", paragraphs: [
    "Deposits are confirmed after an administrator reviews your payment proof, usually within 24 hours but not guaranteed. Third-party payment fees or exchange rates may apply. Taxes are shown where required.",
  ]},
];

export default function CreditsRefundsPage() {
  return <LegalPage title="Credits, Fees & Refunds" sections={sections} intro="How credits, free submissions, cooldowns and refunds work." />;
}
