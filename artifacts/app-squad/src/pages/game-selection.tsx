import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Puzzle,
  Type,
  Dices,
  Car,
  Map,
  BookOpen,
  Gamepad2,
  HelpCircle,
  ArrowRight,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GAMES = [
  { id: "puzzle", name: "Puzzle Match Game", icon: Puzzle, audience: "Brain training fans", monetization: "Ads + IAP", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", glow: "hover:shadow-[0_0_30px_hsl(96_100%_70%_/_0.2)]", popular: true },
  { id: "word", name: "Word Game", icon: Type, audience: "Casual players", monetization: "Ads + Premium", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", glow: "hover:shadow-[0_0_30px_hsl(188_100%_70%_/_0.2)]" },
  { id: "slots", name: "Casino Slots Game", icon: Dices, audience: "Entertainment", monetization: "IAP + Ads", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", glow: "hover:shadow-[0_0_30px_hsl(270_100%_70%_/_0.2)]" },
  { id: "racing", name: "Racing Game", icon: Car, audience: "Action fans", monetization: "Ads + IAP", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", glow: "hover:shadow-[0_0_30px_hsl(30_100%_70%_/_0.2)]" },
  { id: "adventure", name: "Adventure Game", icon: Map, audience: "Story lovers", monetization: "IAP + Subscriptions", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", glow: "hover:shadow-[0_0_30px_hsl(140_100%_70%_/_0.2)]" },
  { id: "kids", name: "Kids Educational Game", icon: BookOpen, audience: "Parents and schools", monetization: "Premium + IAP", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", glow: "hover:shadow-[0_0_30px_hsl(50_100%_70%_/_0.2)]" },
  { id: "arcade", name: "Arcade Game", icon: Gamepad2, audience: "High-score chasers", monetization: "Ads + IAP", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", glow: "hover:shadow-[0_0_30px_hsl(330_100%_70%_/_0.2)]", popular: true },
  { id: "trivia", name: "Trivia Game", icon: HelpCircle, audience: "Knowledge seekers", monetization: "Ads + Premium", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", glow: "hover:shadow-[0_0_30px_hsl(230_100%_70%_/_0.2)]" },
];

export default function GameSelection() {
  const [, setLocation] = useLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-4rem)] py-16 md:py-24 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_10%,hsl(217_91%_60%_/_0.05)_0%,transparent_60%)] pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-block text-primary font-semibold tracking-widest uppercase text-xs mb-5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_15px_-3px_hsl(217_91%_60%_/_0.2)]">
            Client Portal Phase 1
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Choose Your Game Engine</h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Select a proven game framework to serve as the foundation. In the next step, you'll customize the branding, colors, and assets to make it uniquely yours.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
        >
          {GAMES.map((game) => {
            const isSelected = selectedId === game.id;
            return (
              <motion.div
                key={game.id}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <div
                  className={cn(
                    "h-full glass rounded-3xl p-8 cursor-pointer transition-all duration-300 relative overflow-hidden group border-2 flex flex-col",
                    isSelected
                      ? "border-primary bg-primary/[0.08] shadow-[0_0_40px_-10px_hsl(217_91%_60%_/_0.5)]"
                      : cn("border-white/10 hover:bg-white/[0.04]", game.glow)
                  )}
                  onClick={() => setSelectedId(game.id)}
                  data-testid={`card-game-${game.id}`}
                >
                  {/* Subtle inner gradient based on game color when selected */}
                  {isSelected && (
                     <div className={cn("absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br from-current to-transparent", game.color)} style={{ color: 'currentColor'}} />
                  )}

                  {game.popular && (
                    <div className="absolute top-4 right-4 bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-orange-500/30 flex items-center gap-1 z-10">
                      <Flame className="w-3 h-3" />
                      Popular
                    </div>
                  )}

                  <div className="mb-6 relative z-10">
                    <div className={cn("w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all group-hover:scale-110", game.bg)}>
                      <game.icon className={cn("w-7 h-7", game.color)} />
                    </div>
                  </div>

                  <h3 className="font-bold text-xl mb-4 leading-tight relative z-10">{game.name}</h3>

                  <div className="space-y-3 mb-8 relative z-10 flex-1">
                    <div className="text-sm bg-black/20 rounded-lg p-3 border border-white/5">
                      <span className="text-muted-foreground block text-xs mb-1">Best for</span>
                      <span className="text-foreground font-medium">{game.audience}</span>
                    </div>
                    <div className="text-sm bg-black/20 rounded-lg p-3 border border-white/5">
                      <span className="text-muted-foreground block text-xs mb-1">Monetization</span>
                      <span className={cn("font-medium", game.color)}>{game.monetization}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-white/[0.08] flex items-center justify-between relative z-10">
                    <span className={cn("text-sm font-bold transition-colors", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                      {isSelected ? "Selected Engine" : "Select Engine"}
                    </span>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected ? "border-primary bg-primary" : "border-white/20 group-hover:border-white/40"
                    )}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="h-16 px-12 text-lg font-bold glow-blue disabled:opacity-30 disabled:shadow-none transition-all rounded-full"
            disabled={!selectedId}
            onClick={() => setLocation("/customize")}
            data-testid="button-continue-customize"
          >
            Continue to Customization Step
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
