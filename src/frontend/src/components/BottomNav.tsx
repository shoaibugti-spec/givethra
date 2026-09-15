// src/frontend/src/components/BottomNav.tsx
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutList, User, Wallet, HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";
import { getCommunityPosts } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const LAST_SEEN_KEY = "givethra_my_help_posts_seen_at";

export default function BottomNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { isAuthenticated } = useAuth();
  const [homeMode, setHomeMode] = useState<"support" | "earning">(() => (localStorage.getItem("givethra_home_mode") === "earning" ? "earning" : "support"));
  useEffect(() => {
    const onModeChange = (event: Event) => setHomeMode((event as CustomEvent<"support" | "earning">).detail === "earning" ? "earning" : "support");
    window.addEventListener("givethra-home-panel-tab", onModeChange);
    return () => window.removeEventListener("givethra-home-panel-tab", onModeChange);
  }, []);
  // Guests can browse the public HomePage without account navigation. Once signed in,
  // keep the bottom navigation available on Home and throughout the app.
  if (!isAuthenticated) return null;
  if (["/sign-in", "/kyc", "/onboarding", "/onboarding-submit", "/become-hero"].includes(currentPath)) return null;

  const navItems = [
    { to: "/home", label: "Home", icon: Home, ocid: "bottom_nav.home" },
    { to: "/my-help", label: "My Help", icon: HeartHandshake, ocid: "bottom_nav.my_help" },
    { to: "/my-cases", label: "My Cases", icon: LayoutList, ocid: "bottom_nav.my_cases" },
    { to: "/wallet", label: "Wallet", icon: Wallet, ocid: "bottom_nav.wallet" },
    { to: "/profile/me", label: "Profile", icon: User, ocid: "bottom_nav.profile" },
  ];

  return (
    <nav aria-label="Bottom navigation" data-ocid="bottom_nav" className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex h-16 items-stretch">
        {navItems.map(({ to, label, icon: Icon, ocid }) => {
          const active = to === "/home" ? currentPath === "/" || currentPath === "/home" : currentPath === to || currentPath.startsWith(`${to}/`);
          return <Link key={to} to={to} data-ocid={ocid} aria-label={label} aria-current={active ? "page" : undefined} className={cn("relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}><div className={cn("flex h-8 w-8 items-center justify-center rounded-full", active && "bg-primary/10")}><Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.8} /></div><span className={cn("text-[10px] font-medium leading-none", active && "text-primary")}>{label}</span></Link>;
        })}
      </div>
    </nav>
  );
}
