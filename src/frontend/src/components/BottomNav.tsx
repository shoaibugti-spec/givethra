// src/frontend/src/components/BottomNav.tsx
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, User, BarChart3, HeartHandshake, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { getCommunityPosts } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const LAST_SEEN_KEY = "givethra_my_help_posts_seen_at";

export default function BottomNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { isAuthenticated } = useAuth();
  const [homeMode, setHomeMode] = useState<"support" | "earning">(() => {
    if (typeof window === "undefined") return "support";
    try {
      return window.localStorage.getItem("givethra_home_mode") === "earning" ? "earning" : "support";
    } catch {
      return "support";
    }
  });
  useEffect(() => {
    const onModeChange = (event: Event) => setHomeMode((event as CustomEvent<"support" | "earning">).detail === "earning" ? "earning" : "support");
    window.addEventListener("givethra-home-panel-tab", onModeChange);
    return () => window.removeEventListener("givethra-home-panel-tab", onModeChange);
  }, []);
  if (["/sign-in", "/kyc", "/onboarding", "/onboarding-submit", "/become-hero"].includes(currentPath)) return null;
  // Help Me is a full-screen immersive experience: no bottom navigation on /helpme and its sub-pages.
  if (currentPath === "/helpme" || currentPath.startsWith("/helpme/")) return null;

  // Centre button: theme colour, filled, round, a little bigger and softly pulsing so people notice and press it.
  const helpMeButton = (
    <Link
      to="/helpme"
      data-ocid="bottom_nav.helpme"
      aria-label="Help Me"
      className="relative flex min-h-16 flex-1 touch-manipulation select-none flex-col items-center justify-end pb-1.5"
    >
      <span className="absolute -top-7 flex h-16 w-16 animate-[pulse_2.6s_ease-in-out_infinite] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-card transition-transform active:scale-95">
        <HandHeart className="h-8 w-8" strokeWidth={2.2} />
      </span>
      <span className="text-[10px] font-bold leading-none text-primary">Help Me</span>
    </Link>
  );

  // Guests: a plain white strip with ONLY the centre Help Me button (all other navigation is hidden).
  if (!isAuthenticated) {
    return (
      <nav aria-label="Bottom navigation" data-ocid="bottom_nav" className="fixed inset-x-0 bottom-0 z-50 touch-manipulation border-t border-border bg-card md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex min-h-16 items-stretch justify-center">{helpMeButton}</div>
      </nav>
    );
  }

  // Home, Cases/Helps (one button: /my-cases holds both My Cases and My Help), Help Me, Walls, Profile.
  const leftItems = [
    { to: "/home", label: "Home", icon: Home, ocid: "bottom_nav.home" },
    { to: "/my-cases", label: "Cases/Helps", icon: HeartHandshake, ocid: "bottom_nav.cases_helps" },
  ];
  const rightItems = [
    { to: "/walls", label: "Walls", icon: BarChart3, ocid: "bottom_nav.walls" },
    { to: "/profile/me", label: "Profile", icon: User, ocid: "bottom_nav.profile" },
  ];

  const renderItem = ({ to, label, icon: Icon, ocid }: (typeof leftItems)[number]) => {
    const active =
      to === "/home"
        ? currentPath === "/" || currentPath === "/home"
        : to === "/my-cases"
          ? currentPath === "/my-cases" || currentPath.startsWith("/my-cases/") || currentPath === "/my-help" || currentPath.startsWith("/my-help/")
          : to === "/walls"
            ? ["/walls", "/heroes-wall", "/kindness-wall"].includes(currentPath)
            : currentPath === to || currentPath.startsWith(`${to}/`);
    return <Link key={to} to={to} data-ocid={ocid} aria-label={label} aria-current={active ? "page" : undefined} className={cn("relative flex min-h-16 flex-1 touch-manipulation select-none flex-col items-center justify-center gap-0.5 transition-colors", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}><div className={cn("flex h-8 w-8 items-center justify-center rounded-full", active && "bg-primary/10")}><Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.8} /></div><span className={cn("text-[10px] font-medium leading-none", active && "text-primary")}>{label}</span></Link>;
  };

  return (
    <nav aria-label="Bottom navigation" data-ocid="bottom_nav" className="fixed inset-x-0 bottom-0 z-50 touch-manipulation bg-card border-t border-border md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex min-h-16 items-stretch">
        {leftItems.map(renderItem)}
        {helpMeButton}
        {rightItems.map(renderItem)}
      </div>
    </nav>
  );
}
