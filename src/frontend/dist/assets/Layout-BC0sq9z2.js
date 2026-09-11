import { w as createLucideIcon, f as useRole, e as useAuth, u as useNavigate, r as reactExports, l as jsxRuntimeExports, H as HeartHandshake, p as ue, b0 as z, b1 as useRouterState, L as Link, au as User, h as getUnreadNotificationsCount, Z as cn } from "./main-CgSpP0b-.js";
import { B as Button } from "./button-DvVM0rMM.js";
import { U as Users } from "./users-Bfb9kgVK.js";
import { X, S as Shield } from "./x-bFsLRLYJ.js";
import { H as Heart } from "./heart-BsvgHhcI.js";
import { B as Bell, b as Lock, F as Facebook, I as Instagram, L as Linkedin, a as Mail, M as MessageCircle } from "./message-circle-mF9hUHZC.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const KeyRound = createLucideIcon("KeyRound", [
  [
    "path",
    {
      d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
      key: "1s6t7t"
    }
  ],
  ["circle", { cx: "16.5", cy: "7.5", r: ".5", fill: "currentColor", key: "w0ekpg" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Menu = createLucideIcon("Menu", [
  ["line", { x1: "4", x2: "20", y1: "12", y2: "12", key: "1e0a9i" }],
  ["line", { x1: "4", x2: "20", y1: "6", y2: "6", key: "1owob3" }],
  ["line", { x1: "4", x2: "20", y1: "18", y2: "18", key: "yk5zj1" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Moon = createLucideIcon("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Settings = createLucideIcon("Settings", [
  [
    "path",
    {
      d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      key: "1qme2f"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Sun = createLucideIcon("Sun", [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
]);
function RoleSwitcher() {
  const { role, setRole } = useRole();
  const { user, isAuthenticated, setRole: setAuthRole } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = reactExports.useState(false);
  const handleSwitch = async (newRole) => {
    if (newRole === role || switching) return;
    setSwitching(true);
    try {
      const authRole = newRole === "requester" ? "help_seeker" : "hero";
      setRole(newRole);
      setAuthRole(authRole);
      ue.success(`Switched to ${newRole === "hero" ? "Hero" : "Requester"} mode`);
      navigate({ to: "/home" });
    } catch (error) {
      ue.error("Could not switch role. Please try again.");
    } finally {
      setSwitching(false);
    }
  };
  const isHero = role === "hero";
  const isRequester = role === "requester";
  if (!isAuthenticated) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 bg-muted rounded-full p-1 shadow-sm border border-border/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => handleSwitch("hero"),
        disabled: switching,
        className: `
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
          ${isHero ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
          ${switching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `,
        "aria-pressed": isHero,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Hero" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => handleSwitch("requester"),
        disabled: switching,
        className: `
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
          ${isRequester ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
          ${switching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `,
        "aria-pressed": isRequester,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Requester" })
        ]
      }
    )
  ] });
}
const ADMIN_EMAIL = "shoaibahmedbugti5@gmail.com";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590715263595";
const INSTAGRAM_URL = "https://www.instagram.com/givethra.community";
const LINKEDIN_URL = "https://www.linkedin.com/company/givethra-org/";
const WHATSAPP_URL = "https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J";
function NavLink({
  to,
  children,
  onClick
}) {
  const router = useRouterState();
  const isActive = router.location.pathname === to || router.location.pathname.startsWith(`${to}/`);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Link,
    {
      to,
      onClick,
      className: cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground"
      ),
      children
    }
  );
}
function Layout({ children }) {
  const { theme, setTheme } = z();
  const { isAuthenticated, logout, user } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const router = useRouterState();
  const [menuOpen, setMenuOpen] = reactExports.useState(false);
  const [notifCount, setNotifCount] = reactExports.useState(0);
  const isAdmin = (user == null ? void 0 : user.email) === ADMIN_EMAIL;
  const displayName = (user == null ? void 0 : user.fullName) ?? "";
  reactExports.useEffect(() => {
    if (!isAuthenticated || !(user == null ? void 0 : user.id)) return;
    const loadCounts = async () => {
      try {
        const nCount = await getUnreadNotificationsCount(user.id);
        setNotifCount(nCount ?? 0);
      } catch {
      }
    };
    loadCounts();
    const interval = setInterval(loadCounts, 2e4);
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
  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => {
    logout();
    closeMenu();
    navigate({ to: "/" });
  };
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const isRouteActive = (to) => router.location.pathname === to || router.location.pathname.startsWith(`${to}/`);
  const iconLinkClass = (to) => cn(
    "relative h-10 w-10 flex items-center justify-center rounded-full transition-colors duration-200",
    isRouteActive(to) ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-50 bg-card border-b border-border shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-3 md:px-4 h-16 flex items-center gap-2 md:gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setMenuOpen(!menuOpen),
            "aria-label": "Toggle menu",
            "aria-expanded": menuOpen,
            className: "md:hidden h-10 w-10 shrink-0 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors",
            children: menuOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-6 w-6" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/",
            "aria-label": "Givethra home",
            className: "flex items-center gap-1.5 shrink-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex h-8 w-8 rounded-lg bg-primary items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4 text-primary-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-lg text-primary", children: "Givethra" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center", children: isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsx(RoleSwitcher, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/notifications",
                "aria-label": "Notifications",
                "aria-current": isRouteActive("/notifications") ? "page" : void 0,
                className: iconLinkClass("/notifications"),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5" }),
                  notifCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center", children: notifCount > 9 ? "9+" : notifCount })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: toggleTheme,
                "aria-label": "Toggle theme",
                className: "hidden md:flex h-10 w-10 rounded-full items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/profile/$id",
                params: { id: "me" },
                "aria-label": "Profile",
                "aria-current": isRouteActive("/profile") ? "page" : void 0,
                className: "hidden md:flex h-10 items-center gap-2 px-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors overflow-hidden",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium max-w-[120px] truncate", children: displayName || "My Profile" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: handleLogout,
                className: "hidden md:flex ml-1",
                children: "Logout"
              }
            )
          ] }),
          !isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sign-in", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", children: "Sign in" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sign-up", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "font-semibold", children: "Get Started" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block border-t border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 h-10 flex items-center gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/cases", children: "Browse Cases" }),
        isAuthenticated && (role === "hero" ? /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/my-help", children: "My Help" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/my-cases", children: "My Cases" })),
        isAuthenticated && role !== "hero" && /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/submit-request", children: "Submit a Case" }),
        isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/support", children: "Help & Support" }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/admin", children: "Admin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/about", children: "About" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/faq", children: "FAQ" })
      ] }) }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden border-t border-border bg-card px-4 py-4 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/cases", onClick: closeMenu, children: "Browse Cases" }),
        isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            NavLink,
            {
              to: role === "hero" ? "/my-help" : "/my-cases",
              onClick: closeMenu,
              children: role === "hero" ? "My Help" : "My Cases"
            }
          ) }),
          role !== "hero" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/submit-request", onClick: closeMenu, children: "Submit a Case" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/support", onClick: closeMenu, children: "Help & Support" }) })
        ] }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/admin", onClick: closeMenu, children: "Admin Panel" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/about", onClick: closeMenu, children: "About" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/faq", onClick: closeMenu, children: "FAQ" }) }),
        isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-3 mt-1 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-semibold", children: "Account" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-1 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/settings", onClick: closeMenu, children: "Settings" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-1 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/privacy", onClick: closeMenu, children: "Privacy Policy" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-1 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/security", onClick: closeMenu, children: "Security" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-1 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: "/account-privacy", onClick: closeMenu, children: "Account Privacy" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              toggleTheme();
              closeMenu();
            },
            className: "flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground py-1 transition-colors",
            children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4" }),
              " Light Mode"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4" }),
              " Dark Mode"
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-3 border-t border-border mt-2 space-y-2", children: isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/profile/$id",
              params: { id: "me" },
              onClick: closeMenu,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "w-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 mr-2" }),
                " Profile"
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "w-full",
              onClick: handleLogout,
              children: "Logout"
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sign-in", onClick: closeMenu, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "w-full", children: "Sign in" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sign-up", onClick: closeMenu, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "w-full font-semibold", children: "Get Started" }) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 has-bottom-nav", children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "bg-card border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-lg bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5 text-primary-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-foreground", children: "Givethra" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground max-w-xs", children: "Verified Help. Real Impact." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: FACEBOOK_URL,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Facebook, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: INSTAGRAM_URL,
                target: "_blank",
                rel: "noopener noreferrer",
                "aria-label": "Instagram",
                className: "h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Instagram, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: LINKEDIN_URL,
                target: "_blank",
                rel: "noopener noreferrer",
                "aria-label": "LinkedIn",
                className: "h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Linkedin, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: "mailto:info@givethra.org",
                "aria-label": "Email",
                className: "h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: WHATSAPP_URL,
                target: "_blank",
                rel: "noopener noreferrer",
                "aria-label": "WhatsApp Channel",
                className: "h-9 w-9 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-wrap gap-x-6 gap-y-2", children: [
          { to: "/about", label: "About" },
          { to: "/faq", label: "FAQ" },
          { to: "/privacy", label: "Privacy Policy" },
          { to: "/terms", label: "Terms" },
          { to: "/community-guidelines", label: "Community Guidelines" },
          { to: "/contact", label: "Contact Us" }
        ].map(({ to, label }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to,
            className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
            children: label
          },
          to
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " Givethra. All rights reserved."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Givethra™ is a humanitarian platform connecting verified people with verified help." })
      ] })
    ] }) })
  ] });
}
export {
  KeyRound as K,
  Layout as L,
  Settings as S
};
