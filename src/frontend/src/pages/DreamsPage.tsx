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

// ==================================================================
// TYPES
// ==================================================================
export type Dream = {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url?: string | null;

  // 💰 Pricing
  dream_price: number;                 // Funding Goal (e.g. 8000)
  actual_market_price?: number | null; // Market Value (e.g. 5000)
  contribution_amount?: number;        // Fixed contribution (e.g. 110)

  // 📊 Funding
  funded_amount: number;
  participant_capacity: number;
  approved_participants: number;

  // 🏷️ Meta
  status: string;
  publication_status?: string;
  announcement_at?: string | null;
  created_at?: string;
};

// ==================================================================
// HELPERS — ek hi jagah, poori app mein same calculation
// ==================================================================
export const money = (value: number) => `PKR ${Math.round(Number(value || 0)).toLocaleString()}`;

/** Market value — admin ne jo daali. Koi fallback nahi. */
export const marketValue = (d: { actual_market_price?: number | null }) =>
  Number(d.actual_market_price || 0);

/** Funding goal — progress iss ke against. */
export const fundingGoal = (d: { dream_price: number }) =>
  Number(d.dream_price || 0);

/** Progress % (0–100). */
export const fundingPercent = (d: { dream_price: number; funded_amount: number }) =>
  Math.min(100, Math.round((Number(d.funded_amount || 0) / Math.max(1, fundingGoal(d))) * 100));

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "funded", label: "Most funded" },
  { value: "contribution_low", label: "Contribution: Low → High" },
  { value: "contribution_high", label: "Contribution: High → Low" },
];

// ==================================================================
// SUB-COMPONENTS
// ==================================================================
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

// ==================================================================
// MAIN PAGE
// ==================================================================
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
    switch (sort) {
      case "newest": list = [...list].sort((a, b) => (a.id < b.id ? 1 : -1)); break;
      case "funded": list = [...list].sort((a, b) => fundingPercent(b) - fundingPercent(a)); break;
      case "contribution_low": list = [...list].sort((a, b) => Number(a.contribution_amount || 0) - Number(b.contribution_amount || 0)); break;
      case "contribution_high": list = [...list].sort((a, b) => Number(b.contribution_amount || 0) - Number(a.contribution_amount || 0)); break;
    }
    return list;
  }, [dreams, query, category, sort]);

  const filtersActive = (category !== "All" ? 1 : 0) + (query.trim() ? 1 : 0);

  return (
    <Layout>
      <main className="min-h-screen bg-[#f7fafb] pb-28 md:pb-12">
        {/* HERO */}
        <section className="relative isolate overflow-hidden border-b border-teal-100 bg-[#075e69] text-white">
          <img src="/dreams-hero-products.png" alt="" className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[68%_center]" />
          <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[#075e69]/92 via-[#087f8b]/60 to-transparent" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Givethra Dreams
              </div>
              <h1 className="mt-4 font-display text-2xl font-black leading-tight tracking-tight md:text-5xl">
                Products you can truly call yours — with a small, fixed contribution.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 md:text-base">
                Browse listed products, see real funding progress, and reserve your spot with one clear contribution.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold text-white/90 md:text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1"><WalletCards className="mr-1.5 inline h-3.5 w-3.5" />Separate from Help cases</span>
                <span className="rounded-full bg-white/10 px-3 py-1"><ShieldCheck className="mr-1.5 inline h-3.5 w-3.5" />Manually verified</span>
                <span className="rounded-full bg-white/10 px-3 py-1"><Users className="mr-1.5 inline h-3.5 w-3.5" />Limited spots</span>
              </div>
            </div>
          </div>
        </section>

        {/* STICKY BAR */}
        <div className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex items-center gap-2 py-2.5">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, e.g. motorcycle, washing machine…"
                  className="h-10 rounded-full border-border bg-white pl-9 pr-9 text-sm"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="relative shrink-0">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-10 max-w-[130px] appearance-none truncate rounded-full border border-border bg-white pl-3 pr-7 text-xs font-semibold text-foreground sm:max-w-none"
                >
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>

              <div className="hidden items-center rounded-full border border-border p-0.5 sm:flex">
                <button onClick={() => setView("grid")} className={`rounded-full p-1.5 ${view === "grid" ? "bg-teal-600 text-white" : "text-muted-foreground"}`} aria-label="Grid view"><Grid3X3 className="h-4 w-4" /></button>
                <button onClick={() => setView("list")} className={`rounded-full p-1.5 ${view === "list" ? "bg-teal-600 text-white" : "text-muted-foreground"}`} aria-label="List view"><List className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((c) => {
                const count = c === "All" ? dreams.length : categoryCounts.get(c) || 0;
                const active = c === category;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                      active
                        ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                        : "border-border bg-white text-muted-foreground hover:border-teal-300 hover:text-teal-700"
                    }`}
                  >
                    <span className="inline-block max-w-[160px] truncate align-middle">{c}</span>
                    <span className={`ml-1 ${active ? "text-white/70" : "text-muted-foreground/70"}`}>{count}</span>
                  </button>
                );
              })}
            </div>

            {filtersActive > 0 && (
              <div className="flex items-center justify-between gap-3 border-t border-border py-2 text-[11px]">
                <p className="truncate text-muted-foreground">
                  <strong className="text-foreground">{visible.length}</strong> {visible.length === 1 ? "Dream" : "Dreams"}
                  {category !== "All" && <> in <strong className="text-foreground">{category}</strong></>}
                  {query && <> for "<strong className="text-foreground">{query}</strong>"</>}
                </p>
                <button
                  onClick={() => { setCategory("All"); setQuery(""); }}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* GRID */}
        <section className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border bg-white">
                  <div className="h-44 animate-pulse bg-muted" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-white p-10 text-center">
              <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="mt-4 font-display text-lg font-bold">No Dreams match your view</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or search keywords.</p>
              <Button onClick={() => { setCategory("All"); setQuery(""); }} variant="outline" className="mt-5 rounded-full">Reset filters</Button>
            </div>
          ) : (
            <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-4"}>
              {visible.map((dream) => <DreamCard key={dream.id} dream={dream} view={view} />)}
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}

// ==================================================================
// CARD
// ==================================================================
function DreamCard({ dream, view }: { dream: Dream; view: "grid" | "list" }) {
  const mv = marketValue(dream);   // 0 agar admin ne set nahi ki (koi fallback nahi)
  const contribution = Number(dream.contribution_amount || 0);

  if (view === "list") {
    return (
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:shadow-md sm:flex-row">
        <div className="relative w-full shrink-0 sm:w-64">
          <ProductImage dream={dream} className="h-44 w-full sm:h-full sm:min-h-[200px]" />
          <span className="absolute right-3 top-3 max-w-[calc(100%-24px)] truncate rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">{dream.status}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-teal-700">{dream.category}</p>
          <h3 className="mt-1 line-clamp-2 font-display text-lg font-bold leading-tight">{dream.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{dream.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            {mv > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Market value</p>
                <p className="text-xs font-semibold text-muted-foreground line-through">{money(mv)}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Your contribution</p>
              <p className="text-xl font-black text-teal-700">{money(contribution)}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quantity</p>
              <p className="text-base font-black text-teal-700">{dream.participant_capacity}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span>Quantity available: {dream.participant_capacity}</span>
          </div>
          <div className="mt-3">
            <Link to="/dreams/$id" params={{ id: dream.id }}>
              <Button className="h-10 w-full rounded-xl bg-teal-700 font-bold hover:bg-teal-800 sm:w-auto sm:px-6">
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
        <ProductImage dream={dream} className="h-40 w-full sm:h-44" />
        <span className="absolute left-2 top-2 max-w-[calc(100%-88px)] truncate rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-700 shadow-sm sm:max-w-[55%]">
          {dream.category}
        </span>
        <span className="absolute right-2 top-2 shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
          {dream.status}
        </span>
        <button aria-label="Save" className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-muted-foreground shadow-sm transition hover:text-rose-600">
          <Heart className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug">{dream.name}</h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground">{dream.description}</p>

        {/* PRICE BLOCK */}
        <div className="mt-3 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-amber-50 p-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-teal-800">Your contribution</p>
            {mv > 0 && (
              <p className="shrink-0 text-[9px] font-semibold text-muted-foreground line-through">{money(mv)}</p>
            )}
          </div>
          <p className="mt-0.5 font-display text-xl font-black text-teal-700">{money(contribution)}</p>
          {mv > 0 ? (
            <p className="text-[9px] font-medium text-teal-800/80">Market value {money(mv)} — you pay a fixed share</p>
          ) : (
            <p className="text-[9px] font-medium text-teal-800/80">Fixed amount to join this Dream</p>
          )}
        </div>
        <p className="mt-2 text-[10px] font-semibold text-muted-foreground">Quantity: {dream.participant_capacity}</p>

        <div className="mt-auto pt-3">
          <Link to="/dreams/$id" params={{ id: dream.id }}>
            <Button className="h-10 w-full rounded-xl bg-teal-700 text-sm font-bold hover:bg-teal-800">
              Participate Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
