// src/frontend/src/components/Layout.tsx
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  WalletCards,
  Heart,
  Menu,
  Moon,
  Shield,
  Sun,
  User,
  X,
  MessageCircle,
  Mail,
  Settings,
  Lock,
  KeyRound,
  HeartHandshake,
  LayoutList,
  BarChart3,
  Compass,
  Sparkles,
  LifeBuoy,
  Info,
  HelpCircle,
  LogOut,
  ChevronRight,
  FileText,
  Users,
  MapPin,
  Gift,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import {
  getUnreadNotificationsCount,
  getCommunityPosts,
} from "@/lib/api";
import RoleSwitcher from "@/components/RoleSwitcher";
import SocialLinks from "@/components/SocialLinks";
import { SiWhatsapp } from "react-icons/si";
import { loadHelpImpact, formatAmount, type HelpImpact } from "@/lib/helpStats";
import { rememberHelpMeReturnPath } from "@/lib/helpme";

const ADMIN_EMAIL = "shoaibahmedbugti5@gmail.com";
const WHATSAPP_SUPPORT_URL = "https://wa.me/message/42CJXLUYEI2KM1?src=qr";

export { NavLink };

function NavLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const router = useRouterState();
  const isActive =
    router.location.pathname === to ||
    router.location.pathname.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex w-full touch-manipulation select-none items-center gap-2.5 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-primary md:inline-flex md:w-auto md:gap-0 md:rounded-none md:px-0 md:py-0 md:hover:bg-transparent",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}

// ---------- Mobile drawer building blocks ----------
type DrawerIcon = React.ComponentType<{ className?: string }>;

function DrawerSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1.5 pt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </p>
  );
}

function DrawerRow({
  to,
  icon: Icon,
  label,
  hint,
  badge,
  active,
  external,
  onNavigate,
}: {
  to: string;
  icon: DrawerIcon;
  label: string;
  hint?: string;
  badge?: string | number | null;
  active?: boolean;
  external?: boolean;
  onNavigate: () => void;
}) {
  const className = cn(
    "flex min-h-[52px] touch-manipulation select-none items-center gap-3 rounded-xl px-2.5 py-2 text-[15px] font-semibold transition-colors active:bg-muted",
    active ? "bg-primary/10 text-primary" : "text-foreground"
  );
  const content = (
    <>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate leading-tight">{label}</span>
        {hint ? (
          <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </span>
      {badge ? (
        <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
          {badge}
        </span>
      ) : null}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
    </>
  );
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={className}
      >
        {content}
      </a>
    );
  }
  return (
    <Link to={to} onClick={onNavigate} className={className}>
      {content}
    </Link>
  );
}

function DrawerTile({
  to,
  icon: Icon,
  label,
  badge,
  active,
  onNavigate,
}: {
  to: string;
  icon: DrawerIcon;
  label: string;
  badge?: string | number | null;
  active?: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-[88px] touch-manipulation select-none flex-col justify-between rounded-2xl border p-3.5 transition active:scale-[.98]",
        active
          ? "border-primary/40 bg-primary/10"
          : "border-border bg-background"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="text-sm font-bold text-foreground">{label}</span>
      {badge ? (
        <span className="absolute right-3 top-3 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

type ImpactState = "idle" | "loading" | "ready" | "error";

function ImpactCard({ state, impact }: { state: ImpactState; impact: HelpImpact | null }) {
  const loading = !impact && state !== "error";
  const plural = (count: number) => (count === 1 ? "case" : "cases");
  const columns = [
    {
      key: "given",
      label: "You helped",
      icon: HeartHandshake,
      side: impact?.given ?? null,
      caption: (count: number) => `${count} ${plural(count)} helped`,
    },
    {
      key: "received",
      label: "You received",
      icon: Gift,
      side: impact?.received ?? null,
      caption: (count: number) => `from ${count} ${plural(count)}`,
    },
  ];
  const anyApprox = Boolean(impact?.given?.approx || impact?.received?.approx);

  return (
    <section
      aria-label="Your impact"
      className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-3.5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
          Your impact
        </p>
        {impact ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            <MapPin className="h-3 w-3" />
            {impact.country ? `${impact.country} \u00b7 ` : ""}
            {impact.currency}
          </span>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {columns.map(({ key, label, icon: Icon, side, caption }) => (
          <div key={key} className="min-w-0 rounded-xl bg-background/80 p-3 ring-1 ring-border">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="truncate text-xs font-semibold text-muted-foreground">{label}</span>
            </div>
            <div className="mt-2.5">
              {loading ? (
                <span className="block h-6 w-24 animate-pulse rounded bg-muted" />
              ) : side ? (
                <p className="flex items-baseline gap-1 truncate" title={side.approx ? "Approximate value in your local currency" : undefined}>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {side.approx ? "\u2248 " : ""}
                    {side.currency}
                  </span>
                  <span className="text-xl font-extrabold tabular-nums text-foreground">
                    {formatAmount(side.amount)}
                  </span>
                </p>
              ) : (
                <p className="text-xl font-extrabold text-muted-foreground">{"\u2014"}</p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">
                {loading ? "\u00a0" : side ? caption(side.cases) : "Unavailable right now"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {anyApprox ? (
        <p className="mt-2.5 text-[10px] leading-snug text-muted-foreground">
          Amounts in other currencies are converted to your local currency at today's approximate rate.
        </p>
      ) : null}
    </section>
  );
}

function getInitials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return letters || "G";
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

  const isAdmin = user?.email === ADMIN_EMAIL;
  const displayName = user?.fullName ?? "";
  const roleLabel =
    role === "hero" ? "Hero" : role === "requester" ? "Requester" : null;

  // "Your impact": loaded the first time the menu opens (and refreshed if the
  // numbers are more than a minute old) so normal pages make no extra requests.
  const [impact, setImpact] = useState<HelpImpact | null>(null);
  const [impactState, setImpactState] = useState<ImpactState>("idle");
  const impactLoadedAt = useRef(0);
  const userId = user?.id;

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
    loadHelpImpact(userId)
      .then((result) => {
        if (cancelled) return;
        impactLoadedAt.current = Date.now();
        setImpact(result);
        setImpactState("ready");
      })
      .catch(() => {
        if (!cancelled) setImpactState((current) => (current === "ready" ? current : "error"));
      });
    return () => {
      cancelled = true;
    };
  }, [menuOpen, isAuthenticated, userId]);

  // Close the mobile menu after any navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [router.location.pathname]);

  // While the menu is open: lock page scroll, close on Escape, and close if
  // the screen grows to desktop width (so scroll is never left locked).
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
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
      try {
        const nCount = await getUnreadNotificationsCount(user.id);
        setNotifCount(nCount ?? 0);
      } catch {}
    };
    loadCounts();
    const interval = setInterval(loadCounts, 20000);
    const handleNotificationUpdate = () => loadCounts();
    window.addEventListener("notification-updated", handleNotificationUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "notification-updated",
        handleNotificationUpdate
      );
    };
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
      } catch {
        if (!cancelled) setSupportPostCount(0);
      }
    };
    loadSupportPostCount();
    const timer = window.setInterval(loadSupportPostCount, 20000);
    const handleSupportPostsSeen = (event: Event) => {
      const newest = Number((event as CustomEvent<{ newest?: number }>).detail?.newest || Date.now());
      try {
        window.localStorage.setItem("givethra_my_help_posts_seen_at", String(newest));
      } catch {
        // Restricted browsers may block storage; the badge can still reset in memory.
      }
      setSupportPostCount(0);
    };
    window.addEventListener("givethra-support-posts-seen", handleSupportPostsSeen);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("givethra-support-posts-seen", handleSupportPostsSeen);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => {
    logout();
    closeMenu();
    navigate({ to: "/" });
  };
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const isRouteActive = (to: string) =>
    router.location.pathname === to ||
    router.location.pathname.startsWith(`${to}/`);

  const iconLinkClass = (to: string) =>
    cn(
      "relative h-10 w-10 flex items-center justify-center rounded-full transition-colors duration-200",
      isRouteActive(to)
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-4 h-16 flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden h-11 w-11 shrink-0 touch-manipulation flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link
            to={isAuthenticated ? "/home" : "/"}
            onClick={() => {
              if (!isAuthenticated) return;
              try {
                window.localStorage.setItem("givethra_home_mode", "support");
              } catch {
                // Restricted browsers should still be able to navigate home.
              }
              window.dispatchEvent(new CustomEvent("givethra-home-panel-tab", { detail: "support" }));
            }}
            aria-label="Givethra home"
            className="flex items-center gap-1.5 shrink-0"
          >
            <div className="hidden md:flex h-8 w-8 rounded-lg bg-primary items-center justify-center">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-primary">
              Givethra
            </span>
          </Link>

          <div className="min-w-0 flex-1 flex items-center justify-center overflow-visible">
            {isAuthenticated && <RoleSwitcher supportPostCount={supportPostCount} />}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* LanguageSwitcher (Urdu button) removed completely */}

            {isAuthenticated && (
              <>
                <Link
                  to="/notifications"
                  aria-label="Notifications"
                  aria-current={
                    isRouteActive("/notifications") ? "page" : undefined
                  }
                  className={iconLinkClass("/notifications")}
                >
                  <Bell className="h-5 w-5" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none flex items-center justify-center ring-2 ring-card">
                      {notifCount > 99 ? "99+" : notifCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/donation"
                  aria-label="Community contribution"
                  aria-current={isRouteActive("/donation") ? "page" : undefined}
                  className={iconLinkClass("/donation")}
                >
                  <WalletCards className="h-5 w-5" />
                </Link>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="hidden md:flex h-10 w-10 rounded-full items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
                <Link
                  to="/profile/$id"
                  params={{ id: "me" }}
                  aria-label="Profile"
                  aria-current={isRouteActive("/profile") ? "page" : undefined}
                  className="hidden md:flex h-10 items-center gap-2 px-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors overflow-hidden"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {displayName || "My Profile"}
                  </span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex ml-1"
                >
                  Logout
                </Button>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex items-center gap-1">
                <Link to="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/sign-up">
                  <Button size="sm" className="font-semibold">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:block border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 h-10 flex items-center gap-6">
            <NavLink to="/cases">Browse Cases</NavLink>
            <NavLink to="/dreams">Dreams</NavLink>
            <NavLink to="/helpme" onClick={() => rememberHelpMeReturnPath(`${window.location.pathname}${window.location.search}${window.location.hash}`)}>Help Me</NavLink>
            <NavLink to="/donation">Contribute</NavLink>
            {isAuthenticated && <NavLink to="/my-help">My Help</NavLink>}
            {isAuthenticated && <NavLink to="/my-cases">My Cases</NavLink>}
            {isAuthenticated && (
              <NavLink to="/support">Help & Support</NavLink>
            )}
            {isAdmin && <NavLink to="/admin">Admin</NavLink>}
            <NavLink to="/about">About</NavLink>
            <NavLink to="/faq">FAQ</NavLink>
          </div>
        </div>

      </header>

      {/* ===== MOBILE MENU (full-height drawer) =====
          Rendered outside <header> on purpose: the header is a sticky z-50
          stacking context, so a menu inside it would sit under the bottom nav
          and could never scroll. This drawer is fixed, scrollable and always
          shows the logout / sign-in buttons at the bottom. */}
      <div
        className={cn(
          "fixed inset-0 z-[100] md:hidden transition-[visibility] duration-300",
          menuOpen ? "visible" : "invisible"
        )}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={closeMenu}
          className={cn(
            "absolute inset-0 bg-slate-950/60 transition-opacity duration-300",
            menuOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[88%] max-w-[380px] flex-col bg-card shadow-2xl transition-transform duration-300 ease-out",
            menuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Header / identity */}
          <div
            className="relative shrink-0 overflow-hidden bg-gradient-to-br from-primary via-primary to-teal-700 px-5 pb-5 text-primary-foreground"
            style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-16 right-20 h-36 w-36 rounded-full bg-white/10" />
            <div className="relative flex items-center justify-between">
              <Link
                to={isAuthenticated ? "/home" : "/"}
                onClick={closeMenu}
                aria-label="Givethra home"
                className="flex items-center gap-2"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
                  <Heart className="h-[18px] w-[18px]" fill="currentColor" />
                </span>
                <span className="font-display text-xl font-bold tracking-tight">
                  Givethra
                </span>
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-full bg-white/15 transition active:bg-white/25"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isAuthenticated ? (
              <Link
                to="/profile/$id"
                params={{ id: "me" }}
                onClick={closeMenu}
                className="relative mt-5 flex items-center gap-3.5 rounded-2xl bg-white/10 p-3 ring-1 ring-white/20 transition active:bg-white/20"
              >
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/20 text-lg font-bold ring-2 ring-white/40">
                  {getInitials(displayName)}
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-bold leading-tight">
                    {displayName || "My Profile"}
                  </span>
                  {user?.email ? (
                    <span className="mt-0.5 block truncate text-xs text-white/75">
                      {user.email}
                    </span>
                  ) : null}
                  {roleLabel ? (
                    <span className="mt-1.5 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {roleLabel}
                    </span>
                  ) : null}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/70" />
              </Link>
            ) : (
              <p className="relative mt-4 max-w-[240px] text-sm leading-relaxed text-white/85">
                Verified help. Real impact. Join people helping people.
              </p>
            )}
          </div>

          {/* Scrollable links */}
          <nav
            aria-label="Mobile navigation"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4"
          >
            {isAuthenticated && <ImpactCard state={impactState} impact={impact} />}

            {/* Donation / community contribution */}
            <Link
              to="/donation"
              onClick={closeMenu}
              className="relative mt-4 block touch-manipulation select-none overflow-hidden rounded-2xl bg-gradient-to-br from-amber-300 via-amber-200 to-amber-100 p-4 text-amber-950 shadow-md ring-1 ring-amber-400/50 transition active:scale-[.99]"
            >
              <WalletCards className="pointer-events-none absolute -bottom-4 -right-3 h-28 w-28 text-amber-500/25" />
              <span className="relative flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-950 text-amber-200">
                  <Heart className="h-5 w-5" fill="currentColor" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-900/70">
                    Community contribution
                  </span>
                  <span className="block font-display text-base font-bold leading-tight">
                    Keep verified help moving
                  </span>
                </span>
              </span>
              <span className="relative mt-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-amber-900/80">
                  Give once or monthly
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-950 px-3.5 py-1.5 text-xs font-bold text-amber-100">
                  Contribute <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </span>
            </Link>

            {/* Quick access */}
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
            {isAdmin && (
              <DrawerRow to="/admin" icon={Shield} label="Admin Panel" active={isRouteActive("/admin")} onNavigate={closeMenu} />
            )}

            <DrawerSectionTitle>Help &amp; information</DrawerSectionTitle>
            {isAuthenticated && (
              <DrawerRow to="/support" icon={LifeBuoy} label="Help & Support" active={isRouteActive("/support")} onNavigate={closeMenu} />
            )}
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

          {/* Footer: always visible */}
          <div
            className="shrink-0 border-t border-border bg-card px-4 pt-3"
            style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" role="group" aria-label="Theme">
              <button
                type="button"
                onClick={() => setTheme("light")}
                aria-pressed={theme !== "dark"}
                className={cn(
                  "flex min-h-10 touch-manipulation items-center justify-center gap-2 rounded-lg text-sm font-semibold transition",
                  theme !== "dark" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
                )}
              >
                <Sun className="h-4 w-4" /> Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
                className={cn(
                  "flex min-h-10 touch-manipulation items-center justify-center gap-2 rounded-lg text-sm font-semibold transition",
                  theme === "dark" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
                )}
              >
                <Moon className="h-4 w-4" /> Dark
              </button>
            </div>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-bold text-red-700 transition active:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/sign-in"
                  onClick={closeMenu}
                  className="flex min-h-12 items-center justify-center rounded-xl border border-border text-sm font-bold text-foreground transition active:bg-muted"
                >
                  Sign in
                </Link>
                <Link
                  to="/sign-up"
                  onClick={closeMenu}
                  className="flex min-h-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition active:opacity-90"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      <main className="flex-1 has-bottom-nav">{children}</main>

      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                  <Heart className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-foreground">
                  Givethra
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs">
                Verified Help. Real Impact.
              </p>
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
                <Link
                  key={to}
                  to={to}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground space-y-1">
            <p>
              &copy; {new Date().getFullYear()} Givethra. All rights reserved.
            </p>
            <p>
              Givethra™ is a humanitarian platform connecting verified people
              with verified help.
            </p>
          </div>
        </div>
      </footer>
      <a
        href={WHATSAPP_SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="24/7 WhatsApp Support"
        className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg ring-4 ring-[#25D366]/20 transition hover:bg-[#1EBE5A] hover:shadow-xl md:bottom-6 md:right-6"
      >
        <SiWhatsapp className="h-5 w-5" />
        <span className="hidden sm:inline">24/7 WhatsApp Support</span>
        <span className="sm:hidden">Support</span>
      </a>
    </div>
  );
}
