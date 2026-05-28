import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Phone, CheckCircle2, Shield, User } from "lucide-react";
import { useLocation } from "wouter";

const STEPS = [
  "Complete your qualification form",
  "Tell us about your goals and game interests",
  "Select your budget range and launch timeline",
  "Book your App Launch Strategy Call",
];

export default function Representative() {
  const [, navigate] = useLocation();

  useEffect(() => {
    localStorage.setItem("as_source", "Representative / Bought Lead");
  }, []);

  const goApply = () => {
    navigate("/apply");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-20 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-22" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-[500px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse at center, hsl(217 85% 58% / 0.14) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.1) 0%, transparent 65%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7"
            style={{ background: "hsl(217 85% 58% / 0.1)", border: "1px solid hsl(217 85% 58% / 0.22)" }}>
            <Phone className="w-3.5 h-3.5" style={{ color: "hsl(217 85% 68%)" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(217 85% 70%)" }}>
              Continue Your Application
            </span>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
            Continue Your App Launch Application
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 14, lineHeight: 1.75, color: "hsl(218 16% 52%)", fontWeight: 300 }}>
            If you recently spoke with an App Squad representative, complete your qualification form so our team can prepare for your App Launch Strategy Call.
          </p>
        </motion.div>

        {/* Steps card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="rounded-2xl p-7 mb-6"
          style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 14%)" }}>
          <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 40%)", marginBottom: 14 }}>
            Your Next Steps
          </p>
          <ul className="flex flex-col gap-3.5">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-3.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "hsl(35 90% 55% / 0.12)", border: "1px solid hsl(35 90% 55% / 0.25)", color: "hsl(35 90% 62%)", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 11 }}>
                  {i + 1}
                </div>
                <span style={{ fontFamily: "'Inter'", fontSize: 13.5, lineHeight: 1.6, color: "hsl(218 16% 60%)", fontWeight: 300 }}>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Trust note */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="flex items-start gap-2.5 p-3.5 rounded-xl mb-6"
          style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}>
          <User className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "hsl(218 16% 38%)" }} />
          <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 40%)", fontWeight: 300 }}>
            This helps our team understand your goals, budget range, game interest, and launch timeline before your strategy call.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="flex flex-col gap-3">
          <button onClick={goApply}
            className="btn-gold h-14 text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2.5 text-white">
            Continue To Qualification
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-2 p-3.5 rounded-xl"
            style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 10%)" }}>
            <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "hsl(218 16% 32%)" }} />
            <p style={{ fontFamily: "'Inter'", fontSize: 11, lineHeight: 1.65, color: "hsl(218 16% 32%)", fontWeight: 300 }}>
              App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, or return on investment.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
