import { motion } from "framer-motion";
import { Smartphone, Code2, TrendingUp, PlayCircle, ShieldCheck, BarChart3, ArrowRight, Sparkles, Layers, Rocket } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen"
    >
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32 grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_60%_40%,hsl(217_91%_60%_/_0.12)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_70%,hsl(195_88%_52%_/_0.07)_0%,transparent_60%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wide mb-8"
              >
                <Sparkles className="w-3 h-3" />
                Mobile Game App Development Studio
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
              >
                Launch Your Own{" "}
                <span className="gradient-text">Custom Mobile Game App</span>{" "}
                Without Coding
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl"
              >
                App Squad helps aspiring entrepreneurs build, brand, and launch mobile game apps designed for app store monetization through ads, upgrades, and digital engagement.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/training">
                  <Button
                    size="lg"
                    className="h-12 px-7 text-base font-semibold bg-primary hover:bg-primary/90 glow-blue transition-all"
                    data-testid="button-watch-training-hero"
                  >
                    Watch Free Training
                    <PlayCircle className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/apply">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-12 px-7 text-base font-medium border border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                    data-testid="button-apply-hero"
                  >
                    Apply Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="absolute w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
              <div className="absolute w-48 h-48 rounded-full bg-accent/8 blur-2xl translate-x-20 translate-y-10" />

              <div className="relative w-[280px] h-[580px] rounded-[2.8rem] border border-white/10 bg-card overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
                <div className="absolute top-0 inset-x-0 flex justify-center pt-2">
                  <div className="w-28 h-5 bg-background rounded-b-2xl" />
                </div>

                <div className="p-5 pt-10 h-full flex flex-col gap-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="h-3 w-20 bg-foreground/10 rounded-full mb-1.5" />
                      <div className="h-2 w-14 bg-foreground/5 rounded-full" />
                    </div>
                  </div>

                  {[
                    { color: "from-primary/20 to-primary/5", h: "h-28" },
                    { color: "from-accent/15 to-accent/5", h: "h-20" },
                    { color: "from-purple-500/15 to-purple-500/5", h: "h-16" },
                    { color: "from-primary/10 to-transparent", h: "h-24" },
                  ].map((block, i) => (
                    <div
                      key={i}
                      className={`w-full ${block.h} rounded-2xl bg-gradient-to-br ${block.color} border border-white/[0.06]`}
                    />
                  ))}

                  <div className="mt-auto flex gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-12 rounded-xl border border-white/[0.06] ${i === 1 ? "bg-primary/20" : "bg-white/[0.03]"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 border-y border-white/[0.06]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Layers,
                title: "Own a Digital Asset",
                desc: "Build equity in a real digital property that lives on the App Store — a product you can grow, sell, or license.",
                color: "text-primary",
                bg: "bg-primary/10 border-primary/20",
              },
              {
                icon: Code2,
                title: "No Coding Required",
                desc: "We handle the full technical stack so you can focus on brand strategy, audience, and go-to-market execution.",
                color: "text-accent",
                bg: "bg-accent/10 border-accent/20",
              },
              {
                icon: TrendingUp,
                title: "Monetization-Ready",
                desc: "Pre-integrated with leading ad networks and in-app purchase systems, ready for your first monetization event.",
                color: "text-purple-400",
                bg: "bg-purple-500/10 border-purple-500/20",
              },
            ].map((benefit, i) => (
              <motion.div key={i} variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <div className="glass rounded-2xl p-8 h-full hover:border-white/20 transition-all group">
                  <div className={`w-12 h-12 rounded-xl border ${benefit.bg} flex items-center justify-center mb-6`}>
                    <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,hsl(217_91%_60%_/_0.05)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-20">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">The Process</p>
            <h2 className="text-4xl font-bold mb-4">From Idea to App Store</h2>
            <p className="text-muted-foreground">Four structured steps that take you from concept to published game.</p>
          </div>

          <div className="relative grid lg:grid-cols-4 gap-10 lg:gap-8">
            <div className="absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden lg:block" />
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
                <div className="relative w-16 h-16 rounded-2xl glass border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                  <item.icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-24 border-t border-white/[0.06] bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto text-center">
            {[
              { icon: Layers, title: "Custom App Development", desc: "High-quality frameworks optimized for performance across iOS and Android." },
              { icon: ShieldCheck, title: "App Store Guidance", desc: "Full support through Apple and Google's submission and review processes." },
              { icon: BarChart3, title: "Monetization Support", desc: "Ad networks and in-app purchase systems properly configured from day one." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-bold text-base mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="py-10 border-t border-white/[0.06]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground/50 italic max-w-3xl mx-auto leading-relaxed">
            Disclaimer: App results depend on marketing, user engagement, platform approval, and other factors outside of App Squad's control. We do not guarantee income, downloads, rankings, or profits. The examples shown are for illustrative purposes only. Building a business requires risk, effort, and capital.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
