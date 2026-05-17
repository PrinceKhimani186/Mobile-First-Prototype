import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  Puzzle, 
  WholeWord, 
  Cherry, 
  Car, 
  Map, 
  Baby, 
  Ghost, 
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const GAMES = [
  {
    id: "puzzle",
    name: "Puzzle Match Game",
    icon: Puzzle,
    audience: "Brain training fans",
    monetization: "Ads + IAP"
  },
  {
    id: "word",
    name: "Word Game",
    icon: WholeWord,
    audience: "Casual players",
    monetization: "Ads + Premium"
  },
  {
    id: "slots",
    name: "Casino Slots Style Game",
    icon: Cherry,
    audience: "Entertainment",
    monetization: "IAP + Ads"
  },
  {
    id: "racing",
    name: "Racing Game",
    icon: Car,
    audience: "Action fans",
    monetization: "Ads + IAP"
  },
  {
    id: "adventure",
    name: "Adventure Game",
    icon: Map,
    audience: "Story lovers",
    monetization: "IAP + Subscriptions"
  },
  {
    id: "kids",
    name: "Kids Educational Game",
    icon: Baby,
    audience: "Parents and schools",
    monetization: "Premium + IAP"
  },
  {
    id: "arcade",
    name: "Arcade Game",
    icon: Ghost,
    audience: "High-score chasers",
    monetization: "Ads + IAP"
  },
  {
    id: "trivia",
    name: "Trivia Game",
    icon: HelpCircle,
    audience: "Knowledge seekers",
    monetization: "Ads + Premium"
  }
];

export default function GameSelection() {
  const [, setLocation] = useLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedId) {
      setLocation("/customize");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[calc(100vh-4rem)] py-12 md:py-24"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">Choose Your Game Type</h1>
          <p className="text-muted-foreground text-lg">Select a proven game framework to serve as the foundation for your custom brand.</p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
          }}
        >
          {GAMES.map((game) => {
            const isSelected = selectedId === game.id;
            return (
              <motion.div
                key={game.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Card 
                  className={cn(
                    "h-full bg-card border-white/5 p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group",
                    isSelected 
                      ? "ring-2 ring-primary bg-primary/5 shadow-[0_0_30px_-10px_hsl(var(--primary))]" 
                      : "hover:border-primary/50 hover:bg-white/5"
                  )}
                  onClick={() => setSelectedId(game.id)}
                >
                  <div className="mb-6">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-white/10 text-primary group-hover:bg-primary/20"
                    )}>
                      <game.icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-4 leading-tight">{game.name}</h3>
                  
                  <div className="space-y-2 mb-8">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Best for: </span>
                      <span className="text-foreground">{game.audience}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Monetization: </span>
                      <span className="text-foreground">{game.monetization}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/10">
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {isSelected ? "Selected" : "Select"}
                    </span>
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                      isSelected ? "border-primary bg-primary" : "border-white/20"
                    )}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="h-14 px-12 text-lg"
            disabled={!selectedId}
            onClick={handleContinue}
          >
            Continue to Customization
          </Button>
        </div>
      </div>
    </motion.div>
  );
}