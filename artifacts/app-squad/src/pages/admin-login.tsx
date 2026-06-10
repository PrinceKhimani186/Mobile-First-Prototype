import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        navigate("/admin/projects");
      } else {
        setError("Incorrect password. Try again.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#050507", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 380,
        background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 14%)",
        borderRadius: 18, padding: "36px 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: "hsl(35 90% 55% / 0.12)", border: "1px solid hsl(35 90% 55% / 0.25)",
          }}>
            <Lock style={{ width: 16, height: 16, color: "hsl(35 90% 62%)" }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Space Grotesk'", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "hsl(220 20% 90%)", lineHeight: 1.2 }}>
              Admin Access
            </p>
            <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 38%)", fontWeight: 300 }}>
              App Squad Project Manager
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "hsl(218 16% 40%)", display: "block", marginBottom: 7 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
            style={{
              width: "100%", borderRadius: 10, padding: "11px 14px", marginBottom: 16,
              fontFamily: "'Inter'", fontSize: 14,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)", outline: "none", boxSizing: "border-box",
            }}
            onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.4)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />

          {error && (
            <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(0 70% 60%)", marginBottom: 12, fontWeight: 400 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
              fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 600, letterSpacing: "0.01em",
              background: password && !loading
                ? "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)"
                : "rgba(255,255,255,0.06)",
              color: password && !loading ? "#050505" : "hsl(218 16% 30%)",
              cursor: password && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxSizing: "border-box",
            }}
          >
            {loading && <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
