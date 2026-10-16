import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/lib/siteConfig";

const sections: LegalSection[] = [
  { title: "Our commitment", paragraphs: [
    "We want Givethra to be usable by everyone, including people with disabilities. We work toward WCAG 2.1/2.2 Level AA: keyboard navigation, readable contrast, screen-reader labels, resizable text and responsive layouts on phones and desktops.",
  ]},
  { title: "Known limitations", paragraphs: [
    "Some uploaded documents and user-created videos may not have captions or alternative text. We are improving this over time.",
  ]},
  { title: "Feedback", paragraphs: [
    `If you have difficulty using any part of Givethra, email ${SITE.supportEmail} and we will help or provide an alternative way to complete the task.`,
  ]},
];

export default function AccessibilityPage() {
  return <LegalPage title="Accessibility Statement" sections={sections} />;
}
