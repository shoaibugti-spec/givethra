import LegalPage, { type LegalSection } from "@/components/LegalPage";

const sections: LegalSection[] = [
  { title: "How verification works", bullets: [
    "Sign in with Google, complete your profile, then choose a category.",
    "Complete identity verification (KYC), upload category evidence, write your explanation in your own words and record the required appeal video.",
    "Accept the declarations and submit. The Verification Team checks authenticity, completeness, consistency and category eligibility, then records the outcome and the reason for any rejection.",
  ]},
  { title: "Who can see what", bullets: [
    "Private documents (ID, selfie recording, bank statements, bills, fee slips, medical reports, rental evidence): authorised Verification Team members only.",
    "Heroes, direct contributors, other users and the public can never access private documents.",
    "Public case page: approved description, purpose, verification status, amount needed and, with your consent, a limited identity-confirmation image.",
    "Appeal video: locked from the public; only an eligible Hero who unlocks the case can stream it, with authenticated, time-limited, play-only access and no download button.",
  ]},
  { title: "Limits of protection", paragraphs: [
    "We use technical safeguards to discourage downloading, copying and redistribution, but no streaming system can promise that external recording tools can never capture a video. Please record only what you are comfortable sharing with a verified Hero.",
  ]},
  { title: "Verified does not mean guaranteed", paragraphs: [
    "A verified status means the request passed our checks. It does not guarantee funding or that a contribution will resolve every aspect of a person's situation.",
  ]},
  { title: "Rejections and appeals", paragraphs: [
    "You will receive a clear reason and, where permitted, instructions to correct it. You can ask for a human review of a disputed decision or a possible verification error.",
  ]},
  { title: "Retention", bullets: [
    "Rejected applications: documents are deleted under a documented schedule once the correction period ends, subject to legal holds; backups are overwritten on their regular cycle.",
    "Approved applications: limited records documenting verification and completed assistance are kept only for a defined and justified period.",
    "We do not keep every rejected applicant's documents indefinitely without a lawful, documented reason.",
  ]},
  { title: "Completed cases", paragraphs: [
    "When a case is completed, the Hero's access to the private appeal video ends, and both parties may receive a digital confirmation of completion.",
  ]},
  { title: "Using your story for promotion", paragraphs: [
    "We will never use your face, story or feedback video for promotion without a separate, informed consent that you can refuse or withdraw.",
  ]},
];

export default function VerificationPolicyPage() {
  return <LegalPage title="Verification & Data Retention Policy" sections={sections} intro="How we verify requests, who can see your documents and how long we keep them." />;
}
