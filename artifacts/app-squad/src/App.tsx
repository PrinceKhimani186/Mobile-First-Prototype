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
import Agreement from "@/pages/agreement";
import GameSelection from "@/pages/game-selection";
import Customize from "@/pages/customize";
import Dashboard from "@/pages/dashboard";
import ColdTraffic from "@/pages/coldtraffic";
import ColdTrafficApply from "@/pages/coldtraffic-apply";
import AdminLogin from "@/pages/admin-login";
import AdminProjects from "@/pages/admin-projects";
import AdminProjectDetail from "@/pages/admin-project-detail";
import AdminUsers from "@/pages/admin-users";
import StaffLogin from "@/pages/staff-login";
import SetPassword from "@/pages/set-password";

const queryClient = new QueryClient();

import { useQuery } from "@tanstack/react-query";
import { getEnrollmentProgress, getOnboardingEmail } from "@/services/enrollment";
import { Loader2 } from "lucide-react";

function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem("appSquadLoggedIn") === "true" ||
    localStorage.getItem("as_admin_auth") === "true"
  );
}

function useOnboardingProgress() {
  const email = getOnboardingEmail();

  return useQuery({
    queryKey: ["onboardingProgress", email],
    queryFn: async () => {
      if (!email) return { record: null };
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const sessionId = params ? params.get("session_id") || "" : "";
      const res = await getEnrollmentProgress(email, sessionId);
      if (res.record && !isLoggedIn()) {
        console.info("[Auth] Backend authorized session, logging in frontend for:", email);
        localStorage.setItem("appSquadLoggedIn", "true");
        localStorage.setItem("appSquadUserEmail", email);
        localStorage.setItem("appSquadEnrollmentEmail", email);
      }
      return res;
    },
    enabled: !!email,
    staleTime: 5000,
  });
}

function logGuardRedirect(
  guardName: string,
  route: string,
  email: string,
  record: any,
  destination: string | null,
  reason: string
) {
  console.info(
    `%c[Guard: ${guardName}]`,
    "color: #fbbf24; font-weight: bold; background: #1e1e2e; padding: 2px 5px; border-radius: 3px;",
    `\n  - Route: ${route}` +
    `\n  - Email: ${email || "(empty)"}` +
    `\n  - Onboarding Step: ${record?.onboarding_status || "(unknown)"}` +
    `\n  - Agreement Signed: ${record?.agreement_signed ?? false}` +
    `\n  - Password Created: ${record?.password_created ?? false}` +
    `\n  - Redirect to: ${destination || "None (Allow Render)"}` +
    `\n  - Reason: ${reason}`
  );
}

// /onboarding/agreement
function RequireAgreement({ component: Component }: { component: React.ComponentType }) {
  const { data, isLoading } = useOnboardingProgress();
  const record = data?.record;
  const error = data?.error;
  const email = getOnboardingEmail();
  const path = typeof window !== "undefined" ? window.location.pathname : "/onboarding/agreement";

  // Detailed route logging
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const sessionId = params ? params.get("session_id") || "" : "";
  console.log("[Route Guard: RequireAgreement]", {
    currentRoute: path,
    authenticatedUser: isLoggedIn(),
    stripePaymentStatus: record?.payment_status || "unknown",
    accountExists: !!record,
    passwordExists: record?.password_created ?? false,
    currentOnboardingStep: record?.onboarding_status || "unknown",
    sessionIdPresent: !!sessionId,
  });

  if (!email) {
    logGuardRedirect("RequireAgreement", path, email, null, "/enrollment", "Email is missing");
    return <Redirect to="/enrollment" />;
  }
  if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-sans text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading progress...</div>;

  if (!record) {
    if (error === "unauthorized") {
      logGuardRedirect("RequireAgreement", path, email, null, `/login?email=${encodeURIComponent(email)}`, "Registered user needs to login");
      return <Redirect to={`/login?email=${encodeURIComponent(email)}`} />;
    }
    logGuardRedirect("RequireAgreement", path, email, null, "/enrollment", "Enrollment record not found in database");
    return <Redirect to="/enrollment" />;
  }

  // 1. Password must be created first (first-time user onboarding)
  if (!record.password_created) {
    logGuardRedirect("RequireAgreement", path, email, record, `/set-password?email=${encodeURIComponent(email)}`, "Password not created yet");
    return <Redirect to={`/set-password?email=${encodeURIComponent(email)}`} />;
  }

  // 2. Existing customer must log in
  if (!isLoggedIn()) {
    logGuardRedirect("RequireAgreement", path, email, record, `/login?email=${encodeURIComponent(email)}`, "Password created but user is not logged in");
    return <Redirect to={`/login?email=${encodeURIComponent(email)}`} />;
  }

  // 3. Agreement Signed redirects
  if (record.agreement_signed) {
    if (!record.game_selected) {
      logGuardRedirect("RequireAgreement", path, email, record, "/onboarding/game-selection", "Agreement signed, game not selected");
      return <Redirect to="/onboarding/game-selection" />;
    }
    if (!record.customization_completed) {
      logGuardRedirect("RequireAgreement", path, email, record, "/onboarding/customization", "Game selected, but customization not completed");
      return <Redirect to="/onboarding/customization" />;
    }
    logGuardRedirect("RequireAgreement", path, email, record, "/onboarding/dashboard", "Onboarding completed, redirecting to dashboard");
    return <Redirect to="/onboarding/dashboard" />;
  }

  logGuardRedirect("RequireAgreement", path, email, record, null, "Agreement not signed yet (Allow Render)");
  return <Component />;
}

// /set-password
function RequireSetPassword({ component: Component }: { component: React.ComponentType }) {
  const { data, isLoading } = useOnboardingProgress();
  const record = data?.record;
  const error = data?.error;
  const email = getOnboardingEmail();
  const path = typeof window !== "undefined" ? window.location.pathname : "/set-password";

  console.log("[Route Guard: RequireSetPassword]", {
    currentRoute: path,
    authenticatedUser: isLoggedIn(),
    stripePaymentStatus: record?.payment_status || "unknown",
    accountExists: !!record,
    passwordExists: record?.password_created ?? false,
    currentOnboardingStep: record?.onboarding_status || "unknown",
  });

  if (!email) {
    logGuardRedirect("RequireSetPassword", path, email, null, "/enrollment", "Email is missing");
    return <Redirect to="/enrollment" />;
  }
  if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-sans text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading progress...</div>;

  if (!record) {
    if (error === "unauthorized") {
      logGuardRedirect("RequireSetPassword", path, email, null, `/login?email=${encodeURIComponent(email)}`, "Registered user needs to login");
      return <Redirect to={`/login?email=${encodeURIComponent(email)}`} />;
    }
    logGuardRedirect("RequireSetPassword", path, email, null, "/enrollment", "Enrollment record not found in database");
    return <Redirect to="/enrollment" />;
  }
  // If password already set, check and route to next incomplete step or login
  if (record.password_created) {
    if (!isLoggedIn()) {
      logGuardRedirect("RequireSetPassword", path, email, record, `/login?email=${encodeURIComponent(email)}`, "Password already created, user not logged in");
      return <Redirect to={`/login?email=${encodeURIComponent(email)}`} />;
    }
    if (!record.agreement_signed) {
      logGuardRedirect("RequireSetPassword", path, email, record, "/onboarding/agreement", "Password created, logged in, agreement not signed");
      return <Redirect to={`/onboarding/agreement?email=${encodeURIComponent(email)}`} />;
    }
    if (!record.game_selected) {
      logGuardRedirect("RequireSetPassword", path, email, record, "/onboarding/game-selection", "Password created, logged in, game not selected");
      return <Redirect to="/onboarding/game-selection" />;
    }
    if (!record.customization_completed) {
      logGuardRedirect("RequireSetPassword", path, email, record, "/onboarding/customization", "Password created, logged in, customization not completed");
      return <Redirect to="/onboarding/customization" />;
    }
    logGuardRedirect("RequireSetPassword", path, email, record, "/onboarding/dashboard", "Password created, logged in, onboarding complete");
    return <Redirect to="/onboarding/dashboard" />;
  }

  logGuardRedirect("RequireSetPassword", path, email, record, null, "Password not created yet (Allow Render)");
  return <Component />;
}

// /login
function RequireLogin({ component: Component }: { component: React.ComponentType }) {
  const { data, isLoading } = useOnboardingProgress();
  const record = data?.record;
  const error = data?.error;
  const email = getOnboardingEmail();
  const path = typeof window !== "undefined" ? window.location.pathname : "/login";

  console.log("[Route Guard: RequireLogin]", {
    currentRoute: path,
    authenticatedUser: isLoggedIn(),
    stripePaymentStatus: record?.payment_status || "unknown",
    accountExists: !!record,
    passwordExists: record?.password_created ?? false,
    currentOnboardingStep: record?.onboarding_status || "unknown",
  });

  if (isLoggedIn()) {
    if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-sans text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading progress...</div>;
    if (record) {
      if (!record.password_created) {
        logGuardRedirect("RequireLogin", path, email, record, "/set-password", "User is logged in but password not created");
        return <Redirect to={`/set-password?email=${encodeURIComponent(email)}`} />;
      }
      if (!record.agreement_signed) {
        logGuardRedirect("RequireLogin", path, email, record, "/onboarding/agreement", "User is logged in but agreement not signed");
        return <Redirect to={`/onboarding/agreement?email=${encodeURIComponent(email)}`} />;
      }
      if (!record.game_selected) {
        logGuardRedirect("RequireLogin", path, email, record, "/onboarding/game-selection", "User is logged in but game not selected");
        return <Redirect to="/onboarding/game-selection" />;
      }
      if (!record.customization_completed) {
        logGuardRedirect("RequireLogin", path, email, record, "/onboarding/customization", "User is logged in but customization not completed");
        return <Redirect to="/onboarding/customization" />;
      }
      logGuardRedirect("RequireLogin", path, email, record, "/onboarding/dashboard", "Onboarding completed, redirecting to dashboard");
      return <Redirect to="/onboarding/dashboard" />;
    }
  }

  logGuardRedirect("RequireLogin", path, email, record, null, "User is not logged in (Allow Render)");
  return <Component />;
}

// /onboarding/game-selection
function RequireGameSelection({ component: Component }: { component: React.ComponentType }) {
  const { data, isLoading } = useOnboardingProgress();
  const record = data?.record;
  const error = data?.error;
  const email = getOnboardingEmail();
  const path = typeof window !== "undefined" ? window.location.pathname : "/onboarding/game-selection";

  console.log("[Route Guard: RequireGameSelection]", {
    currentRoute: path,
    authenticatedUser: isLoggedIn(),
    stripePaymentStatus: record?.payment_status || "unknown",
    accountExists: !!record,
    passwordExists: record?.password_created ?? false,
    currentOnboardingStep: record?.onboarding_status || "unknown",
  });

  if (!isLoggedIn()) {
    logGuardRedirect("RequireGameSelection", path, email, null, "/login", "User is not logged in");
    return <Redirect to="/login" />;
  }
  if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-sans text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading progress...</div>;

  if (!record) {
    if (error === "unauthorized") {
      logGuardRedirect("RequireGameSelection", path, email, null, `/login?email=${encodeURIComponent(email)}`, "Registered user needs to login");
      return <Redirect to={`/login?email=${encodeURIComponent(email)}`} />;
    }
    logGuardRedirect("RequireGameSelection", path, email, null, "/enrollment", "Enrollment record not found in database");
    return <Redirect to="/enrollment" />;
  }
  if (!record.password_created) {
    logGuardRedirect("RequireGameSelection", path, email, record, "/set-password", "Password not created");
    return <Redirect to={`/set-password?email=${encodeURIComponent(email)}`} />;
  }
  if (!record.agreement_signed) {
    logGuardRedirect("RequireGameSelection", path, email, record, "/onboarding/agreement", "Agreement not signed");
    return <Redirect to={`/onboarding/agreement?email=${encodeURIComponent(email)}`} />;
  }
  
  if (record.game_selected) {
    if (!record.customization_completed) {
      logGuardRedirect("RequireGameSelection", path, email, record, "/onboarding/customization", "Game already selected but customization not completed");
      return <Redirect to="/onboarding/customization" />;
    }
    logGuardRedirect("RequireGameSelection", path, email, record, "/onboarding/dashboard", "Onboarding completed, redirecting to dashboard");
    return <Redirect to="/onboarding/dashboard" />;
  }

  logGuardRedirect("RequireGameSelection", path, email, record, null, "Onboarding step Game Selection (Allow Render)");
  return <Component />;
}

// /onboarding/customization
function RequireCustomization({ component: Component }: { component: React.ComponentType }) {
  const { data, isLoading } = useOnboardingProgress();
  const record = data?.record;
  const error = data?.error;
  const email = getOnboardingEmail();
  const path = typeof window !== "undefined" ? window.location.pathname : "/onboarding/customization";

  console.log("[Route Guard: RequireCustomization]", {
    currentRoute: path,
    authenticatedUser: isLoggedIn(),
    stripePaymentStatus: record?.payment_status || "unknown",
    accountExists: !!record,
    passwordExists: record?.password_created ?? false,
    currentOnboardingStep: record?.onboarding_status || "unknown",
  });

  if (!isLoggedIn()) {
    logGuardRedirect("RequireCustomization", path, email, null, "/login", "User is not logged in");
    return <Redirect to="/login" />;
  }
  if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-sans text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading progress...</div>;

  if (!record) {
    if (error === "unauthorized") {
      logGuardRedirect("RequireCustomization", path, email, null, `/login?email=${encodeURIComponent(email)}`, "Registered user needs to login");
      return <Redirect to={`/login?email=${encodeURIComponent(email)}`} />;
    }
    logGuardRedirect("RequireCustomization", path, email, null, "/enrollment", "Enrollment record not found in database");
    return <Redirect to="/enrollment" />;
  }
  if (!record.password_created) {
    logGuardRedirect("RequireCustomization", path, email, record, "/set-password", "Password not created");
    return <Redirect to={`/set-password?email=${encodeURIComponent(email)}`} />;
  }
  if (!record.agreement_signed) {
    logGuardRedirect("RequireCustomization", path, email, record, "/onboarding/agreement", "Agreement not signed");
    return <Redirect to={`/onboarding/agreement?email=${encodeURIComponent(email)}`} />;
  }
  if (!record.game_selected) {
    logGuardRedirect("RequireCustomization", path, email, record, "/onboarding/game-selection", "Game not selected");
    return <Redirect to="/onboarding/game-selection" />;
  }

  if (record.customization_completed) {
    logGuardRedirect("RequireCustomization", path, email, record, "/onboarding/dashboard", "Customization already completed");
    return <Redirect to="/onboarding/dashboard" />;
  }

  logGuardRedirect("RequireCustomization", path, email, record, null, "Onboarding step Customization (Allow Render)");
  return <Component />;
}

// /onboarding/dashboard
function RequireDashboard({ component: Component }: { component: React.ComponentType }) {
  const { data, isLoading } = useOnboardingProgress();
  const record = data?.record;
  const error = data?.error;
  const email = getOnboardingEmail();
  const path = typeof window !== "undefined" ? window.location.pathname : "/onboarding/dashboard";

  console.log("[Route Guard: RequireDashboard]", {
    currentRoute: path,
    authenticatedUser: isLoggedIn(),
    stripePaymentStatus: record?.payment_status || "unknown",
    accountExists: !!record,
    passwordExists: record?.password_created ?? false,
    currentOnboardingStep: record?.onboarding_status || "unknown",
  });

  if (!isLoggedIn()) {
    logGuardRedirect("RequireDashboard", path, email, null, "/login", "User is not logged in");
    return <Redirect to="/login" />;
  }
  if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-sans text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading progress...</div>;

  if (!record) {
    if (error === "unauthorized") {
      logGuardRedirect("RequireDashboard", path, email, null, `/login?email=${encodeURIComponent(email)}`, "Registered user needs to login");
      return <Redirect to={`/login?email=${encodeURIComponent(email)}`} />;
    }
    logGuardRedirect("RequireDashboard", path, email, null, "/enrollment", "Enrollment record not found in database");
    return <Redirect to="/enrollment" />;
  }
  if (!record.password_created) {
    logGuardRedirect("RequireDashboard", path, email, record, "/set-password", "Password not created");
    return <Redirect to={`/set-password?email=${encodeURIComponent(email)}`} />;
  }
  if (!record.agreement_signed) {
    logGuardRedirect("RequireDashboard", path, email, record, "/onboarding/agreement", "Agreement not signed");
    return <Redirect to={`/onboarding/agreement?email=${encodeURIComponent(email)}`} />;
  }
  if (!record.game_selected) {
    logGuardRedirect("RequireDashboard", path, email, record, "/onboarding/game-selection", "Game not selected");
    return <Redirect to="/onboarding/game-selection" />;
  }
  if (!record.customization_completed) {
    logGuardRedirect("RequireDashboard", path, email, record, "/onboarding/customization", "Customization not completed");
    return <Redirect to="/onboarding/customization" />;
  }

  logGuardRedirect("RequireDashboard", path, email, record, null, "Onboarding completed, loading dashboard (Allow Render)");
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
          {/* Protected onboarding — ordered */}
          <Route path="/onboarding/agreement">
            {() => <RequireAgreement component={Agreement} />}
          </Route>
          <Route path="/onboarding/agreement/success">
            {() => {
              if (typeof window !== "undefined") {
                localStorage.setItem("appSquadAgreementSigned", "true");
                const params = new URLSearchParams(window.location.search);
                const emailFromUrl = params.get("email");
                const email = (emailFromUrl || localStorage.getItem("appSquadEnrollmentEmail") || "").trim().toLowerCase();
                if (email) {
                  fetch("/api/enrollment/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, fields: { agreement_signed: true, onboarding_status: "agreement_signed" } })
                  }).then(() => {
                    (window.top ?? window).location.href = `/set-password?email=${encodeURIComponent(email)}`;
                  }).catch(() => {
                    (window.top ?? window).location.href = `/set-password?email=${encodeURIComponent(email)}`;
                  });
                } else {
                  (window.top ?? window).location.href = "/set-password";
                }
              }
              return <div>Redirecting...</div>;
            }}
          </Route>
          <Route path="/onboarding/game-selection">
            {() => <RequireGameSelection component={GameSelection} />}
          </Route>
          <Route path="/onboarding/customization">
            {() => <RequireCustomization component={Customize} />}
          </Route>
          <Route path="/onboarding/dashboard">
            {() => <RequireDashboard component={Dashboard} />}
          </Route>
          {/* Post-payment account setup */}
          <Route path="/set-password">
            {() => <RequireSetPassword component={SetPassword} />}
          </Route>
          {/* Staff login */}
          <Route path="/login">
            {() => <RequireLogin component={StaffLogin} />}
          </Route>
          {/* Admin */}
          <Route path="/admin" component={AdminLogin} />
          <Route path="/admin/projects" component={AdminProjects} />
          <Route path="/admin/projects/:id">
            {(params) => <AdminProjectDetail id={params.id} />}
          </Route>
          <Route path="/admin/users" component={AdminUsers} />
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
