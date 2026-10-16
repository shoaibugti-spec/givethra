// src/components/LegalPage.tsx  - shared layout for all policy pages
import Layout from "@/components/Layout";
import type { ReactNode } from "react";
import { SITE } from "@/lib/siteConfig";

export type LegalSection = { title: string; paragraphs?: string[]; bullets?: string[] };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function LegalPage({
  title, intro, sections, updated = SITE.lastUpdated, children,
}: { title: string; intro?: string; sections: LegalSection[]; updated?: string; children?: ReactNode }) {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <header className="space-y-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
          {intro && <p className="text-muted-foreground leading-relaxed text-sm">{intro}</p>}
        </header>

        <nav aria-label="Contents" className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-2">Contents</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            {sections.map((s) => (
              <li key={s.title}><a className="text-primary hover:underline" href={`#${slug(s.title)}`}>{s.title}</a></li>
            ))}
          </ol>
        </nav>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={s.title} id={slug(s.title)} className="space-y-3 scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-foreground">{i + 1}. {s.title}</h2>
              {s.paragraphs?.map((p) => (
                <p key={p} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
              ))}
              {s.bullets && (
                <ul className="space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        {children}
      </div>
    </Layout>
  );
}
