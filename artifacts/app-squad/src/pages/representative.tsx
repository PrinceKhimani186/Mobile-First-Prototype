import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Shield, Rocket, Layers, BarChart3, VideoOff,
} from "lucide-react";
import { useLocation } from "wouter";
import { APP_SQUAD_VIDEO_URL } from "../lib/video-config";

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

function VideoPlayer({ title = "App Ownership Overview" }: { title?: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="rounded-2xl flex flex-col items-center justify-center gap-5 p-10 text-center"
        style={{
          aspectRatio: "16/9",
          background: "hsl(226 32% 7%)",
          border: "1px solid hsl(224 22% 13%)",
        }}>
        <VideoOff className="w-10 h-10" style={{ color: "hsl(218 16% 36%)" }} />
        <div>
          <p style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            Video Temporarily Unavailable
          </p>
          <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 48%)", lineHeight: 1.65 }}>
            Please contact App Squad support or continue your application below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[1000px] mx-auto"
      style={{
        borderRadius: "1rem",
        boxShadow: "0 0 0 1px hsl(217 85% 58% / 0.22), 0 32px 80px -20px hsl(228 42% 4% / 0.9), 0 0 60px -24px hsl(217 85% 58% / 0.1)",
      }}>
      <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: "1rem", overflow: "hidden" }}>
        <iframe
          src={APP_SQUAD_VIDEO_URL}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
          title={title}
          onError={() => setError(true)}
        />
      </div>
    </div>
  );
}

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
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(35 90% 66%)" }}>
              Continue Your Application
            </span>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 16 }}>
            Continue Your App Launch Application
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 15, lineHeight: 1.75, color: "hsl(218 16% 52%)", fontWeight: 300, maxWidth: 520, margin: "0 auto" }}>
            This short overview will help you better understand the App Squad process before completing your application.
          </p>
        </motion.div>

        {/* ── Video section ── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-8">
          <VideoPlayer title="App Squad — App Ownership Overview" />
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
