import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, ChevronDown, Grid3X3, Heart, List, Search, ShieldCheck,
  Sparkles, TrendingUp, Users, WalletCards, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDreams } from "@/lib/api";

export type Dream = {
  id: string; name: string; category: string; description: string; image_url?: string | null;
  dream_price: number; contribution_amount?: number; funded_amount: number; participant_capacity: number;
  approved_participants: number; status: string; announcement_at?: string | null;
};
export const money = (value: number) => `PKR ${Math.round(Number(value || 0)).toLocaleString()}`;

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "funded", label: "Most funded" },
  { value: "contribution_low", label: "Contribution: Low → High" },
  { value: "contribution_high", label: "Contribution: High → Low" },
];

function ProductImage({ dream, className = "" }: { dream: Dream; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50 ${className}`}>
      <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-teal-200/30 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-amber-200/35 blur-2xl" />
      {dream.image_url ? (
        <img src={dream.image_url} alt={dream.name} className="relative h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      ) : (
        <div className="relative px-5 text-center text-sm font-semibold text-teal-700">Product image coming soon</div>
      )}
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-teal-100">
      <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-amber-400 transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

export default function DreamsPage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDreams().then(setDreams).catch(() => setDreams([])).finally(() => setLoading(false));
  }, []);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    dreams.forEach((d) => map.set(d.category, (map.get(d.category) || 0) + 1));
    return map;
  }, [dreams]);

  const categories = useMemo(() => ["All", ...Array.from(categoryCounts.keys())], [categoryCounts]);

  const visible = useMemo(() => {
    let list = dreams.filter(
      (d) =>
        `${d.name} ${d.category} ${d.description}`.toLowerCase().includes(query.trim().toLowerCase()) &&
        (category === "All" || d.category === category),
    );
    const pct = (d: Dream) => Number(d.funded_amount || 0) / Math.max(1, Number(d.dream_price || 1));
    switch (sort) {
      case "newest": list = [...list].sort((a, b) => (a.id < b.id ? 1 : -1)); break;
      case "funded": list = [...list].sort((a, b) => pct(b) - pct(a)); break;
      case "contribution_low": list = [...list].sort((a, b) => Number(a.contribution_amount || 0) - Number(b.contribution_amount || 0)); break;
      case "contribution_high": list = [...list].sort((a, b) => Number(b.contribution_amount || 0) - Number(a.contribution_amount || 0)); break;
    }
    return list;
  }, [dreams, query, category, sort]);

  const filtersActive = (category !== "All" ? 1 : 0) + (query ? 1 : 0);

  return (
    <Layout>
      <main className="min-h-screen bg-[#f7fafb] pb-24 md:pb-12">
        {/* HERO */}
        <section className="relative isolate overflow-hidden border-b border-teal-100 bg-[#075e69] text-white">
          <img src="/dreams-hero-products.png" alt="" className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[68%_center]" />
          <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[#075e69]/92 via-[#087f8b]/60 to-transparent" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Givethra Dreams
              </div>
              <h1 className="mt-4 font-display text-3xl font-black leading-tight tracking-tight md:text-5xl">
                Products you can truly call yours — with a small, fixed contribution.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/85 md:text-base">
                Browse listed products, see real funding progress, and reserve your spot with one clear contribution amount.
              </p>
            </div>

            {/* SEARCH */}
            <div className="mt-7 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, e.g. motorcycle, washing machine, car…"
                  className="h-14 rounded-full border-none bg-white pl-12 pr-4 text-base shadow-lg shadow-black/10"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-white/85">
                <span className="rounded-full bg-white/10 px-3 py-1"><WalletCards className="mr-1.5 inline h-3.5 w-3.5" />Separate from Help cases</span>
                <span className="rounded-full bg-white/10 px-3 py-1"><ShieldCheck className="mr-1.5 inline h-3.5 w-3.5" />Manually verified payment</span>
                <span className="rounded-full bg-white/10 px-3 py-1"><Users className="mr-1.5 inline h-3.5 w-3.5" />Limited spots per product</span>
              </div>
            </div>
          </div>
        </section>

        {/* STICKY FILTER BAR */}
        <div className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((c) => {
                const count = c === "All" ? dreams.length : categoryCounts.get(c) || 0;
                const active = c === category;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                      active
                        ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                        : "border-border bg-white text-muted-foreground hover:border-teal-300 hover:text-teal-700"
                    }`}
                  >
                    {c} <span className={`ml-1 ${active ? "text-white/70" : "text-muted-foreground/70"}`}>{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-3">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">{visible.length}</strong> {visible.length === 1 ? "Dream" : "Dreams"}
                {category !== "All" && <> in <strong className="text-foreground">{category}</strong></>}
                {query && <> for "<strong className="text-foreground">{query}</strong>"</>}
              </p>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-9 appearance-none rounded-full border border-border bg-white pl-3 pr-8 text-xs font-semibold text-foreground"
                  >
                    {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="hidden items-center rounded-full border border-border p-0.5 sm:flex">
                  <button onClick={() => setView("grid")} className={`rounded-full p-1.5 ${view === "grid" ? "bg-teal-600 text-white" : "text-muted-foreground"}`} aria-label="Grid view"><Grid3X3 className="h-4 w-4" /></button>
                  <button onClick={() => setView("list")} className={`rounded-full p-1.5 ${view === "list" ? "bg-teal-600 text-white" : "text-muted-foreground"}`} aria-label="List view"><List className="h-4 w-4" /></button>
                </div>

                {filtersActive > 0 && (
                  <button
                    onClick={() => { setCategory("All"); setQuery(""); }}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700"
                  >
                    <X className="h-3.5 w-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* GRID */}
        <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border bg-white">
                  <div className="h-48 animate-pulse bg-muted" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-white p-12 text-center">
              <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="mt-4 font-display text-xl font-bold">No Dreams match your view</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or search keywords.</p>
              <Button onClick={() => { setCategory("All"); setQuery(""); }} variant="outline" className="mt-5 rounded-full">Reset filters</Button>
            </div>
          ) : (
            <div className={view === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-4"}>
              {visible.map((dream) => <DreamCard key={dream.id} dream={dream} view={view} />)}
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}

function DreamCard({ dream, view }: { dream: Dream; view: "grid" | "list" }) {
  const percent = Math.min(100, Math.round((Number(dream.funded_amount || 0) / Math.max(1, Number(dream.dream_price || 1))) * 100));
  const left = Math.max(0, Number(dream.dream_price || 0) - Number(dream.funded_amount || 0));
  const spotsLeft = Math.max(0, Number(dream.participant_capacity || 0) - Number(dream.approved_participants || 0));
  const contribution = Number(dream.contribution_amount || 0);

  if (view === "list") {
    return (
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:shadow-md sm:flex-row">
        <div className="relative w-full shrink-0 sm:w-64">
          <ProductImage dream={dream} className="h-48 w-full" />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700 shadow-sm">{dream.category}</span>
          <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">{dream.status}</span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-xl font-bold leading-tight">{dream.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{dream.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Market value</p>
              <p className="text-sm font-semibold text-muted-foreground line-through">{money(dream.dream_price)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Your contribution</p>
              <p className="text-2xl font-black text-teal-700">{money(contribution)}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Funded</p>
              <p className="text-lg font-black text-amber-600">{percent}%</p>
            </div>
          </div>
          <div className="mt-3"><ProgressBar percent={percent} /></div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span><Users className="mr-1 inline h-3.5 w-3.5" />{dream.approved_participants} joined · {spotsLeft} spots left</span>
            <span>{money(left)} still needed</span>
          </div>
          <div className="mt-4">
            <Link to="/dreams/$id" params={{ id: dream.id }}>
              <Button className="h-11 w-full rounded-xl bg-teal-700 font-bold hover:bg-teal-800 sm:w-auto sm:px-6">
                Participate Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
      <div className="relative">
        <ProductImage dream={dream} className="h-48 w-full" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700 shadow-sm">{dream.category}</span>
        <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">{dream.status}</span>
        <button aria-label="Save" className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-muted-foreground shadow-sm transition hover:text-rose-600">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-base font-bold leading-snug">{dream.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{dream.description}</p>

        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1 font-semibold text-teal-700"><TrendingUp className="h-3.5 w-3.5" />{percent}% funded</span>
          <span className="text-muted-foreground">{spotsLeft} spots left</span>
        </div>
        <div className="mt-2"><ProgressBar percent={percent} /></div>

        {/* HIGHLIGHTED PRICE BLOCK */}
        <div className="mt-4 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-amber-50 p-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Your contribution</p>
            <p className="text-[10px] font-semibold text-muted-foreground line-through">{money(dream.dream_price)}</p>
          </div>
          <p className="mt-0.5 font-display text-2xl font-black text-teal-700">{money(contribution)}</p>
          <p className="text-[10px] font-medium text-teal-800/80">Fixed amount to join this Dream</p>
        </div>

        <div className="mt-auto pt-4">
          <Link to="/dreams/$id" params={{ id: dream.id }}>
            <Button className="h-11 w-full rounded-xl bg-teal-700 font-bold hover:bg-teal-800">
              Participate Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
