import Layout from "@/components/Layout";

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By using Givethra, you agree to these Terms of Service. If you do not agree, please do not use the platform. We may update these terms at any time; continued use constitutes acceptance.",
  },
  {
    title: "User Eligibility",
    content:
      "You must be at least 18 years old to create an account. By registering, you confirm that all information you provide is accurate and truthful.",
  },
  {
    title: "Help Seekers",
    content:
      "Help Seekers must submit truthful, verifiable requests. Submitting false information, duplicate requests, or fraudulent documents will result in immediate suspension and possible legal action.",
  },
  {
    title: "Heroes",
    content:
      "Heroes use Givethra to discover and support verified cases. Heroes pay directly to institutions and upload proof of support. Givethra does not handle or transfer donations.",
  },
  {
    title: "Platform Fees",
    content:
      "A listing fee of $1 USD is required to submit a help request. A $2 USD unlock fee grants permanent access to case documents and contact details for that case.",
  },
  {
    title: "No Guarantees",
    content:
      "Givethra verifies cases to the best of its ability but cannot guarantee outcomes. Heroes support at their own discretion. Givethra is not responsible for the actions of users.",
  },
  {
    title: "Prohibited Conduct",
    content:
      "Users may not submit false information, harass others, attempt to circumvent fees, resell access to case documents, or use the platform for any illegal purpose.",
  },
  {
    title: "Termination",
    content:
      "We reserve the right to suspend or terminate accounts that violate these terms, engage in fraud, or harm the community.",
  },
];

export default function TermsPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-3">
          <h1 className="font-display text-4xl font-bold text-foreground">
            Terms &amp; Conditions
          </h1>
          <p className="text-muted-foreground">Last updated: June 2026</p>
        </div>

        <p className="text-muted-foreground leading-relaxed text-sm">
          Please read these terms carefully before using Givethra.
        </p>

        <div className="space-y-8">
          {sections.map(({ title, content }) => (
            <section key={title} className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">
                {title}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {content}
              </p>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
