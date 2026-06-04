import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, Shield, CheckCircle2, VideoOff,
  Smartphone, TrendingUp, Megaphone, ShoppingCart,
  Star, Repeat, DollarSign, X, HelpCircle, Zap,
  Puzzle, Type, Dices, Gamepad2, Brain, Trophy,
  Car, Map, Package, Crown, Rocket,
} from "lucide-react";
import { useLocation } from "wouter";
import { APP_SQUAD_VIDEO_URL } from "../lib/video-config";

// ── Helpers ─────────────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      style={{
        fontFamily: "'Inter'",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "hsl(35 90% 62%)",
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  );
}

function SectionHeading({ children, center = true }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2
      style={{
        fontFamily: "'Space Grotesk'",
        fontSize: "clamp(1.9rem, 4vw, 3rem)",
        fontWeight: 700,
        letterSpacing: "-0.035em",
        lineHeight: 1.08,
        marginBottom: 16,
        textAlign: center ? "center" : "left",
      }}
    >
      {children}
    </h2>
  );
}

function SubText({ children, center = true }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p
      style={{
        fontFamily: "'Inter'",
        fontSize: 16,
        lineHeight: 1.75,
        color: "hsl(218 16% 55%)",
        fontWeight: 300,
        textAlign: center ? "center" : "left",
        maxWidth: center ? 640 : "none",
        margin: center ? "0 auto" : undefined,
      }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "linear-gradient(90deg, transparent, hsl(224 22% 18%), transparent)",
        margin: "0",
      }}
    />
  );
}

// ── Video Player ─────────────────────────────────────────────────────────────

function VideoPlayer() {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div
        className="rounded-2xl flex flex-col items-center justify-center gap-5 p-10 text-center"
        style={{ aspectRatio: "16/9", background: "hsl(226 32% 7%)", border: "1px solid hsl(224 22% 13%)" }}
      >
        <VideoOff className="w-10 h-10" style={{ color: "hsl(218 16% 36%)" }} />
        <p style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
          Video Temporarily Unavailable
        </p>
        <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 48%)" }}>
          Please contact App Squad support to continue.
        </p>
      </div>
    );
  }
  return (
    <div
      style={{
        borderRadius: "1.25rem",
        overflow: "hidden",
        boxShadow: "0 0 0 1px hsl(35 90% 55% / 0.18), 0 40px 100px -24px hsl(228 42% 4% / 0.95)",
      }}
    >
      <div style={{ position: "relative", paddingBottom: "56.25%" }}>
        <iframe
          src={APP_SQUAD_VIDEO_URL}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
          title="App Ownership Presentation"
          onError={() => setError(true)}
        />
      </div>
    </div>
  );
}

// ── Section 1: Hero ──────────────────────────────────────────────────────────

function HeroSection({ onApply }: { onApply: () => void }) {
  return (
    <section className="relative pt-14 pb-20 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.09) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />
      <div className="container mx-auto px-5 md:px-8 max-w-5xl relative z-10 text-center">
        <FadeUp>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.24)" }}
          >
            <Smartphone className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 62%)" }} />
            <span
              style={{
                fontFamily: "'Inter'",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "hsl(35 90% 65%)",
              }}
            >
              App Ownership Opportunity
            </span>
          </div>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h1
            style={{
              fontFamily: "'Space Grotesk'",
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.04,
              marginBottom: 24,
            }}
          >
            Most People{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(38 95% 60%), hsl(24 90% 55%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Spend Money
            </span>{" "}
            In Apps.
            <br />
            Very Few Ever{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(217 85% 65%), hsl(250 80% 70%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Own One.
            </span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.1}>
          <p
            style={{
              fontFamily: "'Inter'",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              lineHeight: 1.75,
              color: "hsl(218 16% 58%)",
              fontWeight: 300,
              maxWidth: 620,
              margin: "0 auto 36px",
            }}
          >
            The mobile app economy is one of the largest digital markets on the planet.
            Today you'll see exactly how everyday entrepreneurs are crossing from the consumer side to the ownership side.
          </p>
        </FadeUp>

        <FadeUp delay={0.14}>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={onApply}
              className="btn-gold h-14 px-9 text-[15px] font-semibold rounded-xl inline-flex items-center gap-2.5 text-white"
            >
              Apply For A Strategy Call <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#vsl"
              className="btn-ghost h-14 px-8 text-[15px] font-medium rounded-xl inline-flex items-center gap-2 text-white/80"
            >
              Watch Presentation
            </a>
          </div>
        </FadeUp>

        {/* Floating stats */}
        <FadeUp delay={0.2} className="mt-14">
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { num: "$300B+", label: "Global mobile gaming revenue" },
              { num: "3.5B+", label: "Mobile gamers worldwide" },
              { num: "5 Ways", label: "Apps can monetize" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-5"
                style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 14%)" }}
              >
                <p
                  style={{
                    fontFamily: "'Space Grotesk'",
                    fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "hsl(35 90% 62%)",
                    marginBottom: 4,
                  }}
                >
                  {s.num}
                </p>
                <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 48%)", lineHeight: 1.5 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Section 2: Consumer vs Owner ─────────────────────────────────────────────

function ConsumerOwnerSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">
        <FadeUp className="text-center mb-12">
          <SectionLabel>The Mindset Shift</SectionLabel>
          <SectionHeading>There Are Two Types Of People In The App Economy.</SectionHeading>
          <SubText>Every dollar spent inside an app goes to someone. The only question is — which side are you on?</SubText>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Consumer side */}
          <FadeUp delay={0.06}>
            <div
              className="rounded-2xl p-8 h-full"
              style={{ background: "hsl(0 40% 6%)", border: "1px solid hsl(0 30% 16%)" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "hsl(0 50% 15%)", border: "1px solid hsl(0 40% 22%)" }}
                >
                  <X className="w-5 h-5" style={{ color: "hsl(0 70% 60%)" }} />
                </div>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk'",
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "hsl(0 60% 65%)",
                  }}
                >
                  The Consumer
                </h3>
              </div>
              <ul className="flex flex-col gap-4">
                {[
                  "Pays for in-app purchases that fund someone else's asset",
                  "Watches ads that generate revenue for app owners",
                  "Spends time and money building someone else's platform",
                  "Has no ownership, no equity, no digital asset",
                  "Repeat-buys coins, lives, upgrades — forever",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                      style={{ background: "hsl(0 50% 14%)", border: "1px solid hsl(0 40% 20%)" }}
                    >
                      <X className="w-3 h-3" style={{ color: "hsl(0 65% 55%)" }} />
                    </div>
                    <span style={{ fontFamily: "'Inter'", fontSize: 14, color: "hsl(218 10% 52%)", lineHeight: 1.6 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          {/* Owner side */}
          <FadeUp delay={0.12}>
            <div
              className="rounded-2xl p-8 h-full"
              style={{
                background: "hsl(226 32% 8%)",
                border: "1px solid hsl(35 90% 55% / 0.28)",
                boxShadow: "0 0 40px -16px hsl(35 90% 55% / 0.12)",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "hsl(35 90% 55% / 0.12)", border: "1px solid hsl(35 90% 55% / 0.28)" }}
                >
                  <Crown className="w-5 h-5" style={{ color: "hsl(35 90% 62%)" }} />
                </div>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk'",
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "hsl(35 90% 62%)",
                  }}
                >
                  The Owner
                </h3>
              </div>
              <ul className="flex flex-col gap-4">
                {[
                  "Has a branded digital product live on the App Store & Google Play",
                  "App prepared for ad network monetization models",
                  "In-app purchase structure ready for upgrades and virtual items",
                  "Builds a digital asset they can promote, grow, and expand",
                  "Owns the product — not just a player inside someone else's",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "hsl(35 90% 58%)" }} />
                    <span style={{ fontFamily: "'Inter'", fontSize: 14, color: "hsl(218 16% 68%)", lineHeight: 1.6 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={0.18} className="mt-8">
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 12%)" }}
          >
            <p
              style={{
                fontFamily: "'Space Grotesk'",
                fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "hsl(35 90% 65%)",
              }}
            >
              The question isn't whether the app economy is real. The question is which side of it you want to be on.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Section 3: VSL ───────────────────────────────────────────────────────────

function VSLSection() {
  return (
    <section id="vsl" className="py-20" style={{ background: "hsl(226 28% 5%)" }}>
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">
        <FadeUp className="text-center mb-10">
          <SectionLabel>Video Presentation</SectionLabel>
          <SectionHeading>Watch: How The App Ownership Model Works.</SectionHeading>
          <SubText>
            This presentation walks through how mobile game apps are built, branded, monetized, and launched —
            without needing to code a single line.
          </SubText>
        </FadeUp>
        <FadeUp delay={0.08}>
          <VideoPlayer />
        </FadeUp>
      </div>
    </section>
  );
}

// ── Section 4: The App Economy ───────────────────────────────────────────────

const APP_EXAMPLES = [
  { icon: "🍬", label: "CC", bg: "linear-gradient(135deg,#ffcf70,#ff4d7d,#7c5cff)", name: "Candy Crush Saga", desc: "Match-3 puzzle with in-app purchases and long-term engagement.", pills: ["Puzzle", "IAP", "Ads"] },
  { icon: "M", label: "M", bg: "linear-gradient(135deg,#e21d2f,#111827)", name: "Monopoly GO!", desc: "Board-game style hit with events, collections, and upgrades.", pills: ["Board", "Events", "IAP"] },
  { icon: "♛", label: "RM", bg: "radial-gradient(circle at 50% 20%, #fde68a 0 12%, transparent 13%), linear-gradient(135deg,#2563eb,#7c3aed)", name: "Royal Match", desc: "Modern puzzle with 55M monthly active users.", pills: ["Puzzle", "55M MAU"] },
  { icon: "🎰", label: "SL", bg: "radial-gradient(circle at 30% 25%, rgba(255,215,0,.52), transparent 20%), linear-gradient(135deg,#3b0a45,#0f172a)", name: "Slotomania", desc: "Social casino entertainment with virtual coins and high replay.", pills: ["Casino Style", "Entertainment"] },
  { icon: "⚡", label: "SS", bg: "linear-gradient(135deg,#22c55e,#facc15,#ef4444)", name: "Subway Surfers", desc: "Arcade runner showing the power of simple gameplay and wide reach.", pills: ["Arcade", "Ads"] },
  { icon: "₵", label: "CM", bg: "radial-gradient(circle at 38% 35%, #ffd166 0 18%, transparent 19%), linear-gradient(135deg,#7c2d12,#ff8c42)", name: "Coin Master", desc: "Casino-style casual entertainment with social loops.", pills: ["Casino Style", "IAP"] },
  { icon: "⚔", label: "CR", bg: "linear-gradient(135deg,#2563eb,#7c3aed,#f59e0b)", name: "Clash Royale", desc: "Strategy card battler with progression and competition.", pills: ["Strategy", "IAP"] },
  { icon: "W", label: "WS", bg: "linear-gradient(135deg,#0f766e,#14b8a6)", name: "Wordscapes", desc: "Word puzzle category with broad casual audience appeal.", pills: ["Word", "Casual"] },
];

const CATEGORY_BARS = [
  { label: "Puzzle Games", pct: 92, tier: "Very High" },
  { label: "Board / Party", pct: 86, tier: "High" },
  { label: "Casino Style", pct: 82, tier: "High" },
  { label: "Word Games", pct: 74, tier: "Strong" },
  { label: "Arcade", pct: 64, tier: "Active" },
  { label: "Trivia / Quiz", pct: 54, tier: "Niche" },
  { label: "Kids / Learning", pct: 70, tier: "Growing" },
  { label: "Racing / Action", pct: 60, tier: "Active" },
];

function AppEconomySection() {
  return (
    <section id="app-economy" className="py-20">
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">
        <FadeUp className="text-center mb-12">
          <SectionLabel>The App Economy</SectionLabel>
          <SectionHeading>
            Mobile Games Are Not Just Games.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, hsl(38 95% 62%), hsl(24 90% 55%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              They Are Digital Products.
            </span>
          </SectionHeading>
          <SubText>
            The following examples show how different game categories generate revenue through downloads,
            in-app purchases, advertising, and ongoing player engagement across global app stores.
            These are educational market examples — not performance guarantees.
          </SubText>
        </FadeUp>

        {/* Market intel cards */}
        <FadeUp delay={0.06}>
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            <div
              className="rounded-2xl p-7"
              style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 14%)" }}
            >
              <SectionLabel>Market Intelligence (Educational Examples)</SectionLabel>
              <h3
                style={{
                  fontFamily: "'Space Grotesk'",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  marginBottom: 16,
                }}
              >
                App Economy At A Glance
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { num: "$54M", desc: "Candy Crush Saga monthly revenue estimate*" },
                  { num: "$134M", desc: "Monopoly GO! January 2026 revenue estimate*" },
                  { num: "55M", desc: "Royal Match monthly active users (reported)" },
                  { num: "$3B+", desc: "Social casino mobile category annual spend*" },
                ].map((s) => (
                  <div
                    key={s.desc}
                    className="rounded-xl p-4"
                    style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}
                  >
                    <p
                      style={{
                        fontFamily: "'Space Grotesk'",
                        fontSize: 26,
                        fontWeight: 700,
                        letterSpacing: "-0.04em",
                        color: "hsl(35 90% 62%)",
                        marginBottom: 4,
                      }}
                    >
                      {s.num}
                    </p>
                    <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 44%)", lineHeight: 1.55 }}>
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: "'Inter'", fontSize: 10, color: "hsl(218 16% 34%)", marginTop: 12, lineHeight: 1.6 }}>
                *Estimates based on market intelligence reporting. Not guaranteed outcomes for any app.
              </p>
            </div>

            {/* Category bars */}
            <div
              className="rounded-2xl p-7"
              style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 14%)" }}
            >
              <SectionLabel>Game Category Activity Level</SectionLabel>
              <h3
                style={{
                  fontFamily: "'Space Grotesk'",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  marginBottom: 16,
                }}
              >
                Popular Categories
              </h3>
              <div className="flex flex-col gap-3">
                {CATEGORY_BARS.map((c) => (
                  <div key={c.label}>
                    <div className="flex justify-between mb-1">
                      <span style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 58%)" }}>{c.label}</span>
                      <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, color: "hsl(35 90% 60%)" }}>{c.tier}</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: "hsl(224 22% 12%)" }}>
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ background: "linear-gradient(90deg, hsl(35 90% 55%), hsl(217 85% 58%))" }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${c.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: "'Inter'", fontSize: 10, color: "hsl(218 16% 32%)", marginTop: 12 }}>
                Educational illustration only. Not projections or guarantees.
              </p>
            </div>
          </div>
        </FadeUp>

        {/* App example cards */}
        <FadeUp delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {APP_EXAMPLES.map((app) => (
              <div
                key={app.name}
                className="rounded-2xl p-5"
                style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black mb-3"
                  style={{ background: app.bg, border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                >
                  {app.icon}
                </div>
                <h4 style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, letterSpacing: "-0.015em", marginBottom: 4 }}>
                  {app.name}
                </h4>
                <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 44%)", lineHeight: 1.5, marginBottom: 8 }}>
                  {app.desc}
                </p>
                <div className="flex flex-wrap gap-1">
                  {app.pills.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: "'Inter'",
                        fontSize: 10,
                        fontWeight: 600,
                        background: "hsl(35 90% 55% / 0.1)",
                        color: "hsl(35 90% 65%)",
                        border: "1px solid hsl(35 90% 55% / 0.2)",
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Section 5: How Apps Monetize ─────────────────────────────────────────────

const MONETIZE_CARDS = [
  {
    icon: Megaphone,
    title: "Advertising",
    desc: "Apps display banner, interstitial, and rewarded video ads from ad networks. Every impression and engagement can generate revenue.",
    color: "hsl(217 85% 58%)",
    bg: "hsl(217 85% 58% / 0.08)",
    border: "hsl(217 85% 58% / 0.2)",
  },
  {
    icon: ShoppingCart,
    title: "In-App Purchases",
    desc: "Players buy virtual coins, extra lives, power-ups, and unlockable levels inside the game using real money.",
    color: "hsl(35 90% 58%)",
    bg: "hsl(35 90% 55% / 0.08)",
    border: "hsl(35 90% 55% / 0.2)",
  },
  {
    icon: Star,
    title: "Premium Upgrades",
    desc: "Remove ads, unlock premium content, or access full game features through a one-time upgrade purchase.",
    color: "hsl(280 70% 65%)",
    bg: "hsl(280 70% 60% / 0.08)",
    border: "hsl(280 70% 60% / 0.2)",
  },
  {
    icon: Repeat,
    title: "Subscriptions",
    desc: "Recurring monthly or annual access to exclusive game content, features, or virtual currency bundles.",
    color: "hsl(142 60% 52%)",
    bg: "hsl(142 60% 50% / 0.08)",
    border: "hsl(142 60% 50% / 0.2)",
  },
  {
    icon: TrendingUp,
    title: "Sponsored Promotions",
    desc: "Partner with brands for in-game sponsored events, branded content, or sponsored item placements within gameplay.",
    color: "hsl(24 90% 55%)",
    bg: "hsl(24 90% 55% / 0.08)",
    border: "hsl(24 90% 55% / 0.2)",
  },
];

function MonetizeSection() {
  return (
    <section className="py-20" style={{ background: "hsl(226 28% 5%)" }}>
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">
        <FadeUp className="text-center mb-12">
          <SectionLabel>Revenue Models</SectionLabel>
          <SectionHeading>Five Ways A Mobile App Can Monetize.</SectionHeading>
          <SubText>
            When your app has an engaged audience, these are the monetization paths available.
            App Squad prepares your app structure for these models — results depend on user engagement and platform approval.
          </SubText>
        </FadeUp>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MONETIZE_CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeUp key={c.title} delay={i * 0.07}>
                <div
                  className="rounded-2xl p-6 h-full"
                  style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: c.color }} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk'",
                      fontSize: 17,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      marginBottom: 8,
                    }}
                  >
                    {c.title}
                  </h3>
                  <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 50%)", lineHeight: 1.65 }}>
                    {c.desc}
                  </p>
                </div>
              </FadeUp>
            );
          })}
          {/* 5 cards — add a highlight card for balance */}
          <FadeUp delay={0.35}>
            <div
              className="rounded-2xl p-6 h-full flex flex-col justify-center text-center"
              style={{
                background: "linear-gradient(135deg, hsl(35 90% 55% / 0.08), hsl(217 85% 58% / 0.06))",
                border: "1px solid hsl(35 90% 55% / 0.22)",
              }}
            >
              <DollarSign className="w-8 h-8 mx-auto mb-4" style={{ color: "hsl(35 90% 60%)" }} />
              <p
                style={{
                  fontFamily: "'Space Grotesk'",
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "hsl(35 90% 65%)",
                  lineHeight: 1.45,
                }}
              >
                App Squad prepares your app for these monetization structures from day one.
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ── Section 6: Why Most People Never Enter ───────────────────────────────────

const BARRIER_CARDS = [
  {
    icon: HelpCircle,
    title: "Too Technical",
    desc: "Most people assume you need to be a software developer. Coding, app store compliance, and technical setup feel impossible without a guide.",
    color: "hsl(0 65% 58%)",
    bg: "hsl(0 50% 14%)",
    border: "hsl(0 40% 20%)",
  },
  {
    icon: DollarSign,
    title: "Too Expensive",
    desc: "Custom app development from scratch can cost tens of thousands. Without a proven template system, the upfront cost is a dealbreaker.",
    color: "hsl(0 65% 58%)",
    bg: "hsl(0 50% 14%)",
    border: "hsl(0 40% 20%)",
  },
  {
    icon: Brain,
    title: "Too Confusing",
    desc: "App stores, monetization approval, ad networks, in-app purchase setup — without a roadmap, most people give up before they start.",
    color: "hsl(0 65% 58%)",
    bg: "hsl(0 50% 14%)",
    border: "hsl(0 40% 20%)",
  },
  {
    icon: Zap,
    title: "No Guidance",
    desc: "Without someone who has done it before, people waste months figuring out the process solo — or never start at all.",
    color: "hsl(0 65% 58%)",
    bg: "hsl(0 50% 14%)",
    border: "hsl(0 40% 20%)",
  },
];

function BarriersSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">
        <FadeUp className="text-center mb-12">
          <SectionLabel>The Problem</SectionLabel>
          <SectionHeading>Why Most People Never Cross To The Ownership Side.</SectionHeading>
          <SubText>
            The opportunity is real. The barriers are real too. Here's what stops people — and why none of them apply when you have the right system.
          </SubText>
        </FadeUp>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {BARRIER_CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeUp key={c.title} delay={i * 0.08}>
                <div
                  className="rounded-2xl p-6 flex gap-5"
                  style={{ background: "hsl(0 30% 6%)", border: "1px solid hsl(0 25% 13%)" }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: c.color }} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Space Grotesk'",
                        fontSize: 17,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        marginBottom: 6,
                        color: "hsl(0 60% 65%)",
                      }}
                    >
                      {c.title}
                    </h3>
                    <p style={{ fontFamily: "'Inter'", fontSize: 13.5, color: "hsl(218 10% 50%)", lineHeight: 1.65 }}>
                      {c.desc}
                    </p>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp delay={0.3}>
          <div
            className="rounded-2xl p-7 text-center"
            style={{
              background: "linear-gradient(135deg, hsl(35 90% 55% / 0.07), hsl(217 85% 58% / 0.05))",
              border: "1px solid hsl(35 90% 55% / 0.2)",
            }}
          >
            <p
              style={{
                fontFamily: "'Space Grotesk'",
                fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "hsl(35 90% 65%)",
              }}
            >
              This is exactly why App Squad was built.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Section 7: Why App Squad Exists ─────────────────────────────────────────

const PROCESS_STEPS = [
  {
    num: "01",
    icon: Puzzle,
    title: "Choose Template",
    desc: "Browse eight game categories and select the template that fits your brand, audience, and style goals.",
    color: "hsl(217 85% 60%)",
    bg: "hsl(217 85% 58% / 0.1)",
    border: "hsl(217 85% 58% / 0.22)",
  },
  {
    num: "02",
    icon: Gamepad2,
    title: "Customize Branding",
    desc: "Submit your app name, logo, color palette, target audience, and description through our guided customization form.",
    color: "hsl(35 90% 58%)",
    bg: "hsl(35 90% 55% / 0.1)",
    border: "hsl(35 90% 55% / 0.22)",
  },
  {
    num: "03",
    icon: DollarSign,
    title: "Prepare Monetization",
    desc: "App Squad structures your app for ad network integration, in-app purchase setup, and premium upgrade options.",
    color: "hsl(142 60% 52%)",
    bg: "hsl(142 60% 50% / 0.1)",
    border: "hsl(142 60% 50% / 0.22)",
  },
  {
    num: "04",
    icon: Rocket,
    title: "Launch",
    desc: "App Squad guides your submission to the Apple App Store and Google Play — from compliance preparation to publishing assistance.",
    color: "hsl(280 70% 65%)",
    bg: "hsl(280 70% 60% / 0.1)",
    border: "hsl(280 70% 60% / 0.22)",
  },
];

function AppSquadSection() {
  return (
    <section className="py-20" style={{ background: "hsl(226 28% 5%)" }}>
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">
        <FadeUp className="text-center mb-12">
          <SectionLabel>The Solution</SectionLabel>
          <SectionHeading>Why App Squad Exists.</SectionHeading>
          <SubText>
            App Squad was designed to close the gap between "I want to own an app" and "my app is live on both stores."
            A guided, step-by-step system — built for people with no technical background.
          </SubText>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-5">
          {PROCESS_STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <FadeUp key={s.title} delay={i * 0.09}>
                <div
                  className="rounded-2xl p-7 h-full"
                  style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: s.bg, border: `1px solid ${s.border}` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: s.color }} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'Space Grotesk'",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          color: s.color,
                          marginBottom: 4,
                          textTransform: "uppercase",
                        }}
                      >
                        Step {s.num}
                      </p>
                      <h3
                        style={{
                          fontFamily: "'Space Grotesk'",
                          fontSize: 20,
                          fontWeight: 700,
                          letterSpacing: "-0.025em",
                          marginBottom: 8,
                        }}
                      >
                        {s.title}
                      </h3>
                      <p style={{ fontFamily: "'Inter'", fontSize: 13.5, color: "hsl(218 16% 50%)", lineHeight: 1.65 }}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp delay={0.35} className="mt-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "No coding required", icon: CheckCircle2 },
              { label: "No technical experience needed", icon: CheckCircle2 },
              { label: "Guided every step of the way", icon: CheckCircle2 },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(35 90% 55% / 0.18)" }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "hsl(35 90% 58%)" }} />
                <span style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 62%)", lineHeight: 1.4 }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Section 8: Template Gallery ──────────────────────────────────────────────

const TEMPLATES = [
  { icon: <Puzzle className="w-5 h-5" />, name: "Puzzle Match", sub: "Casual replay model", desc: "Broad casual appeal with high replay potential.", tag: "Ads + Upgrades", bgClass: "puzzle" },
  { icon: <Type className="w-5 h-5" />, name: "Word Game", sub: "Simple and addictive", desc: "Simple, familiar, and niche-brand friendly.", tag: "Casual", bgClass: "word" },
  { icon: <Dices className="w-5 h-5" />, name: "Slots-Style Game", sub: "Entertainment focused", desc: "Entertainment-style template with visual excitement.", tag: "IAP Optional", bgClass: "slot" },
  { icon: <Zap className="w-5 h-5" />, name: "Arcade Game", sub: "Fast play sessions", desc: "Fast-play sessions and high-energy gameplay.", tag: "Ad Ready", bgClass: "arcade" },
  { icon: <Trophy className="w-5 h-5" />, name: "Trivia Game", sub: "Competitive engagement", desc: "Works for educational, niche, or brand-focused audiences.", tag: "Brandable", bgClass: "trivia" },
  { icon: <Brain className="w-5 h-5" />, name: "Kids Educational", sub: "Educational fun", desc: "Family-friendly learning and entertainment themes.", tag: "Educational", bgClass: "kids" },
  { icon: <Car className="w-5 h-5" />, name: "Racing Game", sub: "High energy visuals", desc: "Action-style game with energetic visuals.", tag: "Action", bgClass: "racing" },
  { icon: <Map className="w-5 h-5" />, name: "Adventure Game", sub: "Story-driven gameplay", desc: "Character and story-driven branded game experience.", tag: "Custom Theme", bgClass: "adventure" },
];

const TEMPLATE_BG: Record<string, string> = {
  puzzle: "radial-gradient(circle at 35% 28%, rgba(255,207,112,.55) 0%, transparent 22%), radial-gradient(circle at 72% 25%, rgba(61,242,209,.42) 0%, transparent 22%), linear-gradient(135deg,#1e3a8a,#4c1d95)",
  word: "radial-gradient(circle at 50% 18%, rgba(255,255,255,.18) 0%, transparent 16%), linear-gradient(135deg,#0f766e,#0f172a)",
  slot: "radial-gradient(circle at 30% 25%, rgba(255,215,0,.52) 0%, transparent 20%), radial-gradient(circle at 75% 22%, rgba(255,59,92,.45) 0%, transparent 24%), linear-gradient(135deg,#3b0a45,#0f172a)",
  arcade: "radial-gradient(circle at 25% 22%, rgba(255,0,98,.35) 0%, transparent 20%), radial-gradient(circle at 78% 30%, rgba(0,255,247,.35) 0%, transparent 22%), linear-gradient(135deg,#111827,#4c1d95)",
  trivia: "radial-gradient(circle at 50% 18%, rgba(255,207,112,.32) 0%, transparent 16%), linear-gradient(135deg,#7c2d12,#111827)",
  kids: "radial-gradient(circle at 25% 20%, rgba(255,255,255,.22) 0%, transparent 18%), linear-gradient(135deg,#2563eb,#16a34a,#f59e0b)",
  racing: "radial-gradient(circle at 75% 18%, rgba(255,255,255,.18) 0%, transparent 16%), linear-gradient(135deg,#111827,#dc2626)",
  adventure: "radial-gradient(circle at 50% 20%, rgba(255,207,112,.28) 0%, transparent 16%), linear-gradient(135deg,#14532d,#1e293b,#4c1d95)",
};

function TemplateGallery() {
  return (
    <section id="templates" className="py-20">
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">
        <FadeUp className="text-center mb-12">
          <SectionLabel>Template Gallery</SectionLabel>
          <SectionHeading>Choose Your Game Category.</SectionHeading>
          <SubText>
            Eight professionally designed game templates — each fully customizable with your brand name,
            colors, logo, and identity. Pick the style that fits your audience.
          </SubText>
        </FadeUp>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TEMPLATES.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.05}>
              <div
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "hsl(35 90% 55% / 0.4)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "hsl(224 22% 13%)")}
              >
                {/* Art */}
                <div className="h-36 relative" style={{ background: TEMPLATE_BG[t.bgClass] }}>
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,.5), transparent 50%)" }}
                  />
                  <div className="absolute top-3 right-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        color: "#fff",
                      }}
                    >
                      {t.icon}
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <p style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, marginBottom: 1 }}>{t.name}</p>
                    <p style={{ fontFamily: "'Inter'", fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{t.sub}</p>
                  </div>
                </div>
                {/* Body */}
                <div className="p-4">
                  <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 48%)", lineHeight: 1.55, marginBottom: 8 }}>
                    {t.desc}
                  </p>
                  <span
                    className="inline-flex px-2.5 py-1 rounded-full"
                    style={{
                      fontFamily: "'Inter'",
                      fontSize: 10,
                      fontWeight: 600,
                      background: "hsl(35 90% 55% / 0.1)",
                      color: "hsl(35 90% 65%)",
                      border: "1px solid hsl(35 90% 55% / 0.2)",
                    }}
                  >
                    {t.tag}
                  </span>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 9: Package Comparison ───────────────────────────────────────────

const PACKAGES = [
  {
    name: "App Launch Essentials",
    badge: "Foundation",
    badgeColor: "hsl(218 16% 50%)",
    badgeText: "hsl(218 16% 90%)",
    desc: "Everything you need to get your branded mobile game app designed, monetized, and submitted to both app stores.",
    features: [
      "1 custom-branded game template",
      "App name, logo & color customization",
      "Ad network monetization preparation",
      "In-app purchase structure setup",
      "Apple App Store submission assistance",
      "Google Play submission assistance",
      "Basic onboarding support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "App Ownership Accelerator",
    badge: "Most Popular",
    badgeColor: "hsl(35 90% 55%)",
    badgeText: "#180b02",
    desc: "The complete ownership package — includes advanced monetization setup, premium branding, and priority launch support.",
    features: [
      "Everything in App Launch Essentials",
      "Priority build queue",
      "Advanced in-app purchase configuration",
      "Premium upgrade tier setup",
      "Subscription model preparation",
      "Dedicated onboarding coordinator",
      "Launch strategy consultation",
      "90-day post-launch support window",
    ],
    cta: "Enroll Now",
    highlight: true,
  },
  {
    name: "Digital Asset Empire",
    badge: "Maximum Ownership",
    badgeColor: "hsl(280 70% 60%)",
    badgeText: "#fff",
    desc: "For serious entrepreneurs — multiple templates, expanded monetization, and full white-glove app launch support.",
    features: [
      "Everything in App Ownership Accelerator",
      "Up to 3 branded app templates",
      "Multiple monetization structures",
      "Cross-app strategy consultation",
      "Expanded app store optimization support",
      "Full white-glove onboarding",
      "Priority support for 6 months",
      "Revenue model review sessions",
    ],
    cta: "Claim Your Empire",
    highlight: false,
  },
];

function PackagesSection({ onApply }: { onApply: () => void }) {
  return (
    <section className="py-20" style={{ background: "hsl(226 28% 5%)" }}>
      <div className="container mx-auto px-5 md:px-8 max-w-5xl">
        <FadeUp className="text-center mb-12">
          <SectionLabel>Package Comparison</SectionLabel>
          <SectionHeading>Choose The Right Launch Path.</SectionHeading>
          <SubText>
            Three options — each designed for a different level of ownership ambition.
            All packages include App Squad's core guided launch process.
          </SubText>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-5">
          {PACKAGES.map((pkg, i) => (
            <FadeUp key={pkg.name} delay={i * 0.08}>
              <div
                className="rounded-2xl overflow-hidden flex flex-col h-full"
                style={{
                  background: pkg.highlight ? "hsl(226 32% 9%)" : "hsl(226 32% 8%)",
                  border: pkg.highlight
                    ? "1px solid hsl(35 90% 55% / 0.4)"
                    : "1px solid hsl(224 22% 13%)",
                  boxShadow: pkg.highlight ? "0 0 40px -12px hsl(35 90% 55% / 0.18)" : "none",
                }}
              >
                <div className="p-7 flex-1">
                  <span
                    className="inline-flex px-3 py-1 rounded-full mb-4"
                    style={{
                      fontFamily: "'Inter'",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      background: pkg.badgeColor,
                      color: pkg.badgeText,
                    }}
                  >
                    {pkg.badge}
                  </span>
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk'",
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: "-0.025em",
                      marginBottom: 10,
                      lineHeight: 1.2,
                    }}
                  >
                    {pkg.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter'",
                      fontSize: 13,
                      color: "hsl(218 16% 50%)",
                      lineHeight: 1.65,
                      marginBottom: 20,
                    }}
                  >
                    {pkg.desc}
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: pkg.highlight ? "hsl(35 90% 58%)" : "hsl(217 85% 58%)" }}
                        />
                        <span style={{ fontFamily: "'Inter'", fontSize: 12.5, color: "hsl(218 16% 60%)", lineHeight: 1.5 }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-7 pb-7">
                  <button
                    onClick={onApply}
                    className={pkg.highlight ? "btn-gold" : "btn-ghost"}
                    style={{
                      width: "100%",
                      height: 48,
                      fontSize: 14,
                      fontWeight: 600,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      color: pkg.highlight ? "#fff" : "rgba(255,255,255,0.75)",
                    }}
                  >
                    {pkg.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.3} className="mt-6">
          <p
            style={{
              fontFamily: "'Inter'",
              fontSize: 12,
              color: "hsl(218 16% 34%)",
              textAlign: "center",
              lineHeight: 1.65,
            }}
          >
            Pricing and package details will be discussed during your strategy call.
            App Squad does not guarantee earnings, downloads, rankings, or return on investment.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Section 10: Enrollment ───────────────────────────────────────────────────

function EnrollmentSection({ onApply }: { onApply: () => void }) {
  return (
    <section id="enroll" className="py-20">
      <div className="container mx-auto px-5 md:px-8 max-w-4xl">
        <FadeUp>
          <div
            className="rounded-3xl p-10 md:p-14 text-center"
            style={{
              background: "linear-gradient(135deg, hsl(226 32% 9%), hsl(226 28% 7%))",
              border: "1px solid hsl(35 90% 55% / 0.22)",
              boxShadow: "0 0 60px -20px hsl(35 90% 55% / 0.14), 0 40px 80px -20px hsl(228 42% 4% / 0.8)",
            }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.26)" }}
            >
              <Rocket className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 62%)" }} />
              <span
                style={{
                  fontFamily: "'Inter'",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "hsl(35 90% 65%)",
                }}
              >
                Enrollment
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Space Grotesk'",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                fontWeight: 700,
                letterSpacing: "-0.035em",
                lineHeight: 1.08,
                marginBottom: 16,
              }}
            >
              Choose Your Game.
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, hsl(38 95% 62%), hsl(24 90% 55%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Customize Your Brand. Launch Your Digital Asset.
              </span>
            </h2>

            <p
              style={{
                fontFamily: "'Inter'",
                fontSize: 16,
                lineHeight: 1.75,
                color: "hsl(218 16% 52%)",
                fontWeight: 300,
                maxWidth: 560,
                margin: "0 auto 36px",
              }}
            >
              The next step is a no-pressure strategy call with the App Squad team.
              We'll walk through your game selection, package options, and answer every question before you decide anything.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button
                onClick={onApply}
                className="btn-gold h-14 px-10 text-[15px] font-semibold rounded-xl inline-flex items-center gap-2.5 text-white"
              >
                Apply For A Strategy Call <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
              {[
                "No pressure. No obligation.",
                "30-minute call with our team",
                "Walk through your launch path",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl"
                  style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(35 90% 58%)" }} />
                  <span style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 55%)" }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div
              className="flex items-start gap-3 p-5 rounded-2xl text-left max-w-2xl mx-auto"
              style={{ background: "hsl(226 28% 5%)", border: "1px solid hsl(224 22% 10%)" }}
            >
              <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(218 16% 34%)" }} />
              <p style={{ fontFamily: "'Inter'", fontSize: 11, lineHeight: 1.7, color: "hsl(218 16% 36%)", fontWeight: 300 }}>
                App Squad provides custom mobile game app development, monetization preparation, and app store
                publishing assistance. App Squad does not guarantee earnings, downloads, rankings, app approvals,
                ad revenue, in-app purchase revenue, profits, or return on investment. Results vary and depend on
                marketing, user engagement, platform rules, audience demand, app quality, consistency, and
                third-party approval processes.
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Presentation() {
  const [, navigate] = useLocation();
  const goApply = () => { navigate("/apply"); window.scrollTo({ top: 0 }); };

  return (
    <div className="min-h-screen relative">
      <HeroSection onApply={goApply} />
      <Divider />
      <ConsumerOwnerSection />
      <Divider />
      <VSLSection />
      <Divider />
      <AppEconomySection />
      <Divider />
      <MonetizeSection />
      <Divider />
      <BarriersSection />
      <Divider />
      <AppSquadSection />
      <Divider />
      <TemplateGallery />
      <Divider />
      <PackagesSection onApply={goApply} />
      <Divider />
      <EnrollmentSection onApply={goApply} />
    </div>
  );
}
