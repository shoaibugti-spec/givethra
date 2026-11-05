// src/frontend/src/components/Layout.tsx
// Premium Layout with KYC Badge in Drawer Menu profile card.

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell, WalletCards, Heart, Moon, Shield, Sun, User, X, MessageCircle, Mail,
  Settings, Lock, KeyRound, HeartHandshake, LayoutList, BarChart3, Compass,
  Sparkles, LifeBuoy, Info, HelpCircle, LogOut, ChevronRight, ChevronDown,
  FileText, Users, MapPin, Gift, BadgeCheck, Clock, AlertTriangle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import {
  getUnreadNotificationsCount,
  getCommunityPosts,
  getKycStatus,
} from "@/lib/api";
import RoleSwitcher from "@/components/RoleSwitcher";
import SocialLinks from "@/components/SocialLinks";
import { loadHelpImpact, formatAmount, type HelpImpact } from "@/lib/helpStats";
import { rememberHelpMeReturnPath } from "@/lib/helpme";

const ADMIN_EMAIL = "shoaibahmedbugti5@gmail.com";
const WHATSAPP_SUPPORT_URL = "https://wa.me/message/42CJXLUYEI2KM1?src=qr";

export { NavLink };

function NavLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void; }) {
  const router = useRouterState();
  const isActive = router.location.pathname === to || router.location.pathname.startsWith(`${to}/`);
  return (
    <Link to={to} onClick={onClick} className={cn(
      "flex w-full touch-manipulation select-none items-center gap-2.5 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-primary md:inline-flex md:w-auto md:gap-0 md:rounded-none md:px-0 md:py-0 md:hover:bg-transparent",
      isActive ? "text-teal-700 font-bold dark:text-teal-400" : "text-slate-500"
    )}>
      {children}
    </Link>
  );
}

type DrawerIcon = React.ComponentType<{ className?: string }>;

function DrawerSectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="px-3 pb-1.5 pt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{children}</p>;
}

function DrawerRow({ to, icon: Icon, label, hint, badge, active, external, onNavigate }: any) {
  const className = cn(
    "flex min-h-[52px] touch-manipulation select-none items-center gap-3 rounded-xl px-2.5 py-2 text-[15px] font-semibold transition-colors active:bg-muted",
    active ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
  );
  const content = (
    <>
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", active ? "bg-teal-600 text-white shadow-md" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate leading-tight">{label}</span>
        {hint ? <span className="mt-0.5 block truncate text-xs font-normal text-slate-400">{hint}</span> : null}
      </span>
      {badge ? <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm">{badge}</span> : null}
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </>
  );
  if (external) return <a href={to} target="_blank" rel="noopener noreferrer" onClick={onNavigate} className={className}>{content}</a>;
  return <Link to={to} onClick={onNavigate} className={className}>{content}</Link>;
}

function DrawerTile({ to, icon: Icon, label, badge, active, onNavigate }: any) {
  return (
    <Link to={to} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn(
      "relative flex min-h-[88px] touch-manipulation select-none flex-col justify-between rounded-2xl border p-3.5 transition active:scale-[.98]",
      active ? "border-teal-500/40 bg-teal-50 dark:bg-teal-900/20" : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
    )}>
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", active ? "bg-teal-600 text-white shadow-md" : "bg-teal-50 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400")}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="text-sm font-bold text-slate-900 dark:text-white">{label}</span>
      {badge ? <span className="absolute right-3 top-3 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white shadow-sm">{badge}</span> : null}
    </Link>
  );
}

type ImpactState = "idle" | "loading" | "ready" | "error";

function ImpactCard({ state, impact }: { state: ImpactState; impact: HelpImpact | null }) {
  const loading = !impact && state !== "error";
  const plural = (count: number) => (count === 1 ? "case" : "cases");
  const columns = [
    { key: "given", label: "You helped", icon: HeartHandshake, side: impact?.given ?? null, caption: (count: number) => `${count} ${plural(count)} helped` },
    { key: "received", label: "You received", icon: Gift, side: impact?.received ?? null, caption: (count: number) => `from ${count} ${plural(count)}` },
  ];
  const anyApprox = Boolean(impact?.given?.approx || impact?.received?.approx);
  return (
    <section aria-label="Your impact" className="relative mt-4 overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-white p-3.5 shadow-sm dark:border-teal-900/30 dark:from-teal-950/20 dark:via-slate-900 dark:to-slate-900">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-500">Your impact</p>
        {impact ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
            <MapPin className="h-3 w-3" />{impact.country ? `${impact.country} \u00b7 ` : ""}{impact.currency}
          </span>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {columns.map(({ key, label, icon: Icon, side, caption }) => (
          <div key={key} className="min-w-0 rounded-xl bg-white p-3 ring-1 ring-slate-100 dark:bg-slate-950 dark:ring-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"><Icon className="h-4 w-4" /></span>
              <span className="truncate text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
            </div>
            <div className="mt-2.5">
              {loading ? <span className="block h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                : side ? (
                  <p className="flex items-baseline gap-1 truncate">
                    <span className="text-[11px] font-bold text-slate-500">{side.approx ? "\u2248 " : ""}{side.currency}</span>
                    <span className="text-xl font-extrabold tabular-nums text-slate-900 dark:text-white">{formatAmount(side.amount)}</span>
                  </p>
                ) : <p className="text-xl font-extrabold text-slate-400">{"\u2014"}</p>}
              <p className="mt-1 text-[11px] text-slate-500">{loading ? "\u00a0" : side ? caption(side.cases) : "Unavailable right now"}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getInitials(name: string): string {
  const letters = name.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).join("").toUpperCase().slice(0, 2);
  return letters || "G";
}

// ⭐ KYC Badge Component — Shows Verified / Pending / Unverified
function KycBadge({ status }: { status: string }) {
  const normalized = String(status || "none").toLowerCase();
  if (normalized === "approved") {
    return (
      <Link
        to="/kyc"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white ring-1 ring-white/40 backdrop-blur-sm transition hover:bg-white/35"
      >
        <BadgeCheck className="h-3 w-3" fill="currentColor" />
        Verified
      </Link>
    );
  }
  if (normalized === "pending") {
    return (
      <Link
        to="/kyc"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 rounded-full bg-amber-400/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-100 ring-1 ring-amber-300/50 backdrop-blur-sm transition hover:bg-amber-400/40"
      >
        <Clock className="h-3 w-3" />
        Pending
      </Link>
    );
  }
  return (
    <Link
      to="/kyc"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-full bg-red-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-100 ring-1 ring-red-300/50 backdrop-blur-sm transition hover:bg-red-500/40"
    >
      <AlertTriangle className="h-3 w-3" />
      Unverified
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const router = useRouterState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [supportPostCount, setSupportPostCount] = useState(0);
  const [kycStatus, setKycStatus] = useState<string>("none");

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const displayName = user?.fullName ?? "";
  const roleLabel = role === "hero" ? "Hero" : role === "requester" ? "Requester" : null;

  const [impact, setImpact] = useState<HelpImpact | null>(null);
  const [impactState, setImpactState] = useState<ImpactState>("idle");
  const impactLoadedAt = useRef(0);
  const userId = user?.id;

  // ⭐ Load KYC status when user authenticates
  useEffect(() => {
    if (!isAuthenticated || !userId) { setKycStatus("none"); return; }
    let cancelled = false;
    getKycStatus(userId).then((kyc) => {
      if (!cancelled) setKycStatus(String(kyc?.status || "none").toLowerCase());
    }).catch(() => { if (!cancelled) setKycStatus("none"); });
    return () => { cancelled = true; };
  }, [isAuthenticated, userId, menuOpen]); // Reload when menu opens (fresh status)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) setIsVisible(false);
      else setIsVisible(true);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setImpact(null);
    setImpactState("idle");
    impactLoadedAt.current = 0;
  }, [userId]);

  useEffect(() => {
    if (!menuOpen || !isAuthenticated || !userId) return;
    if (Date.now() - impactLoadedAt.current < 60000) return;
    let cancelled = false;
    setImpactState((current) => (current === "ready" ? current : "loading"));
    loadHelpImpact(userId).then((result) => {
      if (cancelled) return;
      impactLoadedAt.current = Date.now();
      setImpact(result);
      setImpactState("ready");
    }).catch(() => {
      if (!cancelled) setImpactState((current) => (current === "ready" ? current : "error"));
    });
    return () => { cancelled = true; };
  }, [menuOpen, isAuthenticated, userId]);

  useEffect(() => { setMenuOpen(false); }, [router.location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const loadCounts = async () => {
      try { const nCount = await getUnreadNotificationsCount(user.id); setNotifCount(nCount ?? 0); } catch {}
    };
    loadCounts();
    const interval = setInterval(loadCounts, 20000);
    const handleNotificationUpdate = () => loadCounts();
    window.addEventListener("notification-updated", handleNotificationUpdate);
    return () => { clearInterval(interval); window.removeEventListener("notification-updated", handleNotificationUpdate); };
  }, [isAuthenticated, user]);

  useEffect(() => {
    let cancelled = false;
    const loadSupportPostCount = async () => {
      try {
        const latest = await getCommunityPosts("latest");
        const posts = Array.isArray(latest) ? latest : [];
        const newest = posts.reduce((max: number, post: any) => Math.max(max, new Date(post?.created_at || 0).getTime()), 0);
        let seen = 0;
        try { seen = Number(window.localStorage.getItem("givethra_my_help_posts_seen_at") || 0); } catch {}
        if (!cancelled) setSupportPostCount(seen ? posts.filter((post: any) => new Date(post?.created_at || 0).getTime() > seen).length : 0);
        if (!seen && newest) { try { window.localStorage.setItem("givethra_my_help_posts_seen_at", String(newest)); } catch {} }
      } catch { if (!cancelled) setSupportPostCount(0); }
    };
    loadSupportPostCount();
    const timer = window.setInterval(loadSupportPostCount, 20000);
    const handleSupportPostsSeen = (event: Event) => {
      const newest = Number((event as CustomEvent<{ newest?: number }>).detail?.newest || Date.now());
      try { window.localStorage.setItem("givethra_my_help_posts_seen_at", String(newest)); } catch {}
      setSupportPostCount(0);
    };
    window.addEventListener("givethra-support-posts-seen", handleSupportPostsSeen);
    return () => { cancelled = true; window.clearInterval(timer); window.removeEventListener("givethra-support-posts-seen", handleSupportPostsSeen); };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => { logout(); closeMenu(); navigate({ to: "/" }); };
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const isRouteActive = (to: string) => router.location.pathname === to || router.location.pathname.startsWith(`${to}/`);

  const iconLinkClass = (to: string) => cn(
    "relative h-10 w-10 flex items-center justify-center rounded-full transition-all duration-200",
    isRouteActive(to)
      ? "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400"
      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* HEADER */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out bg-white/85 backdrop-blur-xl border-b border-slate-200/60 dark:bg-slate-950/85 dark:border-slate-800 shadow-sm",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-4 h-16 flex items-center gap-2 md:gap-4">
          <div className="flex items-center shrink-0">
            <button type="button" onClick={() => setMenuOpen(true)} className="md:hidden flex items-center gap-1 active:opacity-70 transition-opacity">
              <span className="font-display font-black text-2xl tracking-tight bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">Givethra</span>
              <ChevronDown className="h-4 w-4 text-teal-700 font-bold" strokeWidth={3} />
            </button>
            <Link to={isAuthenticated ? "/home" : "/"} onClick={() => {
              if (!isAuthenticated) return;
              try { window.localStorage.setItem("givethra_home_mode", "support"); } catch {}
              window.dispatchEvent(new CustomEvent("givethra-home-panel-tab", { detail: "support" }));
            }} aria-label="Givethra home" className="hidden md:flex items-center shrink-0 group">
              <span className="font-display font-black text-2xl tracking-tight bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">Givethra</span>
            </Link>
          </div>

          <div className="min-w-0 flex-1 flex items-center justify-center overflow-visible">
            {isAuthenticated && <RoleSwitcher supportPostCount={supportPostCount} />}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isAuthenticated && (
              <>
                <Link to="/notifications" aria-label="Notifications" className={iconLinkClass("/notifications")}>
                  <Bell className="h-5 w-5" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none flex items-center justify-center ring-2 ring-white">
                      {notifCount > 99 ? "99+" : notifCount}
                    </span>
                  )}
                </Link>
                <Link to="/donation" aria-label="Community contribution" className={iconLinkClass("/donation")}>
                  <WalletCards className="h-5 w-5" />
                </Link>
                <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="hidden md:flex h-10 w-10 rounded-full items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <Link to="/profile/$id" params={{ id: "me" }} aria-label="Profile" className="hidden md:flex h-10 items-center gap-2 px-2 pr-4 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors overflow-hidden ml-1">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">{getInitials(displayName)}</div>
                  <span className="text-sm font-bold text-slate-700 max-w-[100px] truncate">{displayName.split(' ')[0] || "Profile"}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex ml-1 text-red-600 hover:text-red-700 hover:bg-red-50 font-bold">Logout</Button>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <Link to="/sign-in"><Button variant="ghost" size="sm" className="font-bold">Sign in</Button></Link>
                <Link to="/sign-up"><Button size="sm" className="font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 shadow-md hover:from-yellow-500 hover:to-amber-600">Join Free</Button></Link>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:block border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 h-11 flex items-center gap-7 text-sm font-semibold">
            <NavLink to="/cases">Browse Cases</NavLink>
            <NavLink to="/dreams">Dreams</NavLink>
            <NavLink to="/helpme" onClick={() => rememberHelpMeReturnPath(`${window.location.pathname}${window.location.search}${window.location.hash}`)}>Help Me</NavLink>
            <NavLink to="/donation">Contribute</NavLink>
            {isAuthenticated && <NavLink to="/my-help">My Help</NavLink>}
            {isAuthenticated && <NavLink to="/my-cases">My Cases</NavLink>}
            {isAuthenticated && <NavLink to="/support">Help & Support</NavLink>}
            {isAdmin && <NavLink to="/admin">Admin</NavLink>}
            <NavLink to="/about">About</NavLink>
            <NavLink to="/faq">FAQ</NavLink>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={cn("fixed inset-0 z-[100] md:hidden transition-[visibility] duration-300", menuOpen ? "visible" : "invisible")} aria-hidden={!menuOpen}>
        <div onClick={closeMenu} className={cn("absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300", menuOpen ? "opacity-100" : "opacity-0")} />
        <aside id="mobile-menu" role="dialog" aria-modal="true" aria-label="Main menu" className={cn(
          "absolute inset-y-0 left-0 flex w-[88%] max-w-[380px] flex-col bg-slate-50 shadow-2xl transition-transform duration-300 ease-out",
          menuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Identity Header */}
          <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 px-5 pb-5 text-white" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-16 right-20 h-36 w-36 rounded-full bg-white/10" />
            <div className="relative flex items-center justify-between">
              <Link to={isAuthenticated ? "/home" : "/"} onClick={closeMenu} aria-label="Givethra home" className="flex items-center gap-2">
                <span className="font-display text-2xl font-black tracking-tight">Givethra</span>
              </Link>
              <button type="button" onClick={closeMenu} aria-label="Close menu" className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-full bg-white/15 transition active:bg-white/25">
                <X className="h-5 w-5" />
              </button>
            </div>

            {isAuthenticated ? (
              <Link to="/profile/$id" params={{ id: "me" }} onClick={closeMenu} className="relative mt-5 flex items-center gap-3.5 rounded-2xl bg-white/10 p-3 ring-1 ring-white/20 transition active:bg-white/20">
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/20 text-lg font-bold ring-2 ring-white/40">
                  {getInitials(displayName)}
                  {user?.photo ? (
                    <img src={user.photo} alt="" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.style.display = "none"; }} className="absolute inset-0 h-full w-full object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-bold leading-tight">{displayName || "My Profile"}</span>
                  {user?.email ? <span className="mt-0.5 block truncate text-xs text-white/75">{user.email}</span> : null}
                  {roleLabel ? <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">{roleLabel}</span> : null}
                  {/* ⭐ KYC BADGE — Verified / Pending / Unverified */}
                  <div className="mt-1.5">
                    <KycBadge status={kycStatus} />
                  </div>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/70" />
              </Link>
            ) : (
              <p className="relative mt-4 max-w-[240px] text-sm leading-relaxed text-white/85">Verified help. Real impact. Join people helping people.</p>
            )}
          </div>

          {/* Scrollable links */}
          <nav aria-label="Mobile navigation" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
            {isAuthenticated && <ImpactCard state={impactState} impact={impact} />}

            <Link to="/donation" onClick={closeMenu} className="relative mt-4 block touch-manipulation select-none overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 p-4 text-amber-950 shadow-md ring-1 ring-amber-300 transition active:scale-[.99]">
              <WalletCards className="pointer-events-none absolute -bottom-4 -right-3 h-28 w-28 text-amber-900/20" />
              <span className="relative flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-950 text-amber-300 shadow-inner"><Heart className="h-5 w-5" fill="currentColor" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-amber-900/70">Community contribution</span>
                  <span className="block font-display text-base font-bold leading-tight">Keep verified help moving</span>
                </span>
              </span>
              <span className="relative mt-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-amber-900/80">Give once or monthly</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-950 px-3.5 py-1.5 text-xs font-bold text-amber-100 shadow-sm">Contribute <ChevronRight className="h-3.5 w-3.5" /></span>
              </span>
            </Link>

            {isAuthenticated && (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <DrawerTile to="/my-help" icon={HeartHandshake} label="My Help" active={isRouteActive("/my-help")} onNavigate={closeMenu} />
                <DrawerTile to="/my-cases" icon={LayoutList} label="My Cases" active={isRouteActive("/my-cases")} onNavigate={closeMenu} />
                <DrawerTile to="/walls" icon={BarChart3} label="Walls" active={isRouteActive("/walls")} onNavigate={closeMenu} />
                <DrawerTile to="/notifications" icon={Bell} label="Notifications" badge={notifCount > 0 ? (notifCount > 99 ? "99+" : notifCount) : null} active={isRouteActive("/notifications")} onNavigate={closeMenu} />
              </div>
            )}

            <DrawerSectionTitle>Explore</DrawerSectionTitle>
            <DrawerRow to="/cases" icon={Compass} label="Browse Cases" hint="Verified people who need help" active={isRouteActive("/cases")} onNavigate={closeMenu} />
            <DrawerRow to="/dreams" icon={Sparkles} label="Dreams" hint="Shop dreams, support dreams" active={isRouteActive("/dreams")} onNavigate={closeMenu} />
            {isAdmin && <DrawerRow to="/admin" icon={Shield} label="Admin Panel" active={isRouteActive("/admin")} onNavigate={closeMenu} />}

            <DrawerSectionTitle>Help &amp; information</DrawerSectionTitle>
            {isAuthenticated && <DrawerRow to="/support" icon={LifeBuoy} label="Help & Support" active={isRouteActive("/support")} onNavigate={closeMenu} />}
            <DrawerRow to={WHATSAPP_SUPPORT_URL} external icon={MessageCircle} label="24/7 WhatsApp Support" hint="Chat with our team" onNavigate={closeMenu} />
            <DrawerRow to="/about" icon={Info} label="About Givethra" active={isRouteActive("/about")} onNavigate={closeMenu} />
            <DrawerRow to="/faq" icon={HelpCircle} label="FAQ" active={isRouteActive("/faq")} onNavigate={closeMenu} />
            <DrawerRow to="/contact" icon={Mail} label="Contact Us" active={isRouteActive("/contact")} onNavigate={closeMenu} />

            {isAuthenticated && (
              <>
                <DrawerSectionTitle>Account</DrawerSectionTitle>
                <DrawerRow to="/settings" icon={Settings} label="Settings" active={isRouteActive("/settings")} onNavigate={closeMenu} />
                <DrawerRow to="/security" icon={Shield} label="Security" active={isRouteActive("/security")} onNavigate={closeMenu} />
                <DrawerRow to="/account-privacy" icon={KeyRound} label="Account Privacy" active={isRouteActive("/account-privacy")} onNavigate={closeMenu} />
              </>
            )}

            <DrawerSectionTitle>Legal</DrawerSectionTitle>
            <DrawerRow to="/privacy" icon={Lock} label="Privacy Policy" active={isRouteActive("/privacy")} onNavigate={closeMenu} />
            <DrawerRow to="/terms" icon={FileText} label="Terms" active={isRouteActive("/terms")} onNavigate={closeMenu} />
            <DrawerRow to="/community-guidelines" icon={Users} label="Community Guidelines" active={isRouteActive("/community-guidelines")} onNavigate={closeMenu} />
          </nav>

          {/* Footer */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 pt-3" style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}>
            <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Theme">
              <button type="button" onClick={() => setTheme("light")} aria-pressed={theme !== "dark"} className={cn("flex min-h-10 touch-manipulation items-center justify-center gap-2 rounded-lg text-sm font-semibold transition", theme !== "dark" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500")}>
                <Sun className="h-4 w-4" /> Light
              </button>
              <button type="button" onClick={() => setTheme("dark")} aria-pressed={theme === "dark"} className={cn("flex min-h-10 touch-manipulation items-center justify-center gap-2 rounded-lg text-sm font-semibold transition", theme === "dark" ? "bg-slate-800 text-teal-400 shadow-sm" : "text-slate-500")}>
                <Moon className="h-4 w-4" /> Dark
              </button>
            </div>

            {isAuthenticated ? (
              <button type="button" onClick={handleLogout} className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-red-50 text-sm font-bold text-red-600 transition active:bg-red-100">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link to="/sign-in" onClick={closeMenu} className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition active:bg-slate-50">Sign in</Link>
                <Link to="/sign-up" onClick={closeMenu} className="flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-sm font-bold text-white shadow-md transition active:opacity-90">Get Started</Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      <main className="flex-1 has-bottom-nav pt-16 md:pt-[108px]">{children}</main>

      <footer className="bg-white border-t border-slate-200 dark:bg-slate-950 dark:border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl text-slate-900 dark:text-white">Givethra</span>
              </div>
              <p className="text-sm font-medium text-slate-500 max-w-xs">Verified Help. Real Impact.</p>
              <SocialLinks className="pt-1" />
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { to: "/about", label: "About" },
                { to: "/faq", label: "FAQ" },
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms" },
                { to: "/community-guidelines", label: "Community Guidelines" },
                { to: "/contact", label: "Contact Us" },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors">{label}</Link>
              ))}
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-medium text-slate-400 space-y-1">
            <p>&copy; {new Date().getFullYear()} Givethra. All rights reserved.</p>
            <p>Givethra™ is a humanitarian platform connecting verified people with verified help.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
