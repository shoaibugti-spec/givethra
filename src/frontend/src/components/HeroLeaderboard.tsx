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
    className: "bg-amber-500/20 text-amber-400 ring-amber-500/30",
  },
  hero: {
    label: "Hero",
    description: "5 or more verified cases, or at least Rs 100,000 in verified help.",
    icon: Trophy,
    className: "bg-cyan-500/20 text-cyan-400 ring-cyan-500/30",
  },
  young: {
    label: "Young Hero",
    description: "2 or more verified cases, or at least Rs 25,000 in verified help.",
    icon: Sparkles,
    className: "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30",
  },
  new: {
    label: "New Hero",
    description: "A verified Hero who has started making an impact in the community.",
    icon: Award,
    className: "bg-purple-500/20 text-purple-400 ring-purple-500/30",
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

export default function HeroLeaderboard() {
  const [heroes, setHeroes] = useState<LeaderboardHero[]>([]);
  const [filter, setFilter] = useState<BadgeKey>("all");
  const [sortKey, setSortKey] = useState<SortKey>("cases");
  const [ascending, setAscending] = useState(false);
  const [expandedBadge, setExpandedBadge] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // نیا اسٹیٹ ریجن، انٹرنل، گلوبل کے لیے
  const [activeTab, setActiveTab] = useState<'region' | 'internal' | 'global'>('region');

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
    <section className="bg-[#0B121F] text-white min-h-screen flex justify-center py-6 sm:py-10 px-0 sm:px-4">
      <div className="w-full max-w-4xl flex flex-col bg-[#0B121F]">
        
        {/* Header Section */}
        <div className="text-center px-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-sm">
            Givethra Heroes
          </h1>
        </div>

        {/* 🔥 نیا ٹیب سیکشن (ریجن، انٹرنل، گلوبل) - ایکٹو ٹیب کا رنگ تبدیل ہو گا */}
        <div className="px-4 sm:px-6 mb-6">
          <div className="flex bg-[#151F32] p-1 rounded-xl border border-slate-800/60 max-w-md mx-auto">
            {(['region', 'internal', 'global'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'region' ? 'Region' : tab === 'internal' ? 'Internal' : 'Global'}
              </button>
            ))}
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="px-4 sm:px-6 mb-4 flex justify-end gap-3 max-w-4xl w-full mx-auto">
          <button type="button" onClick={() => setSortKey("cases")} className={`text-xs font-bold transition-colors ${sortKey === "cases" ? "text-teal-400" : "text-gray-500 hover:text-gray-300"}`}>Most cases</button>
          <button type="button" onClick={() => setSortKey("amount")} className={`text-xs font-bold transition-colors ${sortKey === "amount" ? "text-teal-400" : "text-gray-500 hover:text-gray-300"}`}>Highest amount</button>
          <button type="button" onClick={() => setAscending((value) => !value)} className="text-gray-400 hover:text-white transition-colors">
            {ascending ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full max-w-4xl mx-auto">
          {loading && (
            <div className="grid gap-3 px-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-800/50" />)}</div>
          )}
          
          {!loading && error && <div className="rounded-2xl bg-slate-800/50 p-6 text-center text-sm text-gray-400 mx-4">{error}</div>}
          
          {!loading && !error && !visibleHeroes.length && <div className="rounded-2xl bg-slate-800/50 p-6 text-center text-sm text-gray-400 mx-4">Verified Hero rankings will appear here after approved help is confirmed.</div>}
          
          {!loading && !error && visibleHeroes.length > 0 && (
            <div className="space-y-6">
              
              {/* 🏆 ڈائمنڈ پوڈیم (1st, 2nd, 3rd, 4th سرکل کے اوپر) */}
              <div className="relative pt-6 pb-4 px-2 sm:px-6">
                <div className="grid grid-cols-3 gap-1 sm:gap-4 max-w-2xl mx-auto">
                  
                  {/* 1st Place - Center Top */}
                  {topFour[0] && (
                    <div className="col-start-2 flex flex-col items-center z-20">
                      <Link to="/profile/$id" params={{ id: topFour[0].user_id }} className="flex flex-col items-center group w-full">
                        <span className="text-amber-400 font-bold text-xs mb-1 drop-shadow-md">1st</span>
                        <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full overflow-hidden ring-4 ring-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.3)] group-hover:scale-105 transition-transform">
                          {topFour[0].avatar_url ? <img src={topFour[0].avatar_url} alt={topFour[0].full_name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-amber-900/50 text-amber-400 font-black text-lg">{initials(topFour[0].full_name || "Hero")}</div>}
                        </div>
                        <p className="mt-2 text-xs sm:text-sm font-black text-center truncate w-full text-white">{topFour[0].full_name || "Givethra Hero"}</p>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-300 mt-1">{topFour[0].cases_helped || 0} Cases helped</p>
                        <p className="text-[10px] sm:text-xs font-black text-teal-400 mt-0.5">Rs {Number(topFour[0].total_amount || 0).toLocaleString()}</p>
                      </Link>
                    </div>
                  )}

                  {/* 2nd Place - Left */}
                  {topFour[1] && (
                    <div className="col-start-1 row-start-2 flex flex-col items-center mt-[-10px] sm:mt-[-20px] z-10">
                      <Link to="/profile/$id" params={{ id: topFour[1].user_id }} className="flex flex-col items-center group w-full">
                        <span className="text-cyan-400 font-bold text-xs mb-1 drop-shadow-md">2nd</span>
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full overflow-hidden ring-4 ring-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:scale-105 transition-transform">
                          {topFour[1].avatar_url ? <img src={topFour[1].avatar_url} alt={topFour[1].full_name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-cyan-900/50 text-cyan-400 font-black text-sm">{initials(topFour[1].full_name || "Hero")}</div>}
                        </div>
                        <p className="mt-2 text-[10px] sm:text-xs font-black text-center truncate w-full text-white">{topFour[1].full_name || "Givethra Hero"}</p>
                        <p className="text-[9px] sm:text-xs font-bold text-gray-300 mt-1">{topFour[1].cases_helped || 0} Cases</p>
                        <p className="text-[9px] sm:text-xs font-black text-teal-400 mt-0.5">Rs {Number(topFour[1].total_amount || 0).toLocaleString()}</p>
                      </Link>
                    </div>
                  )}

                  {/* 3rd Place - Right */}
                  {topFour[2] && (
                    <div className="col-start-3 row-start-2 flex flex-col items-center mt-[-10px] sm:mt-[-20px] z-10">
                      <Link to="/profile/$id" params={{ id: topFour[2].user_id }} className="flex flex-col items-center group w-full">
                        <span className="text-emerald-400 font-bold text-xs mb-1 drop-shadow-md">3rd</span>
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full overflow-hidden ring-4 ring-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.3)] group-hover:scale-105 transition-transform">
                          {topFour[2].avatar_url ? <img src={topFour[2].avatar_url} alt={topFour[2].full_name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-emerald-900/50 text-emerald-400 font-black text-sm">{initials(topFour[2].full_name || "Hero")}</div>}
                        </div>
                        <p className="mt-2 text-[10px] sm:text-xs font-black text-center truncate w-full text-white">{topFour[2].full_name || "Givethra Hero"}</p>
                        <p className="text-[9px] sm:text-xs font-bold text-gray-300 mt-1">{topFour[2].cases_helped || 0} Cases</p>
                        <p className="text-[9px] sm:text-xs font-black text-teal-400 mt-0.5">Rs {Number(topFour[2].total_amount || 0).toLocaleString()}</p>
                      </Link>
                    </div>
                  )}

                  {/* 4th Place - Bottom Center */}
                  {topFour[3] && (
                    <div className="col-start-2 row-start-3 flex flex-col items-center mt-[-10px] sm:mt-[-15px] z-0">
                      <Link to="/profile/$id" params={{ id: topFour[3].user_id }} className="flex flex-col items-center group w-full">
                        <span className="text-purple-400 font-bold text-xs mb-1 drop-shadow-md">4th</span>
                        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full overflow-hidden ring-4 ring-purple-400/50 shadow-[0_0_15px_rgba(192,132,252,0.3)] group-hover:scale-105 transition-transform">
                          {topFour[3].avatar_url ? <img src={topFour[3].avatar_url} alt={topFour[3].full_name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-purple-900/50 text-purple-400 font-black text-xs">{initials(topFour[3].full_name || "Hero")}</div>}
                        </div>
                        <p className="mt-2 text-[10px] sm:text-xs font-black text-center truncate w-full text-white">{topFour[3].full_name || "Givethra Hero"}</p>
                        <p className="text-[9px] sm:text-xs font-bold text-gray-300 mt-1">{topFour[3].cases_helped || 0} Case</p>
                        <p className="text-[9px] sm:text-xs font-black text-teal-400 mt-0.5">Rs {Number(topFour[3].total_amount || 0).toLocaleString()}</p>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* 📋 Rank 5 to 100 - Clean Dark Mode List */}
              <div className="mt-4 border-t border-slate-800/80">
                {remainingHeroes.map((hero, index) => {
                  const actualRank = index + 5;
                  const name = hero.full_name || "Givethra Hero";
                  const rowBg = actualRank % 2 === 0 ? "bg-[#111929]" : "bg-[#0B121F]";

                  return (
                    <div key={hero.user_id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 border-b border-slate-800/50 transition-colors hover:bg-slate-800/30 ${rowBg}`}>
                      
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex w-8 shrink-0 items-center justify-center text-sm font-black text-gray-400">
                          {actualRank}
                        </div>
                        <Link to="/profile/$id" params={{ id: hero.user_id }} className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-700 block">
                          {hero.avatar_url ? <img src={hero.avatar_url} alt={name} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full w-full items-center justify-center bg-slate-800 text-xs font-black text-gray-300">{initials(name)}</div>}
                        </Link>
                        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <Link to="/profile/$id" params={{ id: hero.user_id }} className="truncate text-sm font-bold text-white hover:text-teal-400 transition-colors">{name}</Link>
                          <span className={`inline-flex w-max items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${BADGES[getBadge(hero)].className}`}>
                            {BADGES[getBadge(hero)].label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 pl-11 sm:pl-0 border-t border-slate-800/50 sm:border-0 pt-2 sm:pt-0 mt-1 sm:mt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Help</p>
                          <p className="text-xs font-bold text-gray-300">{hero.cases_helped || 0} Helps</p>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Amount</p>
                          <p className="text-xs sm:text-sm font-black text-teal-400">Rs {Number(hero.total_amount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
