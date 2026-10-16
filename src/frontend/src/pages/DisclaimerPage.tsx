import LegalPage, { type LegalSection } from "@/components/LegalPage";

const sections: LegalSection[] = [
  { title: "General", paragraphs: [
    "Givethra provides a platform to connect people and does not provide financial, legal, tax, medical or investment advice. Information on the site is general and may change.",
  ]},
  { title: "No guarantees", bullets: [
    "No guarantee of approval, funding, assistance, earnings, product awards or processing times.",
    "No guarantee that a verified case will resolve a person's circumstances.",
    "No absolute-privacy promise: we use strong safeguards but no system is risk-free.",
  ]},
  { title: "Not an employer, lender or charity (unless stated)", paragraphs: [
    "Givethra is not an employer, bank, lender or instalment seller. Unless we state otherwise, it is not a registered charity and donations may not be tax-deductible.",
  ]},
  { title: "Third parties", paragraphs: [
    "Heroes pay institutions and providers directly; we are not responsible for third-party services, sites or payment providers.",
  ]},
  { title: "Local laws", paragraphs: [
    "Laws differ by country. You are responsible for using Givethra lawfully where you are. Some features may be unavailable in your location.",
  ]},
];

export default function DisclaimerPage() {
  return <LegalPage title="Disclaimer" sections={sections} />;
}
