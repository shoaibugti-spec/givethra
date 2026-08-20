// src/frontend/src/components/Layout.tsx
// Replaces Supabase with Cloudflare Worker APIs

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
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
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Mail,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  getUnreadNotificationsCount,
  getUnreadChatMessagesCount,
} from "@/lib/api";

const ADMIN_EMAIL = "shoaibahmedbugti5@gmail.com";
const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61590715263595";
const INSTAGRAM_URL = "https://www.instagram.com/givethra.community";
const LINKEDIN_URL = "https://www.linkedin.com/company/givethra-org/";

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
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifCount, setNotifCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const displayName = user?.fullName ?? "";

  // Load counts on mount and when user changes
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const loadCounts = async () => {
      try {
        const [nCount, cCount] = await Promise.all([
          getUnreadNotificationsCount(user.id),
          getUnreadChatMessagesCount(user.id),
        ]);
        setNotifCount(nCount ?? 0);
        setChatCount(cCount ?? 0);
      } catch (e) {
        // ignore
      }
    };

    loadCounts();

    // Poll every 20 seconds
    const interval = setInterval(loadCounts, 20000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => {
    logout();
    closeMenu();
    navigate({ to: "/" });
  };
  const toggleTheme = () =>
    setTheme(theme === "dark" ? "light" : "dark");
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate({ to: "/cases" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center gap-2 md:gap-4">
          <Link to="/" className="flex items-center gap-1.5 shrink-0">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base md:text-lg text-foreground hidden sm:block">
              Givethra
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto md:mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search verified cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/60 border-transparent focus:border-input focus:bg-background text-sm rounded-full"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 shrink-0">
            <LanguageSwitcher />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
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
                <Link
                  to="/support"
                  aria-label="Help & Support"
                  className="relative h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                >
                  <MessageCircle className="h-5 w-5" />
                  {chatCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {chatCount > 9 ? "9+" : chatCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/notifications"
                  aria-label="Notifications"
                  className="relative h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                >
                  <Bell className="h-5 w-5" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile/$id"
                  params={{ id: "me" }}
                  aria-label="Profile"
                  className="h-9 flex items-center gap-2 px-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-smooth overflow-hidden"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline text-sm font-medium max-w-[120px] truncate">
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
            ) : (
              <>
                <Link to="/sign-in" className="hidden md:block">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/sign-up" className="hidden md:block">
                  <Button size="sm" className="font-semibold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-smooth"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="hidden md:block border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 h-10 flex items-center gap-6">
            <NavLink to="/cases">Browse Cases</NavLink>
            {isAuthenticated && <NavLink to="/my-cases">My Cases</NavLink>}
            {isAuthenticated && <NavLink to="/submit-request">Submit a Case</NavLink>}
            {isAuthenticated && <NavLink to="/support">Help & Support</NavLink>}
            {isAdmin && <NavLink to="/admin">Admin</NavLink>}
            <NavLink to="/about">About</NavLink>
            <NavLink to="/faq">FAQ</NavLink>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-1">
            <NavLink to="/cases" onClick={closeMenu}>
              Browse Cases
            </NavLink>
            {isAuthenticated && (
              <div className="py-1">
                <NavLink to="/my-cases" onClick={closeMenu}>
                  My Cases
                </NavLink>
              </div>
            )}
            {isAuthenticated && (
              <div className="py-1">
                <NavLink to="/submit-request" onClick={closeMenu}>
                  Submit a Case
                </NavLink>
              </div>
            )}
            {isAuthenticated && (
              <div className="py-1">
                <NavLink to="/support" onClick={closeMenu}>
                  Help & Support
                </NavLink>
              </div>
            )}
            {isAdmin && (
              <div className="py-1">
                <NavLink to="/admin" onClick={closeMenu}>
                  Admin Panel
                </NavLink>
              </div>
            )}
            <div className="py-1">
              <NavLink to="/about" onClick={closeMenu}>
                About
              </NavLink>
            </div>
            <div className="py-1">
              <NavLink to="/faq" onClick={closeMenu}>
                FAQ
              </NavLink>
            </div>
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
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/sign-in" onClick={closeMenu}>
                    <Button variant="outline" size="sm" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/sign-up" onClick={closeMenu}>
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
                  aria-label="Facebook"
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
            <p>&copy; {new Date().getFullYear()} Givethra. All rights reserved.</p>
            <p>
              Givethra™ is a humanitarian platform connecting verified people
              with verified help.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
