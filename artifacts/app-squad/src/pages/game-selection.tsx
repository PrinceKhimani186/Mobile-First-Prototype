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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GAMES = [
  { id: "puzzle", name: "Puzzle Match Game", icon: Puzzle, audience: "Brain training fans", monetization: "Ads + IAP", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { id: "word", name: "Word Game", icon: Type, audience: "Casual players", monetization: "Ads + Premium", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { id: "slots", name: "Casino Slots Game", icon: Dices, audience: "Entertainment", monetization: "IAP + Ads", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { id: "racing", name: "Racing Game", icon: Car, audience: "Action fans", monetization: "Ads + IAP", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { id: "adventure", name: "Adventure Game", icon: Map, audience: "Story lovers", monetization: "IAP + Subscriptions", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { id: "kids", name: "Kids Educational Game", icon: BookOpen, audience: "Parents and schools", monetization: "Premium + IAP", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { id: "arcade", name: "Arcade Game", icon: Gamepad2, audience: "High-score chasers", monetization: "Ads + IAP", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  { id: "trivia", name: "Trivia Game", icon: HelpCircle, audience: "Knowledge seekers", monetization: "Ads + Premium", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
];

export default function GameSelection() {
  const [, setLocation] = useLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-4rem)] py-14 md:py-20"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="inline-block text-primary font-semibold tracking-widest uppercase text-xs mb-5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            Client Portal
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Choose Your Game Type</h1>
          <p className="text-muted-foreground text-lg">
            Select a proven game framework to serve as the foundation for your custom brand.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14"
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
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
              >
                <div
                  className={cn(
                    "h-full glass rounded-2xl p-6 cursor-pointer transition-all duration-200 relative overflow-hidden group",
                    isSelected
                      ? "border-primary/60 bg-primary/[0.07] shadow-[0_0_30px_-8px_hsl(217_91%_60%_/_0.5)]"
                      : "hover:border-white/20 hover:bg-white/[0.03]"
                  )}
                  onClick={() => setSelectedId(game.id)}
                  data-testid={`card-game-${game.id}`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5 pointer-events-none" />
                  )}

                  <div className="mb-5">
                    <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center transition-colors", game.bg)}>
                      <game.icon className={cn("w-5 h-5", game.color)} />
                    </div>
                  </div>

                  <h3 className="font-bold text-base mb-3 leading-tight">{game.name}</h3>

                  <div className="space-y-1.5 mb-6">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Best for: </span>
                      <span className="text-foreground/80">{game.audience}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Monetization: </span>
                      <span className={game.color}>{game.monetization}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className={cn("text-xs font-semibold transition-colors", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                      {isSelected ? "Selected" : "Select"}
                    </span>
                    <div className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                      isSelected ? "border-primary bg-primary" : "border-white/20"
                    )}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
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
            className="h-12 px-10 text-base font-semibold glow-blue disabled:opacity-30 disabled:shadow-none transition-all"
            disabled={!selectedId}
            onClick={() => setLocation("/customize")}
            data-testid="button-continue-customize"
          >
            Continue to Customization
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
