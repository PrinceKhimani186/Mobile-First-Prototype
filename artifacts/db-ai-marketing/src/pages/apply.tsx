import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, Zap, Shield } from "lucide-react";
import { useLocation } from "wouter";

/* ── Shared styles ── */
const fieldStyle = {
  fontFamily: "'DM Sans'",
  fontSize: 14,
  background: "hsl(345 10% 7%)",
  border: "1px solid hsl(345 10% 14%)",
  borderRadius: 12,
  color: "hsl(30 18% 90%)",
  outline: "none",
  width: "100%",
  padding: "12px 16px",
  transition: "border-color 0.2s",
};

const labelStyle = {
  fontFamily: "'DM Sans'",
  fontSize: 13,
  fontWeight: 500,
  color: "hsl(30 12% 62%)",
  letterSpacing: "0.01em",
  marginBottom: 8,
  display: "block",
};

function Field({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      {label && <span style={labelStyle}>{label}</span>}
      {children}
    </div>
  );
}

function TextInput({ placeholder, value, onChange, type = "text" }: {
  placeholder?: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={fieldStyle}
      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "hsl(330 50% 35%)"; }}
      onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "hsl(345 10% 14%)"; }}
    />
  );
}

function Select({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...fieldStyle, cursor: "pointer" }}
      onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = "hsl(330 50% 35%)"; }}
      onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = "hsl(345 10% 14%)"; }}
    >
      {children}
    </select>
  );
}

function ChoiceChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer text-left"
      style={{
        fontFamily: "'DM Sans'",
        fontWeight: selected ? 600 : 400,
        background: selected ? "hsl(330 35% 14%)" : "hsl(345 10% 7%)",
        border: `1px solid ${selected ? "hsl(330 50% 30%)" : "hsl(345 10% 14%)"}`,
        color: selected ? "hsl(330 65% 72%)" : "hsl(30 10% 52%)",
      }}
    >
      {selected && "✓ "}{label}
    </button>
  );
}

function RadioCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-3.5 rounded-xl text-[14px] transition-all cursor-pointer text-left w-full flex items-center gap-3"
      style={{
        fontFamily: "'DM Sans'",
        fontWeight: selected ? 600 : 400,
        background: selected ? "hsl(330 30% 12%)" : "hsl(345 10% 7%)",
        border: `1px solid ${selected ? "hsl(330 50% 28%)" : "hsl(345 10% 14%)"}`,
        color: selected ? "hsl(330 65% 75%)" : "hsl(30 10% 56%)",
      }}
    >
      <span
        className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
        style={{
          border: `2px solid ${selected ? "hsl(330 65% 55%)" : "hsl(345 10% 25%)"}`,
          background: selected ? "hsl(330 65% 52%)" : "transparent",
        }}
      />
      {label}
    </button>
  );
}

const STEPS = [
  "Business Info",
  "Marketing Goals",
  "Current Content",
  "Budget Range",
  "Timeline",
  "Package Interest",
  "Final Details",
];

const INDUSTRIES = [
  "", "Restaurant", "Nightclub / Lounge", "Influencer", "Creator",
  "Mobile Game App", "App / SaaS", "Real Estate", "Fitness",
  "Podcast / Media", "Event Company", "Luxury Brand", "Other",
];

const GOALS = [
  "More customers", "More attention online", "More bookings", "Better brand image",
  "More app installs", "More event attendance", "More social media content",
  "Better ad creatives", "Influencer/creator growth", "Product or service launch",
];

const POSTING_FREQ = [
  "Rarely", "1–2 times per week", "3–5 times per week", "Daily", "We need help building consistency",
];

const CONTENT_TYPES = [
  "Photos", "Reels", "Ads", "Influencer content", "Event promos", "App promos", "None yet",
];

const BUDGETS = [
  "Under $1,000", "$1,000–$2,500", "$2,500–$5,000", "$5,000–$10,000", "$10,000+",
];

const TIMELINES = [
  "Immediately", "This month", "30–60 days", "60–90 days", "Just researching",
];

const PACKAGES = [
  "AI Standard Package", "AI Growth Package", "AI Dominance Package", "Not sure yet",
];

const pageVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

export default function Apply() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  // Form state
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [postingFreq, setPostingFreq] = useState("");
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [packageInterest, setPackageInterest] = useState("");
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);

  const toggleArr = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const goNext = () => { setDir(1); setStep(s => s + 1); };
  const goPrev = () => { setDir(-1); setStep(s => s - 1); };

  const handleSubmit = () => {
    navigate("/strategy-call");
    window.scrollTo({ top: 0 });
  };

  const progress = ((step) / (STEPS.length)) * 100;

  const STEP_CONTENT = [
    /* Step 0 — Business Info */
    <div className="flex flex-col gap-5">
      <Field label="Full Name">
        <TextInput placeholder="Your full name" value={name} onChange={setName} />
      </Field>
      <Field label="Business Name">
        <TextInput placeholder="Your business or brand name" value={business} onChange={setBusiness} />
      </Field>
      <Field label="Email Address">
        <TextInput type="email" placeholder="you@yourbusiness.com" value={email} onChange={setEmail} />
      </Field>
      <Field label="Phone Number">
        <TextInput type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={setPhone} />
      </Field>
      <Field label="Website or Social Media Link">
        <TextInput placeholder="https:// or @handle" value={website} onChange={setWebsite} />
      </Field>
      <Field label="Industry">
        <Select value={industry} onChange={setIndustry}>
          {INDUSTRIES.map(i => <option key={i} value={i} style={{ background: "hsl(345 10% 7%)" }}>{i || "Select your industry"}</option>)}
        </Select>
      </Field>
    </div>,

    /* Step 1 — Goals */
    <div>
      <p className="mb-5" style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "hsl(30 10% 52%)", lineHeight: 1.6 }}>
        Select all that apply.
      </p>
      <div className="flex flex-wrap gap-2.5">
        {GOALS.map(g => (
          <ChoiceChip key={g} label={g} selected={goals.includes(g)} onClick={() => toggleArr(goals, setGoals, g)} />
        ))}
      </div>
    </div>,

    /* Step 2 — Current Content */
    <div className="flex flex-col gap-7">
      <Field label="How often do you currently post?">
        <div className="flex flex-col gap-2.5">
          {POSTING_FREQ.map(f => (
            <RadioCard key={f} label={f} selected={postingFreq === f} onClick={() => setPostingFreq(f)} />
          ))}
        </div>
      </Field>
      <Field label="What type of content do you currently create?">
        <div className="flex flex-wrap gap-2.5">
          {CONTENT_TYPES.map(t => (
            <ChoiceChip key={t} label={t} selected={contentTypes.includes(t)} onClick={() => toggleArr(contentTypes, setContentTypes, t)} />
          ))}
        </div>
      </Field>
    </div>,

    /* Step 3 — Budget */
    <div>
      <p className="mb-5" style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "hsl(30 10% 52%)", lineHeight: 1.6 }}>
        This helps us recommend the right package and avoid wasting your time.
      </p>
      <div className="flex flex-col gap-2.5">
        {BUDGETS.map(b => (
          <RadioCard key={b} label={b} selected={budget === b} onClick={() => setBudget(b)} />
        ))}
      </div>
    </div>,

    /* Step 4 — Timeline */
    <div>
      <div className="flex flex-col gap-2.5">
        {TIMELINES.map(t => (
          <RadioCard key={t} label={t} selected={timeline === t} onClick={() => setTimeline(t)} />
        ))}
      </div>
    </div>,

    /* Step 5 — Package Interest */
    <div>
      <div className="flex flex-col gap-3">
        {PACKAGES.map(p => (
          <RadioCard key={p} label={p} selected={packageInterest === p} onClick={() => setPackageInterest(p)} />
        ))}
      </div>
    </div>,

    /* Step 6 — Final Details */
    <div className="flex flex-col gap-6">
      <Field label="Why do you feel your current marketing is not capturing enough attention?">
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Tell us honestly about your current situation..."
          rows={5}
          style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.7 }}
          onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = "hsl(330 50% 35%)"; }}
          onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = "hsl(345 10% 14%)"; }}
        />
      </Field>
      <label className="flex items-start gap-3 cursor-pointer group" onClick={() => setAgreed(!agreed)}>
        <div
          className="w-5 h-5 rounded-md shrink-0 mt-0.5 flex items-center justify-center transition-all"
          style={{
            background: agreed ? "hsl(330 65% 48%)" : "hsl(345 10% 9%)",
            border: `2px solid ${agreed ? "hsl(330 65% 52%)" : "hsl(345 10% 20%)"}`,
          }}
        >
          {agreed && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
        <span style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "hsl(30 8% 50%)", lineHeight: 1.65, fontWeight: 300 }}>
          I understand D&amp;B AI Marketing Co. provides AI-powered content creation, marketing strategy, and campaign assets, but <strong style={{ color: "hsl(30 12% 62%)", fontWeight: 500 }}>does not guarantee</strong> revenue, followers, views, conversions, bookings, app installs, or business results.
        </span>
      </label>
    </div>,
  ];

  const stepTitles = [
    "Business Info",
    "What Are You Trying to Achieve?",
    "Your Current Content",
    "Monthly Investment Range",
    "When Are You Looking to Start?",
    "Which Package Interests You?",
    "Final Details",
  ];

  const canAdvance = [
    name && email && industry,
    goals.length > 0,
    postingFreq && contentTypes.length > 0,
    budget,
    timeline,
    packageInterest,
    reason && agreed,
  ][step];

  return (
    <div className="min-h-screen pt-20 pb-24" style={{ background: "hsl(345 8% 4%)" }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full opacity-18"
          style={{ background: "radial-gradient(ellipse at center, hsl(330 65% 40% / 0.16) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] opacity-12"
          style={{ background: "radial-gradient(ellipse at center, hsl(275 50% 35% / 0.1) 0%, transparent 65%)", filter: "blur(80px)" }} />
      </div>

      <div className="container mx-auto px-5 md:px-8 max-w-2xl relative z-10 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="label-text mb-4">Qualifier Form</p>
          <h1 className="section-headline mb-4 leading-[1.05]">
            Apply For Your AI Marketing Strategy Call
          </h1>
          <p className="body-premium max-w-xl mx-auto">
            Tell us about your business so we can understand your goals, content needs, budget range, and whether D&amp;B AI Marketing Co. is the right fit.
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    fontFamily: "'Syne'",
                    fontWeight: 700,
                    background: i < step ? "linear-gradient(135deg, hsl(340 72% 46%), hsl(300 60% 44%))" :
                      i === step ? "hsl(330 30% 14%)" : "hsl(345 10% 9%)",
                    border: `2px solid ${i <= step ? "hsl(330 50% 35%)" : "hsl(345 10% 16%)"}`,
                    color: i < step ? "white" : i === step ? "hsl(330 65% 70%)" : "hsl(30 8% 36%)",
                    fontSize: 11,
                  }}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className="hidden sm:block text-center"
                  style={{
                    fontFamily: "'DM Sans'",
                    fontSize: 9,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: i === step ? "hsl(330 55% 62%)" : "hsl(30 8% 32%)",
                    fontWeight: i === step ? 600 : 400,
                    lineHeight: 1.3,
                    maxWidth: 60,
                  }}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
          {/* Progress line */}
          <div className="h-0.5 rounded-full overflow-hidden mt-1" style={{ background: "hsl(345 10% 11%)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(340 72% 46%), hsl(300 60% 44%))" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Form card */}
        <div
          className="rounded-[1.75rem] overflow-hidden"
          style={{ background: "hsl(345 10% 6%)", border: "1px solid hsl(345 10% 11%)", boxShadow: "0 40px 80px -24px hsl(330 55% 30% / 0.14)" }}
        >
          {/* Card header */}
          <div className="px-8 pt-8 pb-6" style={{ borderBottom: "1px solid hsl(345 10% 10%)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(330 65% 60%)", boxShadow: "0 0 8px hsl(330 65% 52% / 0.5)" }} />
              <span className="label-text" style={{ color: "hsl(330 55% 62%)" }}>Step {step + 1} of {STEPS.length}</span>
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 21, fontWeight: 700, letterSpacing: "-0.025em", color: "hsl(30 18% 92%)" }}>
              {stepTitles[step]}
            </h2>
          </div>

          {/* Content */}
          <div className="px-8 py-8 min-h-[280px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                {STEP_CONTENT[step]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div className="px-8 pb-8 flex items-center justify-between gap-4" style={{ borderTop: "1px solid hsl(345 10% 10%)", paddingTop: 20 }}>
            <button
              onClick={goPrev}
              disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              style={{
                fontFamily: "'DM Sans'",
                fontSize: 13,
                fontWeight: 500,
                background: step === 0 ? "transparent" : "hsl(345 10% 9%)",
                border: `1px solid ${step === 0 ? "transparent" : "hsl(345 10% 15%)"}`,
                color: step === 0 ? "transparent" : "hsl(30 8% 50%)",
                cursor: step === 0 ? "default" : "pointer",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: "hsl(30 8% 35%)" }}>
              {step + 1} / {STEPS.length}
            </div>

            {step < STEPS.length - 1 ? (
              <button
                onClick={goNext}
                disabled={!canAdvance}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-[13px] rounded-xl"
                style={{ opacity: canAdvance ? 1 : 0.4, cursor: canAdvance ? "pointer" : "not-allowed" }}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canAdvance}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-[13px] rounded-xl"
                style={{ opacity: canAdvance ? 1 : 0.4, cursor: canAdvance ? "pointer" : "not-allowed" }}
              >
                Continue To Strategy Call
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 flex gap-3 p-4 rounded-2xl" style={{ background: "hsl(345 10% 6%)", border: "1px solid hsl(345 10% 10%)" }}>
          <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(30 8% 36%)" }} />
          <p style={{ fontFamily: "'DM Sans'", fontSize: 11.5, lineHeight: 1.7, color: "hsl(30 8% 36%)", fontWeight: 300 }}>
            Your information is kept confidential and only used to prepare your strategy call. D&amp;B AI Marketing Co. does not guarantee revenue, followers, views, conversions, bookings, app installs, or business results.
          </p>
        </div>
      </div>
    </div>
  );
}
