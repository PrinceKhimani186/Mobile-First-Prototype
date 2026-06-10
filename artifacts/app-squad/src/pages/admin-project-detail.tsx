import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, CheckCircle2, ExternalLink, Loader2, AlertTriangle, ChevronDown } from "lucide-react";

const PROJECT_STAGES = [
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

const STAGE_PCT: Record<string, number> = {
  "Project Received": 10, "Brand Review": 20, "Customization Review": 30,
  "Development": 50, "Testing": 65, "Demo Ready For Review": 75,
  "Revision Window": 85, "Final Approval": 90, "Publishing Requirements": 95,
  "Store Submission": 98, "App Launch": 100,
};

interface Project {
  id: number;
  projectId: string;
  customerName: string;
  email: string;
  phone: string;
  package: string;
  gameTemplate: string;
  appName: string;
  source: string;
  currentStage: string;
  notes: string;
  revisionData: unknown;
  publishingData: unknown;
  createdAt: string;
  updatedAt: string;
}

const inputSx: React.CSSProperties = {
  width: "100%", borderRadius: 9, padding: "9px 12px",
  fontFamily: "'Inter'", fontSize: 13,
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
  color: "rgba(255,255,255,0.8)", outline: "none", boxSizing: "border-box",
};

function StageSelect({ value, onChange, stages, pct }: {
  value: string;
  onChange: (v: string) => void;
  stages: readonly string[];
  pct: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", borderRadius: 9, padding: "9px 36px 9px 12px",
          fontFamily: "'Inter'", fontSize: 13,
          background: "hsl(226 32% 10%)", border: `1px solid ${open ? "hsl(35 90% 55% / 0.5)" : "rgba(255,255,255,0.12)"}`,
          color: "rgba(255,255,255,0.9)", outline: "none", boxSizing: "border-box",
          cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center",
          justifyContent: "space-between", transition: "border-color 0.15s",
        } as React.CSSProperties}
      >
        <span>{value} — {pct[value]}%</span>
        <ChevronDown size={14} style={{ opacity: 0.5, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
              background: "hsl(226 32% 10%)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {stages.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { onChange(s); setOpen(false); }}
                style={{
                  width: "100%", padding: "9px 12px", textAlign: "left",
                  fontFamily: "'Inter'", fontSize: 13, cursor: "pointer", border: "none",
                  background: s === value ? "hsl(35 90% 55% / 0.12)" : "transparent",
                  color: s === value ? "hsl(35 90% 65%)" : "rgba(255,255,255,0.8)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "background 0.1s",
                } as React.CSSProperties}
                onMouseEnter={e => { if (s !== value) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { if (s !== value) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <span>{s}</span>
                <span style={{ fontSize: 11, opacity: 0.45 }}>{pct[s]}%</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "hsl(218 16% 36%)", marginBottom: 5 }}>{label}</p>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={inputSx}
        onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")}
        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
      />
    </div>
  );
}

export default function AdminProjectDetail({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [stage, setStage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [pkg, setPkg] = useState("");
  const [gameTemplate, setGameTemplate] = useState("");
  const [appName, setAppName] = useState("");
  const [notes, setNotes] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function loadProject() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { credentials: "include" });
      if (res.status === 401) { navigate("/admin"); return; }
      if (!res.ok) { navigate("/admin/projects"); return; }
      const data = await res.json() as { project: Project };
      setProject(data.project);
      setStage(data.project.currentStage);
      setCustomerName(data.project.customerName);
      setPhone(data.project.phone);
      setPkg(data.project.package);
      setGameTemplate(data.project.gameTemplate);
      setAppName(data.project.appName);
      setNotes(data.project.notes);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProject(); }, [id]);

  async function handleSave() {
    if (!project) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      // Update stage
      const stageRes = await fetch(`/api/admin/projects/${id}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ stage }),
      });

      // Update other fields
      const detailRes = await fetch(`/api/admin/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ customerName, phone, package: pkg, gameTemplate, appName, notes }),
      });

      if (stageRes.ok && detailRes.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        await loadProject();
      } else {
        setSaveError("Failed to save changes.");
      }
    } catch {
      setSaveError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050507", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 24, height: 24, color: "hsl(218 16% 36%)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!project) return null;

  const pct = STAGE_PCT[stage] ?? 10;
  const dashboardUrl = `${window.location.origin}/onboarding/dashboard?stage=${encodeURIComponent(stage)}`;

  return (
    <div style={{ minHeight: "100vh", background: "#050507" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid hsl(224 22% 11%)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "hsl(226 32% 6%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/admin/projects" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "hsl(218 16% 44%)", fontFamily: "'Inter'", fontSize: 12 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />
            All Projects
          </Link>
          <span style={{ color: "hsl(218 16% 22%)" }}>›</span>
          <p style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 600, color: "hsl(35 90% 62%)" }}>{project.projectId}</p>
          <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "hsl(218 16% 52%)", fontWeight: 300 }}>{project.customerName || project.email}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <AnimatePresence>
            {saveSuccess && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 6, color: "hsl(142 76% 55%)", fontFamily: "'Inter'", fontSize: 12 }}>
                <CheckCircle2 style={{ width: 13, height: 13 }} />
                Saved — customer dashboard updated
              </motion.div>
            )}
            {saveError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 6, color: "hsl(0 70% 60%)", fontFamily: "'Inter'", fontSize: 12 }}>
                <AlertTriangle style={{ width: 13, height: 13 }} />
                {saveError}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={handleSave} disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 9, border: "none",
              background: saving ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)",
              fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600,
              color: saving ? "hsl(218 16% 30%)" : "#050505", cursor: saving ? "not-allowed" : "pointer",
            }}>
            {saving ? <Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> : <Save style={{ width: 13, height: 13 }} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div style={{ padding: 28, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

          {/* Left: main info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Project Status Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ borderRadius: 16, padding: 24, background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 36%)", marginBottom: 18 }}>
                Project Status
              </p>

              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 600, color: "hsl(35 90% 65%)" }}>{stage}</p>
                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, color: "hsl(38 95% 54%)" }}>{pct}%</p>
                </div>
                <div style={{ height: 5, borderRadius: 5, background: "hsl(224 22% 12%)", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                    style={{ height: "100%", background: "linear-gradient(90deg, hsl(38 95% 54%), hsl(24 90% 50%))", borderRadius: 5 }}
                  />
                </div>
              </div>

              <label style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "hsl(218 16% 36%)", display: "block", marginBottom: 8 }}>
                Update Stage
              </label>
              <StageSelect
                value={stage}
                onChange={setStage}
                stages={PROJECT_STAGES}
                pct={STAGE_PCT}
              />

              <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 34%)", fontWeight: 300, marginTop: 10 }}>
                Saving will immediately update the customer's dashboard. The change takes effect on their next page load.
              </p>
            </motion.div>

            {/* Customer Details */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              style={{ borderRadius: 16, padding: 24, background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 36%)", marginBottom: 18 }}>
                Customer Details
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Customer Name" value={customerName} onChange={setCustomerName} />
                <Field label="Email" value={project.email} onChange={() => {}} type="email" />
                <Field label="Phone" value={phone} onChange={setPhone} />
                <Field label="Source" value={project.source} onChange={() => {}} />
                <Field label="Package" value={pkg} onChange={setPkg} />
                <Field label="Game Template" value={gameTemplate} onChange={setGameTemplate} />
                <div style={{ gridColumn: "span 2" }}>
                  <Field label="App Name" value={appName} onChange={setAppName} />
                </div>
              </div>
            </motion.div>

            {/* Internal Notes */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              style={{ borderRadius: 16, padding: 24, background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 36%)", marginBottom: 14 }}>
                Internal Notes
              </p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                placeholder="Internal notes for App Squad staff only..."
                style={{ ...inputSx, resize: "vertical" }}
                onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
              />
            </motion.div>

            {/* Submitted data (revision / publishing) */}
            {(project.revisionData || project.publishingData) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ borderRadius: 16, padding: 24, background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
                <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 36%)", marginBottom: 14 }}>
                  Submitted Data
                </p>
                {project.revisionData && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, color: "hsl(217 85% 60%)", marginBottom: 6 }}>Revision Request</p>
                    <pre style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 48%)", lineHeight: 1.6, whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                      {JSON.stringify(project.revisionData, null, 2)}
                    </pre>
                  </div>
                )}
                {project.publishingData && (
                  <div>
                    <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, color: "hsl(142 76% 55%)", marginBottom: 6 }}>Publishing Requirements</p>
                    <pre style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 48%)", lineHeight: 1.6, whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                      {JSON.stringify(project.publishingData, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Project ID card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
              style={{ borderRadius: 16, padding: 20, background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 34%)", marginBottom: 14 }}>Project Info</p>
              {[
                { label: "Project ID", value: project.projectId, highlight: true },
                { label: "Created", value: new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                { label: "Last Updated", value: new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: 12 }}>
                  <p style={{ fontFamily: "'Inter'", fontSize: 9, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "hsl(218 16% 30%)", marginBottom: 2 }}>{row.label}</p>
                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: row.highlight ? 700 : 400, color: row.highlight ? "hsl(35 90% 62%)" : "hsl(218 16% 54%)" }}>{row.value}</p>
                </div>
              ))}
            </motion.div>

            {/* All stages */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
              style={{ borderRadius: 16, padding: 20, background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 34%)", marginBottom: 14 }}>Stage Timeline</p>
              {PROJECT_STAGES.map(s => {
                const idx = PROJECT_STAGES.indexOf(s as typeof PROJECT_STAGES[number]);
                const currentIdx = PROJECT_STAGES.indexOf(stage as typeof PROJECT_STAGES[number]);
                const status = idx < currentIdx ? "complete" : idx === currentIdx ? "active" : "pending";
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                      background: status === "complete" ? "hsl(142 76% 55%)" : status === "active" ? "hsl(38 95% 54%)" : "hsl(224 22% 16%)",
                    }} />
                    <p style={{
                      fontFamily: "'Inter'", fontSize: 11,
                      color: status === "complete" ? "hsl(218 16% 50%)" : status === "active" ? "hsl(35 90% 62%)" : "hsl(218 16% 28%)",
                      fontWeight: status === "active" ? 500 : 300,
                    }}>{s}</p>
                    <p style={{ fontFamily: "'Inter'", fontSize: 10, color: "hsl(218 16% 26%)", marginLeft: "auto" }}>{STAGE_PCT[s]}%</p>
                  </div>
                );
              })}
            </motion.div>

            {/* Dashboard link */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              style={{ borderRadius: 16, padding: 20, background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 34%)", marginBottom: 12 }}>Customer Dashboard Link</p>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 36%)", fontWeight: 300, marginBottom: 12, lineHeight: 1.5 }}>
                Share this link with the customer to send them directly to their current stage.
              </p>
              <a
                href={`/onboarding/dashboard`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9,
                  border: "1px solid rgba(255,255,255,0.08)", background: "transparent", textDecoration: "none",
                  fontFamily: "'Inter'", fontSize: 12, color: "hsl(217 85% 60%)",
                }}>
                <ExternalLink style={{ width: 12, height: 12 }} />
                View Customer Dashboard
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
