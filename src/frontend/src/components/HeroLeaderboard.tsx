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
  if (rank === 1) return <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-amber-900 shadow-sm ring-2 ring-amber-300/70"><Crown className="h-4 w-4" fill="currentColor" /><span className="absolute -bottom-1 rounded-full bg-amber-700 px-1 text-[8px] font-black leading-3 text-white">1</span></span>;
  if (rank === 2) return <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-400 text-slate-700 shadow-sm ring-2 ring-slate-300/70"><Medal className="h-4 w-4" /><span className="absolute -bottom-1 rounded-full bg-slate-600 px-1 text-[8px] font-black leading-3 text-white">2</span></span>;
  if (rank === 3) return <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 to-orange-500 text-orange-900 shadow-sm ring-2 ring-orange-300/70"><Medal className="h-4 w-4" /><span className="absolute -bottom-1 rounded-full bg-orange-700 px-1 text-[8px] font-black leading-3 text-white">3</span></span>;
  return <span className="text-sm font-black text-muted-foreground w-6 text-center">#{rank}</span>;
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

  const topFour = visibleHeroes.slice(0, 4);
  const remainingHeroes = visibleHeroes.slice(4);

  return (
    <section aria-labelledby="hero-leaderboard-title" className="bg-background px-0 py-0 sm:px-4 sm:py-8 flex flex-col min-h-screen sm:min-h-0">
      <div className="mx-auto w-full max-w-5xl flex-1 flex flex-col overflow-hidden sm:rounded-3xl border-0 sm:border border-primary/15 bg-card shadow-none sm:shadow-[0_18px_60px_-30px_rgba(13,148,136,0.45)]">
        
        {/* Header Section */}
        <div className="border-b border-border bg-gradient-to-br from-primary/10 via-card to-amber-50/70 px-4 py-6 dark:to-amber-950/20 sm:px-7 shrink-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><Trophy className="h-4 w-4" /> Community recognition</p>
              <h2 id="hero-leaderboard-title" className="mt-2 font-display text-2xl font-black tracking-tight sm:text-3xl">Hero Ranking Leaderboard</h2>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-6 text-muted-foreground">Celebrating the people turning verified help into real impact. Rankings are based on approved, Givethra-confirmed help.</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-primary/15 bg-background/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <Users className="h-4 w-4 text-primary" /> Top 100 Heroes
            </div>
          </div>
          
          {/* Filters & Sort Controls */}
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar" aria-label="Hero badge filters">
              {(["all", "super", "hero", "young", "new"] as BadgeKey[]).map((key) => {
                const label = key === "all" ? "All Heroes" : BADGES[key].label;
                return <button key={key} type="button" onClick={() => setFilter(key)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${filter === key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>{label}</button>;
              })}
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2" aria-label="Leaderboard sorting">
                {(["cases", "amount"] as SortKey[]).map((key) => <button key={key} type="button" onClick={() => setSortKey(key)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${sortKey === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>{key === "cases" ? "Most cases" : "Highest amount"} {sortKey === key ? <ArrowUpDown className="h-3 w-3" /> : null}</button>)}
              </div>
              <button type="button" onClick={() => setAscending((value) => !value)} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground" aria-label={`Sort ${ascending ? "highest" : "lowest"} first`}>
                {ascending ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6" aria-live="polite">
          {loading && (
            <div className="grid gap-3">{[1, 2, 3, 4].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-muted" />)}</div>
          )}
          
          {!loading && error && <div className="rounded-2xl bg-muted/50 p-6 text-center text-sm text-muted-foreground">{error}</div>}
          
          {!loading && !error && !visibleHeroes.length && <div className="rounded-2xl bg-muted/50 p-6 text-center text-sm text-muted-foreground">Verified Hero rankings will appear here after approved help is confirmed.</div>}
          
          {!loading && !error && visibleHeroes.length > 0 && (
            <div className="space-y-6">
              
              {/* 🏆 Diamond Podium for Top 4 */}
              <div className="relative pt-6 pb-4 px-2 sm:px-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-2xl mx-auto">
                  {/* 1st Place - Center Top */}
                  <div className="col-start-2 flex flex-col items-center">
                    <div className="relative flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-card dark:from-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 w-full shadow-sm">
                      <span className="absolute -top-3 text-xl">👑</span>
                      <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full overflow-hidden ring-4 ring-amber-400/30 mt-2">
                        {topFour[0].avatar_url ? <img src={topFour[0].avatar_url} alt={topFour[0].full_name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-amber-100 text-amber-700 font-black text-lg">{initials(topFour[0].full_name || "Hero")}</div>}
                      </div>
                      <p className="mt-2 text-xs sm:text-sm font-black text-center truncate w-full">{topFour[0].full_name || "Givethra Hero"}</p>
                      <p className="text-[10px] sm:text-xs font-bold text-teal-600 mt-0.5">Rs {Number(topFour[0].total_amount || 0).toLocaleString()}</p>
                      <p className="text-[9px] text-muted-foreground">{topFour[0].cases_helped || 0} cases</p>
                    </div>
                  </div>

                  {/* 2nd Place - Left */}
                  {topFour[1] && (
                    <div className="col-start-1 row-start-2 flex flex-col items-center mt-[-20px] sm:mt-[-30px]">
                      <div className="relative flex flex-col items-center p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-slate-50 to-card dark:from-slate-900/40 border border-slate-200/50 dark:border-slate-800/30 w-full shadow-sm">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full overflow-hidden ring-4 ring-slate-300/30">
                          {topFour[1].avatar_url ? <img src={topFour[1].avatar_url} alt={topFour[1].full_name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-700 font-black text-sm">{initials(topFour[1].full_name || "Hero")}</div>}
                        </div>
                        <p className="mt-2 text-[11px] sm:text-xs font-bold text-center truncate w-full">{topFour[1].full_name || "Givethra Hero"}</p>
                        <p className="text-[10px] sm:text-xs font-bold text-teal-600 mt-0.5">Rs {Number(topFour[1].total_amount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place - Right */}
                  {topFour[2] && (
                    <div className="col-start-3 row-start-2 flex flex-col items-center mt-[-20px] sm:mt-[-30px]">
                      <div className="relative flex flex-col items-center p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-orange-50 to-card dark:from-orange-950/20 border border-orange-200/50 dark:border-orange-800/30 w-full shadow-sm">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full overflow-hidden ring-4 ring-orange-300/30">
                          {topFour[2].avatar_url ? <img src={topFour[2].avatar_url} alt={topFour[2].full_name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-orange-100 text-orange-700 font-black text-sm">{initials(topFour[2].full_name || "Hero")}</div>}
                        </div>
                        <p className="mt-2 text-[11px] sm:text-xs font-bold text-center truncate w-full">{topFour[2].full_name || "Givethra Hero"}</p>
                        <p className="text-[10px] sm:text-xs font-bold text-teal-600 mt-0.5">Rs {Number(topFour[2].total_amount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {/* 4th Place - Bottom Center */}
                  {topFour[3] && (
                    <div className="col-start-2 row-start-3 flex flex-col items-center mt-2">
                      <div className="relative flex flex-col items-center p-2 rounded-2xl bg-gradient-to-b from-purple-50 to-card dark:from-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 w-full shadow-sm">
                        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full overflow-hidden ring-2 ring-purple-300/30">
                          {topFour[3].avatar_url ? <img src={topFour[3].avatar_url} alt={topFour[3].full_name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-purple-100 text-purple-700 font-black text-xs">{initials(topFour[3].full_name || "Hero")}</div>}
                        </div>
                        <p className="mt-1.5 text-[10px] sm:text-xs font-bold text-center truncate w-full">{topFour[3].full_name || "Givethra Hero"}</p>
                        <p className="text-[10px] text-teal-600 font-bold">Rs {Number(topFour[3].total_amount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 📋 Rank 5 to 100 - Clean Scrollable List */}
              <div className="space-y-2">
                {remainingHeroes.map((hero, index) => {
                  const actualRank = index + 5; // Since we sliced off top 4
                  const badgeKey = getBadge(hero);
                  const badge = BADGES[badgeKey];
                  const BadgeIcon = badge.icon;
                  const name = hero.full_name || "Givethra Hero";
                  const badgeOpen = expandedBadge === hero.user_id;

                  return (
                    <div key={hero.user_id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 hover:border-primary/30 hover:shadow-sm transition-all">
                      
                      {/* Left Section: Rank, Avatar, Name */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex w-8 shrink-0 items-center justify-center">{rankIcon(actualRank)}</div>
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-1 ring-border">
                          {hero.avatar_url ? <img src={hero.avatar_url} alt={name} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full w-full items-center justify-center text-xs font-black text-primary">{initials(name)}</div>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground">{name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{Number(hero.cases_helped || 0)} cases helped</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section: Stats & Badge */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-11 sm:pl-0 border-t border-border pt-2 sm:border-0 sm:pt-0 mt-1 sm:mt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Amount</p>
                          <p className="text-xs sm:text-sm font-black text-teal-600">Rs {Number(hero.total_amount || 0).toLocaleString()}</p>
                        </div>
                        
                        <div className="relative">
                          <button type="button" onClick={() => setExpandedBadge(badgeOpen ? null : hero.user_id)} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${badge.className}`}>
                            <BadgeIcon className="h-3 w-3" /> {badge.label}
                          </button>
                          {badgeOpen && (
                            <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-48 rounded-xl border border-border bg-card p-3 text-[10px] leading-4 text-muted-foreground shadow-xl">
                              {badge.description}
                            </div>
                          )}
                        </div>
                        
                        <Link to="/profile/$id" params={{ id: hero.user_id }} className="hidden sm:inline-flex rounded-xl border border-primary/20 px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/10 transition-colors">
                          Profile
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 👤 Sticky Current User Rank (Always visible at bottom) */}
        <div className="sticky bottom-0 z-50 border-t border-primary/20 bg-background/95 backdrop-blur-md px-4 py-3 sm:px-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-muted-foreground w-8 text-center">#100</span>
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary to-teal-700 ring-2 ring-primary/30 flex items-center justify-center text-xs font-black text-white">
                ME
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Your Profile (Current User)</p>
                <p className="text-[10px] text-muted-foreground">Keep helping to climb the ranks!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-teal-600">Rs 0</p>
              <p className="text-[9px] text-muted-foreground">0 cases</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
