import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Award, BadgeCheck, Crown, Medal, Sparkles, Trophy, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getHeroLeaderboard } from "@/lib/api";

type LeaderboardHero = {
  user_id: string;
  full_name?: string;
  avatar_url?: string | null;
  cases_helped?: number | string;
  total_amount?: number | string;
};

type BadgeKey = "all" | "super" | "hero" | "young" | "new";
type SortKey = "cases" | "amount";

const BADGES: Record<Exclude<BadgeKey, "all">, { label: string; description: string; icon: typeof Crown; className: string }> = {
  super: {
    label: "Super Hero",
    description: "10 or more verified cases, or at least Rs 500,000 in verified help.",
    icon: Crown,
    className: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800",
  },
  hero: {
    label: "Hero",
    description: "5 or more verified cases, or at least Rs 100,000 in verified help.",
    icon: Trophy,
    className: "bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-800",
  },
  young: {
    label: "Young Hero",
    description: "2 or more verified cases, or at least Rs 25,000 in verified help.",
    icon: Sparkles,
    className: "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-800",
  },
  new: {
    label: "New Hero",
    description: "A verified Hero who has started making an impact in the community.",
    icon: Award,
    className: "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800",
  },
};

function getBadge(hero: LeaderboardHero): Exclude<BadgeKey, "all"> {
  const cases = Number(hero.cases_helped || 0);
  const amount = Number(hero.total_amount || 0);
  if (cases >= 10 || amount >= 500000) return "super";
  if (cases >= 5 || amount >= 100000) return "hero";
  if (cases >= 2 || amount >= 25000) return "young";
  return "new";
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "GH";
}

function rankIcon(rank: number) {
  if (rank === 1) return <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-amber-900 shadow-sm ring-2 ring-amber-300/70"><Crown className="h-4 w-4" fill="currentColor" /><span className="absolute -bottom-1 rounded-full bg-amber-700 px-1 text-[8px] font-black leading-3 text-white">1</span></span>;
  if (rank === 2) return <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-400 text-slate-700 shadow-sm ring-2 ring-slate-300/70"><Medal className="h-4 w-4" /><span className="absolute -bottom-1 rounded-full bg-slate-600 px-1 text-[8px] font-black leading-3 text-white">2</span></span>;
  if (rank === 3) return <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 to-orange-500 text-orange-900 shadow-sm ring-2 ring-orange-300/70"><Medal className="h-4 w-4" /><span className="absolute -bottom-1 rounded-full bg-orange-700 px-1 text-[8px] font-black leading-3 text-white">3</span></span>;
  return <span className="text-sm font-black text-muted-foreground">#{rank}</span>;
}

export default function HeroLeaderboard() {
  const [heroes, setHeroes] = useState<LeaderboardHero[]>([]);
  const [filter, setFilter] = useState<BadgeKey>("all");
  const [sortKey, setSortKey] = useState<SortKey>("cases");
  const [ascending, setAscending] = useState(false);
  const [expandedBadge, setExpandedBadge] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getHeroLeaderboard(100)
      .then((rows) => {
        if (!cancelled) setHeroes(rows);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Hero rankings are temporarily unavailable.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleHeroes = useMemo(() => {
    const filtered = heroes.filter((hero) => filter === "all" || getBadge(hero) === filter);
    return [...filtered].sort((a, b) => {
      const aValue = sortKey === "cases" ? Number(a.cases_helped || 0) : Number(a.total_amount || 0);
      const bValue = sortKey === "cases" ? Number(b.cases_helped || 0) : Number(b.total_amount || 0);
      if (aValue !== bValue) return ascending ? aValue - bValue : bValue - aValue;
      return Number(b.cases_helped || 0) - Number(a.cases_helped || 0);
    });
  }, [ascending, filter, heroes, sortKey]);

  return (
    <section aria-labelledby="hero-leaderboard-title" className="bg-background px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-[0_18px_60px_-30px_rgba(13,148,136,0.45)]">
        <div className="border-b border-border bg-gradient-to-br from-primary/10 via-card to-amber-50/70 px-5 py-6 dark:to-amber-950/20 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><Trophy className="h-4 w-4" /> Community recognition</p>
              <h2 id="hero-leaderboard-title" className="mt-2 font-display text-2xl font-black tracking-tight sm:text-3xl">Hero Ranking Leaderboard</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Celebrating the people turning verified help into real impact. Rankings are based on approved, Givethra-confirmed help.</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-primary/15 bg-background/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <Users className="h-4 w-4 text-primary" /> Top 100 Heroes
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2" aria-label="Hero badge filters">
              {(["all", "super", "hero", "young", "new"] as BadgeKey[]).map((key) => {
                const label = key === "all" ? "All Heroes" : BADGES[key].label;
                return <button key={key} type="button" onClick={() => setFilter(key)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${filter === key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>{label}</button>;
              })}
            </div>
            <button type="button" onClick={() => setAscending((value) => !value)} className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:self-auto" aria-label={`Sort ${ascending ? "highest" : "lowest"} first`}>
              {sortKey === "cases" ? "Cases helped" : "Help amount"}
              {ascending ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Leaderboard sorting">
            {(["cases", "amount"] as SortKey[]).map((key) => <button key={key} type="button" onClick={() => setSortKey(key)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${sortKey === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>{key === "cases" ? "Most cases" : "Highest amount"} {sortKey === key ? <ArrowUpDown className="h-3 w-3" /> : null}</button>)}
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2 sm:max-h-[620px] sm:p-5" aria-live="polite">
          {loading && <div className="grid gap-3">{[1, 2, 3, 4].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-muted" />)}</div>}
          {!loading && error && <div className="rounded-2xl bg-muted/50 p-6 text-center text-sm text-muted-foreground">{error}</div>}
          {!loading && !error && !visibleHeroes.length && <div className="rounded-2xl bg-muted/50 p-6 text-center text-sm text-muted-foreground">Verified Hero rankings will appear here after approved help is confirmed.</div>}
          {!loading && !error && visibleHeroes.length > 0 && <div className="space-y-2">{visibleHeroes.map((hero, index) => {
            const rank = index + 1;
            const badgeKey = getBadge(hero);
            const badge = BADGES[badgeKey];
            const BadgeIcon = badge.icon;
            const name = hero.full_name || "Givethra Hero";
            const badgeOpen = expandedBadge === hero.user_id;
            return <div key={hero.user_id} className={`relative flex min-h-[58px] items-center gap-2 rounded-xl border px-2.5 py-2 transition-all hover:border-primary/35 hover:shadow-sm sm:gap-4 sm:rounded-2xl sm:p-4 ${rank <= 3 ? "border-primary/20 bg-primary/[0.035]" : "border-border bg-background"}`}>
              <div className="flex w-7 shrink-0 items-center justify-center sm:w-10">{rankIcon(rank)}</div>
              <Link to="/profile/$id" params={{ id: hero.user_id }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-1 ring-border sm:h-12 sm:w-12 sm:rounded-2xl">{hero.avatar_url ? <img src={hero.avatar_url} alt={name} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full w-full items-center justify-center text-xs font-black text-primary sm:text-sm">{initials(name)}</div>}</div>
                <div className="min-w-0"><p className="whitespace-nowrap text-xs font-bold leading-4 text-foreground hover:text-primary sm:text-base sm:leading-5" title={name}>{name}</p><p className="mt-0.5 whitespace-nowrap text-[10px] text-muted-foreground sm:text-xs">{Number(hero.cases_helped || 0)} {Number(hero.cases_helped || 0) === 1 ? "case" : "cases"} helped</p></div>
              </Link>
              <div className="hidden items-center gap-2 sm:flex">
                <button type="button" onClick={() => setExpandedBadge(badgeOpen ? null : hero.user_id)} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-black ring-1 ${badge.className}`} aria-label={`${badge.label} badge information`} title={badge.description}><BadgeIcon className="h-3.5 w-3.5" /> {badge.label}</button>
                {badgeOpen && <span className="max-w-[190px] text-[10px] leading-4 text-muted-foreground">{badge.description}</span>}
              </div>
              <div className="shrink-0 whitespace-nowrap text-right"><p className="text-[11px] font-black text-teal-600 sm:text-sm">Rs {Number(hero.total_amount || 0).toLocaleString()}</p><p className="text-[9px] text-muted-foreground sm:text-[10px]">verified help</p></div>
              <Link to="/profile/$id" params={{ id: hero.user_id }} className="hidden rounded-xl border border-primary/20 px-2.5 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/10 md:inline-flex">Profile</Link>
              <button type="button" onClick={() => setExpandedBadge(badgeOpen ? null : hero.user_id)} className={`inline-flex max-w-[86px] shrink-0 items-center justify-center gap-1 rounded-full px-2 py-1 text-[9px] font-black leading-3 ring-1 sm:hidden ${badge.className}`} aria-label={`${badge.label} badge information`}><BadgeCheck className="h-3 w-3" /><span className="truncate">{badge.label}</span></button>
              {badgeOpen && <div className="absolute right-3 top-[calc(100%+4px)] z-10 max-w-[230px] rounded-xl border border-border bg-card p-3 text-[11px] leading-4 text-muted-foreground shadow-lg sm:hidden">{badge.description}</div>}
            </div>;
          })}</div>}
        </div>
      </div>
    </section>
  );
}
