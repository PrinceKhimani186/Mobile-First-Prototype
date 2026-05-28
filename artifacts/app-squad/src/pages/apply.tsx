import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { useLocation } from "wouter";

const inputStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  background: "hsl(226 32% 8%)",
  border: "1px solid hsl(224 22% 16%)",
  borderRadius: 10,
  color: "hsl(220 20% 97%)",
  outline: "none",
  width: "100%",
  padding: "13px 16px",
  transition: "border-color 0.2s",
} as React.CSSProperties;

const labelStyle = {
  fontFamily: "'Inter'",
  fontSize: 12,
  fontWeight: 500,
  color: "hsl(218 16% 52%)",
  letterSpacing: "0.015em",
  display: "block",
  marginBottom: 7,
} as React.CSSProperties;

function TextInput({ label, type = "text", placeholder, value, onChange }: {
  label: string; type?: string; placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        style={inputStyle}
        onFocus={e => ((e.target as HTMLInputElement).style.borderColor = "hsl(35 90% 55% / 0.55)")}
        onBlur={e => ((e.target as HTMLInputElement).style.borderColor = "hsl(224 22% 16%)")} />
    </div>
  );
}

function RadioCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl w-full text-left transition-all cursor-pointer"
      style={{
        fontFamily: "'Inter'", fontSize: 13.5, fontWeight: selected ? 500 : 400,
        background: selected ? "hsl(35 90% 55% / 0.1)" : "hsl(226 32% 8%)",
        border: `1px solid ${selected ? "hsl(35 90% 55% / 0.4)" : "hsl(224 22% 15%)"}`,
        color: selected ? "hsl(35 90% 68%)" : "hsl(218 16% 58%)",
      }}>
      <span className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
        style={{ border: `2px solid ${selected ? "hsl(35 90% 58%)" : "hsl(224 22% 26%)"}`, background: selected ? "hsl(35 90% 55%)" : "transparent" }} />
      {label}
    </button>
  );
}

const GOALS = [
  "Digital asset ownership", "Side business opportunity", "App monetization",
  "Building a brand", "Learning the app business", "Other",
];
const GAMES = [
  "Puzzle Game", "Word Game", "Casino Slots Style Game", "Arcade Game",
  "Trivia Game", "Kids Educational Game", "Racing Game", "Not sure yet",
];
const BUDGETS = ["Under $500", "$500–$1,000", "$1,000–$3,000", "$3,000–$5,000", "$5,000+"];
const TIMELINES = ["Immediately", "This week", "This month", "30–60 days", "Just researching"];

const STEPS = ["Contact Info", "Your Goal", "Game Style", "Budget", "Timeline", "Understanding"];

const pageVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 36 : -36 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -36 : 36 }),
};

export default function Apply() {
  const [, navigate] = useLocation();

  const savedLead = (() => {
    try { return JSON.parse(localStorage.getItem("as_lead") || "null"); } catch { return null; }
  })();
  const leadAlreadyCaptured = !!(savedLead?.name && savedLead?.email && savedLead?.phone);

  const [step, setStep] = useState(leadAlreadyCaptured ? 1 : 0);
  const [dir, setDir] = useState(1);

  const [name, setName] = useState(savedLead?.name || "");
  const [email, setEmail] = useState(savedLead?.email || "");
  const [phone, setPhone] = useState(savedLead?.phone || "");
  const [goal, setGoal] = useState("");
  const [game, setGame] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [agreed, setAgreed] = useState(false);

  const goNext = () => { setDir(1); setStep(s => s + 1); };
  const goPrev = () => {
    if (leadAlreadyCaptured && step === 1) {
      navigate("/presentation");
      window.scrollTo({ top: 0 });
    } else {
      setDir(-1);
      setStep(s => s - 1);
    }
  };

  const handleSubmit = () => {
    const source = localStorage.getItem("as_source") || "Direct";
    localStorage.setItem("as_application", JSON.stringify({ name, email, phone, goal, game, budget, timeline, source }));
    navigate("/book-call");
    window.scrollTo({ top: 0 });
  };

  const canAdvance = [
    name && email && phone,
    goal, game, budget, timeline, agreed,
  ][step];

  const stepTitles = [
    "Your Contact Info", "What Interests You?", "Game Style",
    "Budget Range", "Timeline", "Final Understanding",
  ];

  const STEP_CONTENT = [
    <div className="flex flex-col gap-4">
      <TextInput label="Full Name" placeholder="Your full name" value={name} onChange={setName} />
      <TextInput label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
      <TextInput label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={setPhone} />
    </div>,

    <div>
      <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 50%)", lineHeight: 1.6, marginBottom: 12 }}>
        What interests you most about launching a mobile game app?
      </p>
      <div className="flex flex-col gap-2">
        {GOALS.map(g => <RadioCard key={g} label={g} selected={goal === g} onClick={() => setGoal(g)} />)}
      </div>
    </div>,

    <div>
      <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 50%)", lineHeight: 1.6, marginBottom: 12 }}>
        Which game style interests you most?
      </p>
      <div className="flex flex-col gap-2">
        {GAMES.map(g => <RadioCard key={g} label={g} selected={game === g} onClick={() => setGame(g)} />)}
      </div>
    </div>,

    <div>
      <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 50%)", lineHeight: 1.6, marginBottom: 12 }}>
        What budget range are you comfortable with for launching a custom-branded app?
      </p>
      <div className="flex flex-col gap-2">
        {BUDGETS.map(b => <RadioCard key={b} label={b} selected={budget === b} onClick={() => setBudget(b)} />)}
      </div>
    </div>,

    <div>
      <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(218 16% 50%)", lineHeight: 1.6, marginBottom: 12 }}>
        How soon are you looking to start?
      </p>
      <div className="flex flex-col gap-2">
        {TIMELINES.map(t => <RadioCard key={t} label={t} selected={timeline === t} onClick={() => setTimeline(t)} />)}
      </div>
    </div>,

    <div className="flex flex-col gap-5">
      <div className="rounded-xl p-4" style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 12%)" }}>
        <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.75, color: "hsl(218 16% 48%)", fontWeight: 300 }}>
          App Squad provides custom mobile game app development, monetization preparation, and app store publishing assistance. App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, or return on investment. Results vary and depend on marketing, user engagement, platform rules, audience demand, app quality, consistency, and third-party approval processes.
        </p>
      </div>
      <label className="flex items-start gap-3 cursor-pointer" onClick={() => setAgreed(!agreed)}>
        <div className="w-5 h-5 rounded-md shrink-0 mt-0.5 flex items-center justify-center transition-all"
          style={{ background: agreed ? "hsl(35 90% 52%)" : "hsl(226 32% 10%)", border: `2px solid ${agreed ? "hsl(35 90% 55%)" : "hsl(224 22% 22%)"}` }}>
          {agreed && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
        <span style={{ fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.65, color: "hsl(218 16% 58%)", fontWeight: 300 }}>
          I understand App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, or return on investment.
        </span>
      </label>
    </div>,
  ];

  return (
    <div className="min-h-screen pt-8 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.14) 0%, transparent 65%)", filter: "blur(80px)" }} />
      </div>

      <div className="container mx-auto px-5 md:px-8 max-w-lg relative z-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.6rem, 4vw, 2.1rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 8 }}>
            Apply For Your App Launch Strategy Call
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.65, color: "hsl(218 16% 50%)", fontWeight: 300 }}>
            Tell us about your goals so our team can recommend the best app launch path for your situation.
          </p>
        </motion.div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-2.5">
            {STEPS.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
                style={{ background: i < step ? "hsl(35 90% 55%)" : i === step ? "hsl(35 90% 55% / 0.45)" : "hsl(224 22% 14%)" }} />
            ))}
          </div>
          <div className="flex justify-between">
            <span style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(35 90% 60%)", fontWeight: 500 }}>Step {step + 1} of {STEPS.length}</span>
            <span style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 40%)" }}>{STEPS[step]}</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)", boxShadow: "0 24px 60px -16px hsl(228 42% 4% / 0.8)" }}>
          <div className="px-7 pt-7 pb-3">
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 18 }}>
              {stepTitles[step]}
            </h2>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={step} custom={dir} variants={pageVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
                {STEP_CONTENT[step]}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-7 py-5 flex items-center justify-between gap-4"
            style={{ borderTop: "1px solid hsl(224 22% 11%)", marginTop: 20 }}>
            <button onClick={goPrev} disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
              style={{
                fontFamily: "'Inter'", fontSize: 13, fontWeight: 500,
                background: step === 0 ? "transparent" : "hsl(226 28% 10%)",
                border: `1px solid ${step === 0 ? "transparent" : "hsl(224 22% 16%)"}`,
                color: step === 0 ? "transparent" : "hsl(218 16% 52%)",
                cursor: step === 0 ? "default" : "pointer",
              }}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 32%)" }}>{step + 1} / {STEPS.length}</span>
            {step < STEPS.length - 1 ? (
              <button onClick={goNext} disabled={!canAdvance}
                className="btn-gold flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-xl text-white"
                style={{ opacity: canAdvance ? 1 : 0.35, cursor: canAdvance ? "pointer" : "not-allowed" }}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canAdvance}
                className="btn-gold flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-xl text-white"
                style={{ opacity: canAdvance ? 1 : 0.35, cursor: canAdvance ? "pointer" : "not-allowed" }}>
                Continue To Book Call <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-2.5 p-4 rounded-xl" style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}>
          <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(218 16% 34%)" }} />
          <p style={{ fontFamily: "'Inter'", fontSize: 11, lineHeight: 1.65, color: "hsl(218 16% 34%)", fontWeight: 300 }}>
            Your information is kept confidential and only used to prepare your strategy call. App Squad does not guarantee earnings, downloads, rankings, or return on investment.
          </p>
        </div>
      </div>
    </div>
  );
}
