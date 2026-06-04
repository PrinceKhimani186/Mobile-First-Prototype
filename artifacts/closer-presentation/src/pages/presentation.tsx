import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Shield, VideoOff, Smartphone,
  DollarSign, TrendingUp, Users, Lock, Zap, Star, Package,
  BarChart3, Globe, ChevronRight, Award, Layers, Clock
} from "lucide-react";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.7, delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

function VideoPlayer() {
  const [error, setError] = useState(false);
  const VIDEO_URL = "https://player.vimeo.com/video/1197652826?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&dnt=1";

  if (error) {
    return (
      <div style={{ aspectRatio: "16/9", background: "#111620", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}
        className="flex flex-col items-center justify-center gap-4 p-10 text-center">
        <VideoOff className="w-10 h-10" style={{ color: "rgba(255,255,255,0.2)" }} />
        <div>
          <p className="font-display font-semibold mb-2" style={{ fontSize: 16 }}>Video Temporarily Unavailable</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>
            Please contact App Squad support or continue to the enrollment section below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: 16,
      boxShadow: "0 0 0 1px rgba(245,163,60,0.15), 0 32px 80px -20px rgba(0,0,0,0.9), 0 0 60px -24px rgba(245,163,60,0.08)"
    }}>
      <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: 16, overflow: "hidden" }}>
        <iframe
          src={VIDEO_URL}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
          title="App Squad Presentation"
          onError={() => setError(true)}
        />
      </div>
    </div>
  );
}

const APP_CATEGORIES = [
  { label: "Games & Entertainment", pct: 72, color: "#F5A33C" },
  { label: "Health & Fitness", pct: 58, color: "#60A5FA" },
  { label: "Education & Learning", pct: 51, color: "#A78BFA" },
  { label: "Productivity Tools", pct: 44, color: "#34D399" },
  { label: "Lifestyle & Social", pct: 67, color: "#F472B6" },
];

const APP_EXAMPLES = [
  { name: "Candy Crush Saga", rev: "$400M+/yr", icon: "🍬" },
  { name: "Subway Surfers", rev: "$200M+/yr", icon: "🏄" },
  { name: "Clash of Clans", rev: "$1.5B+/yr", icon: "⚔️" },
  { name: "Roblox", rev: "$2.7B+/yr", icon: "🎮" },
  { name: "Duolingo", rev: "$500M+/yr", icon: "🦜" },
  { name: "Calm", rev: "$150M+/yr", icon: "🧘" },
  { name: "MyFitnessPal", rev: "$120M+/yr", icon: "💪" },
  { name: "PicsArt", rev: "$100M+/yr", icon: "🎨" },
];

const MONETIZE_METHODS = [
  { icon: <TrendingUp className="w-5 h-5" />, title: "In-App Advertising", desc: "Display ads, rewarded video, interstitials — monetize every session without charging users a cent." },
  { icon: <DollarSign className="w-5 h-5" />, title: "In-App Purchases", desc: "Coins, power-ups, premium levels. Players pay small amounts repeatedly — recurring revenue on autopilot." },
  { icon: <Star className="w-5 h-5" />, title: "Premium Subscriptions", desc: "Monthly or annual plans unlock exclusive content, ad-free experience, and advanced features." },
  { icon: <Package className="w-5 h-5" />, title: "Sponsored Content", desc: "Brand integrations and sponsored levels open premium partnership channels as your audience grows." },
  { icon: <Globe className="w-5 h-5" />, title: "App Licensing & Resale", desc: "Successful apps can be licensed, white-labeled, or sold outright — turning your digital asset into a liquid one." },
];

const BARRIERS = [
  { icon: <Lock className="w-6 h-6" />, title: "They Think It Requires Coding", desc: "Most people believe you need a computer science degree to build an app. The truth? Modern app development tools have completely removed that barrier — you just need the right partner." },
  { icon: <DollarSign className="w-6 h-6" />, title: "They Think It's Too Expensive", desc: "Custom app development can cost $100K–$500K+. Without a proven template system and shared infrastructure, most people can't afford entry. App Squad changes that equation entirely." },
  { icon: <Clock className="w-6 h-6" />, title: "They Don't Know Where to Start", desc: "App stores, developer accounts, publishing guidelines, monetization setup — the process is labyrinthine without a guide who's done it hundreds of times." },
  { icon: <BarChart3 className="w-6 h-6" />, title: "They're Afraid of the Unknown", desc: "Without proof that the model works, most people choose the safety of a paycheck. But safety has a cost — it's called opportunity cost, and it compounds every year." },
];

const PROCESS_STEPS = [
  { num: "01", title: "Strategy Call", desc: "We assess your goals, target audience, and ideal app category. You leave with a clear launch blueprint." },
  { num: "02", title: "Template Selection & Customization", desc: "We select from 50+ proven game templates and customize branding, colors, characters, and identity to match your vision." },
  { num: "03", title: "Monetization Setup", desc: "Ad networks, in-app purchase flows, and analytics integrations are configured and tested before launch." },
  { num: "04", title: "App Store Launch", desc: "We handle App Store and Google Play submission, compliance, and publishing — you get the keys to your live digital asset." },
];

const TEMPLATES = [
  { name: "Infinite Runner", genre: "Action", icon: "🏃" },
  { name: "Match-3 Puzzle", genre: "Puzzle", icon: "🧩" },
  { name: "Tower Defense", genre: "Strategy", icon: "🏰" },
  { name: "Word Challenge", genre: "Trivia", icon: "📝" },
  { name: "Endless Racer", genre: "Racing", icon: "🏎️" },
  { name: "Bubble Shooter", genre: "Casual", icon: "🫧" },
  { name: "Quiz Master", genre: "Education", icon: "🎓" },
  { name: "Merge Adventure", genre: "Idle", icon: "✨" },
];

const PACKAGES = [
  {
    name: "App Launch\nEssentials",
    tag: "Starter",
    tagColor: "#60A5FA",
    price: "Entry-Level",
    features: [
      "1 custom mobile game app",
      "Template selection & branding",
      "Ad monetization setup",
      "App Store submission",
      "30-day post-launch support",
    ],
    cta: "Choose Essentials",
    highlight: false,
  },
  {
    name: "App Ownership\nAccelerator",
    tag: "Most Popular",
    tagColor: "#F5A33C",
    price: "Professional",
    features: [
      "1 custom mobile game app",
      "Advanced branding & custom UI",
      "Full monetization suite (ads + IAP)",
      "App Store + Google Play",
      "60-day growth support",
      "Revenue optimization coaching",
      "Analytics dashboard access",
    ],
    cta: "Choose Accelerator",
    highlight: true,
  },
  {
    name: "Digital Asset\nEmpire",
    tag: "Elite",
    tagColor: "#A78BFA",
    price: "Premium",
    features: [
      "Up to 3 custom mobile game apps",
      "Full custom design & development",
      "Complete monetization architecture",
      "Priority publishing & compliance",
      "90-day dedicated launch manager",
      "Quarterly strategy sessions",
      "App portfolio growth roadmap",
    ],
    cta: "Choose Empire",
    highlight: false,
  },
];

function CategoryBar({ label, pct, color, delay }: { label: string; pct: number; color: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div ref={ref} className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span style={{ fontFamily: "'Inter'", fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>{label}</span>
        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "100%", background: color, borderRadius: 3 }}
        />
      </div>
    </div>
  );
}

export default function Presentation() {
  const scrollToEnroll = () => {
    document.getElementById("enroll")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section className="section relative" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="glow-gold" style={{ width: 700, height: 350, top: -80, left: "50%", transform: "translateX(-50%)", background: "radial-gradient(ellipse, rgba(245,163,60,0.12) 0%, transparent 68%)" }} />

        <div className="container-narrow relative z-10 text-center">
          <FadeUp>
            <div className="badge-gold mb-6" style={{ margin: "0 auto 24px" }}>
              <Smartphone className="w-3.5 h-3.5" />
              Exclusive Owner Briefing
            </div>
          </FadeUp>

          <FadeUp delay={0.07}>
            <h1 className="font-display" style={{
              fontSize: "clamp(2.1rem, 5.5vw, 3.6rem)",
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.08,
              marginBottom: 22,
            }}>
              The Fastest Path to{" "}
              <span style={{ color: "var(--gold)" }}>Owning a Digital Asset</span>{" "}
              That Works While You Sleep
            </h1>
          </FadeUp>

          <FadeUp delay={0.13}>
            <p style={{ fontFamily: "'Inter'", fontSize: "clamp(15px, 2vw, 17px)", lineHeight: 1.75, color: "var(--text-muted)", fontWeight: 300, maxWidth: 580, margin: "0 auto 36px" }}>
              Most people trade time for money their entire lives. A small group of owners collect revenue from assets — 24 hours a day, even when they're not working. Today, we're going to show you exactly how to join that group using mobile apps.
            </p>
          </FadeUp>

          <FadeUp delay={0.18}>
            <button className="btn-gold" style={{ padding: "18px 36px", fontSize: 16 }} onClick={scrollToEnroll}>
              See The Opportunity
              <ArrowRight className="w-4 h-4" />
            </button>
          </FadeUp>

          <FadeUp delay={0.22}>
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              {[
                { val: "$935B", label: "App Economy by 2028" },
                { val: "8.9B+", label: "App downloads per quarter" },
                { val: "50+", label: "Launch templates ready" },
              ].map(s => (
                <div key={s.val} className="text-center">
                  <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)", letterSpacing: "-0.03em" }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2, fontWeight: 400 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      <div className="divider" />

      {/* ── 2. CONSUMER vs OWNER ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <FadeUp className="text-center mb-12">
            <div className="badge-gold mb-5" style={{ margin: "0 auto 20px" }}>The Mindset Shift</div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              There Are Two Types of People<br />
              <span style={{ color: "var(--gold)" }}>in the App Economy</span>
            </h2>
          </FadeUp>

          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {/* Consumer */}
            <FadeUp delay={0.05}>
              <div className="card p-8 h-full" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="font-display font-bold mb-5" style={{ fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                  The Consumer
                </div>
                <ul className="flex flex-col gap-4">
                  {[
                    "Pays for apps every month",
                    "Generates revenue for app owners",
                    "Trades time for money at work",
                    "Income stops when they stop working",
                    "Watches others build wealth",
                  ].map(item => (
                    <li key={item} className="flex gap-3 items-start">
                      <span style={{ color: "#EF4444", fontSize: 16, lineHeight: 1.5, flexShrink: 0 }}>✕</span>
                      <span style={{ fontFamily: "'Inter'", fontSize: 14, lineHeight: 1.65, color: "var(--text-muted)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>

            {/* Owner */}
            <FadeUp delay={0.12}>
              <div className="card-gold p-8 h-full" style={{ position: "relative", overflow: "hidden" }}>
                <div className="glow-gold" style={{ width: 300, height: 200, top: -60, right: -60, background: "radial-gradient(ellipse, rgba(245,163,60,0.08) 0%, transparent 70%)" }} />
                <div className="font-display font-bold mb-5" style={{ fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)" }}>
                  The Owner
                </div>
                <ul className="flex flex-col gap-4">
                  {[
                    "Collects revenue from app users 24/7",
                    "Earns while sleeping, traveling, or resting",
                    "Builds a portfolio of digital cash-flow assets",
                    "Revenue continues whether they work or not",
                    "Controls an asset others can't take away",
                  ].map(item => (
                    <li key={item} className="flex gap-3 items-start">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--gold)", flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Inter'", fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.8)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.2} className="mt-8 text-center">
            <p style={{ fontFamily: "'Inter'", fontSize: 15, lineHeight: 1.75, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto" }}>
              The question isn't whether the app economy is real — it generated <strong style={{ color: "rgba(255,255,255,0.75)" }}>$935 billion in 2023 alone.</strong> The question is which side of that economy you're on.
            </p>
          </FadeUp>
        </div>
      </section>

      <div className="divider" />

      {/* ── 3. VSL ───────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 72, paddingBottom: 72 }}>
        <div className="container-narrow">
          <FadeUp className="text-center mb-10">
            <div className="badge-gold mb-5" style={{ margin: "0 auto 20px" }}>
              <Zap className="w-3.5 h-3.5" />
              Watch This First
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              The Complete App Ownership Presentation
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.7 }}>
              Watch the full presentation before scrolling. Everything below will make much more sense.
            </p>
          </FadeUp>

          <FadeUp delay={0.08}>
            <VideoPlayer />
          </FadeUp>

          <FadeUp delay={0.15} className="mt-8">
            <div className="card p-6">
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>
                In This Presentation
              </p>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                {[
                  "How game templates are selected and customized",
                  "How apps are branded with your identity",
                  "How monetization options are set up",
                  "How App Store submission actually works",
                  "What the guided launch process looks like",
                  "Real numbers from the mobile app economy",
                ].map(item => (
                  <div key={item} className="flex gap-2.5 items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--gold)" }} />
                    <span style={{ fontFamily: "'Inter'", fontSize: 12.5, lineHeight: 1.65, color: "var(--text-muted)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <div className="divider" />

      {/* ── 4. APP ECONOMY ───────────────────────────────────────── */}
      <section className="section" style={{ background: "rgba(17,22,32,0.5)" }}>
        <div className="container">
          <FadeUp className="text-center mb-12">
            <div className="badge-gold mb-5" style={{ margin: "0 auto 20px" }}>
              <BarChart3 className="w-3.5 h-3.5" />
              Market Opportunity
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              The App Economy Is the<br />
              <span style={{ color: "var(--gold)" }}>Largest Wealth Transfer of Our Generation</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 15, color: "var(--text-muted)", maxWidth: 580, margin: "16px auto 0", lineHeight: 1.75 }}>
              Billions of dollars flow from consumers to app owners every single day. Here's where the money is moving — and which categories are growing fastest.
            </p>
          </FadeUp>

          {/* Stats row */}
          <FadeUp delay={0.05} className="grid gap-4 mb-12" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {[
              { val: "$935B", label: "Global app market 2023", color: "#F5A33C" },
              { val: "6.3B", label: "Smartphone users worldwide", color: "#60A5FA" },
              { val: "35B+", label: "App downloads in Q4 2023", color: "#A78BFA" },
              { val: "$4.80", label: "Avg revenue per user/day", color: "#34D399" },
            ].map(s => (
              <div key={s.val} className="card p-6 text-center">
                <div className="font-display font-bold" style={{ fontSize: 28, color: s.color, letterSpacing: "-0.03em" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6, lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </FadeUp>

          <div className="grid gap-10" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {/* Category bars */}
            <FadeIn>
              <div className="card p-7 h-full">
                <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 20 }}>
                  Revenue Growth by Category
                </p>
                <div className="flex flex-col gap-5">
                  {APP_CATEGORIES.map((cat, i) => (
                    <CategoryBar key={cat.label} {...cat} delay={i * 0.1} />
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* App examples */}
            <FadeIn delay={0.08}>
              <div className="card p-7 h-full">
                <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 20 }}>
                  What Successful Apps Generate
                </p>
                <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  {APP_EXAMPLES.map(app => (
                    <div key={app.name} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontSize: 18 }}>{app.icon}</span>
                        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{app.name}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600 }}>{app.rev}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "var(--text-dim)", marginTop: 14, lineHeight: 1.6 }}>
                  * Revenue figures are estimates based on public data and industry reporting.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── 5. HOW APPS MONETIZE ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <FadeUp className="text-center mb-12">
            <div className="badge-gold mb-5" style={{ margin: "0 auto 20px" }}>
              <DollarSign className="w-3.5 h-3.5" />
              Revenue Architecture
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              5 Ways Your App Can<br />
              <span style={{ color: "var(--gold)" }}>Generate Revenue Simultaneously</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 15, color: "var(--text-muted)", maxWidth: 540, margin: "16px auto 0", lineHeight: 1.75 }}>
              The best app businesses don't rely on a single revenue stream. They layer them — creating multiple income channels from the same asset.
            </p>
          </FadeUp>

          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {MONETIZE_METHODS.map((m, i) => (
              <FadeUp key={m.title} delay={i * 0.07}>
                <div className="card p-7 h-full" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245,163,60,0.1)", border: "1px solid rgba(245,163,60,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)" }}>
                    {m.icon}
                  </div>
                  <div>
                    <div className="font-display font-semibold mb-2" style={{ fontSize: 15 }}>{m.title}</div>
                    <p style={{ fontFamily: "'Inter'", fontSize: 13.5, lineHeight: 1.7, color: "var(--text-muted)" }}>{m.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── 6. WHY MOST PEOPLE NEVER ENTER ──────────────────────── */}
      <section className="section" style={{ background: "rgba(17,22,32,0.5)" }}>
        <div className="container">
          <FadeUp className="text-center mb-12">
            <div className="badge-gold mb-5" style={{ margin: "0 auto 20px" }}>
              <Lock className="w-3.5 h-3.5" />
              The Real Barriers
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Why 99% of People Who<br />
              <span style={{ color: "var(--gold)" }}>Know This Never Take Action</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 15, color: "var(--text-muted)", maxWidth: 580, margin: "16px auto 0", lineHeight: 1.75 }}>
              The information about the app economy is public. So why don't more people own apps? Four real barriers stop them — and App Squad was built to demolish all four.
            </p>
          </FadeUp>

          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {BARRIERS.map((b, i) => (
              <FadeUp key={b.title} delay={i * 0.07}>
                <div className="card p-7 h-full">
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", marginBottom: 16 }}>
                    {b.icon}
                  </div>
                  <div className="font-display font-semibold mb-3" style={{ fontSize: 15 }}>{b.title}</div>
                  <p style={{ fontFamily: "'Inter'", fontSize: 13.5, lineHeight: 1.72, color: "var(--text-muted)" }}>{b.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── 7. WHY APP SQUAD EXISTS ──────────────────────────────── */}
      <section className="section">
        <div className="container">
          <FadeUp className="text-center mb-14">
            <div className="badge-gold mb-5" style={{ margin: "0 auto 20px" }}>
              <Award className="w-3.5 h-3.5" />
              The Solution
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              App Squad Was Built to<br />
              <span style={{ color: "var(--gold)" }}>Make App Ownership Accessible</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 15, color: "var(--text-muted)", maxWidth: 580, margin: "16px auto 0", lineHeight: 1.75 }}>
              We've taken every barrier — technical, financial, logistical, psychological — and built a guided launch system that removes them all. Here's exactly how we do it.
            </p>
          </FadeUp>

          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            {PROCESS_STEPS.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.09}>
                <div className="card-gold p-7 flex gap-6 items-start">
                  <div className="font-display font-bold shrink-0" style={{ fontSize: 36, color: "rgba(245,163,60,0.25)", lineHeight: 1, minWidth: 44, letterSpacing: "-0.03em" }}>
                    {step.num}
                  </div>
                  <div>
                    <div className="font-display font-semibold mb-2" style={{ fontSize: 17 }}>{step.title}</div>
                    <p style={{ fontFamily: "'Inter'", fontSize: 14, lineHeight: 1.72, color: "var(--text-muted)" }}>{step.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── 8. TEMPLATE GALLERY ──────────────────────────────────── */}
      <section className="section" style={{ background: "rgba(17,22,32,0.5)" }}>
        <div className="container">
          <FadeUp className="text-center mb-12">
            <div className="badge-gold mb-5" style={{ margin: "0 auto 20px" }}>
              <Layers className="w-3.5 h-3.5" />
              Template Library
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              50+ Proven Game Templates<br />
              <span style={{ color: "var(--gold)" }}>Ready to Become Your Brand</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 15, color: "var(--text-muted)", maxWidth: 560, margin: "16px auto 0", lineHeight: 1.75 }}>
              Every template has been tested across real app stores with real users. You're not starting from scratch — you're starting from proven.
            </p>
          </FadeUp>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {TEMPLATES.map((tmpl, i) => (
              <FadeUp key={tmpl.name} delay={i * 0.05}>
                <div className="card p-6 text-center" style={{ transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(245,163,60,0.3)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{tmpl.icon}</div>
                  <div className="font-display font-semibold mb-1" style={{ fontSize: 14 }}>{tmpl.name}</div>
                  <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.06em" }}>{tmpl.genre}</div>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3} className="text-center mt-8">
            <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "var(--text-dim)" }}>
              And 40+ more categories — puzzle, idle, arcade, simulation, trivia, and beyond.
            </p>
          </FadeUp>
        </div>
      </section>

      <div className="divider" />

      {/* ── 9. PACKAGES ─────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <FadeUp className="text-center mb-12">
            <div className="badge-gold mb-5" style={{ margin: "0 auto 20px" }}>
              <Package className="w-3.5 h-3.5" />
              Investment Tiers
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Choose Your Path<br />
              <span style={{ color: "var(--gold)" }}>Into App Ownership</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 15, color: "var(--text-muted)", maxWidth: 520, margin: "16px auto 0", lineHeight: 1.75 }}>
              We offer three levels of partnership depending on your goals, timeline, and budget. All include the core App Squad launch process.
            </p>
          </FadeUp>

          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {PACKAGES.map((pkg, i) => (
              <FadeUp key={pkg.name} delay={i * 0.09}>
                <div
                  style={{
                    background: pkg.highlight ? "linear-gradient(145deg, #161C26 0%, #12181F 100%)" : "var(--bg-card)",
                    border: pkg.highlight ? "1px solid rgba(245,163,60,0.4)" : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: "32px 28px",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: pkg.highlight ? "0 0 60px -20px rgba(245,163,60,0.15)" : "none",
                  }}>
                  {pkg.highlight && (
                    <div className="glow-gold" style={{ width: 250, height: 150, top: -60, right: -40, background: "radial-gradient(ellipse, rgba(245,163,60,0.08) 0%, transparent 70%)" }} />
                  )}

                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: `${pkg.tagColor}15`,
                    border: `1px solid ${pkg.tagColor}30`,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: pkg.tagColor,
                    marginBottom: 16,
                    alignSelf: "flex-start",
                  }}>
                    {pkg.tag}
                  </div>

                  <h3 className="font-display font-bold mb-1" style={{ fontSize: 21, lineHeight: 1.2, whiteSpace: "pre-line" }}>{pkg.name}</h3>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 24, fontStyle: "italic" }}>{pkg.price} Investment</div>

                  <ul className="flex flex-col gap-3 flex-1">
                    {pkg.features.map(f => (
                      <li key={f} className="flex gap-2.5 items-start">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: pkg.highlight ? "var(--gold)" : "#34D399" }} />
                        <span style={{ fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.72)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={scrollToEnroll}
                    style={{
                      marginTop: 28,
                      width: "100%",
                      padding: "14px 0",
                      borderRadius: 10,
                      fontFamily: "'Space Grotesk'",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      border: pkg.highlight ? "none" : `1px solid rgba(255,255,255,0.12)`,
                      background: pkg.highlight ? "linear-gradient(135deg, #F5A33C 0%, #E8891A 100%)" : "transparent",
                      color: pkg.highlight ? "#0B0F14" : "rgba(255,255,255,0.7)",
                      transition: "opacity 0.18s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                    {pkg.cta}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3} className="text-center mt-8">
            <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "var(--text-dim)" }}>
              Investment levels are tailored to your specific goals and launch scope. Pricing is confirmed during enrollment.
            </p>
          </FadeUp>
        </div>
      </section>

      <div className="divider" />

      {/* ── 10. ENROLLMENT ──────────────────────────────────────── */}
      <section id="enroll" className="section relative" style={{ paddingTop: 96, paddingBottom: 120 }}>
        <div className="glow-gold" style={{ width: 700, height: 400, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(ellipse, rgba(245,163,60,0.1) 0%, transparent 65%)" }} />
        <div className="grid-bg absolute inset-0 opacity-20" />

        <div className="container-narrow relative z-10 text-center">
          <FadeUp>
            <div className="badge-gold mb-6" style={{ margin: "0 auto 24px" }}>
              <Star className="w-3.5 h-3.5" />
              Enrollment
            </div>
          </FadeUp>

          <FadeUp delay={0.07}>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.08, marginBottom: 22 }}>
              Here's Exactly What Happens<br />
              <span style={{ color: "var(--gold)" }}>When You Enroll Today</span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.12}>
            <p style={{ fontFamily: "'Inter'", fontSize: 16, lineHeight: 1.8, color: "var(--text-muted)", maxWidth: 580, margin: "0 auto 48px" }}>
              Enrollment is a straightforward five-step process. Once you're in, your App Squad team takes over — you'll be in your owner's dashboard before the end of your first week.
            </p>
          </FadeUp>

          {/* 5-step enrollment process */}
          <FadeUp delay={0.15} className="mb-12">
            <div className="flex flex-col gap-4 text-left max-w-2xl mx-auto">
              {[
                {
                  num: "01",
                  title: "Agreement Completion",
                  desc: "You review and sign the App Squad partnership agreement. All terms, deliverables, and timelines are clearly outlined — no fine print surprises.",
                },
                {
                  num: "02",
                  title: "Package Activation",
                  desc: "Your selected package is activated and your dedicated launch coordinator is assigned. You'll receive a welcome email and onboarding instructions within 24 hours.",
                },
                {
                  num: "03",
                  title: "Template Selection",
                  desc: "You browse App Squad's library of 50+ proven game templates and select the one that fits your brand vision. Your coordinator guides you through the decision.",
                },
                {
                  num: "04",
                  title: "Customization Form",
                  desc: "You complete a detailed brand form covering your app name, color palette, characters, and identity preferences. This becomes the blueprint for your custom build.",
                },
                {
                  num: "05",
                  title: "Dashboard Access",
                  desc: "Your owner's dashboard goes live. Track your app's build progress, review milestones, communicate with your team, and access your launch roadmap — all in one place.",
                },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid rgba(245,163,60,0.18)",
                    borderRadius: 14,
                    padding: "22px 24px",
                    display: "flex",
                    gap: 20,
                    alignItems: "flex-start",
                  }}>
                  <div style={{
                    fontFamily: "'Space Grotesk'",
                    fontWeight: 700,
                    fontSize: 28,
                    color: "rgba(245,163,60,0.3)",
                    lineHeight: 1,
                    minWidth: 40,
                    letterSpacing: "-0.03em",
                    flexShrink: 0,
                    paddingTop: 2,
                  }}>
                    {step.num}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 16, marginBottom: 6, color: "rgba(255,255,255,0.92)" }}>
                      {step.title}
                    </div>
                    <p style={{ fontFamily: "'Inter'", fontSize: 13.5, lineHeight: 1.72, color: "var(--text-muted)" }}>
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeUp>

          {/* Final CTA */}
          <FadeUp delay={0.22}>
            <button
              className="btn-gold"
              style={{ padding: "20px 48px", fontSize: 17 }}
              onClick={() => window.open("https://appsquadinc.com/enroll", "_blank")}>
              Continue To Enrollment
              <ArrowRight className="w-5 h-5" />
            </button>
          </FadeUp>

          <FadeUp delay={0.26}>
            <div className="flex flex-wrap justify-center gap-6 mt-8 mb-14">
              {[
                "Agreement sent immediately",
                "Coordinator assigned in 24 hrs",
                "Dashboard live within the week",
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
                  <span style={{ fontFamily: "'Inter'", fontSize: 13, color: "var(--text-muted)" }}>{item}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Disclaimer */}
          <FadeUp delay={0.30}>
            <div style={{ background: "rgba(17,22,32,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 24px", maxWidth: 640, margin: "0 auto" }} className="flex gap-3 text-left">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--text-dim)" }} />
              <p style={{ fontFamily: "'Inter'", fontSize: 11, lineHeight: 1.75, color: "var(--text-dim)", fontWeight: 300 }}>
                App Squad provides custom mobile game app development, monetization preparation, and app store publishing assistance. App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, or return on investment. Results vary and depend on marketing, user engagement, platform rules, audience demand, app quality, consistency, and third-party approval processes.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
