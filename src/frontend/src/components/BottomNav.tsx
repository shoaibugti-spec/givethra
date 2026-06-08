import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Briefcase, Home, MessageCircle, PlusCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, ocid: "bottom_nav.home" },
  {
    to: "/cases",
    label: "Browse Cases",
    icon: Briefcase,
    ocid: "bottom_nav.cases",
  },
  {
    to: "/submit-request",
    label: "Submit",
    icon: PlusCircle,
    ocid: "bottom_nav.submit",
    isPrimary: true,
  },
  {
    to: "/messages",
    label: "Messages",
    icon: MessageCircle,
    ocid: "bottom_nav.messages",
  },
  {
    to: "/profile/me",
    label: "Profile",
    icon: User,
    ocid: "bottom_nav.profile",
  },
];

/**
 * BottomNav — pure presentational component.
 * No auth/store dependencies. Always renders all 5 nav items.
 * Active state is derived solely from the current URL path.
 */
export default function BottomNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav
      aria-label="Bottom navigation"
      data-ocid="bottom_nav"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ to, label, icon: Icon, ocid, isPrimary }) => {
          const isActive =
            to === "/"
              ? currentPath === "/"
              : currentPath === to || currentPath.startsWith(`${to}/`);

          return (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              aria-label={label}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[48px] transition-colors duration-200",
                isPrimary
                  ? "text-primary"
                  : isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-all duration-200",
                  isPrimary
                    ? "h-10 w-10 bg-primary text-primary-foreground shadow-md"
                    : isActive
                      ? "h-8 w-8 bg-primary/10"
                      : "h-8 w-8",
                )}
              >
                <Icon
                  className={cn(
                    "transition-all duration-200",
                    isPrimary ? "h-5 w-5" : isActive ? "h-5 w-5" : "h-5 w-5",
                  )}
                  strokeWidth={isActive || isPrimary ? 2.5 : 1.8}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none",
                  isPrimary ? "text-primary" : isActive ? "text-primary" : "",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
