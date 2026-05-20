import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Nav } from "@/components/nav";
import Landing from "@/pages/landing";
import Training from "@/pages/training";
import Apply from "@/pages/apply";
import ScheduleCall from "@/pages/schedule-call";
import GameSelection from "@/pages/game-selection";
import Customize from "@/pages/customize";
import Dashboard from "@/pages/dashboard";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/training" component={Training} />
      <Route path="/apply" component={Apply} />
      <Route path="/schedule-call" component={ScheduleCall} />
      <Route path="/game-selection" component={GameSelection} />
      <Route path="/customize" component={Customize} />
      <Route path="/dashboard" component={Dashboard} />
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