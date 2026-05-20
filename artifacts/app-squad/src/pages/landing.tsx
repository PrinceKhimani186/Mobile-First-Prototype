import { motion } from "framer-motion";
import { Smartphone, Code2, TrendingUp, PlayCircle, ShieldCheck, BarChart3, ArrowRight, Sparkles, Layers, Rocket, Star, Apple, Activity, Target } from "lucide-react";
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
        {/* Cinematic ambient — subtle, directional, not flooding */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_72%_40%,hsl(217_85%_50%_/_0.09)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_35%_40%_at_15%_75%,hsl(255_70%_60%_/_0.06)_0%,transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide mb-8 shadow-[0_0_15px_-3px_hsl(217_91%_60%_/_0.2)]"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                The Mobile Game App Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.0] tracking-tight mb-6"
              >
                Launch Your Own<br />
                <span className="gradient-text block mt-2">Custom Mobile<br/>Game App</span>
                <span className="block mt-2">Without Coding</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl"
              >
                App Squad helps aspiring entrepreneurs build, brand, and launch mobile game apps designed for app store monetization through ads, upgrades, and digital engagement.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <Link href="/training">
                  <button
                    className="btn-primary h-14 px-8 text-base font-semibold rounded-xl text-white flex items-center gap-2 w-full sm:w-auto justify-center"
                    data-testid="button-watch-training-hero"
                  >
                    Watch Free Training
                    <PlayCircle className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="/apply">
                  <button
                    className="btn-ghost h-14 px-8 text-base font-medium rounded-xl text-foreground/80 flex items-center gap-2 w-full sm:w-auto justify-center"
                    data-testid="button-apply-hero"
                  >
                    Apply Now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground/80 font-medium"
              >
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]"><Apple className="w-4 h-4"/> iOS App Store</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]"><PlayCircle className="w-4 h-4"/> Google Play</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]"><Target className="w-4 h-4"/> Meta Audience Network</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]"><Activity className="w-4 h-4"/> AdMob</span>
              </motion.div>
            </div>

            {/* Phone Mockup & Floating Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:flex items-center justify-center min-h-[700px]"
            >
              {/* Focused cinematic glow — behind phone only */}
              <div className="absolute w-72 h-72 rounded-full bg-primary/12 blur-[90px]" style={{ top: '20%', left: '50%', transform: 'translateX(-50%)' }} />
              <div className="absolute w-48 h-48 rounded-full bg-purple-600/8 blur-[70px]" style={{ bottom: '15%', right: '10%' }} />

              <div className="relative w-[300px] h-[640px] rounded-[2.8rem] border border-white/12 bg-card overflow-hidden z-10 glow-hero">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-accent/10" />
                <div className="absolute top-0 inset-x-0 flex justify-center pt-3 z-20">
                  <div className="w-32 h-6 bg-background rounded-b-3xl" />
                </div>

                <div className="p-6 pt-14 h-full flex flex-col gap-4 relative z-10">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="h-3.5 w-24 bg-foreground/20 rounded-full mb-2" />
                      <div className="h-2.5 w-16 bg-foreground/10 rounded-full" />
                    </div>
                  </div>

                  {[
                    { color: "from-primary/30 to-primary/5", h: "h-32" },
                    { color: "from-accent/25 to-accent/5", h: "h-24" },
                    { color: "from-purple-500/25 to-purple-500/5", h: "h-20" },
                    { color: "from-blue-400/20 to-transparent", h: "h-28" },
                    { color: "from-emerald-400/15 to-transparent", h: "h-20" },
                  ].map((block, i) => (
                    <div
                      key={i}
                      className={`w-full ${block.h} rounded-2xl bg-gradient-to-br ${block.color} border border-white/[0.08] backdrop-blur-sm`}
                    />
                  ))}

                  <div className="mt-auto flex gap-3 pb-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-14 rounded-xl border border-white/[0.08] ${i === 1 ? "bg-primary/30 shadow-[0_0_15px_-3px_hsl(217_91%_60%_/_0.5)]" : "bg-white/[0.05]"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Stat Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-32 -left-12 glass p-4 rounded-2xl border-white/20 shadow-xl z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">12,847</div>
                    <div className="text-xs text-muted-foreground font-medium">Apps Launched</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-48 -right-16 glass p-4 rounded-2xl border-white/20 shadow-xl z-20"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1 text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <div className="text-lg font-bold">4.8 Rating</div>
                  <div className="text-xs text-muted-foreground font-medium">Average App Store</div>
                </div>
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-1/2 -right-8 glass px-4 py-3 rounded-2xl border-white/20 shadow-xl z-20 flex items-center gap-2"
              >
                 <Apple className="w-5 h-5 text-foreground"/>
                 <span className="text-muted-foreground text-sm">+</span >
                 <PlayCircle className="w-5 h-5 text-foreground"/>
                 <span className="font-bold ml-1">Native</span>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 border-y border-white/[0.06] relative">
        <div className="container mx-auto px-4">
           <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">Why App Squad</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Advantage in the App Market</h2>
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
                title: "Own a Digital Asset",
                desc: "Build equity in a real digital property that lives on the App Store — a product you can grow, sell, or license.",
                detail: "Unlike renting server space or social media platforms, this is intellectual property you completely control.",
                color: "text-primary",
                bg: "bg-primary/10 border-primary/20",
                hoverBorder: "hover:border-primary/50 hover:shadow-[0_0_30px_-5px_hsl(217_91%_60%_/_0.3)]"
              },
              {
                icon: Code2,
                title: "No Coding Required",
                desc: "We handle the full technical stack so you can focus on brand strategy, audience, and go-to-market execution.",
                detail: "From game mechanics to database architecture, our engineers deploy proven systems tailored to your brand.",
                color: "text-accent",
                bg: "bg-accent/10 border-accent/20",
                hoverBorder: "hover:border-accent/50 hover:shadow-[0_0_30px_-5px_hsl(195_88%_52%_/_0.3)]"
              },
              {
                icon: TrendingUp,
                title: "Monetization-Ready",
                desc: "Pre-integrated with leading ad networks and in-app purchase systems, ready for your first monetization event.",
                detail: "We configure AdMob, Meta, and native app store payments so you can generate revenue from day one.",
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

      {/* How It Works */}
      <section className="py-32 relative overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,hsl(217_91%_60%_/_0.08)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-20">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">The Process</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">From Idea to App Store</h2>
            <p className="text-muted-foreground text-lg">Four structured steps that take you from concept to published game.</p>
          </div>

          <div className="relative grid lg:grid-cols-4 gap-12 lg:gap-8 max-w-5xl mx-auto">
            <div className="absolute top-10 left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-primary via-accent to-purple-500 rounded-full hidden lg:block opacity-50 overflow-hidden">
               <motion.div 
                 className="h-full w-1/3 bg-white/50 blur-sm"
                 animate={{ x: ['-100%', '300%'] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               />
            </div>
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
                <div className="relative w-20 h-20 rounded-2xl glass border-2 border-white/20 flex items-center justify-center mb-6 group-hover:border-primary/60 group-hover:bg-primary/10 group-hover:shadow-[0_0_25px_-5px_hsl(217_91%_60%_/_0.5)] transition-all z-10 bg-card">
                  <item.icon className="w-8 h-8 text-primary" />
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center ring-4 ring-background shadow-lg">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden border-t border-white/[0.05]">
        {/* Very subtle glow — not flooding */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,hsl(217_85%_50%_/_0.07)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto glass rounded-[2.5rem] p-12 md:p-16 text-center border border-white/[0.08] shadow-[0_0_60px_-20px_hsl(217_85%_50%_/_0.15),0_1px_0_0_hsl(220_20%_97%_/_0.05)_inset]">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-5">Get Started</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">Ready To Explore<br/>Your App Idea?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              See how App Squad helps entrepreneurs launch custom-branded mobile game apps without coding.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/training">
                <button className="btn-primary h-13 px-8 text-base font-semibold rounded-xl text-white flex items-center gap-2 w-full sm:w-auto justify-center" data-testid="button-cta-training">
                  Watch Free Training
                  <PlayCircle className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/apply">
                <button className="btn-ghost h-13 px-8 text-base font-medium rounded-xl text-foreground/80 flex items-center gap-2 w-full sm:w-auto justify-center" data-testid="button-cta-apply">
                  Apply To Launch Your App
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer & Footer */}
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
