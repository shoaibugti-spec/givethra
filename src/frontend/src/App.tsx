// src/frontend/src/App.tsx
// Givethra - Full App with Role Selection, KYC, and Routing
// Profile submission and Requester Visit submission intentionally use separate
// experiences while sharing the same case-submission backend.
//
// 🔥 FIXED: publicPaths now uses startsWith() for /payment-proof/ and /affidavit/
// routes so users aren't redirected to "/" when role hasn't loaded yet.

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy, useEffect, useState } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { getProfile } from "@/lib/api";

// Lazy imports
const HomePage = lazy(() =>
  import("@/pages/HomePage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const RoleSelectionPage = lazy(() =>
  import("@/pages/RoleSelectionPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const SignInPage = lazy(() =>
  import("@/pages/SignInPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const CasesPage = lazy(() =>
  import("@/pages/CasesPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const CaseDetailPage = lazy(() =>
  import("@/pages/CaseDetailPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const AffidavitPage = lazy(() =>
  import("@/pages/AffidavitPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const PaymentProofPage = lazy(() =>
  import("@/pages/PaymentProofPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);

// Guided wizard — used by the Requester Visit route.
const SubmitRequestWizard = lazy(() =>
  import("@/pages/submit-request/SubmitRequestWizard")
    .then((module) => ({ default: module.default }))
    .catch(() => ({
      default: () => (
        <div className="p-8 text-center text-red-600">
          Failed to load Submit Request Wizard. Check console.
        </div>
      ),
    }))
);

const SubmitRequestPage = lazy(() =>
  import("@/pages/SubmitRequestPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);

const ProfilePage = lazy(() =>
  import("@/pages/ProfilePage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const MyCasesPage = lazy(() =>
  import("@/pages/MyCasesPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const MyHelpPage = lazy(() =>
  import("@/pages/MyHelpPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const DonationPage = lazy(() =>
  import("@/pages/DonationPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const AdminPage = lazy(() =>
  import("@/pages/AdminDashboard").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const AboutPage = lazy(() =>
  import("@/pages/AboutPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const AccountPrivacyPage = lazy(() =>
  import("@/pages/PrivacyPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const PrivacyPolicyPage = lazy(() =>
  import("@/pages/PrivacyPolicyPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const TermsPage = lazy(() =>
  import("@/pages/TermsPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const CommunityGuidelinesPage = lazy(() =>
  import("@/pages/CommunityGuidelinesPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const NotificationsPage = lazy(() =>
  import("@/pages/NotificationsPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const EditProfilePage = lazy(() =>
  import("@/pages/EditProfilePage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const WalletPage = lazy(() =>
  import("@/pages/WalletPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const SecurityPage = lazy(() =>
  import("@/pages/SecurityPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const KycPage = lazy(() =>
  import("@/pages/KycPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const FaqPage = lazy(() =>
  import("@/pages/FaqPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const SupportChatPage = lazy(() =>
  import("@/pages/SupportChatPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const ContactPage = lazy(() =>
  import("@/pages/ContactPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const AccessibilityPage = lazy(() => import("@/pages/AccessibilityPage"));
const CommunitySupportPage = lazy(() => import("@/pages/CommunitySupportPage"));
const CookiePolicyPage = lazy(() => import("@/pages/CookiePolicyPage"));
const CreditsRefundsPage = lazy(() => import("@/pages/CreditsRefundsPage"));
const DisclaimerPage = lazy(() => import("@/pages/DisclaimerPage"));
const DonationPolicyPage = lazy(() => import("@/pages/DonationPolicyPage"));
const ReportAbusePage = lazy(() => import("@/pages/ReportAbusePage"));
const ShopDreamNowRulesPage = lazy(() => import("@/pages/ShopDreamNowRulesPage"));
const VerificationPolicyPage = lazy(() => import("@/pages/VerificationPolicyPage"));
const BecomeHeroPage = lazy(() =>
  import("@/pages/BecomeHeroPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const NeedHelpPage = lazy(() =>
  import("@/pages/NeedHelpPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const OnboardingPage = lazy(() =>
  import("@/pages/OnboardingPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const CommunityPage = lazy(() =>
  import("@/pages/CommunityPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const HeroesWallPage = lazy(() =>
  import("@/pages/HeroesWallPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const KindnessWallPage = lazy(() =>
  import("@/pages/KindnessWallPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const WallsPage = lazy(() =>
  import("@/pages/WallsPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const DreamsPage = lazy(() =>
  import("@/pages/DreamsPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);
const DreamDetailPage = lazy(() =>
  import("@/pages/DreamDetailPage").catch(() => ({
    default: () => <div>Failed to load page</div>,
  }))
);

// Keep route transitions consistent with the initial app bootstrap: the old
// plain white generic spinner should never appear between pages.
const PageLoader = () => <AppLoadingScreen />;

// Help Me (short video appeals). Full-screen pages: no app header and no bottom navigation.
const HelpMePage = lazy(() => import("@/pages/HelpMePage"));
const HelpMeCreatePage = lazy(() => import("@/pages/HelpMeCreatePage"));
const HelpMeMyPage = lazy(() => import("@/pages/HelpMeMyPage"));
const HelpMeUserPage = lazy(() => import("@/pages/HelpMeUserPage"));

// Shown only if BottomNav itself crashes. Uses plain <a href> links so the
// navigation still works even when the router/JS state is unhealthy.
function BottomNavFallback() {
  const items = [
    { href: "/home", label: "Home" },
    { href: "/my-cases", label: "Cases/Helps" },
    { href: "/helpme", label: "Help Me" },
    { href: "/walls", label: "Walls" },
    { href: "/profile/me", label: "Profile" },
  ];
  return (
    <nav
      aria-label="Bottom navigation"
      data-ocid="bottom_nav"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-16">
        {items.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[48px] text-muted-foreground"
          >
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

// Pages a signed-in user may open even before a role (hero / requester) has
// been chosen. A signed-in user with no stored role is common: a new device,
// storage that is blocked or cleared, or logging in again after logout (logout
// removes the stored role). These pages must never bounce back to "/".
const ROLE_OPTIONAL_PATHS = new Set([
  "/",
  "/home",
  "/sign-in",
  "/sign-up",
  "/kyc",
  "/onboarding",
  "/onboarding-submit",
  "/become-hero",
  "/need-help",
  "/submit-request",
  "/edit-profile",
  "/my-help",
  "/my-cases",
  "/wallet",
  "/notifications",
  "/donation",
  "/support",
  "/settings",
  "/security",
  "/about",
  "/account-privacy",
  "/privacy",
  "/privacy-policy",
  "/terms",
  "/community-guidelines",
  "/faq",
  "/contact",
  "/cookies",
  "/accessibility",
  "/disclaimer",
  "/verification-policy",
  "/credits-refunds",
  "/donation-policy",
  "/community-support",
  "/shop-dream-now-rules",
  "/report",
  "/community",
  "/heroes-wall",
  "/kindness-wall",
  "/walls",
  "/dreams",
  "/cases",
  "/payment-proof",
  "/helpme",
  "/helpme/new",
  "/helpme/my",
]);
const ROLE_OPTIONAL_PREFIXES = [
  "/cases/",
  "/payment-proof/",
  "/affidavit/",
  "/dreams/",
  "/profile/",
  "/helpme/",
];

import BottomNav from "@/components/BottomNav";

function RootLayout() {
  const { isAuthenticated, isInitializing, user, role: authRole, isAdmin } = useAuth();
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (authRole === "hero" && role !== "hero") setRole("hero");
    if (authRole === "help_seeker" && role !== "requester") setRole("requester");
  }, [authRole, role, setRole]);

  // The public entry URL is always the main Home experience. Community and
  // Earnings remain opt-in destinations and must never become the first view.
  useEffect(() => {
    if (location.pathname !== "/") return;
    try {
      localStorage.setItem("givethra_home_mode", "support");
    } catch {
      // Restricted/private browser storage must not crash the application.
    }
    window.dispatchEvent(new CustomEvent("givethra-home-panel-tab", { detail: "support" }));
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated || !user || isAdmin || location.pathname === "/edit-profile") return;
    let cancelled = false;
    const setupMarkerKey = `givethra_profile_setup_completed:${user.id}`;
    try {
      if (localStorage.getItem(setupMarkerKey) === "1") return;
    } catch {
      // Continue with the server marker when browser storage is unavailable.
    }
    setChecking(true);
    getProfile(user.id, role)
      .then((profile) => {
        if (profile?.profile_setup_completed_at) {
          try { localStorage.setItem(setupMarkerKey, "1"); } catch { /* ignore storage restrictions */ }
        }
        if (!cancelled && !profile?.profile_setup_completed_at) {
          navigate({ to: "/edit-profile", search: { setup: "1" } });
        }
      })
      .catch(() => {
        // The setup page can still load and create a missing profile after a transient read failure.
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, isAuthenticated, location.pathname, navigate, role, user]);

  useEffect(() => {
    if (!role && !isAdmin && !checking && isAuthenticated) {
      // A signed-in user without a role must still be able to use the app
      // navigation (/home, /my-help, /my-cases, /wallet, /profile/...), the
      // role pages (/become-hero, /need-help) and the profile setup page.
      // 🔥 FIX: Now uses startsWith() for parameterized routes so users aren't
      // redirected away when role hasn't loaded yet.
      const isPublicRoute =
        ROLE_OPTIONAL_PATHS.has(location.pathname) ||
        ROLE_OPTIONAL_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));
      if (!isPublicRoute) {
        navigate({ to: "/" });
      }
    }
  }, [role, isAdmin, isAuthenticated, location.pathname, navigate, checking]);

  if (isInitializing) {
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

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HomePage />
    </Suspense>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HomePage />
    </Suspense>
  ),
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-up",
  // There is no separate sign-up: old links to /sign-up go to the one sign-in.
  component: () => <Navigate to="/sign-in" replace />,
});
const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-in",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <SignInPage />
    </Suspense>
  ),
});
const casesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <CasesPage />
    </Suspense>
  ),
});
const caseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$id",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <CaseDetailPage />
    </Suspense>
  ),
});
const affidavitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/affidavit/$caseId",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AffidavitPage />
    </Suspense>
  ),
});
const paymentProofRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-proof/$caseId",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <PaymentProofPage />
    </Suspense>
  ),
});

// Profile/BottomNav submission uses the established guided SubmitRequestPage.
const submitRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/submit-request",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <SubmitRequestPage />
    </Suspense>
  ),
});

const onboardingSubmitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding-submit",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <SubmitRequestWizard />
    </Suspense>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$id",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ProfilePage />
    </Suspense>
  ),
});
const myCasesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-cases",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <MyCasesPage />
    </Suspense>
  ),
});
const myHelpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-help",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <MyHelpPage />
    </Suspense>
  ),
});
const donationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/donation",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <DonationPage />
    </Suspense>
  ),
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AdminPage />
    </Suspense>
  ),
});
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AboutPage />
    </Suspense>
  ),
});
const accountPrivacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account-privacy",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AccountPrivacyPage />
    </Suspense>
  ),
});
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AccountPrivacyPage />
    </Suspense>
  ),
});
const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <TermsPage />
    </Suspense>
  ),
});
const communityGuidelinesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community-guidelines",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <CommunityGuidelinesPage />
    </Suspense>
  ),
});
const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <NotificationsPage />
    </Suspense>
  ),
});
const editProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/edit-profile",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <EditProfilePage />
    </Suspense>
  ),
});
const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <WalletPage />
    </Suspense>
  ),
});
const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/security",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <SecurityPage />
    </Suspense>
  ),
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <SettingsPage />
    </Suspense>
  ),
});
const kycRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kyc",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <KycPage />
    </Suspense>
  ),
});
const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faq",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <FaqPage />
    </Suspense>
  ),
});
const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/support",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <SupportChatPage />
    </Suspense>
  ),
});
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ContactPage />
    </Suspense>
  ),
});
const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy-policy",
  component: () => <Suspense fallback={<PageLoader />}><PrivacyPolicyPage /></Suspense>,
});
const cookiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cookies",
  component: () => <Suspense fallback={<PageLoader />}><CookiePolicyPage /></Suspense>,
});
const accessibilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accessibility",
  component: () => <Suspense fallback={<PageLoader />}><AccessibilityPage /></Suspense>,
});
const disclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/disclaimer",
  component: () => <Suspense fallback={<PageLoader />}><DisclaimerPage /></Suspense>,
});
const verificationPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verification-policy",
  component: () => <Suspense fallback={<PageLoader />}><VerificationPolicyPage /></Suspense>,
});
const creditsRefundsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/credits-refunds",
  component: () => <Suspense fallback={<PageLoader />}><CreditsRefundsPage /></Suspense>,
});
const donationPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/donation-policy",
  component: () => <Suspense fallback={<PageLoader />}><DonationPolicyPage /></Suspense>,
});
const communitySupportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community-support",
  component: () => <Suspense fallback={<PageLoader />}><CommunitySupportPage /></Suspense>,
});
const shopDreamNowRulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop-dream-now-rules",
  component: () => <Suspense fallback={<PageLoader />}><ShopDreamNowRulesPage /></Suspense>,
});
const reportAbuseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/report",
  component: () => <Suspense fallback={<PageLoader />}><ReportAbusePage /></Suspense>,
});
const becomeHeroRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/become-hero",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <BecomeHeroPage />
    </Suspense>
  ),
});
const needHelpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/need-help",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <NeedHelpPage />
    </Suspense>
  ),
});
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <OnboardingPage />
    </Suspense>
  ),
});
const communityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <CommunityPage />
    </Suspense>
  ),
});
const heroesWallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/heroes-wall",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HeroesWallPage />
    </Suspense>
  ),
});
const kindnessWallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kindness-wall",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <KindnessWallPage />
    </Suspense>
  ),
});
const wallsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/walls",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <WallsPage />
    </Suspense>
  ),
});
const dreamsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dreams",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <DreamsPage />
    </Suspense>
  ),
});
const dreamDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dreams/$id",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <DreamDetailPage />
    </Suspense>
  ),
});

const helpMeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/helpme",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HelpMePage />
    </Suspense>
  ),
});
const helpMeNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/helpme/new",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HelpMeCreatePage />
    </Suspense>
  ),
});
const helpMeMyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/helpme/my",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HelpMeMyPage />
    </Suspense>
  ),
});
const helpMeUserRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/helpme/u/$userId",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HelpMeUserPage />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  homeRoute,
  signUpRoute,
  signInRoute,
  casesRoute,
  caseDetailRoute,
  affidavitRoute,
  paymentProofRoute,
  submitRequestRoute,
  onboardingSubmitRoute,
  profileRoute,
  myCasesRoute,
  myHelpRoute,
  donationRoute,
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
  privacyPolicyRoute,
  cookiesRoute,
  accessibilityRoute,
  disclaimerRoute,
  verificationPolicyRoute,
  creditsRefundsRoute,
  donationPolicyRoute,
  communitySupportRoute,
  shopDreamNowRulesRoute,
  reportAbuseRoute,
  becomeHeroRoute,
  needHelpRoute,
  onboardingRoute,
  communityRoute,
  heroesWallRoute,
  kindnessWallRoute,
  wallsRoute,
  dreamsRoute,
  dreamDetailRoute,
  helpMeRoute,
  helpMeNewRoute,
  helpMeMyRoute,
  helpMeUserRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppLoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        padding: "2rem",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(145deg, #063f4a 0%, #03707b 48%, #00a896 100%)",
      }}
    >
      <style>{`
        @keyframes givethra-splash-enter {
          from { opacity: 0; transform: translateY(14px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes givethra-splash-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes givethra-splash-glow {
          0%, 100% { opacity: .35; transform: scale(.92); }
          50% { opacity: .75; transform: scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .givethra-splash-motion { animation: none !important; }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="givethra-splash-motion"
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(91, 236, 222, .22)",
          filter: "blur(18px)",
          animation: "givethra-splash-glow 2.6s ease-in-out infinite",
        }}
      />
      <div
        className="givethra-splash-motion"
        style={{
          width: "min(74vw, 190px)",
          aspectRatio: "3 / 2",
          borderRadius: 28,
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 18px 55px rgba(0, 25, 34, .35), 0 0 0 1px rgba(255,255,255,.22)",
          animation: "givethra-splash-enter 700ms cubic-bezier(.23,1,.32,1) both",
        }}
      >
        <img src="/givethra-splash-logo.png" alt="Givethra logo" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
      </div>
      <span
        className="givethra-splash-motion"
        style={{
          fontWeight: 700,
          fontSize: "clamp(1.8rem, 7vw, 2.35rem)",
          letterSpacing: "-0.04em",
          fontFamily: "system-ui, sans-serif",
          color: "#ffffff",
          textShadow: "0 3px 18px rgba(0, 37, 47, .32)",
          animation: "givethra-splash-enter 700ms 120ms cubic-bezier(.23,1,.32,1) both",
        }}
      >
        Givethra
      </span>
      <span
        className="givethra-splash-motion"
        style={{
          marginTop: -10,
          color: "rgba(255, 255, 255, .88)",
          fontSize: "clamp(.78rem, 3vw, .95rem)",
          letterSpacing: ".02em",
          animation: "givethra-splash-enter 700ms 220ms cubic-bezier(.23,1,.32,1) both",
        }}
      >
        Verified Help. Real Impact.
      </span>
      <div
        className="givethra-splash-motion"
        aria-label="Loading application"
        style={{
          width: 32,
          height: 32,
          marginTop: 10,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,.3)",
          borderTopColor: "#ffffff",
          animation: "givethra-splash-spin 900ms linear infinite",
        }}
      />
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
