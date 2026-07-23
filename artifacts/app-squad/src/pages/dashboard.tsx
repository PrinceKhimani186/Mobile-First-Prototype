import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Gamepad2, Palette,
  Store, Rocket, Layers, TestTube2, LifeBuoy, User,
  Eye, PhoneCall, Wand2, ClipboardEdit, ArrowRight, Send,
  X, AlertTriangle, CheckSquare, Square, Upload, ShieldCheck, Check,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateProjectStatusInCRM } from "@/lib/crm";

const CALENDLY_URL = "https://calendly.com/appguyofficial/30min";

// ─── CRM integration functions ───────────────────────────────────────────────
async function sendRevisionRequestToCRM(payload: Record<string, unknown>) {
  try {
    await fetch("/api/ghl/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        appName: payload.appName,
        tags: ["revision-requested"],
      }),
    });
  } catch (err) {
    console.error("sendRevisionRequestToCRM error:", err);
  }
}
async function sendDemoApprovalToCRM(payload: Record<string, unknown>) {
  try {
    await fetch("/api/ghl/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        appName: payload.appName,
        tags: ["demo-approved"],
      }),
    });
  } catch (err) {
    console.error("sendDemoApprovalToCRM error:", err);
  }
}
async function sendFinalApprovalToCRM(payload: Record<string, unknown>) {
  try {
    await fetch("/api/ghl/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        appName: payload.appName,
        tags: ["final-approved"],
      }),
    });
  } catch (err) {
    console.error("sendFinalApprovalToCRM error:", err);
  }
}
async function sendPublishingRequirementsToCRM(payload: Record<string, unknown>) {
  try {
    await fetch("/api/ghl/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.publishContactEmail || payload.email,
        appName: payload.appName,
        tags: ["publishing-requirements-submitted"],
      }),
    });
  } catch (err) {
    console.error("sendPublishingRequirementsToCRM error:", err);
  }
}

// ─── Stage order ──────────────────────────────────────────────────────────────
const STAGE_ORDER = [
  "Project Received",
  "Brand Review",
  "Customization Review",
  "Development",
  "Testing",
  "Demo Ready For Review",
  "Revision Window",
  "Final Approval",
  "Publishing Requirements",
  "Store Submission",
  "App Launch",
] as const;
type ProjectStage = typeof STAGE_ORDER[number];

const REVIEW_STAGES = [
  "Brand Review",
  "Customization Review",
  "Demo Ready For Review",
  "Final Approval",
  "Publishing Requirements"
];

const STAGE_PCT: Record<ProjectStage, number> = {
  "Project Received": 10,
  "Brand Review": 20,
  "Customization Review": 30,
  "Development": 50,
  "Testing": 65,
  "Demo Ready For Review": 75,
  "Revision Window": 85,
  "Final Approval": 90,
  "Publishing Requirements": 95,
  "Store Submission": 98,
  "App Launch": 100,
};

const STAGE_ICONS: Record<ProjectStage, React.ElementType> = {
  "Project Received": CheckCircle2,
  "Brand Review": Palette,
  "Customization Review": Wand2,
  "Development": Layers,
  "Testing": TestTube2,
  "Demo Ready For Review": Eye,
  "Revision Window": ClipboardEdit,
  "Final Approval": ShieldCheck,
  "Publishing Requirements": Upload,
  "Store Submission": Store,
  "App Launch": Rocket,
};

// ─── Revision data ────────────────────────────────────────────────────────────
interface RevisionData {
  revisionType: string[];
  revisionDetails: string;
  specificAreas: string;
  priorityLevel: string;
  submittedAt: string;
  clientName: string;
  appName: string;
}

// ─── Publishing data ──────────────────────────────────────────────────────────
interface PublishingData {
  publishApple: string;
  appleAccountCreated: string;
  appleEmail: string;
  publishGoogle: string;
  googleAccountCreated: string;
  googleEmail: string;
  publishContactName: string;
  publishContactEmail: string;
  publishNotes: string;
  submittedAt: string;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
      <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 6 }}>{label}</p>
      <p style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2, color: "hsl(220 20% 90%)" }}>{value || "—"}</p>
      {sub && <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 40%)", marginTop: 3, fontWeight: 300 }}>{sub}</p>}
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ open, headline, body, confirmLabel, onConfirm, onCancel }: {
  open: boolean;
  headline: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(5,5,7,0.82)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18 }}
            style={{
              background: "hsl(226 32% 9%)", border: "1px solid hsl(224 22% 16%)",
              borderRadius: 18, padding: 28, maxWidth: 440, width: "100%",
              position: "relative",
            }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onCancel} style={{
              position: "absolute", top: 14, right: 14,
              background: "transparent", border: "none", cursor: "pointer",
              color: "hsl(218 16% 36%)", padding: 4,
            }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <AlertTriangle style={{ width: 18, height: 18, color: "hsl(38 95% 54%)", flexShrink: 0 }} />
              <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "hsl(220 20% 92%)" }}>
                {headline}
              </h3>
            </div>
            <p style={{ fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.65, color: "hsl(218 16% 50%)", fontWeight: 300, marginBottom: 22 }}>
              {body}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={onCancel} style={{
                padding: "9px 18px", borderRadius: 9, background: "transparent",
                border: "1px solid hsl(224 22% 18%)", fontFamily: "'Inter'",
                fontSize: 13, fontWeight: 400, color: "hsl(218 16% 44%)", cursor: "pointer",
              }}>
                Cancel
              </button>
              <button onClick={onConfirm} style={{
                padding: "9px 20px", borderRadius: 9, border: "none",
                background: "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)",
                fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600,
                color: "#050505", cursor: "pointer", boxShadow: "0 0 20px rgba(245,158,11,0.2)",
              }}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Input / Textarea shared styles ──────────────────────────────────────────
const inputSx: React.CSSProperties = {
  width: "100%", borderRadius: 10, padding: "11px 13px",
  fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.5,
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
  color: "rgba(255,255,255,0.8)", outline: "none", boxSizing: "border-box",
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  // Client info
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [gameSelection, setGameSelection] = useState<{ selectedGameType: string; gameCategory: string; templateName: string } | null>(null);
  const [customization, setCustomization] = useState<{ appName: string; tagline?: string; monetization?: string } | null>(null);

  // Authoritative per-email record from customer_enrollment (Supabase) — this is
  // the single source of truth for the logged-in client's own data. It always
  // wins over local funnel blobs, which can belong to a different client on a
  // shared browser.
  const [enrollmentRecord, setEnrollmentRecord] = useState<{
    full_name?: string;
    email?: string;
    phone?: string;
    selected_package?: string;
    payment_type?: string;
    game_type?: string;
    app_name?: string;
    tagline?: string;
    monetization?: string;
    source?: string;
  } | null>(null);
  
  // Custom agreement PDF
  const [agreementPdfUrl, setAgreementPdfUrl] = useState("");
  const [agreementSignedAt, setAgreementSignedAt] = useState("");

  // Project stage
  const [projectStage, setProjectStage] = useState<ProjectStage>("Project Received");

  // ClickUp live data
  const [clickupData, setClickupData] = useState<{
    currentStage?: string;
    progressPct?: number;
    completedCount?: number;
    totalStages?: number;
    clientName?: string;
    appName?: string;
    gameType?: string;
    tagline?: string;
    monetization?: string;
    _items?: Array<{ id: string; name: string; status: string }>;
  } | null>(null);
  const [clickupLoading, setClickupLoading] = useState(false);

  // Project progress from /api/project-progress (count-based, replaces weighted STAGE_PCT)
  const [projectProgress, setProjectProgress] = useState<{
    completedStages: number;
    totalStages: number;
    percentage: number;
    stages: Array<{ name: string; status: "Complete" | "In Progress" | "Pending" | "Client Review Required" }>;
  } | null>(null);

  // Admin detection — true only when logged in via admin password (as_admin_auth key),
  // demo client accounts use appSquadDemoAccount and never set as_admin_auth.
  const [isAdmin] = useState(() => localStorage.getItem("as_admin_auth") === "true");
  const [updatingStage, setUpdatingStage] = useState<string | null>(null);
  const [approvingDemo, setApprovingDemo] = useState(false);
  const { toast } = useToast();

  const [projectId, setProjectId] = useState("");
  const [approvalsHistory, setApprovalsHistory] = useState<any[]>([]);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingApproval, setSubmittingApproval] = useState<string | null>(null);
  const [showApprovalConfirm, setShowApprovalConfirm] = useState<{ open: boolean; milestoneName: string } | null>(null);

  const fetchApprovalsHistory = useCallback((projId: string) => {
    if (!projId) return;
    fetch(`/api/projects/${projId}/approvals`, { cache: "no-store" })
      .then(r => r.ok ? r.json() : [])
      .then((data) => setApprovalsHistory(data))
      .catch(console.error);
  }, []);

  const handleApproveMilestone = async (milestoneName: string) => {
    const targetProjectId = projectId || (enrollmentRecord as any)?.id || `AS-${(email || "client").split("@")[0]}`;

    setSubmittingApproval(milestoneName);
    try {
      const res = await fetch(`/api/projects/${targetProjectId}/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneName,
          action: "approve",
          comment: reviewComment,
          clientName: clientName || "Client",
          email: email || localStorage.getItem("as_client_email") || "",
        }),
      });

      const text = await res.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch { /* non-JSON HTML error */ }
      if (!res.ok) throw new Error(json.error ?? `Server returned ${res.status}`);

      toast({
        title: "Milestone approved",
        description: `Successfully approved "${milestoneName}".`,
      });
      setReviewComment("");
      fetchApprovalsHistory(targetProjectId);
      refreshClickupData(email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: "Approval failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmittingApproval(null);
    }
  };

  const handleRequestRevision = async (milestoneName: string) => {
    if (!reviewComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please describe the revisions you want to request.",
        variant: "destructive",
      });
      return;
    }

    const targetProjectId = projectId || (enrollmentRecord as any)?.id || `AS-${(email || "client").split("@")[0]}`;

    setSubmittingApproval(milestoneName);
    try {
      const res = await fetch(`/api/projects/${targetProjectId}/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneName,
          action: "revision",
          comment: reviewComment,
          clientName: clientName || "Client",
          email: email || localStorage.getItem("as_client_email") || "",
        }),
      });

      const text = await res.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch { /* non-JSON HTML error */ }
      if (!res.ok) throw new Error(json.error ?? `Server returned ${res.status}`);

      toast({
        title: "Revisions requested",
        description: `Successfully requested revisions for "${milestoneName}".`,
      });
      setReviewComment("");
      fetchApprovalsHistory(targetProjectId);
      refreshClickupData(email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: "Request failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmittingApproval(null);
    }
  };

  // Shared refetch helper — called after any ClickUp mutation
  const refreshClickupData = useCallback((emailParam: string) => {
    if (projectId) {
      fetchApprovalsHistory(projectId);
    }

    fetch("/api/project-progress", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then((d: { completedStages: number; totalStages: number; percentage: number; stages: Array<{ name: string; status: "Complete" | "In Progress" | "Pending" | "Client Review Required" }> } | null) => {
        if (d?.stages) setProjectProgress(d);
      })
      .catch(console.error);

    fetch(
      `/api/clickup/project${emailParam ? `?email=${encodeURIComponent(emailParam.toLowerCase())}` : ""}`,
      { cache: "no-store" }
    )
      .then(r => r.ok ? r.json() : null)
      .then((d: { ok?: boolean; fallback?: boolean; currentStage?: string; progressPct?: number; completedCount?: number; totalStages?: number; clientName?: string; appName?: string; gameType?: string; tagline?: string; monetization?: string; _items?: Array<{ id: string; name: string; status: string }> } | null) => {
        if (d?.ok && !d.fallback) {
          setClickupData(d);
          if (d.currentStage && STAGE_ORDER.includes(d.currentStage as ProjectStage)) {
            setProjectStage(d.currentStage as ProjectStage);
            localStorage.setItem("as_project_stage", d.currentStage);
          }
        }
      })
      .catch(console.error);
  }, [projectId, fetchApprovalsHistory]);

  // Update a stage status in ClickUp (admin only — sequential, with next-stage activation)
  const updateStageStatus = useCallback(async (stageName: string) => {
    setUpdatingStage(stageName);
    try {
      const res = await fetch("/api/update-stage-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ stageName, status: "Complete" }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "ClickUp update failed");

      toast({
        title: "Stage updated successfully.",
        description: `${stageName} marked as Complete in ClickUp.`,
      });
      refreshClickupData(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("updateStageStatus error:", message);
      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setUpdatingStage(null);
    }
  }, [email, toast, refreshClickupData]);

  // Approve Demo — client action that marks Demo Ready For Review Done and activates Revision Window
  const approveDemo = useCallback(async () => {
    setApprovingDemo(true);
    try {
      const res = await fetch("/api/approve-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ stageName: "Demo Ready For Review" }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Approval failed");

      // Send to GHL CRM
      sendDemoApprovalToCRM({ email, appName: customization?.appName ?? "" });

      toast({
        title: "Demo approved successfully.",
        description: "Your demo has been approved. Revision Window is now active.",
      });
      refreshClickupData(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("approveDemo error:", message);
      toast({ title: "Approval failed", description: message, variant: "destructive" });
    } finally {
      setApprovingDemo(false);
    }
  }, [email, toast, refreshClickupData, customization]);

  // Modals
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);

  // Revision form
  const [revisionFormOpen, setRevisionFormOpen] = useState(false);
  const [revisionData, setRevisionData] = useState<RevisionData | null>(null);
  const [revType, setRevType] = useState<string[]>([]);
  const [revDetails, setRevDetails] = useState("");
  const [revAreas, setRevAreas] = useState("");
  const [revPriority, setRevPriority] = useState("Normal");
  const [revAgreed, setRevAgreed] = useState(false);

  // Publishing form
  const [publishingFormOpen, setPublishingFormOpen] = useState(false);
  const [publishingData, setPublishingData] = useState<PublishingData | null>(null);
  const [pubApple, setPubApple] = useState("Yes");
  const [pubAppleCreated, setPubAppleCreated] = useState("Yes");
  const [pubAppleEmail, setPubAppleEmail] = useState("");
  const [pubGoogle, setPubGoogle] = useState("Yes");
  const [pubGoogleCreated, setPubGoogleCreated] = useState("Yes");
  const [pubGoogleEmail, setPubGoogleEmail] = useState("");
  const [pubContactName, setPubContactName] = useState("");
  const [pubContactEmail, setPubContactEmail] = useState("");
  const [pubNotes, setPubNotes] = useState("");

  useEffect(() => {
    const lead = JSON.parse(localStorage.getItem("as_lead") || "{}");
    const application = JSON.parse(localStorage.getItem("as_application") || "{}");
    const game = JSON.parse(localStorage.getItem("as_game_selection") || "null");
    const custom = JSON.parse(localStorage.getItem("as_customization") || "null");
    const src = localStorage.getItem("as_source") || "Direct";
    const savedRevision = localStorage.getItem("as_revision_data");
    const savedPublishing = localStorage.getItem("as_publishing_data");

    // The authenticated session email (set at login / enrollment) is the ONLY source of
    // truth for "who is looking at this dashboard". The as_lead / as_application blobs
    // are written during the anonymous funnel and are NOT scoped per-user — on a shared
    // browser they can still hold a previous client's data. Never fall back to them for
    // the email used in DB queries. If there is no authenticated session, redirect to login.
    const authEmail = (
      localStorage.getItem("appSquadUserEmail") ||
      localStorage.getItem("appSquadEnrollmentEmail") ||
      ""
    ).trim().toLowerCase();

    if (!authEmail) {
      window.location.replace("/login");
      return;
    }

    const em = authEmail;

    // Don't pre-populate name/phone/game/customization from funnel blobs — the enrollment
    // record fetch below will populate everything from the database (the authoritative source).
    setEmail(em);
    setSource(src);

    // Always refetch the authoritative record from the database for the logged-in email.
    // This overrides any stale/foreign funnel data left in localStorage from a previous
    // client session on this browser (name, phone, package, game/app/customization, etc).
    {
      console.log("[Dashboard] Loading data for logged-in email:", em);
      fetch(`/api/enrollment/progress?email=${encodeURIComponent(em)}`)
        .then(r => {
          if (r.status === 403) {
            window.location.replace("/login");
            return null;
          }
          return r.ok ? r.json() : null;
        })
        .then((data: {
          record?: {
            full_name?: string;
            phone?: string;
            selected_package?: string;
            payment_type?: string;
            game_type?: string;
            app_name?: string;
            tagline?: string;
            monetization?: string;
            source?: string;
          } | null;
        } | null) => {
          const record = data?.record ?? null;
          console.log("[Dashboard] Enrollment record found:", !!record, record);
          setEnrollmentRecord(record ?? null);
          if (!record) return;

          // Populate display fields exclusively from the DB record — never from funnel blobs.
          if (record.full_name) setClientName(record.full_name);
          if (record.phone) setPhone(record.phone);
          if (record.source) setSource(record.source);
          if (record.game_type) {
            setGameSelection({ selectedGameType: record.game_type, gameCategory: "", templateName: record.game_type });
          }
          if (record.app_name || record.tagline || record.monetization) {
            setCustomization({
              appName: record.app_name ?? "",
              tagline: record.tagline,
              monetization: record.monetization,
            });
          }
        })
        .catch(() => { /* non-fatal */ });

      // Always fetch onboarding status to pick up game selection persisted to the DB
      fetch(`/api/auth/onboarding-status?email=${encodeURIComponent(em)}`)
        .then(r => {
          if (r.status === 403) {
            window.location.replace("/login");
            return null;
          }
          return r.ok ? r.json() : null;
        })
        .then((data: { status?: { selected_game?: string } | null } | null) => {
          const selectedGame = data?.status?.selected_game;
          if (selectedGame) {
            setGameSelection(prev => prev ?? { selectedGameType: selectedGame, gameCategory: "", templateName: selectedGame });
          }
        })
        .catch(() => { /* non-fatal */ });

      fetch(`/api/enrollment/agreement-status?email=${encodeURIComponent(em)}`)
        .then(r => {
          if (r.status === 403) {
            window.location.replace("/login");
            return null;
          }
          return r.ok ? r.json() : null;
        })
        .then((data: { signed?: boolean; pdfUrl?: string; signedAt?: string } | null) => {
          if (data?.signed && data.pdfUrl) {
            setAgreementPdfUrl(data.pdfUrl);
            if (data.signedAt) {
              setAgreementSignedAt(new Date(data.signedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
            }
          } else {
            setAgreementPdfUrl("");
            setAgreementSignedAt("");
          }
        })
        .catch(console.error);
    }

    // ?stage= URL param lets admins preview any stage directly (persists to localStorage).
    const urlStage = new URLSearchParams(window.location.search).get("stage") as ProjectStage | null;
    const savedStage = localStorage.getItem("as_project_stage") as ProjectStage | null;

    if (urlStage && STAGE_ORDER.includes(urlStage)) {
      setProjectStage(urlStage);
      localStorage.setItem("as_project_stage", urlStage);
    } else if (savedStage && STAGE_ORDER.includes(savedStage)) {
      setProjectStage(savedStage);
    } else {
      // Default to Brand Review; server-side stage fetch below will override when available.
      setProjectStage("Brand Review");
    }

    // Fetch server-side stage (admin DB) — overrides localStorage.
    if (em) {
      fetch(`/api/projects/stage?email=${encodeURIComponent(em.toLowerCase())}`)
        .then(r => {
          if (r.status === 403) {
            window.location.replace("/login");
            return null;
          }
          return r.ok ? r.json() : null;
        })
        .then((data: { projectId?: string; currentStage?: string } | null) => {
          if (data?.projectId) {
            setProjectId(data.projectId);
            fetchApprovalsHistory(data.projectId);
          }
          if (data?.currentStage && STAGE_ORDER.includes(data.currentStage as ProjectStage)) {
            const serverStage = data.currentStage as ProjectStage;
            setProjectStage(serverStage);
            localStorage.setItem("as_project_stage", serverStage);
          }
        })
        .catch(() => { /* non-fatal */ });
    }

    // Fetch /api/project-progress — count-based completion percentage (no cache)
    function fetchProjectProgress() {
      fetch("/api/project-progress", { cache: "no-store" })
        .then(r => {
          if (!r.ok) { console.error("project-progress HTTP error:", r.status); return null; }
          return r.json();
        })
        .then((data: {
          completedStages: number; totalStages: number;
          percentage: number;
          stages: Array<{ name: string; status: "Complete" | "In Progress" | "Pending" }>;
        } | null) => {
          if (data?.stages) setProjectProgress(data);
        })
        .catch((err) => { console.error("project-progress fetch error:", err); });
    }

    fetchProjectProgress();

    // Fetch ClickUp live project data — highest-priority source of truth (no cache)
    function fetchClickupProject(emailParam: string) {
      setClickupLoading(true);
      fetch(
        `/api/clickup/project${emailParam ? `?email=${encodeURIComponent(emailParam.toLowerCase())}` : ""}`,
        { cache: "no-store" }
      )
        .then(r => {
          if (!r.ok) { console.error("clickup/project HTTP error:", r.status); return null; }
          return r.json();
        })
        .then((data: {
          ok?: boolean; fallback?: boolean;
          currentStage?: string; progressPct?: number;
          completedCount?: number; totalStages?: number;
          clientName?: string; appName?: string;
          gameType?: string; tagline?: string; monetization?: string;
          _items?: Array<{ id: string; name: string; status: string }>;
        } | null) => {
          if (data?.ok && !data.fallback) {
            setClickupData(data);
            if (data.currentStage && STAGE_ORDER.includes(data.currentStage as ProjectStage)) {
              const urlStageCheck = new URLSearchParams(window.location.search).get("stage");
              if (!urlStageCheck) {
                setProjectStage(data.currentStage as ProjectStage);
                localStorage.setItem("as_project_stage", data.currentStage);
              }
            }
          }
        })
        .catch((err) => { console.error("clickup/project fetch error:", err); })
        .finally(() => setClickupLoading(false));
    }

    fetchClickupProject(em);

    // Refresh ClickUp data every 5 minutes
    const clickupInterval = setInterval(() => fetchClickupProject(em), 5 * 60 * 1000);

    if (savedRevision) {
      try { setRevisionData(JSON.parse(savedRevision)); } catch { /* ignore */ }
    }
    if (savedPublishing) {
      try { setPublishingData(JSON.parse(savedPublishing)); } catch { /* ignore */ }
    }

    updateProjectStatusInCRM({
      clientName: "",
      email: em,
      stage: "intake_received",
      status: "dashboard_viewed",
      source: src,
    });

    return () => clearInterval(clickupInterval);
  }, [fetchApprovalsHistory]);

  function advanceTo(stage: ProjectStage) {
    setProjectStage(stage);
    localStorage.setItem("as_project_stage", stage);
  }

  // ── Approve Demo ──────────────────────────────────────────────────────────
  function confirmApproveDemo() {
    setShowDemoModal(false);
    approveDemo();
  }

  // ── Submit Revision Request ───────────────────────────────────────────────
  const [submittingRevision, setSubmittingRevision] = useState(false);

  const submitRevision = useCallback(async () => {
    if (!revDetails.trim() || !revAgreed || submittingRevision) return;
    setSubmittingRevision(true);

    const submittedAt = new Date().toISOString();
    const data: RevisionData = {
      revisionType: revType,
      revisionDetails: revDetails,
      specificAreas: revAreas,
      priorityLevel: revPriority,
      submittedAt,
      clientName,
      appName: customization?.appName ?? "",
    };

    try {
      const res = await fetch("/api/submit-revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          revisionTypes: revType,
          revisionDetails: revDetails,
          specificScreens: revAreas,
          priorityLevel: revPriority,
          clientName,
          submittedAt,
        }),
      });
      const result = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(result.error ?? "Failed to submit revision");

      // Store locally for display + send to CRM — do NOT advance the stage
      setRevisionData(data);
      localStorage.setItem("as_revision_data", JSON.stringify(data));
      setRevisionFormOpen(false);
      sendRevisionRequestToCRM({ ...data, email, phone });

      toast({
        title: "Revision request submitted.",
        description: "Your feedback has been sent to the team. Demo Ready For Review remains open.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("submitRevision error:", message);
      toast({ title: "Submission failed", description: message, variant: "destructive" });
    } finally {
      setSubmittingRevision(false);
    }
  }, [revType, revDetails, revAreas, revPriority, revAgreed, submittingRevision, clientName, customization, email, phone, toast]);

  // ── Approve For Publishing ────────────────────────────────────────────────
  const [approvingFinal, setApprovingFinal] = useState(false);

  const confirmFinalApproval = useCallback(async () => {
    setShowFinalModal(false);
    if (approvingFinal) return;
    setApprovingFinal(true);
    console.log("Approve For Publishing clicked");
    console.log("Updating ClickUp Final Approval");

    try {
      const res = await fetch("/api/approve-final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Unable to update ClickUp.");

      console.log("ClickUp update success");
      console.log("Publishing Requirements activated");

      const payload = { clientName, email, appName: customization?.appName ?? "", finalApprovedAt: new Date().toISOString() };
      sendFinalApprovalToCRM(payload);

      toast({
        title: "Final approval submitted successfully.",
        description: "Publishing Requirements is now active.",
      });

      refreshClickupData(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("confirmFinalApproval error:", message);
      toast({ title: "Unable to update ClickUp.", description: message, variant: "destructive" });
    } finally {
      setApprovingFinal(false);
    }
  }, [approvingFinal, clientName, email, customization, toast, refreshClickupData]);

  // ── Submit Publishing Requirements ────────────────────────────────────────
  const [submittingPublishing, setSubmittingPublishing] = useState(false);

  const submitPublishing = useCallback(async () => {
    if (submittingPublishing) return;
    setSubmittingPublishing(true);

    const submittedAt = new Date().toISOString();
    const data: PublishingData = {
      publishApple: pubApple,
      appleAccountCreated: pubAppleCreated,
      appleEmail: pubAppleEmail,
      publishGoogle: pubGoogle,
      googleAccountCreated: pubGoogleCreated,
      googleEmail: pubGoogleEmail,
      publishContactName: pubContactName || clientName,
      publishContactEmail: pubContactEmail || email,
      publishNotes: pubNotes,
      submittedAt,
    };

    setPublishingData(data);
    localStorage.setItem("as_publishing_data", JSON.stringify(data));
    setPublishingFormOpen(false);

    try {
      const res = await fetch("/api/publishing-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          email,
          clientName,
          phone,
          appName: customization?.appName ?? "",
          publishApple: pubApple,
          appleAccountCreated: pubAppleCreated,
          appleEmail: pubAppleEmail,
          publishGoogle: pubGoogle,
          googleAccountCreated: pubGoogleCreated,
          googleEmail: pubGoogleEmail,
          publishContactName: pubContactName || clientName,
          publishContactEmail: pubContactEmail || email,
          publishNotes: pubNotes,
          submittedAt,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Unable to save publishing requirements.");
      toast({ title: "Publishing requirements saved successfully." });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Unable to save publishing requirements.", description: message, variant: "destructive" });
    } finally {
      setSubmittingPublishing(false);
    }

    sendPublishingRequirementsToCRM({ ...data, clientName, email, phone });
    advanceTo("Store Submission");
  }, [submittingPublishing, pubApple, pubAppleCreated, pubAppleEmail, pubGoogle, pubGoogleCreated, pubGoogleEmail, pubContactName, pubContactEmail, pubNotes, clientName, email, phone, customization, toast]);

  // ── Timeline — driven by /api/project-progress stages when available,
  //    falling back to ClickUp _items, then local projectStage ─────────────────
  const progressStageMap = new Map(
    (projectProgress?.stages ?? []).map(s => [s.name, s.status])
  );
  const clickupItemMap = new Map(
    (clickupData?._items ?? []).map(item => [item.name, item.status])
  );
  const hasProgressData = progressStageMap.size > 0;
  const hasClickupItems  = clickupItemMap.size > 0;

  const currentIdx = STAGE_ORDER.indexOf(projectStage);
  const timeline = STAGE_ORDER.map((label, i) => {
    let status: "complete" | "active" | "pending" | "review";
    if (hasProgressData) {
      const ps = progressStageMap.get(label) ?? "Pending";
      if (ps === "Complete") status = "complete";
      else if (ps === "In Progress") status = "active";
      else if (ps === "Client Review Required") status = "review";
      else status = "pending";
    } else if (hasClickupItems) {
      const clickupStatus = clickupItemMap.get(label) ?? "Not Started";
      if (clickupStatus === "Done") status = "complete";
      else if (clickupStatus === "Working on it") status = "active";
      else if (clickupStatus === "Ready to Review") status = "review";
      else status = "pending";
    } else {
      status = i < currentIdx ? "complete" : i === currentIdx ? "active" : "pending";
    }
    return {
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      icon: STAGE_ICONS[label],
      pct: STAGE_PCT[label],
      status,
    };
  });

  // Count-based progress from /api/project-progress; fall back to weighted STAGE_PCT
  const completedCount = projectProgress?.completedStages ?? timeline.filter(t => t.status === "complete").length;
  const progressPct    = projectProgress?.percentage ?? clickupData?.progressPct ?? STAGE_PCT[projectStage];

  // ── Revision type checkboxes ──────────────────────────────────────────────
  const REVISION_TYPES = [
    "Text / wording updates",
    "Color changes",
    "Graphic adjustments",
    "App icon adjustment",
    "Branding updates",
    "Minor layout changes",
    "Minor configuration adjustment",
    "Other",
  ];

  function toggleRevType(val: string) {
    setRevType(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  }

  const formLabelSx: React.CSSProperties = {
    fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "hsl(218 16% 40%)", marginBottom: 7, display: "block",
  };

  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-18" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, hsl(217 85% 58% / 0.06) 0%, transparent 65%)", filter: "blur(90px)" }} />

      {/* Approve Demo Modal */}
      <ConfirmModal
        open={showDemoModal}
        headline="Approve Demo?"
        body="By approving your demo, you confirm that you are ready to move forward toward publishing preparation. If you approve now, your included revision round will be marked as unused and the project will move to Final Approval."
        confirmLabel="Yes, Approve Demo"
        onConfirm={confirmApproveDemo}
        onCancel={() => setShowDemoModal(false)}
      />

      {/* Approve For Publishing Modal */}
      <ConfirmModal
        open={showFinalModal}
        headline="Approve For Publishing?"
        body="By approving for publishing, you confirm that your app is ready to move into publishing requirements and store submission preparation."
        confirmLabel="Yes, Approve For Publishing"
        onConfirm={confirmFinalApproval}
        onCancel={() => setShowFinalModal(false)}
      />

      {/* Milestone Approval Confirmation Modal */}
      <ConfirmModal
        open={!!showApprovalConfirm?.open}
        headline="Confirm Milestone Approval"
        body="Are you sure you want to approve this milestone? Once approved, the project will move to the next stage."
        confirmLabel="Approve"
        onConfirm={async () => {
          if (showApprovalConfirm) {
            await handleApproveMilestone(showApprovalConfirm.milestoneName);
            setShowApprovalConfirm(null);
          }
        }}
        onCancel={() => setShowApprovalConfirm(null)}
      />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "hsl(142 76% 55%)" }} />
                <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(142 76% 55%)" }}>
                  Client Portal — Live
                </span>
              </div>
              {clickupLoading && (
                <span style={{ fontFamily: "'Inter'", fontSize: 10, color: "hsl(218 16% 38%)", letterSpacing: "0.06em" }}>
                  Syncing with ClickUp…
                </span>
              )}
              {clickupData && !clickupLoading && (
                <span style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: "hsl(35 90% 55%)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(35 90% 55%)", display: "inline-block" }} />
                  ClickUp Live
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>
              {(clickupData?.clientName || clientName) ? `Welcome back, ${(clickupData?.clientName || clientName).split(" ")[0]}.` : "App Launch Dashboard"}
            </h1>
            <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "hsl(218 16% 48%)", fontWeight: 300 }}>
              {completedCount} of {timeline.length} launch stages complete.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("appSquadLoggedIn");
              localStorage.removeItem("appSquadUserEmail");
              localStorage.removeItem("appSquadEnrollmentEmail");
              localStorage.removeItem("as_admin_auth");
              window.location.replace("/login");
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left — stats + timeline */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Client stats */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="Client Name" value={clickupData?.clientName || clientName || enrollmentRecord?.full_name || "Not set"} />
                <StatCard label="Game Type" value={clickupData?.gameType || gameSelection?.selectedGameType || enrollmentRecord?.game_type || "Pending"} sub={!clickupData?.gameType ? gameSelection?.gameCategory : undefined} />
                <StatCard label="App Name" value={clickupData?.appName || customization?.appName || enrollmentRecord?.app_name || "Pending"} />
                <StatCard label="Tagline" value={clickupData?.tagline || customization?.tagline || enrollmentRecord?.tagline || "Pending"} />
                <StatCard label="Monetization" value={clickupData?.monetization || customization?.monetization || enrollmentRecord?.monetization || "Pending"} />
                <StatCard label="Package" value={enrollmentRecord?.selected_package || "Not set"} />
                <StatCard label="Payment Type" value={enrollmentRecord?.payment_type || "Not set"} />
                <StatCard label="Source" value={source || enrollmentRecord?.source || "Direct"} />
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="rounded-2xl p-6" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 20 }}>
                App Launch Timeline
              </p>

              <div className="flex flex-col gap-0">
                {timeline.map((stage, i) => {
                  const Icon = stage.icon;
                  const isLast = i === timeline.length - 1;
                  const isComplete = stage.status === "complete";
                  const isActive = stage.status === "active";
                  const isReview = stage.status === "review";
                  const lbl = stage.label as ProjectStage;
                  const milestoneApprovals = approvalsHistory.filter(h => h.milestoneName === stage.label);
                  const latestApproval = milestoneApprovals[milestoneApprovals.length - 1];
                  const isApprovedReview = REVIEW_STAGES.includes(lbl) && (
                    latestApproval?.status === "approved" || 
                    (isComplete && (!latestApproval || latestApproval.status === "approved"))
                  );

                  return (
                    <div key={stage.id} className="flex gap-4">
                      {/* Icon + connector */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
                          style={{
                            background: isApprovedReview 
                              ? "hsl(217 85% 60% / 0.12)" 
                              : isComplete 
                              ? "hsl(142 76% 55% / 0.12)" 
                              : isActive 
                              ? "hsl(35 90% 55% / 0.12)" 
                              : "hsl(226 28% 7%)",
                            border: `1.5px solid ${
                              isApprovedReview
                              ? "hsl(217 85% 60% / 0.4)"
                              : isComplete 
                              ? "hsl(142 76% 55% / 0.4)" 
                              : isActive 
                              ? "hsl(35 90% 55% / 0.4)" 
                              : "hsl(224 22% 14%)"
                            }`,
                          }}>
                          {isApprovedReview ? (
                            <Check className="w-3.5 h-3.5" style={{ color: "hsl(217 85% 65%)" }} />
                          ) : (
                            <Icon className="w-3.5 h-3.5" style={{
                              color: isComplete ? "hsl(142 76% 55%)" : isActive ? "hsl(35 90% 62%)" : "hsl(218 16% 32%)"
                            }} />
                          )}
                        </div>
                        {!isLast && (
                          <div className="w-px flex-1 mt-1 mb-1" style={{
                            background: isComplete ? "hsl(142 76% 55% / 0.2)" : "hsl(224 22% 12%)",
                          }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-5 pt-1.5 flex-1 min-w-0">
                        {/* Label row */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p style={{
                            fontFamily: "'Inter'", fontSize: 13.5,
                            fontWeight: stage.status === "pending" ? 300 : 500,
                            color: isComplete ? "hsl(220 20% 82%)" : isActive ? "hsl(35 90% 65%)" : "hsl(218 16% 36%)",
                          }}>
                            {stage.label}
                          </p>
                          {REVIEW_STAGES.includes(lbl) ? (
                            latestApproval ? (
                              latestApproval.status === "approved" ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "hsl(142 76% 55% / 0.1)", color: "hsl(142 76% 55%)", border: "1px solid hsl(142 76% 55% / 0.25)" }}>
                                  ✓ Approved by Client
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "hsl(35 90% 55% / 0.12)", color: "hsl(35 90% 62%)", border: "1px solid hsl(35 90% 55% / 0.28)" }}>
                                  ⚠ Revision Requested
                                </span>
                              )
                            ) : (
                              (isActive || isReview) ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "hsl(217 85% 60% / 0.12)", color: "hsl(217 85% 65%)", border: "1px solid hsl(217 85% 60% / 0.28)" }}>
                                  Awaiting Client Approval
                                </span>
                              ) : isComplete ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "hsl(142 76% 55% / 0.1)", color: "hsl(142 76% 55%)", border: "1px solid hsl(142 76% 55% / 0.25)" }}>
                                  ✓ Approved by Client
                                </span>
                              ) : null
                            )
                          ) : (
                            <>
                              {isComplete && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "hsl(142 76% 55% / 0.1)", color: "hsl(142 76% 55%)", border: "1px solid hsl(142 76% 55% / 0.25)" }}>
                                  Complete
                                </span>
                              )}
                              {isActive && lbl !== "Revision Window" && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "hsl(35 90% 55% / 0.12)", color: "hsl(35 90% 62%)", border: "1px solid hsl(35 90% 55% / 0.28)" }}>
                                  In Progress
                                </span>
                              )}
                              {lbl === "Revision Window" && isActive && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "hsl(217 85% 60% / 0.12)", color: "hsl(217 85% 65%)", border: "1px solid hsl(217 85% 60% / 0.28)" }}>
                                  Revision Round Used
                                </span>
                              )}
                            </>
                          )}
                          {isAdmin && isActive && lbl !== "Demo Ready For Review" && (
                            <button
                              onClick={() => updateStageStatus(stage.label)}
                              disabled={updatingStage === stage.label}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                padding: "3px 10px", borderRadius: 6, cursor: updatingStage === stage.label ? "wait" : "pointer",
                                fontFamily: "'Inter'", fontSize: 10, fontWeight: 600,
                                background: "hsl(142 76% 55% / 0.08)",
                                border: "1px solid hsl(142 76% 55% / 0.22)",
                                color: "hsl(142 76% 55%)",
                                opacity: updatingStage === stage.label ? 0.55 : 1,
                                transition: "opacity 0.15s",
                              }}
                            >
                              <Check style={{ width: 9, height: 9 }} />
                              {updatingStage === stage.label ? "Updating…" : "Mark Complete"}
                            </button>
                          )}
                          <span style={{
                            fontFamily: "'Inter'", fontSize: 10, fontWeight: 500,
                            color: isComplete ? "hsl(142 76% 55% / 0.6)" : isActive ? "hsl(35 90% 55% / 0.6)" : "hsl(218 16% 26%)",
                            marginLeft: "auto",
                          }}>
                            {stage.pct}%
                          </span>
                        </div>

                        {/* ── DEMO READY FOR REVIEW ── */}
                        {lbl === "Demo Ready For Review" && (isActive || isReview) && (
                          <AnimatePresence mode="wait">
                            <motion.div key="demo-ready" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                              <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 44%)", fontWeight: 300, marginBottom: 14 }}>
                                Your app demo is now ready for review. Please review the design, branding, text, colors, and functionality before we move into publishing preparation.
                              </p>
                              {revisionFormOpen ? (
                                /* ── Revision Request Form ── */
                                <motion.div key="rev-form" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                  style={{ padding: "18px 20px", borderRadius: 13, background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 15%)" }}>
                                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: "hsl(220 20% 88%)", marginBottom: 4 }}>
                                    Submit Your Included Revision Request
                                  </p>
                                  <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.6, color: "hsl(218 16% 42%)", fontWeight: 300, marginBottom: 18 }}>
                                    Your package includes one revision round before publishing preparation. Please include all requested changes in this submission.
                                  </p>

                                  {/* Revision Type */}
                                  <label style={formLabelSx}>Revision Type</label>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginBottom: 16 }}>
                                    {REVISION_TYPES.map(t => (
                                      <button key={t} type="button" onClick={() => toggleRevType(t)}
                                        style={{
                                          display: "flex", alignItems: "center", gap: 7,
                                          padding: "7px 10px", borderRadius: 8, cursor: "pointer",
                                          background: revType.includes(t) ? "hsl(35 90% 55% / 0.08)" : "transparent",
                                          border: `1px solid ${revType.includes(t) ? "hsl(35 90% 55% / 0.3)" : "rgba(255,255,255,0.07)"}`,
                                          fontFamily: "'Inter'", fontSize: 11.5, fontWeight: 300,
                                          color: revType.includes(t) ? "hsl(35 90% 65%)" : "hsl(218 16% 44%)",
                                          textAlign: "left",
                                        }}>
                                        {revType.includes(t)
                                          ? <CheckSquare style={{ width: 12, height: 12, flexShrink: 0 }} />
                                          : <Square style={{ width: 12, height: 12, flexShrink: 0 }} />
                                        }
                                        {t}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Revision Details */}
                                  <label style={formLabelSx}>Revision Details</label>
                                  <textarea
                                    value={revDetails}
                                    onChange={e => setRevDetails(e.target.value)}
                                    rows={4}
                                    placeholder="Please describe all changes requested."
                                    style={{ ...inputSx, resize: "none", marginBottom: 14 }}
                                    onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.35)")}
                                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                                  />

                                  {/* Specific Screens */}
                                  <label style={formLabelSx}>Specific Screens / Areas</label>
                                  <textarea
                                    value={revAreas}
                                    onChange={e => setRevAreas(e.target.value)}
                                    rows={3}
                                    placeholder="Which screens, images, buttons, colors, or sections need changes?"
                                    style={{ ...inputSx, resize: "none", marginBottom: 14 }}
                                    onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.35)")}
                                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                                  />

                                  {/* Priority */}
                                  <label style={formLabelSx}>Priority Level</label>
                                  <select
                                    value={revPriority}
                                    onChange={e => setRevPriority(e.target.value)}
                                    style={{ ...inputSx, marginBottom: 14, appearance: "none" } as React.CSSProperties}
                                  >
                                    {["Low", "Normal", "High"].map(p => <option key={p} value={p}>{p}</option>)}
                                  </select>

                                  {/* Reference Upload placeholder */}
                                  <label style={formLabelSx}>Upload Reference Image (Optional)</label>
                                  <div style={{
                                    marginBottom: 16, padding: "14px 16px", borderRadius: 10,
                                    border: "1px dashed rgba(255,255,255,0.1)", textAlign: "center",
                                    color: "hsl(218 16% 34%)", fontFamily: "'Inter'", fontSize: 12, fontWeight: 300,
                                  }}>
                                    <Upload style={{ width: 16, height: 16, margin: "0 auto 6px", display: "block", opacity: 0.4 }} />
                                    Optional reference image or example — contact support to share files
                                  </div>

                                  {/* Confirmation checkbox */}
                                  <button type="button" onClick={() => setRevAgreed(a => !a)}
                                    style={{
                                      display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 18,
                                      background: "transparent", border: "none", cursor: "pointer",
                                      textAlign: "left", padding: 0,
                                    }}>
                                    {revAgreed
                                      ? <CheckSquare style={{ width: 15, height: 15, color: "hsl(35 90% 55%)", flexShrink: 0, marginTop: 1 }} />
                                      : <Square style={{ width: 15, height: 15, color: "hsl(218 16% 34%)", flexShrink: 0, marginTop: 1 }} />
                                    }
                                    <span style={{ fontFamily: "'Inter'", fontSize: 11.5, lineHeight: 1.6, color: "hsl(218 16% 44%)", fontWeight: 300 }}>
                                      I understand this is my included revision round and major feature additions, new game mechanics, new templates, or out-of-scope changes may require additional fees.
                                    </span>
                                  </button>

                                  <div style={{ display: "flex", gap: 8 }}>
                                    <button type="button" onClick={() => { void submitRevision(); }}
                                      disabled={!revDetails.trim() || !revAgreed || submittingRevision}
                                      style={{
                                        display: "inline-flex", alignItems: "center", gap: 7,
                                        padding: "10px 18px", borderRadius: 9, border: "none",
                                        fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
                                        background: revDetails.trim() && revAgreed && !submittingRevision
                                          ? "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)"
                                          : "rgba(255,255,255,0.05)",
                                        color: revDetails.trim() && revAgreed && !submittingRevision ? "#050505" : "hsl(218 16% 30%)",
                                        cursor: revDetails.trim() && revAgreed && !submittingRevision ? "pointer" : "not-allowed",
                                        opacity: submittingRevision ? 0.6 : 1,
                                        transition: "opacity 0.15s",
                                      }}>
                                      <Send style={{ width: 11, height: 11 }} />
                                      {submittingRevision ? "Submitting…" : "Submit Revision Request"}
                                    </button>
                                    <button type="button" onClick={() => setRevisionFormOpen(false)}
                                      style={{
                                        padding: "10px 14px", borderRadius: 9, cursor: "pointer",
                                        fontFamily: "'Inter'", fontSize: 12, fontWeight: 400,
                                        background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                                        color: "hsl(218 16% 40%)",
                                      }}>
                                      Cancel
                                    </button>
                                  </div>
                                </motion.div>
                              ) : (
                                /* ── Two action buttons ── */
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  <button type="button" onClick={() => setShowDemoModal(true)}
                                    disabled={approvingDemo}
                                    style={{
                                      display: "inline-flex", alignItems: "center", gap: 7,
                                      padding: "10px 18px", borderRadius: 9, border: "none",
                                      fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
                                      background: approvingDemo
                                        ? "rgba(255,255,255,0.06)"
                                        : "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)",
                                      color: approvingDemo ? "hsl(218 16% 44%)" : "#050505",
                                      cursor: approvingDemo ? "wait" : "pointer",
                                      boxShadow: approvingDemo ? "none" : "0 0 20px rgba(245,158,11,0.2)",
                                      opacity: approvingDemo ? 0.6 : 1,
                                      transition: "opacity 0.15s",
                                    }}>
                                    <ArrowRight style={{ width: 12, height: 12 }} />
                                    {approvingDemo ? "Approving…" : "Approve Demo"}
                                  </button>
                                  <button type="button" onClick={() => setRevisionFormOpen(true)}
                                    style={{
                                      display: "inline-flex", alignItems: "center", gap: 7,
                                      padding: "10px 16px", borderRadius: 9,
                                      fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
                                      background: "rgba(255,255,255,0.04)",
                                      border: "1px solid rgba(255,255,255,0.1)",
                                      color: "hsl(220 20% 72%)", cursor: "pointer",
                                    } as React.CSSProperties}>
                                    <ClipboardEdit style={{ width: 12, height: 12 }} />
                                    Submit Revision Request
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        )}

                        {/* ── REVISION WINDOW ── */}
                        {lbl === "Revision Window" && isActive && revisionData && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: 8, padding: "16px 18px", borderRadius: 12, background: "hsl(217 85% 60% / 0.05)", border: "1px solid hsl(217 85% 60% / 0.15)" }}>
                            <p style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 600, color: "hsl(217 85% 65%)", marginBottom: 4 }}>
                              Revision Request Received
                            </p>
                            <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 44%)", fontWeight: 300, marginBottom: 14 }}>
                              Our team is reviewing your included revision request. Once the requested updates are completed, your project will move to Final Approval.
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {revisionData.revisionType.length > 0 && (
                                <div>
                                  <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 32%)", marginBottom: 4 }}>Revision Type</p>
                                  <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 50%)", fontWeight: 300 }}>{revisionData.revisionType.join(", ")}</p>
                                </div>
                              )}
                              <div>
                                <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 32%)", marginBottom: 4 }}>Priority Level</p>
                                <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 50%)", fontWeight: 300 }}>{revisionData.priorityLevel}</p>
                              </div>
                              <div>
                                <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 32%)", marginBottom: 4 }}>Submitted</p>
                                <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 50%)", fontWeight: 300 }}>
                                  {new Date(revisionData.submittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                </p>
                              </div>
                              {revisionData.revisionDetails && (
                                <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                  <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 30%)", marginBottom: 4 }}>Revision Details</p>
                                  <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.6, color: "hsl(218 16% 48%)", fontWeight: 300, whiteSpace: "pre-wrap" }}>{revisionData.revisionDetails}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {/* ── FINAL APPROVAL ── */}
                        {lbl === "Final Approval" && isComplete && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 6 }}>
                            <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(142 76% 55%)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                              <Check style={{ width: 12, height: 12 }} />
                              Final approval completed
                            </p>
                          </motion.div>
                        )}
                        {lbl === "Final Approval" && isActive && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 8 }}>
                            <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 44%)", fontWeight: 300, marginBottom: 12 }}>
                              Your app is ready for final approval before publishing preparation.
                            </p>
                            <button type="button"
                              onClick={approvingFinal ? undefined : () => setShowFinalModal(true)}
                              disabled={approvingFinal}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 7,
                                padding: "10px 18px", borderRadius: 9, border: "none",
                                fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
                                background: approvingFinal
                                  ? "rgba(255,255,255,0.06)"
                                  : "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)",
                                color: approvingFinal ? "hsl(218 16% 44%)" : "#050505",
                                cursor: approvingFinal ? "wait" : "pointer",
                                boxShadow: approvingFinal ? "none" : "0 0 20px rgba(245,158,11,0.2)",
                                opacity: approvingFinal ? 0.6 : 1,
                                transition: "opacity 0.15s",
                              }}>
                              <ShieldCheck style={{ width: 12, height: 12 }} />
                              {approvingFinal ? "Submitting…" : "Approve For Publishing"}
                            </button>
                          </motion.div>
                        )}

                        {/* ── PUBLISHING REQUIREMENTS ── */}
                        {lbl === "Publishing Requirements" && isActive && (
                          <AnimatePresence mode="wait">
                            {publishingData ? (
                              <motion.div key="pub-submitted" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: 8, padding: "14px 16px", borderRadius: 12, background: "hsl(142 76% 55% / 0.04)", border: "1px solid hsl(142 76% 55% / 0.15)" }}>
                                <p style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 600, color: "hsl(142 76% 55%)", marginBottom: 4 }}>
                                  Publishing Requirements Submitted
                                </p>
                                <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.6, color: "hsl(218 16% 44%)", fontWeight: 300 }}>
                                  Our team will review your publishing details and begin store submission preparation.
                                </p>
                              </motion.div>
                            ) : publishingFormOpen ? (
                              <motion.div key="pub-form" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: 8, padding: "18px 20px", borderRadius: 13, background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 15%)" }}>
                                <p style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: "hsl(220 20% 88%)", marginBottom: 4 }}>
                                  Complete Publishing Requirements
                                </p>
                                <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.6, color: "hsl(218 16% 42%)", fontWeight: 300, marginBottom: 18 }}>
                                  Before App Squad can prepare your app for submission, we need your publishing details and developer account information.
                                </p>

                                {/* Apple */}
                                <label style={formLabelSx}>Publish To Apple App Store?</label>
                                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                                  {["Yes", "No"].map(v => (
                                    <button key={v} type="button" onClick={() => setPubApple(v)}
                                      style={{
                                        padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                                        fontFamily: "'Inter'", fontSize: 12, fontWeight: 400,
                                        background: pubApple === v ? "hsl(35 90% 55% / 0.1)" : "transparent",
                                        border: `1px solid ${pubApple === v ? "hsl(35 90% 55% / 0.35)" : "rgba(255,255,255,0.08)"}`,
                                        color: pubApple === v ? "hsl(35 90% 65%)" : "hsl(218 16% 44%)",
                                      }}>
                                      {v}
                                    </button>
                                  ))}
                                </div>

                                {pubApple === "Yes" && <>
                                  <label style={formLabelSx}>Apple Developer Account Created?</label>
                                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                                    {["Yes", "No", "Need Help"].map(v => (
                                      <button key={v} type="button" onClick={() => setPubAppleCreated(v)}
                                        style={{
                                          padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                                          fontFamily: "'Inter'", fontSize: 12, fontWeight: 400,
                                          background: pubAppleCreated === v ? "hsl(35 90% 55% / 0.1)" : "transparent",
                                          border: `1px solid ${pubAppleCreated === v ? "hsl(35 90% 55% / 0.35)" : "rgba(255,255,255,0.08)"}`,
                                          color: pubAppleCreated === v ? "hsl(35 90% 65%)" : "hsl(218 16% 44%)",
                                        }}>
                                        {v}
                                      </button>
                                    ))}
                                  </div>
                                  <label style={formLabelSx}>Apple Developer Account Email</label>
                                  <input type="email" value={pubAppleEmail} onChange={e => setPubAppleEmail(e.target.value)}
                                    placeholder="apple@example.com" style={{ ...inputSx, marginBottom: 14 }}
                                    onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.35)")}
                                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                                  />
                                </>}

                                {/* Google */}
                                <label style={formLabelSx}>Publish To Google Play?</label>
                                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                                  {["Yes", "No"].map(v => (
                                    <button key={v} type="button" onClick={() => setPubGoogle(v)}
                                      style={{
                                        padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                                        fontFamily: "'Inter'", fontSize: 12, fontWeight: 400,
                                        background: pubGoogle === v ? "hsl(35 90% 55% / 0.1)" : "transparent",
                                        border: `1px solid ${pubGoogle === v ? "hsl(35 90% 55% / 0.35)" : "rgba(255,255,255,0.08)"}`,
                                        color: pubGoogle === v ? "hsl(35 90% 65%)" : "hsl(218 16% 44%)",
                                      }}>
                                      {v}
                                    </button>
                                  ))}
                                </div>

                                {pubGoogle === "Yes" && <>
                                  <label style={formLabelSx}>Google Play Developer Account Created?</label>
                                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                                    {["Yes", "No", "Need Help"].map(v => (
                                      <button key={v} type="button" onClick={() => setPubGoogleCreated(v)}
                                        style={{
                                          padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                                          fontFamily: "'Inter'", fontSize: 12, fontWeight: 400,
                                          background: pubGoogleCreated === v ? "hsl(35 90% 55% / 0.1)" : "transparent",
                                          border: `1px solid ${pubGoogleCreated === v ? "hsl(35 90% 55% / 0.35)" : "rgba(255,255,255,0.08)"}`,
                                          color: pubGoogleCreated === v ? "hsl(35 90% 65%)" : "hsl(218 16% 44%)",
                                        }}>
                                        {v}
                                      </button>
                                    ))}
                                  </div>
                                  <label style={formLabelSx}>Google Play Developer Account Email</label>
                                  <input type="email" value={pubGoogleEmail} onChange={e => setPubGoogleEmail(e.target.value)}
                                    placeholder="google@example.com" style={{ ...inputSx, marginBottom: 14 }}
                                    onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.35)")}
                                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                                  />
                                </>}

                                <label style={formLabelSx}>Publishing Contact Name</label>
                                <input type="text" value={pubContactName} onChange={e => setPubContactName(e.target.value)}
                                  placeholder={clientName || "Your full name"} style={{ ...inputSx, marginBottom: 14 }}
                                  onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.35)")}
                                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                                />

                                <label style={formLabelSx}>Publishing Contact Email</label>
                                <input type="email" value={pubContactEmail} onChange={e => setPubContactEmail(e.target.value)}
                                  placeholder={email || "your@email.com"} style={{ ...inputSx, marginBottom: 14 }}
                                  onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.35)")}
                                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                                />

                                <label style={formLabelSx}>Additional Publishing Notes</label>
                                <textarea value={pubNotes} onChange={e => setPubNotes(e.target.value)} rows={3}
                                  placeholder="Any additional information for your publishing team..."
                                  style={{ ...inputSx, resize: "none", marginBottom: 18 }}
                                  onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.35)")}
                                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                                />

                                <div style={{ display: "flex", gap: 8 }}>
                                  <button type="button" onClick={submitPublishing}
                                    style={{
                                      display: "inline-flex", alignItems: "center", gap: 7,
                                      padding: "10px 18px", borderRadius: 9, border: "none",
                                      fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
                                      background: "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)",
                                      color: "#050505", cursor: "pointer",
                                      boxShadow: "0 0 18px rgba(245,158,11,0.18)",
                                    }}>
                                    <Send style={{ width: 11, height: 11 }} />
                                    Submit Publishing Requirements
                                  </button>
                                  <button type="button" onClick={() => setPublishingFormOpen(false)}
                                    style={{
                                      padding: "10px 14px", borderRadius: 9, cursor: "pointer",
                                      fontFamily: "'Inter'", fontSize: 12, fontWeight: 400,
                                      background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                                      color: "hsl(218 16% 40%)",
                                    }}>
                                    Cancel
                                  </button>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div key="pub-cta" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 8 }}>
                                <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 44%)", fontWeight: 300, marginBottom: 12 }}>
                                  Before App Squad can prepare your app for submission, we need your publishing details and developer account information.
                                </p>
                                <button type="button" onClick={() => setPublishingFormOpen(true)}
                                  style={{
                                    display: "inline-flex", alignItems: "center", gap: 7,
                                    padding: "10px 18px", borderRadius: 9, border: "none",
                                    fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
                                    background: "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)",
                                    color: "#050505", cursor: "pointer",
                                    boxShadow: "0 0 20px rgba(245,158,11,0.2)",
                                  }}>
                                  <Upload style={{ width: 12, height: 12 }} />
                                  Complete Publishing Requirements
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}

                        {/* ── PUBLISH STRATEGY CALL (active only after Final Approval is done) ── */}
                        {lbl === "Store Submission" && isActive && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 8 }}>
                            <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 44%)", fontWeight: 300, marginBottom: 10 }}>
                              Your app is being prepared and submitted to the selected app marketplaces.
                            </p>
                          </motion.div>
                        )}

                        {/* ── Client Milestone Action & History ── */}
                        {REVIEW_STAGES.includes(lbl) && (
                          <div className="mt-3 flex flex-col gap-3">
                            {/* Action Panel */}
                            {(isActive || isReview) && (!latestApproval || latestApproval.status !== "approved") && (
                              <div className="p-4 rounded-xl mt-2" style={{ background: "hsl(226 28% 5%)", border: "1px solid hsl(224 22% 12%)" }}>
                                <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700, color: "hsl(220 20% 88%)", marginBottom: 8 }}>
                                  Client Action: Milestone Review
                                </p>
                                
                                <textarea
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  placeholder="Write feedback, notes, or detailed revision requests here (required for revisions)..."
                                  rows={3}
                                  style={{
                                    width: "100%", borderRadius: 8, padding: "8px 12px",
                                    fontFamily: "'Inter'", fontSize: 12.5,
                                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
                                    color: "rgba(255,255,255,0.8)", outline: "none", resize: "none",
                                    boxSizing: "border-box", marginBottom: 12
                                  }}
                                />
                                
                                <div style={{ display: "flex", gap: 10 }}>
                                  <button
                                    type="button"
                                    disabled={submittingApproval !== null}
                                    onClick={() => setShowApprovalConfirm({ open: true, milestoneName: stage.label })}
                                    style={{
                                      background: "hsl(142 76% 40%)",
                                      color: "white",
                                      padding: "8px 16px",
                                      borderRadius: 8,
                                      fontWeight: 600,
                                      fontSize: 12,
                                      cursor: "pointer",
                                      border: "none"
                                    }}
                                  >
                                    Approve Milestone
                                  </button>
                                  <button
                                    type="button"
                                    disabled={submittingApproval !== null}
                                    onClick={() => handleRequestRevision(stage.label)}
                                    style={{
                                      background: "hsl(35 90% 48%)",
                                      color: "white",
                                      padding: "8px 16px",
                                      borderRadius: 8,
                                      fontWeight: 600,
                                      fontSize: 12,
                                      cursor: "pointer",
                                      border: "none"
                                    }}
                                  >
                                    Request Revisions
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* History Timeline */}
                            {milestoneApprovals.length > 0 && (
                              <div className="mt-2 pl-3 border-l border-dashed border-[rgba(255,255,255,0.1)] flex flex-col gap-2.5">
                                {milestoneApprovals.map((log) => (
                                  <div key={log.id} style={{ fontSize: 11.5 }}>
                                    <div style={{ fontWeight: 600, color: log.status === "approved" ? "hsl(142 76% 55%)" : "hsl(35 90% 62%)" }}>
                                      {log.status === "approved" ? `✓ Approved by ${log.approvedBy || "Client"}` : "⚠ Revision Requested"}
                                    </div>
                                    {log.comment && (
                                      <div className="mt-0.5 text-[rgba(255,255,255,0.55)] italic font-light">
                                        Comment: "{log.comment}"
                                      </div>
                                    )}
                                    <div className="mt-0.5 text-[9.5px] text-[rgba(255,255,255,0.25)]">
                                      {new Date(log.approvedAt || log.requestedAt || log.createdAt).toLocaleString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right — progress ring + contact + support */}
          <div className="flex flex-col gap-4">

            {/* Progress ring */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-6 text-center" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 36%)", marginBottom: 16 }}>
                Launch Progress
              </p>

              <div className="relative flex items-center justify-center mb-4">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="hsl(224 22% 12%)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="38" fill="none"
                    stroke="url(#prog)" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - progressPct / 100)}`}
                    transform="rotate(-90 50 50)"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                  <defs>
                    <linearGradient id="prog" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(38 95% 54%)" />
                      <stop offset="100%" stopColor="hsl(24 90% 50%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
                    {progressPct}%
                  </span>
                </div>
              </div>

              <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 44%)", fontWeight: 300 }}>
                {completedCount} of {timeline.length} stages complete
              </p>

              {/* Stage breakdown */}
              <div style={{ marginTop: 16, borderTop: "1px solid hsl(224 22% 11%)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                {timeline.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: s.status === "complete" ? "hsl(142 76% 55%)" : s.status === "active" ? "hsl(38 95% 54%)" : "hsl(224 22% 18%)",
                    }} />
                    <p style={{
                      fontFamily: "'Inter'", fontSize: 10.5,
                      color: s.status === "complete" ? "hsl(218 16% 52%)" : s.status === "active" ? "hsl(35 90% 62%)" : "hsl(218 16% 28%)",
                      fontWeight: s.status === "pending" ? 300 : 400,
                      flex: 1, textAlign: "left",
                    }}>{s.label}</p>
                    <p style={{ fontFamily: "'Inter'", fontSize: 10, color: s.status === "pending" ? "hsl(218 16% 22%)" : "hsl(218 16% 40%)" }}>{s.pct}%</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact info */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
              className="rounded-2xl p-5" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-3.5 h-3.5" style={{ color: "hsl(218 16% 38%)" }} />
                <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 38%)" }}>
                  Client Info
                </p>
              </div>
              {[
                { label: "Name", value: clientName },
                { label: "Email", value: email },
                { label: "Phone", value: phone },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5 mb-3 last:mb-0">
                  <p style={{ fontFamily: "'Inter'", fontSize: 10, color: "hsl(218 16% 34%)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: 13, color: value ? "hsl(218 16% 60%)" : "hsl(218 16% 28%)", fontWeight: 300 }}>{value || "Not provided"}</p>
                </div>
              ))}
            </motion.div>

            {/* Enrollment Documents */}
            {agreementPdfUrl && (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                className="rounded-2xl p-5" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 55%)" }} />
                  <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(35 90% 55%)" }}>
                    Enrollment Documents
                  </p>
                </div>
                
                <div className="flex flex-col gap-0.5 mb-4">
                  <p style={{ fontFamily: "'Inter'", fontSize: 10, color: "hsl(218 16% 34%)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>Signed Agreement</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 60%)", fontWeight: 300 }}>v1.0 (Signed)</p>
                  {agreementSignedAt && (
                    <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{agreementSignedAt}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <a
                    href={agreementPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "white", fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 600, textDecoration: "none"
                    }}
                  >
                    View PDF
                  </a>
                  <a
                    href={agreementPdfUrl}
                    download="Enrollment_Agreement.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))",
                      color: "black", fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 600, textDecoration: "none"
                    }}
                  >
                    Download PDF
                  </a>
                </div>
              </motion.div>
            )}

            {/* Support note */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
              className="rounded-2xl p-5" style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}>
              <div className="flex items-center gap-2 mb-3">
                <LifeBuoy className="w-3.5 h-3.5" style={{ color: "hsl(217 85% 60%)" }} />
                <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, color: "hsl(217 85% 65%)" }}>
                  App Squad Support
                </p>
              </div>
              <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 38%)", fontWeight: 300 }}>
                Your team will reach out to confirm next steps and collect any remaining materials before development begins.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
