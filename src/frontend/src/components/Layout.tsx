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
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Mail,
  Settings,
  Lock,
  KeyRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  getUnreadNotificationsCount,
  getCommunityPosts,
} from "@/lib/api";
import RoleSwitcher from "@/components/RoleSwitcher";

const ADMIN_EMAIL = "shoaibahmedbugti5@gmail.com";
const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61590715263595";
const INSTAGRAM_URL = "https://www.instagram.com/givethra.community";
const LINKEDIN_URL = "https://www.linkedin.com/company/givethra-org/";
const WHATSAPP_URL = "https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J";
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
        "flex w-full touch-manipulation select-none items-center gap-2 py-2.5 text-sm font-medium transition-colors hover:text-primary md:min-h-0 md:w-auto md:gap-0 md:py-0",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      {children}
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

  const isAdmin = user?.email === ADMIN_EMAIL;
  const displayName = user?.fullName ?? "";
  const isHomeRoute = router.location.pathname === "/" || router.location.pathname === "/home";

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
        const seen = Number(localStorage.getItem("givethra_my_help_posts_seen_at") || 0);
        if (!cancelled) setSupportPostCount(seen ? posts.filter((post: any) => new Date(post?.created_at || 0).getTime() > seen).length : 0);
        if (!seen && newest) localStorage.setItem("givethra_my_help_posts_seen_at", String(newest));
      } catch {
        if (!cancelled) setSupportPostCount(0);
      }
    };
    loadSupportPostCount();
    const timer = window.setInterval(loadSupportPostCount, 20000);
    const handleSupportPostsSeen = (event: Event) => {
      const newest = Number((event as CustomEvent<{ newest?: number }>).detail?.newest || Date.now());
      localStorage.setItem("givethra_my_help_posts_seen_at", String(newest));
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
            className="md:hidden h-11 w-11 shrink-0 touch-manipulation flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link
            to={isAuthenticated ? "/home" : "/"}
            onClick={() => {
              if (!isAuthenticated) return;
              localStorage.setItem("givethra_home_mode", "support");
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

        {/* ===== MOBILE MENU ===== */}
        {menuOpen && (
          <div className="md:hidden relative z-10 border-t border-border bg-card px-4 py-2 touch-manipulation">
            <NavLink to="/cases" onClick={closeMenu}>
              Browse Cases
            </NavLink>
            <NavLink to="/dreams" onClick={closeMenu}>Dreams</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/my-help" onClick={closeMenu}>My Help</NavLink>
                <NavLink to="/my-cases" onClick={closeMenu}>My Cases</NavLink>
                <NavLink to="/support" onClick={closeMenu}>Help & Support</NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/admin" onClick={closeMenu}>Admin Panel</NavLink>
            )}
            <NavLink to="/about" onClick={closeMenu}>About</NavLink>
            <NavLink to="/faq" onClick={closeMenu}>FAQ</NavLink>

            {isAuthenticated && (
              <>
                <div className="pt-3 mt-2 border-t border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Account
                  </p>
                </div>
                <NavLink to="/settings" onClick={closeMenu}>
                  <Settings className="h-4 w-4 shrink-0" />
                  Settings
                </NavLink>
                <NavLink to="/privacy" onClick={closeMenu}>
                  <Lock className="h-4 w-4 shrink-0" />
                  Privacy Policy
                </NavLink>
                <NavLink to="/security" onClick={closeMenu}>
                  <Shield className="h-4 w-4 shrink-0" />
                  Security
                </NavLink>
                <NavLink to="/account-privacy" onClick={closeMenu}>
                  <KeyRound className="h-4 w-4 shrink-0" />
                  Account Privacy
                </NavLink>
              </>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  closeMenu();
                }}
                className="flex w-full touch-manipulation items-center gap-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" /> Dark Mode
                  </>
                )}
              </button>
            </div>
            <div className="pt-3 border-t border-border mt-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile/$id"
                    params={{ id: "me" }}
                    onClick={closeMenu}
                    className="block"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Shield className="h-4 w-4 mr-2" /> Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/sign-in" onClick={closeMenu} className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/sign-up" onClick={closeMenu} className="block">
                    <Button size="sm" className="w-full font-semibold">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

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
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="mailto:info@givethra.org"
                  aria-label="Email"
                  className="h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Channel"
                  className="h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
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
      {!isHomeRoute && (
        <a
          href={WHATSAPP_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="24/7 WhatsApp Support"
          className={`fixed ${isAuthenticated ? "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]" : "bottom-5"} right-4 z-50 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-lg ring-4 ring-green-600/15 transition hover:bg-green-700 hover:shadow-xl md:bottom-6 md:right-6`}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">24/7 WhatsApp Support</span>
          <span className="sm:hidden">Support</span>
        </a>
      )}
    </div>
  );
}
