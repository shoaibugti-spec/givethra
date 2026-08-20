import Layout from "@/components/Layout";
import { AlertTriangle, Heart, ShieldCheck, Users } from "lucide-react";

const guidelines = [
  {
    icon: Heart,
    title: "Lead with Compassion",
    rules: [
      "Treat every person on this platform with dignity and respect.",
      "Remember that Help Seekers are sharing vulnerable moments — respond with empathy.",
      "Heroes are giving their time and money — appreciate and acknowledge their efforts.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Honesty and Integrity",
    rules: [
      "Submit only truthful, verifiable help requests.",
      "Upload genuine documents — falsified submissions result in permanent bans.",
      "Heroes must upload real proof of support after completing a case.",
    ],
  },
  {
    icon: Users,
    title: "Community Respect",
    rules: [
      "Do not contact people outside the platform using information obtained here.",
      "Respect privacy — do not share case details or personal information publicly.",
      "Do not solicit or pressure Heroes for faster support.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Zero Tolerance",
    rules: [
      "Fraud, duplicate requests, or identity misrepresentation result in immediate permanent ban.",
      "Harassment, threats, or discriminatory behavior are not tolerated.",
      "Attempting to bypass verification or platform fees is prohibited.",
    ],
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-3">
          <h1 className="font-display text-4xl font-bold text-foreground">
            Community Guidelines
          </h1>
          <p className="text-muted-foreground">
            Our shared code of conduct for a trust-based community.
          </p>
        </div>

        <p className="text-muted-foreground leading-relaxed text-sm">
          Givethra works because of trust. These guidelines define how every
          member of our community — Heroes and Help Seekers alike — should
          interact with one another and with the platform.
        </p>

        <div className="space-y-8">
          {guidelines.map(({ icon: Icon, title, rules }) => (
            <section
              key={title}
              className="rounded-2xl border border-border bg-card p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {title}
                </h2>
              </div>
              <ul className="space-y-2">
                {rules.map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
