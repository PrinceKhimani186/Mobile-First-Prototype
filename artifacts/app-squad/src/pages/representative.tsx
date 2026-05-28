import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Shield, Rocket, Layers, BarChart3,
  Play, Clock, CheckCircle2,
} from "lucide-react";
import { useLocation } from "wouter";

const TRUST = [
  {
    icon: Rocket,
    title: "Guided App Launch Process",
    desc: "Step-by-step support from template selection to live app store listing.",
  },
  {
    icon: Layers,
    title: "Customizable Game Templates",
    desc: "Branded game templates built for your identity and audience.",
  },
  {
    icon: BarChart3,
    title: "Monetization Preparation Support",
    desc: "Ad networks, in-app purchases, and revenue streams set up and ready.",
  },
];

export default function Representative() {
  const [, navigate] = useLocation();
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    localStorage.setItem("as_source", "Representative / Bought Lead");
  }, []);

  const goApply = () => {
    navigate("/apply");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
          style={{ background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.07) 0%, transparent 60%)", filter: "blur(90px)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at center, hsl(217 85% 58% / 0.07) 0%, transparent 60%)", filter: "blur(70px)" }} />
      </div>

      <div className="relative z-10 container mx-auto px-5 md:px-8 max-w-3xl pt-12 pb-24">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
            style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.24)" }}>
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 62%)" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(35 90% 66%)" }}>
              Continue Your Application
            </span>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 16 }}>
            Continue Your App Launch Application
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 15, lineHeight: 1.75, color: "hsl(218 16% 52%)", fontWeight: 300, maxWidth: 520, margin: "0 auto" }}>
            Watch this quick overview before completing your application and scheduling your App Launch Strategy Call.
          </p>
        </motion.div>

        {/* ── Video section ── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-8">

          {/* Video label row */}
          <div className="flex items-center justify-between mb-3 px-1">
            <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)" }}>
              Quick App Ownership Overview
            </p>
            <div className="flex items-center gap-1.5"
              style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 38%)" }}>
              <Clock className="w-3 h-3" />
              45–60 seconds
            </div>
          </div>

          {/* Cinematic video placeholder */}
          <div
            className="relative rounded-2xl overflow-hidden group cursor-pointer"
            style={{
              aspectRatio: "16/9",
              background: "hsl(226 36% 6%)",
              border: "1px solid hsl(224 22% 13%)",
              boxShadow: "0 0 0 1px hsl(224 22% 9%), 0 32px 80px -20px hsl(228 42% 4% / 0.9)",
            }}
            onClick={() => setPlayed(true)}
          >
            {/* Cinematic overlay graphics */}
            <div className="absolute inset-0">
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="vgrid" width="48" height="48" patternUnits="userSpaceOnUse">
                    <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#vgrid)" />
              </svg>

              {/* Glowing orb top-right */}
              <div className="absolute top-[-20%] right-[-10%] w-[55%] h-[120%] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, hsl(217 85% 58% / 0.18) 0%, transparent 65%)", filter: "blur(60px)" }} />

              {/* Gold glow bottom-left */}
              <div className="absolute bottom-[-20%] left-[-5%] w-[45%] h-[100%] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.13) 0%, transparent 65%)", filter: "blur(50px)" }} />

              {/* Mock UI layers — left panel */}
              <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 opacity-30">
                {["Game Template A", "Game Template B", "Game Template C"].map((t, i) => (
                  <div key={t} className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
                    style={{ background: "hsl(226 32% 10%)", border: "1px solid hsl(224 22% 16%)", minWidth: 148 }}>
                    <div className="w-7 h-7 rounded-lg shrink-0"
                      style={{ background: i === 0 ? "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))" : i === 1 ? "linear-gradient(135deg, hsl(217 85% 58%), hsl(240 72% 58%))" : "linear-gradient(135deg, hsl(280 72% 58%), hsl(310 72% 55%))" }} />
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk'", fontSize: 10, fontWeight: 600, color: "hsl(220 20% 78%)" }}>{t}</div>
                      <div style={{ fontFamily: "'Inter'", fontSize: 9, color: "hsl(218 16% 42%)" }}>Branded</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock UI layers — right panel */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 opacity-30">
                {[
                  { label: "Downloads", val: "48.2K", up: true },
                  { label: "Revenue", val: "$8,290", up: true },
                  { label: "Ad Network", val: "Active", up: false },
                ].map(({ label, val, up }) => (
                  <div key={label} className="px-4 py-3 rounded-xl"
                    style={{ background: "hsl(226 32% 10%)", border: "1px solid hsl(224 22% 16%)", minWidth: 120 }}>
                    <p style={{ fontFamily: "'Inter'", fontSize: 9, color: "hsl(218 16% 42%)", marginBottom: 3 }}>{label}</p>
                    <p style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, color: up ? "hsl(142 76% 55%)" : "hsl(35 90% 62%)" }}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Scan line overlay */}
              <div className="absolute inset-0"
                style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(228 42% 4% / 0.07) 3px, hsl(228 42% 4% / 0.07) 4px)" }} />

              {/* Vignette */}
              <div className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(228 42% 4% / 0.5) 100%)" }} />
            </div>

            {/* Center play button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex items-center justify-center"
              >
                {/* Glow ring */}
                <div className="absolute w-24 h-24 rounded-full"
                  style={{ background: "hsl(35 90% 55% / 0.18)", filter: "blur(16px)" }} />
                {/* Pulse ring */}
                <motion.div
                  className="absolute w-20 h-20 rounded-full border"
                  style={{ borderColor: "hsl(35 90% 55% / 0.3)" }}
                  animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Button */}
                <div className="relative w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))", boxShadow: "0 8px 32px hsl(35 90% 55% / 0.4)" }}>
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                </div>
              </motion.div>
              <p style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 500, color: "hsl(218 16% 52%)", letterSpacing: "0.02em" }}>
                Video placeholder — replace with embed
              </p>
            </div>

            {/* Cinematic top bar */}
            <div className="absolute top-0 inset-x-0 h-1"
              style={{ background: "linear-gradient(90deg, transparent 0%, hsl(35 90% 55% / 0.5) 50%, transparent 100%)" }} />
          </div>
        </motion.div>

        {/* ── Primary CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="mb-10">
          <button onClick={goApply}
            className="btn-gold w-full h-14 text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2.5 text-white">
            Continue To Qualification
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* ── Trust cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {TRUST.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl p-5"
              style={{ background: "hsl(226 32% 7%)", border: "1px solid hsl(224 22% 12%)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.2)" }}>
                <Icon className="w-4 h-4" style={{ color: "hsl(35 90% 62%)" }} />
              </div>
              <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: 6 }}>
                {title}
              </p>
              <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 44%)", fontWeight: 300 }}>
                {desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── Disclaimer ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-start gap-2.5 p-3.5 rounded-xl"
          style={{ background: "hsl(226 28% 5%)", border: "1px solid hsl(224 22% 10%)" }}>
          <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "hsl(218 16% 30%)" }} />
          <p style={{ fontFamily: "'Inter'", fontSize: 11, lineHeight: 1.65, color: "hsl(218 16% 30%)", fontWeight: 300 }}>
            App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, or return on investment.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
