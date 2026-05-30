import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle, ArrowRight, Apple, Activity, Target,
  TrendingUp, Star, Layers, Code2, Rocket, Smartphone,
  BarChart3, DollarSign, Palette, ShoppingBag, Puzzle,
  Sparkles, Zap, Download, Shield, Gamepad2, BookOpen,
  CalendarCheck, Package, Globe, Headphones, Users,
} from "lucide-react";
import { Link } from "wouter";

/* ─── Phone screen definitions ─── */
const SCREENS = [
  { id: "puzzle",  label: "Puzzle Game",  color: "hsl(217 100% 65%)" },
  { id: "word",    label: "Word Game",    color: "hsl(142 65% 48%)"  },
  { id: "casino",  label: "Casino Style", color: "hsl(280 70% 60%)"  },
  { id: "trivia",  label: "Trivia Game",  color: "hsl(35 100% 58%)"  },
  { id: "arcade",  label: "Arcade Game",  color: "hsl(197 85% 55%)"  },
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

function WordGameScreen() {
  const tiles = ["W","O","R","D","S","C","A","P","E","S"];
  const found = ["WORDS", "CAPE"];
  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-4 gap-3">
      <div className="text-center">
        <div className="text-lg font-bold text-white">Word Craft</div>
        <div className="text-[11px]" style={{ color: "hsl(142 65% 55%)" }}>Level 47 · Today's Challenge</div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-5 gap-1.5">
          {tiles.map((l, i) => (
            <motion.div key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04, ease: "backOut" }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white"
              style={{ background: i % 2 === 0 ? "hsl(142 65% 48% / 0.15)" : "hsl(217 100% 65% / 0.1)", border: `1px solid ${i % 2 === 0 ? "hsl(142 65% 48% / 0.3)" : "hsl(217 100% 65% / 0.2)"}` }}>
              {l}
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] text-white/40 mb-1.5">Found: {found.length} / 8</div>
        <div className="flex gap-2">
          {found.map(w => (
            <div key={w} className="px-3 py-1 rounded-lg text-[11px] font-bold"
              style={{ background: "hsl(142 65% 48% / 0.15)", border: "1px solid hsl(142 65% 48% / 0.3)", color: "hsl(142 65% 65%)" }}>
              {w}
            </div>
          ))}
        </div>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: "hsl(142 65% 48%)" }}
          initial={{ width: "0%" }} animate={{ width: "25%" }} transition={{ duration: 1 }} />
      </div>
    </div>
  );
}

function TriviaGameScreen() {
  const answers = [
    { text: "iOS App Store", correct: true },
    { text: "PlayStation Store", correct: false },
    { text: "Steam", correct: false },
    { text: "Xbox Marketplace", correct: false },
  ];
  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-4 gap-2.5">
      <div className="flex items-center justify-between">
        <div className="text-base font-bold text-white">Trivia Quest</div>
        <div className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
          style={{ background: "hsl(35 100% 58% / 0.15)", border: "1px solid hsl(35 100% 58% / 0.3)", color: "hsl(35 100% 68%)" }}>
          Q 7/10
        </div>
      </div>
      <div className="p-3 rounded-xl text-center"
        style={{ background: "hsl(217 100% 65% / 0.06)", border: "1px solid hsl(217 100% 65% / 0.14)" }}>
        <div className="text-[12px] font-semibold text-white/90 leading-snug">Where are mobile apps downloaded on iPhone?</div>
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {answers.map((a, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{ background: a.correct ? "hsl(142 65% 48% / 0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${a.correct ? "hsl(142 65% 48% / 0.35)" : "rgba(255,255,255,0.07)"}` }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold"
              style={{ background: a.correct ? "hsl(142 65% 48%)" : "rgba(255,255,255,0.06)", color: a.correct ? "white" : "hsl(218 14% 52%)" }}>
              {String.fromCharCode(65 + i)}
            </div>
            <span style={{ fontSize: 11, color: a.correct ? "hsl(142 65% 70%)" : "hsl(218 14% 56%)", fontWeight: a.correct ? 600 : 300 }}>{a.text}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <span className="text-[11px] text-white/40">Score:</span>
        <span className="text-[13px] font-bold text-white ml-auto">6,200 pts</span>
      </div>
    </div>
  );
}

function ArcadeGameScreen() {
  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-4 gap-3">
      <div className="flex items-center justify-between">
        <div className="text-base font-bold text-white">City Dash</div>
        <div className="text-right">
          <div className="text-[10px] text-white/40">HI-SCORE</div>
          <div className="text-sm font-bold" style={{ color: "hsl(197 85% 60%)" }}>28,450</div>
        </div>
      </div>
      <div className="flex-1 relative rounded-2xl overflow-hidden"
        style={{ background: "hsl(213 40% 5%)", border: "1px solid hsl(197 85% 55% / 0.2)" }}>
        {[0,1,2].map(i => (
          <motion.div key={i} className="absolute inset-x-0 h-px"
            style={{ top: `${25 + i * 25}%`, background: "linear-gradient(90deg, transparent, hsl(197 85% 55% / 0.3), transparent)" }}
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }} />
        ))}
        <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-base"
          style={{ background: "linear-gradient(135deg, hsl(197 85% 55%), hsl(217 100% 65%))", boxShadow: "0 0 14px hsl(197 85% 55% / 0.45)" }}>
          🏃
        </motion.div>
        {[15, 55, 80].map((left, i) => (
          <motion.div key={i} className="absolute top-3 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ left: `${left}%`, background: "hsl(0 72% 50% / 0.18)", border: "1px solid hsl(0 72% 50% / 0.3)" }}
            animate={{ y: ["0%", "400%"] }} transition={{ duration: 1.8 + i * 0.4, repeat: Infinity, ease: "linear", delay: i * 0.6 }}>
            🚧
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 py-2 rounded-xl text-center"
          style={{ background: "hsl(197 85% 55% / 0.1)", border: "1px solid hsl(197 85% 55% / 0.25)" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "hsl(197 85% 65%)" }}>SCORE: 14,280</span>
        </div>
        <motion.div whileTap={{ scale: 0.95 }}
          className="w-11 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, hsl(197 85% 55%), hsl(217 100% 65%))" }}>
          <span className="text-sm font-bold text-white">▶</span>
        </motion.div>
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
  PuzzleScreen, WordGameScreen, CasinoScreen, TriviaGameScreen, ArcadeGameScreen,
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
    }, 4500);
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

              {/* ── Floating logo above headline ── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0, duration: 0.7, ease: "easeOut" }}
                className="mb-8 flex items-start"
              >
                <div className="relative inline-block">
                  {/* Ambient glow behind logo */}
                  <div className="absolute inset-0 rounded-full blur-[40px]"
                    style={{ background: "radial-gradient(ellipse at center, rgba(79,140,255,0.22) 0%, rgba(104,164,255,0.08) 60%, transparent 100%)", transform: "scale(1.8)" }} />
                  <motion.img
                    src="/logo.png"
                    alt="App Squad"
                    className="relative h-28 w-auto object-contain logo-glow"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold tracking-wide mb-7"
                style={{ background: "rgba(79,140,255,0.08)", borderColor: "rgba(79,140,255,0.22)", color: "#68A4FF" }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#4F8CFF" }} />
                The Mobile App Economy
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontSize: "clamp(34px, 5vw, 64px)",
                  fontWeight: 800,
                  letterSpacing: "-1px",
                  lineHeight: 1.04,
                  marginBottom: 24,
                }}
              >
                The Digital Economy<br />
                Isn't Just For<br />
                <span className="gradient-text block mt-1">Developers Anymore</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{ fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.7, color: "#C8CDD7", marginBottom: 24, maxWidth: 520, fontWeight: 300 }}
              >
                App Squad helps aspiring entrepreneurs launch branded mobile game apps through a guided process that includes customization, monetization preparation, publishing assistance, and ongoing support.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                style={{ fontSize: 14, lineHeight: 1.6, color: "#4F8CFF", marginBottom: 32, maxWidth: 480, fontWeight: 400, fontStyle: "italic" }}
              >
                Most people spend years consuming digital products. A smaller group decides to own one.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
              >
                <Link href="/start">
                  <button className="btn-gold h-14 px-8 text-base font-semibold rounded-xl text-white flex items-center gap-2 w-full sm:w-auto justify-center">
                    Watch The App Ownership Presentation
                    <PlayCircle className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="/representative">
                  <button className="btn-ghost h-14 px-8 text-base font-medium rounded-xl text-foreground/80 flex items-center gap-2 w-full sm:w-auto justify-center">
                    Already Spoke With A Representative?
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28 }}
                className="text-sm text-muted-foreground/60 mb-8 font-medium"
              >
                Choose the path that fits how you found us.
              </motion.p>

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
                        {SCREENS[screenIdx % SCREENS.length]?.label}
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

      {/* ═══════════ WHY APP OWNERSHIP ═══════════ */}
      <section className="py-20 border-b border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(79,140,255,0.05) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-silver">The Opportunity</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-5" style={{ letterSpacing: "-0.025em" }}>Why App Ownership?</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">Mobile applications have become one of the most widely used digital products in the world. Every day, millions of people engage with games, rewards systems, subscriptions, and digital experiences through mobile apps.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                icon: ShoppingBag,
                title: "Digital Product Ownership",
                desc: "Launch a branded mobile app that becomes part of your digital business ecosystem.",
                color: "#4F8CFF", bg: "rgba(79,140,255,0.08)", border: "rgba(79,140,255,0.2)",
              },
              {
                icon: Rocket,
                title: "Guided Launch Process",
                desc: "App Squad helps simplify the process through game templates, branding support, monetization preparation, and publishing assistance.",
                color: "#68A4FF", bg: "rgba(104,164,255,0.08)", border: "rgba(104,164,255,0.2)",
              },
              {
                icon: Globe,
                title: "Mobile App Economy",
                desc: "Mobile applications continue to play a major role in how people engage with digital products around the world.",
                color: "#7A8DFF", bg: "rgba(122,141,255,0.08)", border: "rgba(122,141,255,0.2)",
              },
            ].map(({ icon: Icon, title, desc, color, bg, border }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                <div className="glass rounded-3xl p-8 h-full border border-white/[0.07] hover:border-white/[0.14] transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: bg, border: `1px solid ${border}` }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10 }}>{title}</h3>
                  <p style={{ fontFamily: "'Inter'", fontSize: 14, lineHeight: 1.7, color: "hsl(218 14% 50%)", fontWeight: 300 }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ APP MARKET INTELLIGENCE ═══════════ */}
      <section className="py-20 border-b border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(79,140,255,0.04) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-silver">Mobile App Ecosystem</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ letterSpacing: "-0.025em" }}>Inside The Mobile App Economy</h2>
            <p className="text-muted-foreground leading-relaxed">Millions of people engage with mobile games and digital products every day across a wide range of categories.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { icon: Puzzle, label: "Puzzle Games", example: "e.g. Candy Crush Saga", desc: "Match-based puzzle games are among the most widely played mobile game categories globally.", color: "#4F8CFF", bg: "rgba(79,140,255,0.08)", border: "rgba(79,140,255,0.18)" },
              { icon: BookOpen, label: "Word Games", example: "e.g. Wordscapes", desc: "Word and spelling games draw consistent daily engagement from players of all ages.", color: "#68A4FF", bg: "rgba(104,164,255,0.08)", border: "rgba(104,164,255,0.18)" },
              { icon: Gamepad2, label: "Strategy Games", example: "e.g. Clash of Clans", desc: "Strategy and base-building games are known for deep engagement and in-app purchase activity.", color: "#7A8DFF", bg: "rgba(122,141,255,0.08)", border: "rgba(122,141,255,0.18)" },
              { icon: Zap, label: "Arcade Games", example: "e.g. Subway Surfers", desc: "Fast-paced arcade runners and action games attract broad audiences across demographics.", color: "hsl(142 65% 55%)", bg: "hsl(142 65% 48% / 0.08)", border: "hsl(142 65% 48% / 0.2)" },
              { icon: Star, label: "Casino Style Entertainment", example: "e.g. Slots Era", desc: "Casino-style entertainment apps are a well-established category in both app stores.", color: "hsl(35 100% 62%)", bg: "hsl(35 100% 58% / 0.08)", border: "hsl(35 100% 58% / 0.2)" },
              { icon: Users, label: "Social Games", example: "e.g. Coin Master", desc: "Social games combine gameplay with friend sharing and community engagement mechanics.", color: "hsl(280 70% 65%)", bg: "hsl(280 70% 60% / 0.08)", border: "hsl(280 70% 60% / 0.2)" },
            ].map(({ icon: Icon, label, example, desc, color, bg, border }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <div className="glass rounded-2xl p-6 h-full border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                  style={{ boxShadow: `0 0 0 0 transparent` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: bg, border: `1px solid ${border}` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 3 }}>{label}</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "#C8CDD7", opacity: 0.5, marginBottom: 10, fontWeight: 400 }}>{example}</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: 12.5, lineHeight: 1.65, color: "hsl(218 14% 52%)", fontWeight: 300 }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TWO ROUTE CARDS ═══════════ */}
      <section className="py-20 border-b border-white/[0.06] relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-silver">Choose Your Path</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Where Would You Like To Start?</h2>
            <p className="text-muted-foreground">Choose the path that fits how you found us.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1 — Cold Traffic */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Link href="/start">
                <div className="glass rounded-3xl p-8 h-full group cursor-pointer border border-white/[0.06] hover:border-[hsl(35_90%_55%_/_0.35)] transition-all duration-300 hover:shadow-[0_0_40px_-10px_hsl(35_90%_55%_/_0.25)]">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 text-xs font-semibold"
                    style={{ background: "rgba(79,140,255,0.08)", border: "1px solid rgba(79,140,255,0.22)", color: "#68A4FF" }}>
                    New Here?
                  </div>
                  <h3 className="text-2xl font-bold mb-3 leading-tight">Watch The App Ownership Presentation</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm mb-6">
                    Explore how the App Squad app launch process works and see how branded mobile game apps are prepared for customization, monetization, and launch.
                  </p>
                  <div className="text-xs text-muted-foreground/50 mb-6 font-medium tracking-wide uppercase">
                    Lead Capture → Presentation → Qualification → Book Call
                  </div>
                  <button className="btn-gold h-12 px-6 text-sm font-semibold rounded-xl text-white flex items-center gap-2 w-full justify-center">
                    Watch Presentation
                    <PlayCircle className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            </motion.div>

            {/* Card 2 — Appointment Setter */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Link href="/representative">
                <div className="glass rounded-3xl p-8 h-full group cursor-pointer border border-white/[0.06] hover:border-primary/35 transition-all duration-300 hover:shadow-[0_0_40px_-10px_hsl(217_85%_58%_/_0.2)]">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 text-xs font-semibold"
                    style={{ background: "rgba(122,141,255,0.08)", border: "1px solid rgba(122,141,255,0.22)", color: "#7A8DFF" }}>
                    Already Contacted?
                  </div>
                  <h3 className="text-2xl font-bold mb-3 leading-tight">Continue Your Application Process</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm mb-6">
                    If one of our app representatives already contacted you, continue directly to qualification and schedule your app launch strategy call.
                  </p>
                  <div className="text-xs text-muted-foreground/50 mb-6 font-medium tracking-wide uppercase">
                    Qualification → Book Call
                  </div>
                  <button className="btn-ghost h-12 px-6 text-sm font-medium rounded-xl text-foreground/80 flex items-center gap-2 w-full justify-center">
                    Continue Application
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ BENEFITS ═══════════ */}
      <section className="py-24 border-y border-white/[0.06] relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">Why App Squad</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Makes App Squad Different</h2>
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
                title: "Digital Product Ownership",
                desc: "Launch a branded mobile app that becomes a real digital product — customized to your identity and published to the App Store.",
                detail: "App Squad guides you through a structured launch process so you understand every step involved in bringing your app to market.",
                color: "text-primary",
                bg: "bg-primary/10 border-primary/20",
                hoverBorder: "hover:border-primary/50 hover:shadow-[0_0_30px_-5px_hsl(217_91%_60%_/_0.3)]"
              },
              {
                icon: Code2,
                title: "No Coding Required",
                desc: "We handle the full technical side so you can focus on your brand, your audience, and learning the app launch process.",
                detail: "From game mechanics to app store submissions, our team manages the technical stack built on proven templates.",
                color: "text-accent",
                bg: "bg-accent/10 border-accent/20",
                hoverBorder: "hover:border-accent/50 hover:shadow-[0_0_30px_-5px_hsl(195_88%_52%_/_0.3)]"
              },
              {
                icon: TrendingUp,
                title: "Monetization Preparation",
                desc: "Apps are set up with ad network integrations and in-app purchase configurations as part of the launch preparation process.",
                detail: "We help configure monetization infrastructure including AdMob and native app store payment systems as part of your launch package.",
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

      {/* ═══════════ 7-STEP PROCESS ═══════════ */}
      <section className="py-28 relative overflow-hidden grid-bg">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(79,140,255,0.06) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center max-w-xl mx-auto mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-4 text-silver">The Process</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ letterSpacing: "-0.03em" }}>How The App Launch Process Works</h2>
            <p className="text-muted-foreground text-lg">Seven structured steps designed to take you from concept to a published app in the App Store and Google Play.</p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            {[
              { n: "01", icon: PlayCircle,    title: "Explore The App Ownership Presentation", desc: "Watch a guided overview of how the App Squad app launch process works and what's included.",               cta: true  },
              { n: "02", icon: Smartphone,    title: "Complete Your Application",           desc: "Tell us about your goals, timeline, and the type of digital product you're looking to launch.",               cta: false },
              { n: "03", icon: CalendarCheck, title: "Book Your Strategy Call",             desc: "Our team reviews your application and schedules your personalized App Launch Strategy Call.",                  cta: false },
              { n: "04", icon: Package,       title: "Choose Your Launch Package",          desc: "Select the app launch package that fits your goals and the level of support you're looking for.",              cta: false },
              { n: "05", icon: Gamepad2,      title: "Select Your App Template",            desc: "Browse our library of branded mobile app templates and choose the one that fits your vision.",                 cta: false },
              { n: "06", icon: Palette,       title: "Customize Your Brand",                desc: "Apply your name, colors, logo, and identity to make the app distinctly yours.",                                cta: false },
              { n: "07", icon: Globe,         title: "Launch Your Digital Product",         desc: "We prepare your app for submission to the Apple App Store and Google Play Store.",                              cta: false },
            ].map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45, ease: "easeOut" }}
                whileHover={{ x: 5, transition: { duration: 0.18 } }}
                className="relative flex gap-5 mb-5 last:mb-0 group"
                data-testid={`step-${step.n}`}>
                {/* Connecting line */}
                {i < 6 && (
                  <div className="absolute left-[19px] top-[44px] bottom-[-20px] w-px pointer-events-none"
                    style={{ background: "linear-gradient(to bottom, rgba(79,140,255,0.25), rgba(79,140,255,0.04))" }} />
                )}
                {/* Icon circle */}
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: step.cta ? "linear-gradient(135deg, #FF8A00, #FFB547)" : "rgba(79,140,255,0.1)",
                    border: step.cta ? "none" : "1px solid rgba(79,140,255,0.22)",
                    boxShadow: step.cta ? "0 4px 16px rgba(255,138,0,0.3)" : "none",
                  }}>
                  <step.icon className="w-4 h-4" style={{ color: step.cta ? "white" : "#4F8CFF" }} />
                </div>
                {/* Card */}
                <div className="flex-1 glass rounded-2xl px-5 py-4 transition-all duration-300 group-hover:border-white/[0.14] group-hover:shadow-[0_0_20px_-8px_rgba(79,140,255,0.18)]">
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#4F8CFF", textTransform: "uppercase" }}>Step {step.n}</span>
                  <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", margin: "4px 0 5px" }}>{step.title}</h3>
                  <p style={{ fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.65, color: "hsl(218 14% 50%)", fontWeight: 300 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHAT APP SQUAD HELPS WITH ═══════════ */}
      <section className="py-24 border-b border-white/[0.06] relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center max-w-xl mx-auto mb-14">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-silver">Our Role</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ letterSpacing: "-0.025em" }}>What App Squad Helps You Build</h2>
          </motion.div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Smartphone, title: "Branded Mobile Applications",      desc: "Custom-branded mobile apps built on proven game templates and tailored to your identity.",                 color: "#4F8CFF",  bg: "rgba(79,140,255,0.08)",  border: "rgba(79,140,255,0.18)" },
              { icon: Layers,     title: "Digital Product Launch Support",   desc: "End-to-end guidance through the app launch process from template selection to submission.",               color: "#68A4FF",  bg: "rgba(104,164,255,0.08)", border: "rgba(104,164,255,0.18)" },
              { icon: Palette,    title: "Custom App Branding",              desc: "Name, colors, icons, splash screens, and visual identity applied to make the app distinctly yours.",        color: "#7A8DFF",  bg: "rgba(122,141,255,0.08)", border: "rgba(122,141,255,0.18)" },
              { icon: BarChart3,  title: "Monetization Preparation",         desc: "Ad network integrations and in-app purchase configurations set up as part of your launch package.",        color: "hsl(142 65% 55%)", bg: "hsl(142 65% 48% / 0.08)", border: "hsl(142 65% 48% / 0.2)" },
              { icon: Globe,      title: "Publishing Assistance",            desc: "Support preparing your app for submission to the Apple App Store and Google Play Store.",                  color: "hsl(35 100% 62%)",  bg: "hsl(35 100% 58% / 0.08)", border: "hsl(35 100% 58% / 0.2)" },
              { icon: Rocket,     title: "Launch Guidance",                  desc: "Step-by-step support so you understand every stage of the app launch process from start to finish.",       color: "hsl(280 70% 65%)", bg: "hsl(280 70% 60% / 0.08)", border: "hsl(280 70% 60% / 0.2)" },
            ].map(({ icon: Icon, title, desc, color, bg, border }, i) => (
              <motion.div key={title}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                <div className="glass rounded-2xl p-6 h-full border border-white/[0.06] hover:border-white/[0.14] transition-all duration-300 group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: bg, border: `1px solid ${border}` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.65, color: "hsl(218 14% 50%)", fontWeight: 300 }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FROM CONSUMER TO CREATOR ═══════════ */}
      <section className="py-24 border-b border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(79,140,255,0.04) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-12">
              <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-silver">A Different Path</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ letterSpacing: "-0.025em" }}>From Consumer To Creator</h2>
              <div className="max-w-2xl mx-auto space-y-4 text-left">
                <p style={{ fontFamily: "'Inter'", fontSize: 15, lineHeight: 1.8, color: "hsl(218 14% 56%)", fontWeight: 300 }}>
                  Most people spend their lives downloading apps, using apps, and buying from apps.
                </p>
                <p style={{ fontFamily: "'Inter'", fontSize: 15, lineHeight: 1.8, color: "hsl(218 14% 56%)", fontWeight: 300 }}>
                  App Squad was created for individuals who want to explore the process of launching a branded digital product of their own through a guided mobile app launch system.
                </p>
                <p style={{ fontFamily: "'Inter'", fontSize: 15, lineHeight: 1.8, color: "hsl(218 14% 56%)", fontWeight: 300 }}>
                  This is not about learning to code. This is not about building software from scratch. This is about simplifying the path into the mobile app ecosystem.
                </p>
              </div>
            </motion.div>

            {/* Journey visual */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-0">
              {[
                { label: "Consumer",          icon: Download,  color: "#C8CDD7", bg: "rgba(200,205,215,0.08)", border: "rgba(200,205,215,0.18)" },
                { label: "Digital Product\nOwner", icon: ShoppingBag, color: "#4F8CFF", bg: "rgba(79,140,255,0.1)",  border: "rgba(79,140,255,0.25)"  },
                { label: "Launch Ready",      icon: Rocket,    color: "#68A4FF", bg: "rgba(104,164,255,0.1)", border: "rgba(104,164,255,0.25)"  },
                { label: "Digital Product\nLive",  icon: Globe,     color: "#7A8DFF", bg: "rgba(122,141,255,0.1)", border: "rgba(122,141,255,0.25)"  },
              ].map(({ label, icon: Icon, color, bg, border }, i) => (
                <div key={label} className="flex items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="flex flex-col items-center gap-3 px-4 py-2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: bg, border: `1px solid ${border}` }}>
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                    <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, fontWeight: 600, color, textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.3 }}>{label}</span>
                  </motion.div>
                  {i < 3 && (
                    <ArrowRight className="w-5 h-5 shrink-0 mx-1 hidden sm:block" style={{ color: "rgba(79,140,255,0.3)" }} />
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-24 relative overflow-hidden border-t border-white/[0.05]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,hsl(217_85%_50%_/_0.07)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto glass rounded-[2.5rem] p-12 md:p-16 text-center border border-white/[0.08] shadow-[0_0_60px_-20px_hsl(217_85%_50%_/_0.15),0_1px_0_0_hsl(220_20%_97%_/_0.05)_inset]">
            <p className="text-xs font-semibold tracking-widest uppercase mb-5 text-silver">Get Started</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">Explore The App<br />Ownership Presentation</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Learn how App Squad helps customers navigate the app launch process through customization, monetization preparation, and publishing support.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/start">
                <button className="btn-gold h-13 py-4 px-8 text-base font-semibold rounded-xl text-white flex items-center gap-2 w-full sm:w-auto justify-center">
                  Watch The App Ownership Presentation
                  <PlayCircle className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/representative">
                <button className="btn-ghost h-13 py-4 px-8 text-base font-medium rounded-xl text-foreground/80 flex items-center gap-2 w-full sm:w-auto justify-center">
                  Already Spoke With A Representative?
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
