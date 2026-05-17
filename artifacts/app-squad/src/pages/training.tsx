import { motion } from "framer-motion";
import { Link } from "wouter";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Training() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[calc(100vh-4rem)] flex flex-col py-16"
    >
      <div className="container mx-auto px-4 max-w-4xl flex-1 flex flex-col">
        <div className="text-center mb-12">
          <span className="text-primary font-medium tracking-wider uppercase text-sm mb-4 block">Exclusive Training</span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-6">
            See How Mobile Game Apps Are Built, Branded, and Monetized
          </h1>
        </div>

        {/* Video Player Mock */}
        <div className="relative aspect-video bg-card border border-white/10 rounded-2xl shadow-2xl mb-12 group overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
          <button className="relative z-10 w-24 h-24 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center hover:scale-110 hover:bg-primary transition-all shadow-[0_0_40px_-10px_hsl(var(--primary))]">
            <Play className="w-10 h-10 ml-2" fill="currentColor" />
          </button>
        </div>

        <div className="bg-card/50 border border-white/5 rounded-2xl p-8 md:p-12 mb-12">
          <h3 className="text-xl font-bold mb-6">In this training you will discover:</h3>
          <ul className="space-y-4">
            {[
              "The specific mechanics of how free mobile games generate revenue through ads and in-app purchases.",
              "Why reskinning proven game mechanics is faster and more reliable than inventing new ones.",
              "How treating a mobile app as a digital asset can create long-term brand equity.",
              "The exact technical framework App Squad uses to deploy apps to the iOS and Android stores.",
              "The requirements and timeline for launching your own branded game within the next 90 days."
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="text-muted-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center mb-16">
          <Link href="/apply">
            <Button size="lg" className="h-16 px-12 text-lg font-medium w-full md:w-auto shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:shadow-[0_0_60px_-10px_hsl(var(--primary))] transition-shadow">
              Apply To Launch Your App
            </Button>
          </Link>
        </div>

        <div className="mt-auto pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-muted-foreground/60 italic">
            App results depend on marketing, user engagement, platform approval, and other factors outside of App Squad's control. We do not guarantee income, downloads, rankings, or profits.
          </p>
        </div>
      </div>
    </motion.div>
  );
}