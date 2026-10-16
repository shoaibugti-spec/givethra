import LegalPage, { type LegalSection } from "@/components/LegalPage";

const sections: LegalSection[] = [
  { title: "What community support is", paragraphs: [
    "Eligible users may publish posts and receive support from other users. Support units are a platform feature. They are not cash, credits, donations, salary or guaranteed income. You are not promised earnings merely for registering, posting or supporting others, and results vary.",
  ]},
  { title: "Eligibility", bullets: [
    "A user becomes eligible after reaching the published threshold, currently 5,000 eligible support units, calculated under the published formula.",
    "Support you give to others and support received on your own posts are recorded separately and transparently.",
  ]},
  { title: "Limits", bullets: [
    "Maximum 1,000 support units per post.",
    "One new post after the applicable 24-hour interval.",
    "A user can support a given post only once.",
    "Current reference value: PKR 100 for 1,000 support units. Any change is announced in advance and reflected in these rules.",
  ]},
  { title: "Withdrawals", bullets: [
    "The withdrawal window opens on the 30th of each month and closes on the 3rd of the following month, per the published schedule.",
    "Minimum withdrawal balance: PKR 300 (subject to change with notice).",
    "Withdrawals are reviewed and processed under verification requirements, fraud checks, payment-provider availability and applicable law. The app shows the amount, status, any deductions, expected processing information and the final transaction record.",
    "We do not guarantee a specific processing time unless our systems can reliably meet it.",
    "You are responsible for any taxes on amounts you receive.",
  ]},
  { title: "Fair use", paragraphs: [
    "Artificial support, fake accounts, support exchanges, automation or any manipulation is prohibited. We may reverse support units, withhold withdrawals, and suspend accounts where we find abuse, after giving you the reason and an opportunity to respond where possible.",
  ]},
  { title: "Content rules", paragraphs: [
    "Posts must follow the Community Guidelines. We may remove content that is unlawful, misleading, hateful or exposes private information.",
  ]},
];

export default function CommunitySupportPage() {
  return <LegalPage title="Community Support & Withdrawals" sections={sections} intro="How posts, support units and monthly withdrawals work." />;
}
