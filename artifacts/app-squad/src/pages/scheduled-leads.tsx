import { motion } from "framer-motion";
import { ArrowRight, Phone, CheckCircle2, Zap } from "lucide-react";
import { useLocation } from "wouter";

const POINTS = [
  "Tell us about your goals and game interests",
  "Select your budget range and timeline",
  "Book your app launch strategy call",
  "Our team reviews your info before the call",
];

export default function ScheduledLeads() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-20 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-[500px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse at center, hsl(217 85% 58% / 0.14) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.12) 0%, transparent 65%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
            style={{ background: "hsl(217 85% 58% / 0.1)", border: "1px solid hsl(217 85% 58% / 0.22)" }}>
            <Phone className="w-3.5 h-3.5" style={{ color: "hsl(217 85% 68%)" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(217 85% 70%)" }}>
              Scheduled Lead
            </span>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 14 }}>
            Already Spoke With A Representative?
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 14, lineHeight: 1.75, color: "hsl(218 16% 55%)", fontWeight: 300 }}>
            Complete your qualification form and schedule your app launch strategy call so our team can review your goals, game interests, budget range, and timeline.
          </p>
        </motion.div>

        {/* Steps card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl p-7 mb-6"
          style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 14%)" }}
        >
          <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 48%)", marginBottom: 14 }}>
            Your Next Steps
          </p>
          <ul className="flex flex-col gap-3.5">
            {POINTS.map((p, i) => (
              <li key={p} className="flex items-center gap-3.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: "hsl(35 90% 55% / 0.12)", border: "1px solid hsl(35 90% 55% / 0.25)", color: "hsl(35 90% 62%)", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 11 }}>
                  {i + 1}
                </div>
                <span style={{ fontFamily: "'Inter'", fontSize: 13.5, lineHeight: 1.6, color: "hsl(218 16% 65%)", fontWeight: 300 }}>{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => { navigate("/apply"); window.scrollTo({ top: 0 }); }}
            className="btn-gold h-14 text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2.5 text-white"
          >
            Continue To Qualification
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center" style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 36%)" }}>
            This path is for leads who have already spoken with an App Squad team member.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="text-center mt-5"
          style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 32%)" }}
        >
          New here?{" "}
          <button
            onClick={() => { navigate("/start"); window.scrollTo({ top: 0 }); }}
            style={{ color: "hsl(217 85% 65%)", cursor: "pointer", textDecoration: "underline" }}
          >
            Watch the presentation first
          </button>
        </motion.p>
      </div>
    </div>
  );
}
