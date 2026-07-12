import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import {
  LogOut, Plus, RefreshCw, ChevronRight, User, Search, X,
} from "lucide-react";

const STAGE_PCT: Record<string, number> = {
  "Project Received": 10, "Brand Review": 20, "Customization Review": 30,
  "Development": 50, "Testing": 65, "Demo Ready For Review": 75,
  "Revision Window": 85, "Final Approval": 90, "Publishing Requirements": 95,
  "Store Submission": 98, "App Launch": 100,
};

const STAGE_COLOR: Record<string, string> = {
  "Project Received": "hsl(218 16% 44%)",
  "Brand Review": "hsl(218 16% 52%)",
  "Customization Review": "hsl(218 16% 52%)",
  "Development": "hsl(38 95% 54%)",
  "Testing": "hsl(38 95% 54%)",
  "Demo Ready For Review": "hsl(217 85% 65%)",
  "Revision Window": "hsl(38 85% 62%)",
  "Final Approval": "hsl(142 76% 55%)",
  "Publishing Requirements": "hsl(142 76% 55%)",
  "Store Submission": "hsl(142 76% 55%)",
  "App Launch": "hsl(142 76% 55%)",
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
  createdAt: string;
  updatedAt: string;
  assignedPms?: { id: number; name: string }[];
}

// ─── New Project Modal ─────────────────────────────────────────────────────────
function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ customerName: "", email: "", phone: "", package: "", gameTemplate: "", appName: "", source: "Direct" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email) { setError("Email is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.ok) { onCreated(); onClose(); }
      else { const d = await res.json() as { error: string }; setError(d.error || "Failed"); }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  const inputSx: React.CSSProperties = {
    width: "100%", borderRadius: 9, padding: "9px 12px",
    fontFamily: "'Inter'", fontSize: 13,
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
    color: "rgba(255,255,255,0.8)", outline: "none", boxSizing: "border-box", marginBottom: 12,
  };
  const labelSx: React.CSSProperties = {
    fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em",
    textTransform: "uppercase", color: "hsl(218 16% 38%)", display: "block", marginBottom: 5,
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(5,5,7,0.82)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: "hsl(226 32% 9%)", border: "1px solid hsl(224 22% 16%)", borderRadius: 18, padding: 28, width: "100%", maxWidth: 480, position: "relative" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <p style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: "hsl(220 20% 90%)" }}>New Project</p>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(218 16% 38%)", padding: 4 }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <form onSubmit={submit}>
          <label style={labelSx}>Customer Name</label>
          <input style={inputSx} value={form.customerName} onChange={e => set("customerName", e.target.value)} placeholder="Full name"
            onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
          <label style={labelSx}>Email *</label>
          <input style={inputSx} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="customer@email.com"
            onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSx}>Phone</label>
              <input style={inputSx} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 555 000 0000"
                onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
            </div>
            <div>
              <label style={labelSx}>Package</label>
              <input style={inputSx} value={form.package} onChange={e => set("package", e.target.value)} placeholder="e.g. Premium"
                onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSx}>Game Template</label>
              <input style={inputSx} value={form.gameTemplate} onChange={e => set("gameTemplate", e.target.value)} placeholder="e.g. Match 3"
                onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
            </div>
            <div>
              <label style={labelSx}>App Name</label>
              <input style={inputSx} value={form.appName} onChange={e => set("appName", e.target.value)} placeholder="App name"
                onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
            </div>
          </div>
          {error && <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(0 70% 60%)", marginBottom: 12 }}>{error}</p>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 16px", borderRadius: 9, background: "transparent", border: "1px solid rgba(255,255,255,0.09)", fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 44%)", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)", fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color: "#050505", cursor: "pointer" }}>
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Admin Projects Page ────────────────────────────────────────────────────────
export default function AdminProjects() {
  const [, navigate] = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [pmCount, setPmCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; email: string; role: "super_admin" | "project_manager" } | null>(null);

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/auth", { credentials: "include" });
      const data = await res.json() as { authenticated: boolean; user: any };
      if (!data.authenticated) {
        navigate("/admin");
      } else {
        setCurrentUser(data.user);
        if (data.user.role === "super_admin") {
          fetch("/api/admin/stats", { credentials: "include" })
            .then(r => r.json())
            .then((d: any) => setPmCount(d.projectManagerCount ?? 0))
            .catch(() => {});
        }
      }
    } catch {
      navigate("/admin");
    }
  }

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects", { credentials: "include" });
      if (res.status === 401) { navigate("/admin"); return; }
      const data = await res.json() as { projects: Project[] };
      setProjects(data.projects || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { checkAuth().then(loadProjects); }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    navigate("/admin");
  }

  const filtered = projects.filter(p =>
    !search ||
    p.customerName.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.projectId.toLowerCase().includes(search.toLowerCase()) ||
    p.currentStage.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ minHeight: "100vh", background: "#050507", padding: "0" }}>
      {showNew && <NewProjectModal onClose={() => setShowNew(false)} onCreated={loadProjects} />}

      {/* Header */}
      <div style={{ borderBottom: "1px solid hsl(224 22% 11%)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "hsl(226 32% 6%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "hsl(142 76% 55%)" }} />
          <div>
            <p style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: "hsl(220 20% 88%)", lineHeight: 1.2 }}>
              App Squad — Project Manager
            </p>
            {currentUser && (
              <p style={{ fontFamily: "'Inter'", fontSize: 10, color: "hsl(218 16% 48%)", fontWeight: 300 }}>
                Logged in as: <span style={{ color: "hsl(35 90% 62%)", fontWeight: 500 }}>{currentUser.name}</span> ({currentUser.role === "super_admin" ? "Super Admin" : "Project Manager"})
              </p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={loadProjects} title="Refresh" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: "hsl(218 16% 44%)", display: "flex", alignItems: "center" }}>
            <RefreshCw style={{ width: 13, height: 13 }} />
          </button>
          
          {currentUser?.role === "super_admin" && (
            <>
              <Link href="/admin/users" style={{ textDecoration: "none" }}>
                <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Inter'", fontSize: 12, color: "hsl(220 20% 75%)", cursor: "pointer" }}>
                  <User style={{ width: 12, height: 12 }} />
                  Admin Users
                </button>
              </Link>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 44%)", cursor: "default" }}>
                Settings
              </button>
              <button onClick={() => setShowNew(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)", fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, color: "#050505", cursor: "pointer" }}>
                <Plus style={{ width: 13, height: 13 }} />
                New Project
              </button>
            </>
          )}

          <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 44%)", cursor: "pointer" }}>
            <LogOut style={{ width: 12, height: 12 }} />
            Sign out
          </button>
        </div>
      </div>

      <div style={{ padding: "28px 28px" }}>
        {/* Stats bar */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { label: currentUser?.role === "super_admin" ? "Total Projects" : "My Projects", value: projects.length },
            { label: "In Progress", value: projects.filter(p => !["App Launch", "Store Submission"].includes(p.currentStage)).length },
            { label: "Demo Ready", value: projects.filter(p => p.currentStage === "Demo Ready For Review").length },
            { label: "Launched", value: projects.filter(p => p.currentStage === "App Launch").length },
            ...(currentUser?.role === "super_admin" ? [
              { label: "Project Managers", value: pmCount },
              { label: "Unassigned Projects", value: projects.filter(p => !p.assignedPms || p.assignedPms.length === 0).length },
            ] : []),
          ].map(s => (
            <div key={s.label} style={{ padding: "14px 20px", borderRadius: 12, background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "hsl(218 16% 36%)", marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontFamily: "'Space Grotesk'", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "hsl(220 20% 90%)" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 18, maxWidth: 360 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "hsl(218 16% 36%)" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or stage..."
            style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: 10, background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)", fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 60%)", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Table */}
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid hsl(224 22% 12%)" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr 140px 180px 120px 36px", gap: 0, background: "hsl(226 32% 7%)", padding: "10px 20px", borderBottom: "1px solid hsl(224 22% 12%)" }}>
            {["Project ID", "Customer Name", "Email", "Package", "Current Status", "Created", ""].map(col => (
              <p key={col} style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 34%)" }}>{col}</p>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "hsl(218 16% 36%)", fontFamily: "'Inter'", fontSize: 13 }}>
              Loading projects...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <User style={{ width: 28, height: 28, color: "hsl(218 16% 22%)", margin: "0 auto 10px" }} />
              <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 34%)", fontWeight: 300 }}>
                {search ? "No projects match your search." : "No projects assigned yet."}
              </p>
            </div>
          ) : filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: "grid", gridTemplateColumns: "110px 1fr 1fr 140px 180px 120px 36px",
                gap: 0, padding: "13px 20px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? "1px solid hsl(224 22% 10%)" : "none",
                background: "hsl(226 28% 6%)",
                cursor: "pointer", transition: "background 0.1s",
              }}
              onClick={() => navigate(`/admin/projects/${p.id}`)}
              onMouseEnter={e => (e.currentTarget.style.background = "hsl(226 32% 8%)")}
              onMouseLeave={e => (e.currentTarget.style.background = "hsl(226 28% 6%)")}
            >
              <p style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, color: "hsl(35 90% 62%)", letterSpacing: "0.02em" }}>{p.projectId}</p>
              <div>
                <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(220 20% 78%)", fontWeight: 400 }}>{p.customerName || "—"}</p>
                {p.assignedPms && p.assignedPms.length > 0 && (
                  <p style={{ fontFamily: "'Inter'", fontSize: 10, color: "hsl(38 95% 54% / 0.8)", fontWeight: 300, marginTop: 2 }}>
                    PM: {p.assignedPms.map((pm: any) => pm.name).join(", ")}
                  </p>
                )}
              </div>
              <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 48%)", fontWeight: 300 }}>{p.email}</p>
              <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 44%)", fontWeight: 300 }}>{p.package || "—"}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 48, height: 3, borderRadius: 3, background: "hsl(224 22% 14%)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${STAGE_PCT[p.currentStage] ?? 10}%`, background: "hsl(38 95% 54%)", borderRadius: 3 }} />
                </div>
                <p style={{ fontFamily: "'Inter'", fontSize: 11, color: STAGE_COLOR[p.currentStage] ?? "hsl(218 16% 44%)", fontWeight: 400, whiteSpace: "nowrap" }}>{p.currentStage}</p>
              </div>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 34%)", fontWeight: 300 }}>
                {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <ChevronRight style={{ width: 14, height: 14, color: "hsl(218 16% 30%)" }} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
