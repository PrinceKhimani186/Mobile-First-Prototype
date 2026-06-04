import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Gamepad2, DollarSign, Palette, Rocket, CreditCard,
  CheckCircle2, Phone, ArrowRight, Calendar, Clock, Shield
} from "lucide-react";

const CALENDLY_URL = "https://calendly.com/appguyofficial/30min";

const COVER_ITEMS = [
  {
    icon: Gamepad2,
    title: "App Types",
    desc: "Explore which mobile game category best fits your goals and audience.",
  },
  {
    icon: DollarSign,
    title: "Monetization Structure",
    desc: "Review how ads, in-app purchases, and upgrades can be prepared inside your app.",
  },
  {
    icon: Palette,
    title: "Branding Process",
    desc: "Discuss your app name, colors, logo, target audience, and overall creative direction.",
  },
  {
    icon: Rocket,
    title: "Launch Options",
    desc: "Walk through publishing support, app store preparation, and launch checklist.",
  },
  {
    icon: CreditCard,
    title: "Pricing Plans",
    desc: "Review available payment options and package recommendations.",
  },
];

const TRUST_ITEMS = [
  "No coding required",
  "Custom-branded game app",
  "App store launch guidance",
  "Monetization setup support",
  "Clear next steps before you buy",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function ScheduleCall() {
  useEffect(() => {
    const id = "calendly-widget-script";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-[calc(100vh-4rem)] relative overflow-hidden"
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,hsl(217_85%_50%_/_0.06)_0%,transparent_70%)]" />

      <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
            <Phone className="w-3.5 h-3.5" />
            Strategy Call
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight tracking-tight">
            Build Your App<br />
            <span className="gradient-text">Launch Strategy</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            On this call, we'll walk through your app idea, game options, monetization structure, branding direction, launch options, and pricing plans.
          </p>
        </motion.div>

        {/* Two-column layout: Calendly + Trust */}
        <div className="grid lg:grid-cols-5 gap-8 mb-20">

          {/* Calendly embed — spans 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-3 glass rounded-[2rem] border border-white/[0.08] overflow-hidden shadow-[0_0_60px_-20px_hsl(217_85%_50%_/_0.12)]"
          >
            {/* Calendly inline widget */}
            <div
              className="calendly-inline-widget w-full rounded-[2rem] overflow-hidden"
              data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=0b0f14&text_color=f0f4ff&primary_color=6366f1`}
              style={{ minWidth: 320, height: 700 }}
            />
          </motion.div>

          {/* Trust panel — spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <div className="glass rounded-[2rem] border border-white/[0.08] p-8">
              <h3 className="text-lg font-bold mb-6 text-foreground">Why Book The Strategy Call?</h3>
              <ul className="flex flex-col gap-4">
                {TRUST_ITEMS.map((item, i) => (
                  <motion.li
                    key={item}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    className="flex items-center gap-3 text-sm font-medium text-foreground/80"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Continue CTA */}
            <div className="glass rounded-[2rem] border border-white/[0.08] p-8 flex flex-col gap-4">
              <p className="text-sm font-semibold text-foreground">Ready to move forward?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                After booking or if you're ready to proceed, continue to checkout to secure your build slot.
              </p>
              <a
                href="https://checkout.example.com"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-continue-checkout"
              >
                <button className="btn-primary w-full h-12 text-sm font-semibold rounded-xl text-white flex items-center justify-center gap-2">
                  Continue To Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </a>
              <p className="text-[11px] text-muted-foreground/50 text-center">
                Checkout URL will be replaced with your payment provider.
              </p>
            </div>
          </motion.div>
        </div>

        {/* What We'll Cover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">Agenda</p>
            <h2 className="text-3xl md:text-4xl font-bold">What We'll Cover</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COVER_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="glass rounded-2xl border border-white/[0.07] p-6 hover:border-primary/20 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-6 py-5 text-xs text-muted-foreground/60 leading-relaxed max-w-3xl mx-auto"
        >
          <Shield className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground/40" />
          <p>
            App Squad does not guarantee earnings, downloads, rankings, app approvals, or profits. App results depend on marketing, user engagement, platform rules, and other factors.
          </p>
        </motion.div>

      </div>
    </motion.div>
  );
}
