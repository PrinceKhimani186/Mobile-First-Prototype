import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Smartphone, Shield, CheckCircle2,
  Apple, BarChart3, Layers, Rocket, Zap
} from "lucide-react";
import { useLocation } from "wouter";
import { sendLeadToCRM } from "@/lib/crm";

const TRUST_POINTS = [
  "No coding experience needed",
  "Branded game templates ready to customize",
  "App Store & Google Play publishing support",
  "Monetization preparation included",
];

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

export default function Start() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const canSubmit = name && email && phone;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const source = "Ads / Cold Traffic";
    localStorage.setItem("as_lead", JSON.stringify({ name, email, phone }));
    localStorage.setItem("as_source", source);
    sendLeadToCRM({ name, email, phone, source });
    navigate("/presentation");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.08) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px]"
          style={{ background: "radial-gradient(ellipse at center, hsl(217 85% 58% / 0.07) 0%, transparent 65%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative z-10 container mx-auto px-5 md:px-8 max-w-6xl pt-12 pb-24">

        {/* ── Hero ── */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left — copy */}
          <div className="pt-6 lg:pt-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7"
              style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.22)" }}>
              <Smartphone className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 62%)" }} />
              <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(35 90% 65%)" }}>
                Mobile App Economy
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
              style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 16 }}>
              Explore The<br />
              <span className="gradient-text">Mobile App Economy</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              style={{ fontFamily: "'Inter'", fontSize: 15, lineHeight: 1.75, color: "hsl(218 16% 52%)", fontWeight: 300, marginBottom: 32, maxWidth: 460 }}>
              Discover how branded mobile game apps are customized, prepared for monetization, and launched through App Squad's guided app launch process.
            </motion.p>

            {/* Trust points */}
            <motion.ul
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="flex flex-col gap-3 mb-10">
              {TRUST_POINTS.map(p => (
                <li key={p} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "hsl(35 90% 58%)" }} />
                  <span style={{ fontFamily: "'Inter'", fontSize: 13.5, color: "hsl(218 16% 58%)", fontWeight: 300 }}>{p}</span>
                </li>
              ))}
            </motion.ul>

            {/* Platform badges */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
              className="flex flex-wrap gap-2">
              {[
                { icon: Apple, label: "iOS App Store" },
                { icon: BarChart3, label: "AdMob" },
                { icon: Layers, label: "No Coding" },
                { icon: Rocket, label: "Launch Support" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 14%)", color: "hsl(218 16% 52%)" }}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-24">

            <div className="rounded-2xl overflow-hidden"
              style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 14%)", boxShadow: "0 32px 80px -20px hsl(228 42% 4% / 0.85), 0 0 0 1px hsl(224 22% 10%)" }}>

              {/* Card header */}
              <div className="px-7 pt-7 pb-5" style={{ borderBottom: "1px solid hsl(224 22% 11%)" }}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))" }}>
                    <Zap className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                      Watch The App Ownership Presentation
                    </p>
                    <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 44%)", fontWeight: 300 }}>
                      Enter your info to access the presentation
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-4">
                {[
                  { label: "First Name", type: "text", placeholder: "Your first name", value: name, onChange: setName },
                  { label: "Email Address", type: "email", placeholder: "you@example.com", value: email, onChange: setEmail },
                  { label: "Phone Number", type: "tel", placeholder: "+1 (555) 000-0000", value: phone, onChange: setPhone },
                ].map(f => (
                  <div key={f.label} className="flex flex-col gap-1.5">
                    <label style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 500, color: "hsl(218 16% 48%)", letterSpacing: "0.015em" }}>
                      {f.label}
                    </label>
                    <input type={f.type} placeholder={f.placeholder} value={f.value}
                      onChange={e => f.onChange(e.target.value)} style={inputCls}
                      onFocus={e => ((e.target as HTMLInputElement).style.borderColor = "hsl(35 90% 55% / 0.5)")}
                      onBlur={e => ((e.target as HTMLInputElement).style.borderColor = "hsl(224 22% 16%)")} />
                  </div>
                ))}

                <button type="submit" disabled={!canSubmit}
                  className="btn-gold mt-2 h-13 py-3.5 text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2.5 text-white"
                  style={{ opacity: canSubmit ? 1 : 0.38, cursor: canSubmit ? "pointer" : "not-allowed" }}>
                  Continue To Presentation
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Disclaimer */}
              <div className="px-7 pb-6">
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl"
                  style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 10%)" }}>
                  <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "hsl(218 16% 36%)" }} />
                  <p style={{ fontFamily: "'Inter'", fontSize: 11, lineHeight: 1.65, color: "hsl(218 16% 36%)", fontWeight: 300 }}>
                    App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, or return on investment.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
