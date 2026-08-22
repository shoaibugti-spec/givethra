import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell, Heart, Menu, Search, Shield, X, Facebook, Instagram,
  Linkedin, Mail, MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { getUnreadNotificationsCount } from "@/lib/api";

const ADMIN_EMAIL = "shoaibahmedbugti5@gmail.com";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590715263595";
const INSTAGRAM_URL = "https://www.instagram.com/givethra.community";
const LINKEDIN_URL = "https://www.linkedin.com/company/givethra-org/";

function NavLink({ to, children, onClick }) {
  const router = useRouterState();
  const isActive = router.location.pathname === to || router.location.pathname.startsWith(`${to}/`);
  return (
    <Link to={to} onClick={onClick} className={cn(
      "block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors",
      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}>
      {children}
    </Link>
  );
}

export default function Layout({ children }) {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const router = useRouterState(); // <-- router state لے رہے ہیں
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifCount, setNotifCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const isAdmin = user?.email === ADMIN_EMAIL;

  // --- نوٹیفکیشن کاؤنٹر ---
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const loadCounts = async () => {
      try {
        const nCount = await getUnreadNotificationsCount(user.id);
        setNotifCount(nCount ?? 0);
      } catch (e) {}
    };
    loadCounts();
    const interval = setInterval(loadCounts, 20000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // --- پوسٹ کاؤنٹر لوڈ کرنے کا فنکشن ---
  const fetchPostCount = async () => {
    if (!isAuthenticated) { setPostCount(0); return; }
    try {
      const res = await fetch("/api/community-posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPostCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (e) {}
  };

  // --- پوسٹ کاؤنٹر کو باقاعدگی سے اپ ڈیٹ کریں ---
  useEffect(() => {
    if (!isAuthenticated) { setPostCount(0); return; }
    fetchPostCount();
    const interval = setInterval(fetchPostCount, 30000);
    const handlePostUpdate = () => fetchPostCount();
    window.addEventListener("post-updated", handlePostUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("post-updated", handlePostUpdate);
    };
  }, [isAuthenticated]);

  // --- نیا: جب صارف /community روٹ پر جائے تو پوسٹس کو "پڑھا ہوا" مارک کریں ---
  useEffect(() => {
    if (!isAuthenticated) return;
    const currentPath = router.location.pathname;
    if (currentPath === "/community" || currentPath.startsWith("/community/")) {
      const markAsRead = async () => {
        try {
          await fetch("/api/community-posts/mark-read", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
              "Content-Type": "application/json",
            },
          });
          // مارک ریڈ کرنے کے بعد کاؤنٹر دوبارہ لوڈ کریں
          fetchPostCount();
        } catch (e) {
          console.error("Error marking community posts as read:", e);
        }
      };
      markAsRead();
    }
  }, [router.location.pathname, isAuthenticated]); // <-- جب بھی روٹ بدلے، چیک کریں

  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => { logout(); closeMenu(); navigate({ to: "/" }); };
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate({ to: "/cases" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={() => setMenuOpen(!menuOpen)}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center gap-1.5 shrink-0">
              <span className="font-display font-bold text-base md:text-lg text-primary">Givethra</span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto md:mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search verified cases..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/60 border-transparent focus:border-input focus:bg-background text-sm rounded-full w-full" />
            </div>
          </form>

          <div className="flex items-center gap-1 shrink-0">
            <LanguageSwitcher />
            <Link to="/community" className="relative h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
              <MessageSquare className="h-5 w-5" />
              {postCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {postCount > 99 ? "99+" : postCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <Link to="/notifications" className="relative h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                <Bell className="h-5 w-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link to="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</Link>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
            <NavLink to="/cases" onClick={closeMenu}>Browse Cases</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/my-cases" onClick={closeMenu}>My Cases</NavLink>
                <NavLink to="/submit-request" onClick={closeMenu}>Submit a Case</NavLink>
                <NavLink to="/support" onClick={closeMenu}>Help & Support</NavLink>
                <NavLink to="/community" onClick={closeMenu}>Community Posts</NavLink>
              </>
            )}
            {isAdmin && <NavLink to="/admin" onClick={closeMenu}>Admin Panel</NavLink>}
            <NavLink to="/about" onClick={closeMenu}>About</NavLink>
            <NavLink to="/faq" onClick={closeMenu}>FAQ</NavLink>
            <div className="pt-3 border-t border-border mt-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/profile/$id" params={{ id: "me" }} onClick={closeMenu}>
                    <Button variant="outline" size="sm" className="w-full"><Shield className="h-4 w-4 mr-2" /> Profile</Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="w-full" onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <>
                  <Link to="/sign-in" onClick={closeMenu}><Button variant="outline" size="sm" className="w-full">Sign in</Button></Link>
                  <Link to="/sign-up" onClick={closeMenu}><Button size="sm" className="w-full font-semibold">Get Started</Button></Link>
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
                <span className="font-display font-bold text-foreground">Givethra</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs">Verified Help. Real Impact.</p>
              <div className="flex items-center gap-3 pt-1">
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="mailto:info@givethra.org" className="h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white">
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
                <Link key={to} to={to} className="text-sm text-muted-foreground hover:text-foreground">{label}</Link>
              ))}
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground space-y-1">
            <p>&copy; {new Date().getFullYear()} Givethra. All rights reserved.</p>
            <p>Givethra is a humanitarian platform connecting verified people with verified help.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
