// src/pages/DreamsPage.tsx
// Premium E-Commerce Style Dreams Listing Page

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, ChevronDown, Grid3X3, Heart, List, Search, ShieldCheck,
  Sparkles, TrendingUp, Users, WalletCards, X, Star,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDreams } from "@/lib/api";
import { handleImageError, resolveMediaUrl } from "@/lib/media";

export type Dream = {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url?: string | null;
  dream_price: number;
  actual_market_price?: number | null;
  contribution_amount?: number;
  quantity: number;
  funded_amount: number;
  participant_capacity: number;
  approved_participants: number;
  status: string;
  publication_status?: string;
  announcement_at?: string | null;
  created_at?: string;
};

export const money = (value: number) => `PKR ${Math.round(Number(value || 0)).toLocaleString()}`;
export const marketValue = (d: { actual_market_price?: number | null }) => Number(d.actual_market_price || 0);
export const fundingGoal = (d: { dream_price: number }) => Number(d.dream_price || 0);
export const fundingPercent = (d: { dream_price: number; funded_amount: number }) => Math.min(100, Math.round((Number(d.funded_amount || 0) / Math.max(1, fundingGoal(d))) * 100));

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "funded", label: "Most funded" },
  { value: "contribution_low", label: "Lowest Contribution" },
  { value: "contribution_high", label: "Highest Contribution" },
];

function ProductImage({ dream, className = "" }: { dream: Dream; className?: string }) {
  const imageUrl = resolveMediaUrl(dream.image_url);
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 to-white ${className}`}>
      {dream.image_url ? (
        <img src={imageUrl} alt={dream.name} onError={handleImageError} className="relative h-full w-full object-cover transition duration-700 group-hover:scale-110" />
      ) : (
        <div className="relative px-5 text-center text-sm font-semibold text-slate-400">Image coming soon</div>
      )}
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
      <main className="min-h-screen bg-slate-50 pb-28 md:pb-12">
        
        {/* HERO BANNER (E-Commerce Style) */}
        <section className="relative isolate overflow-hidden border-b border-slate-200 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-600 text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Givethra Dreams
              </div>
              <h1 className="mt-4 font-display text-3xl font-black leading-tight tracking-tight md:text-5xl">
                Big Dreams, Small Contributions.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-teal-100 md:text-base">
                Browse listed products, see real funding progress, and reserve your spot with one clear contribution.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold text-white/90 md:text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1"><WalletCards className="mr-1.5 inline h-3.5 w-3.5" />Separate from Help cases</span>
                <span className="rounded-full bg-white/10 px-3 py-1"><ShieldCheck className="mr-1.5 inline h-3.5 w-3.5" />Manually verified</span>
                <span className="rounded-full bg-white/10 px-3 py-1"><Users className="mr-1.5 inline h-3.5 w-3.5" />Limited spots</span>
              </div>
            </div>
          </div>
        </section>

        {/* STICKY FILTER BAR */}
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex items-center gap-3 py-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, e.g. motorcycle, washing machine…"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-10 text-sm focus:border-teal-500 focus:bg-white focus:ring-teal-500"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="relative shrink-0">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-11 max-w-[130px] appearance-none truncate rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-bold text-slate-700 shadow-sm sm:max-w-none"
                >
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 p-1 sm:flex">
                <button onClick={() => setView("grid")} className={`rounded-lg p-2 transition ${view === "grid" ? "bg-white text-teal-600 shadow-sm" : "text-slate-400"}`}><Grid3X3 className="h-4 w-4" /></button>
                <button onClick={() => setView("list")} className={`rounded-lg p-2 transition ${view === "list" ? "bg-white text-teal-600 shadow-sm" : "text-slate-400"}`}><List className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((c) => {
                const count = c === "All" ? dreams.length : categoryCounts.get(c) || 0;
                const active = c === category;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                      active
                        ? "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                    }`}
                  >
                    {c} <span className={`ml-1 ${active ? "text-white/70" : "text-slate-400"}`}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="h-48 animate-pulse bg-slate-100" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-5 w-4/5 animate-pulse rounded bg-slate-100" />
                    <div className="h-16 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 font-display text-xl font-black text-slate-900">No Dreams found</h3>
              <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search keywords.</p>
              <Button onClick={() => { setCategory("All"); setQuery(""); }} variant="outline" className="mt-6 rounded-xl">Reset Filters</Button>
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
  const mv = marketValue(dream);
  const contribution = Number(dream.contribution_amount || 0);

  if (view === "list") {
    return (
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg sm:flex-row">
        <div className="relative w-full shrink-0 sm:w-72">
          <ProductImage dream={dream} className="h-48 w-full sm:h-full sm:min-h-[220px]" />
          <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">{dream.status}</span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-teal-600">{dream.category}</p>
          <h3 className="mt-1 line-clamp-2 font-display text-xl font-black text-slate-900 group-hover:text-teal-700 transition-colors">{dream.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-500 leading-relaxed">{dream.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            {mv > 0 && (
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Market Price</p><p className="text-sm font-bold text-slate-500 line-through">{money(mv)}</p></div>
            )}
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Your Contribution</p><p className="text-2xl font-black text-teal-700">{money(contribution)}</p></div>
            <div className="ml-auto text-right"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quantity</p><p className="text-lg font-black text-slate-900">{dream.quantity}</p></div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-500">Funded: {fundingPercent(dream)}%</p>
            <Link to="/dreams/$id" params={{ id: dream.id }}>
              <Button className="h-11 rounded-xl bg-slate-900 px-6 font-bold text-white hover:bg-teal-700">Participate <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-teal-200">
      <div className="relative">
        <ProductImage dream={dream} className="h-48 w-full" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700 shadow-sm backdrop-blur">{dream.category}</span>
        <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">{dream.status}</span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors">{dream.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{dream.description}</p>

        <div className="mt-4 rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/80 to-emerald-50/80 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-teal-700">Contribution</p>
            {mv > 0 && <p className="text-[10px] font-semibold text-slate-400 line-through">{money(mv)}</p>}
          </div>
          <p className="mt-1 font-display text-2xl font-black text-teal-800">{money(contribution)}</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <TrendingUp className="h-3 w-3" /> {fundingPercent(dream)}% Funded
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Link to="/dreams/$id" params={{ id: dream.id }}>
            <Button className="h-11 w-full rounded-xl bg-slate-900 text-sm font-bold text-white transition-colors hover:bg-teal-700">
              Participate Now
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
