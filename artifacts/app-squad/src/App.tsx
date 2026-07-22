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
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const sessionId = params ? params.get("session_id") || "" : "";

  return useQuery({
    // IMPORTANT: session_id is part of the cache key. Without it, returning
    // from Stripe with a fresh ?session_id=... on /onboarding/agreement can
    // be served a STALE cached result from an earlier, session_id-less visit
    // to this same email's progress (e.g. an earlier bounce to /login before
    // payment). That stale "unauthorized/no record" reading — not a fresh,
    // Stripe-verified one — is what was skipping the agreement step and
    // sending customers straight to /login right after payment.
    queryKey: ["onboardingProgress", email, sessionId],
    queryFn: async () => {
      if (!email) return { record: null };
      console.info("[useOnboardingProgress] fetching fresh progress", { email, sessionIdPresent: !!sessionId });
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

function getEffectiveRecord(data: any, email: string) {
  if (data?.record) return data.record;
  const activeEmail = (email || localStorage.getItem("appSquadUserEmail") || localStorage.getItem("appSquadEnrollmentEmail") || "").trim().toLowerCase();
  const userLoggedIn = isLoggedIn();

  if (activeEmail || userLoggedIn) {
    const targetEmail = activeEmail || email;
    const storedUserEmail = (localStorage.getItem("appSquadUserEmail") || localStorage.getItem("appSquadEnrollmentEmail") || "").trim().toLowerCase();
    const isSameEmail = !storedUserEmail || storedUserEmail === targetEmail;

    return {
      email: targetEmail,
      full_name: isSameEmail ? (localStorage.getItem("appSquadEnrollmentName") || "Valued Client") : "Valued Client",
      payment_status: "paid",
      selected_package: isSameEmail ? (localStorage.getItem("appSquadSelectedPlan") || "essentials") : "essentials",
      onboarding_status: isSameEmail ? (localStorage.getItem("appSquadOnboardingStatus") || "enrolled") : "enrolled",
      agreement_signed: isSameEmail ? (localStorage.getItem("appSquadAgreementSigned") === "true") : false,
      password_created: userLoggedIn ? true : (isSameEmail ? (localStorage.getItem("appSquadPasswordCreated") === "true") : false),
      game_selected: isSameEmail ? (localStorage.getItem("appSquadGameSelected") === "true") : false,
      customization_completed: isSameEmail ? (localStorage.getItem("appSquadCustomizationCompleted") === "true") : false,
    };
  }
  return null;
}

// /onboarding/agreement
function RequireAgreement({ component: Component }: { component: React.ComponentType }) {
  const { data, isLoading } = useOnboardingProgress();
  const email = getOnboardingEmail();
  const record = getEffectiveRecord(data, email);
  const error = data?.error;
  const path = typeof window !== "undefined" ? window.location.pathname : "/onboarding/agreement";

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const sessionId = params ? params.get("session_id") || "" : "";

  const decision = !email
    ? "Redirect to /login (Missing email)"
    : !record
    ? "Redirect to /login"
    : record.agreement_signed
    ? (!record.password_created ? "Redirect to /set-password (Agreement already signed)" : (!isLoggedIn() ? "Redirect to /login" : (!record.game_selected ? "Redirect to /onboarding/game-selection" : (!record.customization_completed ? "Redirect to /onboarding/customization" : "Redirect to /onboarding/dashboard"))))
    : "Allow Render Agreement Page (User must sign agreement)";

  console.log("[Route Guard: RequireAgreement] Redirect decision:", {
    currentRoute: path,
    email,
    authenticatedUser: isLoggedIn(),
    paymentStatus: record?.payment_status || "unknown",
    agreementSigned: record?.agreement_signed ?? false,
    passwordCreated: record?.password_created ?? false,
    sessionIdPresent: !!sessionId,
    decision,
  });

  if (!email && !isLoggedIn()) {
    logGuardRedirect("RequireAgreement", path, email, null, "/login", "Email is missing & user not logged in");
    return <Redirect to="/login" />;
  }
  if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-sans text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading progress...</div>;

  if (!record) {
    logGuardRedirect("RequireAgreement", path, email, null, "/login", "Enrollment record not found — redirecting to /login");
    return <Redirect to="/login" />;
  }

  // Flow order: Stripe Payment → Zoho Sign Agreement (Required) → Set Password → Login → Game Selection
  if (record.agreement_signed) {
    if (!record.password_created) {
      logGuardRedirect("RequireAgreement", path, email, record, `/set-password?email=${encodeURIComponent(email)}`, "Agreement signed, redirecting to set-password");
      return <Redirect to={`/set-password?email=${encodeURIComponent(email)}`} />;
    }
    if (!isLoggedIn()) {
      logGuardRedirect("RequireAgreement", path, email, record, `/login?email=${encodeURIComponent(email)}`, "Password created, redirecting to login");
      return <Redirect to={`/login?email=${encodeURIComponent(email)}`} />;
    }
    if (!record.game_selected) {
      logGuardRedirect("RequireAgreement", path, email, record, "/onboarding/game-selection", "Agreement signed, redirecting to game-selection");
      return <Redirect to="/onboarding/game-selection" />;
    }
    if (!record.customization_completed) {
      logGuardRedirect("RequireAgreement", path, email, record, "/onboarding/customization", "Game selected, redirecting to customization");
      return <Redirect to="/onboarding/customization" />;
    }
    logGuardRedirect("RequireAgreement", path, email, record, "/onboarding/dashboard", "Onboarding completed, redirecting to dashboard");
    return <Redirect to="/onboarding/dashboard" />;
  }

  logGuardRedirect("RequireAgreement", path, email, record, null, "Agreement not signed yet — rendering Zoho Sign Agreement page");
  return <Component />;
}

// /set-password
function RequireSetPassword({ component: Component }: { component: React.ComponentType }) {
  const { data, isLoading } = useOnboardingProgress();
  const email = getOnboardingEmail();
  const record = getEffectiveRecord(data, email);
  const error = data?.error;
  const path = typeof window !== "undefined" ? window.location.pathname : "/set-password";

  const decision = !email && !isLoggedIn()
    ? "Redirect to /login (Missing email)"
    : !record
    ? "Redirect to /login"
    : !record.agreement_signed
    ? "Redirect to /onboarding/agreement (Agreement NOT signed yet)"
    : record.password_created
    ? (!isLoggedIn() ? "Redirect to /login (Password created, user not logged in)" : (!record.game_selected ? "Redirect to /onboarding/game-selection" : (!record.customization_completed ? "Redirect to /onboarding/customization" : "Redirect to /onboarding/dashboard")))
    : "Allow Render Set Password Page";

  console.log("[Route Guard: RequireSetPassword] Redirect decision:", {
    currentRoute: path,
    email,
    authenticatedUser: isLoggedIn(),
    paymentStatus: record?.payment_status || "unknown",
    agreementSigned: record?.agreement_signed ?? false,
    passwordCreated: record?.password_created ?? false,
    decision,
  });

  if (!email && !isLoggedIn()) {
    logGuardRedirect("RequireSetPassword", path, email, null, "/login", "Email is missing — redirecting to /login");
    return <Redirect to="/login" />;
  }
  if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-sans text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading progress...</div>;

  if (!record) {
    logGuardRedirect("RequireSetPassword", path, email, null, "/login", "Enrollment record not found — redirecting to /login");
    return <Redirect to="/login" />;
  }

  // Set Password is ONLY accessible after Zoho Sign agreement has been successfully completed
  if (!record.agreement_signed) {
    logGuardRedirect("RequireSetPassword", path, email, record, `/onboarding/agreement?email=${encodeURIComponent(email)}`, "Agreement not signed yet — redirecting to /onboarding/agreement");
    return <Redirect to={`/onboarding/agreement?email=${encodeURIComponent(email)}`} />;
  }

  if (record.password_created) {
    if (!isLoggedIn()) {
      logGuardRedirect("RequireSetPassword", path, email, record, `/login?email=${encodeURIComponent(email)}`, "Password already created, redirecting to /login");
      return <Redirect to={`/login?email=${encodeURIComponent(email)}`} />;
    }
    if (!record.game_selected) {
      logGuardRedirect("RequireSetPassword", path, email, record, "/onboarding/game-selection", "Password created & logged in, redirecting to game-selection");
      return <Redirect to="/onboarding/game-selection" />;
    }
    if (!record.customization_completed) {
      logGuardRedirect("RequireSetPassword", path, email, record, "/onboarding/customization", "Password created & logged in, redirecting to customization");
      return <Redirect to="/onboarding/customization" />;
    }
    logGuardRedirect("RequireSetPassword", path, email, record, "/onboarding/dashboard", "Password created, logged in, onboarding complete");
    return <Redirect to="/onboarding/dashboard" />;
  }

  logGuardRedirect("RequireSetPassword", path, email, record, null, "Agreement signed, rendering Set Password page");
  return <Component />;
}

// /login
function RequireLogin({ component: Component }: { component: React.ComponentType }) {
  const { data, isLoading } = useOnboardingProgress();
  const email = getOnboardingEmail();
  const record = getEffectiveRecord(data, email);
  const path = typeof window !== "undefined" ? window.location.pathname : "/login";

  const decision = isLoggedIn()
    ? (record
      ? (!record.agreement_signed ? "Redirect to /onboarding/agreement" : (!record.password_created ? "Redirect to /set-password" : (!record.game_selected ? "Redirect to /onboarding/game-selection" : (!record.customization_completed ? "Redirect to /onboarding/customization" : "Redirect to /onboarding/dashboard"))))
      : "Logged in without record")
    : (record
      ? (!record.agreement_signed ? "Redirect to /onboarding/agreement" : (!record.password_created ? "Redirect to /set-password" : "Allow Render Login Page"))
      : "Allow Render Login Page");

  console.log("[Route Guard: RequireLogin] Redirect decision:", {
    currentRoute: path,
    email,
    authenticatedUser: isLoggedIn(),
    paymentStatus: record?.payment_status || "unknown",
    agreementSigned: record?.agreement_signed ?? false,
    passwordCreated: record?.password_created ?? false,
    decision,
  });

  if (isLoggedIn()) {
    if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-sans text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading progress...</div>;
    if (record) {
      if (!record.agreement_signed) {
        logGuardRedirect("RequireLogin", path, email, record, `/onboarding/agreement?email=${encodeURIComponent(email)}`, "User logged in but agreement not signed");
        return <Redirect to={`/onboarding/agreement?email=${encodeURIComponent(email)}`} />;
      }
      if (!record.password_created) {
        logGuardRedirect("RequireLogin", path, email, record, `/set-password?email=${encodeURIComponent(email)}`, "User logged in but password not created");
        return <Redirect to={`/set-password?email=${encodeURIComponent(email)}`} />;
      }
      if (!record.game_selected) {
        logGuardRedirect("RequireLogin", path, email, record, "/onboarding/game-selection", "User logged in, redirecting to game-selection");
        return <Redirect to="/onboarding/game-selection" />;
      }
      if (!record.customization_completed) {
        logGuardRedirect("RequireLogin", path, email, record, "/onboarding/customization", "User logged in, redirecting to customization");
        return <Redirect to="/onboarding/customization" />;
      }
      logGuardRedirect("RequireLogin", path, email, record, "/onboarding/dashboard", "Onboarding completed, redirecting to dashboard");
      return <Redirect to="/onboarding/dashboard" />;
    }
  }

  // Login page is only accessible after password has been created
  if (record) {
    if (!record.agreement_signed) {
      logGuardRedirect("RequireLogin", path, email, record, `/onboarding/agreement?email=${encodeURIComponent(email)}`, "Agreement not signed yet");
      return <Redirect to={`/onboarding/agreement?email=${encodeURIComponent(email)}`} />;
    }
    if (!record.password_created) {
      logGuardRedirect("RequireLogin", path, email, record, `/set-password?email=${encodeURIComponent(email)}`, "Password not created yet");
      return <Redirect to={`/set-password?email=${encodeURIComponent(email)}`} />;
    }
  }

  logGuardRedirect("RequireLogin", path, email, record, null, "Password created, rendering Login page");
  return <Component />;
}

// /onboarding/game-selection
function RequireGameSelection({ component: Component }: { component: React.ComponentType }) {
  const { data, isLoading } = useOnboardingProgress();
  const email = getOnboardingEmail();
  const record = getEffectiveRecord(data, email);
  const error = data?.error;
  const path = typeof window !== "undefined" ? window.location.pathname : "/onboarding/game-selection";

  const decision = !isLoggedIn()
    ? "Redirect to /login (User must be logged in)"
    : !record
    ? "Redirect to /login"
    : !record.agreement_signed
    ? "Redirect to /onboarding/agreement"
    : !record.password_created
    ? "Redirect to /set-password"
    : record.game_selected
    ? (!record.customization_completed ? "Redirect to /onboarding/customization" : "Redirect to /onboarding/dashboard")
    : "Allow Render Game Selection Page";

  console.log("[Route Guard: RequireGameSelection] Redirect decision:", {
    currentRoute: path,
    email,
    authenticatedUser: isLoggedIn(),
    paymentStatus: record?.payment_status || "unknown",
    agreementSigned: record?.agreement_signed ?? false,
    passwordCreated: record?.password_created ?? false,
    gameSelected: record?.game_selected ?? false,
    decision,
  });

  if (!isLoggedIn()) {
    logGuardRedirect("RequireGameSelection", path, email, null, "/login", "Game Selection requires login — redirecting to /login");
    return <Redirect to="/login" />;
  }
  if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-sans text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading progress...</div>;

  if (!record) {
    logGuardRedirect("RequireGameSelection", path, email, null, `/login?email=${encodeURIComponent(email)}`, "Record loading or unavailable — defaulting to /login");
    return <Redirect to={`/login?email=${encodeURIComponent(email)}`} />;
  }

  if (!record.agreement_signed) {
    logGuardRedirect("RequireGameSelection", path, email, record, `/onboarding/agreement?email=${encodeURIComponent(email)}`, "Agreement not signed yet");
    return <Redirect to={`/onboarding/agreement?email=${encodeURIComponent(email)}`} />;
  }
  if (!record.password_created) {
    logGuardRedirect("RequireGameSelection", path, email, record, `/set-password?email=${encodeURIComponent(email)}`, "Password not created yet");
    return <Redirect to={`/set-password?email=${encodeURIComponent(email)}`} />;
  }

  if (record.game_selected) {
    if (!record.customization_completed) {
      logGuardRedirect("RequireGameSelection", path, email, record, "/onboarding/customization", "Game already selected, redirecting to customization");
      return <Redirect to="/onboarding/customization" />;
    }
    logGuardRedirect("RequireGameSelection", path, email, record, "/onboarding/dashboard", "Onboarding completed, redirecting to dashboard");
    return <Redirect to="/onboarding/dashboard" />;
  }

  logGuardRedirect("RequireGameSelection", path, email, record, null, "Logged in & password created, rendering Game Selection page");
  return <Component />;
}

// /onboarding/customization
function RequireCustomization({ component: Component }: { component: React.ComponentType }) {
  const { data, isLoading } = useOnboardingProgress();
  const email = getOnboardingEmail();
  const record = getEffectiveRecord(data, email);
  const error = data?.error;
  const path = typeof window !== "undefined" ? window.location.pathname : "/onboarding/customization";

  const decision = !isLoggedIn()
    ? "Redirect to /login"
    : !record
    ? "Redirect to /login"
    : !record.agreement_signed
    ? "Redirect to /onboarding/agreement"
    : !record.password_created
    ? "Redirect to /set-password"
    : !record.game_selected
    ? "Redirect to /onboarding/game-selection"
    : record.customization_completed
    ? "Redirect to /onboarding/dashboard"
    : "Allow Render Customization Page";

  console.log("[Route Guard: RequireCustomization] Redirect decision:", {
    currentRoute: path,
    email,
    authenticatedUser: isLoggedIn(),
    paymentStatus: record?.payment_status || "unknown",
    agreementSigned: record?.agreement_signed ?? false,
    passwordCreated: record?.password_created ?? false,
    gameSelected: record?.game_selected ?? false,
    customizationCompleted: record?.customization_completed ?? false,
    decision,
  });

  if (!isLoggedIn()) {
    logGuardRedirect("RequireCustomization", path, email, null, "/login", "Customization requires login — redirecting to /login");
    return <Redirect to="/login" />;
  }
  if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-sans text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading progress...</div>;

  if (!record) {
    logGuardRedirect("RequireCustomization", path, email, null, `/login?email=${encodeURIComponent(email)}`, "Record loading or unavailable — defaulting to /login");
    return <Redirect to={`/login?email=${encodeURIComponent(email)}`} />;
  }
  if (!record.agreement_signed) {
    logGuardRedirect("RequireCustomization", path, email, record, `/onboarding/agreement?email=${encodeURIComponent(email)}`, "Agreement not signed yet");
    return <Redirect to={`/onboarding/agreement?email=${encodeURIComponent(email)}`} />;
  }
  if (!record.password_created) {
    logGuardRedirect("RequireCustomization", path, email, record, `/set-password?email=${encodeURIComponent(email)}`, "Password not created yet");
    return <Redirect to={`/set-password?email=${encodeURIComponent(email)}`} />;
  }
  if (!record.game_selected) {
    logGuardRedirect("RequireCustomization", path, email, record, "/onboarding/game-selection", "Game not selected yet");
    return <Redirect to="/onboarding/game-selection" />;
  }

  if (record.customization_completed) {
    logGuardRedirect("RequireCustomization", path, email, record, "/onboarding/dashboard", "Customization completed, redirecting to dashboard");
    return <Redirect to="/onboarding/dashboard" />;
  }

  logGuardRedirect("RequireCustomization", path, email, record, null, "Game selected, rendering Customization page");
  return <Component />;
}

// /onboarding/dashboard
function RequireDashboard({ component: Component }: { component: React.ComponentType }) {
  const { data, isLoading } = useOnboardingProgress();
  const email = getOnboardingEmail();
  const record = getEffectiveRecord(data, email);
  const error = data?.error;
  const path = typeof window !== "undefined" ? window.location.pathname : "/onboarding/dashboard";

  const decision = !isLoggedIn()
    ? "Redirect to /login"
    : !record
    ? "Redirect to /login"
    : !record.agreement_signed
    ? "Redirect to /onboarding/agreement"
    : !record.password_created
    ? "Redirect to /set-password"
    : !record.game_selected
    ? "Redirect to /onboarding/game-selection"
    : !record.customization_completed
    ? "Redirect to /onboarding/customization"
    : "Allow Render Dashboard";

  console.log("[Route Guard: RequireDashboard] Redirect decision:", {
    currentRoute: path,
    email,
    authenticatedUser: isLoggedIn(),
    paymentStatus: record?.payment_status || "unknown",
    agreementSigned: record?.agreement_signed ?? false,
    passwordCreated: record?.password_created ?? false,
    gameSelected: record?.game_selected ?? false,
    customizationCompleted: record?.customization_completed ?? false,
    decision,
  });

  if (!isLoggedIn()) {
    logGuardRedirect("RequireDashboard", path, email, null, "/login", "Dashboard requires login — redirecting to /login");
    return <Redirect to="/login" />;
  }
  if (isLoading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white font-sans text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading progress...</div>;

  if (!record) {
    logGuardRedirect("RequireDashboard", path, email, null, `/login?email=${encodeURIComponent(email)}`, "Record loading or unavailable — defaulting to /login");
    return <Redirect to={`/login?email=${encodeURIComponent(email)}`} />;
  }
  if (!record.agreement_signed) {
    logGuardRedirect("RequireDashboard", path, email, record, `/onboarding/agreement?email=${encodeURIComponent(email)}`, "Agreement not signed yet");
    return <Redirect to={`/onboarding/agreement?email=${encodeURIComponent(email)}`} />;
  }
  if (!record.password_created) {
    logGuardRedirect("RequireDashboard", path, email, record, `/set-password?email=${encodeURIComponent(email)}`, "Password not created yet");
    return <Redirect to={`/set-password?email=${encodeURIComponent(email)}`} />;
  }
  if (!record.game_selected) {
    logGuardRedirect("RequireDashboard", path, email, record, "/onboarding/game-selection", "Game not selected yet");
    return <Redirect to="/onboarding/game-selection" />;
  }
  if (!record.customization_completed) {
    logGuardRedirect("RequireDashboard", path, email, record, "/onboarding/customization", "Customization not completed yet");
    return <Redirect to="/onboarding/customization" />;
  }

  logGuardRedirect("RequireDashboard", path, email, record, null, "All onboarding steps completed, rendering Dashboard");
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
