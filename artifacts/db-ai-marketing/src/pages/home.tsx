import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Play, Zap, ArrowRight, TrendingUp, Eye, Target, Film,
  Smartphone, Star, Mic, Sparkles, Building2, Dumbbell,
  Home as HomeIcon, Music, Rocket, Globe, Instagram,
  Youtube, Twitter, Mail, Phone, MapPin, CheckCircle2,
  ChevronRight, BarChart3, Users, Calendar, Video,
  Megaphone, Palette, Headphones, Scissors, Brain, Flame,
  Coffee, Utensils, PartyPopper, Crown, Tv,
} from "lucide-react";

/* ── Fade-up animation helper ── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Floating badge ── */
function FloatCard({ children, floatY = 8, delay = 0, className = "" }: { children: React.ReactNode; floatY?: number; delay?: number; className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -floatY, 0] }}
      transition={{ duration: 4 + delay * 0.5, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute glass border border-white/[0.10] rounded-2xl shadow-xl z-20 backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ── Sparkline ── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 72},${24 - (v / max) * 20}`).join(" ");
  return (
    <svg width="72" height="28" className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,28 ${pts} 72,28`} fill={color} fillOpacity="0.12" stroke="none" />
    </svg>
  );
}

/* ── VIDEO CATEGORIES ── */
const VIDEOS = [
  {
    id: 1, category: "Restaurant Marketing", icon: Utensils,
    desc: "AI-generated food ads, social reels, menu promos, customer attraction campaigns.",
    gradient: "from-amber-500/30 via-orange-500/15 to-transparent",
    glow: "hsl(35 90% 55%)", tag: "Food & Bev",
  },
  {
    id: 2, category: "Nightclub & Lounge", icon: PartyPopper,
    desc: "Luxury nightlife promos, event visuals, DJ campaigns, VIP atmosphere content.",
    gradient: "from-purple-600/30 via-pink-500/15 to-transparent",
    glow: "hsl(280 70% 55%)", tag: "Nightlife",
  },
  {
    id: 3, category: "Influencer Branding", icon: Star,
    desc: "Personal brand videos, cinematic intros, social growth content.",
    gradient: "from-pink-500/30 via-rose-500/15 to-transparent",
    glow: "hsl(330 70% 60%)", tag: "Creator",
  },
  {
    id: 4, category: "Creator Content Systems", icon: Tv,
    desc: "Short-form content pipelines for creators and personalities.",
    gradient: "from-blue-500/30 via-indigo-500/15 to-transparent",
    glow: "hsl(217 85% 58%)", tag: "Short-Form",
  },
  {
    id: 5, category: "Mobile Game Marketing", icon: Smartphone,
    desc: "Game trailers, app promos, gameplay ads, monetization visuals.",
    gradient: "from-emerald-500/30 via-teal-500/15 to-transparent",
    glow: "hsl(158 64% 52%)", tag: "Gaming",
  },
  {
    id: 6, category: "App Marketing", icon: Rocket,
    desc: "Launch campaigns, app store promo videos, feature showcases.",
    gradient: "from-cyan-500/30 via-blue-500/15 to-transparent",
    glow: "hsl(197 82% 50%)", tag: "SaaS / Apps",
  },
  {
    id: 7, category: "Luxury Brand Campaigns", icon: Crown,
    desc: "Premium cinematic ads for luxury businesses and experiences.",
    gradient: "from-yellow-500/30 via-amber-500/15 to-transparent",
    glow: "hsl(45 93% 47%)", tag: "Luxury",
  },
  {
    id: 8, category: "Real Estate Marketing", icon: HomeIcon,
    desc: "Property walkthroughs, AI cinematic home visuals, luxury listing promos.",
    gradient: "from-sky-500/30 via-blue-400/15 to-transparent",
    glow: "hsl(200 85% 55%)", tag: "Real Estate",
  },
  {
    id: 9, category: "Fitness & Gym Campaigns", icon: Dumbbell,
    desc: "Transformation content, gym promos, motivational ad campaigns.",
    gradient: "from-red-500/30 via-orange-500/15 to-transparent",
    glow: "hsl(0 72% 55%)", tag: "Fitness",
  },
  {
    id: 10, category: "Podcast & Media Branding", icon: Mic,
    desc: "Podcast intros, clips, social snippets, media growth visuals.",
    gradient: "from-indigo-500/30 via-purple-500/15 to-transparent",
    glow: "hsl(245 70% 60%)", tag: "Media",
  },
  {
    id: 11, category: "AI Product Commercials", icon: Brain,
    desc: "Futuristic AI-generated product ads and promo campaigns.",
    gradient: "from-blue-600/30 via-cyan-500/15 to-transparent",
    glow: "hsl(210 85% 55%)", tag: "AI / Tech",
  },
  {
    id: 12, category: "Event Promotion", icon: Music,
    desc: "Concerts, festivals, launch parties, influencer events, nightlife promotions.",
    gradient: "from-fuchsia-500/30 via-purple-500/15 to-transparent",
    glow: "hsl(295 70% 58%)", tag: "Events",
  },
];

/* ── WHY CHOOSE US ── */
const WHY_CARDS = [
  { icon: Brain, title: "AI-Powered Creative Systems", desc: "We combine AI visuals, cinematic editing, and strategic marketing psychology.", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { icon: Flame, title: "Built For The Attention Economy", desc: "Modern brands need content that stops scrolling instantly.", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { icon: Film, title: "Cinematic Content Production", desc: "We create premium visual experiences instead of generic ads.", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { icon: Globe, title: "Multi-Industry Campaigns", desc: "From restaurants to apps to influencers, we adapt campaigns to each audience.", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { icon: Instagram, title: "Social-First Marketing", desc: "Designed for TikTok, Instagram Reels, YouTube Shorts, and digital engagement.", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  { icon: Crown, title: "High-End Brand Positioning", desc: "We help businesses feel modern, premium, and culturally relevant.", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
];

/* ── SERVICES ── */
const SERVICES = [
  { icon: Video, label: "AI Video Commercials" },
  { icon: Megaphone, label: "Social Media Campaigns" },
  { icon: Sparkles, label: "AI Ad Creative" },
  { icon: Star, label: "Influencer Campaign Content" },
  { icon: Film, label: "Brand Launch Videos" },
  { icon: Smartphone, label: "App Promo Videos" },
  { icon: Brain, label: "AI Product Visualization" },
  { icon: Scissors, label: "Short-Form Video Systems" },
  { icon: Headphones, label: "AI Voiceovers" },
  { icon: Palette, label: "Cinematic Editing" },
  { icon: Target, label: "Content Strategy" },
  { icon: Flame, label: "Viral Hook Development" },
];

/* ── INDUSTRIES ── */
const INDUSTRIES = [
  { icon: Utensils, label: "Restaurants" },
  { icon: PartyPopper, label: "Nightclubs" },
  { icon: Star, label: "Influencers" },
  { icon: Tv, label: "Creators" },
  { icon: Smartphone, label: "Mobile Apps" },
  { icon: Globe, label: "SaaS Companies" },
  { icon: Mic, label: "Podcasts" },
  { icon: Dumbbell, label: "Fitness Brands" },
  { icon: Crown, label: "Luxury Brands" },
  { icon: Music, label: "Events" },
  { icon: Rocket, label: "Startups" },
  { icon: HomeIcon, label: "Real Estate" },
];

/* ── PROCESS STEPS ── */
const PROCESS = [
  { step: "01", icon: Target, title: "Strategy", desc: "We identify your audience, goals, and content direction." },
  { step: "02", icon: Brain, title: "AI Production", desc: "We generate cinematic AI visuals, hooks, and ad creative." },
  { step: "03", icon: Scissors, title: "Editing & Optimization", desc: "We optimize content for engagement and platform performance." },
  { step: "04", icon: Rocket, title: "Launch & Scale", desc: "You deploy content across social platforms and campaigns." },
];

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* ═══════════ HERO ═══════════ */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden grid-bg pt-16">
        {/* Layered depth glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_65%_50%,hsl(217_85%_50%_/_0.09)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_10%_70%,hsl(280_70%_55%_/_0.07)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_35%_40%_at_80%_20%,hsl(197_82%_50%_/_0.05)_0%,transparent_55%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center py-20">

            {/* Left copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                AI-Powered Marketing Agency
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
              >
                AI Marketing Built For The<br />
                <span className="gradient-text">Attention Economy</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl"
              >
                D&amp;B AI Marketing Co. helps brands, creators, restaurants, clubs, influencers, and app businesses create cinematic AI-powered marketing content designed to capture attention and scale visibility.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <button
                  className="btn-primary h-14 px-8 text-base font-semibold rounded-xl text-white flex items-center gap-2 justify-center"
                  onClick={() => document.getElementById("strategy-call")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Book Strategy Call
                  <Calendar className="w-5 h-5" />
                </button>
                <button
                  className="btn-ghost h-14 px-8 text-base font-medium rounded-xl text-foreground/80 flex items-center gap-2 justify-center"
                  onClick={() => document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" })}
                >
                  View AI Campaigns
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-3 text-xs text-muted-foreground font-medium"
              >
                {["TikTok Ads","Instagram Reels","YouTube Shorts","AI Visuals","Brand Content"].map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07]">{t}</span>
                ))}
              </motion.div>
            </div>

            {/* Right: cinematic dashboard visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:flex items-center justify-center min-h-[680px]"
            >
              {/* Radial glow behind panel */}
              <div className="absolute w-96 h-96 rounded-full blur-[110px] bg-primary/12" style={{ top: "15%", left: "50%", transform: "translateX(-50%)" }} />
              <div className="absolute w-60 h-60 rounded-full blur-[80px] bg-purple-600/8" style={{ bottom: "10%", right: "5%" }} />

              {/* Main dashboard card */}
              <div className="relative w-[460px] glass rounded-[2rem] border border-white/[0.10] overflow-hidden shadow-[0_0_0_1px_hsl(228_20%_14%),0_40px_80px_-20px_hsl(217_85%_50%_/_0.18)]">
                {/* Header bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground/70">Campaign Dashboard</span>
                  </div>
                  <div className="flex gap-1.5">
                    {["bg-red-500","bg-amber-500","bg-emerald-500"].map(c => (
                      <div key={c} className={`w-2.5 h-2.5 rounded-full ${c} opacity-60`} />
                    ))}
                  </div>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-3 gap-0 border-b border-white/[0.07]">
                  {[
                    { label: "Impressions", val: "4.2M", delta: "+18%", color: "text-blue-400" },
                    { label: "Engagement", val: "312K", delta: "+34%", color: "text-emerald-400" },
                    { label: "Conversions", val: "8,240", delta: "+22%", color: "text-purple-400" },
                  ].map((k, i) => (
                    <div key={k.label} className={`px-5 py-4 ${i < 2 ? "border-r border-white/[0.07]" : ""}`}>
                      <div className="text-[11px] text-muted-foreground mb-1">{k.label}</div>
                      <div className={`text-xl font-bold ${k.color}`}>{k.val}</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">↑ {k.delta}</div>
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-foreground/70">Reach Over 30 Days</span>
                    <span className="text-xs text-primary font-medium">All Platforms</span>
                  </div>
                  {/* Fake bar chart */}
                  <div className="flex items-end gap-1.5 h-28">
                    {[35, 52, 42, 68, 55, 78, 62, 88, 74, 95, 82, 100, 88, 92].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-lg"
                        style={{
                          background: i === 13
                            ? "linear-gradient(to top, hsl(217 85% 55%), hsl(197 82% 60%))"
                            : `hsl(217 85% 55% / ${0.2 + (h / 100) * 0.3})`
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.5 + i * 0.04, duration: 0.5, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                </div>

                {/* Active campaigns */}
                <div className="px-6 pb-5">
                  <div className="text-xs font-semibold text-foreground/70 mb-3">Active Campaigns</div>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { name: "Restaurant Reel Series", platform: "TikTok + IG", progress: 78, color: "bg-blue-500" },
                      { name: "App Launch Campaign", platform: "YouTube + Meta", progress: 54, color: "bg-purple-500" },
                      { name: "Luxury Brand Launch", platform: "Instagram", progress: 92, color: "bg-amber-500" },
                    ].map(c => (
                      <div key={c.name} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${c.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-foreground/80 truncate">{c.name}</span>
                            <span className="text-muted-foreground shrink-0 ml-2">{c.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${c.color} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${c.progress}%` }}
                              transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{c.platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <FloatCard className="top-16 -left-14 p-4 min-w-[160px]" floatY={9} delay={0}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Avg Engagement</div>
                    <div className="text-base font-bold">+340%</div>
                  </div>
                </div>
              </FloatCard>

              <FloatCard className="top-1/2 -right-16 -translate-y-1/2 p-4 min-w-[156px]" floatY={10} delay={1.2}>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Views / Mo</span>
                    <span className="text-cyan-400 font-semibold">↑ 28%</span>
                  </div>
                  <div className="text-base font-bold">12.4M</div>
                  <Sparkline values={[20, 35, 28, 55, 48, 70, 62, 88]} color="hsl(197 82% 50%)" />
                </div>
              </FloatCard>

              <FloatCard className="bottom-28 -left-12 px-3 py-2.5 min-w-[160px]" floatY={7} delay={0.5}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Film className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">AI Content</div>
                    <div className="text-[10px] text-muted-foreground">Cinematic quality</div>
                  </div>
                </div>
              </FloatCard>

              <FloatCard className="bottom-16 -right-10 px-3 py-2" floatY={6} delay={1.8}>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold">Ad-Ready Output</span>
                </div>
              </FloatCard>

              <FloatCard className="top-36 -right-8 px-3 py-2" floatY={6} delay={0.9}>
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-pink-400" />
                  <span className="text-xs font-semibold">Stop-Scroll Content</span>
                </div>
              </FloatCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ VIDEO SHOWCASE ═══════════ */}
      <section id="showcase" className="py-28 relative overflow-hidden border-t border-white/[0.05]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,hsl(217_85%_50%_/_0.04)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <FadeUp className="text-center mb-16">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-4">Portfolio</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">AI Campaign Showcase</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore how D&amp;B AI Marketing Co. creates cinematic AI-powered campaigns for different industries.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {VIDEOS.map((v, i) => {
              const Icon = v.icon;
              return (
                <FadeUp key={v.id} delay={i * 0.04}>
                  <div
                    className="video-card group relative rounded-2xl overflow-hidden border border-white/[0.07] bg-card cursor-pointer transition-all duration-400 hover:border-white/[0.18] hover:scale-[1.02] hover:-translate-y-1"
                    style={{ "--glow": v.glow } as React.CSSProperties}
                  >
                    {/* Thumbnail area */}
                    <div className={`relative h-48 bg-gradient-to-br ${v.gradient} border-b border-white/[0.06]`}>
                      {/* Animated grid overlay */}
                      <div className="absolute inset-0 grid-bg opacity-30" />
                      {/* Glow on hover */}
                      <div
                        className="video-glow absolute inset-0 transition-opacity duration-400"
                        style={{ background: `radial-gradient(ellipse 70% 70% at 50% 50%, ${v.glow}26 0%, transparent 70%)` }}
                      />
                      {/* Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center opacity-40 group-hover:opacity-70 transition-opacity"
                          style={{ background: `${v.glow}20`, border: `1px solid ${v.glow}30` }}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
                          style={{ background: `linear-gradient(135deg, ${v.glow}, hsl(217 85% 50%))` }}
                        >
                          <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                        </motion.div>
                      </div>
                      {/* Tag */}
                      <div className="absolute top-3 right-3">
                        <span
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                          style={{ background: `${v.glow}18`, border: `1px solid ${v.glow}30`, color: "white" }}
                        >
                          {v.tag}
                        </span>
                      </div>
                    </div>
                    {/* Card body */}
                    <div className="p-4">
                      <h3 className="text-sm font-bold mb-1.5 text-foreground group-hover:text-primary transition-colors">{v.category}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ WHY CHOOSE US ═══════════ */}
      <section id="why" className="py-28 relative border-t border-white/[0.05] grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,hsl(217_85%_50%_/_0.05)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <FadeUp className="text-center mb-16">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-4">Advantage</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Why Brands Choose<br />D&amp;B AI Marketing Co.</h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_CARDS.map((c, i) => {
              const Icon = c.icon;
              return (
                <FadeUp key={c.title} delay={i * 0.07}>
                  <div className={`glass rounded-2xl p-7 border border-white/[0.07] hover:border-white/[0.14] transition-all duration-300 group hover:-translate-y-1 h-full`}>
                    <div className={`w-12 h-12 rounded-xl border ${c.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${c.color}`} />
                    </div>
                    <h3 className="text-lg font-bold mb-3">{c.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ SERVICES ═══════════ */}
      <section id="services" className="py-28 relative border-t border-white/[0.05]">
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeUp className="text-center mb-16">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-4">What We Do</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">AI Marketing Services</h2>
          </FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeUp key={s.label} delay={i * 0.04}>
                  <div className="glass rounded-2xl p-5 border border-white/[0.07] hover:border-primary/25 hover:bg-primary/[0.04] transition-all duration-300 group flex items-center gap-3 cursor-pointer">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold leading-tight">{s.label}</span>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ INDUSTRIES ═══════════ */}
      <section id="industries" className="py-28 relative border-t border-white/[0.05] grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,hsl(280_70%_55%_/_0.04)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <FadeUp className="text-center mb-16">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-4">Sectors</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Industries We Work With</h2>
          </FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {INDUSTRIES.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <FadeUp key={ind.label} delay={i * 0.04}>
                  <div className="glass rounded-2xl p-5 border border-white/[0.07] hover:border-primary/25 transition-all duration-300 group flex flex-col items-center text-center gap-3 cursor-pointer hover:-translate-y-1">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                      <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs font-semibold">{ind.label}</span>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ PROCESS ═══════════ */}
      <section id="process" className="py-28 relative border-t border-white/[0.05]">
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeUp className="text-center mb-20">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-4">How It Works</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Our Process</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">From strategy brief to published content — a structured creative pipeline.</p>
          </FadeUp>

          <div className="relative grid md:grid-cols-4 gap-10 max-w-5xl mx-auto">
            {/* Connector line */}
            <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary via-accent to-purple-500 opacity-30 hidden md:block" />
            {PROCESS.map((p, i) => {
              const Icon = p.icon;
              return (
                <FadeUp key={p.step} delay={i * 0.1}>
                  <div className="flex flex-col items-center text-center group">
                    <div className="relative w-20 h-20 rounded-2xl glass border-2 border-white/[0.12] flex items-center justify-center mb-6 group-hover:border-primary/50 group-hover:bg-primary/8 transition-all z-10 bg-card">
                      <Icon className="w-8 h-8 text-primary" />
                      <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center ring-4 ring-background">{i + 1}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ STRATEGY CALL ═══════════ */}
      <section id="strategy-call" className="py-28 relative border-t border-white/[0.05] grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,hsl(217_85%_50%_/_0.07)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left copy */}
            <FadeUp>
              <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-5">Book a Call</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 leading-tight">Book Your AI Marketing Strategy Session</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We'll review your business, brand positioning, audience, and content opportunities.
              </p>
              <ul className="flex flex-col gap-3 mb-8">
                {[
                  "AI content strategy review",
                  "Audience & platform analysis",
                  "Campaign ideas & direction",
                  "Pricing & package overview",
                  "Clear next steps before you start",
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeUp>

            {/* Right: Calendly placeholder */}
            <FadeUp delay={0.1}>
              <div className="glass rounded-[2rem] border border-white/[0.08] p-8 shadow-[0_0_60px_-20px_hsl(217_85%_50%_/_0.15)]">
                <div className="flex flex-col items-center justify-center gap-6 min-h-[360px] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase mb-2">Calendly Embed</p>
                    <h3 className="text-xl font-bold mb-2">Pick a Time</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Your booking widget will appear here once Calendly is connected.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> 30 min</span>
                    <span className="w-px h-4 bg-white/10" />
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-primary" /> Video or phone</span>
                  </div>
                  <button className="btn-primary w-full h-12 text-sm font-semibold rounded-xl text-white flex items-center justify-center gap-2">
                    Schedule Strategy Call
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-muted-foreground/50">Replace this placeholder with your Calendly link</p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTACT ═══════════ */}
      <section id="contact" className="py-20 border-t border-white/[0.05]">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <FadeUp>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">Contact us directly or book a strategy session.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="mailto:hello@dbaimarketing.co" className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors">
                <Mail className="w-4 h-4 text-primary" />
                hello@dbaimarketing.co
              </a>
              <span className="hidden sm:block w-px h-4 bg-white/10" />
              <a href="tel:+1" className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors">
                <Phone className="w-4 h-4 text-primary" />
                Schedule a call
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="py-12 border-t border-white/[0.06] bg-card/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display text-base font-bold">D<span className="text-primary">&amp;</span>B AI Marketing</span>
            </div>

            {/* Nav links */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {["Services","Industries","AI Content","Strategy Call","Contact"].map(l => (
                <button
                  key={l}
                  onClick={() => document.getElementById(l.toLowerCase().replace(/ /g, "-"))?.scrollIntoView({ behavior: "smooth" })}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "YouTube" },
                { icon: Twitter, label: "Twitter/X" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.1] transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
            <p className="text-xs text-muted-foreground/50 max-w-3xl mx-auto leading-relaxed mb-3">
              D&amp;B AI Marketing Co. creates AI-powered marketing content for businesses and creators. Results depend on audience, platform performance, content quality, and market conditions. We do not guarantee specific reach, engagement, or revenue outcomes.
            </p>
            <p className="text-xs text-muted-foreground/40">© 2025 D&amp;B AI Marketing Co. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
