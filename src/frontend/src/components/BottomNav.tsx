// src/frontend/src/components/BottomNav.tsx
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, User, BarChart3, HeartHandshake, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { getCommunityPosts } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { rememberHelpMeReturnPath } from "@/lib/helpme";

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

  // Centre button: Premium Glowing Effect
  const helpMeButton = (
    <Link
      to="/helpme"
      data-ocid="bottom_nav.helpme"
      aria-label="Help Me"
      onClick={() => rememberHelpMeReturnPath(`${window.location.pathname}${window.location.search}${window.location.hash}`)}
      className="relative flex min-h-16 flex-1 touch-manipulation select-none flex-col items-center justify-end pb-1.5"
    >
      <span className="absolute -top-7 flex h-16 w-16 animate-[pulse_2.6s_ease-in-out_infinite] items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-[0_10px_25px_rgba(20,184,166,0.4)] ring-4 ring-white dark:ring-slate-950 transition-transform active:scale-95">
        <HandHeart className="h-8 w-8 drop-shadow" strokeWidth={2.2} />
      </span>
      <span className="text-[10px] font-black leading-none text-teal-700 dark:text-teal-400">Help Me</span>
    </Link>
  );

  // Guests: a plain glass strip with ONLY the centre Help Me button.
  if (!isAuthenticated) {
    return (
      <nav aria-label="Bottom navigation" data-ocid="bottom_nav" className="fixed inset-x-0 bottom-0 z-50 touch-manipulation border-t border-slate-200/60 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex min-h-16 items-stretch justify-center">{helpMeButton}</div>
      </nav>
    );
  }

  const leftItems = [
    { to: "/home", label: "Home", icon: Home, ocid: "bottom_nav.home" },
    { to: "/my-cases", label: "Cases", icon: HeartHandshake, ocid: "bottom_nav.cases_helps" },
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
            
    return (
      <Link 
        key={to} 
        to={to} 
        data-ocid={ocid} 
        aria-label={label} 
        aria-current={active ? "page" : undefined} 
        className={cn(
          "relative flex min-h-16 flex-1 touch-manipulation select-none flex-col items-center justify-center gap-1 transition-colors", 
          active ? "text-teal-700 dark:text-teal-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
        )}
      >
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300", 
          active ? "bg-teal-50 dark:bg-teal-900/40 scale-110" : "bg-transparent"
        )}>
          <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.8} />
        </div>
        <span className={cn("text-[10px] font-bold leading-none", active ? "text-teal-700 dark:text-teal-400" : "font-semibold")}>{label}</span>
      </Link>
    );
  };

  return (
    <nav 
      aria-label="Bottom navigation" 
      data-ocid="bottom_nav" 
      className="fixed inset-x-0 bottom-0 z-50 touch-manipulation bg-white/90 backdrop-blur-xl border-t border-slate-200/60 dark:bg-slate-950/90 dark:border-slate-800 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" 
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex min-h-16 items-stretch">
        {leftItems.map(renderItem)}
        {helpMeButton}
        {rightItems.map(renderItem)}
      </div>
    </nav>
  );
}
