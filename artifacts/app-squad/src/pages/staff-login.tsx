import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "Admin@123";
const STORAGE_KEY = "as_admin_auth";

export default function StaffLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 10,
    padding: "12px 14px",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.9)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem(STORAGE_KEY, "true");
        window.dispatchEvent(new Event("as_admin_auth_change"));
        navigate("/onboarding/dashboard");
      } else {
        setError("Incorrect username or password. Please try again.");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050507",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
    }}>
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div style={{
        position: "absolute",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 600,
        height: 600,
        background: "radial-gradient(ellipse, hsl(35 90% 55% / 0.06) 0%, transparent 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          width: "100%",
          maxWidth: 400,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "hsl(35 90% 55% / 0.12)",
              border: "1px solid hsl(35 90% 55% / 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <ShieldCheck style={{ width: 20, height: 20, color: "hsl(35 90% 62%)" }} />
            </div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.02em",
            }}>
              App<span style={{ color: "hsl(35 90% 62%)" }}>Squad</span>
            </span>
          </div>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.35)",
            marginTop: 4,
          }}>
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "hsl(226 32% 7%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "32px 28px",
        }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: "rgba(255,255,255,0.95)",
            marginBottom: 6,
            letterSpacing: "-0.02em",
          }}>
            Sign In
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.35)",
            marginBottom: 28,
          }}>
            Enter your credentials to access the admin panel.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Username */}
            <div>
              <label style={{
                display: "block",
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 7,
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                placeholder="Enter username"
                autoComplete="username"
                required
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: "block",
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 7,
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.5)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.3)",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword
                    ? <EyeOff style={{ width: 16, height: 16 }} />
                    : <Eye style={{ width: 16, height: 16 }} />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <AlertCircle style={{ width: 14, height: 14, color: "#f87171", flexShrink: 0 }} />
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: "#f87171",
                  margin: 0,
                }}>
                  {error}
                </p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              style={{
                width: "100%",
                height: 46,
                borderRadius: 12,
                border: "none",
                background: (!username || !password || loading)
                  ? "hsl(35 90% 55% / 0.25)"
                  : "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))",
                color: (!username || !password || loading)
                  ? "rgba(255,255,255,0.35)"
                  : "white",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: (!username || !password || loading) ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
                marginTop: 4,
              }}
            >
              {loading ? (
                <span style={{ opacity: 0.7 }}>Signing in…</span>
              ) : (
                <>
                  Sign In
                  <Zap style={{ width: 14, height: 14 }} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
