import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Play, Clock, Shield, Zap, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

const HIGHLIGHTS = [
  "How game templates are selected and customized",
  "How apps are branded with your name, colors, and identity",
  "How monetization options are prepared (ads, in-app purchases)",
  "How apps are submitted to the App Store and Google Play",
  "What the guided App Squad launch process looks like",
];

export default function Presentation() {
  const [, navigate] = useLocation();
  const goApply = () => { navigate("/apply"); window.scrollTo({ top: 0 }); };

  return (
    <div className="min-h-screen pt-8 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.15) 0%, transparent 65%)", filter: "blur(80px)" }} />
      </div>

      <div className="container mx-auto px-5 md:px-8 max-w-4xl relative z-10">
        {/* Header */}
        <FadeUp className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
            style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.22)" }}>
            <Play className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 62%)" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(35 90% 65%)" }}>
              App Ownership Presentation
            </span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
            See How The App Launch Process Works
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 15, lineHeight: 1.7, color: "hsl(218 16% 55%)", fontWeight: 300, maxWidth: 560, margin: "0 auto" }}>
            This short presentation explains how mobile game apps are customized, branded, prepared for monetization, and launched through App Squad's guided onboarding process.
          </p>
        </FadeUp>

        {/* Video placeholder */}
        <FadeUp delay={0.08} className="mb-10">
          <div className="relative rounded-2xl overflow-hidden"
            style={{ background: "hsl(226 32% 7%)", border: "1px solid hsl(224 22% 13%)", aspectRatio: "16/9", boxShadow: "0 32px 80px -20px hsl(228 42% 4% / 0.9), 0 0 0 1px hsl(224 22% 10%)" }}>
            {/* Fake video background */}
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, hsl(217 85% 58% / 0.06) 0%, transparent 70%)" }} />
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))", boxShadow: "0 0 48px -8px hsl(35 90% 55% / 0.6)" }}
              >
                <Play className="w-9 h-9 text-white ml-1" fill="white" />
              </motion.div>
              <div className="text-center">
                <p style={{ fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>App Ownership Presentation</p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <Clock className="w-3.5 h-3.5" style={{ color: "hsl(218 16% 48%)" }} />
                  <span style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 48%)" }}>60–90 second overview</span>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[hsl(226_32%_6%)] to-transparent" />
          </div>
        </FadeUp>

        {/* What you'll see */}
        <FadeUp delay={0.14} className="mb-10">
          <div className="rounded-2xl p-7" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 14%)" }}>
            <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(35 90% 60%)", marginBottom: 14 }}>
              In This Presentation
            </p>
            <ul className="flex flex-col gap-3">
              {HIGHLIGHTS.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(35 90% 58%)" }} />
                  <span style={{ fontFamily: "'Inter'", fontSize: 13.5, lineHeight: 1.65, color: "hsl(218 16% 65%)", fontWeight: 300 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeUp>

        {/* CTA */}
        <FadeUp delay={0.2} className="text-center">
          <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 48%)", marginBottom: 16 }}>
            Ready to take the next step?
          </p>
          <button
            onClick={goApply}
            className="btn-gold h-14 px-10 text-[15px] font-semibold rounded-xl inline-flex items-center gap-3 text-white"
          >
            Apply For An App Launch Strategy Call
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Disclaimer */}
          <div className="mt-8 flex gap-3 p-4 rounded-xl text-left max-w-2xl mx-auto" style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}>
            <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(218 16% 36%)" }} />
            <p style={{ fontFamily: "'Inter'", fontSize: 11, lineHeight: 1.7, color: "hsl(218 16% 36%)", fontWeight: 300 }}>
              App Squad provides custom mobile game app development, monetization preparation, and app store publishing assistance. App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, or return on investment. Results vary and depend on marketing, user engagement, platform rules, audience demand, app quality, consistency, and third-party approval processes.
            </p>
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
