import { motion } from "framer-motion";
import { Smartphone, Code2, Banknote, PlayCircle, ShieldCheck, Gamepad2, Settings } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-serif text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
              >
                Launch Your Own <br />
                <span className="text-primary italic">Custom Mobile Game</span> <br />
                App Without Coding
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl"
              >
                App Squad helps aspiring entrepreneurs build, brand, and launch mobile game apps designed for app store monetization through ads, upgrades, and digital engagement.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link href="/training">
                  <Button size="lg" className="h-14 px-8 text-lg font-medium shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:shadow-[0_0_60px_-10px_hsl(var(--primary))] transition-shadow">
                    Watch Free Training
                    <PlayCircle className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Abstract Phone Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative w-[320px] h-[640px] mx-auto border-[8px] border-white/10 rounded-[3rem] bg-card p-4 shadow-2xl overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/5 before:to-transparent">
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
                  <div className="w-32 h-6 bg-white/10 rounded-b-xl" />
                </div>
                <div className="h-full flex flex-col gap-4 pt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Gamepad2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="w-24 h-4 rounded-full bg-white/10 mb-2" />
                      <div className="w-16 h-3 rounded-full bg-white/5" />
                    </div>
                  </div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-24 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-card/50 border-y border-white/5">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Smartphone, title: "Own a Digital Asset", desc: "Build equity in a real digital property that lives on the App Store." },
              { icon: Code2, title: "No Coding Required", desc: "We handle the technical heavy lifting while you focus on the brand." },
              { icon: Banknote, title: "Monetization-Ready", desc: "Pre-integrated with leading ad networks and in-app purchase systems." }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Card className="bg-background border-white/5 hover:border-primary/50 transition-colors h-full">
                  <CardContent className="pt-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="font-serif text-4xl font-bold mb-4">The Launch Process</h2>
            <p className="text-muted-foreground">Four simple steps to go from concept to published game on the App Store.</p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 hidden lg:block" />
            <div className="grid lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
              {[
                { step: "01", title: "Watch Training", desc: "Learn the fundamentals of the mobile game business model." },
                { step: "02", title: "Apply", desc: "Submit your application to ensure we're a mutual fit." },
                { step: "03", title: "Build Your App", desc: "Customize your game type, brand identity, and monetization." },
                { step: "04", title: "Launch", desc: "We deploy your game to the iOS App Store and Google Play." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-card border border-white/10 flex items-center justify-center text-2xl font-serif font-bold text-primary mb-6 group-hover:scale-110 group-hover:border-primary/50 transition-all shadow-xl">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-24 bg-card/50 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <Settings className="w-8 h-8 text-primary mb-4" />
              <h4 className="font-bold mb-2">Custom App Development</h4>
              <p className="text-sm text-muted-foreground">High-quality native-feeling frameworks optimized for performance.</p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-8 h-8 text-primary mb-4" />
              <h4 className="font-bold mb-2">App Store Guidance</h4>
              <p className="text-sm text-muted-foreground">Full support through Apple and Google's review processes.</p>
            </div>
            <div className="flex flex-col items-center">
              <Banknote className="w-8 h-8 text-primary mb-4" />
              <h4 className="font-bold mb-2">Monetization Support</h4>
              <p className="text-sm text-muted-foreground">Ad networks and in-app purchase systems properly configured.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Footer */}
      <footer className="py-12 border-t border-white/10 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground/60 italic max-w-3xl mx-auto">
            Disclaimer: App results depend on marketing, user engagement, platform approval, and other factors outside of App Squad's control. We do not guarantee income, downloads, rankings, or profits. The examples shown are for illustrative purposes. Building a business requires risk, effort, and capital.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}