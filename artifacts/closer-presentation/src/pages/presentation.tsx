import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Shield, DollarSign,
  TrendingUp, Star, Package, BarChart3, ChevronRight,
  Award, Layers, Lock, Megaphone, Users, Download,
  ShoppingCart, Repeat, Radio, FileText, CreditCard,
  Settings, LayoutDashboard, Rocket, ChevronDown
} from "lucide-react";

/* ─────────────────── color tokens ──────────────────────────────── */
const GOLD   = "#00D4FF";    // electric cyan — ownership accent
const CYAN   = "#00D4FF";    // electric cyan
const RED    = "#6D071A";    // deep burgundy — consumer accent
const PURPLE = "#7B61FF";    // royal purple — empire accent

/* ─────────────────── animation helpers ─────────────────────────── */

function FadeUp({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}>
      {children}
    </motion.div>
  );
}

function SlideIn({ children, delay = 0, dir = "left", style = {} }: { children: React.ReactNode; delay?: number; dir?: "left" | "right"; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: dir === "left" ? -48 : 48 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}>
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.9, delay }}
      style={style}>
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.93 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}>
      {children}
    </motion.div>
  );
}

/* Label pill — no section numbers */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "8px 20px", borderRadius: 999,
      background: "rgba(0,212,255,0.07)",
      border: "1px solid rgba(0,212,255,0.2)",
      fontFamily: "'Inter', sans-serif",
      fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
      textTransform: "uppercase" as const,
      color: "rgba(0,212,255,0.75)",
      marginBottom: 36,
    }}>
      {children}
    </div>
  );
}

/* Animated bar chart */
function Bar({ label, pct, color, delay }: { label: string; pct: number; color: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div ref={ref} style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: "'Inter'", fontSize: 19, color: "rgba(255,255,255,0.7)" }}>{label}</span>
        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 19, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "100%", background: color, borderRadius: 3 }}
        />
      </div>
    </div>
  );
}

/* Section divider */
function Divider() {
  return <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />;
}

/* ─────────────────── data ──────────────────────────────────────── */

const CATEGORIES = [
  { label: "Games & Entertainment", pct: 74, color: GOLD },
  { label: "Lifestyle & Social", pct: 68, color: CYAN },
  { label: "Health & Fitness", pct: 61, color: "#7B61FF" },
  { label: "Education & Learning", pct: 54, color: "#34D399" },
  { label: "Productivity Tools", pct: 47, color: "#F472B6" },
];

const APP_BENCHMARKS = [
  { name: "Candy Crush Saga", rev: "$400M+/yr", icon: "🍬", cat: "Puzzle" },
  { name: "Clash of Clans", rev: "$1.5B+/yr", icon: "⚔️", cat: "Strategy" },
  { name: "Roblox", rev: "$2.7B+/yr", icon: "🎮", cat: "Platform" },
  { name: "Subway Surfers", rev: "$200M+/yr", icon: "🏄", cat: "Runner" },
  { name: "Duolingo", rev: "$500M+/yr", icon: "🦜", cat: "Education" },
  { name: "Calm", rev: "$150M+/yr", icon: "🧘", cat: "Wellness" },
  { name: "MyFitnessPal", rev: "$120M+/yr", icon: "💪", cat: "Fitness" },
  { name: "PicsArt", rev: "$100M+/yr", icon: "🎨", cat: "Creative" },
];

const MONETIZE = [
  { icon: <Megaphone />, title: "Advertising", desc: "Display ads, rewarded video, interstitials — every session generates revenue without charging users." },
  { icon: <ShoppingCart />, title: "In-App Purchases", desc: "Coins, power-ups, premium levels. Small purchases repeated over millions of sessions." },
  { icon: <TrendingUp />, title: "Premium Upgrades", desc: "One-time unlocks for advanced features, expanded content, and enhanced experiences." },
  { icon: <Repeat />, title: "Subscriptions", desc: "Monthly or annual plans that unlock exclusive access, ad-free play, and premium content." },
  { icon: <Radio />, title: "Sponsored Promotions", desc: "Brand integrations and sponsored levels open partnership channels as your audience grows." },
];

const BARRIERS = [
  { icon: <Settings />, title: "Too Technical", desc: "Most people believe you need years of coding experience. Modern app development has removed that barrier." },
  { icon: <DollarSign />, title: "Too Expensive", desc: "Custom development can cost $100K–$500K+. Without a proven template system, most people can't afford entry." },
  { icon: <Lock />, title: "Too Confusing", desc: "Developer accounts, App Store guidelines, monetization setup — labyrinthine without a guide who has navigated it hundreds of times." },
  { icon: <Users />, title: "No Guidance", desc: "Without a team that knows the exact path from idea to live product, most people stall before they ever start." },
];

const PROCESS = [
  { num: "01", title: "Choose Template", desc: "Browse 50+ proven game templates across categories. Select the one that aligns with your brand vision." },
  { num: "02", title: "Customize Branding", desc: "Define your app name, visual identity, color palette, and brand elements with your dedicated coordinator." },
  { num: "03", title: "Prepare Monetization", desc: "Ad networks, in-app purchases, and analytics configured and tested — revenue architecture built before launch." },
  { num: "04", title: "Launch Your Digital Product", desc: "App Store and Google Play submission handled completely. You receive a live, revenue-ready digital asset." },
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
    packageHeadline: "START YOUR FIRST APP LAUNCH",
    packageDesc: "Perfect for first-time app owners who want to launch their first digital asset.",
    tag: "ENTRY PATH",
    tagColor: CYAN,
    isAccelerator: false,
    isEmpire: false,
    features: [
      "1 custom mobile game app",
      "Template selection & branding",
      "Ad monetization setup",
      "App Store submission",
      "30-day post-launch support",
    ],
    cta: "START ESSENTIALS ENROLLMENT",
    route: "/enrollment?plan=essentials",
  },
  {
    name: "App Ownership\nAccelerator",
    packageHeadline: "BUILD A STRONGER APP BRAND",
    packageDesc: "For entrepreneurs who want a more complete launch experience.",
    tag: "MOST POPULAR",
    tagColor: CYAN,
    isAccelerator: true,
    isEmpire: false,
    features: [
      "1 custom mobile game app",
      "Advanced branding & custom UI",
      "Full monetization suite (ads + IAP)",
      "App Store + Google Play",
      "60-day growth support",
      "Revenue optimization coaching",
      "Analytics dashboard access",
    ],
    cta: "START ACCELERATOR ENROLLMENT",
    route: "/enrollment?plan=accelerator",
  },
  {
    name: "Digital Asset\nEmpire",
    packageHeadline: "THE COMPLETE APP OWNERSHIP EXPERIENCE",
    packageDesc: "For serious buyers who want the strongest implementation package available.",
    tag: "PREMIUM",
    tagColor: PURPLE,
    isAccelerator: false,
    isEmpire: true,
    features: [
      "Up to 3 custom mobile game apps",
      "Full custom design & development",
      "Complete monetization architecture",
      "Priority publishing & compliance",
      "90-day dedicated launch manager",
      "Quarterly strategy sessions",
      "App portfolio growth roadmap",
    ],
    cta: "START EMPIRE ENROLLMENT",
    route: "/enrollment?plan=empire",
  },
];

const ENROLLMENT_STEPS = [
  { icon: <FileText />, title: "Complete Your Agreement", desc: "Review and sign the App Squad partnership agreement. All terms, deliverables, and timelines clearly defined." },
  { icon: <CreditCard />, title: "Activate Your Package", desc: "Your investment is processed and your package activated immediately. Coordinator assigned within 24 hours." },
  { icon: <Layers />, title: "Select Your Game Template", desc: "Browse 50+ proven templates and lock in your game category and genre with your coordinator's guidance." },
  { icon: <Settings />, title: "Submit Customization Details", desc: "Complete your brand form — app name, colors, characters, and identity. This becomes your build blueprint." },
  { icon: <LayoutDashboard />, title: "Receive Dashboard Access", desc: "Your owner's dashboard goes live. Track progress, review milestones, communicate with your team." },
  { icon: <Rocket />, title: "Begin Development", desc: "Your dedicated build team activates and your app's development timeline officially starts." },
  { icon: <TrendingUp />, title: "App Launch Preparation", desc: "Pre-launch checklist, app store optimization, and final QA review before your app goes live on both stores." },
];

/* ─────────────────── page ──────────────────────────────────────── */

export default function Presentation() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  /* shared styles */
  const heroFontSize = "clamp(56px, 8.5vw, 110px)";
  const sectionFontSize = "clamp(44px, 6.5vw, 86px)";
  const cardTitleSize = "clamp(26px, 2.4vw, 36px)";
  const bodySize = "clamp(18px, 1.5vw, 22px)";

  const goldBtn = {
    background: `linear-gradient(135deg, ${CYAN} 0%, #0099BB 100%)`,
    color: "#050505",
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
    boxShadow: `0 8px 48px rgba(0,212,255,0.22), 0 2px 12px rgba(0,0,0,0.6)`,
    transition: "opacity 0.18s, transform 0.18s",
  } as React.CSSProperties;

  return (
    <div style={{ background: "#050505", minHeight: "100vh", overflowX: "hidden", color: "#E8ECF2" }}>

      {/* ══════════════════════════════════════════════════════════════
          THE BIG IDEA
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", padding: "160px 48px 140px", minHeight: "92vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Fine grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "80px 80px", pointerEvents: "none" }} />
        {/* Glow */}
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 1000, height: 600, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 65%)`, filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 240, background: "linear-gradient(transparent, #050505)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          <FadeUp>
            <Label>The Mobile App Ownership Opportunity</Label>
          </FadeUp>

          <FadeUp delay={0.08}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: heroFontSize, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.95, marginBottom: 44, textTransform: "uppercase" }}>
              Most People{" "}
              <span style={{ color: GOLD }}>Spend Money</span>{" "}
              in Apps.
              <br />
              Very Few Ever{" "}
              <span style={{ color: GOLD }}>Own One.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.15}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: bodySize, lineHeight: 1.85, color: "rgba(255,255,255,0.42)", fontWeight: 300, maxWidth: 680, margin: "0 auto" }}>
              The mobile app economy is one of the largest digital ecosystems in the world.
              Millions participate every day. Very few ever build an asset inside it.
            </p>
          </FadeUp>

          <FadeUp delay={0.3} style={{ marginTop: 80 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 64, marginTop: 100 }}>
              {[
                { val: "$1.1T", label: "Global App Economy 2025" },
                { val: "7.1B+", label: "Smartphone Users Worldwide" },
                { val: "40B+", label: "App Downloads Per Quarter" },
              ].map(s => (
                <div key={s.val} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(40px, 4.5vw, 62px)", fontWeight: 700, color: GOLD, letterSpacing: "-0.045em", lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(255,255,255,0.3)", marginTop: 10, letterSpacing: "0.07em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CONSUMER vs OWNER  [LARGEST SECTION]
      ══════════════════════════════════════════════════════════════ */}
      <section id="consumer-owner" style={{ position: "relative", padding: "180px 0 200px", overflow: "hidden", background: "linear-gradient(180deg, #050505 0%, #080808 40%, #050505 100%)" }}>
        {/* Ambient split lighting */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "100%", background: "radial-gradient(ellipse at 20% 50%, rgba(109,7,26,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "100%", background: `radial-gradient(ellipse at 80% 50%, rgba(0,212,255,0.07) 0%, transparent 60%)`, pointerEvents: "none" }} />

        {/* Label + headline */}
        <FadeUp style={{ textAlign: "center", marginBottom: 56, padding: "0 48px" }}>
          <Label>The Identity Shift</Label>
        </FadeUp>

        <FadeUp delay={0.06} style={{ textAlign: "center", marginBottom: 120, padding: "0 48px" }}>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: heroFontSize, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.92, textTransform: "uppercase" }}>
            <span style={{ display: "block", color: "rgba(255,255,255,0.18)", fontSize: "0.55em", marginBottom: 16, letterSpacing: "-0.02em" }}>Everyone in the app economy is either a</span>
            <span style={{ color: `rgba(109,7,26,0.65)` }}>Consumer</span>
            <span style={{ color: "rgba(255,255,255,0.14)", margin: "0 32px" }}>or an</span>
            <span style={{ color: GOLD }}>Owner</span>
          </h2>
        </FadeUp>

        {/* Full-bleed two-panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", minHeight: 700 }}>
          {/* Consumer */}
          <SlideIn dir="left" delay={0.08} style={{ padding: "80px 72px 80px 80px" }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(13px, 1.1vw, 16px)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(109,7,26,0.65)", marginBottom: 28 }}>Most People Stay Consumers</div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 64 }}>
              <div style={{ width: 80, height: 80, borderRadius: 22, background: "rgba(109,7,26,0.07)", border: "1px solid rgba(109,7,26,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Download style={{ width: 36, height: 36, color: "rgba(109,7,26,0.6)" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(32px, 3.5vw, 52px)", fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: "rgba(109,7,26,0.5)", lineHeight: 1 }}>Consumers</div>
                <div style={{ fontFamily: "'Inter'", fontSize: 17, color: "rgba(255,255,255,0.18)", marginTop: 6 }}>Participates in the ecosystem</div>
              </div>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 36 }}>
              {[
                { text: "Downloads Apps", sub: "Fills someone else's ecosystem" },
                { text: "Buys Upgrades", sub: "Funds someone else's business" },
                { text: "Watches Ads", sub: "Generates revenue for the owner" },
                { text: "Uses Products", sub: "Consumes what others built" },
                { text: "Participates In Ecosystems", sub: "With no ownership stake" },
              ].map(item => (
                <li key={item.text} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(109,7,26,0.06)", border: "1px solid rgba(109,7,26,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 3 }}>
                    <span style={{ color: "rgba(109,7,26,0.65)", fontSize: 17, fontWeight: 700 }}>✕</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Inter'", fontSize: "clamp(22px, 2.2vw, 30px)", lineHeight: 1.2, color: "rgba(255,255,255,0.32)", fontWeight: 500 }}>{item.text}</div>
                    <div style={{ fontFamily: "'Inter'", fontSize: 16, color: "rgba(255,255,255,0.16)", marginTop: 5 }}>{item.sub}</div>
                  </div>
                </li>
              ))}
            </ul>
          </SlideIn>

          {/* Divider line */}
          <div style={{ background: "rgba(255,255,255,0.06)", alignSelf: "stretch" }} />

          {/* Owner */}
          <SlideIn dir="right" delay={0.12} style={{ padding: "80px 80px 80px 72px", background: "linear-gradient(135deg, rgba(0,212,255,0.03) 0%, transparent 60%)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />
            <div style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(13px, 1.1vw, 16px)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: `rgba(0,212,255,0.75)`, marginBottom: 28, position: "relative", zIndex: 1 }}>A Small Group Choose Ownership</div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 64, position: "relative", zIndex: 1 }}>
              <div style={{ width: 80, height: 80, borderRadius: 22, background: "rgba(0,212,255,0.08)", border: `1px solid rgba(0,212,255,0.22)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Award style={{ width: 36, height: 36, color: GOLD }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(32px, 3.5vw, 52px)", fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", color: GOLD, lineHeight: 1 }}>Ownership</div>
                <div style={{ fontFamily: "'Inter'", fontSize: 17, color: `rgba(0,212,255,0.4)`, marginTop: 6 }}>Builds inside the ecosystem</div>
              </div>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 36, position: "relative", zIndex: 1 }}>
              {[
                { text: "Owns Digital Assets", sub: "A product that works without you" },
                { text: "Builds Brands", sub: "Identity, loyalty, and equity" },
                { text: "Creates Products", sub: "Users pay you for access" },
                { text: "Owns Intellectual Property", sub: "Something that compounds in value" },
                { text: "Participates In Growth", sub: "As the ecosystem expands, so do you" },
              ].map(item => (
                <li key={item.text} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,212,255,0.08)", border: `1px solid rgba(0,212,255,0.18)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 3 }}>
                    <CheckCircle2 style={{ width: 20, height: 20, color: GOLD }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Inter'", fontSize: "clamp(22px, 2.2vw, 30px)", lineHeight: 1.2, color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{item.text}</div>
                    <div style={{ fontFamily: "'Inter'", fontSize: 16, color: `rgba(0,212,255,0.4)`, marginTop: 5 }}>{item.sub}</div>
                  </div>
                </li>
              ))}
            </ul>
          </SlideIn>
        </div>

        {/* Bottom statement */}
        <FadeUp delay={0.28} style={{ padding: "100px 80px 0", textAlign: "center" }}>
          <p style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(24px, 3vw, 42px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.4, color: "rgba(255,255,255,0.65)", maxWidth: 900, margin: "0 auto" }}>
            The app economy generated{" "}
            <span style={{ color: GOLD }}>over $1 trillion in 2025 alone.</span>
            <br />
            The only question is: which side of that number are you on?
          </p>
        </FadeUp>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════
          VIDEO — REAL APP OWNER STORIES  [LARGE]
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "140px 48px 160px", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 900, height: 600, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 65%)`, filter: "blur(100px)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 72 }}>
            <Label>Launch Stories & Walkthrough</Label>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: sectionFontSize, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.95, textTransform: "uppercase", marginBottom: 28 }}>
              Real App Owner Stories
              <br />
              <span style={{ color: CYAN }}>&amp; Launch Walkthrough</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: bodySize, color: "rgba(255,255,255,0.4)", maxWidth: 680, margin: "0 auto", lineHeight: 1.8 }}>
              See how customers moved from idea to ownership through the App Squad launch process.
            </p>
          </FadeUp>

          <ScaleIn delay={0.1}>
            <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: `0 0 0 1px rgba(0,212,255,0.12), 0 60px 120px -30px rgba(0,0,0,0.97), 0 0 100px -40px rgba(0,212,255,0.05)` }}>
              <div style={{ position: "relative", paddingBottom: "56.25%" }}>
                <iframe
                  src="https://player.vimeo.com/video/1197652826?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&dnt=1"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  allowFullScreen
                  title="App Squad — Real Owner Stories & Launch Walkthrough"
                />
              </div>
            </div>
          </ScaleIn>

          <FadeUp delay={0.2} style={{ marginTop: 48 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "36px 44px" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: CYAN, marginBottom: 28 }}>
                What this video covers
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                {[
                  "Real customer journeys from consultation to launch",
                  "The full app build and branding process",
                  "Monetization setup and configuration walkthrough",
                  "App Store submission and approval process",
                  "Dashboard access and owner experience",
                  "Post-launch support and growth coaching",
                ].map(item => (
                  <div key={item} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <CheckCircle2 style={{ width: 18, height: 18, color: CYAN, flexShrink: 0, marginTop: 3 }} />
                    <span style={{ fontFamily: "'Inter'", fontSize: 19, lineHeight: 1.55, color: "rgba(255,255,255,0.5)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════
          THE APP ECONOMY  [MASSIVE SECTION]
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "160px 48px 200px", background: "linear-gradient(180deg, #050505 0%, #080808 25%, #050505 100%)", position: "relative" }}>
        <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 1400, height: 900, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(0,212,255,0.03) 0%, transparent 65%)`, filter: "blur(140px)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1440, margin: "0 auto" }}>
          {/* Headline */}
          <FadeUp style={{ textAlign: "center", marginBottom: 110 }}>
            <Label><BarChart3 style={{ width: 13, height: 13 }} /> 2025 Market Intelligence</Label>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: sectionFontSize, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.92, textTransform: "uppercase", marginBottom: 36 }}>
              The App Economy
              <br />
              <span style={{ color: CYAN }}>Is Already Here</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: "clamp(20px, 1.8vw, 26px)", color: "rgba(255,255,255,0.38)", maxWidth: 760, margin: "0 auto", lineHeight: 1.75 }}>
              The market already exists. The users already exist. The ecosystem already exists.
              <br />The only question is whether you're inside it as a consumer or an owner.
            </p>
          </FadeUp>

          {/* Tier 1 — Hero stats */}
          <FadeUp delay={0.06}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 56 }}>
              {[
                { val: "$1.1T", label: "Global App Economy", sub: "2025 — Data.ai / Sensor Tower", color: GOLD },
                { val: "7.1B", label: "Smartphone Users", sub: "Worldwide — Statista 2025", color: CYAN },
                { val: "40B+", label: "Downloads / Quarter", sub: "Q1 2025 Combined Stores", color: "#7B61FF" },
                { val: "$200B+", label: "Consumer App Spend", sub: "App Stores 2025 Combined", color: "#34D399" },
              ].map(s => (
                <div key={s.val} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}1E`, borderRadius: 20, padding: "48px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -24, left: "50%", transform: "translateX(-50%)", width: 160, height: 80, borderRadius: "50%", background: `radial-gradient(ellipse, ${s.color}14 0%, transparent 70%)`, filter: "blur(20px)", pointerEvents: "none" }} />
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(38px, 3.8vw, 58px)", fontWeight: 700, color: s.color, letterSpacing: "-0.045em", lineHeight: 1, marginBottom: 12 }}>{s.val}</div>
                  <div style={{ fontFamily: "'Inter'", fontSize: 17, fontWeight: 600, color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Inter'", fontSize: 12, color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Tier 2 — Category bars + Revenue benchmarks */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <FadeIn delay={0.08}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "52px 48px", height: "100%" }}>
                <div style={{ fontFamily: "'Space Grotesk'", fontSize: cardTitleSize, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8 }}>Revenue Growth by Category</div>
                <div style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(255,255,255,0.28)", marginBottom: 48, textTransform: "uppercase", letterSpacing: "0.07em" }}>2025 mobile market — year-over-year</div>
                {CATEGORIES.map((cat, i) => (
                  <Bar key={cat.label} {...cat} delay={i * 0.1} />
                ))}
                <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "rgba(255,255,255,0.18)", marginTop: 28 }}>
                  * Based on 2025 industry reports and app store analytics.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.12}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "52px 48px", height: "100%" }}>
                <div style={{ fontFamily: "'Space Grotesk'", fontSize: cardTitleSize, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8 }}>Known App Revenue Benchmarks</div>
                <div style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(255,255,255,0.28)", marginBottom: 48, textTransform: "uppercase", letterSpacing: "0.07em" }}>Estimates from public industry data</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {APP_BENCHMARKS.map((app, i) => (
                    <motion.div
                      key={app.name}
                      initial={{ opacity: 0, x: 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.52, delay: i * 0.07 }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "18px 22px", borderLeft: `3px solid rgba(0,212,255,${0.55 - i * 0.05})` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontSize: 28 }}>{app.icon}</span>
                        <div>
                          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 600 }}>{app.name}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{app.cat}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 700, color: GOLD }}>{app.rev}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Tier 3 — Ecosystem panels */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
            {[
              {
                icon: "📱", title: "App Store Ecosystem", stat: "900M+", statSub: "Paid apps downloaded — iOS alone",
                facts: ["Games account for 70%+ of total app revenue", "Top 1% of games earn 90%+ of all revenue", "Average smartphone user has 40+ apps installed"],
              },
              {
                icon: "🌍", title: "Global Market Reach", stat: "190+", statSub: "Countries served by major app stores",
                facts: ["Asia Pacific leads total download volume", "North America leads revenue per user", "Emerging markets represent fastest growth"],
              },
              {
                icon: "⚡", title: "2025 Market Velocity", stat: "40B+", statSub: "Downloads in a single quarter — 2025",
                facts: ["Mobile gaming now outpaces console + PC combined", "IAP revenue grew 38%+ over 3 years", "Rewarded video is the fastest-growing ad format"],
              },
            ].map((panel, i) => (
              <FadeUp key={panel.title} delay={i * 0.08}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "44px 36px", height: "100%" }}>
                  <div style={{ fontSize: 44, marginBottom: 22 }}>{panel.icon}</div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(36px, 3vw, 50px)", fontWeight: 700, letterSpacing: "-0.04em", color: CYAN, lineHeight: 1, marginBottom: 6 }}>{panel.stat}</div>
                  <div style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 32, textTransform: "uppercase", letterSpacing: "0.06em" }}>{panel.statSub}</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
                    {panel.facts.map(f => (
                      <li key={f} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: CYAN, flexShrink: 0, marginTop: 10, opacity: 0.6 }} />
                        <span style={{ fontFamily: "'Inter'", fontSize: 18, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Tier 4 — Category rankings */}
          <FadeIn delay={0.14}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(0,212,255,0.1)`, borderRadius: 20, padding: "52px 48px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 44, flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: cardTitleSize, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 6 }}>Top Game Categories by Download Volume</div>
                  <div style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.07em" }}>App Store &amp; Google Play combined — 2025–2026 intelligence</div>
                </div>
                <div style={{ fontFamily: "'Inter'", fontSize: 13, color: "rgba(255,255,255,0.18)", fontStyle: "italic" }}>Based on publicly available industry data</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {[
                  { rank: "#1", cat: "Casual Games", detail: "Puzzle, idle, match-3", color: GOLD },
                  { rank: "#2", cat: "Arcade & Action", detail: "Runners, shooters, platformers", color: CYAN },
                  { rank: "#3", cat: "Strategy", detail: "Tower defense, city builders", color: "#7B61FF" },
                  { rank: "#4", cat: "Word & Trivia", detail: "Brain games, crosswords", color: "#34D399" },
                  { rank: "#5", cat: "Racing & Sports", detail: "Simulation, endless racers", color: "#F472B6" },
                  { rank: "#6", cat: "RPG & Adventure", detail: "Story-driven, character builds", color: "#FB923C" },
                ].map(row => (
                  <div key={row.rank} style={{ display: "flex", gap: 18, alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "22px 24px" }}>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 28, fontWeight: 700, color: row.color, minWidth: 44 }}>{row.rank}</div>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 600 }}>{row.cat}</div>
                      <div style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(255,255,255,0.32)", marginTop: 3 }}>{row.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════
          HOW APPS MONETIZE
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 48px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 80 }}>
            <Label><DollarSign style={{ width: 13, height: 13 }} /> Revenue Architecture</Label>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: sectionFontSize, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.95, textTransform: "uppercase", marginBottom: 24 }}>
              5 Ways Your App
              <br />
              <span style={{ color: GOLD }}>Generates Revenue</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: bodySize, color: "rgba(255,255,255,0.38)", maxWidth: 620, margin: "0 auto", lineHeight: 1.8 }}>
              Educational only. The best app businesses layer multiple streams from the same digital asset.
            </p>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 22 }}>
            {MONETIZE.map((m, i) => (
              <FadeUp key={m.title} delay={i * 0.07}>
                <div
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "48px 40px", height: "100%", display: "flex", flexDirection: "column", gap: 22, transition: "border-color 0.25s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(0,212,255,0.22)`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                  <div style={{ width: 68, height: 68, borderRadius: 20, background: "rgba(0,212,255,0.07)", border: `1px solid rgba(0,212,255,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD }}>
                    {m.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: cardTitleSize, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 14 }}>{m.title}</div>
                    <p style={{ fontFamily: "'Inter'", fontSize: bodySize, lineHeight: 1.75, color: "rgba(255,255,255,0.42)" }}>{m.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════
          WHY MOST NEVER ENTER → APP SQUAD EXISTS
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 48px", background: "rgba(12,15,22,0.7)" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 80 }}>
            <Label><Lock style={{ width: 13, height: 13 }} /> The Barriers</Label>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: sectionFontSize, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.95, textTransform: "uppercase" }}>
              Why Most People
              <br />
              <span style={{ color: "rgba(109,7,26,0.65)" }}>Never Enter</span>
            </h2>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 22, marginBottom: 80 }}>
            {BARRIERS.map((b, i) => (
              <FadeUp key={b.title} delay={i * 0.08}>
                <div style={{ background: "rgba(109,7,26,0.025)", border: "1px solid rgba(109,7,26,0.1)", borderRadius: 20, padding: "48px 40px", height: "100%" }}>
                  <div style={{ width: 68, height: 68, borderRadius: 20, background: "rgba(109,7,26,0.07)", border: "1px solid rgba(109,7,26,0.13)", display: "flex", alignItems: "center", justifyContent: "center", color: `rgba(109,7,26,0.7)`, marginBottom: 32 }}>
                    {b.icon}
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: cardTitleSize, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 16 }}>{b.title}</div>
                  <p style={{ fontFamily: "'Inter'", fontSize: bodySize, lineHeight: 1.75, color: "rgba(255,255,255,0.42)" }}>{b.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Transition */}
          <FadeUp delay={0.24}>
            <div style={{ background: `linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(0,212,255,0.02) 100%)`, border: `1px solid rgba(0,212,255,0.22)`, borderRadius: 24, padding: "80px 64px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: `0 0 100px -40px rgba(0,212,255,0.1)` }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 350, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(0,212,255,0.05) 0%, transparent 70%)`, filter: "blur(80px)", pointerEvents: "none" }} />
              <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(36px, 5vw, 70px)", fontWeight: 700, letterSpacing: "-0.04em", textTransform: "uppercase", position: "relative", zIndex: 1, marginBottom: 24 }}>
                That's Why
                <br />
                <span style={{ color: GOLD }}>App Squad Exists</span>
              </h3>
              <p style={{ fontFamily: "'Inter'", fontSize: bodySize, color: "rgba(255,255,255,0.45)", maxWidth: 620, margin: "0 auto", lineHeight: 1.8, position: "relative", zIndex: 1 }}>
                Every barrier above is removed inside the App Squad system. Technical, financial, logistical, and directional — all handled.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════
          APP SQUAD SOLUTION
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 80 }}>
            <Label><Award style={{ width: 13, height: 13 }} /> The Process</Label>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: sectionFontSize, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.95, textTransform: "uppercase" }}>
              A Simplified
              <br />
              <span style={{ color: GOLD }}>App Ownership Process</span>
            </h2>
          </FadeUp>
          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 940, margin: "0 auto" }}>
            {PROCESS.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.09}>
                <div
                  style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(0,212,255,0.12)`, borderRadius: 20, padding: "44px 48px", display: "flex", gap: 40, alignItems: "flex-start", transition: "border-color 0.25s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(0,212,255,0.3)`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = `rgba(0,212,255,0.12)`)}>
                  <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(40px, 4.5vw, 68px)", color: `rgba(0,212,255,0.18)`, lineHeight: 1, minWidth: 64, letterSpacing: "-0.04em", flexShrink: 0 }}>{step.num}</div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: cardTitleSize, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 14 }}>{step.title}</div>
                    <p style={{ fontFamily: "'Inter'", fontSize: bodySize, lineHeight: 1.75, color: "rgba(255,255,255,0.42)" }}>{step.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════
          GAME TEMPLATE GALLERY
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 48px", background: "rgba(12,15,22,0.7)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 80 }}>
            <Label><Layers style={{ width: 13, height: 13 }} /> Template Library</Label>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: sectionFontSize, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.95, textTransform: "uppercase", marginBottom: 24 }}>
              50+ Proven Templates
              <br />
              <span style={{ color: GOLD }}>Ready to Become Your Brand</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: bodySize, color: "rgba(255,255,255,0.38)", maxWidth: 600, margin: "0 auto", lineHeight: 1.8 }}>
              Every template is tested in real app stores with real users. You're not starting from scratch — you're starting from proven.
            </p>
          </FadeUp>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
            {TEMPLATES.map((tmpl, i) => (
              <FadeUp key={tmpl.name} delay={i * 0.06}>
                <div
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "48px 32px", textAlign: "center", cursor: "pointer", position: "relative", overflow: "hidden", transition: "border-color 0.22s, background 0.22s, transform 0.22s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(0,212,255,0.3)`; e.currentTarget.style.background = `rgba(0,212,255,0.03)`; e.currentTarget.style.transform = "translateY(-5px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  {tmpl.tag && (
                    <div style={{ position: "absolute", top: 16, right: 16, padding: "5px 11px", borderRadius: 7, background: tmpl.tag === "Most Popular" ? `rgba(0,212,255,0.12)` : tmpl.tag === "New" ? "rgba(52,211,153,0.1)" : "rgba(0,212,255,0.09)", border: `1px solid ${tmpl.tag === "Most Popular" ? `rgba(0,212,255,0.28)` : tmpl.tag === "New" ? "rgba(52,211,153,0.22)" : "rgba(0,212,255,0.2)"}`, fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: tmpl.tag === "Most Popular" ? GOLD : tmpl.tag === "New" ? "#34D399" : CYAN }}>
                      {tmpl.tag}
                    </div>
                  )}
                  <div style={{ fontSize: 60, marginBottom: 22 }}>{tmpl.icon}</div>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>{tmpl.name}</div>
                  <div style={{ fontSize: 14, color: GOLD, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", opacity: 0.8 }}>{tmpl.genre}</div>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.35} style={{ textAlign: "center", marginTop: 44 }}>
            <p style={{ fontFamily: "'Inter'", fontSize: 19, color: "rgba(255,255,255,0.25)" }}>And 40+ more — puzzle, idle, arcade, simulation, trivia, and beyond.</p>
          </FadeUp>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════
          WHICH PATH FITS YOU?  [DECISION SECTION]
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "160px 48px 180px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translateX(-50%)", width: 1200, height: 800, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 65%)`, filter: "blur(120px)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1500, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 36 }}>
            <Label><Package style={{ width: 13, height: 13 }} /> The Decision</Label>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: sectionFontSize, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.95, textTransform: "uppercase", marginBottom: 24 }}>
              Which App Ownership Path
              <br />
              <span style={{ color: GOLD }}>Fits You?</span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.06} style={{ textAlign: "center", marginBottom: 88 }}>
            <p style={{ fontFamily: "'Inter'", fontSize: bodySize, color: "rgba(255,255,255,0.38)", maxWidth: 680, margin: "0 auto", lineHeight: 1.8 }}>
              Three paths. One goal. The right entry point depends on where you are and how fast you want to move.
            </p>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: 22, alignItems: "start" }}>
            {PACKAGES.map((pkg, i) => (
              <FadeUp key={pkg.name} delay={i * 0.1}>
                <div style={{
                  background: pkg.isAccelerator
                    ? "linear-gradient(155deg, #0E1828 0%, #0A1220 60%, #08101A 100%)"
                    : pkg.isEmpire ? "linear-gradient(155deg, #130F28 0%, #0D0B1C 60%, #080614 100%)"
                    : "rgba(255,255,255,0.02)",
                  border: pkg.isAccelerator
                    ? `1px solid rgba(0,212,255,0.55)`
                    : pkg.isEmpire ? "1px solid rgba(123,97,255,0.42)"
                    : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 24,
                  padding: pkg.isAccelerator ? "68px 52px" : "56px 44px",
                  display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
                  boxShadow: pkg.isAccelerator
                    ? `0 0 0 1px rgba(0,212,255,0.1), 0 0 180px -20px rgba(0,212,255,0.22), 0 40px 80px -20px rgba(0,0,0,0.95)`
                    : pkg.isEmpire
                    ? `0 0 0 1px rgba(123,97,255,0.08), 0 0 120px -30px rgba(123,97,255,0.18), 0 30px 60px -20px rgba(0,0,0,0.9)`
                    : "none",
                  marginTop: pkg.isAccelerator ? -28 : 0,
                }}>
                  {pkg.isAccelerator && (
                    <>
                      <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(0,212,255,0.09) 0%, transparent 70%)`, filter: "blur(50px)", pointerEvents: "none" }} />
                      <div style={{ position: "absolute", bottom: -50, left: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(0,212,255,0.05) 0%, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />
                    </>
                  )}
                  {pkg.isEmpire && (
                    <div style={{ position: "absolute", top: -40, right: -40, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(123,97,255,0.06) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
                  )}

                  {/* Tag */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: 10, alignSelf: "flex-start", marginBottom: 32, background: pkg.isAccelerator ? `rgba(0,212,255,0.1)` : pkg.isEmpire ? "rgba(123,97,255,0.08)" : `rgba(0,212,255,0.07)`, border: `1px solid ${pkg.isAccelerator ? "rgba(0,212,255,0.3)" : pkg.isEmpire ? "rgba(123,97,255,0.22)" : "rgba(0,212,255,0.18)"}`, fontSize: 13, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" as const, color: pkg.tagColor, position: "relative", zIndex: 1 }}>
                    {pkg.isAccelerator && <Star style={{ width: 12, height: 12, fill: GOLD, color: GOLD }} />}
                    {pkg.tag}
                  </div>

                  {/* Name */}
                  <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: pkg.isAccelerator ? "clamp(28px, 2.6vw, 42px)" : "clamp(24px, 2.2vw, 36px)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.1, whiteSpace: "pre-line", marginBottom: 16, position: "relative", zIndex: 1 }}>{pkg.name}</h3>
                  {/* Identity headline */}
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: pkg.isAccelerator ? "clamp(13px, 1.1vw, 16px)" : "clamp(12px, 1vw, 14px)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: pkg.isAccelerator ? GOLD : pkg.isEmpire ? "#7B61FF" : CYAN, marginBottom: 12, position: "relative", zIndex: 1 }}>{pkg.packageHeadline}</div>
                  <div style={{ fontFamily: "'Inter'", fontSize: 16, color: "rgba(255,255,255,0.38)", marginBottom: 36, lineHeight: 1.65, position: "relative", zIndex: 1 }}>{pkg.packageDesc}</div>
                  <div style={{ height: 1, background: pkg.isAccelerator ? `rgba(0,212,255,0.14)` : "rgba(255,255,255,0.06)", marginBottom: 36, position: "relative", zIndex: 1 }} />

                  {/* Features */}
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 20, flex: 1, position: "relative", zIndex: 1 }}>
                    {pkg.features.map(f => (
                      <li key={f} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, marginTop: 2, background: pkg.isAccelerator ? `rgba(0,212,255,0.09)` : pkg.isEmpire ? "rgba(123,97,255,0.07)" : "rgba(52,211,153,0.06)", border: `1px solid ${pkg.isAccelerator ? "rgba(0,212,255,0.2)" : pkg.isEmpire ? "rgba(123,97,255,0.16)" : "rgba(52,211,153,0.14)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CheckCircle2 style={{ width: 13, height: 13, color: pkg.isAccelerator ? GOLD : pkg.isEmpire ? "#7B61FF" : "#34D399" }} />
                        </div>
                        <span style={{ fontFamily: "'Inter'", fontSize: pkg.isAccelerator ? 20 : 19, lineHeight: 1.55, color: pkg.isAccelerator ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.52)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => window.open(pkg.route, "_blank")}
                    style={{
                      marginTop: 44,
                      width: "100%",
                      padding: pkg.isAccelerator ? "26px 0" : "22px 0",
                      borderRadius: 12,
                      fontFamily: "'Space Grotesk'",
                      fontWeight: 700,
                      fontSize: pkg.isAccelerator ? 16 : 14,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      position: "relative",
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      ...(pkg.isAccelerator ? {
                        background: "linear-gradient(135deg, #00D4FF 0%, #7B61FF 100%)",
                        border: "none",
                        color: "#FFFFFF",
                        boxShadow: "0 0 0 1px rgba(0,212,255,0.4), 0 8px 40px rgba(0,212,255,0.25), 0 4px 16px rgba(123,97,255,0.15)",
                      } : pkg.isEmpire ? {
                        background: "linear-gradient(135deg, #7B61FF 0%, #5B41DF 60%, #7B61FF 100%)",
                        border: "1px solid rgba(123,97,255,0.55)",
                        color: "#FFFFFF",
                        boxShadow: "0 0 0 1px rgba(123,97,255,0.2), inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(123,97,255,0.3)",
                      } : {
                        background: "#050505",
                        border: "1px solid rgba(0,212,255,0.35)",
                        color: "#00D4FF",
                        boxShadow: "0 0 0 1px rgba(0,212,255,0.08), inset 0 1px 0 rgba(0,212,255,0.06), 0 4px 20px rgba(0,0,0,0.4)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease",
                      }),
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-3px) scale(1.01)";
                      if (pkg.isAccelerator) {
                        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(0,212,255,0.6), 0 16px 60px rgba(0,212,255,0.35), 0 8px 30px rgba(123,97,255,0.25)";
                        e.currentTarget.style.filter = "brightness(1.08)";
                      } else if (pkg.isEmpire) {
                        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(123,97,255,0.5), 0 12px 50px rgba(123,97,255,0.4), 0 4px 20px rgba(0,0,0,0.5)";
                        e.currentTarget.style.filter = "brightness(1.12)";
                      } else {
                        e.currentTarget.style.background = "#00D4FF";
                        e.currentTarget.style.color = "#050505";
                        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(0,212,255,0.6), 0 8px 40px rgba(0,212,255,0.3), 0 4px 16px rgba(0,0,0,0.4)";
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.filter = "";
                      if (pkg.isAccelerator) {
                        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(0,212,255,0.4), 0 8px 40px rgba(0,212,255,0.25), 0 4px 16px rgba(123,97,255,0.15)";
                      } else if (pkg.isEmpire) {
                        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(123,97,255,0.2), inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(123,97,255,0.3)";
                      } else {
                        e.currentTarget.style.background = "#050505";
                        e.currentTarget.style.color = "#00D4FF";
                        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(0,212,255,0.08), inset 0 1px 0 rgba(0,212,255,0.06), 0 4px 20px rgba(0,0,0,0.4)";
                      }
                    }}>
                    {pkg.cta}
                    <ArrowRight style={{ width: 16, height: 16, flexShrink: 0 }} />
                  </button>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3} style={{ textAlign: "center", marginTop: 60 }}>
            <p style={{ fontFamily: "'Inter'", fontSize: 18, color: "rgba(255,255,255,0.22)", maxWidth: 600, margin: "0 auto", lineHeight: 1.8 }}>
              All packages include the full App Squad guided launch process. The right path depends on your goals, timeline, and level of involvement.
            </p>
          </FadeUp>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════
          WHAT HAPPENS AFTER ENROLLMENT?
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 48px", background: "rgba(12,15,22,0.7)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 80 }}>
            <Label><Rocket style={{ width: 13, height: 13 }} /> What Happens Next</Label>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: sectionFontSize, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.95, textTransform: "uppercase", marginBottom: 24 }}>
              What Happens
              <br />
              <span style={{ color: CYAN }}>After Enrollment?</span>
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: bodySize, color: "rgba(255,255,255,0.38)", maxWidth: 640, margin: "0 auto", lineHeight: 1.8 }}>
              Once you select your package, here is the exact sequence of events. No guesswork — just a clear, guided path.
            </p>
          </FadeUp>

          {/* Visual arrow flow — two column layout */}
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            {ENROLLMENT_STEPS.map((step, i) => (
              <FadeUp key={step.title} delay={i * 0.07}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Step row */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 28, width: "100%", background: "rgba(255,255,255,0.02)", border: `1px solid rgba(0,212,255,${0.12 - i * 0.01})`, borderRadius: 18, padding: "32px 40px", transition: "border-color 0.25s, background 0.25s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(0,212,255,0.3)`; (e.currentTarget as HTMLDivElement).style.background = "rgba(0,212,255,0.025)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(0,212,255,${0.12 - i * 0.01})`; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"; }}>
                    {/* Step number */}
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 42, fontWeight: 700, letterSpacing: "-0.04em", color: `rgba(0,212,255,${0.15 + (6 - i) * 0.04})`, lineHeight: 1, minWidth: 52, flexShrink: 0 }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    {/* Icon */}
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(0,212,255,0.06)", border: `1px solid rgba(0,212,255,0.14)`, display: "flex", alignItems: "center", justifyContent: "center", color: CYAN, flexShrink: 0 }}>
                      {step.icon}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(22px, 2vw, 30px)", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 6 }}>{step.title}</div>
                      <p style={{ fontFamily: "'Inter'", fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.4)", margin: 0 }}>{step.desc}</p>
                    </div>
                  </div>
                  {/* Arrow connector — not after last item */}
                  {i < ENROLLMENT_STEPS.length - 1 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", gap: 3 }}>
                      <div style={{ width: 1, height: 16, background: `rgba(0,212,255,0.2)` }} />
                      <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `8px solid rgba(0,212,255,0.3)` }} />
                    </div>
                  )}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════════
          ENROLLMENT CTA
      ══════════════════════════════════════════════════════════════ */}
      <section id="enroll" style={{ padding: "160px 48px 180px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "80px 80px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 1100, height: 700, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 65%)`, filter: "blur(100px)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          <FadeUp>
            <Label><Star style={{ width: 13, height: 13 }} /> Begin Your Journey</Label>
          </FadeUp>

          <FadeUp delay={0.07}>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: heroFontSize, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.93, marginBottom: 36, textTransform: "uppercase" }}>
              Ready to Begin Your
              <br />
              <span style={{ color: GOLD }}>App Ownership Journey?</span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.13}>
            <p style={{ fontFamily: "'Inter'", fontSize: bodySize, lineHeight: 1.85, color: "rgba(255,255,255,0.42)", maxWidth: 680, margin: "0 auto 64px" }}>
              Once you select your package, you will complete your agreement, activate your package, select your game template, submit your customization details, and receive dashboard access — all within your first week.
            </p>
          </FadeUp>

          {/* Checklist */}
          <FadeUp delay={0.18} style={{ marginBottom: 64 }}>
            <div style={{ display: "inline-flex", flexDirection: "column", gap: 20, textAlign: "left", background: "rgba(255,255,255,0.02)", border: `1px solid rgba(0,212,255,0.16)`, borderRadius: 20, padding: "44px 56px" }}>
              {[
                "Complete Your Agreement",
                "Activate Your Package",
                "Select Your Game Template",
                "Submit Your Customization Details",
                "Receive Dashboard Access",
                "Begin Development",
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.18 + i * 0.08 }}
                  style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `rgba(0,212,255,0.08)`, border: `1px solid rgba(0,212,255,0.18)`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, flexShrink: 0 }}>
                    <CheckCircle2 style={{ width: 18, height: 18 }} />
                  </div>
                  <span style={{ fontFamily: "'Inter'", fontSize: 22, color: "rgba(255,255,255,0.72)" }}>{item}</span>
                </motion.div>
              ))}
            </div>
          </FadeUp>

          {/* Main CTA */}
          <FadeUp delay={0.25}>
            <button
              onClick={() => window.open("/enrollment", "_blank")}
              style={{ ...goldBtn, fontSize: 20, padding: "28px 72px" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
              Continue To Enrollment
              <ArrowRight style={{ width: 22, height: 22 }} />
            </button>
          </FadeUp>

          <FadeUp delay={0.3} style={{ marginTop: 48 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 36 }}>
              {["Agreement sent immediately", "Coordinator assigned within 24 hrs", "Dashboard live within the week"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 style={{ width: 15, height: 15, color: GOLD }} />
                  <span style={{ fontFamily: "'Inter'", fontSize: 17, color: "rgba(255,255,255,0.35)" }}>{item}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Disclaimer */}
          <FadeUp delay={0.35} style={{ marginTop: 80 }}>
            <div style={{ background: "rgba(15,18,28,0.9)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "24px 36px", maxWidth: 760, margin: "80px auto 0", display: "flex", gap: 18, textAlign: "left" }}>
              <Shield style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, color: "rgba(255,255,255,0.18)" }} />
              <p style={{ fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.22)" }}>
                App Squad provides custom mobile game app development, monetization preparation, and app store publishing assistance. App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, or return on investment. Results vary and depend on marketing, user engagement, platform rules, audience demand, app quality, consistency, and third-party approval processes.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
