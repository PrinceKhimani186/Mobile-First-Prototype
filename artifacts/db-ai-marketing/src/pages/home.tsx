import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Play, Zap, ArrowRight, TrendingUp, Film,
  Smartphone, Star, Mic, Sparkles, Dumbbell,
  Home as HomeIcon, Music, Rocket, Globe, Instagram,
  Youtube, Twitter, Mail, Phone, CheckCircle2,
  Calendar, Video, Megaphone, Palette, Headphones,
  Scissors, Brain, Flame, Utensils, PartyPopper,
  Crown, Tv, Heart, Target, Check,
} from "lucide-react";
import { useLocation } from "wouter";

/* ── Animation helpers ── */
function AnimatedHeadline({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className} style={{ display: "block" }}>
      {words.map((word, i) => (
        <span key={i} className="word-reveal"
          style={{
            animationDelay: inView ? `${delay + i * 0.075}s` : "99s",
            animationPlayState: inView ? "running" : "paused",
            marginRight: i < words.length - 1 ? "0.28em" : "0",
          }}>
          {word}
        </span>
      ))}
    </span>
  );
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

function FloatCard({ children, floatY = 8, delay = 0, className = "" }: { children: React.ReactNode; floatY?: number; delay?: number; className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -floatY, 0] }}
      transition={{ duration: 4.5 + delay * 0.4, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute glass rounded-2xl shadow-2xl z-20 ${className}`}>
      {children}
    </motion.div>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 72},${22 - (v / max) * 18}`).join(" ");
  return (
    <svg width="72" height="26" className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,26 ${pts} 72,26`} fill={color} fillOpacity="0.14" stroke="none" />
    </svg>
  );
}

const VIDEOS = [
  { id: 1, category: "Restaurant Marketing", icon: Utensils, desc: "Cinematic food stories, social reels, and menu promos designed to make audiences crave.", thumbGrad: "from-[hsl(20_60%_18%)] via-[hsl(15_50%_12%)] to-[hsl(345_30%_8%)]", glow: "hsl(20 80% 55%)", glowAlpha: "hsl(20 80% 55% / 0.22)", tag: "Food & Bev" },
  { id: 2, category: "Nightclub & Lounge Marketing", icon: PartyPopper, desc: "Luxury nightlife campaigns, VIP event visuals, DJ and venue atmosphere content.", thumbGrad: "from-[hsl(285_50%_16%)] via-[hsl(310_40%_11%)] to-[hsl(345_30%_8%)]", glow: "hsl(300 60% 58%)", glowAlpha: "hsl(300 60% 58% / 0.22)", tag: "Nightlife" },
  { id: 3, category: "Influencer Branding", icon: Star, desc: "Personal brand campaigns, cinematic intros, content that builds cultural authority.", thumbGrad: "from-[hsl(330_55%_18%)] via-[hsl(340_40%_12%)] to-[hsl(345_30%_8%)]", glow: "hsl(330 65% 60%)", glowAlpha: "hsl(330 65% 60% / 0.22)", tag: "Creator" },
  { id: 4, category: "Creator Content Systems", icon: Tv, desc: "Short-form pipelines for creators — hooks, reels, and series built to scale reach.", thumbGrad: "from-[hsl(260_45%_18%)] via-[hsl(275_35%_12%)] to-[hsl(345_30%_8%)]", glow: "hsl(270 55% 58%)", glowAlpha: "hsl(270 55% 58% / 0.22)", tag: "Short-Form" },
  { id: 5, category: "Mobile Game App Marketing", icon: Smartphone, desc: "Game trailers, app promos, and gameplay ads that convert at scale.", thumbGrad: "from-[hsl(345_55%_16%)] via-[hsl(335_40%_11%)] to-[hsl(345_30%_8%)]", glow: "hsl(345 70% 55%)", glowAlpha: "hsl(345 70% 55% / 0.22)", tag: "Gaming" },
  { id: 6, category: "App Marketing", icon: Rocket, desc: "Launch campaigns, app store videos, and feature showcases for modern brands.", thumbGrad: "from-[hsl(310_40%_16%)] via-[hsl(300_30%_11%)] to-[hsl(345_30%_8%)]", glow: "hsl(310 55% 55%)", glowAlpha: "hsl(310 55% 55% / 0.22)", tag: "Apps" },
  { id: 7, category: "Luxury Brand Campaigns", icon: Crown, desc: "Premium cinematic ads that position luxury products as culture-defining.", thumbGrad: "from-[hsl(36_60%_16%)] via-[hsl(30_45%_11%)] to-[hsl(345_30%_8%)]", glow: "hsl(36 78% 54%)", glowAlpha: "hsl(36 78% 54% / 0.22)", tag: "Luxury" },
  { id: 8, category: "Real Estate Marketing", icon: HomeIcon, desc: "Cinematic property showcases, AI walkthroughs, luxury listing visual stories.", thumbGrad: "from-[hsl(340_45%_16%)] via-[hsl(330_35%_11%)] to-[hsl(345_30%_8%)]", glow: "hsl(340 55% 52%)", glowAlpha: "hsl(340 55% 52% / 0.22)", tag: "Real Estate" },
  { id: 9, category: "Fitness & Gym Campaigns", icon: Dumbbell, desc: "Transformation content, gym promos, and motivational campaigns that move people.", thumbGrad: "from-[hsl(350_55%_16%)] via-[hsl(340_40%_11%)] to-[hsl(345_30%_8%)]", glow: "hsl(350 72% 52%)", glowAlpha: "hsl(350 72% 52% / 0.22)", tag: "Fitness" },
  { id: 10, category: "Podcast & Media Branding", icon: Mic, desc: "Podcast visual identity, social clips, media content built for cultural moments.", thumbGrad: "from-[hsl(275_45%_16%)] via-[hsl(290_35%_11%)] to-[hsl(345_30%_8%)]", glow: "hsl(280 55% 58%)", glowAlpha: "hsl(280 55% 58% / 0.22)", tag: "Media" },
  { id: 11, category: "AI Product Commercials", icon: Brain, desc: "Futuristic AI-generated product ads — cinematic, premium, culturally ahead.", thumbGrad: "from-[hsl(320_45%_16%)] via-[hsl(310_35%_11%)] to-[hsl(345_30%_8%)]", glow: "hsl(315 60% 55%)", glowAlpha: "hsl(315 60% 55% / 0.22)", tag: "AI / Tech" },
  { id: 12, category: "Event Promotion Campaigns", icon: Music, desc: "Concerts, festivals, launch parties — visual campaigns that create anticipation.", thumbGrad: "from-[hsl(300_50%_16%)] via-[hsl(315_38%_11%)] to-[hsl(345_30%_8%)]", glow: "hsl(305 60% 55%)", glowAlpha: "hsl(305 60% 55% / 0.22)", tag: "Events" },
];

const WHY_CARDS = [
  { icon: Flame, title: "Built For Attention", desc: "We create content designed to stop the scroll and make people feel something.", color: "hsl(36 78% 54%)", bg: "hsl(36 40% 10%)", border: "hsl(36 40% 20%)" },
  { icon: Brain, title: "AI-Powered Creative Systems", desc: "We combine AI visuals, cinematic editing, hooks, and brand psychology.", color: "hsl(330 65% 60%)", bg: "hsl(330 40% 12%)", border: "hsl(330 40% 22%)" },
  { icon: Crown, title: "Premium Visual Identity", desc: "We help brands look more modern, exclusive, and culturally relevant.", color: "hsl(36 78% 54%)", bg: "hsl(36 30% 10%)", border: "hsl(36 30% 20%)" },
  { icon: Globe, title: "Multi-Industry Campaigns", desc: "Restaurants, clubs, influencers, apps, events, creators, and luxury brands.", color: "hsl(270 55% 62%)", bg: "hsl(270 30% 11%)", border: "hsl(270 30% 20%)" },
  { icon: Instagram, title: "Social-First Content", desc: "Built for TikTok, Instagram Reels, YouTube Shorts, Facebook, and digital ads.", color: "hsl(330 65% 60%)", bg: "hsl(330 30% 11%)", border: "hsl(330 30% 22%)" },
  { icon: Target, title: "Strategy Before Content", desc: "We don't just create videos. We build campaigns around your audience, offer, and goals.", color: "hsl(300 55% 58%)", bg: "hsl(290 30% 11%)", border: "hsl(290 30% 20%)" },
];

const SERVICES = [
  { icon: Video, label: "AI Video Commercials" },
  { icon: Film, label: "Short-Form Reels" },
  { icon: Megaphone, label: "Social Media Campaigns" },
  { icon: Headphones, label: "AI Voiceovers" },
  { icon: Star, label: "Brand Shout-Out Videos" },
  { icon: Sparkles, label: "Logo/Likeness Video Content" },
  { icon: Smartphone, label: "App Promo Videos" },
  { icon: Rocket, label: "Mobile Game App Ads" },
  { icon: Music, label: "Event Promo Campaigns" },
  { icon: Crown, label: "Influencer Content" },
  { icon: Utensils, label: "Restaurant Promos" },
  { icon: PartyPopper, label: "Nightlife Campaigns" },
  { icon: Brain, label: "Product Commercials" },
  { icon: Target, label: "Content Strategy" },
  { icon: Flame, label: "Viral Hook Development" },
];

const PACKAGES = [
  {
    name: "AI Standard",
    tag: "Starter",
    tagColor: "hsl(36 78% 54%)",
    tagBg: "hsl(36 40% 10%)",
    bestFor: "Small businesses, restaurants, creators, local brands, and businesses starting with AI content.",
    items: [
      "4 AI content creations per week",
      "16 AI content assets per month",
      "AI reels, shout-out videos, brand logo videos, short promo clips, social content",
      "Basic brand / logo integration",
      "Caption-ready vertical video formatting",
      "Monthly content direction",
      "1 monthly strategy check-in",
      "12-month creative partnership structure",
      "Upfront onboarding / down payment required",
    ],
    cta: "Apply For AI Standard",
    glowColor: "hsl(36 78% 54% / 0.12)",
    borderHover: "hsl(36 50% 28%)",
  },
  {
    name: "AI Growth",
    tag: "Most Popular",
    tagColor: "hsl(330 65% 68%)",
    tagBg: "hsl(330 35% 13%)",
    bestFor: "Growing restaurants, clubs, influencers, mobile apps, and brands that need stronger content volume.",
    items: [
      "8 AI content creations per week",
      "32 AI content assets per month",
      "AI reels, cinematic promos, product/service videos, app marketing, campaign creatives",
      "Brand / logo / likeness integration",
      "Hook development",
      "Caption-ready social formatting",
      "Monthly campaign calendar",
      "2 monthly strategy check-ins",
      "Priority creative turnaround",
      "12-month creative partnership structure",
      "Upfront onboarding / down payment required",
    ],
    cta: "Apply For AI Growth",
    glowColor: "hsl(330 65% 52% / 0.14)",
    borderHover: "hsl(330 45% 28%)",
    featured: true,
  },
  {
    name: "AI Dominance",
    tag: "Enterprise",
    tagColor: "hsl(275 55% 68%)",
    tagBg: "hsl(275 35% 13%)",
    bestFor: "High-end brands, nightlife groups, influencers, event companies, app launches, and luxury businesses.",
    items: [
      "Custom monthly AI content volume",
      "Premium AI commercials",
      "Event campaign creatives",
      "Influencer-style branded content",
      "App launch campaign assets",
      "Restaurant / nightclub promotional campaigns",
      "Advanced cinematic editing",
      "Multi-platform content direction",
      "Dedicated creative strategy",
      "Monthly campaign planning",
      "Priority production",
      "12-month creative partnership structure",
      "Upfront onboarding / down payment required",
    ],
    cta: "Apply For AI Dominance",
    glowColor: "hsl(275 55% 45% / 0.12)",
    borderHover: "hsl(275 40% 28%)",
  },
];

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Home() {
  const [, navigate] = useLocation();

  const goApply = () => { navigate("/apply"); window.scrollTo({ top: 0 }); };

  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[hsl(345_8%_4%)]" />
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full opacity-25"
          style={{ background: "radial-gradient(ellipse at center, hsl(330 65% 40% / 0.2) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse at center, hsl(350 65% 35% / 0.13) 0%, transparent 65%)", filter: "blur(100px)" }} />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[1000px] h-[280px] opacity-20"
          style={{ background: "radial-gradient(ellipse at center, hsl(275 50% 35% / 0.12) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[hsl(345_8%_4%)] to-transparent" />

        <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center py-20 md:py-28">

            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 md:mb-10"
                style={{ background: "hsl(330 65% 52% / 0.1)", border: "1px solid hsl(330 65% 52% / 0.25)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(330_65%_62%)] animate-pulse" />
                <span className="label-text" style={{ color: "hsl(330 65% 68%)" }}>AI Marketing Agency</span>
              </motion.div>

              <div className="hero-headline mb-6 md:mb-7 overflow-visible" style={{ perspective: "600px" }}>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
                  <AnimatedHeadline text="AI Marketing" className="text-[hsl(30_18%_94%)] block" delay={0.1} />
                  <AnimatedHeadline text="Built For The" className="text-[hsl(30_18%_94%)] block" delay={0.22} />
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.44, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="gradient-text block"
                  >
                    Attention Economy
                  </motion.span>
                </motion.span>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.56 }}
                className="body-premium mb-8 max-w-[520px]"
              >
                D&amp;B AI Marketing Co. helps restaurants, clubs, influencers, creators, app companies, and modern brands create cinematic AI-powered content designed to capture attention and drive visibility.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.66 }}
                className="flex flex-col sm:flex-row gap-3.5 mb-5"
              >
                <button onClick={goApply} className="btn-primary h-14 px-8 text-[15px] rounded-xl flex items-center gap-3 justify-center">
                  Apply For Strategy Call
                  <Calendar className="w-4 h-4 opacity-80" />
                </button>
                <button onClick={() => scrollTo("showcase")} className="btn-ghost h-14 px-8 text-[15px] rounded-xl flex items-center gap-3 justify-center">
                  View AI Campaigns
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.78 }}
                className="mb-8"
                style={{ fontFamily: "'DM Sans'", fontSize: 12, letterSpacing: "0.01em", color: "hsl(330 40% 52%)", fontStyle: "italic" }}
              >
                12-month creative partnerships available for qualified brands.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.88 }}
                className="flex flex-wrap gap-2"
              >
                {["TikTok Ads", "Instagram Reels", "AI Visuals", "Luxury Brands", "Creator Content"].map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-full text-[11px] font-medium tracking-[0.05em]"
                    style={{ background: "hsl(345 10% 8%)", border: "1px solid hsl(345 10% 15%)", color: "hsl(30 10% 45%)" }}>
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right — Dashboard panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:flex items-center justify-center min-h-[700px]"
            >
              <div className="absolute w-80 h-80 rounded-full opacity-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, hsl(330 55% 40% / 0.14) 0%, transparent 70%)", filter: "blur(70px)" }} />

              <div className="relative w-[460px] rounded-[1.75rem] overflow-hidden"
                style={{ background: "hsl(345 10% 6% / 0.88)", backdropFilter: "blur(28px)", border: "1px solid hsl(345 10% 13%)", boxShadow: "0 0 0 1px hsl(345 10% 9%), 0 40px 100px -24px hsl(330 65% 30% / 0.25), 0 80px 160px -40px hsl(275 50% 30% / 0.12)" }}>

                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid hsl(345 10% 10%)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(330 65% 52%)", boxShadow: "0 0 8px hsl(330 65% 52% / 0.55)" }} />
                    <span style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "hsl(30 10% 45%)" }}>Campaign Analytics</span>
                  </div>
                  <div className="flex gap-1.5">
                    {["hsl(0_60%_55%)", "hsl(36_70%_52%)", "hsl(140_55%_45%)"].map(c => (
                      <div key={c} className="w-2.5 h-2.5 rounded-full opacity-45" style={{ background: c }} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3" style={{ borderBottom: "1px solid hsl(345 10% 10%)" }}>
                  {[
                    { label: "Impressions", val: "8.6M", delta: "+24%", color: "hsl(330 65% 62%)" },
                    { label: "Engagement", val: "520K", delta: "+41%", color: "hsl(36 78% 54%)" },
                    { label: "Conversions", val: "14.2K", delta: "+29%", color: "hsl(275 55% 64%)" },
                  ].map((k, i) => (
                    <div key={k.label} className="px-5 py-4" style={{ borderRight: i < 2 ? "1px solid hsl(345 10% 10%)" : undefined }}>
                      <div style={{ fontFamily: "'DM Sans'", fontSize: 10, letterSpacing: "0.06em", color: "hsl(30 10% 38%)", marginBottom: 4 }}>{k.label}</div>
                      <div style={{ fontFamily: "'Syne'", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: k.color }}>{k.val}</div>
                      <div style={{ fontFamily: "'DM Sans'", fontSize: 10, color: "hsl(140 55% 48%)", marginTop: 2 }}>↑ {k.delta}</div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-5">
                  <div className="flex justify-between items-center mb-4">
                    <span style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", color: "hsl(30 10% 48%)" }}>30-Day Reach</span>
                    <span style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 500, color: "hsl(330 65% 62%)" }}>All Platforms</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-24">
                    {[30, 48, 38, 62, 50, 74, 58, 82, 70, 92, 78, 100, 84, 96].map((h, i) => (
                      <motion.div key={i} className="flex-1 rounded-t-lg"
                        style={{ background: i === 13 ? "linear-gradient(to top, hsl(340 72% 46%), hsl(300 60% 52%))" : `hsl(330 50% 42% / ${0.14 + (h / 100) * 0.3})` }}
                        initial={{ height: 0 }} animate={{ height: `${h}%` }}
                        transition={{ delay: 0.55 + i * 0.04, duration: 0.6, ease: "easeOut" }} />
                    ))}
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", color: "hsl(30 10% 42%)", marginBottom: 12 }}>Active Campaigns</div>
                  <div className="flex flex-col gap-3">
                    {[
                      { name: "Luxury Brand Launch", platform: "IG + TikTok", pct: 88, color: "hsl(330 65% 55%)" },
                      { name: "Nightclub Series", platform: "Meta Reels", pct: 62, color: "hsl(280 55% 58%)" },
                      { name: "App Launch Campaign", platform: "YouTube + Meta", pct: 45, color: "hsl(36 78% 52%)" },
                    ].map(c => (
                      <div key={c.name} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1" style={{ fontFamily: "'DM Sans'", fontSize: 11 }}>
                            <span className="truncate" style={{ color: "hsl(30 15% 68%)" }}>{c.name}</span>
                            <span className="shrink-0 ml-2" style={{ color: "hsl(30 10% 38%)" }}>{c.pct}%</span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(345 10% 12%)" }}>
                            <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${c.color}, hsl(330 65% 35%))` }}
                              initial={{ width: 0 }} animate={{ width: `${c.pct}%` }}
                              transition={{ delay: 1, duration: 0.9, ease: "easeOut" }} />
                          </div>
                        </div>
                        <span style={{ fontFamily: "'DM Sans'", fontSize: 10, color: "hsl(30 10% 35%)" }}>{c.platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <FloatCard className="top-56 -left-16 px-4 py-3.5 min-w-[162px]" floatY={9} delay={0}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(330 40% 13%)", border: "1px solid hsl(330 40% 21%)" }}>
                    <TrendingUp className="w-4 h-4" style={{ color: "hsl(330 65% 62%)" }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'DM Sans'", fontSize: 10, letterSpacing: "0.05em", color: "hsl(30 10% 42%)" }}>Avg Engagement</div>
                    <div style={{ fontFamily: "'Syne'", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>+340%</div>
                  </div>
                </div>
              </FloatCard>

              <FloatCard className="top-1/2 -right-16 -translate-y-1/2 px-4 py-3 min-w-[154px]" floatY={10} delay={1.2}>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between" style={{ fontFamily: "'DM Sans'", fontSize: 10 }}>
                    <span style={{ color: "hsl(30 10% 42%)" }}>Monthly Views</span>
                    <span style={{ color: "hsl(140 55% 48%)", fontWeight: 600 }}>↑ 31%</span>
                  </div>
                  <div style={{ fontFamily: "'Syne'", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>18.4M</div>
                  <Sparkline values={[18, 32, 26, 50, 44, 68, 58, 88]} color="hsl(330 65% 55%)" />
                </div>
              </FloatCard>

              <FloatCard className="bottom-32 -left-14 px-3.5 py-3 min-w-[158px]" floatY={7} delay={0.5}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(275 35% 13%)", border: "1px solid hsl(275 35% 21%)" }}>
                    <Film className="w-3.5 h-3.5" style={{ color: "hsl(275 55% 64%)" }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600 }}>Cinematic AI</div>
                    <div style={{ fontFamily: "'DM Sans'", fontSize: 10, color: "hsl(30 10% 42%)" }}>Premium quality</div>
                  </div>
                </div>
              </FloatCard>

              <FloatCard className="bottom-20 -right-10 px-3.5 py-2.5" floatY={6} delay={1.8}>
                <div className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5" style={{ color: "hsl(330 65% 60%)" }} />
                  <span style={{ fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 500 }}>Stop-Scroll Content</span>
                </div>
              </FloatCard>

              <FloatCard className="top-40 -right-10 px-3.5 py-2.5" floatY={7} delay={0.9}>
                <div className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5" style={{ color: "hsl(36 78% 54%)" }} />
                  <span style={{ fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 500 }}>Luxury Positioning</span>
                </div>
              </FloatCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SHOWCASE ═══════════════════ */}
      <section id="showcase" className="py-28 md:py-36 relative overflow-hidden" style={{ borderTop: "1px solid hsl(345 10% 8%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 50%, hsl(330 55% 30% / 0.055) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
          <FadeUp className="text-center mb-16 md:mb-20">
            <p className="label-text mb-5">Portfolio</p>
            <h2 className="section-headline mb-5"><AnimatedHeadline text="AI Campaign Showcase" delay={0.05} /></h2>
            <p className="body-premium max-w-2xl mx-auto">
              Explore the types of cinematic AI-powered campaigns we create for brands, creators, apps, restaurants, clubs, events, and digital businesses.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {VIDEOS.map((v, i) => {
              const Icon = v.icon;
              return (
                <FadeUp key={v.id} delay={Math.min(i * 0.04, 0.3)}>
                  <div className="video-card group rounded-2xl cursor-pointer"
                    style={{ border: "1px solid hsl(345 10% 10%)", background: "hsl(345 10% 6%)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 64px -16px ${v.glowAlpha}, 0 0 0 1px ${v.glow.replace(")", " / 0.14)")}`; (e.currentTarget as HTMLElement).style.borderColor = v.glow.replace(")", " / 0.28)"); }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = "hsl(345 10% 10%)"; }}>
                    <div className={`relative h-52 overflow-hidden rounded-t-2xl bg-gradient-to-br ${v.thumbGrad}`}>
                      <div className="absolute inset-0 grid-bg opacity-15" />
                      <div className="cinematic-overlay absolute inset-0" style={{ background: `radial-gradient(ellipse 75% 75% at 50% 40%, ${v.glowAlpha} 0%, transparent 70%)` }} />
                      <div className="thumb-inner absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center opacity-25 group-hover:opacity-45 transition-opacity duration-400"
                          style={{ background: `${v.glow.replace(")", " / 0.1)")}`, border: `1px solid ${v.glow.replace(")", " / 0.18)")}` }}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="play-overlay absolute inset-0 flex items-center justify-center">
                        <motion.div whileTap={{ scale: 0.92 }} className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, hsl(340 72% 46%), hsl(300 60% 44%))", boxShadow: `0 0 32px -6px ${v.glowAlpha}` }}>
                          <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                        </motion.div>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-[0.06em] uppercase"
                          style={{ fontFamily: "'DM Sans'", background: "hsl(345 10% 5% / 0.88)", border: "1px solid hsl(345 10% 16%)", color: "hsl(30 10% 55%)" }}>
                          {v.tag}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[hsl(345_10%_6%)] to-transparent" />
                    </div>
                    <div className="p-4 pb-5">
                      <h3 className="mb-1.5 transition-colors duration-300 group-hover:text-white"
                        style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: "hsl(30 18% 78%)", lineHeight: 1.3 }}>
                        {v.category}
                      </h3>
                      <p style={{ fontFamily: "'DM Sans'", fontSize: 12, lineHeight: 1.7, color: "hsl(30 8% 42%)", fontWeight: 300 }}>{v.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHY US ═══════════════════ */}
      <section id="why" className="py-28 md:py-36 relative grid-bg" style={{ borderTop: "1px solid hsl(345 10% 8%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(275 50% 30% / 0.055) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
          <FadeUp className="text-center mb-16 md:mb-20">
            <p className="label-text mb-5">Why Us</p>
            <h2 className="section-headline"><AnimatedHeadline text="Why Brands Choose D&B AI Marketing Co." delay={0.05} /></h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_CARDS.map((c, i) => {
              const Icon = c.icon;
              return (
                <FadeUp key={c.title} delay={i * 0.07}>
                  <div className="rounded-2xl p-7 md:p-8 h-full group transition-all duration-300 cursor-default hover:-translate-y-1"
                    style={{ background: "hsl(345 10% 6%)", border: "1px solid hsl(345 10% 10%)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = c.border; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(345 10% 10%)"; }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                      <Icon className="w-5 h-5" style={{ color: c.color }} />
                    </div>
                    <h3 className="mb-3" style={{ fontFamily: "'Space Grotesk'", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 }}>{c.title}</h3>
                    <p style={{ fontFamily: "'DM Sans'", fontSize: 14, lineHeight: 1.8, color: "hsl(30 8% 46%)", fontWeight: 300 }}>{c.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SERVICES ═══════════════════ */}
      <section id="services" className="py-28 md:py-36 relative" style={{ borderTop: "1px solid hsl(345 10% 8%)" }}>
        <div className="container mx-auto px-5 md:px-8 max-w-7xl">
          <FadeUp className="text-center mb-16 md:mb-20">
            <p className="label-text mb-5">What We Do</p>
            <h2 className="section-headline"><AnimatedHeadline text="AI Marketing Services" delay={0.05} /></h2>
          </FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeUp key={s.label} delay={Math.min(i * 0.03, 0.25)}>
                  <div className="rounded-2xl p-4 md:p-5 flex items-center gap-3 cursor-pointer group transition-all duration-300"
                    style={{ background: "hsl(345 10% 6%)", border: "1px solid hsl(345 10% 10%)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(330 40% 18%)"; (e.currentTarget as HTMLElement).style.background = "hsl(330 15% 7%)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(345 10% 10%)"; (e.currentTarget as HTMLElement).style.background = "hsl(345 10% 6%)"; }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                      style={{ background: "hsl(330 30% 11%)", border: "1px solid hsl(330 30% 17%)" }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: "hsl(330 55% 60%)" }} />
                    </div>
                    <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, letterSpacing: "-0.005em", lineHeight: 1.3, color: "hsl(30 15% 68%)" }}>
                      {s.label}
                    </span>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PACKAGES ═══════════════════ */}
      <section id="packages" className="py-28 md:py-36 relative grid-bg" style={{ borderTop: "1px solid hsl(345 10% 8%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, hsl(330 55% 28% / 0.07) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-5 md:px-8 max-w-7xl relative z-10">
          <FadeUp className="text-center mb-6">
            <p className="label-text mb-5">Packages</p>
            <h2 className="section-headline mb-5"><AnimatedHeadline text="AI Marketing Packages" delay={0.05} /></h2>
            <p className="body-premium max-w-2xl mx-auto">
              Our packages are built for brands that want consistent AI-powered content, stronger visual identity, and monthly creative output.
            </p>
          </FadeUp>

          {/* No public pricing notice */}
          <FadeUp delay={0.1} className="flex justify-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full"
              style={{ background: "hsl(330 30% 9%)", border: "1px solid hsl(330 40% 18%)" }}>
              <Zap className="w-3.5 h-3.5" style={{ color: "hsl(330 55% 60%)" }} />
              <span style={{ fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 500, color: "hsl(30 10% 55%)" }}>
                Starting investment discussed on strategy call
              </span>
            </div>
          </FadeUp>

          <div className="grid lg:grid-cols-3 gap-6">
            {PACKAGES.map((pkg, i) => (
              <FadeUp key={pkg.name} delay={i * 0.09}>
                <div
                  className="relative rounded-[1.5rem] h-full flex flex-col transition-all duration-400 hover:-translate-y-2"
                  style={{
                    background: pkg.featured ? "hsl(330 18% 8%)" : "hsl(345 10% 6%)",
                    border: `1px solid ${pkg.featured ? "hsl(330 40% 20%)" : "hsl(345 10% 11%)"}`,
                    boxShadow: pkg.featured ? "0 0 0 1px hsl(330 35% 15%), 0 40px 80px -24px hsl(330 55% 30% / 0.18)" : "none",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = pkg.borderHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = pkg.featured ? "hsl(330 40% 20%)" : "hsl(345 10% 11%)"; }}
                >
                  {pkg.featured && (
                    <div className="absolute -top-px left-0 right-0 h-px rounded-t-[1.5rem]"
                      style={{ background: "linear-gradient(90deg, transparent, hsl(330 65% 52%), transparent)" }} />
                  )}

                  <div className="p-7 md:p-8 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 style={{ fontFamily: "'Syne'", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>{pkg.name}</h3>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-[0.06em] uppercase shrink-0"
                          style={{ fontFamily: "'DM Sans'", background: pkg.tagBg, border: `1px solid ${pkg.borderHover}`, color: pkg.tagColor }}>
                          {pkg.tag}
                        </span>
                      </div>
                      <p style={{ fontFamily: "'DM Sans'", fontSize: 13, lineHeight: 1.7, color: "hsl(30 8% 48%)", fontWeight: 300 }}>
                        <strong style={{ fontWeight: 500, color: "hsl(30 10% 58%)" }}>Best For:</strong> {pkg.bestFor}
                      </p>
                    </div>

                    {/* Items */}
                    <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                      {pkg.items.map(item => (
                        <li key={item} className="flex items-start gap-2.5">
                          <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "hsl(330 55% 58%)" }} />
                          <span style={{ fontFamily: "'DM Sans'", fontSize: 13, lineHeight: 1.65, color: "hsl(30 8% 52%)", fontWeight: 300 }}>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Price note */}
                    <p className="mb-5 text-center" style={{ fontFamily: "'DM Sans'", fontSize: 11.5, fontStyle: "italic", color: "hsl(30 8% 36%)", lineHeight: 1.6 }}>
                      Investment reviewed after qualification call
                    </p>

                    {/* CTA */}
                    <button
                      onClick={goApply}
                      className={pkg.featured ? "btn-primary" : "btn-ghost"}
                      style={{ width: "100%", height: 48, borderRadius: 14, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'DM Sans'", fontWeight: 600 }}
                    >
                      {pkg.cta}
                      <ArrowRight className="w-4 h-4 opacity-80" />
                    </button>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Packages disclaimer */}
          <FadeUp delay={0.3} className="mt-10 text-center max-w-2xl mx-auto">
            <p style={{ fontFamily: "'DM Sans'", fontSize: 12, lineHeight: 1.8, color: "hsl(30 8% 36%)", fontWeight: 300 }}>
              Packages are offered as 12-month creative partnerships. Upfront onboarding/down payment is required to begin production. Exact investment is reviewed after qualification.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════ CONTACT ═══════════════════ */}
      <section id="contact" className="py-20 md:py-24" style={{ borderTop: "1px solid hsl(345 10% 8%)" }}>
        <div className="container mx-auto px-5 md:px-8 max-w-3xl text-center">
          <FadeUp>
            <h2 className="mb-3" style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.03em" }}>
              Ready to Get Started?
            </h2>
            <p className="body-premium mb-8">Reach out directly or start your application.</p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <a href="mailto:hello@dbaimarketing.co"
                className="flex items-center gap-2 transition-colors"
                style={{ fontFamily: "'DM Sans'", fontSize: 14, color: "hsl(30 8% 48%)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "hsl(30 18% 82%)")}
                onMouseLeave={e => (e.currentTarget.style.color = "hsl(30 8% 48%)")}>
                <Mail className="w-4 h-4 shrink-0" style={{ color: "hsl(330 55% 58%)" }} />
                hello@dbaimarketing.co
              </a>
              <span className="hidden sm:block w-px h-4" style={{ background: "hsl(345 10% 14%)" }} />
              <button onClick={goApply}
                className="flex items-center gap-2 transition-colors cursor-pointer"
                style={{ fontFamily: "'DM Sans'", fontSize: 14, color: "hsl(30 8% 48%)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "hsl(30 18% 82%)")}
                onMouseLeave={e => (e.currentTarget.style.color = "hsl(30 8% 48%)")}>
                <Calendar className="w-4 h-4 shrink-0" style={{ color: "hsl(330 55% 58%)" }} />
                Start your application
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="py-12 md:py-14" style={{ borderTop: "1px solid hsl(345 10% 8%)", background: "hsl(345 8% 3%)" }}>
        <div className="container mx-auto px-5 md:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(340 72% 46%), hsl(300 60% 42%))" }}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span style={{ fontFamily: "'Syne'", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>
                D<span style={{ color: "hsl(330 65% 60%)" }}>&amp;</span>B
                <span style={{ fontFamily: "'DM Sans'", fontWeight: 400, fontSize: 14, color: "hsl(30 8% 40%)", marginLeft: 4 }}>AI Marketing</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              {[["AI Campaigns", "showcase"], ["Services", "services"], ["Packages", "packages"], ["Contact", "contact"]].map(([label, id]) => (
                <button key={id} onClick={() => scrollTo(id)} className="transition-colors cursor-pointer"
                  style={{ fontFamily: "'DM Sans'", fontSize: 12, color: "hsl(30 8% 38%)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "hsl(30 15% 68%)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "hsl(30 8% 38%)")}>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              {[{ icon: Instagram, label: "Instagram" }, { icon: Youtube, label: "YouTube" }, { icon: Twitter, label: "Twitter/X" }].map(({ icon: Icon, label }) => (
                <button key={label} aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "hsl(345 10% 8%)", border: "1px solid hsl(345 10% 12%)", color: "hsl(30 8% 36%)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(330 35% 17%)"; (e.currentTarget as HTMLElement).style.color = "hsl(330 55% 62%)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(345 10% 12%)"; (e.currentTarget as HTMLElement).style.color = "hsl(30 8% 36%)"; }}>
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: "1px solid hsl(345 10% 7%)" }}>
            <p className="text-center max-w-3xl mx-auto mb-3"
              style={{ fontFamily: "'DM Sans'", fontSize: 11, lineHeight: 1.75, color: "hsl(30 6% 26%)", fontWeight: 300 }}>
              D&amp;B AI Marketing Co. creates AI-powered marketing content for businesses and creators. Results depend on audience, platform performance, content quality, and market conditions. We do not guarantee specific reach, engagement, views, conversions, bookings, app installs, or revenue outcomes.
            </p>
            <p className="text-center" style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "hsl(30 6% 20%)" }}>
              © 2025 D&amp;B AI Marketing Co. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
