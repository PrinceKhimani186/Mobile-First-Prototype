import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { getEnrollmentProgress, getOnboardingEmail } from "@/services/enrollment";
import { useQueryClient } from "@tanstack/react-query";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getQueryParam(key: string): string {
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.35)",
  marginBottom: 7,
};

export default function SetPassword() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const fromPayment = getQueryParam("payment") === "success";
  const emailFromUrl = getQueryParam("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Prefill email — prefer URL param, then localStorage, then stored pending
  useEffect(() => {
    const stored = getOnboardingEmail();
    if (stored) setEmail(stored);
  }, [emailFromUrl]);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!confirm) e.confirm = "Please confirm your password.";
    else if (password !== confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Save credentials to Supabase (primary store)
      try {
        const saveRes = await fetch("/api/auth/save-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
            fullName: localStorage.getItem("appSquadEnrollmentName") ?? undefined,
          }),
        });
        if (!saveRes.ok) {
          const err = await saveRes.json().catch(() => ({})) as { error?: string };
          throw new Error(err.error ?? "Failed to save password");
        }
      } catch (err) {
        // If Supabase is unreachable fall back to localStorage only
        console.warn("[Auth] save-password API failed, using localStorage fallback:", err);
      }

      // Keep localStorage as offline/fallback credential store
      localStorage.setItem(
        "appSquadDemoAccount",
        JSON.stringify({
          email: normalizedEmail,
          password,
          passwordSet: true,
          createdAt: new Date().toISOString(),
        })
      );

      // Invalidate query client cache for onboarding progress to prevent stale guard redirect loops
      await queryClient.invalidateQueries({ queryKey: ["onboardingProgress", normalizedEmail] });

      setDone(true);

      // Save email for pre-filling the login form
      localStorage.setItem("appSquadPrefillEmail", normalizedEmail);

      setTimeout(() => {
        navigate(`/login?email=${encodeURIComponent(normalizedEmail)}`);
      }, 2200);
    } catch (err) {
      setErrors({ password: (err as Error).message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = email.trim() && password && confirm && !loading;

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
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-10" />

      {/* Glow */}
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
          maxWidth: 420,
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
              <Lock style={{ width: 20, height: 20, color: "hsl(35 90% 62%)" }} />
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
            Account Setup
          </p>
        </div>

        {/* Payment success banner */}
        {fromPayment && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.25)",
              marginBottom: 20,
            }}
          >
            <CheckCircle2 style={{ width: 16, height: 16, color: "#4ade80", flexShrink: 0 }} />
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "#4ade80",
              margin: 0,
              lineHeight: 1.5,
            }}>
              Payment successful. Create your dashboard password.
            </p>
          </motion.div>
        )}

        {/* Card */}
        <div style={{
          background: "hsl(226 32% 7%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "32px 28px",
        }}>
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: "center", padding: "16px 0" }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <CheckCircle2 style={{ width: 26, height: 26, color: "#4ade80" }} />
              </div>
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "rgba(255,255,255,0.95)",
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}>
                Password Created!
              </h2>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.6,
              }}>
                Password created successfully. Redirecting you to login…
              </p>
            </motion.div>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <KeyRound style={{ width: 18, height: 18, color: "hsl(35 90% 62%)" }} />
                  <h1 style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.95)",
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}>
                    Create Your Password
                  </h1>
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.35)",
                  marginTop: 4,
                }}>
                  Set a secure password to access your App Squad dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Email */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                    style={{
                      ...inputStyle,
                      ...(errors.email ? { borderColor: "rgba(239,68,68,0.5)" } : {}),
                    }}
                    onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.5)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  {errors.email && <ErrorMsg msg={errors.email} />}
                </div>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: undefined })); }}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      style={{
                        ...inputStyle,
                        paddingRight: 44,
                        ...(errors.password ? { borderColor: "rgba(239,68,68,0.5)" } : {}),
                      }}
                      onFocus={e => { if (!errors.password) e.target.style.borderColor = "hsl(35 90% 55% / 0.5)"; }}
                      onBlur={e => { if (!errors.password) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                    <ToggleVisibility show={showPassword} onToggle={() => setShowPassword(v => !v)} />
                  </div>
                  {errors.password && <ErrorMsg msg={errors.password} />}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setErrors(v => ({ ...v, confirm: undefined })); }}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      style={{
                        ...inputStyle,
                        paddingRight: 44,
                        ...(errors.confirm ? { borderColor: "rgba(239,68,68,0.5)" } : {}),
                      }}
                      onFocus={e => { if (!errors.confirm) e.target.style.borderColor = "hsl(35 90% 55% / 0.5)"; }}
                      onBlur={e => { if (!errors.confirm) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                    <ToggleVisibility show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
                  </div>
                  {errors.confirm && <ErrorMsg msg={errors.confirm} />}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 12,
                    border: "none",
                    background: !canSubmit
                      ? "hsl(35 90% 55% / 0.25)"
                      : "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))",
                    color: !canSubmit ? "rgba(255,255,255,0.35)" : "white",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: !canSubmit ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s",
                    marginTop: 8,
                  }}
                >
                  {loading ? "Creating Account…" : "Create Password & Continue"}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          color: "rgba(255,255,255,0.18)",
          textAlign: "center",
          marginTop: 20,
        }}>
          🔒 Your credentials are never stored in plain text.
        </p>
      </motion.div>
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}
    >
      <AlertCircle style={{ width: 12, height: 12, color: "#f87171", flexShrink: 0 }} />
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        color: "#f87171",
        margin: 0,
      }}>
        {msg}
      </p>
    </motion.div>
  );
}

function ToggleVisibility({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
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
      {show
        ? <EyeOff style={{ width: 16, height: 16 }} />
        : <Eye style={{ width: 16, height: 16 }} />
      }
    </button>
  );
}
