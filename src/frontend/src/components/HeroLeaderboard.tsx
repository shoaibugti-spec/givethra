// src/components/HeroLeaderboard.tsx
// Complete premium leaderboard with global currency conversion.

import { useEffect, useMemo, useState } from "react";
import { Award, Crown, Sparkles, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getHeroLeaderboard, getProfile } from "@/lib/api";
import { handleImageError, resolveMediaUrl } from "@/lib/media";
import { useAuth } from "@/contexts/AuthContext";
import { getCountryProfile, CURRENCY_SYMBOLS, scaleFromPKR } from "@/lib/countryProfiles";
import { motion, AnimatePresence } from "framer-motion";

type LeaderboardHero = {
  user_id: string;
  full_name?: string;
  avatar_url?: string | null;
  cases_helped?: number | string;
  total_amount?: number | string;
  direct_help_count?: number | string;
  contribution_count?: number | string;
};

type BadgeKey = "all" | "super" | "hero" | "young" | "new";

const BADGES: Record<Exclude<BadgeKey, "all">, { label: string; icon: typeof Crown; className: string }> = {
  super: { label: "Super Hero", icon: Crown, className: "bg-amber-500/20 text-amber-400 ring-amber-500/30" },
  hero: { label: "Hero", icon: Award, className: "bg-cyan-500/20 text-cyan-400 ring-cyan-500/30" },
  young: { label: "Young Hero", icon: Sparkles, className: "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30" },
  new: { label: "Newborn Hero", icon: Sparkles, className: "bg-purple-500/20 text-purple-400 ring-purple-500/30" },
};

function getBadge(hero: LeaderboardHero): Exclude<BadgeKey, "all"> {
  const directHelp = Number(hero.direct_help_count || 0);
  const contributions = Number(hero.contribution_count || 0);
  if ((contributions >= 3 && directHelp >= 3) || directHelp + contributions >= 10) return "super";
  if (directHelp > 0) return "hero";
  if (contributions > 0) return "young";
  return "new";
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "GH";
}

export default function HeroLeaderboard() {
  const { user } = useAuth();
  const [heroes, setHeroes] = useState<LeaderboardHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'region' | 'internal' | 'global'>('region');
  const [userCurrency, setUserCurrency] = useState<string>("USD");

  useEffect(() => {
    if (user?.id) {
      getProfile(user.id).then((profile) => {
        const profileData = getCountryProfile(profile?.country || "");
        setUserCurrency(profileData.currency || "USD");
      }).catch(() => setUserCurrency("USD"));
    }
  }, [user?.id]);

  function money(amountInPKR: number) {
    if (userCurrency === "PKR") return `Rs ${Number(amountInPKR || 0).toLocaleString()}`;
    const converted = scaleFromPKR(Number(amountInPKR || 0), userCurrency);
    const symbol = CURRENCY_SYMBOLS[userCurrency] ?? userCurrency;
    return `${symbol} ${converted.toLocaleString()}`;
  }

  useEffect(() => {
    let cancelled = false;
    getHeroLeaderboard(100)
      .then((rows) => { if (!cancelled) setHeroes(rows); })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Hero rankings are temporarily unavailable."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const visibleHeroes = useMemo(() => {
    return [...heroes].sort((a, b) => {
      const aValue = Number(a.cases_helped || 0);
      const bValue = Number(b.cases_helped || 0);
      if (aValue !== bValue) return bValue - aValue;
      return Number(b.cases_helped || 0) - Number(a.cases_helped || 0);
    });
  }, [heroes]);

  const topFour = visibleHeroes.slice(0, 4);
  const remainingHeroes = visibleHeroes.slice(4);

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-6 text-white sm:py-10">
      <div className="mx-auto w-full max-w-4xl px-3 sm:px-4">

        {/* Header */}
        <div className="mb-6 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 ring-1 ring-amber-400/30">
            <Trophy className="h-3.5 w-3.5" /> Hall of Fame
          </motion.div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-3 font-display text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-teal-200 sm:text-4xl">
            Givethra Heroes
          </motion.h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-400">The legends changing lives, one case at a time. Amounts shown in <strong>{userCurrency}</strong>.</p>
        </div>

        {/* Region Tabs */}
        <div className="mx-auto mb-6 max-w-md px-2">
          <div className="flex rounded-2xl border border-slate-700/50 bg-slate-800/60 p-1 backdrop-blur-md">
            {(['region', 'internal', 'global'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 rounded-xl py-2 text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                {activeTab === tab && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 shadow-lg" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <span className="relative">{tab === 'region' ? 'Region' : tab === 'internal' ? 'Internal' : 'Global'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="grid gap-3 px-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-800/50" />)}</div>
        )}

        {!loading && error && <div className="rounded-2xl border border-red-800/50 bg-red-900/20 p-6 text-center text-sm font-medium text-red-300">{error}</div>}
        {!loading && !error && !visibleHeroes.length && <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 text-center text-sm font-medium text-slate-400">Verified Hero rankings will appear here.</div>}

        {!loading && !error && visibleHeroes.length > 0 && (
          <div className="space-y-6">

            {/* PODIUM */}
            <div className="relative pb-4 pt-6 px-1 sm:px-4">
              <div className="grid grid-cols-3 gap-1 sm:gap-4 max-w-2xl mx-auto items-end">
                
                {/* 2nd Place */}
                {topFour[1] && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
                    <Link to="/profile/$id" params={{ id: topFour[1].user_id }} className="group flex flex-col items-center w-full">
                      <span className="mb-1 text-xs font-black text-cyan-400">2nd</span>
                      <div className="relative">
                        <div className="h-14 w-14 overflow-hidden rounded-full ring-4 ring-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                          {topFour[1].avatar_url ? <img src={resolveMediaUrl(topFour[1].avatar_url)} alt={topFour[1].full_name} onError={handleImageError} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-cyan-900/50 text-sm font-black text-cyan-400">{initials(topFour[1].full_name || "Hero")}</div>}
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-slate-950 shadow-md">2</div>
                      </div>
                      <p className="mt-2 w-full truncate text-center text-xs font-black text-white">{topFour[1].full_name || "Hero"}</p>
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black ring-1 ${BADGES[getBadge(topFour[1])].className}`}>
                        {(() => { const Icon = BADGES[getBadge(topFour[1])].icon; return <Icon className="h-2.5 w-2.5" />; })()}
                        {BADGES[getBadge(topFour[1])].label}
                      </span>
                      <p className="mt-1 text-[10px] font-bold text-slate-400">{topFour[1].cases_helped || 0} Helps</p>
                      <p className="text-[10px] font-black text-teal-400">{money(Number(topFour[1].total_amount || 0))}</p>
                    </Link>
                  </motion.div>
                )}

                {/* 1st Place */}
                {topFour[0] && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                    <Link to="/profile/$id" params={{ id: topFour[0].user_id }} className="group flex flex-col items-center w-full">
                      <span className="mb-1 text-xl drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">👑</span>
                      <span className="mb-1 text-xs font-black text-amber-400">1st</span>
                      <div className="relative">
                        <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-transform group-hover:scale-110 sm:h-28 sm:w-28">
                          {topFour[0].avatar_url ? <img src={resolveMediaUrl(topFour[0].avatar_url)} alt={topFour[0].full_name} onError={handleImageError} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-amber-900/50 text-lg font-black text-amber-400">{initials(topFour[0].full_name || "Hero")}</div>}
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-slate-950 shadow-lg">1</div>
                      </div>
                      <p className="mt-2 w-full truncate text-center text-sm font-black text-white sm:text-base">{topFour[0].full_name || "Hero"}</p>
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black ring-1 ${BADGES[getBadge(topFour[0])].className}`}>
                        {(() => { const Icon = BADGES[getBadge(topFour[0])].icon; return <Icon className="h-3 w-3" />; })()}
                        {BADGES[getBadge(topFour[0])].label}
                      </span>
                      <p className="mt-1 text-[11px] font-bold text-slate-300">{topFour[0].cases_helped || 0} Helps</p>
                      <p className="text-[11px] font-black text-teal-400">{money(Number(topFour[0].total_amount || 0))}</p>
                    </Link>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {topFour[2] && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
                    <Link to="/profile/$id" params={{ id: topFour[2].user_id }} className="group flex flex-col items-center w-full">
                      <span className="mb-1 text-xs font-black text-emerald-400">3rd</span>
                      <div className="relative">
                        <div className="h-14 w-14 overflow-hidden rounded-full ring-4 ring-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                          {topFour[2].avatar_url ? <img src={resolveMediaUrl(topFour[2].avatar_url)} alt={topFour[2].full_name} onError={handleImageError} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-emerald-900/50 text-sm font-black text-emerald-400">{initials(topFour[2].full_name || "Hero")}</div>}
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 shadow-md">3</div>
                      </div>
                      <p className="mt-2 w-full truncate text-center text-xs font-black text-white">{topFour[2].full_name || "Hero"}</p>
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black ring-1 ${BADGES[getBadge(topFour[2])].className}`}>
                        {(() => { const Icon = BADGES[getBadge(topFour[2])].icon; return <Icon className="h-2.5 w-2.5" />; })()}
                        {BADGES[getBadge(topFour[2])].label}
                      </span>
                      <p className="mt-1 text-[10px] font-bold text-slate-400">{topFour[2].cases_helped || 0} Helps</p>
                      <p className="text-[10px] font-black text-teal-400">{money(Number(topFour[2].total_amount || 0))}</p>
                    </Link>
                  </motion.div>
                )}

                {/* 4th Place */}
                {topFour[3] && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="col-start-2 col-end-3 row-start-2 flex flex-col items-center mt-2">
                    <Link to="/profile/$id" params={{ id: topFour[3].user_id }} className="group flex flex-col items-center w-full">
                      <span className="mb-1 text-[10px] font-black text-purple-400">4th</span>
                      <div className="relative">
                        <div className="h-12 w-12 overflow-hidden rounded-full ring-4 ring-purple-400/50 shadow-[0_0_15px_rgba(192,132,252,0.4)] transition-transform group-hover:scale-110 sm:h-16 sm:w-16">
                          {topFour[3].avatar_url ? <img src={resolveMediaUrl(topFour[3].avatar_url)} alt={topFour[3].full_name} onError={handleImageError} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-purple-900/50 text-xs font-black text-purple-400">{initials(topFour[3].full_name || "Hero")}</div>}
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[9px] font-black text-slate-950 shadow-md">4</div>
                      </div>
                      <p className="mt-2 w-full truncate text-center text-[11px] font-black text-white">{topFour[3].full_name || "Hero"}</p>
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black ring-1 ${BADGES[getBadge(topFour[3])].className}`}>
                        {(() => { const Icon = BADGES[getBadge(topFour[3])].icon; return <Icon className="h-2.5 w-2.5" />; })()}
                        {BADGES[getBadge(topFour[3])].label}
                      </span>
                      <p className="mt-1 text-[10px] font-bold text-slate-400">{topFour[3].cases_helped || 0} Helps</p>
                      <p className="text-[10px] font-black text-teal-400">{money(Number(topFour[3].total_amount || 0))}</p>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>

            {/* LIST */}
            <div className="space-y-2">
              {remainingHeroes.map((hero, index) => {
                const actualRank = index + 5;
                const name = hero.full_name || "Givethra Hero";
                return (
                  <motion.div
                    key={hero.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                    className="flex flex-col gap-2 rounded-2xl border border-slate-700/40 bg-slate-800/40 p-3 backdrop-blur-sm transition hover:border-teal-500/40 hover:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex w-8 shrink-0 items-center justify-center text-sm font-black text-slate-500">#{actualRank}</div>
                      <Link to="/profile/$id" params={{ id: hero.user_id }} className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-700 block">
                        {hero.avatar_url ? <img src={resolveMediaUrl(hero.avatar_url)} alt={name} onError={handleImageError} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full w-full items-center justify-center bg-slate-700 text-xs font-black text-slate-300">{initials(name)}</div>}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to="/profile/$id" params={{ id: hero.user_id }} className="block truncate text-sm font-black text-white hover:text-teal-400">{name}</Link>
                        <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${BADGES[getBadge(hero)].className}`}>
                          {(() => { const Icon = BADGES[getBadge(hero)].icon; return <Icon className="h-2.5 w-2.5" />; })()}
                          {BADGES[getBadge(hero)].label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pl-11 sm:pl-0">
                      <div className="text-right"><p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Helps</p><p className="text-sm font-bold text-slate-200">{hero.cases_helped || 0}</p></div>
                      <div className="min-w-[80px] text-right"><p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Amount</p><p className="text-sm font-black text-teal-400">{money(Number(hero.total_amount || 0))}</p></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
