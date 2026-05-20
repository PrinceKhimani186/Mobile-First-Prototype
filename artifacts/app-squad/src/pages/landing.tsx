import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle, ArrowRight, Apple, Activity, Target,
  TrendingUp, Star, Layers, Code2, Rocket, Smartphone,
  BarChart3, DollarSign, Palette, ShoppingBag, Puzzle,
  Sparkles, Zap, Download, Shield
} from "lucide-react";
import { Link } from "wouter";

/* ─── Phone screen definitions ─── */
const SCREENS = [
  { id: "puzzle",   label: "Puzzle Match",     color: "hsl(217 85% 55%)" },
  { id: "casino",   label: "Slots Game",        color: "hsl(280 70% 55%)" },
  { id: "kids",     label: "Kids Learning",     color: "hsl(155 60% 45%)" },
  { id: "analytics",label: "App Analytics",    color: "hsl(217 85% 58%)" },
  { id: "revenue",  label: "Monetization",      color: "hsl(35 90% 55%)"  },
  { id: "branding", label: "Branding Studio",   color: "hsl(320 60% 55%)" },
  { id: "store",    label: "App Store",         color: "hsl(197 82% 50%)" },
];

/* ─── Individual screens ─── */
function PuzzleScreen() {
  const colors = [
    "bg-blue-500","bg-indigo-500","bg-blue-400","bg-purple-500",
    "bg-blue-500","bg-indigo-400","bg-purple-400","bg-blue-600",
    "bg-indigo-500","bg-blue-500","bg-purple-500","bg-indigo-400",
    "bg-blue-400","bg-purple-400","bg-blue-500","bg-indigo-500",
  ];
  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-4 gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] text-white/50 font-medium">LEVEL 12</div>
          <div className="text-xl font-bold text-white">Puzzle Match</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-white/50">SCORE</div>
          <div className="text-lg font-bold text-blue-400">4,820</div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "68%" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
      {/* Grid */}
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        {colors.map((c, i) => (
          <motion.div
            key={i}
            className={`${c} rounded-xl opacity-80 hover:opacity-100`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ delay: i * 0.03, duration: 0.3, ease: "backOut" }}
          />
        ))}
      </div>
      {/* Bottom actions */}
      <div className="flex gap-2">
        <div className="flex-1 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <span className="text-blue-400 text-xs font-semibold">Shuffle</span>
        </div>
        <div className="flex-1 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="text-white/50 text-xs">Hint</span>
        </div>
      </div>
    </div>
  );
}

function CasinoScreen() {
  const symbols = ["🎰","💎","7️⃣","🃏","⭐"];
  const reels = [
    [symbols[2], symbols[1], symbols[3]],
    [symbols[1], symbols[2], symbols[0]],
    [symbols[2], symbols[4], symbols[1]],
  ];
  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-4 gap-4">
      <div className="text-center">
        <div className="text-[11px] text-purple-300/60 font-medium">BALANCE</div>
        <div className="text-2xl font-bold text-white">$2,450.<span className="text-purple-400">00</span></div>
      </div>
      {/* Reels */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-2 w-full">
          {reels.map((reel, ri) => (
            <div key={ri} className="flex-1 bg-black/30 border border-purple-500/20 rounded-2xl overflow-hidden">
              <div className="flex flex-col">
                {reel.map((sym, si) => (
                  <div
                    key={si}
                    className={`h-[60px] flex items-center justify-center text-2xl border-b border-purple-500/10 ${si === 1 ? "bg-purple-500/10" : "opacity-40"}`}
                  >
                    {sym}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Win line */}
      <div className="text-center py-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
        <span className="text-purple-300 text-xs font-semibold">777 — JACKPOT LINE</span>
      </div>
      {/* Spin button */}
      <motion.div
        className="h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_-5px_hsl(280_70%_55%_/_0.6)]"
        whileTap={{ scale: 0.97 }}
      >
        <span className="text-white font-bold text-sm">SPIN — $25</span>
      </motion.div>
    </div>
  );
}

function KidsScreen() {
  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-4 gap-3">
      <div className="text-center">
        <div className="text-lg font-bold text-white">Learning Stars ⭐</div>
        <div className="text-[11px] text-emerald-400">Level 3 · Grade 2</div>
      </div>
      {/* Progress stars */}
      <div className="flex justify-center gap-2">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-7 h-7 ${i <= 3 ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`} />
        ))}
      </div>
      {/* Question card */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
        <div className="text-2xl font-bold text-white mb-1">🍎 + 🍎 = ?</div>
        <div className="text-white/50 text-xs">Choose the right answer</div>
      </div>
      {/* Answer grid */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {["1","2","3","4"].map((n, i) => (
          <motion.div
            key={n}
            className={`rounded-2xl border flex items-center justify-center text-2xl font-bold cursor-pointer transition-all
              ${i === 1 ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-300 shadow-[0_0_15px_-3px_hsl(155_60%_45%_/_0.5)]" : "bg-white/5 border-white/10 text-white/60"}`}
            whileTap={{ scale: 0.96 }}
          >
            {n}
          </motion.div>
        ))}
      </div>
      <div className="h-2 bg-emerald-500/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "45%" }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  const bars = [40, 65, 52, 80, 70, 90, 75];
  const days = ["M","T","W","T","F","S","S"];
  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-4 gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-white">Analytics</div>
          <div className="text-[11px] text-white/40">Last 7 days</div>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/20">
          <span className="text-blue-400 text-[10px] font-semibold">+24.5%</span>
        </div>
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Downloads", val: "12.8K", color: "text-blue-400" },
          { label: "Revenue", val: "$3,240", color: "text-emerald-400" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3">
            <div className={`text-base font-bold ${kpi.color}`}>{kpi.val}</div>
            <div className="text-[10px] text-white/40">{kpi.label}</div>
          </div>
        ))}
      </div>
      {/* Bar chart */}
      <div className="flex-1 flex items-end gap-1.5 px-1">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400"
              style={{ minHeight: 4 }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.05, duration: 0.6, ease: "easeOut" }}
            />
            <span className="text-[8px] text-white/30">{days[i]}</span>
          </div>
        ))}
      </div>
      {/* DAU */}
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
        <Activity className="w-4 h-4 text-blue-400" />
        <span className="text-xs text-white/60">Daily Active Users:</span>
        <span className="text-xs font-bold text-white ml-auto">4,821</span>
      </div>
    </div>
  );
}

function RevenueScreen() {
  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-4 gap-3">
      <div>
        <div className="text-lg font-bold text-white">Monetization</div>
        <div className="text-[11px] text-white/40">This month</div>
      </div>
      {/* Big revenue number */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-4 text-center">
        <div className="text-[11px] text-amber-400/70 mb-1">TOTAL REVENUE</div>
        <motion.div
          className="text-3xl font-bold text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          $8,<span className="text-amber-400">290</span>
        </motion.div>
        <div className="text-[11px] text-emerald-400 mt-1">↑ 32% vs last month</div>
      </div>
      {/* Revenue streams */}
      {[
        { label: "Ad Revenue", val: "$4,150", pct: 50, color: "bg-blue-500" },
        { label: "In-App Purchases", val: "$2,840", pct: 34, color: "bg-purple-500" },
        { label: "Premium Upgrades", val: "$1,300", pct: 16, color: "bg-amber-500" },
      ].map(s => (
        <div key={s.label} className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-white/60">{s.label}</span>
            <span className="text-white font-semibold">{s.val}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${s.color} rounded-full`}
              initial={{ width: "0%" }}
              animate={{ width: `${s.pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 mt-auto">
        <Zap className="w-4 h-4 text-emerald-400" />
        <span className="text-[11px] text-emerald-300 font-medium">AdMob + Meta + IAP active</span>
      </div>
    </div>
  );
}

function BrandingScreen() {
  const swatches = ["#3B82F6","#8B5CF6","#EC4899","#10B981","#F59E0B","#EF4444"];
  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-4 gap-3">
      <div>
        <div className="text-lg font-bold text-white">Brand Studio</div>
        <div className="text-[11px] text-white/40">Customize your app</div>
      </div>
      {/* App icon preview */}
      <div className="flex items-center gap-4 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_-5px_hsl(217_85%_55%_/_0.6)]">
          <span className="text-white text-2xl font-black">A</span>
        </div>
        <div>
          <div className="text-sm font-bold text-white">AquaMatch Pro</div>
          <div className="text-[11px] text-white/40">by Your Brand Co.</div>
          <div className="text-[10px] text-blue-400 mt-0.5">v1.0.0 · Draft</div>
        </div>
      </div>
      {/* Color picker */}
      <div>
        <div className="text-[11px] text-white/50 mb-2">Brand Colors</div>
        <div className="flex gap-2">
          {swatches.map(c => (
            <motion.div
              key={c}
              className={`w-8 h-8 rounded-xl cursor-pointer ring-2 ${c === "#3B82F6" ? "ring-white ring-offset-2 ring-offset-background" : "ring-transparent"}`}
              style={{ backgroundColor: c }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
      {/* Font selector */}
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3">
        <div className="text-[10px] text-white/40 mb-1">FONT FAMILY</div>
        <div className="text-base font-bold text-white">Space Grotesk</div>
      </div>
      {/* Feature toggles */}
      <div className="flex flex-col gap-2">
        {["Dark Mode Support","Splash Screen","App Icon Set"].map((feat, i) => (
          <div key={feat} className="flex items-center justify-between">
            <span className="text-[11px] text-white/60">{feat}</span>
            <div className={`w-9 h-5 rounded-full ${i !== 1 ? "bg-blue-500" : "bg-white/10"} flex items-center ${i !== 1 ? "justify-end pr-0.5" : "justify-start pl-0.5"} transition-all`}>
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoreScreen() {
  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-4 gap-3">
      <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold">
        <Apple className="w-3.5 h-3.5" /> App Store Preview
      </div>
      {/* App header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_-5px_hsl(197_82%_50%_/_0.5)]">
          <Puzzle className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white truncate">AquaMatch Pro</div>
          <div className="text-[11px] text-white/40">Puzzle · App Squad Inc.</div>
          <div className="flex items-center gap-1 mt-0.5">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
            <span className="text-[10px] text-white/40 ml-1">4.8 (2.1K)</span>
          </div>
        </div>
      </div>
      {/* Screenshots mockup */}
      <div className="flex gap-2 overflow-hidden">
        {["from-cyan-500/30","from-blue-500/30","from-indigo-500/30"].map((g, i) => (
          <div key={i} className={`flex-1 h-20 rounded-xl bg-gradient-to-br ${g} to-transparent border border-white/10`} />
        ))}
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { val: "4.8", label: "Rating" },
          { val: "#12", label: "Puzzle" },
          { val: "4+", label: "Age" },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl py-2">
            <div className="text-sm font-bold text-white">{s.val}</div>
            <div className="text-[9px] text-white/40">{s.label}</div>
          </div>
        ))}
      </div>
      {/* Download button */}
      <motion.div
        className="h-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center gap-2 mt-auto shadow-[0_0_20px_-5px_hsl(197_82%_50%_/_0.5)]"
        whileTap={{ scale: 0.97 }}
      >
        <Download className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-bold">GET — Free</span>
      </motion.div>
    </div>
  );
}

const SCREEN_COMPONENTS = [
  PuzzleScreen, CasinoScreen, KidsScreen, AnalyticsScreen,
  RevenueScreen, BrandingScreen, StoreScreen,
];

/* ─── Sparkle particle ─── */
function Particle({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-primary/40"
      style={{ left: x, top: y }}
      animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5], y: [0, -20, 0] }}
      transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

const PARTICLES = [
  { x: "10%", y: "20%", delay: 0 }, { x: "80%", y: "10%", delay: 1.2 },
  { x: "65%", y: "75%", delay: 0.5 }, { x: "25%", y: "60%", delay: 2 },
  { x: "90%", y: "45%", delay: 1.7 }, { x: "45%", y: "15%", delay: 0.9 },
  { x: "15%", y: "85%", delay: 2.5 }, { x: "70%", y: "35%", delay: 1.4 },
];

/* ─── Floating badge ─── */
function FloatingCard({
  children, className, floatY = 10, delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  floatY?: number;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -floatY, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute glass border border-white/[0.12] rounded-2xl shadow-xl z-20 backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─── Mini sparkline ─── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 80;
    const y = 24 - (v / max) * 20;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="80" height="28" className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,28 ${points} 80,28`} fill={color} fillOpacity="0.12" stroke="none" />
    </svg>
  );
}

/* ─── Landing Page ─── */
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Landing() {
  const [screenIdx, setScreenIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setScreenIdx(i => (i + 1) % SCREEN_COMPONENTS.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const CurrentScreen = SCREEN_COMPONENTS[screenIdx];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-h-screen">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden pt-20 pb-32 grid-bg">
        {/* Layered depth lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_68%_45%,hsl(217_85%_50%_/_0.10)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_35%_at_20%_70%,hsl(255_70%_60%_/_0.06)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_80%,hsl(197_82%_50%_/_0.05)_0%,transparent_55%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── Left: Copy ── */}
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide mb-8 shadow-[0_0_15px_-3px_hsl(217_91%_60%_/_0.2)]"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                The Mobile Game App Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.0] tracking-tight mb-6"
              >
                Launch Your Own<br />
                <span className="gradient-text block mt-2">Custom Mobile<br />Game App</span>
                <span className="block mt-2">Without Coding</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl"
              >
                App Squad helps aspiring entrepreneurs build, brand, and launch mobile game apps designed for app store monetization through ads, upgrades, and digital engagement.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <Link href="/training">
                  <button className="btn-primary h-14 px-8 text-base font-semibold rounded-xl text-white flex items-center gap-2 w-full sm:w-auto justify-center" data-testid="button-watch-training-hero">
                    Watch Free Training
                    <PlayCircle className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="/apply">
                  <button className="btn-ghost h-14 px-8 text-base font-medium rounded-xl text-foreground/80 flex items-center gap-2 w-full sm:w-auto justify-center" data-testid="button-apply-hero">
                    Apply Now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground/80 font-medium"
              >
                {[
                  { icon: Apple, label: "iOS App Store" },
                  { icon: PlayCircle, label: "Google Play" },
                  { icon: Target, label: "Meta Ads" },
                  { icon: Activity, label: "AdMob" },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
                    <Icon className="w-4 h-4" /> {label}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* ── Right: Animated Phone Ecosystem ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:flex items-center justify-center min-h-[720px]"
            >
              {/* Particles */}
              {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

              {/* Radial depth glow — tight, behind phone */}
              <div className="absolute w-80 h-80 rounded-full blur-[100px] bg-primary/14" style={{ top: "15%", left: "50%", transform: "translateX(-50%)" }} />
              <div className="absolute w-56 h-56 rounded-full blur-[80px] bg-purple-600/8" style={{ bottom: "12%", right: "8%" }} />
              <div className="absolute w-40 h-40 rounded-full blur-[60px] bg-accent/6" style={{ top: "40%", left: "0%" }} />

              {/* ── Phone frame ── */}
              <div className="relative w-[296px] h-[636px] z-10">
                {/* Outer bezel */}
                <div className="absolute inset-0 rounded-[3rem] border border-white/[0.14] bg-[hsl(228_30%_8%)] shadow-[0_0_0_1px_hsl(228_30%_15%),0_40px_80px_-20px_hsl(217_85%_50%_/_0.2),0_60px_120px_-40px_hsl(0_0%_0%_/_0.6)] overflow-hidden">
                  {/* Inner screen surface */}
                  <div className="absolute inset-[4px] rounded-[2.6rem] bg-[hsl(228_35%_6%)] overflow-hidden">
                    {/* Status bar */}
                    <div className="absolute top-0 inset-x-0 h-10 flex items-center justify-between px-6 z-30 bg-[hsl(228_35%_6%)/80] backdrop-blur-sm">
                      <span className="text-[11px] text-white/50 font-medium">9:41</span>
                      <div className="w-24 h-5 bg-[hsl(228_35%_6%)] rounded-b-2xl absolute left-1/2 -translate-x-1/2 top-0" />
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-2 rounded-sm border border-white/30 relative">
                          <div className="absolute inset-0.5 bg-white/50 rounded-sm" style={{ width: "70%" }} />
                        </div>
                      </div>
                    </div>

                    {/* Screen label */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center z-30">
                      <motion.div
                        key={screenIdx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/40 font-medium"
                      >
                        {SCREENS[screenIdx].label}
                      </motion.div>
                    </div>

                    {/* ── Animated screen content ── */}
                    <div className="absolute top-10 inset-x-0 bottom-8 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={screenIdx}
                          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full"
                        >
                          <CurrentScreen />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Screen dot indicator */}
                    <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 z-30">
                      {SCREENS.map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ width: i === screenIdx ? 16 : 4, opacity: i === screenIdx ? 1 : 0.3 }}
                          transition={{ duration: 0.3 }}
                          className="h-1 rounded-full bg-white cursor-pointer"
                          onClick={() => setScreenIdx(i)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Side button */}
                <div className="absolute right-[-4px] top-28 w-1 h-12 rounded-r-full bg-white/10" />
                <div className="absolute left-[-4px] top-20 w-1 h-8 rounded-l-full bg-white/10" />
                <div className="absolute left-[-4px] top-32 w-1 h-8 rounded-l-full bg-white/10" />
              </div>

              {/* ── Floating Cards ── */}

              {/* Top-left: Apps Launched */}
              <FloatingCard className="top-20 -left-16 p-4 min-w-[160px]" floatY={9} delay={0}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Apps Launched</div>
                    <div className="text-lg font-bold">12,847</div>
                  </div>
                </div>
              </FloatingCard>

              {/* Top-right: No Coding */}
              <FloatingCard className="top-28 -right-20 p-3 min-w-[148px]" floatY={7} delay={1.1}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Code2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">No Coding</div>
                    <div className="text-[10px] text-muted-foreground">Required</div>
                  </div>
                </div>
              </FloatingCard>

              {/* Mid-right: Revenue widget */}
              <FloatingCard className="top-1/2 -translate-y-1/2 -right-24 p-4 min-w-[160px]" floatY={11} delay={0.6}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-muted-foreground">Revenue</div>
                    <span className="text-[10px] text-emerald-400 font-semibold">+32%</span>
                  </div>
                  <div className="text-lg font-bold">$8,290</div>
                  <Sparkline values={[30, 45, 38, 62, 55, 80, 72, 90]} color="hsl(155 60% 50%)" />
                </div>
              </FloatingCard>

              {/* Bottom-left: Custom Brand */}
              <FloatingCard className="bottom-40 -left-20 p-3 min-w-[156px]" floatY={8} delay={1.8}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Custom Brand</div>
                    <div className="text-[10px] text-muted-foreground">Your identity</div>
                  </div>
                </div>
              </FloatingCard>

              {/* Bottom-right: Downloads widget */}
              <FloatingCard className="bottom-36 -right-20 p-4 min-w-[160px]" floatY={10} delay={0.4}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-muted-foreground">Downloads</div>
                    <span className="text-[10px] text-blue-400 font-semibold">↑ 24%</span>
                  </div>
                  <div className="text-lg font-bold">48.2K</div>
                  <Sparkline values={[20, 35, 28, 50, 42, 65, 58, 80]} color="hsl(217 85% 60%)" />
                </div>
              </FloatingCard>

              {/* Bottom: Store badge */}
              <FloatingCard className="bottom-16 left-1/2 -translate-x-1/2 px-4 py-2.5" floatY={5} delay={2.2}>
                <div className="flex items-center gap-3">
                  <Apple className="w-4 h-4" />
                  <span className="text-white/30 text-xs">+</span>
                  <PlayCircle className="w-4 h-4" />
                  <span className="text-xs font-bold ml-1">Native Apps</span>
                  <Shield className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                </div>
              </FloatingCard>

              {/* Launch Support badge */}
              <FloatingCard className="bottom-60 -left-12 px-3 py-2" floatY={6} delay={1.4}>
                <div className="flex items-center gap-2">
                  <Rocket className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold">Launch Support</span>
                </div>
              </FloatingCard>

              {/* Ad Monetization badge */}
              <FloatingCard className="top-64 -right-10 px-3 py-2" floatY={6} delay={0.8}>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-semibold">Ad Monetization</span>
                </div>
              </FloatingCard>

            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ BENEFITS ═══════════ */}
      <section className="py-24 border-y border-white/[0.06] relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">Why App Squad</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Advantage in the App Market</h2>
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Layers,
                title: "Own a Digital Asset",
                desc: "Build equity in a real digital property that lives on the App Store — a product you can grow, sell, or license.",
                detail: "Unlike renting server space or social media platforms, this is intellectual property you completely control.",
                color: "text-primary",
                bg: "bg-primary/10 border-primary/20",
                hoverBorder: "hover:border-primary/50 hover:shadow-[0_0_30px_-5px_hsl(217_91%_60%_/_0.3)]"
              },
              {
                icon: Code2,
                title: "No Coding Required",
                desc: "We handle the full technical stack so you can focus on brand strategy, audience, and go-to-market execution.",
                detail: "From game mechanics to database architecture, our engineers deploy proven systems tailored to your brand.",
                color: "text-accent",
                bg: "bg-accent/10 border-accent/20",
                hoverBorder: "hover:border-accent/50 hover:shadow-[0_0_30px_-5px_hsl(195_88%_52%_/_0.3)]"
              },
              {
                icon: TrendingUp,
                title: "Monetization-Ready",
                desc: "Pre-integrated with leading ad networks and in-app purchase systems, ready for your first monetization event.",
                detail: "We configure AdMob, Meta, and native app store payments so you can generate revenue from day one.",
                color: "text-purple-400",
                bg: "bg-purple-500/10 border-purple-500/20",
                hoverBorder: "hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_hsl(270_70%_60%_/_0.3)]"
              },
            ].map((benefit, i) => (
              <motion.div key={i} variants={cardVariants} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                <div className={`glass rounded-3xl p-10 h-full transition-all duration-300 group border-2 border-white/5 ${benefit.hoverBorder}`}>
                  <div className={`w-14 h-14 rounded-xl border ${benefit.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-base mb-4">{benefit.desc}</p>
                  <p className="text-sm text-foreground/70 font-medium leading-relaxed pt-4 border-t border-white/10">{benefit.detail}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-32 relative overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,hsl(217_91%_60%_/_0.08)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-20">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">The Process</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">From Idea to App Store</h2>
            <p className="text-muted-foreground text-lg">Four structured steps that take you from concept to published game.</p>
          </div>

          <div className="relative grid lg:grid-cols-4 gap-12 lg:gap-8 max-w-5xl mx-auto">
            <div className="absolute top-10 left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-primary via-accent to-purple-500 rounded-full hidden lg:block opacity-50 overflow-hidden">
              <motion.div
                className="h-full w-1/3 bg-white/50 blur-sm"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </div>
            {[
              { step: "01", title: "Watch Training", desc: "Learn the mobile game business model and see if App Squad is the right fit.", icon: PlayCircle },
              { step: "02", title: "Apply", desc: "Submit your application so we can understand your goals and timeline.", icon: Smartphone },
              { step: "03", title: "Build Your App", desc: "Choose your game type, customize branding, and configure monetization.", icon: Layers },
              { step: "04", title: "Launch", desc: "We deploy your finished game to iOS App Store and Google Play.", icon: Rocket },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center group"
                data-testid={`step-${item.step}`}
              >
                <div className="relative w-20 h-20 rounded-2xl glass border-2 border-white/20 flex items-center justify-center mb-6 group-hover:border-primary/60 group-hover:bg-primary/10 group-hover:shadow-[0_0_25px_-5px_hsl(217_91%_60%_/_0.5)] transition-all z-10 bg-card">
                  <item.icon className="w-8 h-8 text-primary" />
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center ring-4 ring-background shadow-lg">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-24 relative overflow-hidden border-t border-white/[0.05]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,hsl(217_85%_50%_/_0.07)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto glass rounded-[2.5rem] p-12 md:p-16 text-center border border-white/[0.08] shadow-[0_0_60px_-20px_hsl(217_85%_50%_/_0.15),0_1px_0_0_hsl(220_20%_97%_/_0.05)_inset]">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-5">Get Started</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">Ready To Explore<br />Your App Idea?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              See how App Squad helps entrepreneurs launch custom-branded mobile game apps without coding.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/training">
                <button className="btn-primary h-13 px-8 text-base font-semibold rounded-xl text-white flex items-center gap-2 w-full sm:w-auto justify-center" data-testid="button-cta-training">
                  Watch Free Training
                  <PlayCircle className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/apply">
                <button className="btn-ghost h-13 px-8 text-base font-medium rounded-xl text-foreground/80 flex items-center gap-2 w-full sm:w-auto justify-center" data-testid="button-cta-apply">
                  Apply To Launch Your App
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="py-12 border-t border-white/[0.06] bg-card/30">
        <div className="container mx-auto px-4 text-center flex flex-col items-center">
          <p className="text-xs text-muted-foreground/50 italic max-w-4xl mx-auto leading-relaxed mb-6">
            Disclaimer: App results depend on marketing, user engagement, platform approval, and other factors outside of App Squad's control. We do not guarantee income, downloads, rankings, or profits. The examples shown are for illustrative purposes only. Building a business requires risk, effort, and capital.
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            © 2025 App Squad Inc. All rights reserved.
          </p>
        </div>
      </footer>

    </motion.div>
  );
}
