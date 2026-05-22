import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Smartphone, Shield, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Start() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const canSubmit = name && email && phone;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    localStorage.setItem("as_lead", JSON.stringify({ name, email, phone }));
    navigate("/presentation");
    window.scrollTo({ top: 0 });
  };

  const inputCls = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    background: "hsl(226 32% 8%)",
    border: "1px solid hsl(224 22% 16%)",
    borderRadius: 10,
    color: "hsl(220 20% 97%)",
    outline: "none",
    width: "100%",
    padding: "13px 16px",
    transition: "border-color 0.2s",
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.18) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full opacity-12"
          style={{ background: "radial-gradient(ellipse at center, hsl(217 85% 58% / 0.12) 0%, transparent 65%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
            style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.22)" }}>
            <Smartphone className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 62%)" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(35 90% 65%)" }}>
              App Launch Overview
            </span>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 12 }}>
            Explore The App Launch Process
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 14, lineHeight: 1.7, color: "hsl(218 16% 55%)", fontWeight: 300 }}>
            Enter your information to access the App Ownership Presentation and see how App Squad helps guide customers from game template selection to customization, monetization preparation, and launch support.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 14%)", boxShadow: "0 32px 64px -16px hsl(228 42% 4% / 0.8)" }}
        >
          <div className="px-7 py-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 500, color: "hsl(218 16% 55%)", letterSpacing: "0.02em" }}>First Name</label>
                <input
                  type="text"
                  placeholder="Your first name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={inputCls}
                  onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.5)")}
                  onBlur={e => (e.target.style.borderColor = "hsl(224 22% 16%)")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 500, color: "hsl(218 16% 55%)", letterSpacing: "0.02em" }}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputCls}
                  onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.5)")}
                  onBlur={e => (e.target.style.borderColor = "hsl(224 22% 16%)")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 500, color: "hsl(218 16% 55%)", letterSpacing: "0.02em" }}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={inputCls}
                  onFocus={e => (e.target.style.borderColor = "hsl(35 90% 55% / 0.5)")}
                  onBlur={e => (e.target.style.borderColor = "hsl(224 22% 16%)")}
                />
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-gold mt-2 h-13 text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2.5 text-white py-3.5"
                style={{ opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? "pointer" : "not-allowed" }}
              >
                Watch The App Ownership Presentation
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="px-7 pb-6 pt-1">
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl" style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}>
              <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "hsl(218 16% 40%)" }} />
              <p style={{ fontFamily: "'Inter'", fontSize: 11, lineHeight: 1.65, color: "hsl(218 16% 38%)", fontWeight: 300 }}>
                App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, or return on investment.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-5"
          style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 35%)" }}
        >
          Already spoke with a specialist?{" "}
          <button
            onClick={() => { navigate("/scheduled-leads"); window.scrollTo({ top: 0 }); }}
            style={{ color: "hsl(35 90% 60%)", cursor: "pointer", textDecoration: "underline" }}
          >
            Skip to qualification
          </button>
        </motion.p>
      </div>
    </div>
  );
}
