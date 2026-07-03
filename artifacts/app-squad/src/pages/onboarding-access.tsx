import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Terminal } from "lucide-react";
import { useLocation } from "wouter";

const ACCESS_CODE = "APPSTART";

export default function OnboardingAccess() {
  const [, navigate] = useLocation();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === ACCESS_CODE) {
      setError(false);
      navigate("/onboarding/game-selection");
      window.scrollTo({ top: 0 });
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const inputCls = {
    fontFamily: "'Inter', monospace",
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    background: "hsl(226 32% 7%)",
    border: `1px solid ${error ? "hsl(0 72% 50% / 0.55)" : "hsl(224 22% 15%)"}`,
    borderRadius: 10,
    color: "hsl(220 20% 90%)",
    outline: "none",
    width: "100%",
    padding: "14px 18px",
    transition: "border-color 0.2s",
    textAlign: "center" as const,
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at center, hsl(217 85% 58% / 0.06) 0%, transparent 65%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto">

        {/* Lock icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 14%)", boxShadow: "0 0 40px hsl(217 85% 58% / 0.08)" }}>
            <Lock className="w-7 h-7" style={{ color: "hsl(218 16% 40%)" }} />
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="text-center mb-8"
        >
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.2, marginBottom: 8 }}>
            Client Portal Access
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 13.5, lineHeight: 1.65, color: "hsl(218 16% 44%)", fontWeight: 300 }}>
            Enter your access code to continue to the App Launch onboarding portal.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0], opacity: 1, y: 0 } : { x: 0, opacity: 1, y: 0 }}
          transition={shake ? { duration: 0.5 } : { delay: 0.12 }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 500, color: "hsl(218 16% 40%)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Access Code
              </label>
              <input
                type="text"
                placeholder="· · · · · · · ·"
                value={code}
                onChange={e => { setCode(e.target.value); setError(false); }}
                style={inputCls}
                autoComplete="off"
                spellCheck={false}
                onFocus={e => ((e.target as HTMLInputElement).style.borderColor = error ? "hsl(0 72% 50% / 0.55)" : "hsl(217 85% 58% / 0.4)")}
                onBlur={e => ((e.target as HTMLInputElement).style.borderColor = error ? "hsl(0 72% 50% / 0.55)" : "hsl(224 22% 15%)")}
              />
              {error && (
                <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(0 72% 60%)", fontWeight: 400 }}>
                  Incorrect access code. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!code.trim()}
              className="btn-gold mt-1 h-12 text-[14px] font-semibold rounded-xl flex items-center justify-center gap-2 text-white"
              style={{ opacity: code.trim() ? 1 : 0.35, cursor: code.trim() ? "pointer" : "not-allowed" }}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>

        {/* Dev label */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-1.5 mt-8"
        >
          <Terminal className="w-3 h-3" style={{ color: "hsl(218 16% 28%)" }} />
          <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 28%)", fontWeight: 300, letterSpacing: "0.02em" }}>
            Developer / Test Access
          </p>
        </motion.div>
      </div>
    </div>
  );
}
