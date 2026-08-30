import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import {
  AdminPage,
  CaseDetailPage,
  CasesPage,
  DashboardPage,
  KycPage,
  HelpPage,
  NotificationsPage,
  ProfilePage,
  SubmitCasePage,
  SupportPage,
} from "./pages/GivethraPages";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/cases"} component={CasesPage} />
      <Route path={"/cases/:id"} component={CaseDetailPage} />
      <Route path={"/dashboard"} component={DashboardPage} />
      <Route path={"/profile"} component={ProfilePage} />
      <Route path={"/kyc"} component={KycPage} />
      <Route path={"/submit-case"} component={SubmitCasePage} />
      <Route path={"/my-cases"} component={SubmitCasePage} />
      <Route path={"/my-help"} component={HelpPage} />
      <Route path={"/notifications"} component={NotificationsPage} />
      <Route path={"/support"} component={SupportPage} />
      <Route path={"/admin"} component={AdminPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
