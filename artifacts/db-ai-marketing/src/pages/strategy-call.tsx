import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, Calendar, Phone, Zap, ArrowRight, Target, Lightbulb, Film, Crown, Rocket, Shield } from "lucide-react";
import { useLocation } from "wouter";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

const COVER_CARDS = [
  { icon: Target, title: "Brand Positioning", desc: "We'll look at how your business currently shows up online and identify positioning gaps." },
  { icon: Lightbulb, title: "Content Opportunities", desc: "We'll identify what types of AI content could create more attention for your specific audience." },
  { icon: Film, title: "Campaign Direction", desc: "We'll map out possible reels, ads, promos, shout-outs, and launch campaigns for your brand." },
  { icon: Crown, title: "Package Fit", desc: "We'll recommend the best package based on your goals, content needs, and investment range." },
  { icon: Rocket, title: "Next Steps", desc: "If it's a fit, we'll walk through contract, onboarding, down payment, and production timeline." },
];

const TRUST_ITEMS = [
  "Premium AI creative direction",
  "12-month content partnership options",
  "Built for restaurants, clubs, creators, apps, and events",
  "Strategy before production",
  "No generic content templates",
];

export default function StrategyCall() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen pt-24 pb-24" style={{ background: "hsl(345 8% 4%)" }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse at center, hsl(330 65% 40% / 0.18) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] opacity-15"
          style={{ background: "radial-gradient(ellipse at center, hsl(275 50% 35% / 0.12) 0%, transparent 65%)", filter: "blur(80px)" }} />
      </div>

      <div className="container mx-auto px-5 md:px-8 max-w-5xl relative z-10">
        {/* Header */}
        <FadeUp className="text-center mb-16 md:mb-20">
          <p className="label-text mb-5">Strategy Session</p>
          <h1 className="section-headline mb-5 max-w-3xl mx-auto leading-[1.05]">
            Book Your AI Marketing Strategy Session
          </h1>
          <p className="body-premium max-w-2xl mx-auto">
            On this call, we'll review your business, audience, goals, current content, budget range, and recommend the best AI marketing package for your brand.
          </p>
        </FadeUp>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 xl:gap-16 items-start">
          {/* Left — What we'll cover */}
          <div>
            <FadeUp>
              <h2 className="mb-8" style={{ fontFamily: "'Space Grotesk'", fontSize: 22, fontWeight: 700, letterSpacing: "-0.025em", color: "hsl(30 18% 90%)" }}>
                What We'll Cover
              </h2>
            </FadeUp>

            <div className="flex flex-col gap-4 mb-12">
              {COVER_CARDS.map((c, i) => {
                const Icon = c.icon;
                return (
                  <FadeUp key={c.title} delay={i * 0.07}>
                    <div className="flex gap-4 p-5 rounded-2xl transition-all duration-300 group"
                      style={{ background: "hsl(345 10% 6%)", border: "1px solid hsl(345 10% 10%)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "hsl(330 35% 17%)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "hsl(345 10% 10%)"}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "hsl(330 30% 11%)", border: "1px solid hsl(330 30% 19%)" }}>
                        <Icon className="w-4 h-4" style={{ color: "hsl(330 65% 60%)" }} />
                      </div>
                      <div>
                        <h3 className="mb-1" style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>{c.title}</h3>
                        <p style={{ fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.7, color: "hsl(30 8% 46%)", fontWeight: 300 }}>{c.desc}</p>
                      </div>
                    </div>
                  </FadeUp>
                );
              })}
            </div>

            {/* Why Book */}
            <FadeUp delay={0.4}>
              <div className="rounded-2xl p-6 mb-6" style={{ background: "hsl(330 20% 7%)", border: "1px solid hsl(330 30% 14%)" }}>
                <p className="label-text mb-4">Why Book The Call?</p>
                <ul className="flex flex-col gap-3">
                  {TRUST_ITEMS.map(item => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "hsl(330 65% 60%)" }} />
                      <span style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(30 12% 62%)", fontWeight: 300 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>

            {/* Disclaimer */}
            <FadeUp delay={0.5}>
              <div className="flex gap-3 p-4 rounded-xl" style={{ background: "hsl(345 10% 6%)", border: "1px solid hsl(345 10% 10%)" }}>
                <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(30 10% 40%)" }} />
                <p style={{ fontFamily: "'Inter'", fontSize: 11.5, lineHeight: 1.7, color: "hsl(30 8% 38%)", fontWeight: 300 }}>
                  D&amp;B AI Marketing Co. does not guarantee revenue, followers, views, conversions, bookings, app installs, or business results. Results depend on offer, audience, consistency, distribution, market demand, and other factors.
                </p>
              </div>
            </FadeUp>
          </div>

          {/* Right — Booking card */}
          <FadeUp delay={0.1}>
            <div className="lg:sticky lg:top-24">
              <div className="rounded-[1.75rem] p-8"
                style={{ background: "hsl(345 10% 6% / 0.9)", backdropFilter: "blur(24px)", border: "1px solid hsl(345 10% 12%)", boxShadow: "0 40px 80px -24px hsl(330 55% 30% / 0.18)" }}>
                <div className="flex flex-col items-center justify-center gap-6 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "hsl(330 30% 11%)", border: "1px solid hsl(330 30% 19%)" }}>
                    <Calendar className="w-7 h-7" style={{ color: "hsl(330 65% 60%)" }} />
                  </div>

                  <div>
                    <p className="label-text mb-2.5">Calendly Embed</p>
                    <h3 className="mb-2" style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
                      Schedule My Strategy Call
                    </h3>
                    <p style={{ fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.75, color: "hsl(30 8% 42%)", fontWeight: 300 }}>
                      Your booking widget will appear here once Calendly is connected.
                    </p>
                  </div>

                  {/* Calendly placeholder */}
                  <div className="w-full rounded-xl min-h-[200px] flex items-center justify-center"
                    style={{ background: "hsl(345 10% 5%)", border: "1px dashed hsl(345 10% 15%)" }}>
                    <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(30 8% 30%)" }}>
                      Calendly embed goes here
                    </p>
                  </div>

                  <div className="flex items-center gap-5 w-full justify-center" style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(30 10% 38%)" }}>
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" style={{ color: "hsl(330 55% 58%)" }} />
                      30 minutes
                    </span>
                    <span className="w-px h-4" style={{ background: "hsl(345 10% 14%)" }} />
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" style={{ color: "hsl(330 55% 58%)" }} />
                      Video or phone
                    </span>
                  </div>

                  <button className="btn-primary w-full h-12 text-[14px] rounded-xl flex items-center justify-center gap-2.5">
                    Schedule My Strategy Call
                    <ArrowRight className="w-4 h-4 opacity-80" />
                  </button>

                  <button
                    onClick={() => { navigate("/apply"); window.scrollTo({ top: 0 }); }}
                    className="text-[12px] transition-colors cursor-pointer"
                    style={{ fontFamily: "'Inter'", color: "hsl(30 8% 32%)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "hsl(330 55% 58%)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "hsl(30 8% 32%)")}
                  >
                    ← Complete qualifier form first
                  </button>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}
