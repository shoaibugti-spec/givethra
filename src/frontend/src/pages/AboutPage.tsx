import Layout from "@/components/Layout";
import SocialLinks from "@/components/SocialLinks";
import { SITE } from "@/lib/siteConfig";
import { Globe, Heart, Lock, Shield, Users } from "lucide-react";

const values = [
  { icon: Shield, title: "Verified Requests", description: "Every Help Request is reviewed by our Verification Team for authenticity, completeness and category eligibility before it goes live." },
  { icon: Heart, title: "Direct Assistance", description: "Where practical, Heroes pay the institution or service provider directly - bills, fees, treatment or rent - and upload proof so progress is visible." },
  { icon: Lock, title: "Privacy and Dignity", description: "Private documents are visible only to authorised reviewers. Appeal videos are locked, play-only and unlocked just for eligible Heroes." },
  { icon: Users, title: "Community Participation", description: "Beyond direct help, the community can share posts, support one another, donate voluntarily and take part in Shop Dream Now - each clearly separate and explained." },
  { icon: Globe, title: "Built for the World", description: "Givethra is designed to serve people across continents, expanding country by country as legal, payment and operational readiness allow." },
];

export default function AboutPage() {
  return (
    <Layout>
      <div className="bg-background">
        <section className="py-16 px-4 text-center bg-card border-b border-border">
          <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">About Givethra</h1>
            <p className="text-primary font-medium">{SITE.tagline}</p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Givethra is a humanitarian technology platform that connects people who need help with people who want to help,
              through verified requests, privacy-conscious processes and transparent accountability.
            </p>
          </div>
        </section>

        <section className="py-14 px-4 bg-muted/30">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Generosity is abundant; trust is scarce. Many people want to help but worry where their support goes, and many people in real
              need hesitate to ask because of privacy and dignity. Givethra makes it easier for genuine Help Seekers to apply, easier for Heroes to
              contribute with confidence, and easier for everyone to understand how help is verified and delivered.
            </p>
          </div>
        </section>

        <section className="py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">What We Stand For</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-2xl border border-border bg-card p-6 space-y-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
                  <h3 className="font-display font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 px-4 bg-primary/5 border-t border-border">
          <div className="max-w-2xl mx-auto space-y-3 text-center">
            <h2 className="font-display text-xl font-bold text-foreground">What Givethra is not</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Givethra is not an employer, bank, lender or instalment seller, and it does not guarantee approval, funding, earnings or product awards.
              We are honest about what we do so you can use the platform with confidence.
            </p>
          </div>
        </section>

        <section className="py-12 px-4 border-t border-border">
          <div className="max-w-2xl mx-auto space-y-4 text-center">
            <h2 className="font-display text-xl font-bold text-foreground">Where we operate</h2>
            <p className="text-sm text-muted-foreground">
              Operated from {[SITE.operatorProvince, SITE.operatorRegion].filter(Boolean).join(", ")}, serving users worldwide where permitted.
            </p>
            <div className="flex justify-center"><SocialLinks /></div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
