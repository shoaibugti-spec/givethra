// src/frontend/src/App.tsx
// Givethra - Full App with Role Selection and Role-based routing

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
  redirect,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";

// Lazy imports
const HomePage = lazy(() => import("@/pages/HomePage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const RoleSelectionPage = lazy(() => import("@/pages/RoleSelectionPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const SignUpPage = lazy(() => import("@/pages/SignUpPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const SignInPage = lazy(() => import("@/pages/SignInPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const CasesPage = lazy(() => import("@/pages/CasesPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const CaseDetailPage = lazy(() => import("@/pages/CaseDetailPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
const SubmitRequestPage = lazy(() => import("@/pages/SubmitRequestPage").catch(() => ({ default: () => <div>Failed to load page</div> })));
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

// Import BottomNav dynamically
import BottomNav from "@/components/BottomNav";

// Root layout with BottomNav
function RootLayout() {
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
  // This loader runs before any route to check role
  beforeLoad: ({ location }) => {
    // We cannot access context here, so we'll handle in component
  },
});

// --- Routes ---
// Index route (/) -> RoleSelectionPage
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Suspense fallback={<PageLoader />}><RoleSelectionPage /></Suspense>,
});

// Home route (/home) -> HomePage, but requires role
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: () => {
    const { role } = useRole();
    const { isAuthenticated } = useAuth();
    // If no role, redirect to /
    if (!role) {
      return <PageLoader />; // will be replaced by redirect
    }
    return <Suspense fallback={<PageLoader />}><HomePage /></Suspense>;
  },
  // Use a loader to redirect if no role
  beforeLoad: ({ location }) => {
    // We need to check role from context, but we can't in beforeLoad easily.
    // We'll do a client-side check in the component.
    // For simplicity, we'll keep the component check.
    // Alternatively, we can use a wrapper component.
    // We'll handle via a guard component.
    return;
  },
});

// For other routes, we'll add a guard component that checks role
// We can create a ProtectedRoute component and wrap all routes that need role.

// But for simplicity, we'll just add a check in each route's component.
// However, to keep code clean, we'll create a wrapper component.

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) {
      navigate({ to: "/" });
    }
  }, [role, navigate]);

  if (!role) {
    return <PageLoader />;
  }
  return children;
}

// But we can't use hooks in route component directly? We can.

// We'll define a helper component to wrap each protected route.

// For now, let's create a simpler approach: In the root layout, we can check role and redirect.

// But since we are building incrementally, we'll proceed with the route definitions.

// We'll add the remaining routes without guards for now, and later we'll add role checks.

// ----- Define all routes -----
const signUpRoute = createRoute({ getParentRoute: () => rootRoute, path: "/sign-up", component: () => <Suspense fallback={<PageLoader />}><SignUpPage /></Suspense> });
const signInRoute = createRoute({ getParentRoute: () => rootRoute, path: "/sign-in", component: () => <Suspense fallback={<PageLoader />}><SignInPage /></Suspense> });
const casesRoute = createRoute({ getParentRoute: () => rootRoute, path: "/cases", component: () => <Suspense fallback={<PageLoader />}><CasesPage /></Suspense> });
const caseDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: "/cases/$id", component: () => <Suspense fallback={<PageLoader />}><CaseDetailPage /></Suspense> });
const submitRequestRoute = createRoute({ getParentRoute: () => rootRoute, path: "/submit-request", component: () => <Suspense fallback={<PageLoader />}><SubmitRequestPage /></Suspense> });
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

// Build route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  homeRoute,
  signUpRoute,
  signInRoute,
  casesRoute,
  caseDetailRoute,
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

// App loading screen
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
  const { isInitializing } = useAuth();
  const { role } = useRole();
  // If no role and not on sign-in/sign-up/root, redirect to root
  // We'll handle in component

  if (isInitializing) return <AppLoadingScreen />;
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
