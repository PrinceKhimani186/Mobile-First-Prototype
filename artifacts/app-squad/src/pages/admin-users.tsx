import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import {
  LogOut, Plus, RefreshCw, User, Search, X, ToggleLeft, ToggleRight, Edit2, Key, Trash2,
} from "lucide-react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "project_manager";
  status: "active" | "inactive";
  assignedProjectCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Add/Edit User Modal ───────────────────────────────────────────────────────
function UserModal({
  user,
  onClose,
  onSaved,
}: {
  user?: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"super_admin" | "project_manager">(user?.role || "project_manager");
  const [status, setStatus] = useState<"active" | "inactive">(user?.status || "active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!user;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || (!isEdit && !password)) {
      setError("Name, email, and password are required");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/admin/users/${user.id}` : "/api/admin/users";
      const method = isEdit ? "PUT" : "POST";
      const body = {
        name,
        email,
        role,
        status,
        ...(password ? { password } : {}),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const d = await res.json() as { error: string };
        setError(d.error || "Failed to save user");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const inputSx: React.CSSProperties = {
    width: "100%", borderRadius: 9, padding: "9px 12px",
    fontFamily: "'Inter'", fontSize: 13,
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
    color: "rgba(255,255,255,0.8)", outline: "none", boxSizing: "border-box", marginBottom: 12,
  };
  const selectSx: React.CSSProperties = {
    width: "100%", borderRadius: 9, padding: "9px 12px",
    fontFamily: "'Inter'", fontSize: 13,
    background: "hsl(226 32% 10%)", border: "1px solid rgba(255,255,255,0.09)",
    color: "rgba(255,255,255,0.8)", outline: "none", boxSizing: "border-box", marginBottom: 12,
  };
  const labelSx: React.CSSProperties = {
    fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em",
    textTransform: "uppercase", color: "hsl(218 16% 38%)", display: "block", marginBottom: 5,
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(5,5,7,0.82)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: "hsl(226 32% 9%)", border: "1px solid hsl(224 22% 16%)", borderRadius: 18, padding: 28, width: "100%", maxWidth: 420, position: "relative" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <p style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: "hsl(220 20% 90%)" }}>
            {isEdit ? "Edit Admin User" : "Add Admin User"}
          </p>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(218 16% 38%)", padding: 4 }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <form onSubmit={submit}>
          <label style={labelSx}>Full Name</label>
          <input style={inputSx} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" required
            onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
          
          <label style={labelSx}>Email Address</label>
          <input style={inputSx} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@appsquad.com" required
            onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
          
          <label style={labelSx}>
            {isEdit ? "Password (Leave blank to keep current)" : "Password"}
          </label>
          <input style={inputSx} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required={!isEdit}
            onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSx}>Role</label>
              <select style={selectSx} value={role} onChange={e => setRole(e.target.value as any)}>
                <option value="project_manager">Project Manager</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label style={labelSx}>Status</label>
              <select style={selectSx} value={status} onChange={e => setStatus(e.target.value as any)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {error && <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(0 70% 60%)", marginBottom: 12 }}>{error}</p>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 16px", borderRadius: 9, background: "transparent", border: "1px solid rgba(255,255,255,0.09)", fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 44%)", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)", fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color: "#050505", cursor: "pointer" }}>
              {loading ? "Saving..." : isEdit ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Reset Password Modal ──────────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (res.ok) { onSaved(); onClose(); }
      else { const d = await res.json() as { error: string }; setError(d.error || "Failed"); }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  const inputSx: React.CSSProperties = {
    width: "100%", borderRadius: 9, padding: "9px 12px",
    fontFamily: "'Inter'", fontSize: 13,
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
    color: "rgba(255,255,255,0.8)", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(5,5,7,0.82)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: "hsl(226 32% 9%)", border: "1px solid hsl(224 22% 16%)", borderRadius: 18, padding: 28, width: "100%", maxWidth: 380 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <p style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 700, color: "hsl(220 20% 90%)" }}>Reset Password</p>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(218 16% 38%)", padding: 4 }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 44%)", marginBottom: 20 }}>
          Setting new password for <span style={{ color: "hsl(35 90% 62%)" }}>{user.name}</span>
        </p>
        <form onSubmit={submit}>
          <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "hsl(218 16% 38%)", display: "block", marginBottom: 5 }}>New Password</p>
          <input style={{ ...inputSx, marginBottom: 12 }} type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" required autoFocus
            onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")} onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.09)")} />
          {error && <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(0 70% 60%)", marginBottom: 12 }}>{error}</p>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 16px", borderRadius: 9, background: "transparent", border: "1px solid rgba(255,255,255,0.09)", fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 44%)", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)", fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color: "#050505", cursor: "pointer" }}>
              {loading ? "Saving..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Admin Users Page ─────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [, navigate] = useLocation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; email: string; role: "super_admin" | "project_manager" } | null>(null);

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/auth", { credentials: "include" });
      const data = await res.json() as { authenticated: boolean; user: any };
      if (!data.authenticated) {
        navigate("/admin");
      } else if (data.user.role !== "super_admin") {
        navigate("/admin/projects");
      } else {
        setCurrentUser(data.user);
      }
    } catch {
      navigate("/admin");
    }
  }

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.status === 401) { navigate("/admin"); return; }
      if (res.status === 403) { navigate("/admin/projects"); return; }
      const data = await res.json() as { users: AdminUser[] };
      setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { checkAuth().then(loadUsers); }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    navigate("/admin");
  }

  async function toggleUserStatus(u: AdminUser) {
    const nextStatus = u.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) loadUsers();
    } catch { /* ignore */ }
  }

  async function handleDeleteUser(u: AdminUser) {
    if (!window.confirm(`Delete "${u.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        loadUsers();
      } else {
        const d = await res.json() as { error: string };
        alert(d.error || "Failed to delete user");
      }
    } catch { alert("Network error"); }
  }

  const filtered = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ minHeight: "100vh", background: "#050507", padding: "0" }}>
      {showModal && (
        <UserModal
          user={selectedUser}
          onClose={() => { setShowModal(false); setSelectedUser(null); }}
          onSaved={loadUsers}
        />
      )}
      {showResetModal && resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          onClose={() => { setShowResetModal(false); setResetPasswordUser(null); }}
          onSaved={loadUsers}
        />
      )}

      {/* Header */}
      <div style={{ borderBottom: "1px solid hsl(224 22% 11%)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "hsl(226 32% 6%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "hsl(142 76% 55%)" }} />
          <div>
            <p style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: "hsl(220 20% 88%)", lineHeight: 1.2 }}>
              App Squad — Admin Users
            </p>
            {currentUser && (
              <p style={{ fontFamily: "'Inter'", fontSize: 10, color: "hsl(218 16% 48%)", fontWeight: 300 }}>
                Super Admin: <span style={{ color: "hsl(35 90% 62%)", fontWeight: 500 }}>{currentUser.name}</span>
              </p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/admin/projects" style={{ textDecoration: "none" }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Inter'", fontSize: 12, color: "hsl(220 20% 75%)", cursor: "pointer" }}>
              Back to Projects
            </button>
          </Link>
          <button onClick={loadUsers} title="Refresh" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: "hsl(218 16% 44%)", display: "flex", alignItems: "center" }}>
            <RefreshCw style={{ width: 13, height: 13 }} />
          </button>
          <button onClick={() => { setSelectedUser(null); setShowModal(true); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)", fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, color: "#050505", cursor: "pointer" }}>
            <Plus style={{ width: 13, height: 13 }} />
            Add User
          </button>
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
            { label: "Total Admins", value: users.length },
            { label: "Super Admins", value: users.filter(u => u.role === "super_admin").length },
            { label: "Project Managers", value: users.filter(u => u.role === "project_manager").length },
            { label: "Active Accounts", value: users.filter(u => u.status === "active").length },
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
            placeholder="Search by name, email, or role..."
            style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: 10, background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)", fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 60%)", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Table */}
        <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid hsl(224 22% 12%)" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px 100px 80px 140px 180px", gap: 0, background: "hsl(226 32% 7%)", padding: "10px 20px", borderBottom: "1px solid hsl(224 22% 12%)" }}>
            {["Name", "Email", "Role", "Status", "Projects", "Created", "Actions"].map(col => (
              <p key={col} style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 34%)" }}>{col}</p>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "hsl(218 16% 36%)", fontFamily: "'Inter'", fontSize: 13 }}>
              Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <User style={{ width: 28, height: 28, color: "hsl(218 16% 22%)", margin: "0 auto 10px" }} />
              <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 34%)", fontWeight: 300 }}>
                No users found matching search.
              </p>
            </div>
          ) : filtered.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 160px 100px 80px 140px 180px",
                gap: 0, padding: "13px 20px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? "1px solid hsl(224 22% 10%)" : "none",
                background: "hsl(226 28% 6%)",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "hsl(226 32% 8%)")}
              onMouseLeave={e => (e.currentTarget.style.background = "hsl(226 28% 6%)")}
            >
              <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(220 20% 78%)", fontWeight: 500 }}>{u.name}</p>
              <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 48%)", fontWeight: 300 }}>{u.email}</p>
              <div>
                <span style={{
                  padding: "3px 9px", borderRadius: 8, fontSize: 10, fontWeight: 600, fontFamily: "'Inter'",
                  background: u.role === "super_admin" ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.1)",
                  color: u.role === "super_admin" ? "hsl(38 95% 60%)" : "hsl(217 85% 65%)",
                  border: `1px solid ${u.role === "super_admin" ? "rgba(245,158,11,0.22)" : "rgba(59,130,246,0.22)"}`,
                  whiteSpace: "nowrap" as const,
                }}>
                  {u.role === "super_admin" ? "Super Admin" : "Project Manager"}
                </span>
              </div>
              <div>
                <span style={{
                  padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600, fontFamily: "'Inter'",
                  background: u.status === "active" ? "rgba(142,252,189,0.08)" : "rgba(255,100,100,0.08)",
                  color: u.status === "active" ? "hsl(142 76% 55%)" : "hsl(0 70% 60%)",
                  border: `1px solid ${u.status === "active" ? "rgba(142,252,189,0.15)" : "rgba(255,100,100,0.15)"}`,
                }}>
                  {u.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color: "hsl(218 16% 46%)" }}>
                {u.assignedProjectCount ?? 0}
              </p>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 34%)", fontWeight: 300 }}>
                {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button onClick={() => { setSelectedUser(u); setShowModal(true); }} title="Edit User"
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(218 16% 44%)", padding: 4, display: "flex", alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "hsl(220 20% 80%)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "hsl(218 16% 44%)")}>
                  <Edit2 style={{ width: 13, height: 13 }} />
                </button>
                <button onClick={() => { setResetPasswordUser(u); setShowResetModal(true); }} title="Reset Password"
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(218 16% 44%)", padding: 4, display: "flex", alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "hsl(217 85% 65%)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "hsl(218 16% 44%)")}>
                  <Key style={{ width: 13, height: 13 }} />
                </button>
                <button onClick={() => toggleUserStatus(u)} title={u.status === "active" ? "Deactivate" : "Activate"}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: u.status === "active" ? "hsl(142 76% 45%)" : "hsl(218 16% 30%)", padding: 4, display: "flex", alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.color = u.status === "active" ? "hsl(142 76% 55%)" : "hsl(218 16% 50%)")}
                  onMouseLeave={e => (e.currentTarget.style.color = u.status === "active" ? "hsl(142 76% 45%)" : "hsl(218 16% 30%)")}>
                  {u.status === "active" ? <ToggleRight style={{ width: 18, height: 18 }} /> : <ToggleLeft style={{ width: 18, height: 18 }} />}
                </button>
                <button onClick={() => handleDeleteUser(u)} title="Delete User"
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(0 70% 38%)", padding: 4, display: "flex", alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "hsl(0 70% 58%)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "hsl(0 70% 38%)")}>
                  <Trash2 style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
