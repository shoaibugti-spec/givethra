// src/frontend/src/App.tsx
// Givethra - Full App with Role Selection, KYC, and Routing
// 🔥 FINAL FIX: Removed ALL onboarding redirects for Requester and Hero

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Toaster } from "@/components/ui/sonner";
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy, useEffect, useState } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { getKycStatus } from "@/lib/api";

// Lazy imports
const HomePage = lazy(() => import("@/pages/HomePage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const RoleSelectionPage = lazy(() => import("@/pages/RoleSelectionPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const SignUpPage = lazy(() => import("@/pages/SignUpPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const SignInPage = lazy(() => import("@/pages/SignInPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const CasesPage = lazy(() => import("@/pages/CasesPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const CaseDetailPage = lazy(() => import("@/pages/CaseDetailPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const AffidavitPage = lazy(() => import("@/pages/AffidavitPage").catch(() => ({ default: () => <div>Failed to load page</div> })));

// 🔥 SubmitRequestWizard
const SubmitRequestWizard = lazy(() =>
  import("@/pages/submit-request/SubmitRequestWizard")
    .then(module => ({ default: module.default }))
    .catch(() => ({
      default: () => <div className="p-8 text-center text-red-600">Failed to load Submit Request Wizard. Check console.</div>
    }))
);

const ProfilePage = lazy(() => import("@/pages/ProfilePage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const MyCasesPage = lazy(() => import("@/pages/MyCasesPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const MyHelpPage = lazy(() => import("@/pages/MyHelpPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const AdminPage = lazy(() => import("@/pages/AdminDashboard").catch(() => ({ default: () => <div>Failed to load page</div> })));
const AboutPage = lazy(() => import("@/pages/AboutPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const AccountPrivacyPage = lazy(() => import("@/pages/PrivacyPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const TermsPage = lazy(() => import("@/pages/TermsPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const CommunityGuidelinesPage = lazy(() => import("@/pages/CommunityGuidelinesPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const EditProfilePage = lazy(() => import("@/pages/EditProfilePage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const WalletPage = lazy(() => import("@/pages/WalletPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const SecurityPage = lazy(() => import("@/pages/SecurityPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const KycPage = lazy(() => import("@/pages/KycPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const FaqPage = lazy(() => import("@/pages/FaqPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const SupportChatPage = lazy(() => import("@/pages/SupportChatPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const ContactPage = lazy(() => import("@/pages/ContactPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const BecomeHeroPage = lazy(() => import("@/pages/BecomeHeroPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const NeedHelpPage = lazy(() => import("@/pages/NeedHelpPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const CommunityPage = lazy(() => import("@/pages/CommunityPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const HeroesWallPage = lazy(() => import("@/pages/HeroesWallPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const KindnessWallPage = lazy(() => import("@/pages/KindnessWallPage").catch(() => ({ default: () => <div>Failed to load page</div> })));

// Page loader
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" label="Loading..." />
  </div>
);

// BottomNav fallback
function BottomNavFallback() {
  return (
    <nav aria-label="Bottom navigation" data-ocid="bottom_nav" className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-stretch h-16 opacity-50">
        {["Home", "My Cases", "Submit", "Wallet", "Profile"].map((label) => (
          <div key={label} className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[48px] text-muted-foreground">
            <div className="h-8 w-8" />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}

import BottomNav from "@/components/BottomNav";

// Root layout
function RootLayout() {
  const { isAuthenticated, user, role: authRole, isAdmin } = useAuth();
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  // Sync role from auth context to role context
  useEffect(() => {
    if (!isAuthenticated) return;
    if (authRole === "hero" && role !== "hero") setRole("hero");
    if (authRole === "help_seeker" && role !== "requester") setRole("requester");
  }, [authRole, isAuthenticated, role, setRole]);

  // 🔥 ONLY KYC CHECK — NO ONBOARDING CHECKS AT ALL
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    const checkKyc = async () => {
      try {
        const kyc = await getKycStatus(user.id);
        const status = String(kyc?.status || "none").trim().toLowerCase();

        const publicPaths = [
          "/", "/sign-in", "/sign-up", "/about", "/account-privacy", "/privacy",
          "/terms", "/community-guidelines", "/faq", "/contact", "/community",
          "/heroes-wall", "/kindness-wall",
        ];
        const isPublic = publicPaths.includes(location.pathname);
        const isRequester = role === "requester";

        // 🔥 Requester: if not KYC approved, redirect to /kyc (except public paths)
        if (!isAdmin && isRequester && status !== "approved" && !isPublic && location.pathname !== "/kyc") {
          if (!cancelled) navigate({ to: "/kyc" });
          return;
        }

        // All other cases: allow navigation (including /submit-request and /cases)
        if (!cancelled) setChecking(false);
      } catch (err) {
        console.error("KYC check error:", err);
        setChecking(false);
      }
    };

    checkKyc();
    return () => { cancelled = true; };
  }, [isAdmin, isAuthenticated, user, role, location.pathname, navigate]);

  // Role guard: if no role selected, go to role selection
  useEffect(() => {
    if (!role && !isAdmin && !checking && isAuthenticated) {
      const publicPaths = [
        "/", "/sign-in", "/sign-up", "/kyc", "/onboarding", "/about", "/account-privacy",
        "/privacy", "/terms", "/community-guidelines", "/faq", "/contact", "/community",
        "/heroes-wall", "/kindness-wall",
      ];
      if (!publicPaths.includes(location.pathname)) {
        navigate({ to: "/" });
      }
    }
  }, [role, isAdmin, isAuthenticated, location.pathname, navigate, checking]);

  if (isAuthenticated && checking) {
    return <AppLoadingScreen />;
  }

  return (
    <>
      <Outlet />
      <ErrorBoundary fallback={<BottomNavFallback />}>
        <BottomNav />
      </ErrorBoundary>
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

// --- Routes ---
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Suspense fallback={<PageLoader />}><RoleSelectionPage /></Suspense>,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: () => {
    const { role } = useRole();
    if (!role) return <PageLoader />;
    return <Suspense fallback={<PageLoader />}><HomePage /></Suspense>;
  },
});

const signUpRoute = createRoute({ getParentRoute: () => rootRoute, path: "/sign-up", component: () => <Suspense fallback={<PageLoader />}><SignUpPage /></Suspense> });
const signInRoute = createRoute({ getParentRoute: () => rootRoute, path: "/sign-in", component: () => <Suspense fallback={<PageLoader />}><SignInPage /></Suspense> });
const casesRoute = createRoute({ getParentRoute: () => rootRoute, path: "/cases", component: () => <Suspense fallback={<PageLoader />}><CasesPage /></Suspense> });
const caseDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: "/cases/$id", component: () => <Suspense fallback={<PageLoader />}><CaseDetailPage /></Suspense> });
const affidavitRoute = createRoute({ getParentRoute: () => rootRoute, path: "/affidavit/$caseId", component: () => <Suspense fallback={<PageLoader />}><AffidavitPage /></Suspense> });

// 🔥 Submit Request using new Wizard
const submitRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/submit-request",
  component: () => <Suspense fallback={<PageLoader />}><SubmitRequestWizard /></Suspense>,
});

const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: "/profile/$id", component: () => <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> });
const myCasesRoute = createRoute({ getParentRoute: () => rootRoute, path: "/my-cases", component: () => <Suspense fallback={<PageLoader />}><MyCasesPage /></Suspense> });
const myHelpRoute = createRoute({ getParentRoute: () => rootRoute, path: "/my-help", component: () => <Suspense fallback={<PageLoader />}><MyHelpPage /></Suspense> });
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin", component: () => <Suspense fallback={<PageLoader />}><AdminPage /></Suspense> });
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: "/about", component: () => <Suspense fallback={<PageLoader />}><AboutPage /></Suspense> });
const accountPrivacyRoute = createRoute({ getParentRoute: () => rootRoute, path: "/account-privacy", component: () => <Suspense fallback={<PageLoader />}><AccountPrivacyPage /></Suspense> });
const privacyRoute = createRoute({ getParentRoute: () => rootRoute, path: "/privacy", component: () => <Suspense fallback={<PageLoader />}><PrivacyPolicyPage /></Suspense> });
const termsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/terms", component: () => <Suspense fallback={<PageLoader />}><TermsPage /></Suspense> });
const communityGuidelinesRoute = createRoute({ getParentRoute: () => rootRoute, path: "/community-guidelines", component: () => <Suspense fallback={<PageLoader />}><CommunityGuidelinesPage /></Suspense> });
const notificationsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/notifications", component: () => <Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense> });
const editProfileRoute = createRoute({ getParentRoute: () => rootRoute, path: "/edit-profile", component: () => <Suspense fallback={<PageLoader />}><EditProfilePage /></Suspense> });
const walletRoute = createRoute({ getParentRoute: () => rootRoute, path: "/wallet", component: () => <Suspense fallback={<PageLoader />}><WalletPage /></Suspense> });
const securityRoute = createRoute({ getParentRoute: () => rootRoute, path: "/security", component: () => <Suspense fallback={<PageLoader />}><SecurityPage /></Suspense> });
const settingsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/settings", component: () => <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense> });
const kycRoute = createRoute({ getParentRoute: () => rootRoute, path: "/kyc", component: () => <Suspense fallback={<PageLoader />}><KycPage /></Suspense> });
const faqRoute = createRoute({ getParentRoute: () => rootRoute, path: "/faq", component: () => <Suspense fallback={<PageLoader />}><FaqPage /></Suspense> });
const supportRoute = createRoute({ getParentRoute: () => rootRoute, path: "/support", component: () => <Suspense fallback={<PageLoader />}><SupportChatPage /></Suspense> });
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: "/contact", component: () => <Suspense fallback={<PageLoader />}><ContactPage /></Suspense> });
const becomeHeroRoute = createRoute({ getParentRoute: () => rootRoute, path: "/become-hero", component: () => <Suspense fallback={<PageLoader />}><BecomeHeroPage /></Suspense> });
const needHelpRoute = createRoute({ getParentRoute: () => rootRoute, path: "/need-help", component: () => <Suspense fallback={<PageLoader />}><NeedHelpPage /></Suspense> });
const onboardingRoute = createRoute({ getParentRoute: () => rootRoute, path: "/onboarding", component: () => <Suspense fallback={<PageLoader />}><OnboardingPage /></Suspense> });
const communityRoute = createRoute({ getParentRoute: () => rootRoute, path: "/community", component: () => <Suspense fallback={<PageLoader />}><CommunityPage /></Suspense> });
const heroesWallRoute = createRoute({ getParentRoute: () => rootRoute, path: "/heroes-wall", component: () => <Suspense fallback={<PageLoader />}><HeroesWallPage /></Suspense> });
const kindnessWallRoute = createRoute({ getParentRoute: () => rootRoute, path: "/kindness-wall", component: () => <Suspense fallback={<PageLoader />}><KindnessWallPage /></Suspense> });

const routeTree = rootRoute.addChildren([
  indexRoute,
  homeRoute,
  signUpRoute,
  signInRoute,
  casesRoute,
  caseDetailRoute,
  affidavitRoute,
  submitRequestRoute,
  profileRoute,
  myCasesRoute,
  myHelpRoute,
  adminRoute,
  aboutRoute,
  accountPrivacyRoute,
  privacyRoute,
  termsRoute,
  communityGuidelinesRoute,
  notificationsRoute,
  editProfileRoute,
  walletRoute,
  securityRoute,
  settingsRoute,
  kycRoute,
  faqRoute,
  supportRoute,
  contactRoute,
  becomeHeroRoute,
  needHelpRoute,
  onboardingRoute,
  communityRoute,
  heroesWallRoute,
  kindnessWallRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppLoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--background, #ffffff)", gap: "1.5rem" }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, background: "#00A896", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 24, fontFamily: "system-ui, sans-serif" }}>G</span>
      </div>
      <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.5px", fontFamily: "system-ui, sans-serif", color: "var(--foreground, #111)" }}>Givethra</span>
      <LoadingSpinner size="md" label="Loading Application..." />
    </div>
  );
}

function AppShell() {
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <RoleProvider>
          <AppSettingsProvider>
            <AppShell />
            <Toaster richColors position="top-right" />
          </AppSettingsProvider>
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
