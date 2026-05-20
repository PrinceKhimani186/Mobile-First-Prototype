import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Play, Zap, ArrowRight, TrendingUp, Eye, Target, Film,
  Smartphone, Star, Mic, Sparkles, Building2, Dumbbell,
  Home as HomeIcon, Music, Rocket, Globe, Instagram,
  Youtube, Twitter, Mail, Phone, CheckCircle2,
  BarChart3, Calendar, Video,
  Megaphone, Palette, Headphones, Scissors, Brain, Flame,
  Utensils, PartyPopper, Crown, Tv, Heart,
} from "lucide-react";

/* ─── Animation helper ─── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Floating card ─── */
function FloatCard({ children, floatY = 8, delay = 0, className = "" }: { children: React.ReactNode; floatY?: number; delay?: number; className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -floatY, 0] }}
      transition={{ duration: 4.5 + delay * 0.4, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute glass rounded-2xl shadow-2xl z-20 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─── Sparkline ─── */
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

/* ─── VIDEO SHOWCASE DATA ─── */
const VIDEOS = [
  {
    id: 1, category: "Restaurant & Dining", icon: Utensils,
    desc: "Cinematic food stories, social reels, menu promos designed to make audiences crave.",
    thumbGrad: "from-[hsl(20_60%_18%)] via-[hsl(15_50%_12%)] to-[hsl(345_30%_8%)]",
    glow: "hsl(20 80% 55%)", glowAlpha: "hsl(20 80% 55% / 0.22)", tag: "Food & Bev",
  },
  {
    id: 2, category: "Nightclub & Lounge", icon: PartyPopper,
    desc: "Luxury nightlife campaigns, VIP event visuals, DJ & venue atmosphere content.",
    thumbGrad: "from-[hsl(285_50%_16%)] via-[hsl(310_40%_11%)] to-[hsl(345_30%_8%)]",
    glow: "hsl(300 60% 58%)", glowAlpha: "hsl(300 60% 58% / 0.22)", tag: "Nightlife",
  },
  {
    id: 3, category: "Influencer Branding", icon: Star,
    desc: "Personal brand campaigns, cinematic intros, content that builds cultural authority.",
    thumbGrad: "from-[hsl(330_55%_18%)] via-[hsl(340_40%_12%)] to-[hsl(345_30%_8%)]",
    glow: "hsl(330 65% 60%)", glowAlpha: "hsl(330 65% 60% / 0.22)", tag: "Creator",
  },
  {
    id: 4, category: "Creator Content Systems", icon: Tv,
    desc: "Short-form pipeline for creators — hooks, reels, and series built to scale reach.",
    thumbGrad: "from-[hsl(260_45%_18%)] via-[hsl(275_35%_12%)] to-[hsl(345_30%_8%)]",
    glow: "hsl(270 55% 58%)", glowAlpha: "hsl(270 55% 58% / 0.22)", tag: "Short-Form",
  },
  {
    id: 5, category: "Mobile Game Marketing", icon: Smartphone,
    desc: "Game trailers, app promos, gameplay ads that convert at scale.",
    thumbGrad: "from-[hsl(345_55%_16%)] via-[hsl(335_40%_11%)] to-[hsl(345_30%_8%)]",
    glow: "hsl(345 70% 55%)", glowAlpha: "hsl(345 70% 55% / 0.22)", tag: "Gaming",
  },
  {
    id: 6, category: "App & SaaS Launch", icon: Rocket,
    desc: "Launch campaigns, app store promo videos, feature showcases for modern brands.",
    thumbGrad: "from-[hsl(310_40%_16%)] via-[hsl(300_30%_11%)] to-[hsl(345_30%_8%)]",
    glow: "hsl(310 55% 55%)", glowAlpha: "hsl(310 55% 55% / 0.22)", tag: "SaaS / Apps",
  },
  {
    id: 7, category: "Luxury Brand Campaigns", icon: Crown,
    desc: "Premium cinematic ads that position luxury products as culture-defining.",
    thumbGrad: "from-[hsl(36_60%_16%)] via-[hsl(30_45%_11%)] to-[hsl(345_30%_8%)]",
    glow: "hsl(36 78% 54%)", glowAlpha: "hsl(36 78% 54% / 0.22)", tag: "Luxury",
  },
  {
    id: 8, category: "Real Estate Marketing", icon: HomeIcon,
    desc: "Cinematic property showcases, AI walkthroughs, luxury listing visual stories.",
    thumbGrad: "from-[hsl(340_45%_16%)] via-[hsl(330_35%_11%)] to-[hsl(345_30%_8%)]",
    glow: "hsl(340 55% 52%)", glowAlpha: "hsl(340 55% 52% / 0.22)", tag: "Real Estate",
  },
  {
    id: 9, category: "Fitness & Lifestyle", icon: Dumbbell,
    desc: "Transformation content, gym promos, and motivational campaigns that move people.",
    thumbGrad: "from-[hsl(350_55%_16%)] via-[hsl(340_40%_11%)] to-[hsl(345_30%_8%)]",
    glow: "hsl(350 72% 52%)", glowAlpha: "hsl(350 72% 52% / 0.22)", tag: "Fitness",
  },
  {
    id: 10, category: "Podcast & Media Branding", icon: Mic,
    desc: "Podcast visual identity, social clips, media content built for cultural moments.",
    thumbGrad: "from-[hsl(275_45%_16%)] via-[hsl(290_35%_11%)] to-[hsl(345_30%_8%)]",
    glow: "hsl(280 55% 58%)", glowAlpha: "hsl(280 55% 58% / 0.22)", tag: "Media",
  },
  {
    id: 11, category: "AI Product Commercials", icon: Brain,
    desc: "Futuristic AI-generated product ads — cinematic, premium, culturally ahead.",
    thumbGrad: "from-[hsl(320_45%_16%)] via-[hsl(310_35%_11%)] to-[hsl(345_30%_8%)]",
    glow: "hsl(315 60% 55%)", glowAlpha: "hsl(315 60% 55% / 0.22)", tag: "AI / Tech",
  },
  {
    id: 12, category: "Event Promotion", icon: Music,
    desc: "Concerts, festivals, launch parties — visual campaigns that create anticipation.",
    thumbGrad: "from-[hsl(300_50%_16%)] via-[hsl(315_38%_11%)] to-[hsl(345_30%_8%)]",
    glow: "hsl(305 60% 55%)", glowAlpha: "hsl(305 60% 55% / 0.22)", tag: "Events",
  },
];

/* ─── WHY CHOOSE US ─── */
const WHY_CARDS = [
  { icon: Brain, title: "AI-Powered Creative Systems", desc: "We combine AI visuals, cinematic editing, and strategic marketing psychology to produce work no standard agency can match.", color: "hsl(330 65% 60%)", bg: "hsl(330 40% 12%)", border: "hsl(330 40% 22%)" },
  { icon: Flame, title: "Built for the Attention Economy", desc: "Modern brands need content that stops the scroll instantly and holds attention for the full duration.", color: "hsl(36 78% 54%)", bg: "hsl(36 40% 10%)", border: "hsl(36 40% 20%)" },
  { icon: Film, title: "Cinematic Production Quality", desc: "We produce premium visual experiences — not generic ads. Every asset is crafted at editorial, campaign-level quality.", color: "hsl(300 55% 58%)", bg: "hsl(290 30% 11%)", border: "hsl(290 30% 20%)" },
  { icon: Crown, title: "High-End Brand Positioning", desc: "We help businesses feel modern, premium, and culturally relevant — the kind of brand people follow.", color: "hsl(36 78% 54%)", bg: "hsl(36 30% 10%)", border: "hsl(36 30% 20%)" },
  { icon: Instagram, title: "Social-First Marketing", desc: "Designed natively for TikTok, Instagram Reels, YouTube Shorts, and digital cultural moments.", color: "hsl(330 65% 60%)", bg: "hsl(330 30% 11%)", border: "hsl(330 30% 22%)" },
  { icon: Globe, title: "Multi-Industry Campaigns", desc: "From restaurants to luxury brands to creator economies — we adapt campaign psychology for each audience.", color: "hsl(270 55% 62%)", bg: "hsl(270 30% 11%)", border: "hsl(270 30% 20%)" },
];

/* ─── SERVICES ─── */
const SERVICES = [
  { icon: Video, label: "AI Video Commercials" },
  { icon: Megaphone, label: "Social Media Campaigns" },
  { icon: Sparkles, label: "AI Ad Creative" },
  { icon: Star, label: "Influencer Content" },
  { icon: Film, label: "Brand Launch Videos" },
  { icon: Smartphone, label: "App Promo Videos" },
  { icon: Brain, label: "AI Product Visualization" },
  { icon: Scissors, label: "Short-Form Pipelines" },
  { icon: Headphones, label: "AI Voiceovers" },
  { icon: Palette, label: "Cinematic Editing" },
  { icon: Target, label: "Content Strategy" },
  { icon: Flame, label: "Viral Hook Development" },
];

/* ─── INDUSTRIES ─── */
const INDUSTRIES = [
  { icon: Utensils, label: "Restaurants" },
  { icon: PartyPopper, label: "Nightclubs" },
  { icon: Star, label: "Influencers" },
  { icon: Tv, label: "Creators" },
  { icon: Smartphone, label: "Mobile Apps" },
  { icon: Globe, label: "SaaS" },
  { icon: Mic, label: "Podcasts" },
  { icon: Dumbbell, label: "Fitness" },
  { icon: Crown, label: "Luxury" },
  { icon: Music, label: "Events" },
  { icon: Rocket, label: "Startups" },
  { icon: HomeIcon, label: "Real Estate" },
];

/* ─── PROCESS ─── */
const PROCESS = [
  { step: 1, icon: Target, title: "Strategy", desc: "We map your audience, goals, and cultural positioning." },
  { step: 2, icon: Brain, title: "AI Production", desc: "Cinematic AI visuals, hooks, and campaign creative generated at scale." },
  { step: 3, icon: Scissors, title: "Editorial Finishing", desc: "Human-level editing, optimization, and platform-native refinement." },
  { step: 4, icon: Rocket, title: "Launch & Scale", desc: "Content deployed across platforms — built to grow." },
];

export default function Home() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ══════════════════ HERO ══════════════════ */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Layered cinematic atmosphere */}
        <div className="absolute inset-0 bg-[hsl(345_8%_4%)]" />
        {/* Magenta edge glow — top right */}
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse at center, hsl(330 65% 40% / 0.18) 0%, hsl(310 55% 30% / 0.10) 40%, transparent 70%)", filter: "blur(60px)" }} />
        {/* Crimson ambient — left center */}
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full opacity-40"
          style={{ background: "radial-gradient(ellipse at center, hsl(350 65% 35% / 0.14) 0%, transparent 65%)", filter: "blur(80px)" }} />
        {/* Violet — bottom */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[900px] h-[300px] opacity-25"
          style={{ background: "radial-gradient(ellipse at center, hsl(275 50% 35% / 0.12) 0%, transparent 65%)", filter: "blur(80px)" }} />
        {/* Subtle grid */}
        <div className="absolute inset-0 grid-bg" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[hsl(345_8%_4%)] to-transparent" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center py-20">

            {/* Left — editorial copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-8"
                style={{
                  background: "hsl(330 65% 52% / 0.12)",
                  border: "1px solid hsl(330 65% 52% / 0.28)",
                  color: "hsl(330 65% 72%)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(330_65%_60%)] animate-pulse" />
                AI Marketing Agency
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.04] tracking-tight mb-6"
              >
                The Agency Behind<br />
                <span className="gradient-text">Viral Campaigns</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
                style={{ color: "hsl(30 15% 65%)" }}
              >
                D&amp;B AI Marketing Co. creates cinematic, AI-powered campaigns that capture attention and position brands as cultural leaders — for restaurants, clubs, creators, influencers, and luxury businesses.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <button
                  onClick={() => scrollTo("strategy-call")}
                  className="btn-primary h-14 px-8 text-sm font-semibold rounded-xl flex items-center gap-2.5 justify-center"
                >
                  Book Strategy Call
                  <Calendar className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTo("showcase")}
                  className="btn-ghost h-14 px-8 text-sm font-medium rounded-xl flex items-center gap-2.5 justify-center"
                >
                  View Campaigns
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>

              {/* Social proof tags */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42 }}
                className="flex flex-wrap gap-2.5"
              >
                {["TikTok Ads", "Instagram Reels", "AI Visuals", "Luxury Brands", "Creator Content"].map(t => (
                  <span
                    key={t}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide"
                    style={{
                      background: "hsl(345 10% 9%)",
                      border: "1px solid hsl(345 10% 16%)",
                      color: "hsl(30 15% 55%)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right — cinematic dashboard panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:flex items-center justify-center min-h-[700px]"
            >
              {/* Behind glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 rounded-full opacity-50" style={{ background: "radial-gradient(ellipse at center, hsl(330 55% 40% / 0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
              </div>

              {/* Main panel */}
              <div
                className="relative w-[460px] rounded-[1.75rem] overflow-hidden"
                style={{
                  background: "hsl(345 10% 6% / 0.85)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid hsl(345 10% 14%)",
                  boxShadow: "0 0 0 1px hsl(345 10% 10%), 0 40px 100px -24px hsl(330 65% 30% / 0.22), 0 80px 160px -40px hsl(275 50% 30% / 0.12)",
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid hsl(345 10% 10%)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: "hsl(330 65% 52%)", boxShadow: "0 0 8px hsl(330 65% 52% / 0.5)" }} />
                    <span className="text-xs font-semibold tracking-wide" style={{ color: "hsl(30 15% 55%)" }}>Campaign Analytics</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[hsl(0_60%_55%)] opacity-50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[hsl(36_70%_52%)] opacity-50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[hsl(140_55%_45%)] opacity-50" />
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-3" style={{ borderBottom: "1px solid hsl(345 10% 10%)" }}>
                  {[
                    { label: "Impressions", val: "8.6M", delta: "+24%", color: "hsl(330 65% 62%)" },
                    { label: "Engagement", val: "520K", delta: "+41%", color: "hsl(36 78% 54%)" },
                    { label: "Conversions", val: "14.2K", delta: "+29%", color: "hsl(275 55% 64%)" },
                  ].map((k, i) => (
                    <div key={k.label} className="px-5 py-4" style={{ borderRight: i < 2 ? "1px solid hsl(345 10% 10%)" : undefined }}>
                      <div className="text-[11px] mb-1" style={{ color: "hsl(30 10% 42%)" }}>{k.label}</div>
                      <div className="text-xl font-bold" style={{ color: k.color }}>{k.val}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "hsl(140 55% 48%)" }}>↑ {k.delta}</div>
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="px-6 py-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold" style={{ color: "hsl(30 15% 55%)" }}>30-Day Reach</span>
                    <span className="text-xs font-medium" style={{ color: "hsl(330 65% 62%)" }}>All Platforms</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-24">
                    {[30, 48, 38, 62, 50, 74, 58, 82, 70, 92, 78, 100, 84, 96].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-lg"
                        style={{
                          background: i === 13
                            ? "linear-gradient(to top, hsl(340 72% 46%), hsl(300 60% 52%))"
                            : `hsl(330 50% 42% / ${0.15 + (h / 100) * 0.32})`,
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.5 + i * 0.04, duration: 0.55, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                </div>

                {/* Campaigns */}
                <div className="px-6 pb-6">
                  <div className="text-xs font-semibold mb-3" style={{ color: "hsl(30 15% 50%)" }}>Active Campaigns</div>
                  <div className="flex flex-col gap-3">
                    {[
                      { name: "Luxury Brand Launch", platform: "IG + TikTok", pct: 88, color: "hsl(330 65% 55%)" },
                      { name: "Nightclub Series", platform: "Meta Reels", pct: 62, color: "hsl(280 55% 58%)" },
                      { name: "App Launch Campaign", platform: "YouTube + Meta", pct: 45, color: "hsl(36 78% 52%)" },
                    ].map(c => (
                      <div key={c.name} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="truncate" style={{ color: "hsl(30 15% 72%)" }}>{c.name}</span>
                            <span className="shrink-0 ml-2" style={{ color: "hsl(30 10% 42%)" }}>{c.pct}%</span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(345 10% 12%)" }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${c.color}, hsl(330 65% 35%))` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${c.pct}%` }}
                              transition={{ delay: 0.9, duration: 0.9, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] shrink-0" style={{ color: "hsl(30 10% 38%)" }}>{c.platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <FloatCard className="top-20 -left-14 px-4 py-3.5 min-w-[160px]" floatY={9} delay={0}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(330 40% 14%)", border: "1px solid hsl(330 40% 22%)" }}>
                    <TrendingUp className="w-4 h-4" style={{ color: "hsl(330 65% 62%)" }} />
                  </div>
                  <div>
                    <div className="text-[11px]" style={{ color: "hsl(30 10% 45%)" }}>Avg Engagement</div>
                    <div className="text-base font-bold">+340%</div>
                  </div>
                </div>
              </FloatCard>

              <FloatCard className="top-1/2 -right-14 -translate-y-1/2 px-4 py-3 min-w-[154px]" floatY={10} delay={1.2}>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span style={{ color: "hsl(30 10% 45%)" }}>Monthly Views</span>
                    <span className="font-semibold" style={{ color: "hsl(140 55% 48%)" }}>↑ 31%</span>
                  </div>
                  <div className="text-base font-bold">18.4M</div>
                  <Sparkline values={[18, 32, 26, 50, 44, 68, 58, 88]} color="hsl(330 65% 55%)" />
                </div>
              </FloatCard>

              <FloatCard className="bottom-32 -left-12 px-3.5 py-3 min-w-[158px]" floatY={7} delay={0.5}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(275 35% 14%)", border: "1px solid hsl(275 35% 22%)" }}>
                    <Film className="w-3.5 h-3.5" style={{ color: "hsl(275 55% 64%)" }} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Cinematic AI</div>
                    <div className="text-[10px]" style={{ color: "hsl(30 10% 45%)" }}>Premium quality</div>
                  </div>
                </div>
              </FloatCard>

              <FloatCard className="bottom-20 -right-10 px-3 py-2" floatY={6} delay={1.8}>
                <div className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5" style={{ color: "hsl(330 65% 60%)" }} />
                  <span className="text-xs font-semibold">Stop-Scroll Content</span>
                </div>
              </FloatCard>

              <FloatCard className="top-40 -right-8 px-3 py-2" floatY={7} delay={0.9}>
                <div className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5" style={{ color: "hsl(36 78% 54%)" }} />
                  <span className="text-xs font-semibold">Luxury Positioning</span>
                </div>
              </FloatCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════ SHOWCASE ══════════════════ */}
      <section id="showcase" className="py-28 relative overflow-hidden" style={{ borderTop: "1px solid hsl(345 10% 9%)" }}>
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 50%, hsl(330 55% 30% / 0.06) 0%, transparent 70%)" }} />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <FadeUp className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(330 65% 62%)" }}>Portfolio</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-5">Campaign Showcase</h2>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "hsl(30 15% 55%)" }}>
              Cinematic AI campaigns produced for brands, creators, and cultural leaders across every major industry.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {VIDEOS.map((v, i) => {
              const Icon = v.icon;
              return (
                <FadeUp key={v.id} delay={i * 0.04}>
                  <div
                    className="video-card group rounded-2xl cursor-pointer"
                    style={{
                      border: "1px solid hsl(345 10% 11%)",
                      background: "hsl(345 10% 6%)",
                      boxShadow: "0 0 0 0 transparent",
                      transition: "box-shadow 0.4s ease, border-color 0.3s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px -16px ${v.glowAlpha}, 0 0 0 1px ${v.glow.replace(")", " / 0.15)")}`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${v.glow.replace(")", " / 0.3)")}`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 transparent";
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(345 10% 11%)";
                    }}
                  >
                    {/* Thumbnail */}
                    <div className={`relative h-52 overflow-hidden rounded-t-2xl bg-gradient-to-br ${v.thumbGrad}`}>
                      {/* Subtle grid */}
                      <div className="absolute inset-0 grid-bg opacity-20" />
                      {/* Cinematic vignette overlay */}
                      <div
                        className="cinematic-overlay absolute inset-0"
                        style={{ background: `radial-gradient(ellipse 75% 75% at 50% 40%, ${v.glowAlpha} 0%, transparent 70%)` }}
                      />
                      {/* Inner thumb (zoomable) */}
                      <div className="thumb-inner absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity duration-400"
                          style={{ background: `${v.glow.replace(")", " / 0.12)")}`, border: `1px solid ${v.glow.replace(")", " / 0.2)")}` }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      {/* Play button */}
                      <div className="play-overlay absolute inset-0 flex items-center justify-center">
                        <motion.div
                          whileTap={{ scale: 0.92 }}
                          className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, hsl(340 72% 46%), hsl(300 60% 44%))`,
                            boxShadow: `0 0 32px -6px ${v.glowAlpha}, 0 0 60px -20px ${v.glowAlpha}`,
                          }}
                        >
                          <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                        </motion.div>
                      </div>
                      {/* Tag */}
                      <div className="absolute top-3 left-3">
                        <span
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide"
                          style={{ background: "hsl(345 10% 6% / 0.85)", border: "1px solid hsl(345 10% 16%)", color: "hsl(30 15% 65%)" }}
                        >
                          {v.tag}
                        </span>
                      </div>
                      {/* Bottom gradient */}
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[hsl(345_10%_6%)] to-transparent" />
                    </div>
                    {/* Body */}
                    <div className="p-4">
                      <h3 className="text-sm font-bold mb-1.5 transition-colors duration-300 group-hover:text-white"
                        style={{ color: "hsl(30 20% 82%)" }}>{v.category}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: "hsl(30 10% 45%)" }}>{v.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ WHY US ══════════════════ */}
      <section id="why" className="py-28 relative grid-bg" style={{ borderTop: "1px solid hsl(345 10% 9%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(275 50% 30% / 0.06) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <FadeUp className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(330 65% 62%)" }}>Why Us</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Why D&amp;B Brands Win</h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_CARDS.map((c, i) => {
              const Icon = c.icon;
              return (
                <FadeUp key={c.title} delay={i * 0.07}>
                  <div
                    className="rounded-2xl p-7 h-full group transition-all duration-300 cursor-default hover:-translate-y-1"
                    style={{
                      background: "hsl(345 10% 6%)",
                      border: "1px solid hsl(345 10% 11%)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = c.border;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(345 10% 11%)";
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                      style={{ background: c.bg, border: `1px solid ${c.border}` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: c.color }} />
                    </div>
                    <h3 className="text-lg font-bold mb-3">{c.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "hsl(30 10% 48%)" }}>{c.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ SERVICES ══════════════════ */}
      <section id="services" className="py-28 relative" style={{ borderTop: "1px solid hsl(345 10% 9%)" }}>
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeUp className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(330 65% 62%)" }}>What We Do</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Services</h2>
          </FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeUp key={s.label} delay={i * 0.035}>
                  <div
                    className="rounded-2xl p-5 flex items-center gap-3 cursor-pointer group transition-all duration-300"
                    style={{ background: "hsl(345 10% 6%)", border: "1px solid hsl(345 10% 11%)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(330 40% 20%)";
                      (e.currentTarget as HTMLElement).style.background = "hsl(330 20% 8%)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(345 10% 11%)";
                      (e.currentTarget as HTMLElement).style.background = "hsl(345 10% 6%)";
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                      style={{ background: "hsl(330 30% 12%)", border: "1px solid hsl(330 30% 18%)" }}
                    >
                      <Icon className="w-4 h-4" style={{ color: "hsl(330 55% 60%)" }} />
                    </div>
                    <span className="text-sm font-semibold leading-tight" style={{ color: "hsl(30 15% 75%)" }}>{s.label}</span>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ INDUSTRIES ══════════════════ */}
      <section id="industries" className="py-28 relative grid-bg" style={{ borderTop: "1px solid hsl(345 10% 9%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, hsl(330 50% 28% / 0.05) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <FadeUp className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(330 65% 62%)" }}>Sectors</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Industries We Work With</h2>
          </FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {INDUSTRIES.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <FadeUp key={ind.label} delay={i * 0.04}>
                  <div
                    className="rounded-2xl p-5 flex flex-col items-center text-center gap-3 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                    style={{ background: "hsl(345 10% 6%)", border: "1px solid hsl(345 10% 11%)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(330 35% 18%)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(345 10% 11%)";
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                      style={{ background: "hsl(345 10% 9%)", border: "1px solid hsl(345 10% 14%)" }}
                    >
                      <Icon className="w-5 h-5 group-hover:text-[hsl(330_55%_60%)] transition-colors" style={{ color: "hsl(30 10% 45%)" }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: "hsl(30 15% 68%)" }}>{ind.label}</span>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ PROCESS ══════════════════ */}
      <section id="process" className="py-28 relative" style={{ borderTop: "1px solid hsl(345 10% 9%)" }}>
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeUp className="text-center mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "hsl(330 65% 62%)" }}>Process</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">How We Work</h2>
            <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "hsl(30 15% 50%)" }}>
              From creative brief to viral campaign — a refined, systematic pipeline.
            </p>
          </FadeUp>
          <div className="relative grid md:grid-cols-4 gap-10 max-w-5xl mx-auto">
            {/* Connector line */}
            <div
              className="absolute top-10 left-[12.5%] right-[12.5%] h-px hidden md:block"
              style={{ background: "linear-gradient(90deg, hsl(330 65% 52% / 0.3), hsl(275 55% 52% / 0.3), hsl(330 65% 52% / 0.3))" }}
            />
            {PROCESS.map((p, i) => {
              const Icon = p.icon;
              return (
                <FadeUp key={p.step} delay={i * 0.1}>
                  <div className="flex flex-col items-center text-center group">
                    <div
                      className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-6 z-10 transition-all duration-300 group-hover:scale-105"
                      style={{
                        background: "hsl(345 10% 7%)",
                        border: "1px solid hsl(345 10% 14%)",
                        boxShadow: "0 0 0 6px hsl(345 8% 4%)",
                      }}
                    >
                      <Icon className="w-8 h-8" style={{ color: "hsl(330 65% 60%)" }} />
                      <span
                        className="absolute -top-3 -right-3 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ring-4"
                        style={{
                          background: "linear-gradient(135deg, hsl(340 72% 46%), hsl(300 60% 44%))",
                          color: "white",
                          ringColor: "hsl(345 8% 4%)",
                        }}
                      >
                        {p.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "hsl(30 10% 48%)" }}>{p.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ STRATEGY CALL ══════════════════ */}
      <section id="strategy-call" className="py-28 relative grid-bg" style={{ borderTop: "1px solid hsl(345 10% 9%)" }}>
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 55% at 50% 50%, hsl(330 55% 30% / 0.08) 0%, transparent 70%)" }} />

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left */}
            <FadeUp>
              <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "hsl(330 65% 62%)" }}>Book a Call</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 leading-tight">Book Your AI Marketing Strategy Session</h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: "hsl(30 15% 55%)" }}>
                We'll review your brand, positioning, audience, and content opportunities — and show you exactly how AI-powered campaigns can scale your visibility.
              </p>
              <ul className="flex flex-col gap-3.5 mb-10">
                {[
                  "AI content strategy and direction",
                  "Audience & platform opportunity analysis",
                  "Campaign concept & creative review",
                  "Pricing and package walkthrough",
                  "Actionable next steps before you leave",
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "hsl(30 15% 68%)" }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "hsl(330 65% 60%)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeUp>

            {/* Right — booking card */}
            <FadeUp delay={0.12}>
              <div
                className="rounded-[2rem] p-8"
                style={{
                  background: "hsl(345 10% 6% / 0.85)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid hsl(345 10% 13%)",
                  boxShadow: "0 40px 80px -24px hsl(330 55% 30% / 0.2)",
                }}
              >
                <div className="flex flex-col items-center justify-center gap-6 min-h-[360px] text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "hsl(330 30% 12%)", border: "1px solid hsl(330 30% 20%)" }}
                  >
                    <Calendar className="w-8 h-8" style={{ color: "hsl(330 65% 60%)" }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: "hsl(30 10% 42%)" }}>Calendly Embed</p>
                    <h3 className="text-xl font-bold mb-2">Book Your Session</h3>
                    <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: "hsl(30 10% 48%)" }}>
                      Your booking widget will appear here once Calendly is connected to this section.
                    </p>
                  </div>
                  <div className="flex items-center gap-5 text-xs" style={{ color: "hsl(30 10% 42%)" }}>
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" style={{ color: "hsl(330 55% 58%)" }} />
                      30 minutes
                    </span>
                    <span className="w-px h-4" style={{ background: "hsl(345 10% 16%)" }} />
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" style={{ color: "hsl(330 55% 58%)" }} />
                      Video or phone
                    </span>
                  </div>
                  <button className="btn-primary w-full h-12 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                    Schedule Strategy Call
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px]" style={{ color: "hsl(30 10% 30%)" }}>Replace with your Calendly embed URL</p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════ CONTACT ══════════════════ */}
      <section id="contact" className="py-20" style={{ borderTop: "1px solid hsl(345 10% 9%)" }}>
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <FadeUp>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Ready to Get Started?</h2>
            <p className="mb-8" style={{ color: "hsl(30 10% 48%)" }}>Reach out directly or book a strategy session.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="mailto:hello@dbaimarketing.co" className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: "hsl(30 10% 52%)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "hsl(30 20% 85%)")}
                onMouseLeave={e => (e.currentTarget.style.color = "hsl(30 10% 52%)")}>
                <Mail className="w-4 h-4" style={{ color: "hsl(330 55% 58%)" }} />
                hello@dbaimarketing.co
              </a>
              <span className="hidden sm:block w-px h-4" style={{ background: "hsl(345 10% 14%)" }} />
              <button
                onClick={() => scrollTo("strategy-call")}
                className="flex items-center gap-2 text-sm transition-colors cursor-pointer"
                style={{ color: "hsl(30 10% 52%)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "hsl(30 20% 85%)")}
                onMouseLeave={e => (e.currentTarget.style.color = "hsl(30 10% 52%)")}
              >
                <Calendar className="w-4 h-4" style={{ color: "hsl(330 55% 58%)" }} />
                Schedule a call
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer style={{ borderTop: "1px solid hsl(345 10% 9%)", background: "hsl(345 8% 3%)" }} className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(340 72% 46%), hsl(300 60% 42%))" }}
              >
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display text-base font-bold">
                D<span style={{ color: "hsl(330 65% 60%)" }}>&amp;</span>B
                <span style={{ color: "hsl(30 10% 45%)", fontWeight: 500 }}> AI Marketing</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "hsl(30 10% 42%)" }}>
              {[["Services","services"],["Industries","industries"],["AI Content","showcase"],["Strategy Call","strategy-call"],["Contact","contact"]].map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="transition-colors cursor-pointer hover:text-[hsl(30_20%_75%)]"
                  style={{ color: "hsl(30 10% 42%)" }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Social */}
            <div className="flex items-center gap-2.5">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "YouTube" },
                { icon: Twitter, label: "Twitter/X" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "hsl(345 10% 8%)", border: "1px solid hsl(345 10% 13%)", color: "hsl(30 10% 40%)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "hsl(330 35% 18%)";
                    (e.currentTarget as HTMLElement).style.color = "hsl(330 55% 62%)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "hsl(345 10% 13%)";
                    (e.currentTarget as HTMLElement).style.color = "hsl(30 10% 40%)";
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: "1px solid hsl(345 10% 8%)" }}>
            <p className="text-xs text-center max-w-3xl mx-auto leading-relaxed mb-3" style={{ color: "hsl(30 8% 30%)" }}>
              D&amp;B AI Marketing Co. creates AI-powered marketing content for businesses and creators. Results depend on audience, platform performance, content quality, and market conditions. We do not guarantee specific reach, engagement, or revenue outcomes.
            </p>
            <p className="text-xs text-center" style={{ color: "hsl(30 8% 22%)" }}>© 2025 D&amp;B AI Marketing Co. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
