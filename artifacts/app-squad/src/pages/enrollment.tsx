import { motion } from "framer-motion";
import { Zap, CreditCard, FileText } from "lucide-react";
import { useLocation } from "wouter";

export default function Enrollment() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-20 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-[500px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.14) 0%, transparent 65%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 text-center max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>

          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))", boxShadow: "0 0 32px -8px hsl(35 90% 55% / 0.5)" }}>
            <Zap className="w-7 h-7 text-white" />
          </div>

          <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(35 90% 60%)", marginBottom: 14 }}>
            App Launch Enrollment
          </p>

          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 14 }}>
            Begin Your App Launch Enrollment
          </h1>

          <p style={{ fontFamily: "'Inter'", fontSize: 14, lineHeight: 1.75, color: "hsl(218 16% 52%)", fontWeight: 300, marginBottom: 36, maxWidth: 400, margin: "0 auto 36px" }}>
            After your strategy call, you'll receive your agreement, payment link, and secure onboarding access.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="btn-gold h-13 px-8 py-3.5 text-[14px] font-semibold rounded-xl inline-flex items-center gap-2.5 text-white justify-center">
              <CreditCard className="w-4 h-4 opacity-85" />
              Continue To Secure Enrollment
            </button>
            <button className="btn-ghost h-13 px-8 py-3.5 text-[14px] font-medium rounded-xl inline-flex items-center gap-2.5 justify-center text-white/70">
              <FileText className="w-4 h-4 opacity-70" />
              Review Agreement
            </button>
          </div>

          <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 32%)", lineHeight: 1.65 }}>
            This page is for clients who have completed a strategy call with the App Squad team.{" "}
            <button
              onClick={() => { navigate("/apply"); window.scrollTo({ top: 0 }); }}
              style={{ color: "hsl(35 90% 58%)", cursor: "pointer", textDecoration: "underline" }}
            >
              Apply here
            </button>{" "}
            if you haven't started yet.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
