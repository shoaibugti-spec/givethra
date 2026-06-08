import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useBackendActor } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Heart,
  Menu,
  Moon,
  Search,
  Shield,
  Sun,
  User,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground",
      )}
      data-ocid={`nav.link.${to.replace(/\//g, "").replace(/-/g, "_") || "home"}`}
    >
      {children}
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const {
    isAuthenticated,
    isHero,
    isHelpSeeker,
    isAdmin,
    logout,
    isInitializing,
  } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { actor } = useBackendActor();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!actor || !isAuthenticated) return;
    actor
      .getUnreadNotificationCount()
      .then((c) => setNotifCount(Number(c)))
      .catch(() => setNotifCount(0));
  }, [actor, isAuthenticated]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate({ to: "/" });
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/cases" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center gap-2 md:gap-4">
          {/* Logo — always visible */}
          <Link
            to="/"
            className="flex items-center gap-1.5 shrink-0"
            data-ocid="nav.logo_link"
          >
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base md:text-lg text-foreground hidden sm:block">
              Givethra
            </span>
          </Link>

          {/* Search bar — center, grows to fill space */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-xl mx-auto md:mx-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search verified cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-ocid="nav.search_input"
                className="pl-9 h-9 bg-muted/60 border-transparent focus:border-input focus:bg-background text-sm rounded-full"
              />
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Theme toggle — desktop only */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              data-ocid="nav.theme_toggle"
              className="hidden md:flex h-9 w-9 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <Link
                  to="/notifications"
                  aria-label="Notifications"
                  data-ocid="nav.notifications_button"
                  className="relative h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                >
                  <Bell className="h-5 w-5" />
                  {notifCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground leading-none">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </Link>

                {/* Profile avatar */}
                <Link
                  to="/profile/$id"
                  params={{ id: "me" }}
                  aria-label="Profile"
                  data-ocid="nav.profile_avatar"
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-smooth overflow-hidden"
                >
                  <User className="h-5 w-5" />
                </Link>

                {/* Logout — desktop only */}
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="nav.logout_button"
                  onClick={handleLogout}
                  className="hidden md:flex ml-1"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/sign-in" className="hidden md:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    data-ocid="nav.signin_button"
                    disabled={isInitializing}
                  >
                    Sign in
                  </Button>
                </Link>
                <Link to="/sign-up" className="hidden md:block">
                  <Button
                    size="sm"
                    data-ocid="nav.signup_button"
                    disabled={isInitializing}
                    className="font-semibold"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              data-ocid="nav.hamburger_button"
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-smooth"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop nav strip */}
        <div className="hidden md:block border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 h-10 flex items-center gap-6">
            <NavLink to="/cases">Browse Cases</NavLink>
            {isHelpSeeker && <NavLink to="/my-requests">My Requests</NavLink>}
            {isHero && <NavLink to="/submit-request">Submit a Case</NavLink>}
            {isAdmin && <NavLink to="/admin">Admin</NavLink>}
            <NavLink to="/about">About</NavLink>
          </div>
        </div>

        {/* Mobile sidebar menu */}
        {menuOpen && (
          <div
            data-ocid="nav.mobile_menu"
            className="md:hidden border-t border-border bg-card px-4 py-4 space-y-1"
          >
            <NavLink to="/cases" onClick={closeMenu}>
              Browse Cases
            </NavLink>
            {isHelpSeeker && (
              <div className="py-1">
                <NavLink to="/my-requests" onClick={closeMenu}>
                  My Requests
                </NavLink>
              </div>
            )}
            {isHero && (
              <div className="py-1">
                <NavLink to="/submit-request" onClick={closeMenu}>
                  Submit a Case
                </NavLink>
              </div>
            )}
            {isAdmin && (
              <div className="py-1">
                <NavLink to="/admin" onClick={closeMenu}>
                  Admin
                </NavLink>
              </div>
            )}
            <div className="py-1">
              <NavLink to="/about" onClick={closeMenu}>
                About
              </NavLink>
            </div>

            {/* Theme toggle inside mobile menu */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  closeMenu();
                }}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground py-1 transition-colors"
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
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={handleLogout}
                    data-ocid="nav.mobile_logout_button"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/sign-in" onClick={closeMenu}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-ocid="nav.mobile_signin_button"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/sign-up" onClick={closeMenu}>
                    <Button
                      size="sm"
                      className="w-full font-semibold"
                      data-ocid="nav.mobile_signup_button"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content — pb-20 on mobile to clear fixed bottom nav */}
      <main className="flex-1 has-bottom-nav">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Brand */}
            <div className="space-y-2">
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
            </div>

            {/* Links */}
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { to: "/about", label: "About" },
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms" },
                { to: "/community-guidelines", label: "Community Guidelines" },
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

          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
