import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Nav } from "@/components/nav";
import Landing from "@/pages/landing";
import Start from "@/pages/start";
import Presentation from "@/pages/presentation";
import ScheduledLeads from "@/pages/scheduled-leads";
import Representative from "@/pages/representative";
import Apply from "@/pages/apply";
import BookCall from "@/pages/book-call";
import Enrollment from "@/pages/enrollment";
import PartnerProgram from "@/pages/partner-program";
import OnboardingAccess from "@/pages/onboarding-access";
import GameSelection from "@/pages/game-selection";
import Customize from "@/pages/customize";
import Dashboard from "@/pages/dashboard";
import ColdTraffic from "@/pages/coldtraffic";
import ColdTrafficApply from "@/pages/coldtraffic-apply";
import AdminLogin from "@/pages/admin-login";
import AdminProjects from "@/pages/admin-projects";
import AdminProjectDetail from "@/pages/admin-project-detail";
import StaffLogin from "@/pages/staff-login";
import SetPassword from "@/pages/set-password";

const queryClient = new QueryClient();

// ── Route protection for onboarding routes ─────────────────────────────────────
// Checks localStorage "appSquadLoggedIn" flag set by the login page.
// If not authenticated, redirects to /login.
function RequireAuth({ component: Component }: { component: React.ComponentType }) {
  const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("appSquadLoggedIn") === "true";
  if (!isLoggedIn) {
    return <Redirect to="/login" />;
  }
  return <Component />;
}

function AppShell() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {!isAdmin && <Nav />}
      <main className={isAdmin ? "flex-1" : "flex-1"}>
        <Switch>
          {/* Public funnel */}
          <Route path="/" component={Landing} />
          <Route path="/start" component={Start} />
          <Route path="/presentation" component={Presentation} />
          <Route path="/scheduled-leads" component={ScheduledLeads} />
          <Route path="/representative" component={Representative} />
          <Route path="/apply" component={Apply} />
          <Route path="/book-call" component={BookCall} />
          <Route path="/partner-program" component={PartnerProgram} />
          {/* Cold traffic variants */}
          <Route path="/coldtraffic" component={ColdTraffic} />
          <Route path="/coldtraffic-apply" component={ColdTrafficApply} />
          {/* Hidden post-enrollment */}
          <Route path="/enrollment" component={Enrollment} />
          <Route path="/onboarding/access" component={OnboardingAccess} />
          <Route path="/onboarding/game-selection">
            {() => <RequireAuth component={GameSelection} />}
          </Route>
          <Route path="/onboarding/customization">
            {() => <RequireAuth component={Customize} />}
          </Route>
          <Route path="/onboarding/dashboard">
            {() => <RequireAuth component={Dashboard} />}
          </Route>
          {/* Post-payment account setup */}
          <Route path="/set-password" component={SetPassword} />
          {/* Staff login */}
          <Route path="/login" component={StaffLogin} />
          {/* Admin */}
          <Route path="/admin" component={AdminLogin} />
          <Route path="/admin/projects" component={AdminProjects} />
          <Route path="/admin/projects/:id">
            {(params) => <AdminProjectDetail id={params.id} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppShell />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
