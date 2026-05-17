import { motion } from "framer-motion";
import { Link } from "wouter";
import { Play, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const BULLETS = [
  "The specific mechanics of how free mobile games generate revenue through ads and in-app purchases.",
  "Why reskinning proven game mechanics is faster and more reliable than inventing new ones.",
  "How treating a mobile app as a digital asset can create long-term brand equity.",
  "The exact technical framework App Squad uses to deploy apps to the iOS and Android stores.",
  "The requirements and timeline for launching your own branded game within the next 90 days.",
];

export default function Training() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-4rem)] flex flex-col py-16"
    >
      <div className="container mx-auto px-4 max-w-4xl flex-1 flex flex-col">
        <div className="text-center mb-12">
          <span className="inline-block text-primary font-semibold tracking-widest uppercase text-xs mb-5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            Free Training
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5">
            See How Mobile Game Apps Are{" "}
            <span className="gradient-text">Built, Branded, and Monetized</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A practical walkthrough of the App Squad development and launch process.
          </p>
        </div>

        {/* Video Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative aspect-video glass rounded-2xl mb-12 overflow-hidden group cursor-pointer"
          data-testid="video-placeholder"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="absolute inset-0 grid-bg opacity-30" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping scale-150 opacity-30" />
              <div className="relative w-20 h-20 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center shadow-2xl glow-blue group-hover:scale-110 transition-transform">
                <Play className="w-9 h-9 ml-1 text-white" fill="white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Free Training Video</p>
          </div>
        </motion.div>

        {/* Bullets */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-8 md:p-10 mb-10"
        >
          <h3 className="text-xl font-bold mb-7">In this training you will discover:</h3>
          <ul className="space-y-5">
            {BULLETS.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="flex items-start gap-4"
                data-testid={`bullet-${i}`}
              >
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-relaxed text-sm">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <div className="text-center mb-16">
          <Link href="/apply">
            <Button
              size="lg"
              className="h-13 px-10 text-base font-semibold glow-blue hover:glow-blue transition-all"
              data-testid="button-apply-training"
            >
              Apply To Launch Your App
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-auto pt-8 border-t border-white/[0.06] text-center">
          <p className="text-xs text-muted-foreground/50 italic">
            App results depend on marketing, user engagement, platform approval, and other factors outside of App Squad's control. We do not guarantee income, downloads, rankings, or profits.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
