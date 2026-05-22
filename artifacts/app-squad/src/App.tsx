import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Nav } from "@/components/nav";
import Landing from "@/pages/landing";
import Start from "@/pages/start";
import Presentation from "@/pages/presentation";
import ScheduledLeads from "@/pages/scheduled-leads";
import Apply from "@/pages/apply";
import BookCall from "@/pages/book-call";
import Enrollment from "@/pages/enrollment";
import GameSelection from "@/pages/game-selection";
import Customize from "@/pages/customize";
import Dashboard from "@/pages/dashboard";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public funnel */}
      <Route path="/" component={Landing} />
      <Route path="/start" component={Start} />
      <Route path="/presentation" component={Presentation} />
      <Route path="/scheduled-leads" component={ScheduledLeads} />
      <Route path="/apply" component={Apply} />
      <Route path="/book-call" component={BookCall} />
      {/* Hidden post-enrollment */}
      <Route path="/enrollment" component={Enrollment} />
      <Route path="/onboarding/access" component={GameSelection} />
      <Route path="/onboarding/game-selection" component={GameSelection} />
      <Route path="/onboarding/customization" component={Customize} />
      <Route path="/onboarding/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="flex flex-col min-h-[100dvh] bg-background">
            <Nav />
            <main className="flex-1">
              <Router />
            </main>
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
