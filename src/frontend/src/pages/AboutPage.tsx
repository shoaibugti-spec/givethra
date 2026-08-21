import Layout from "@/components/Layout";
import { Globe, Heart, Lock, Shield } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Verified Impact",
    description:
      "Every case on Givethra is reviewed and verified. We cross-check documents, identities, and institutions to ensure your support reaches the right person.",
  },
  {
    icon: Heart,
    title: "Direct Support",
    description:
      "Heroes pay institutions directly — school fees, hospital bills, utility providers. No middlemen, no donation pools. Pure, transparent impact.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Givethra connects people across borders. A Hero in Canada can support a student in Kenya. Verified, safe, and accountable.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Sensitive documents and personal details are locked behind a verified unlock system. Only committed Heroes who pay the unlock fee gain access.",
  },
];

export default function AboutPage() {
  return (
    <Layout>
      <div className="bg-background">
        {/* Hero */}
        <section className="py-20 px-4 text-center bg-card border-b border-border">
          <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              About Givethra
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Givethra is a global trust-based humanitarian platform that
              connects people who need help with people who want to help —
              through verified cases, direct support, and real accountability.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The world has no shortage of generosity. What it lacks is trust.
              Millions of people want to help, but fear fraud, misuse, or
              uncertainty about where their support goes.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Givethra was built to solve that. We verify every case. We protect
              sensitive information. We enable Heroes to pay directly to
              schools, hospitals, and utility providers — so every act of
              support has a paper trail and a real outcome.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-10 text-center">
              What We Stand For
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border bg-card p-6 space-y-3"
                >
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Statement */}
        <section className="py-16 px-4 bg-primary/5 border-t border-border">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              Our Trust Statement
            </h2>
            <p className="text-muted-foreground leading-relaxed italic">
              &ldquo;Givethra is built to create trust and transparency in
              helping others. Every effort is made to verify cases and ensure
              that support reaches the right people. Users are encouraged to
              support with confidence and good intention.&rdquo;
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
