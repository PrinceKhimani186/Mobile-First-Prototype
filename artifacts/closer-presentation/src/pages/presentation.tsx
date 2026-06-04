import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Shield, Smartphone, DollarSign,
  TrendingUp, Star, Package, BarChart3, Globe, ChevronRight,
  Award, Layers, Clock, Lock, Megaphone, Zap, Users, Download,
  Eye, ShoppingCart, Repeat, Radio, FileText, CreditCard,
  Settings, LayoutDashboard, Rocket, PlayCircle
} from "lucide-react";

/* ─────────────────────────── helpers ────────────────────────────── */

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

function SlideIn({ children, delay = 0, direction = "left", className = "" }: { children: React.ReactNode; delay?: number; direction?: "left" | "right"; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: direction === "left" ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
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
      transition={{ duration: 0.9, delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 20px",
      borderRadius: 999,
      background: "rgba(245,163,60,0.1)",
      border: "1px solid rgba(245,163,60,0.25)",
      fontFamily: "'Inter', sans-serif",
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase" as const,
      color: "#F7BA62",
      marginBottom: 36,
    }}>
      {children}
    </div>
  );
}

function CategoryBar({ label, pct, color, delay }: { label: string; pct: number; color: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div ref={ref} style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: "'Inter'", fontSize: 18, color: "rgba(255,255,255,0.75)" }}>{label}</span>
        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.3, delay, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "100%", background: color, borderRadius: 4 }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── data ───────────────────────────────── */

const APP_CATEGORIES = [
  { label: "Games & Entertainment", pct: 72, color: "#F5A33C" },
  { label: "Lifestyle & Social", pct: 67, color: "#F472B6" },
  { label: "Health & Fitness", pct: 58, color: "#60A5FA" },
  { label: "Education & Learning", pct: 51, color: "#A78BFA" },
  { label: "Productivity Tools", pct: 44, color: "#34D399" },
];

const APP_EXAMPLES = [
  { name: "Candy Crush Saga", rev: "$400M+/yr", icon: "🍬", cat: "Puzzle" },
  { name: "Clash of Clans", rev: "$1.5B+/yr", icon: "⚔️", cat: "Strategy" },
  { name: "Roblox", rev: "$2.7B+/yr", icon: "🎮", cat: "Platform" },
  { name: "Subway Surfers", rev: "$200M+/yr", icon: "🏄", cat: "Runner" },
  { name: "Duolingo", rev: "$500M+/yr", icon: "🦜", cat: "Education" },
  { name: "Calm", rev: "$150M+/yr", icon: "🧘", cat: "Wellness" },
  { name: "MyFitnessPal", rev: "$120M+/yr", icon: "💪", cat: "Fitness" },
  { name: "PicsArt", rev: "$100M+/yr", icon: "🎨", cat: "Creative" },
];

const MONETIZE_METHODS = [
  {
    icon: <Megaphone className="w-8 h-8" />,
    title: "Advertising",
    desc: "Display ads, rewarded video, interstitials — monetize every session without charging users a cent.",
  },
  {
    icon: <ShoppingCart className="w-8 h-8" />,
    title: "In-App Purchases",
    desc: "Coins, power-ups, premium levels. Small purchases, repeated over millions of sessions.",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Premium Upgrades",
    desc: "One-time unlocks for advanced features, expanded content, and enhanced experiences.",
  },
  {
    icon: <Repeat className="w-8 h-8" />,
    title: "Subscriptions",
    desc: "Monthly or annual plans unlock exclusive access, ad-free play, and premium content.",
  },
  {
    icon: <Radio className="w-8 h-8" />,
    title: "Sponsored Promotions",
    desc: "Brand integrations and sponsored levels open partnership channels as your audience grows.",
  },
];

const BARRIERS = [
  { icon: <Settings className="w-8 h-8" />, title: "Too Technical", desc: "Most people believe you need years of coding experience. Modern app development has removed that barrier entirely — the right partner changes everything." },
  { icon: <DollarSign className="w-8 h-8" />, title: "Too Expensive", desc: "Custom development can cost $100K–$500K+. Without a proven template system and shared infrastructure, most people simply can't afford entry." },
  { icon: <Lock className="w-8 h-8" />, title: "Too Confusing", desc: "Developer accounts, App Store guidelines, monetization setup — the process is labyrinthine without a guide who has navigated it hundreds of times." },
  { icon: <Users className="w-8 h-8" />, title: "No Guidance", desc: "Without a team that knows the exact path from idea to live product, most people stall. They need a partner, not just information." },
];

const PROCESS_STEPS = [
  { num: "01", title: "Choose Template", desc: "Browse 50+ proven game templates across categories. Select the one that fits your brand vision and target audience." },
  { num: "02", title: "Customize Branding", desc: "Define your app name, visual identity, color palette, characters, and unique brand elements with your coordinator." },
  { num: "03", title: "Prepare Monetization", desc: "Ad networks, in-app purchases, and analytics are configured and tested — your revenue architecture is built before launch." },
  { num: "04", title: "Launch Your Digital Product", desc: "App Store and Google Play submission handled completely. You receive the keys to a live, revenue-ready digital asset." },
];

const TEMPLATES = [
  { name: "Infinite Runner", genre: "Action", icon: "🏃", tag: "Most Popular" },
  { name: "Match-3 Puzzle", genre: "Puzzle", icon: "🧩", tag: "Featured" },
  { name: "Tower Defense", genre: "Strategy", icon: "🏰", tag: null },
  { name: "Word Challenge", genre: "Trivia", icon: "📝", tag: null },
  { name: "Endless Racer", genre: "Racing", icon: "🏎️", tag: "Featured" },
  { name: "Bubble Shooter", genre: "Casual", icon: "🫧", tag: null },
  { name: "Quiz Master", genre: "Education", icon: "🎓", tag: null },
  { name: "Merge Adventure", genre: "Idle", icon: "✨", tag: "New" },
];

const PACKAGES = [
  {
    name: "App Launch\nEssentials",
    tag: "Starter",
    tagColor: "#60A5FA",
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
    tag: "Premium",
    tagColor: "#A78BFA",
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

const NEXT_STEPS = [
  { icon: <FileText className="w-7 h-7" />, title: "Agreement", desc: "Review and sign your App Squad partnership agreement. All terms and deliverables are clearly defined." },
  { icon: <CreditCard className="w-7 h-7" />, title: "Payment", desc: "Your investment is processed and your package is immediately activated in our system." },
  { icon: <Layers className="w-7 h-7" />, title: "Game Selection", desc: "Browse the full template library with your coordinator and lock in your game category and genre." },
  { icon: <Settings className="w-7 h-7" />, title: "Customization Form", desc: "Complete your brand form — app name, colors, characters, identity. This becomes your build blueprint." },
  { icon: <LayoutDashboard className="w-7 h-7" />, title: "Dashboard Access", desc: "Your owner's dashboard goes live. Track progress, review milestones, and communicate with your team." },
  { icon: <Rocket className="w-7 h-7" />, title: "Development Begins", desc: "Your dedicated build team activates and your app's development timeline officially begins." },
];

/* ─────────────────────────── page ───────────────────────────────── */

export default function Presentation() {
  const scrollToEnroll = () => {
    document.getElementById("enroll")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: "#0B0F14", minHeight: "100vh", overflowX: "hidden", color: "#E8ECF2" }}>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — THE BIG IDEA
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", padding: "140px 40px 120px", minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />
        {/* Glow */}
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 900, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(245,163,60,0.13) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }} />
        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: "linear-gradient(transparent, #0B0F14)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          <FadeUp>
            <SectionLabel>Section 1 · The Big Idea</SectionLabel>
          </FadeUp>

          <FadeUp delay={0.08}>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(52px, 8vw, 104px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              marginBottom: 40,
              textTransform: "uppercase",
            }}>
              Most People{" "}
              <span style={{ color: "#F5A33C" }}>Spend Money</span>{" "}
              in Apps.
              <br />
              Very Few Ever{" "}
              <span style={{ color: "#F5A33C" }}>Own One.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.15}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(18px, 2vw, 24px)", lineHeight: 1.8, color: "rgba(255,255,255,0.5)", fontWeight: 300, maxWidth: 700, margin: "0 auto 56px" }}>
              The mobile app economy is one of the largest digital ecosystems in the world.
              Millions participate every day. Few ever build an asset inside it.
            </p>
          </FadeUp>

          <FadeUp delay={0.22}>
            <button
              onClick={scrollToEnroll}
              style={{
                background: "linear-gradient(135deg, #F5A33C 0%, #E8891A 100%)",
                color: "#0B0F14",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.01em",
                border: "none",
                cursor: "pointer",
                borderRadius: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "22px 48px",
                boxShadow: "0 8px 48px rgba(245,163,60,0.3), 0 2px 12px rgba(0,0,0,0.5)",
                transition: "opacity 0.18s, transform 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <PlayCircle className="w-5 h-5" />
              Watch App Ownership Presentation
            </button>
          </FadeUp>

          <FadeUp delay={0.28}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 48, marginTop: 80 }}>
              {[
                { val: "$935B", label: "Global App Economy" },
                { val: "6.3B+", label: "Smartphone Users Worldwide" },
                { val: "35B+", label: "App Downloads Per Quarter" },
              ].map(s => (
                <div key={s.val} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(36px, 4vw, 54px)", fontWeight: 700, color: "#F5A33C", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: "'Inter'", fontSize: 15, color: "rgba(255,255,255,0.35)", marginTop: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — CONSUMER vs OWNER  [PRIORITY #1]
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", padding: "160px 0 180px", overflow: "hidden", background: "linear-gradient(180deg, #0B0F14 0%, #0D1118 40%, #0B0F14 100%)" }}>
        {/* Full-bleed ambient glows */}
        <div style={{ position: "absolute", top: "20%", left: "-10%", width: "45%", height: "60%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(239,68,68,0.05) 0%, transparent 65%)", filter: "blur(100px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "20%", right: "-10%", width: "45%", height: "60%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(245,163,60,0.09) 0%, transparent 65%)", filter: "blur(100px)", pointerEvents: "none" }} />

        {/* Section label */}
        <FadeUp style={{ textAlign: "center", marginBottom: 60 }}>
          <SectionLabel>Section 2 · The Identity Shift</SectionLabel>
        </FadeUp>

        {/* Cinematic headline */}
        <FadeUp delay={0.06} style={{ textAlign: "center", marginBottom: 100, padding: "0 40px" }}>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(48px, 7.5vw, 110px)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.95, textTransform: "uppercase", margin: "0 auto" }}>
            <span style={{ display: "block", color: "rgba(255,255,255,0.25)" }}>Everyone in the app economy</span>
            <span style={{ display: "block", color: "#E8ECF2", marginTop: 12 }}>Is either a</span>
            <span style={{ display: "block", marginTop: 8 }}>
              <span style={{ color: "rgba(239,68,68,0.7)" }}>Consumer</span>
              <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 24px" }}>or an</span>
              <span style={{ color: "#F5A33C" }}>Owner</span>
            </span>
          </h2>
        </FadeUp>

        {/* Full-width two-panel comparison */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 580 }}>
          {/* ── CONSUMER side ── */}
          <SlideIn direction="left" delay={0.1}>
            <div style={{
              padding: "80px 64px 80px 80px",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 56 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Download style={{ width: 34, height: 34, color: "rgba(239,68,68,0.7)" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "rgba(239,68,68,0.55)", lineHeight: 1 }}>Consumer</div>
                  <div style={{ fontFamily: "'Inter'", fontSize: 16, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>Participates in the ecosystem</div>
                </div>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 32 }}>
                {[
                  { text: "Downloads Apps", sub: "Fills someone else's ecosystem" },
                  { text: "Buys Upgrades", sub: "Funds someone else's business" },
                  { text: "Watches Ads", sub: "Generates revenue for the owner" },
                  { text: "Uses Products", sub: "Consumes what others built" },
                  { text: "Participates In Ecosystems", sub: "With no ownership stake" },
                ].map(item => (
                  <li key={item.text} style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <span style={{ color: "rgba(239,68,68,0.7)", fontSize: 16, fontWeight: 700 }}>✕</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Inter'", fontSize: "clamp(20px, 2vw, 28px)", lineHeight: 1.2, color: "rgba(255,255,255,0.38)", fontWeight: 500 }}>{item.text}</div>
                      <div style={{ fontFamily: "'Inter'", fontSize: 15, color: "rgba(255,255,255,0.18)", marginTop: 4 }}>{item.sub}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </SlideIn>

          {/* ── OWNER side ── */}
          <SlideIn direction="right" delay={0.15}>
            <div style={{
              padding: "80px 80px 80px 64px",
              background: "linear-gradient(140deg, rgba(245,163,60,0.04) 0%, transparent 60%)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: "60%", height: "60%", borderRadius: "0 0 0 100%", background: "radial-gradient(ellipse at top right, rgba(245,163,60,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 56 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: "rgba(245,163,60,0.1)",
                  border: "1px solid rgba(245,163,60,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Award style={{ width: 34, height: 34, color: "#F5A33C" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "#F5A33C", lineHeight: 1 }}>Owner</div>
                  <div style={{ fontFamily: "'Inter'", fontSize: 16, color: "rgba(245,163,60,0.45)", marginTop: 4 }}>Builds inside the ecosystem</div>
                </div>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 32, position: "relative", zIndex: 1 }}>
                {[
                  { text: "Owns Digital Assets", sub: "A product that exists without you" },
                  { text: "Builds Brands", sub: "Identity, loyalty, and equity" },
                  { text: "Creates Products", sub: "Users pay you for access" },
                  { text: "Participates In Growth", sub: "As the ecosystem expands, so do you" },
                  { text: "Owns Something Inside The Ecosystem", sub: "A stake in the digital economy" },
                ].map(item => (
                  <li key={item.text} style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245,163,60,0.1)", border: "1px solid rgba(245,163,60,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <CheckCircle2 style={{ width: 18, height: 18, color: "#F5A33C" }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Inter'", fontSize: "clamp(20px, 2vw, 28px)", lineHeight: 1.2, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{item.text}</div>
                      <div style={{ fontFamily: "'Inter'", fontSize: 15, color: "rgba(245,163,60,0.45)", marginTop: 4 }}>{item.sub}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </SlideIn>
        </div>

        {/* Bottom identity statement */}
        <FadeUp delay={0.3} style={{ padding: "80px 40px 0", textAlign: "center" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <p style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(22px, 3vw, 38px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.4, color: "rgba(255,255,255,0.75)" }}>
              The app economy generated{" "}
              <span style={{ color: "#F5A33C" }}>$935 billion in 2023 alone.</span>
              <br />
              The only question is: which side of that number are you on?
            </p>
          </div>
        </FadeUp>
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — VIDEO PRESENTATION
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 40px", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(245,163,60,0.06) 0%, transparent 65%)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 64 }}>
            <SectionLabel>Section 3 · The Presentation</SectionLabel>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05, textTransform: "uppercase" }}>
              The Complete
              <br />
              <span style={{ color: "#F5A33C" }}>App Ownership Presentation</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 20, color: "rgba(255,255,255,0.4)", marginTop: 20, lineHeight: 1.7 }}>
              Watch the full presentation before continuing. Everything below will make much more sense.
            </p>
          </FadeUp>

          <ScaleIn delay={0.1}>
            <div style={{
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 0 0 1px rgba(245,163,60,0.15), 0 40px 100px -30px rgba(0,0,0,0.95), 0 0 80px -30px rgba(245,163,60,0.06)",
            }}>
              <div style={{ position: "relative", paddingBottom: "56.25%" }}>
                <iframe
                  src="https://player.vimeo.com/video/1197652826?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&dnt=1"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  allowFullScreen
                  title="App Squad Presentation"
                />
              </div>
            </div>
          </ScaleIn>

          <FadeUp delay={0.2} style={{ marginTop: 48 }}>
            <div style={{ background: "rgba(17,22,32,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "32px 40px" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A33C", marginBottom: 24 }}>
                Covered in this presentation
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {[
                  "How game templates are selected",
                  "How apps are branded with your identity",
                  "How monetization options are configured",
                  "How App Store submission works",
                  "What the guided launch process looks like",
                  "Real numbers from the mobile app economy",
                ].map(item => (
                  <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <CheckCircle2 style={{ width: 18, height: 18, color: "#F5A33C", flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: "'Inter'", fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,0.55)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — THE APP ECONOMY  [PRIORITY #2]
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "160px 40px 180px", background: "linear-gradient(180deg, #0B0F14 0%, #0D1219 30%, #0B0F14 100%)", position: "relative" }}>
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 1200, height: 800, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(96,165,250,0.04) 0%, transparent 65%)", filter: "blur(120px)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* Headline */}
          <FadeUp style={{ textAlign: "center", marginBottom: 100 }}>
            <SectionLabel>
              <BarChart3 style={{ width: 14, height: 14 }} />
              Section 4 · Market Intelligence
            </SectionLabel>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(48px, 7vw, 96px)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.95, textTransform: "uppercase", marginBottom: 32 }}>
              The App Economy
              <br />
              <span style={{ color: "#F5A33C" }}>Is Already Here</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 24, color: "rgba(255,255,255,0.4)", maxWidth: 700, margin: "0 auto", lineHeight: 1.7 }}>
              The market already exists. The users already exist.
              <br />The ecosystem already exists.
            </p>
          </FadeUp>

          {/* ── Tier 1: Hero stats ── */}
          <FadeUp delay={0.06}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 48 }}>
              {[
                { val: "$935B", label: "Global App Economy", sub: "2023 — Sensor Tower", color: "#F5A33C" },
                { val: "6.3B", label: "Smartphone Users", sub: "Worldwide — Statista", color: "#60A5FA" },
                { val: "35B+", label: "Downloads / Quarter", sub: "Q4 2023 Data.ai", color: "#A78BFA" },
                { val: "$188B", label: "Consumer App Spend", sub: "App Stores Combined", color: "#34D399" },
              ].map(s => (
                <div key={s.val} style={{
                  background: "rgba(255,255,255,0.025)",
                  border: `1px solid ${s.color}22`,
                  borderRadius: 20,
                  padding: "44px 28px",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)", width: 140, height: 80, borderRadius: "50%", background: `radial-gradient(ellipse, ${s.color}18 0%, transparent 70%)`, filter: "blur(20px)", pointerEvents: "none" }} />
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(36px, 3.5vw, 56px)", fontWeight: 700, color: s.color, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 10 }}>{s.val}</div>
                  <div style={{ fontFamily: "'Inter'", fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 4, lineHeight: 1.3 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Inter'", fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* ── Tier 2: Category bars + App rankings ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <FadeIn delay={0.08}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "48px 44px", height: "100%" }}>
                <p style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "#E8ECF2", marginBottom: 8 }}>Revenue Growth by Category</p>
                <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 40, letterSpacing: "0.05em", textTransform: "uppercase" }}>Year-over-year market expansion</p>
                {APP_CATEGORIES.map((cat, i) => (
                  <CategoryBar key={cat.label} {...cat} delay={i * 0.08} />
                ))}
                <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "rgba(255,255,255,0.2)", marginTop: 24, lineHeight: 1.6 }}>
                  * Category data based on industry reports and app store analytics.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.12}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "48px 44px", height: "100%" }}>
                <p style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "#E8ECF2", marginBottom: 8 }}>Known App Revenue Benchmarks</p>
                <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 40, letterSpacing: "0.05em", textTransform: "uppercase" }}>Estimates from public industry data</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {APP_EXAMPLES.map((app, i) => (
                    <motion.div
                      key={app.name}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.07 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 12,
                        padding: "16px 20px",
                        borderLeft: `3px solid rgba(245,163,60,${0.5 - i * 0.05})`,
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ fontSize: 28 }}>{app.icon}</span>
                        <div>
                          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 17, fontWeight: 600, lineHeight: 1.2 }}>{app.name}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{app.cat}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 700, color: "#F5A33C" }}>{app.rev}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ── Tier 3: Download context + ecosystem facts ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
            {[
              {
                icon: "📱",
                title: "App Store Downloads",
                stat: "900M+",
                statSub: "Paid iOS apps downloaded in 2023",
                facts: [
                  "Games make up 70%+ of all app revenue",
                  "Top 1% of games earn 90%+ of the revenue",
                  "Average user has 40+ apps installed",
                ],
              },
              {
                icon: "🌍",
                title: "Global Reach",
                stat: "190+",
                statSub: "Countries served by app stores",
                facts: [
                  "Asia Pacific leads total download volume",
                  "North America leads in revenue per user",
                  "Emerging markets are fastest growing",
                ],
              },
              {
                icon: "⚡",
                title: "Market Velocity",
                stat: "8.9B+",
                statSub: "App downloads in a single quarter",
                facts: [
                  "Mobile gaming now outpaces console + PC combined",
                  "IAP revenue grew 30%+ in 3 years",
                  "Rewarded video ads = fastest-growing ad format",
                ],
              },
            ].map((panel, i) => (
              <FadeUp key={panel.title} delay={i * 0.08}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "40px 32px", height: "100%" }}>
                  <div style={{ fontSize: 40, marginBottom: 20 }}>{panel.icon}</div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: 44, fontWeight: 700, letterSpacing: "-0.04em", color: "#F5A33C", lineHeight: 1, marginBottom: 6 }}>{panel.stat}</div>
                  <div style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 28, textTransform: "uppercase", letterSpacing: "0.05em" }}>{panel.statSub}</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
                    {panel.facts.map(f => (
                      <li key={f} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F5A33C", flexShrink: 0, marginTop: 9 }} />
                        <span style={{ fontFamily: "'Inter'", fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* ── Tier 4: Category rankings table ── */}
          <FadeIn delay={0.15}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(245,163,60,0.12)", borderRadius: 20, padding: "48px 44px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
                <div>
                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, color: "#E8ECF2", marginBottom: 4 }}>Top Game Categories by Download Volume</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>App Store & Google Play combined</p>
                </div>
                <div style={{ fontFamily: "'Inter'", fontSize: 13, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>Based on publicly available industry data</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {[
                  { rank: "#1", cat: "Casual Games", detail: "Puzzle, idle, match-3", color: "#F5A33C" },
                  { rank: "#2", cat: "Arcade & Action", detail: "Runners, shooters, platformers", color: "#F472B6" },
                  { rank: "#3", cat: "Strategy", detail: "Tower defense, city builders", color: "#60A5FA" },
                  { rank: "#4", cat: "Word & Trivia", detail: "Brain games, crosswords", color: "#A78BFA" },
                  { rank: "#5", cat: "Racing & Sports", detail: "Simulation, endless racers", color: "#34D399" },
                  { rank: "#6", cat: "RPG & Adventure", detail: "Story-driven, character builds", color: "#FB923C" },
                ].map(row => (
                  <div key={row.rank} style={{ display: "flex", gap: 16, alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "18px 20px" }}>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 24, fontWeight: 700, color: row.color, minWidth: 40 }}>{row.rank}</div>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk'", fontSize: 17, fontWeight: 600 }}>{row.cat}</div>
                      <div style={{ fontFamily: "'Inter'", fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{row.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5 — HOW APPS MONETIZE
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 80 }}>
            <SectionLabel>
              <DollarSign style={{ width: 14, height: 14 }} />
              Section 5 · Revenue Architecture
            </SectionLabel>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(42px, 6vw, 76px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0, textTransform: "uppercase" }}>
              5 Ways Your App Can
              <br />
              <span style={{ color: "#F5A33C" }}>Generate Revenue</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 20, color: "rgba(255,255,255,0.4)", maxWidth: 620, margin: "24px auto 0", lineHeight: 1.75 }}>
              Educational only. The best app businesses layer multiple streams from the same digital asset.
            </p>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {MONETIZE_METHODS.map((m, i) => (
              <FadeUp key={m.title} delay={i * 0.07}>
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  padding: "44px 36px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  transition: "border-color 0.25s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(245,163,60,0.25)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(245,163,60,0.08)", border: "1px solid rgba(245,163,60,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5A33C" }}>
                    {m.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 14 }}>{m.title}</div>
                    <p style={{ fontFamily: "'Inter'", fontSize: 20, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>{m.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6 — WHY MOST PEOPLE NEVER ENTER → APP SQUAD EXISTS
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 40px", background: "rgba(14,18,25,0.7)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 80 }}>
            <SectionLabel>
              <Lock style={{ width: 14, height: 14 }} />
              Section 6 · The Barriers
            </SectionLabel>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(42px, 6vw, 76px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0, textTransform: "uppercase" }}>
              Why Most People
              <br />
              <span style={{ color: "#F5A33C" }}>Never Enter</span>
            </h2>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 80 }}>
            {BARRIERS.map((b, i) => (
              <FadeUp key={b.title} delay={i * 0.08}>
                <div style={{ background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 20, padding: "44px 36px", height: "100%" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", marginBottom: 28 }}>
                    {b.icon}
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>{b.title}</div>
                  <p style={{ fontFamily: "'Inter'", fontSize: 20, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>{b.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Transition card */}
          <FadeUp delay={0.25}>
            <div style={{
              background: "linear-gradient(135deg, rgba(245,163,60,0.06) 0%, rgba(245,163,60,0.02) 100%)",
              border: "1px solid rgba(245,163,60,0.25)",
              borderRadius: 24,
              padding: "64px 56px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 0 80px -30px rgba(245,163,60,0.12)",
            }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(245,163,60,0.06) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
              <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(32px, 4vw, 60px)", fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", position: "relative", zIndex: 1 }}>
                That's Why
                <br />
                <span style={{ color: "#F5A33C" }}>App Squad Exists</span>
              </h3>
              <p style={{ fontFamily: "'Inter'", fontSize: 22, color: "rgba(255,255,255,0.5)", maxWidth: 600, margin: "24px auto 0", lineHeight: 1.75, position: "relative", zIndex: 1 }}>
                Every barrier above is removed inside the App Squad system. Technical, financial, logistical, and directional — all of it handled.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 7 — THE APP SQUAD SOLUTION
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 80 }}>
            <SectionLabel>
              <Award style={{ width: 14, height: 14 }} />
              Section 7 · The Solution
            </SectionLabel>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(42px, 6vw, 76px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0, textTransform: "uppercase" }}>
              A Simplified
              <br />
              <span style={{ color: "#F5A33C" }}>App Ownership Process</span>
            </h2>
          </FadeUp>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900, margin: "0 auto" }}>
            {PROCESS_STEPS.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.1}>
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(245,163,60,0.15)",
                  borderRadius: 20,
                  padding: "40px 44px",
                  display: "flex",
                  gap: 36,
                  alignItems: "flex-start",
                  transition: "border-color 0.25s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(245,163,60,0.35)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(245,163,60,0.15)")}>
                  <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(36px, 4vw, 60px)", color: "rgba(245,163,60,0.2)", lineHeight: 1, minWidth: 56, letterSpacing: "-0.04em", flexShrink: 0 }}>
                    {step.num}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 }}>{step.title}</div>
                    <p style={{ fontFamily: "'Inter'", fontSize: 20, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>{step.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 8 — GAME TEMPLATE GALLERY
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 40px", background: "rgba(14,18,25,0.7)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 80 }}>
            <SectionLabel>
              <Layers style={{ width: 14, height: 14 }} />
              Section 8 · Template Library
            </SectionLabel>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(42px, 6vw, 76px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0, textTransform: "uppercase" }}>
              50+ Proven Templates
              <br />
              <span style={{ color: "#F5A33C" }}>Ready to Become Your Brand</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 20, color: "rgba(255,255,255,0.4)", maxWidth: 600, margin: "24px auto 0", lineHeight: 1.75 }}>
              Every template has been tested in real app stores with real users. You're not starting from scratch — you're starting from proven.
            </p>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {TEMPLATES.map((tmpl, i) => (
              <FadeUp key={tmpl.name} delay={i * 0.06}>
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  padding: "44px 28px",
                  textAlign: "center",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "border-color 0.25s, background 0.25s, transform 0.25s",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(245,163,60,0.35)";
                    e.currentTarget.style.background = "rgba(245,163,60,0.04)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}>
                  {tmpl.tag && (
                    <div style={{
                      position: "absolute", top: 16, right: 16,
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: tmpl.tag === "Most Popular" ? "rgba(245,163,60,0.15)" : tmpl.tag === "New" ? "rgba(52,211,153,0.12)" : "rgba(96,165,250,0.12)",
                      border: `1px solid ${tmpl.tag === "Most Popular" ? "rgba(245,163,60,0.3)" : tmpl.tag === "New" ? "rgba(52,211,153,0.25)" : "rgba(96,165,250,0.25)"}`,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: tmpl.tag === "Most Popular" ? "#F5A33C" : tmpl.tag === "New" ? "#34D399" : "#60A5FA",
                    }}>
                      {tmpl.tag}
                    </div>
                  )}
                  <div style={{ fontSize: 56, marginBottom: 20 }}>{tmpl.icon}</div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>{tmpl.name}</div>
                  <div style={{ fontSize: 14, color: "#F5A33C", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{tmpl.genre}</div>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.35} style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontFamily: "'Inter'", fontSize: 18, color: "rgba(255,255,255,0.3)" }}>
              And 40+ more — puzzle, idle, arcade, simulation, trivia, and beyond.
            </p>
          </FadeUp>
        </div>
      </section>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 9 — WHICH PATH FITS YOU?  [PRIORITY #3]
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "160px 40px 180px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 1100, height: 700, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(245,163,60,0.05) 0%, transparent 65%)", filter: "blur(100px)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1440, margin: "0 auto" }}>
          {/* Headline */}
          <FadeUp style={{ textAlign: "center", marginBottom: 32 }}>
            <SectionLabel>
              <Package style={{ width: 14, height: 14 }} />
              Section 9 · The Decision
            </SectionLabel>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(48px, 7vw, 96px)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.95, textTransform: "uppercase", marginBottom: 24 }}>
              Which App Ownership Path
              <br />
              <span style={{ color: "#F5A33C" }}>Fits You?</span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.06} style={{ textAlign: "center", marginBottom: 80 }}>
            <p style={{ fontFamily: "'Inter'", fontSize: 22, color: "rgba(255,255,255,0.4)", maxWidth: 680, margin: "0 auto", lineHeight: 1.75 }}>
              Three paths. One goal. The right entry point depends on where you are and how fast you want to move.
            </p>
          </FadeUp>

          {/* Package cards — Accelerator elevated */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.08fr 1fr", gap: 20, alignItems: "start" }}>
            {PACKAGES.map((pkg, i) => {
              const isAccelerator = pkg.highlight;
              const isEmpire = pkg.tag === "Premium";
              return (
                <FadeUp key={pkg.name} delay={i * 0.1}>
                  <div style={{
                    background: isAccelerator
                      ? "linear-gradient(155deg, #1A2130 0%, #121820 60%, #0F141C 100%)"
                      : isEmpire
                      ? "linear-gradient(155deg, #161220 0%, #0F0E1A 100%)"
                      : "rgba(255,255,255,0.02)",
                    border: isAccelerator
                      ? "1px solid rgba(245,163,60,0.5)"
                      : isEmpire
                      ? "1px solid rgba(167,139,250,0.3)"
                      : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 24,
                    padding: isAccelerator ? "60px 44px" : "52px 40px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: isAccelerator
                      ? "0 0 120px -30px rgba(245,163,60,0.22), 0 40px 80px -20px rgba(0,0,0,0.8)"
                      : isEmpire
                      ? "0 0 80px -30px rgba(167,139,250,0.1)"
                      : "none",
                    marginTop: isAccelerator ? -20 : 0,
                  }}>
                    {/* Ambient glow inside card */}
                    {isAccelerator && (
                      <>
                        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(245,163,60,0.1) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
                        <div style={{ position: "absolute", bottom: -60, left: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(245,163,60,0.06) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
                      </>
                    )}
                    {isEmpire && (
                      <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(167,139,250,0.07) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
                    )}

                    {/* Tag badge */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "7px 16px", borderRadius: 10, alignSelf: "flex-start", marginBottom: 32,
                      background: isAccelerator ? "rgba(245,163,60,0.12)" : isEmpire ? "rgba(167,139,250,0.1)" : "rgba(96,165,250,0.08)",
                      border: isAccelerator ? "1px solid rgba(245,163,60,0.35)" : isEmpire ? "1px solid rgba(167,139,250,0.25)" : "1px solid rgba(96,165,250,0.2)",
                      fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const,
                      color: isAccelerator ? "#F5A33C" : isEmpire ? "#A78BFA" : "#60A5FA",
                      position: "relative", zIndex: 1,
                    }}>
                      {isAccelerator && <Star style={{ width: 12, height: 12, fill: "#F5A33C" }} />}
                      {pkg.tag}
                    </div>

                    {/* Name */}
                    <h3 style={{
                      fontFamily: "'Space Grotesk'",
                      fontSize: isAccelerator ? "clamp(28px, 2.5vw, 40px)" : "clamp(24px, 2.2vw, 34px)",
                      fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.1,
                      whiteSpace: "pre-line", marginBottom: 10, position: "relative", zIndex: 1,
                    }}>{pkg.name}</h3>

                    <div style={{ fontFamily: "'Inter'", fontSize: 15, color: "rgba(255,255,255,0.28)", marginBottom: 40, fontStyle: "italic", position: "relative", zIndex: 1 }}>
                      Investment level confirmed during enrollment
                    </div>

                    {/* Visual divider */}
                    <div style={{ height: 1, background: isAccelerator ? "rgba(245,163,60,0.15)" : "rgba(255,255,255,0.06)", marginBottom: 32, position: "relative", zIndex: 1 }} />

                    {/* Features */}
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 20, flex: 1, position: "relative", zIndex: 1 }}>
                      {pkg.features.map(f => (
                        <li key={f} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 2,
                            background: isAccelerator ? "rgba(245,163,60,0.1)" : isEmpire ? "rgba(167,139,250,0.08)" : "rgba(52,211,153,0.07)",
                            border: isAccelerator ? "1px solid rgba(245,163,60,0.2)" : isEmpire ? "1px solid rgba(167,139,250,0.18)" : "1px solid rgba(52,211,153,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <CheckCircle2 style={{ width: 13, height: 13, color: isAccelerator ? "#F5A33C" : isEmpire ? "#A78BFA" : "#34D399" }} />
                          </div>
                          <span style={{ fontFamily: "'Inter'", fontSize: isAccelerator ? 20 : 18, lineHeight: 1.55, color: isAccelerator ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.55)" }}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={scrollToEnroll}
                      style={{
                        marginTop: 40,
                        width: "100%",
                        padding: isAccelerator ? "22px 0" : "18px 0",
                        borderRadius: 14,
                        fontFamily: "'Space Grotesk'",
                        fontWeight: 700,
                        fontSize: isAccelerator ? 20 : 17,
                        cursor: "pointer",
                        border: isAccelerator ? "none" : isEmpire ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.12)",
                        background: isAccelerator
                          ? "linear-gradient(135deg, #F5A33C 0%, #E8891A 100%)"
                          : isEmpire
                          ? "rgba(167,139,250,0.08)"
                          : "transparent",
                        color: isAccelerator ? "#0B0F14" : isEmpire ? "#A78BFA" : "rgba(255,255,255,0.55)",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        transition: "opacity 0.18s, transform 0.18s",
                        boxShadow: isAccelerator ? "0 8px 40px rgba(245,163,60,0.3)" : "none",
                        position: "relative", zIndex: 1,
                        letterSpacing: "-0.01em",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
                      {pkg.cta}
                      <ChevronRight style={{ width: isAccelerator ? 20 : 17, height: isAccelerator ? 20 : 17 }} />
                    </button>
                  </div>
                </FadeUp>
              );
            })}
          </div>

          {/* Bottom note */}
          <FadeUp delay={0.3} style={{ textAlign: "center", marginTop: 56 }}>
            <p style={{ fontFamily: "'Inter'", fontSize: 17, color: "rgba(255,255,255,0.25)", maxWidth: 600, margin: "0 auto", lineHeight: 1.75 }}>
              All packages include the full App Squad guided launch process. The right path depends on your goals, timeline, and level of involvement.
            </p>
          </FadeUp>
        </div>
      </section>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 10 — WHAT HAPPENS NEXT?
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 40px", background: "rgba(14,18,25,0.7)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 80 }}>
            <SectionLabel>
              <Rocket style={{ width: 14, height: 14 }} />
              Section 10 · The Process
            </SectionLabel>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(42px, 6vw, 76px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0, textTransform: "uppercase" }}>
              What Happens
              <br />
              <span style={{ color: "#F5A33C" }}>Next?</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 22, color: "rgba(255,255,255,0.4)", maxWidth: 640, margin: "24px auto 0", lineHeight: 1.75 }}>
              Once you enroll, this is the exact sequence of events. No guesswork — just a clear, guided process.
            </p>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {NEXT_STEPS.map((step, i) => (
              <FadeUp key={step.title} delay={i * 0.08}>
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(245,163,60,0.12)",
                  borderRadius: 20,
                  padding: "40px 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  transition: "border-color 0.25s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(245,163,60,0.3)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(245,163,60,0.12)")}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 58, height: 58, borderRadius: 16, background: "rgba(245,163,60,0.08)", border: "1px solid rgba(245,163,60,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5A33C", flexShrink: 0 }}>
                      {step.icon}
                    </div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(245,163,60,0.7)" }}>
                      Step {i + 1}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 }}>{step.title}</div>
                    <p style={{ fontFamily: "'Inter'", fontSize: 19, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>{step.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 11 — ENROLLMENT
      ══════════════════════════════════════════════════════════════ */}
      <section id="enroll" style={{ padding: "140px 40px 160px", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 1000, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(245,163,60,0.09) 0%, transparent 65%)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          <FadeUp>
            <SectionLabel>
              <Star style={{ width: 14, height: 14 }} />
              Section 11 · Enrollment
            </SectionLabel>
          </FadeUp>

          <FadeUp delay={0.07}>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(48px, 7vw, 96px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 32, textTransform: "uppercase" }}>
              Ready to Begin Your
              <br />
              <span style={{ color: "#F5A33C" }}>App Ownership Journey?</span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.13}>
            <p style={{ fontFamily: "'Inter'", fontSize: 22, lineHeight: 1.8, color: "rgba(255,255,255,0.45)", maxWidth: 680, margin: "0 auto 60px" }}>
              After enrollment you will complete your agreement, activate your package, select your template, submit your customization form, and receive dashboard access — all within your first week.
            </p>
          </FadeUp>

          {/* Enrollment checklist */}
          <FadeUp delay={0.18} style={{ marginBottom: 60 }}>
            <div style={{ display: "inline-flex", flexDirection: "column", gap: 18, textAlign: "left", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(245,163,60,0.18)", borderRadius: 20, padding: "40px 48px" }}>
              {[
                "Complete Agreement",
                "Activate Package",
                "Select Template",
                "Submit Customization Form",
                "Receive Dashboard Access",
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.18 + i * 0.07 }}
                  style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245,163,60,0.1)", border: "1px solid rgba(245,163,60,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5A33C", flexShrink: 0 }}>
                    <CheckCircle2 style={{ width: 18, height: 18 }} />
                  </div>
                  <span style={{ fontFamily: "'Inter'", fontSize: 22, color: "rgba(255,255,255,0.75)" }}>{item}</span>
                </motion.div>
              ))}
            </div>
          </FadeUp>

          {/* Main CTA */}
          <FadeUp delay={0.25}>
            <button
              onClick={() => window.open("https://appsquadinc.com/enroll", "_blank")}
              style={{
                background: "linear-gradient(135deg, #F5A33C 0%, #E8891A 100%)",
                color: "#0B0F14",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: "-0.01em",
                border: "none",
                cursor: "pointer",
                borderRadius: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                padding: "26px 64px",
                boxShadow: "0 8px 60px rgba(245,163,60,0.35), 0 2px 12px rgba(0,0,0,0.5)",
                transition: "opacity 0.18s, transform 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.92"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Continue To Enrollment
              <ArrowRight style={{ width: 22, height: 22 }} />
            </button>
          </FadeUp>

          <FadeUp delay={0.3} style={{ marginTop: 48 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32 }}>
              {[
                "Agreement sent immediately",
                "Coordinator assigned within 24 hrs",
                "Dashboard live within the week",
              ].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 style={{ width: 16, height: 16, color: "#F5A33C" }} />
                  <span style={{ fontFamily: "'Inter'", fontSize: 17, color: "rgba(255,255,255,0.4)" }}>{item}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Disclaimer */}
          <FadeUp delay={0.35} style={{ marginTop: 72 }}>
            <div style={{ background: "rgba(17,22,32,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px 32px", maxWidth: 720, margin: "72px auto 0", display: "flex", gap: 16, textAlign: "left" }}>
              <Shield style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, color: "rgba(255,255,255,0.2)" }} />
              <p style={{ fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.25)" }}>
                App Squad provides custom mobile game app development, monetization preparation, and app store publishing assistance. App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, or return on investment. Results vary and depend on marketing, user engagement, platform rules, audience demand, app quality, consistency, and third-party approval processes.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
