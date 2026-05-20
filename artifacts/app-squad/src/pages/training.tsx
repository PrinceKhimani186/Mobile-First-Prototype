import { motion } from "framer-motion";
import { Link } from "wouter";
import { Play, CheckCircle, ArrowRight, ShieldCheck, Clock, Users } from "lucide-react";
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
      className="min-h-[calc(100vh-4rem)] flex flex-col py-16 relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(217_91%_60%_/_0.08)_0%,transparent_60%)]" />
      <div className="container mx-auto px-4 max-w-4xl flex-1 flex flex-col relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block text-primary font-semibold tracking-widest uppercase text-xs mb-5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_15px_-3px_hsl(217_91%_60%_/_0.2)]">
            Free Training
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
            See How Mobile Game Apps Are{" "}
            <span className="gradient-text block mt-2">Built, Branded, and Monetized</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            A practical walkthrough of the App Squad development and launch process.
          </p>
        </div>

        {/* Video Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative w-full aspect-video glass rounded-3xl mb-16 overflow-hidden group cursor-pointer border-2 border-white/10 shadow-2xl min-h-[400px]"
          data-testid="video-placeholder"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background/80 to-accent/15" />
          <div className="absolute inset-0 grid-bg opacity-40 mix-blend-overlay" />
          
          {/* Mini Cards */}
          <div className="absolute top-6 left-6 glass px-3 py-1.5 rounded-lg border-white/20 text-xs font-bold flex items-center gap-1.5 z-20 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400"/>
            HD Quality
          </div>
          <div className="absolute top-6 right-6 glass px-3 py-1.5 rounded-lg border-white/20 text-xs font-bold flex items-center gap-1.5 z-20 backdrop-blur-md">
            <Clock className="w-4 h-4 text-primary"/>
            45 min
          </div>
          <div className="absolute bottom-6 left-6 glass px-4 py-2 rounded-xl border-white/20 text-sm font-medium flex items-center gap-2 z-20 backdrop-blur-md shadow-lg">
            <Users className="w-4 h-4 text-accent"/>
            1,234 entrepreneurs watched this
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping scale-[2] opacity-40" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping scale-[1.5] opacity-60" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
              <div className="relative w-24 h-24 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center shadow-[0_0_40px_hsl(217_91%_60%_/_0.6)] group-hover:scale-110 transition-all duration-300 z-10">
                <Play className="w-10 h-10 ml-1.5 text-white" fill="white" />
              </div>
            </div>
            <p className="text-base text-white/80 font-bold tracking-wide uppercase">Play Training Video</p>
          </div>
        </motion.div>

        {/* Bullets */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-3xl p-8 md:p-12 mb-12 border-white/10"
        >
          <h3 className="text-2xl font-bold mb-8">In this training you will discover:</h3>
          <div className="border-l-2 border-primary/30 pl-6 space-y-8">
            {BULLETS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="flex items-start gap-5 relative"
                data-testid={`bullet-${i}`}
              >
                <div className="absolute -left-[45px] top-0 bg-background w-6 h-6 flex items-center justify-center">
                   <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20" />
                </div>
                <span className="text-xl font-black text-primary/80 shrink-0 min-w-[2.5rem] mt-0.5">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-foreground/90 leading-relaxed text-lg">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-3xl p-10 text-center mb-16 border-2 border-primary/20 shadow-[0_0_30px_-5px_hsl(217_91%_60%_/_0.15)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-3">Ready to Start?</h3>
            <p className="text-muted-foreground mb-8 text-lg">Application takes less than 3 minutes to complete.</p>
            <Link href="/apply">
              <Button
                size="lg"
                className="btn-primary h-14 px-10 text-base font-semibold rounded-xl text-white w-full md:w-auto"
                data-testid="button-apply-training"
              >
                Apply To Launch Your App
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="mt-auto pt-8 border-t border-white/[0.06] text-center">
          <p className="text-xs text-muted-foreground/50 italic max-w-3xl mx-auto">
            App results depend on marketing, user engagement, platform approval, and other factors outside of App Squad's control. We do not guarantee income, downloads, rankings, or profits.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
