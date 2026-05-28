import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Puzzle, Type, Dices, Car, Map, BookOpen,
  Gamepad2, HelpCircle, ArrowRight, Flame, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendGameSelectionToCRM } from "@/lib/crm";

const GAMES = [
  { id: "puzzle", name: "Puzzle Match", category: "Puzzle", template: "Puzzle Match Pro", icon: Puzzle, audience: "Brain training fans", monetization: "Ads + IAP", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", glow: "hover:shadow-[0_0_30px_hsl(217_100%_70%_/_0.15)]", popular: true },
  { id: "word", name: "Word Game", category: "Word", template: "Word Builder Pro", icon: Type, audience: "Casual players", monetization: "Ads + Premium", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", glow: "hover:shadow-[0_0_30px_hsl(188_100%_70%_/_0.15)]" },
  { id: "slots", name: "Casino Slots", category: "Casino", template: "Spin & Win Pro", icon: Dices, audience: "Entertainment", monetization: "IAP + Ads", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", glow: "hover:shadow-[0_0_30px_hsl(270_100%_70%_/_0.15)]" },
  { id: "racing", name: "Racing Game", category: "Racing", template: "Speed Rush Pro", icon: Car, audience: "Action fans", monetization: "Ads + IAP", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", glow: "hover:shadow-[0_0_30px_hsl(30_100%_70%_/_0.15)]" },
  { id: "adventure", name: "Adventure Game", category: "Adventure", template: "Quest World Pro", icon: Map, audience: "Story lovers", monetization: "IAP + Subscriptions", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", glow: "hover:shadow-[0_0_30px_hsl(140_100%_70%_/_0.15)]" },
  { id: "kids", name: "Kids Education", category: "Educational", template: "Learn & Play Pro", icon: BookOpen, audience: "Parents and schools", monetization: "Premium + IAP", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", glow: "hover:shadow-[0_0_30px_hsl(50_100%_70%_/_0.15)]" },
  { id: "arcade", name: "Arcade Game", category: "Arcade", template: "Arcade Blast Pro", icon: Gamepad2, audience: "High-score chasers", monetization: "Ads + IAP", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", glow: "hover:shadow-[0_0_30px_hsl(330_100%_70%_/_0.15)]", popular: true },
  { id: "trivia", name: "Trivia Game", category: "Trivia", template: "Brain Trivia Pro", icon: HelpCircle, audience: "Knowledge seekers", monetization: "Ads + Premium", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", glow: "hover:shadow-[0_0_30px_hsl(230_100%_70%_/_0.15)]" },
];

const STEPS = ["Game Selected", "Customization", "Dashboard"];

export default function GameSelection() {
  const [, navigate] = useLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedGame = GAMES.find(g => g.id === selectedId);

  const handleSave = () => {
    if (!selectedGame) return;

    const lead = JSON.parse(localStorage.getItem("as_lead") || "{}");
    const application = JSON.parse(localStorage.getItem("as_application") || "{}");
    const source = localStorage.getItem("as_source") || "Direct";
    const clientName = application.name || lead.name || "";
    const email = application.email || lead.email || "";
    const phone = application.phone || lead.phone || "";

    const gameData = {
      selectedGameType: selectedGame.name,
      gameCategory: selectedGame.category,
      templateName: selectedGame.template,
    };

    localStorage.setItem("as_game_selection", JSON.stringify(gameData));

    sendGameSelectionToCRM({
      clientName,
      email,
      phone,
      selectedGameType: gameData.selectedGameType,
      gameCategory: gameData.gameCategory,
      templateName: gameData.templateName,
      source,
    });

    navigate("/onboarding/customization");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-0 right-0 w-[500px] h-[350px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, hsl(217 85% 58% / 0.07) 0%, transparent 65%)", filter: "blur(80px)" }} />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">

        {/* Step progress */}
        <div className="flex items-center justify-center gap-0 mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  i === 0
                    ? "text-white" : "text-muted-foreground border border-white/10"
                )}
                  style={i === 0 ? { background: "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))" } : {}}>
                  {i === 0 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "hsl(35 90% 62%)" : "hsl(218 16% 36%)", marginTop: 5, whiteSpace: "nowrap" }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-16 h-px mx-2 mb-5" style={{ background: i === 0 ? "hsl(35 90% 55% / 0.4)" : "hsl(224 22% 14%)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: "hsl(217 85% 58% / 0.08)", border: "1px solid hsl(217 85% 58% / 0.2)" }}>
            <Gamepad2 className="w-3.5 h-3.5" style={{ color: "hsl(217 85% 68%)" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(217 85% 70%)" }}>
              Client Portal — Step 1
            </span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
            Select Your Game Template
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 14, lineHeight: 1.75, color: "hsl(218 16% 50%)", fontWeight: 300 }}>
            Choose a proven game framework as the foundation. In the next step you'll customize the branding, colors, and identity to make it uniquely yours.
          </p>
        </div>

        {/* Game grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
        >
          {GAMES.map((game) => {
            const isSelected = selectedId === game.id;
            return (
              <motion.div key={game.id} variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -5, transition: { duration: 0.18 } }}>
                <div
                  onClick={() => setSelectedId(game.id)}
                  className={cn(
                    "h-full rounded-2xl p-6 cursor-pointer transition-all duration-250 relative overflow-hidden flex flex-col border",
                    isSelected
                      ? "border-[hsl(35_90%_55%)] bg-[hsl(35_90%_55%_/_0.06)] shadow-[0_0_40px_-10px_hsl(35_90%_55%_/_0.35)]"
                      : cn("border-white/[0.07] hover:bg-white/[0.03]", game.glow)
                  )}
                  style={{ background: isSelected ? "hsl(226 32% 8%)" : "hsl(226 32% 7%)" }}
                >
                  {game.popular && (
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2 py-1 rounded-full"
                      style={{ background: "hsl(35 90% 55% / 0.15)", border: "1px solid hsl(35 90% 55% / 0.25)" }}>
                      <Flame className="w-2.5 h-2.5" style={{ color: "hsl(35 90% 62%)" }} />
                      <span style={{ fontFamily: "'Inter'", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "hsl(35 90% 65%)", textTransform: "uppercase" }}>Popular</span>
                    </div>
                  )}

                  <div className={cn("w-12 h-12 rounded-xl border-2 flex items-center justify-center mb-5", game.bg)}>
                    <game.icon className={cn("w-5.5 h-5.5", game.color)} />
                  </div>

                  <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 12 }}>{game.name}</h3>

                  <div className="flex flex-col gap-2 flex-1 mb-5">
                    <div className="px-3 py-2.5 rounded-lg" style={{ background: "hsl(226 28% 5%)", border: "1px solid hsl(224 22% 11%)" }}>
                      <p style={{ fontFamily: "'Inter'", fontSize: 10, color: "hsl(218 16% 38%)", marginBottom: 2 }}>Best for</p>
                      <p style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 500, color: "hsl(218 16% 62%)" }}>{game.audience}</p>
                    </div>
                    <div className="px-3 py-2.5 rounded-lg" style={{ background: "hsl(226 28% 5%)", border: "1px solid hsl(224 22% 11%)" }}>
                      <p style={{ fontFamily: "'Inter'", fontSize: 10, color: "hsl(218 16% 38%)", marginBottom: 2 }}>Monetization</p>
                      <p className={cn("text-xs font-semibold", game.color)}>{game.monetization}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid hsl(224 22% 10%)" }}>
                    <span style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 600, color: isSelected ? "hsl(35 90% 62%)" : "hsl(218 16% 40%)" }}>
                      {isSelected ? "Selected" : "Select Template"}
                    </span>
                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", isSelected ? "border-[hsl(35_90%_55%)] bg-[hsl(35_90%_55%)]" : "border-white/20")}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <div className="flex justify-center">
          <button
            disabled={!selectedId}
            onClick={handleSave}
            className="btn-gold h-13 py-4 px-10 text-[15px] font-semibold rounded-xl flex items-center gap-2.5 text-white"
            style={{ opacity: selectedId ? 1 : 0.32, cursor: selectedId ? "pointer" : "not-allowed" }}
          >
            Save Game Selection
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
