import Layout from "@/components/Layout";
import { AlertTriangle, Heart, ShieldCheck, Users, Lock } from "lucide-react";

const guidelines = [
  { icon: Heart, title: "Lead with Compassion", rules: [
    "Treat every person with dignity and respect.",
    "Help Seekers are sharing vulnerable moments - respond with empathy.",
    "Heroes give their time and money - acknowledge their effort.",
  ]},
  { icon: ShieldCheck, title: "Honesty and Integrity", rules: [
    "Submit only truthful, verifiable requests and genuine documents.",
    "Falsified submissions can lead to suspension or permanent ban and may be reported to authorities.",
    "Heroes must upload real proof of support after helping.",
  ]},
  { icon: Lock, title: "Privacy and Dignity", rules: [
    "Never share, screenshot, record or redistribute case details, documents or appeal videos.",
    "Do not publish anyone's face, address or story without their consent.",
    "Do not contact people outside the platform using information obtained here.",
  ]},
  { icon: Users, title: "Community Respect", rules: [
    "Do not solicit or pressure Heroes, or ask for money outside the platform.",
    "No spam, advertising, chain posts or fake support exchanges.",
    "Posts must be lawful and respectful; no sexual, violent or hateful content.",
  ]},
  { icon: AlertTriangle, title: "Zero Tolerance", rules: [
    "Fraud, forged documents, duplicate accounts or identity misrepresentation.",
    "Harassment, threats, hate or discrimination based on religion, ethnicity, gender, disability or origin.",
    "Attempts to bypass verification, fees, cooldowns or access controls.",
    "Impersonating Givethra staff, or asking for passwords, codes or money to 'guarantee' approval.",
  ]},
];

export default function CommunityGuidelinesPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <header className="space-y-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Community Guidelines</h1>
          <p className="text-muted-foreground">Our shared code of conduct for a trust-based community.</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Givethra works because of trust. These guidelines apply to every Hero, Help Seeker and community member, everywhere in the world.
          </p>
        </header>
        <div className="space-y-6">
          {guidelines.map(({ icon: Icon, title, rules }) => (
            <section key={title} className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
                <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
              </div>
              <ul className="space-y-2">
                {rules.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <section className="rounded-2xl border border-border bg-card p-6 space-y-2">
          <h2 className="font-display text-lg font-semibold">Enforcement and reporting</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Depending on severity we may remove content, restrict features, suspend or permanently ban accounts and report unlawful activity.
            You can appeal a decision. See something wrong? Use the Report page or the report option on any post or case.
          </p>
        </section>
      </div>
    </Layout>
  );
}
