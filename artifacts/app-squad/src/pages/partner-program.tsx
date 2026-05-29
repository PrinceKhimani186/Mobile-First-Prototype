import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, Users, Megaphone, Video, Phone, Network,
  BookOpen, Smartphone, GraduationCap, CheckCircle2, XCircle,
  Shield, Star, Handshake, BarChart3, Layers, Rocket,
  PlayCircle, CalendarCheck, Gamepad2, Palette, DollarSign,
  ChevronDown, ChevronUp, AlertTriangle,
} from "lucide-react";
import { useLocation } from "wouter";
import { sendPartnerApplicationToCRM } from "@/lib/crm";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}>
      {children}
    </motion.div>
  );
}

const WHO_CARDS = [
  { icon: Megaphone, label: "Affiliate Marketers", desc: "Digital marketers with email lists, paid traffic, or organic audiences." },
  { icon: Rocket, label: "Business Opportunity Promoters", desc: "Promoters focused on entrepreneurship, digital income, and ownership models." },
  { icon: Video, label: "Content Creators", desc: "YouTube, TikTok, Instagram, or podcast creators in the tech or business space." },
  { icon: Phone, label: "Appointment Setters", desc: "Sales professionals who book qualified calls for closing teams." },
  { icon: Network, label: "Community Builders", desc: "Discord, Facebook Group, or Slack community owners with engaged audiences." },
  { icon: BookOpen, label: "Coaches & Consultants", desc: "Business coaches advising clients on digital products and income streams." },
  { icon: Smartphone, label: "App / Tech Influencers", desc: "Creators and reviewers with audiences interested in apps, mobile, and tech." },
  { icon: GraduationCap, label: "Digital Product Educators", desc: "Educators who teach digital product creation, app development, or e-commerce." },
];

const HOW_STEPS = [
  {
    n: "01", icon: Star, label: "Apply",
    desc: "Submit your information and tell us how you plan to promote App Squad.",
  },
  {
    n: "02", icon: CheckCircle2, label: "Get Approved",
    desc: "Approved partners receive tracking links, approved messaging, and program rules.",
  },
  {
    n: "03", icon: Users, label: "Refer Leads",
    desc: "Share App Squad with people interested in mobile app ownership or digital product launches.",
  },
  {
    n: "04", icon: CalendarCheck, label: "We Close",
    desc: "App Squad handles qualification, strategy calls, agreements, onboarding, and fulfillment.",
  },
  {
    n: "05", icon: DollarSign, label: "Earn Commission",
    desc: "Partners earn commissions on verified closed sales according to the approved payout structure.",
  },
];

const WHAT_CARDS = [
  { icon: PlayCircle, label: "App Ownership Presentation", desc: "Share the App Ownership Presentation with interested leads." },
  { icon: CalendarCheck, label: "App Launch Strategy Call", desc: "Refer leads to book a complimentary App Launch Strategy Call." },
  { icon: Gamepad2, label: "Mobile Game App Templates", desc: "Promote App Squad's library of branded mobile game templates." },
  { icon: Layers, label: "Guided App Launch Process", desc: "Highlight the step-by-step guided app launch system." },
  { icon: Palette, label: "Custom-Branded Game Apps", desc: "Showcase the custom branding and identity customization process." },
  { icon: BarChart3, label: "Monetization Preparation Support", desc: "Promote monetization setup including ads and in-app purchases." },
];

const COMMISSION_CARDS = [
  { tier: "Starter Launch", label: "Starter Launch Referral", sub: "Entry-level app launch referral" },
  { tier: "Growth Launch", label: "Growth Launch Referral", sub: "Mid-tier app launch referral", featured: true },
  { tier: "App Empire", label: "App Empire Referral", sub: "Premium app launch referral" },
];

const RULES = [
  "No false income claims or earnings promises",
  "No promises of app revenue, downloads, rankings, or profits",
  "No guarantees of app store approvals",
  "No misleading testimonials or fabricated results",
  "No spam — email, DMs, comments, or otherwise",
  "No unauthorized paid ads using App Squad brand terms",
  "Must use approved marketing language only",
  "Must clearly disclose affiliate or partner relationship",
  "Must follow FTC affiliate disclosure rules",
  "Commission paid only on verified closed sales",
  "Chargebacks or refunds may affect commission eligibility",
];

const MESSAGING = [
  {
    approved: true,
    text: "App Squad helps customers explore branded mobile game app ownership through a guided launch process.",
  },
  {
    approved: true,
    text: "App Squad provides custom mobile game app development, monetization preparation, and publishing assistance.",
  },
  {
    approved: false,
    text: "You are guaranteed to make money with your app.",
  },
  {
    approved: false,
    text: "Turn $5,000 into hundreds of thousands.",
  },
];

const PROMO_OPTIONS = [
  "Email Marketing", "Social Media Organic", "Paid Ads", "YouTube / Video",
  "Podcast", "Community / Group", "Appointment Setting", "Other",
];
const AUDIENCE_OPTIONS = [
  "Entrepreneurs", "Business Owners", "Side Hustlers", "Investors",
  "Content Creators", "App/Tech Enthusiasts", "General Consumer", "Other",
];

const inputCls = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13.5,
  background: "hsl(226 32% 7%)",
  border: "1px solid hsl(224 22% 14%)",
  borderRadius: 9,
  color: "hsl(220 20% 90%)",
  outline: "none",
  width: "100%",
  padding: "12px 14px",
  transition: "border-color 0.2s",
} as React.CSSProperties;

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  ((e.target as HTMLElement).style.borderColor = "hsl(35 90% 55% / 0.5)");
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  ((e.target as HTMLElement).style.borderColor = "hsl(224 22% 14%)");

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 500, color: "hsl(218 16% 46%)", letterSpacing: "0.015em" }}>
        {label}{required && <span style={{ color: "hsl(35 90% 60%)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function PartnerProgram() {
  const [, navigate] = useLocation();
  const applyRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [promotionMethod, setPromotionMethod] = useState("");
  const [audienceType, setAudienceType] = useState("");
  const [leadVolume, setLeadVolume] = useState("");
  const [paidAds, setPaidAds] = useState("");
  const [bizOpp, setBizOpp] = useState("");
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name && email && phone && promotionMethod && audienceType && agreed;

  const scrollToApply = () => {
    applyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    sendPartnerApplicationToCRM({
      partnerName: name, email, phone, company, website,
      promotionMethod, audienceType, estimatedLeadVolume: leadVolume,
      paidAdsExperience: paidAds, bizOppExperience: bizOpp,
      reasonForPartnering: reason,
    });
    setSubmitted(true);
    window.scrollTo({ top: 0 });
  };

  const selectCls = { ...inputCls, cursor: "pointer" };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative pt-16 pb-20 px-5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
            style={{ background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.08) 0%, transparent 60%)", filter: "blur(90px)" }} />
        </div>
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7"
              style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.24)" }}>
              <Handshake className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 62%)" }} />
              <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(35 90% 66%)" }}>
                Partner Program
              </span>
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.06, marginBottom: 20 }}>
              Become An App Squad Partner
            </h1>
            <p style={{ fontFamily: "'Inter'", fontSize: 16, lineHeight: 1.75, color: "hsl(218 16% 52%)", fontWeight: 300, maxWidth: 560, margin: "0 auto 32px" }}>
              Refer aspiring entrepreneurs interested in mobile game app ownership and earn commissions when qualified referrals become App Squad clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button onClick={scrollToApply}
                className="btn-gold h-13 py-4 px-8 text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2.5 text-white">
                Apply To Become A Partner
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="h-13 py-4 px-8 text-[15px] font-medium rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 15%)", color: "hsl(218 16% 60%)" }}>
                How It Works
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <p style={{ fontFamily: "'Inter'", fontSize: 11.5, color: "hsl(218 16% 36%)", fontWeight: 300 }}>
              Commissions are paid only on qualified closed sales. No earnings are guaranteed.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHO THIS IS FOR
      ══════════════════════════════════════════ */}
      <section className="py-20 px-5">
        <div className="container mx-auto max-w-6xl">
          <FadeUp className="text-center mb-12">
            <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 12 }}>
              Who This Is For
            </p>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
              Built For Serious Referral Partners
            </h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHO_CARDS.map(({ icon: Icon, label, desc }, i) => (
              <FadeUp key={label} delay={i * 0.05}>
                <div className="rounded-2xl p-5 h-full" style={{ background: "hsl(226 32% 7%)", border: "1px solid hsl(224 22% 12%)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.2)" }}>
                    <Icon className="w-4 h-4" style={{ color: "hsl(35 90% 62%)" }} />
                  </div>
                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 6 }}>{label}</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 44%)", fontWeight: 300 }}>{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 px-5"
        style={{ background: "hsl(226 36% 5%)", borderTop: "1px solid hsl(224 22% 10%)", borderBottom: "1px solid hsl(224 22% 10%)" }}>
        <div className="container mx-auto max-w-5xl">
          <FadeUp className="text-center mb-14">
            <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 12 }}>
              The Process
            </p>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
              How The Partner Program Works
            </h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {HOW_STEPS.map(({ n, icon: Icon, label, desc }, i) => (
              <FadeUp key={label} delay={i * 0.07}>
                <div className="rounded-2xl p-5 h-full flex flex-col" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))" }}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "hsl(35 90% 55%)", textTransform: "uppercase" }}>{n}</span>
                  </div>
                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8 }}>{label}</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 44%)", fontWeight: 300 }}>{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHAT YOU CAN PROMOTE
      ══════════════════════════════════════════ */}
      <section className="py-20 px-5">
        <div className="container mx-auto max-w-5xl">
          <FadeUp className="text-center mb-12">
            <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 12 }}>
              Approved Promotions
            </p>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
              What You Can Promote
            </h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHAT_CARDS.map(({ icon: Icon, label, desc }, i) => (
              <FadeUp key={label} delay={i * 0.06}>
                <div className="rounded-2xl p-5 h-full flex items-start gap-4" style={{ background: "hsl(226 32% 7%)", border: "1px solid hsl(224 22% 12%)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "hsl(217 85% 58% / 0.1)", border: "1px solid hsl(217 85% 58% / 0.2)" }}>
                    <Icon className="w-4 h-4" style={{ color: "hsl(217 85% 68%)" }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 5 }}>{label}</p>
                    <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 44%)", fontWeight: 300 }}>{desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COMMISSION STRUCTURE
      ══════════════════════════════════════════ */}
      <section className="py-20 px-5"
        style={{ background: "hsl(226 36% 5%)", borderTop: "1px solid hsl(224 22% 10%)", borderBottom: "1px solid hsl(224 22% 10%)" }}>
        <div className="container mx-auto max-w-4xl">
          <FadeUp className="text-center mb-12">
            <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 12 }}>
              Earnings
            </p>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 14 }}>
              Partner Commission Opportunities
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "hsl(218 16% 48%)", fontWeight: 300, maxWidth: 480, margin: "0 auto" }}>
              Commission rates, payout timelines, and qualification rules are provided after partner approval.
            </p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {COMMISSION_CARDS.map(({ label, sub, featured }, i) => (
              <FadeUp key={label} delay={i * 0.07}>
                <div className="rounded-2xl p-6 h-full flex flex-col relative overflow-hidden"
                  style={{
                    background: featured ? "hsl(226 32% 9%)" : "hsl(226 32% 7%)",
                    border: featured ? "1px solid hsl(35 90% 55% / 0.35)" : "1px solid hsl(224 22% 12%)",
                    boxShadow: featured ? "0 0 40px -15px hsl(35 90% 55% / 0.25)" : "none",
                  }}>
                  {featured && (
                    <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: "hsl(35 90% 55% / 0.15)", border: "1px solid hsl(35 90% 55% / 0.3)", color: "hsl(35 90% 65%)" }}>
                      Most Popular
                    </div>
                  )}
                  <p style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 4 }}>{label}</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 40%)", fontWeight: 300, marginBottom: 20 }}>{sub}</p>
                  <div className="mt-auto p-4 rounded-xl" style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}>
                    <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 36%)", marginBottom: 5 }}>Commission</p>
                    <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 600, color: "hsl(35 90% 58%)" }}>
                      To Be Announced
                    </p>
                    <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 38%)", fontWeight: 300, marginTop: 3 }}>Approved Partner Terms</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.2}>
            <div className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(35 90% 55%)" }} />
              <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 42%)", fontWeight: 300 }}>
                Exact commission rates, payout timelines, and qualification rules are provided after partner approval. Commissions are paid only on verified closed sales. No earnings are guaranteed.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PARTNER RULES
      ══════════════════════════════════════════ */}
      <section className="py-20 px-5">
        <div className="container mx-auto max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <FadeUp>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 12 }}>
                Program Rules
              </p>
              <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.6rem, 3.5vw, 2rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 16 }}>
                Partner Rules & Compliance
              </h2>
              <p style={{ fontFamily: "'Inter'", fontSize: 13.5, lineHeight: 1.75, color: "hsl(218 16% 46%)", fontWeight: 300, marginBottom: 20 }}>
                All partners must follow these rules to maintain program access and commission eligibility. Violations may result in immediate removal and forfeiture of pending commissions.
              </p>
              <div className="flex items-center gap-2.5 p-4 rounded-xl"
                style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}>
                <Shield className="w-4 h-4 shrink-0" style={{ color: "hsl(217 85% 60%)" }} />
                <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.6, color: "hsl(218 16% 40%)", fontWeight: 300 }}>
                  Partners must clearly disclose their relationship with App Squad when promoting the program, in accordance with FTC guidelines.
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <ul className="flex flex-col gap-2.5">
                {RULES.map(rule => (
                  <li key={rule} className="flex items-start gap-3 p-3.5 rounded-xl"
                    style={{ background: "hsl(226 32% 7%)", border: "1px solid hsl(224 22% 12%)" }}>
                    <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "hsl(218 16% 36%)" }} />
                    <span style={{ fontFamily: "'Inter'", fontSize: 12.5, lineHeight: 1.55, color: "hsl(218 16% 56%)", fontWeight: 300 }}>{rule}</span>
                  </li>
                ))}
              </ul>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          APPROVED MESSAGING
      ══════════════════════════════════════════ */}
      <section className="py-20 px-5"
        style={{ background: "hsl(226 36% 5%)", borderTop: "1px solid hsl(224 22% 10%)", borderBottom: "1px solid hsl(224 22% 10%)" }}>
        <div className="container mx-auto max-w-3xl">
          <FadeUp className="text-center mb-12">
            <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 12 }}>
              Messaging Guide
            </p>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
              Approved Messaging Examples
            </h2>
          </FadeUp>
          <div className="flex flex-col gap-3">
            {MESSAGING.map(({ approved, text }, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <div className="flex items-start gap-3.5 p-4 rounded-xl"
                  style={{
                    background: approved ? "hsl(142 76% 55% / 0.05)" : "hsl(0 72% 50% / 0.05)",
                    border: `1px solid ${approved ? "hsl(142 76% 55% / 0.2)" : "hsl(0 72% 50% / 0.2)"}`,
                  }}>
                  {approved
                    ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(142 76% 55%)" }} />
                    : <XCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(0 72% 60%)" }} />
                  }
                  <div>
                    <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: approved ? "hsl(142 76% 55%)" : "hsl(0 72% 60%)", marginBottom: 5 }}>
                      {approved ? "Approved" : "Not Approved"}
                    </p>
                    <p style={{ fontFamily: "'Inter'", fontSize: 13.5, lineHeight: 1.65, color: "hsl(218 16% 62%)", fontWeight: 300 }}>
                      "{text}"
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PARTNER APPLICATION FORM
      ══════════════════════════════════════════ */}
      <section ref={applyRef} className="py-20 px-5">
        <div className="container mx-auto max-w-2xl">
          <FadeUp className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
              style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.24)" }}>
              <Star className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 62%)" }} />
              <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(35 90% 66%)" }}>
                Partner Application
              </span>
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 12 }}>
              Apply To Become A Partner
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 14, lineHeight: 1.75, color: "hsl(218 16% 48%)", fontWeight: 300, maxWidth: 420, margin: "0 auto" }}>
              Tell us about yourself and how you plan to promote App Squad. Applications are reviewed within 3–5 business days.
            </p>
          </FadeUp>

          {submitted ? (
            <FadeUp>
              <div className="rounded-2xl p-10 text-center" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(142 76% 55% / 0.25)" }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "hsl(142 76% 55% / 0.1)", border: "1px solid hsl(142 76% 55% / 0.3)" }}>
                  <CheckCircle2 className="w-6 h-6" style={{ color: "hsl(142 76% 55%)" }} />
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: "1.35rem", fontWeight: 700, marginBottom: 10 }}>Application Submitted</h3>
                <p style={{ fontFamily: "'Inter'", fontSize: 13.5, lineHeight: 1.7, color: "hsl(218 16% 48%)", fontWeight: 300 }}>
                  Thank you for applying to the App Squad Partner Program. Our team will review your application and reach out within 3–5 business days.
                </p>
              </div>
            </FadeUp>
          ) : (
            <FadeUp delay={0.08}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Card 1 — Contact */}
                <div className="rounded-2xl p-6" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
                  <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 36%)", marginBottom: 16 }}>Contact Information</p>
                  <div className="flex flex-col gap-4">
                    <Field label="Full Name" required>
                      <input type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} style={inputCls} onFocus={onFocus} onBlur={onBlur} />
                    </Field>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Email Address" required>
                        <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={inputCls} onFocus={onFocus} onBlur={onBlur} />
                      </Field>
                      <Field label="Phone Number" required>
                        <input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} style={inputCls} onFocus={onFocus} onBlur={onBlur} />
                      </Field>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Company / Brand Name">
                        <input type="text" placeholder="Your company or brand" value={company} onChange={e => setCompany(e.target.value)} style={inputCls} onFocus={onFocus} onBlur={onBlur} />
                      </Field>
                      <Field label="Website or Social Link">
                        <input type="url" placeholder="https://" value={website} onChange={e => setWebsite(e.target.value)} style={inputCls} onFocus={onFocus} onBlur={onBlur} />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Card 2 — Promotion */}
                <div className="rounded-2xl p-6" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
                  <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 36%)", marginBottom: 16 }}>Promotion Details</p>
                  <div className="flex flex-col gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Promotion Method" required>
                        <select value={promotionMethod} onChange={e => setPromotionMethod(e.target.value)} style={selectCls} onFocus={onFocus} onBlur={onBlur}>
                          <option value="">Select method</option>
                          {PROMO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </Field>
                      <Field label="Audience Type" required>
                        <select value={audienceType} onChange={e => setAudienceType(e.target.value)} style={selectCls} onFocus={onFocus} onBlur={onBlur}>
                          <option value="">Select audience</option>
                          {AUDIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Estimated Monthly Lead Volume">
                      <input type="text" placeholder="e.g. 10–50 leads per month" value={leadVolume} onChange={e => setLeadVolume(e.target.value)} style={inputCls} onFocus={onFocus} onBlur={onBlur} />
                    </Field>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Do you run paid ads?">
                        <select value={paidAds} onChange={e => setPaidAds(e.target.value)} style={selectCls} onFocus={onFocus} onBlur={onBlur}>
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Sometimes">Sometimes</option>
                        </select>
                      </Field>
                      <Field label="Promoted biz opportunities before?">
                        <select value={bizOpp} onChange={e => setBizOpp(e.target.value)} style={selectCls} onFocus={onFocus} onBlur={onBlur}>
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </Field>
                    </div>
                    <Field label="Why do you want to partner with App Squad?">
                      <textarea placeholder="Tell us about your goals, audience, and why you're a good fit..." value={reason} rows={4} onChange={e => setReason(e.target.value)}
                        style={{ ...inputCls, resize: "none" } as React.CSSProperties} onFocus={onFocus} onBlur={onBlur} />
                    </Field>
                  </div>
                </div>

                {/* Agreement */}
                <div className="rounded-2xl p-5" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
                  <div className="flex items-start gap-3 cursor-pointer" onClick={() => setAgreed(a => !a)}>
                    <div className="w-5 h-5 rounded shrink-0 mt-0.5 flex items-center justify-center transition-all"
                      style={{
                        background: agreed ? "hsl(35 90% 55%)" : "transparent",
                        border: `1.5px solid ${agreed ? "hsl(35 90% 55%)" : "hsl(224 22% 22%)"}`,
                        marginTop: 2,
                      }}>
                      {agreed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <p style={{ fontFamily: "'Inter'", fontSize: 12.5, lineHeight: 1.65, color: "hsl(218 16% 52%)", fontWeight: 300 }}>
                      I agree not to make income claims, earnings guarantees, app approval guarantees, download guarantees, ranking guarantees, or misleading representations when promoting App Squad. <span style={{ color: "hsl(35 90% 60%)" }}>*</span>
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={!canSubmit}
                  className="btn-gold h-13 py-4 text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2.5 text-white"
                  style={{ opacity: canSubmit ? 1 : 0.32, cursor: canSubmit ? "pointer" : "not-allowed" }}>
                  Submit Partner Application
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </FadeUp>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DISCLAIMER
      ══════════════════════════════════════════ */}
      <section className="py-10 px-5" style={{ borderTop: "1px solid hsl(224 22% 10%)" }}>
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-start gap-3 p-5 rounded-2xl"
            style={{ background: "hsl(226 28% 5%)", border: "1px solid hsl(224 22% 10%)" }}>
            <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(218 16% 30%)" }} />
            <p style={{ fontFamily: "'Inter'", fontSize: 11.5, lineHeight: 1.7, color: "hsl(218 16% 32%)", fontWeight: 300 }}>
              App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, customer results, affiliate earnings, or return on investment. Partner commissions are paid only according to approved partner terms and qualified closed sales. Partners must clearly disclose their relationship with App Squad when promoting the program.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
