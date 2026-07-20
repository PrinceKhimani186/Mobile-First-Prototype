import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Search, Star, ArrowRight, CheckCircle2,
  Gamepad2, Shield, X, Sparkles, Loader2, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendGameSelectionToCRM } from "@/lib/crm";
import { updateOnboarding } from "@/services/auth";
import { getOnboardingEmail, markGameSelected, updateEnrollmentFields, fetchAllowedGames } from "@/services/enrollment";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Game {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  isPremium: boolean;
  emoji: string;
  gradient: string;
  isCasino?: boolean;
}

const GAMES: Game[] = [
  {
    id: "xtetris",
    name: "Xtetris™: Block Puzzle Games",
    category: "puzzle",
    categoryLabel: "Puzzle",
    description: "Classic block puzzle gameplay focused on clearing lines and building score.",
    isPremium: false,
    emoji: "🧩",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "metal-soldiers",
    name: "Metal Soldiers",
    category: "action",
    categoryLabel: "Action / Shooting",
    description: "Action platform shooter template with weapons, levels, and fast-paced combat style.",
    isPremium: true,
    emoji: "🪖",
    gradient: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
  },
  {
    id: "squid-survival",
    name: "Squid Survival Player 456",
    category: "adventure",
    categoryLabel: "Survival / Adventure",
    description: "Challenge-based survival game template inspired by obstacle and level progression gameplay.",
    isPremium: true,
    emoji: "🦑",
    gradient: "linear-gradient(135deg, #e73c7e 0%, #23a6d5 100%)",
  },
  {
    id: "blackjack",
    name: "Blackjack",
    category: "casino",
    categoryLabel: "Casino-Style Entertainment",
    description: "Entertainment-only blackjack style card game template.",
    isPremium: true,
    emoji: "🃏",
    gradient: "linear-gradient(135deg, #c9a227 0%, #6b3f0e 100%)",
    isCasino: true,
  },
  {
    id: "galaxy-attack",
    name: "Galaxy Attack: Alien Shooting",
    category: "arcade",
    categoryLabel: "Arcade / Shooting",
    description: "Space shooter template with enemy waves, upgrades, and arcade-style gameplay.",
    isPremium: false,
    emoji: "🚀",
    gradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  },
  {
    id: "crossy-word-search",
    name: "Crossy Word Search",
    category: "word",
    categoryLabel: "Word Games",
    description: "Word search puzzle template with level progression and brain-training gameplay.",
    isPremium: false,
    emoji: "🔤",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  {
    id: "bus-simulator",
    name: "Bus Simulator: Ultimate",
    category: "simulator",
    categoryLabel: "Simulator",
    description: "Bus driving simulation template with routes, vehicles, and travel-style gameplay.",
    isPremium: true,
    emoji: "🚌",
    gradient: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
  },
  {
    id: "truck-simulator-usa",
    name: "Truck Simulator USA - Evolution",
    category: "simulator",
    categoryLabel: "Simulator",
    description: "Truck driving simulation template with transportation and road-based gameplay.",
    isPremium: true,
    emoji: "🚛",
    gradient: "linear-gradient(135deg, #1a3a4a 0%, #4a7a5a 100%)",
  },
  {
    id: "dental-simulator",
    name: "Dental Simulator",
    category: "medical",
    categoryLabel: "Medical / Learning",
    description: "Educational dental simulation template with treatment-style interactions.",
    isPremium: true,
    emoji: "🦷",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: "word-search-puzzle",
    name: "Word Search Puzzle",
    category: "word",
    categoryLabel: "Word Games",
    description: "Classic word puzzle template for vocabulary and brain-training experiences.",
    isPremium: false,
    emoji: "📖",
    gradient: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
  },
  {
    id: "word-chef",
    name: "Word Chef",
    category: "word",
    categoryLabel: "Word Games",
    description: "Word puzzle template where users connect letters to create words.",
    isPremium: false,
    emoji: "👨‍🍳",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  {
    id: "word-connect",
    name: "Word Connect",
    category: "word",
    categoryLabel: "Word Games",
    description: "Word connection template for spelling, vocabulary, and puzzle gameplay.",
    isPremium: false,
    emoji: "✏️",
    gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
  },
  {
    id: "crossy-word",
    name: "Crossy Word",
    category: "word",
    categoryLabel: "Word Games",
    description: "Crossword-style word connection template with level progression.",
    isPremium: false,
    emoji: "📝",
    gradient: "linear-gradient(135deg, #0cebeb 0%, #20e3b2 50%, #29ffc6 100%)",
  },
  {
    id: "hexa-puzzle",
    name: "Hexa Puzzle",
    category: "puzzle",
    categoryLabel: "Puzzle",
    description: "Hexa block puzzle template with geometric strategy gameplay.",
    isPremium: false,
    emoji: "⬡",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "unroll-ball",
    name: "Unroll Ball Slide Puzzle",
    category: "puzzle",
    categoryLabel: "Puzzle",
    description: "Slide puzzle template where users guide the ball through connected paths.",
    isPremium: false,
    emoji: "🔵",
    gradient: "linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)",
  },
  {
    id: "tetris-block",
    name: "Tetris Block Puzzle",
    category: "puzzle",
    categoryLabel: "Puzzle",
    description: "Classic block puzzle template with line-clearing gameplay.",
    isPremium: false,
    emoji: "🟦",
    gradient: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
  },
  {
    id: "bubble-shooter",
    name: "Bubble Shooter",
    category: "arcade",
    categoryLabel: "Arcade / Puzzle",
    description: "Match bubbles, clear levels, and score stars through casual gameplay.",
    isPremium: false,
    emoji: "🫧",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "match3",
    name: "Match 3 Candy Crush Style",
    category: "puzzle",
    categoryLabel: "Puzzle / Match 3",
    description: "Match-three puzzle template with candy-style game mechanics and level progression.",
    isPremium: false,
    emoji: "🍭",
    gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
  },
  {
    id: "flight-pilot",
    name: "Flight Pilot: 3D Simulator",
    category: "simulator",
    categoryLabel: "Simulator",
    description: "Flight simulator template with missions, aircraft, and 3D-style gameplay.",
    isPremium: true,
    emoji: "✈️",
    gradient: "linear-gradient(135deg, #2980b9 0%, #6dd5fa 100%)",
  },
  {
    id: "run-forrest",
    name: "Run Forrest Run: Running Games",
    category: "adventure",
    categoryLabel: "Running / Adventure",
    description: "Endless runner-style template with obstacles, coins, and adventure gameplay.",
    isPremium: true,
    emoji: "🏃",
    gradient: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
  },
  {
    id: "crossy-road",
    name: "Crossy Road",
    category: "arcade",
    categoryLabel: "Arcade",
    description: "Arcade crossing template focused on movement, timing, and obstacle avoidance.",
    isPremium: true,
    emoji: "🐔",
    gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
  },
  {
    id: "fashion-competition",
    name: "Fashion Competition Dress Up",
    category: "fashion",
    categoryLabel: "Fashion / Lifestyle",
    description: "Dress-up and makeover game template for fashion and beauty-focused audiences.",
    isPremium: true,
    emoji: "👗",
    gradient: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)",
  },
  {
    id: "ear-doctor",
    name: "Ear Doctor",
    category: "medical",
    categoryLabel: "Medical / Kids",
    description: "Doctor simulation template with treatment tools and interactive procedures.",
    isPremium: true,
    emoji: "👂",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: "mandala-coloring",
    name: "Mandala Coloring Book",
    category: "kids",
    categoryLabel: "Kids / Educational / Lifestyle",
    description: "Coloring app template with drawing modes, brushes, stickers, and palettes.",
    isPremium: false,
    emoji: "🎨",
    gradient: "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)",
  },
  {
    id: "bowling-3d",
    name: "3D Bowling",
    category: "sports",
    categoryLabel: "Sports",
    description: "Bowling game template with 3D-style gameplay and score tracking.",
    isPremium: true,
    emoji: "🎳",
    gradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
  },
  {
    id: "marble-zuma",
    name: "Marble Zuma",
    category: "arcade",
    categoryLabel: "Arcade / Puzzle",
    description: "Marble matching game template with chain reactions and score progression.",
    isPremium: false,
    emoji: "🔮",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "8-ball-pool",
    name: "8 Ball Pool",
    category: "sports",
    categoryLabel: "Sports",
    description: "Pool game template with realistic billiards-style gameplay.",
    isPremium: true,
    emoji: "🎱",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  },
  {
    id: "foxone",
    name: "FoxOne Special Missions",
    category: "action",
    categoryLabel: "Action / Flight",
    description: "Air combat template with fighter jets, missions, and battle gameplay.",
    isPremium: true,
    emoji: "🛩️",
    gradient: "linear-gradient(135deg, #373b44 0%, #4286f4 100%)",
  },
  {
    id: "soccer-3d",
    name: "Soccer Game 3D",
    category: "sports",
    categoryLabel: "Sports",
    description: "Soccer game template with fast-paced football gameplay.",
    isPremium: true,
    emoji: "⚽",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  {
    id: "huge-casino-slots",
    name: "Huge Casino Slots Vegas 777",
    category: "casino",
    categoryLabel: "Casino-Style Entertainment",
    description: "Entertainment-only slot-style template with casino-inspired visuals.",
    isPremium: true,
    emoji: "🎰",
    gradient: "linear-gradient(135deg, #c9a227 0%, #8b5e15 100%)",
    isCasino: true,
  },
  {
    id: "billionaire-casino",
    name: "Billionaire Casino Slots 777",
    category: "casino",
    categoryLabel: "Casino-Style Entertainment",
    description: "Entertainment-only slot-style template with reels, bonus visuals, and casino-inspired design.",
    isPremium: true,
    emoji: "💰",
    gradient: "linear-gradient(135deg, #b8860b 0%, #c9a227 100%)",
    isCasino: true,
  },
  {
    id: "brother-squad",
    name: "Brother Squad - Metal Shooter",
    category: "action",
    categoryLabel: "Action / Shooting",
    description: "Side-scrolling shooter template with missions, enemies, and action gameplay.",
    isPremium: false,
    emoji: "🔫",
    gradient: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
  },
  {
    id: "sniper-warrior",
    name: "Sniper Warrior: PvP Sniper",
    category: "shooting",
    categoryLabel: "Shooting",
    description: "Sniper shooting template with competitive-style gameplay.",
    isPremium: true,
    emoji: "🎯",
    gradient: "linear-gradient(135deg, #373b44 0%, #4286f4 100%)",
  },
  {
    id: "real-gangster",
    name: "Real Gangster Crime",
    category: "action",
    categoryLabel: "Action / Open World",
    description: "Open-world action template with missions, vehicles, and city-style gameplay.",
    isPremium: true,
    emoji: "🌆",
    gradient: "linear-gradient(135deg, #232526 0%, #414345 100%)",
  },
  {
    id: "limo-parking",
    name: "Limo Parking Simulator 3D",
    category: "simulator",
    categoryLabel: "Simulator / Driving",
    description: "Luxury limousine parking and driving simulation template.",
    isPremium: true,
    emoji: "🚙",
    gradient: "linear-gradient(135deg, #1c1c1c 0%, #4a4a4a 100%)",
  },
  {
    id: "head-soccer",
    name: "Head Soccer - Star League",
    category: "sports",
    categoryLabel: "Sports",
    description: "Fun soccer-style template with character-based football gameplay.",
    isPremium: false,
    emoji: "🏆",
    gradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
  },
  {
    id: "basketball-strike",
    name: "Basketball Strike",
    category: "sports",
    categoryLabel: "Sports",
    description: "Basketball game template focused on dribbling, dunking, and scoring.",
    isPremium: false,
    emoji: "🏀",
    gradient: "linear-gradient(135deg, #f7971e 0%, #c94b4b 100%)",
  },
  {
    id: "88-fortunes",
    name: "88 Fortunes Slots Casino Games",
    category: "casino",
    categoryLabel: "Casino-Style Entertainment",
    description: "Entertainment-only slot-style template with themed visuals.",
    isPremium: true,
    emoji: "🀄",
    gradient: "linear-gradient(135deg, #c9a227 0%, #8b0000 100%)",
    isCasino: true,
  },
  {
    id: "twerk-race",
    name: "Twerk Race 3D Running Game",
    category: "racing",
    categoryLabel: "Running / Casual",
    description: "Fun runner-style template with obstacle-based gameplay.",
    isPremium: true,
    emoji: "🏃‍♀️",
    gradient: "linear-gradient(135deg, #e96c2c 0%, #f7971e 100%)",
  },
  {
    id: "stickman-ping-pong",
    name: "Stickman Ping Pong",
    category: "sports",
    categoryLabel: "Sports / Arcade",
    description: "Stickman table-tennis template with quick competitive gameplay.",
    isPremium: false,
    emoji: "🏓",
    gradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
  },
  {
    id: "spider-robot",
    name: "Spider Robot Car Transform War",
    category: "action",
    categoryLabel: "Action / Robot",
    description: "Robot transformation action template with combat and vehicle-style gameplay.",
    isPremium: true,
    emoji: "🤖",
    gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
  },
  {
    id: "millionaire-trivia",
    name: "Millionaire Trivia Game Quiz",
    category: "trivia",
    categoryLabel: "Trivia",
    description: "Trivia quiz template with question categories, score tracking, and knowledge gameplay.",
    isPremium: true,
    emoji: "🧠",
    gradient: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
  },
  {
    id: "gangster-crime",
    name: "Gangster Crime City War Games",
    category: "action",
    categoryLabel: "Action / Open World",
    description: "City action template with driving, missions, and open-world gameplay.",
    isPremium: true,
    emoji: "🏙️",
    gradient: "linear-gradient(135deg, #232526 0%, #414345 100%)",
  },
  {
    id: "farming-simulator",
    name: "Farming Simulator 20",
    category: "simulator",
    categoryLabel: "Simulator",
    description: "Farming simulation template with crops, animals, and management-style gameplay.",
    isPremium: true,
    emoji: "🚜",
    gradient: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
  },
  {
    id: "truck-offroad",
    name: "Truck Simulator Offroad 2",
    category: "simulator",
    categoryLabel: "Simulator / Driving",
    description: "Offroad truck simulator template with routes, missions, and challenging terrain.",
    isPremium: true,
    emoji: "🛻",
    gradient: "linear-gradient(135deg, #1a3a4a 0%, #4a7a5a 100%)",
  },
  {
    id: "ninja-archer",
    name: "Ninja Archer Assassin Shooter",
    category: "action",
    categoryLabel: "Action / Shooting",
    description: "Archer shooting template with combat missions and action gameplay.",
    isPremium: true,
    emoji: "🏹",
    gradient: "linear-gradient(135deg, #232526 0%, #4a2040 100%)",
  },
  {
    id: "death-moto",
    name: "Death Moto 3: Fighting Rider",
    category: "racing",
    categoryLabel: "Racing / Action",
    description: "Motorcycle racing and combat-style game template.",
    isPremium: true,
    emoji: "🏍️",
    gradient: "linear-gradient(135deg, #c94b4b 0%, #232526 100%)",
  },
  {
    id: "race-master",
    name: "Race Master 3D - Car Racing",
    category: "racing",
    categoryLabel: "Racing",
    description: "High-speed racing template with cars, obstacles, and arcade racing gameplay.",
    isPremium: true,
    emoji: "🏎️",
    gradient: "linear-gradient(135deg, #e96c2c 0%, #ffd200 100%)",
  },
  {
    id: "sniper-3d",
    name: "Sniper 3D: Gun Shooting Games",
    category: "shooting",
    categoryLabel: "Shooting",
    description: "Sniper shooting template with missions, targets, and action gameplay.",
    isPremium: true,
    emoji: "🔭",
    gradient: "linear-gradient(135deg, #373b44 0%, #4286f4 100%)",
  },
  {
    id: "toy-blast",
    name: "Toy Blast",
    category: "puzzle",
    categoryLabel: "Puzzle / Match 3",
    description: "Cube matching puzzle template with levels and colorful gameplay.",
    isPremium: true,
    emoji: "🧸",
    gradient: "linear-gradient(135deg, #f7971e 0%, #f093fb 100%)",
  },
];

const FEATURED_IDS = [
  "match3", "word-connect", "galaxy-attack", "race-master", "millionaire-trivia", "huge-casino-slots",
];

const CATEGORIES = [
  { key: "all", label: "All Games" },
  { key: "puzzle", label: "Puzzle" },
  { key: "word", label: "Word Games" },
  { key: "arcade", label: "Arcade" },
  { key: "action", label: "Action" },
  { key: "shooting", label: "Shooting" },
  { key: "racing", label: "Racing" },
  { key: "simulator", label: "Simulator" },
  { key: "sports", label: "Sports" },
  { key: "casino", label: "Casino-Style" },
  { key: "kids", label: "Kids / Educational" },
  { key: "fashion", label: "Fashion / Lifestyle" },
  { key: "medical", label: "Medical / Learning" },
  { key: "trivia", label: "Trivia" },
  { key: "adventure", label: "Adventure" },
];

const STEPS = ["Game Selected", "Customization", "Dashboard"];

function GameIcon({ emoji, gradient, size = 72 }: { emoji: string; gradient: string; size?: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size * 0.22,
      background: gradient,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.44,
      flexShrink: 0,
      boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
      position: "relative" as const,
      overflow: "hidden" as const,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)",
      }} />
      <span style={{ position: "relative", zIndex: 1, lineHeight: 1 }}>{emoji}</span>
    </div>
  );
}

function GameCard({
  game,
  isSelected,
  isFeatured,
  onSelect,
}: {
  game: Game;
  isSelected: boolean;
  isFeatured?: boolean;
  onSelect: (game: Game) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ y: -4, transition: { duration: 0.16 } }}
      onClick={() => onSelect(game)}
      style={{
        background: isSelected
          ? "linear-gradient(155deg, hsl(38 80% 55% / 0.08) 0%, hsl(226 32% 8%) 100%)"
          : "hsl(226 32% 7%)",
        border: isSelected
          ? "1px solid hsl(38 90% 55% / 0.55)"
          : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 18,
        padding: "22px 20px",
        cursor: "pointer",
        position: "relative" as const,
        overflow: "hidden" as const,
        display: "flex",
        flexDirection: "column" as const,
        gap: 14,
        boxShadow: isSelected
          ? "0 0 40px -10px hsl(38 90% 55% / 0.3)"
          : "none",
        transition: "border 0.2s, box-shadow 0.2s, background 0.2s",
        height: "100%",
      }}
    >
      {isSelected && (
        <div style={{
          position: "absolute", top: 0, right: 0, width: 120, height: 120,
          background: "radial-gradient(ellipse, hsl(38 90% 55% / 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      )}

      {/* Badges */}
      <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, zIndex: 2 }}>
        {game.isPremium && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 6,
            background: "rgba(123,97,255,0.15)", border: "1px solid rgba(123,97,255,0.3)",
          }}>
            <Star style={{ width: 9, height: 9, fill: "#a78bfa", color: "#a78bfa" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", color: "#a78bfa", textTransform: "uppercase" as const }}>Premium</span>
          </div>
        )}
        {isFeatured && !game.isPremium && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 6,
            background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)",
          }}>
            <Sparkles style={{ width: 9, height: 9, color: "#00D4FF" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", color: "#00D4FF", textTransform: "uppercase" as const }}>Featured</span>
          </div>
        )}
      </div>

      {/* Icon */}
      <GameIcon emoji={game.emoji} gradient={game.gradient} size={64} />

      {/* Info */}
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700,
          letterSpacing: "-0.01em", lineHeight: 1.25, marginBottom: 6,
          paddingRight: game.isPremium ? 60 : 8,
          color: "rgba(255,255,255,0.92)",
        }}>{game.name}</h3>
        <div style={{
          display: "inline-block", padding: "2px 8px", borderRadius: 5, marginBottom: 8,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <span style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.38)", letterSpacing: "0.03em" }}>{game.categoryLabel}</span>
        </div>
        <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "rgba(255,255,255,0.35)" }}>{game.description}</p>
      </div>

      {/* Select button */}
      <button
        style={{
          width: "100%",
          padding: "10px 0",
          borderRadius: 10,
          fontFamily: "'Space Grotesk'",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase" as const,
          cursor: "pointer",
          border: isSelected ? "1px solid hsl(38 90% 55%)" : "1px solid rgba(255,255,255,0.1)",
          background: isSelected ? "hsl(38 90% 55%)" : "rgba(255,255,255,0.03)",
          color: isSelected ? "#050505" : "rgba(255,255,255,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          transition: "all 0.2s",
        }}
      >
        {isSelected ? (
          <><CheckCircle2 style={{ width: 13, height: 13 }} /> Template Selected</>
        ) : (
          <>Select This Template</>
        )}
      </button>
    </motion.div>
  );
}

export default function GameSelection() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // The server resolves the customer's verified purchased plan and returns the
  // permitted game IDs — the page never decides plan access on its own.
  const userEmail = getOnboardingEmail();
  const { data: allowed, isLoading: allowedLoading } = useQuery({
    queryKey: ["allowedGames", userEmail],
    queryFn: () => fetchAllowedGames(userEmail),
    enabled: !!userEmail,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!allowed) return;
    console.info("[GameSelection] Purchased plan loaded from server:", {
      status: allowed.status,
      plan: allowed.plan ?? null,
      allowedGameCount: allowed.gameIds?.length ?? 0,
      allowedGameIds: allowed.gameIds ?? [],
      error: allowed.error ?? null,
    });
    // No enrollment record → restart enrollment; payment incomplete → back to checkout.
    if (allowed.status === 404 || allowed.status === 402) {
      navigate("/enrollment");
    }
  }, [allowed, navigate]);

  const allowedIds = useMemo(() => new Set(allowed?.gameIds ?? []), [allowed]);

  // Only the games unlocked by the purchased plan — higher tiers are not rendered at all.
  const planGames = useMemo(() => GAMES.filter(g => allowedIds.has(g.id)), [allowedIds]);

  const featuredGames = useMemo(() =>
    FEATURED_IDS.map(id => planGames.find(g => g.id === id)!).filter(Boolean),
    [planGames]
  );

  const visibleCategories = useMemo(() =>
    CATEGORIES.filter(c => c.key === "all" || planGames.some(g => g.category === c.key)),
    [planGames]
  );

  const filteredGames = useMemo(() => {
    let result = planGames;
    if (activeCategory !== "all") {
      result = result.filter(g => g.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.categoryLabel.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [planGames, activeCategory, searchQuery]);

  const hasCasinoVisible = filteredGames.some(g => g.isCasino);

  const handleSelect = (game: Game) => {
    setSelectedGame(prev => prev?.id === game.id ? null : game);
  };

  const handleContinue = async () => {
    if (!selectedGame) return;

    console.info("[GameSelection] Game selected:", {
      gameId: selectedGame.id,
      gameName: selectedGame.name,
      plan: allowed?.plan ?? null,
      inAllowedList: allowedIds.has(selectedGame.id),
    });

    const source = localStorage.getItem("as_source") || "Direct";

    // Use ONLY the authenticated email for all DB and CRM operations — never fall back to
    // the as_application / as_lead blobs which may contain a different user's data.
    const userEmail = getOnboardingEmail();

    localStorage.setItem("selectedGameTemplate", selectedGame.id);
    localStorage.setItem("selectedGameCategory", selectedGame.category);
    localStorage.setItem("selectedGameTitle", selectedGame.name);
    localStorage.setItem("as_game_selection", JSON.stringify({
      selectedGameType: selectedGame.name,
      gameCategory: selectedGame.categoryLabel,
      templateName: selectedGame.name,
    }));

    sendGameSelectionToCRM({
      clientName: "",
      email: userEmail,
      phone: "",
      selectedGameType: selectedGame.name,
      gameCategory: selectedGame.categoryLabel,
      templateName: selectedGame.name,
      source,
    });

    // Persist game selection and mark it in customer_enrollment (source of truth for route guards)
    if (userEmail) {
      await Promise.all([
        updateOnboarding(userEmail, {
          game_selection_completed: true,
          selected_game: selectedGame.name,
        }).catch(() => {}),
        markGameSelected(userEmail).catch(() => {}),
        updateEnrollmentFields(userEmail, { game_type: selectedGame.name, source }).catch(() => {}),
      ]);
      queryClient.invalidateQueries({ queryKey: ["onboardingProgress", userEmail] });
    }
    localStorage.setItem("appSquadGameSelected", "true");

    navigate("/onboarding/customization");
    window.scrollTo({ top: 0 });
  };

  // Plan lookup in progress (route guards ensure email/auth before this page renders)
  if (allowedLoading || !allowed) {
    return (
      <div style={{ minHeight: "100vh", background: "#050507", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "rgba(255,255,255,0.6)", fontFamily: "'Inter'", fontSize: 14 }}>
        <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> Loading your plan…
      </div>
    );
  }

  // Redirecting states (no enrollment / payment incomplete) — handled in the effect above
  if (allowed.status === 404 || allowed.status === 402) {
    return (
      <div style={{ minHeight: "100vh", background: "#050507", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "rgba(255,255,255,0.6)", fontFamily: "'Inter'", fontSize: 14 }}>
        <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> Redirecting…
      </div>
    );
  }

  // Configuration / access errors: missing or invalid plan, no games mapped, server errors
  if (allowed.status !== 200 || !allowed.gameIds || allowed.gameIds.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#050507", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{
          maxWidth: 480, textAlign: "center", padding: "40px 32px", borderRadius: 18,
          background: "hsl(226 32% 7%)", border: "1px solid rgba(245,158,11,0.25)",
        }}>
          <AlertTriangle style={{ width: 32, height: 32, color: "hsl(38 90% 55%)", margin: "0 auto 16px" }} />
          <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.92)", marginBottom: 10 }}>
            We can't load your game templates
          </h2>
          <p style={{ fontFamily: "'Inter'", fontSize: 13.5, lineHeight: 1.65, color: "rgba(255,255,255,0.5)" }}>
            {allowed.message || "Your purchased plan could not be verified. Please contact support and we'll get this fixed right away."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: selectedGame ? 140 : 60, position: "relative", background: "#050507" }}>
      {/* BG grid */}
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 0", position: "relative", zIndex: 1 }}>

        {/* Step progress */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 48 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  background: i === 0 ? "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))" : "transparent",
                  border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: i === 0 ? "white" : "rgba(255,255,255,0.3)",
                }}>
                  {i === 0 ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : i + 1}
                </div>
                <span style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "hsl(35 90% 62%)" : "rgba(255,255,255,0.25)", marginTop: 5, whiteSpace: "nowrap" }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 64, height: 1, margin: "0 8px 20px", background: i === 0 ? "hsl(35 90% 55% / 0.4)" : "rgba(255,255,255,0.07)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 56px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 99, marginBottom: 20,
            background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.18)",
          }}>
            <Gamepad2 style={{ width: 13, height: 13, color: "#00D4FF" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#00D4FF" }}>
              Client Portal — Game Selection
            </span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 16, color: "rgba(255,255,255,0.95)" }}>
            Choose Your Game Template
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>
            Select the mobile game category that best fits your brand, audience, and app ownership goals.
          </p>
          <p style={{ fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.28)" }}>
            You can preview templates, compare categories, and select the game direction you want App Squad to customize.
          </p>
        </div>

        {/* ── Featured Section ── */}
        {featuredGames.length > 0 && (
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <Sparkles style={{ width: 16, height: 16, color: "#00D4FF" }} />
            <span style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Featured Templates</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)", marginLeft: 8 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {featuredGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                isSelected={selectedGame?.id === game.id}
                isFeatured
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
        )}

        {/* ── Search + Filters ── */}
        <div style={{ marginBottom: 28 }}>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: 420, marginBottom: 18 }}>
            <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 40px 11px 42px",
                borderRadius: 11,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.85)",
                fontFamily: "'Inter'",
                fontSize: 13,
                outline: "none",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 2, color: "rgba(255,255,255,0.35)", display: "flex" }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {visibleCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  fontFamily: "'Inter'",
                  fontSize: 12,
                  fontWeight: activeCategory === cat.key ? 600 : 400,
                  cursor: "pointer",
                  border: activeCategory === cat.key
                    ? "1px solid rgba(0,212,255,0.45)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: activeCategory === cat.key
                    ? "rgba(0,212,255,0.1)"
                    : "rgba(255,255,255,0.03)",
                  color: activeCategory === cat.key
                    ? "#00D4FF"
                    : "rgba(255,255,255,0.45)",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <div style={{ marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Inter'", fontSize: 12, color: "rgba(255,255,255,0.28)" }}>
            {filteredGames.length} template{filteredGames.length !== 1 ? "s" : ""} available
          </span>
          {selectedGame && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 style={{ width: 13, height: 13, color: "hsl(38 90% 62%)" }} />
              <span style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 500, color: "hsl(38 90% 62%)" }}>
                {selectedGame.name}
              </span>
            </div>
          )}
        </div>

        {/* Casino compliance banner */}
        <AnimatePresence>
          {hasCasinoVisible && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                padding: "14px 18px", borderRadius: 12, marginBottom: 20,
                background: "rgba(109,7,26,0.1)", border: "1px solid rgba(109,7,26,0.25)",
              }}
            >
              <Shield style={{ width: 16, height: 16, color: "rgba(255,120,120,0.8)", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.6, color: "rgba(255,200,200,0.7)", margin: 0 }}>
                <strong style={{ color: "rgba(255,180,180,0.9)" }}>Casino-Style Templates Notice:</strong> Casino-style templates are entertainment-only and do not include real-money gambling, wagering, cash prizes, sweepstakes, or regulated gaming functionality.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── All Templates Grid ── */}
        {filteredGames.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "rgba(255,255,255,0.25)" }}>
            <Gamepad2 style={{ width: 36, height: 36, margin: "0 auto 14px", opacity: 0.3 }} />
            <p style={{ fontFamily: "'Inter'", fontSize: 14 }}>No templates match your search</p>
          </div>
        ) : (
          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  isSelected={selectedGame?.id === game.id}
                  onSelect={handleSelect}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Selected Template Panel ── */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              background: "rgba(8,8,16,0.95)",
              backdropFilter: "blur(24px)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.8)",
              padding: "20px 24px",
            }}
          >
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <GameIcon emoji={selectedGame.emoji} gradient={selectedGame.gradient} size={52} />

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>Selected Template</div>
                <div style={{ fontFamily: "'Space Grotesk'", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.92)" }}>{selectedGame.name}</div>
                <div style={{ fontFamily: "'Inter'", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Category: {selectedGame.categoryLabel}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Next Step</div>
                <div style={{ fontFamily: "'Inter'", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                  Customize your app name, colors, logo, audience, and monetization preferences.
                </div>
              </div>

              <button
                onClick={handleContinue}
                style={{
                  padding: "14px 28px",
                  borderRadius: 12,
                  fontFamily: "'Space Grotesk'",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  border: "none",
                  background: "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)",
                  color: "#050505",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 0 40px rgba(245,158,11,0.3)",
                  whiteSpace: "nowrap" as const,
                  flexShrink: 0,
                }}
              >
                Continue To Customization
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
