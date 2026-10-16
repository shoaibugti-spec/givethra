import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/lib/siteConfig";

const sections: LegalSection[] = [
  { title: "Voluntary community donations", paragraphs: [
    "You may donate to support the Givethra community and its humanitarian mission. Donations are voluntary and are separate from (a) payments made directly to an institution for a specific Help Request and (b) Shop Dream Now participation.",
  ]},
  { title: "How donations may be used", bullets: [
    "Humanitarian support for verified cases through approved direct payments to institutions or providers.",
    "Permitted operating costs: hosting, security, verification, payment-processing fees and administration.",
    "Allocation is decided under our published rules; we do not promise that a donation will fund a specific person unless the donation page says so.",
  ]},
  { title: "Transparency", bullets: [
    "Where accurate records exist we publish donation totals, allocations, relevant expenses and the amount available for support.",
    "Figures are management records and are not described as independently audited unless an audit has actually taken place.",
    "You receive a receipt or confirmation for each donation.",
  ]},
  { title: "Legal status and tax", paragraphs: [
    "Unless stated otherwise, Givethra is not a registered charity and donations may not be tax-deductible. Do not assume a tax deduction; consult your own adviser.",
  ]},
  { title: "Refunds and disputes", paragraphs: [
    `Donations are generally final. We will correct duplicate or erroneous charges and handle chargebacks or legal claims as required. Contact ${SITE.supportEmail} within 30 days.`,
  ]},
  { title: "Compliance", paragraphs: [
    "We may decline or return donations that appear to involve fraud, money laundering, sanctions or other illegality, and we may need to verify donors in some cases.",
  ]},
];

export default function DonationPolicyPage() {
  return <LegalPage title="Donation Policy" sections={sections} intro="How voluntary community donations work and how we account for them." />;
}
