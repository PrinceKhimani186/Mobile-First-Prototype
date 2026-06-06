import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight, CheckCircle2, Palette, Shield, Sparkles } from "lucide-react";
import { sendCustomizationToCRM } from "@/lib/crm";

const STEPS = ["Game Selected", "Customization", "Dashboard"];

const TARGET_AUDIENCE_OPTIONS = [
  "Kids", "Parents", "Adults", "Gamers", "Students",
  "Business Professionals", "Fitness Enthusiasts", "Other",
];

const BRAND_PERSONALITY_OPTIONS = [
  "Fun", "Professional", "Luxury", "Modern", "Technology",
  "Educational", "Family Friendly", "Bold", "Competitive", "Creative",
];

const COLOR_DIRECTION_OPTIONS = [
  { label: "Blue / Technology", color: "#2563EB" },
  { label: "Purple / Premium", color: "#7B61FF" },
  { label: "Red / Energy", color: "#DC2626" },
  { label: "Orange / Bold", color: "#EA580C" },
  { label: "Yellow / Bright", color: "#D97706" },
  { label: "Green / Growth", color: "#16A34A" },
  { label: "Teal / Fresh", color: "#0D9488" },
  { label: "Cyan / Electric", color: "#00D4FF" },
  { label: "Pink / Playful", color: "#DB2777" },
  { label: "Gold / Luxury", color: "#B8860B" },
  { label: "Navy / Professional", color: "#1E3A5F" },
  { label: "Black / Minimal", color: "#111111" },
  { label: "White / Clean", color: "#E5E7EB" },
  { label: "Gray / Modern", color: "#6B7280" },
  { label: "Not Sure — Let Us Decide", color: "linear-gradient(135deg, #7B61FF, #00D4FF, #16A34A)" },
];

const MONETIZATION_OPTIONS = [
  {
    label: "In-App Purchases",
    emoji: "💰",
    desc: "Virtual currency, premium content, power-ups & remove-ads upgrades. Best for engaged, recurring audiences.",
  },
  {
    label: "In-App Ads",
    emoji: "📣",
    desc: "Earn revenue from ad impressions. Free-to-play model with banner, interstitial & rewarded ads. Best for high-volume installs.",
  },
  {
    label: "Both",
    emoji: "⚡",
    desc: "Combine ads for free users with optional purchases to unlock premium features — maximises revenue across all user types.",
  },
  {
    label: "Not Sure — Let App Squad Decide",
    emoji: "🤔",
    desc: "Our team will recommend the monetization strategy that best fits your game type and target audience.",
  },
];

const ICON_STYLE_OPTIONS = [
  { label: "Modern Flat Design", emoji: "✦" },
  { label: "3D Style", emoji: "🎲" },
  { label: "Cartoon Style", emoji: "🎨" },
  { label: "Luxury Style", emoji: "💎" },
  { label: "Gaming Style", emoji: "🎮" },
  { label: "Minimalist Style", emoji: "◻" },
  { label: "Let App Squad Decide", emoji: "⭐" },
];

const inputStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13.5,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  color: "rgba(255,255,255,0.88)",
  outline: "none",
  width: "100%",
  padding: "13px 16px",
  transition: "border-color 0.2s",
  lineHeight: 1.5,
};

const focusStyle = { borderColor: "hsl(35 90% 55% / 0.5)" };
const blurStyle = { borderColor: "rgba(255,255,255,0.08)" };

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: 18,
      padding: "28px 28px",
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
    }}>
      <p style={{
        fontFamily: "'Inter'", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.3)", marginBottom: 20,
      }}>{title}</p>
      {children}
    </div>
  );
}

function Label({ text, optional }: { text: string; optional?: boolean }) {
  return (
    <label style={{
      fontFamily: "'Inter'", fontSize: 12, fontWeight: 500,
      color: "rgba(255,255,255,0.45)", letterSpacing: "0.01em",
      display: "block", marginBottom: 8,
    }}>
      {text}
      {optional && <span style={{ color: "rgba(255,255,255,0.22)", marginLeft: 6, fontWeight: 400 }}>(Optional)</span>}
    </label>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 6, lineHeight: 1.5 }}>{text}</p>
  );
}

export default function Customize() {
  const [, navigate] = useLocation();

  const [appName, setAppName] = useState("");
  const [tagline, setTagline] = useState("");
  const [appConcept, setAppConcept] = useState("");
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [brandPersonality, setBrandPersonality] = useState<string[]>([]);
  const [colorDirection, setColorDirection] = useState<string[]>([]);
  const [monetization, setMonetization] = useState("");
  const [iconStyle, setIconStyle] = useState("");
  const [designNotes, setDesignNotes] = useState("");

  const canSubmit = appName.trim().length > 0;

  const toggleAudience = (opt: string) => {
    setTargetAudience(prev =>
      prev.includes(opt) ? prev.filter(v => v !== opt) : [...prev, opt]
    );
  };

  const togglePersonality = (opt: string) => {
    setBrandPersonality(prev => {
      if (prev.includes(opt)) return prev.filter(v => v !== opt);
      if (prev.length >= 3) return prev;
      return [...prev, opt];
    });
  };

  const toggleColor = (opt: string) => {
    setColorDirection(prev => {
      if (prev.includes(opt)) return prev.filter(v => v !== opt);
      if (prev.length >= 3) return prev;
      return [...prev, opt];
    });
  };

  const tf = (setter: (v: string) => void) => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setter(e.target.value),
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => Object.assign(e.target.style, focusStyle),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => Object.assign(e.target.style, blurStyle),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const lead = JSON.parse(localStorage.getItem("as_lead") || "{}");
    const application = JSON.parse(localStorage.getItem("as_application") || "{}");
    const source = localStorage.getItem("as_source") || "Direct";
    const clientName = application.name || lead.name || "";
    const email = application.email || lead.email || "";
    const phone = application.phone || lead.phone || "";

    const data = {
      appName,
      tagline,
      appConcept,
      targetAudience: targetAudience.join(", "),
      brandPersonality: brandPersonality.join(", "),
      colorDirection: colorDirection.join(", "),
      monetization,
      iconStyle,
      designNotes,
    };

    localStorage.setItem("as_customization", JSON.stringify(data));

    sendCustomizationToCRM({
      clientName,
      email,
      phone,
      appName,
      tagline,
      appConcept,
      targetAudience: data.targetAudience,
      brandPersonality: data.brandPersonality,
      colorDirection: data.colorDirection,
      monetization,
      iconStyle,
      designNotes,
      source,
    });

    navigate("/onboarding/dashboard");
    window.scrollTo({ top: 0 });
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 64, position: "relative", background: "#050507" }}>
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 400, height: 400, background: "radial-gradient(ellipse, hsl(35 90% 55% / 0.05) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 0", position: "relative", zIndex: 1 }}>

        {/* Step progress */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 48 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  background: i === 0
                    ? "hsl(35 90% 55% / 0.18)"
                    : i === 1
                    ? "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))"
                    : "transparent",
                  border: i === 0
                    ? "1px solid hsl(35 90% 55% / 0.35)"
                    : i === 1 ? "none"
                    : "1px solid rgba(255,255,255,0.1)",
                  color: i <= 1 ? "white" : "rgba(255,255,255,0.3)",
                }}>
                  {i === 0
                    ? <CheckCircle2 style={{ width: 14, height: 14, color: "hsl(35 90% 62%)" }} />
                    : i + 1}
                </div>
                <span style={{
                  fontFamily: "'Inter'", fontSize: 10,
                  fontWeight: i === 1 ? 600 : 400,
                  color: i === 1 ? "hsl(35 90% 62%)" : i === 0 ? "hsl(35 90% 50%)" : "rgba(255,255,255,0.25)",
                  marginTop: 5, whiteSpace: "nowrap",
                }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 64, height: 1, margin: "0 8px 20px",
                  background: i < 1 ? "hsl(35 90% 55% / 0.4)" : "rgba(255,255,255,0.07)",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 99, marginBottom: 20,
            background: "hsl(35 90% 55% / 0.08)", border: "1px solid hsl(35 90% 55% / 0.22)",
          }}>
            <Palette style={{ width: 13, height: 13, color: "hsl(35 90% 62%)" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(35 90% 66%)" }}>
              Client Portal — Step 2
            </span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 14, color: "rgba(255,255,255,0.95)" }}>
            Let's Create Your App Identity
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.4)", maxWidth: 540, margin: "0 auto" }}>
            Tell us about the type of app brand you want to build and our team will create the visual direction.
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >

          {/* ── App Name & Tagline ── */}
          <SectionCard title="App Identity">
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <Label text="App Name" />
                <input
                  type="text"
                  placeholder="What would you like your app to be called?"
                  value={appName}
                  style={inputStyle}
                  {...tf(setAppName)}
                />
              </div>
              <div>
                <Label text="App Tagline" optional />
                <input
                  type="text"
                  placeholder="Short slogan or phrase"
                  value={tagline}
                  style={inputStyle}
                  {...tf(setTagline)}
                />
                <Hint text={`Examples: "Train Your Brain Daily" · "Fun Learning For Kids" · "Puzzle Your Way To Success"`} />
              </div>
            </div>
          </SectionCard>

          {/* ── App Concept ── */}
          <SectionCard title="App Vision">
            <div>
              <Label text="Describe Your App Concept" />
              <textarea
                placeholder={"Tell us about your vision. What do you want users to experience?"}
                value={appConcept}
                rows={5}
                style={{ ...inputStyle, resize: "none" as const }}
                {...tf(setAppConcept)}
              />
            </div>
          </SectionCard>

          {/* ── Target Audience ── */}
          <SectionCard title="Target Audience">
            <Label text="Who is this app for?" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TARGET_AUDIENCE_OPTIONS.map(opt => {
                const active = targetAudience.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleAudience(opt)}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 9,
                      fontFamily: "'Inter'",
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      border: active ? "1px solid hsl(35 90% 55% / 0.5)" : "1px solid rgba(255,255,255,0.08)",
                      background: active ? "hsl(35 90% 55% / 0.1)" : "rgba(255,255,255,0.03)",
                      color: active ? "hsl(35 90% 65%)" : "rgba(255,255,255,0.45)",
                      transition: "all 0.15s",
                    }}
                  >
                    {active && <CheckCircle2 style={{ width: 12, height: 12, display: "inline", marginRight: 5, verticalAlign: "middle" }} />}
                    {opt}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* ── Brand Personality ── */}
          <SectionCard title="Brand Personality">
            <Label text="Select up to 3" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {BRAND_PERSONALITY_OPTIONS.map(opt => {
                const active = brandPersonality.includes(opt);
                const maxed = brandPersonality.length >= 3 && !active;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => togglePersonality(opt)}
                    disabled={maxed}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 9,
                      fontFamily: "'Inter'",
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      cursor: maxed ? "not-allowed" : "pointer",
                      border: active ? "1px solid rgba(123,97,255,0.55)" : "1px solid rgba(255,255,255,0.08)",
                      background: active ? "rgba(123,97,255,0.12)" : "rgba(255,255,255,0.03)",
                      color: active ? "#a78bfa" : maxed ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.45)",
                      opacity: maxed ? 0.45 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {active && <CheckCircle2 style={{ width: 12, height: 12, display: "inline", marginRight: 5, verticalAlign: "middle" }} />}
                    {opt}
                  </button>
                );
              })}
            </div>
            {brandPersonality.length === 3 && (
              <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "rgba(123,97,255,0.7)", marginTop: 10 }}>
                Maximum of 3 selected
              </p>
            )}
          </SectionCard>

          {/* ── Color Direction ── */}
          <SectionCard title="Preferred Color Direction">
            <Label text="Select up to 3 colors" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
              {COLOR_DIRECTION_OPTIONS.map(opt => {
                const safeColors = Array.isArray(colorDirection) ? colorDirection : [];
                const active = safeColors.includes(opt.label);
                const maxed = safeColors.length >= 3 && !active;
                const isGradient = opt.color.startsWith("linear-gradient");
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => toggleColor(opt.label)}
                    disabled={maxed}
                    style={{
                      padding: "11px 14px",
                      borderRadius: 11,
                      fontFamily: "'Inter'",
                      fontSize: 12.5,
                      fontWeight: active ? 600 : 400,
                      cursor: maxed ? "not-allowed" : "pointer",
                      border: active ? "1px solid hsl(35 90% 55% / 0.55)" : "1px solid rgba(255,255,255,0.07)",
                      background: active ? "hsl(35 90% 55% / 0.09)" : "rgba(255,255,255,0.02)",
                      color: active ? "hsl(35 90% 65%)" : maxed ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.5)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      transition: "all 0.15s",
                      textAlign: "left" as const,
                      opacity: maxed ? 0.45 : 1,
                    }}
                  >
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      flexShrink: 0,
                      background: isGradient ? opt.color : opt.color,
                      border: opt.color === "#E5E7EB" || opt.color === "#111111"
                        ? "1px solid rgba(255,255,255,0.15)"
                        : "none",
                      boxShadow: active ? `0 0 8px ${isGradient ? "rgba(123,97,255,0.5)" : opt.color + "88"}` : "none",
                      transition: "box-shadow 0.15s",
                    }} />
                    {opt.label}
                    {active && (
                      <CheckCircle2 style={{ width: 12, height: 12, marginLeft: "auto", flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
            {colorDirection.length === 3 && (
              <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(35 90% 60%)", marginTop: 10 }}>
                Maximum of 3 colors selected
              </p>
            )}
          </SectionCard>

          {/* ── Icon Style ── */}
          <SectionCard title="App Icon Style">
            <Label text="Select one" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ICON_STYLE_OPTIONS.map(opt => {
                const active = iconStyle === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setIconStyle(opt.label)}
                    style={{
                      padding: "13px 18px",
                      borderRadius: 11,
                      fontFamily: "'Inter'",
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      border: active ? "1px solid hsl(35 90% 55% / 0.5)" : "1px solid rgba(255,255,255,0.07)",
                      background: active ? "hsl(35 90% 55% / 0.08)" : "rgba(255,255,255,0.02)",
                      color: active ? "hsl(35 90% 65%)" : "rgba(255,255,255,0.45)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      transition: "all 0.15s",
                      textAlign: "left" as const,
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: active ? "hsl(35 90% 55% / 0.15)" : "rgba(255,255,255,0.04)",
                      border: active ? "1px solid hsl(35 90% 55% / 0.3)" : "1px solid rgba(255,255,255,0.07)",
                      fontSize: 15, transition: "all 0.15s",
                    }}>
                      {opt.emoji}
                    </div>
                    {opt.label}
                    {active && (
                      <CheckCircle2 style={{ width: 15, height: 15, color: "hsl(35 90% 62%)", marginLeft: "auto" }} />
                    )}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* ── Monetization ── */}
          <SectionCard title="Monetization Add-On">
            <Label text="How would you like your app to generate revenue?" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MONETIZATION_OPTIONS.map(opt => {
                const active = monetization === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setMonetization(opt.label)}
                    style={{
                      padding: "16px 18px",
                      borderRadius: 13,
                      fontFamily: "'Inter'",
                      cursor: "pointer",
                      border: active ? "1px solid hsl(35 90% 55% / 0.5)" : "1px solid rgba(255,255,255,0.07)",
                      background: active ? "hsl(35 90% 55% / 0.08)" : "rgba(255,255,255,0.02)",
                      color: "rgba(255,255,255,0.88)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      transition: "all 0.15s",
                      textAlign: "left" as const,
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: active ? "hsl(35 90% 55% / 0.15)" : "rgba(255,255,255,0.04)",
                      border: active ? "1px solid hsl(35 90% 55% / 0.3)" : "1px solid rgba(255,255,255,0.07)",
                      fontSize: 18, transition: "all 0.15s",
                    }}>
                      {opt.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 600,
                        color: active ? "hsl(35 90% 65%)" : "rgba(255,255,255,0.75)",
                        margin: "0 0 4px", transition: "color 0.15s",
                      }}>{opt.label}</p>
                      <p style={{
                        fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.55,
                        color: "rgba(255,255,255,0.35)", margin: 0,
                      }}>{opt.desc}</p>
                    </div>
                    {active && (
                      <CheckCircle2 style={{ width: 16, height: 16, color: "hsl(35 90% 62%)", flexShrink: 0, marginTop: 2 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* ── Design Notes ── */}
          <SectionCard title="Additional Design Notes">
            <textarea
              placeholder="Anything else you would like our branding team to know?"
              value={designNotes}
              rows={4}
              style={{ ...inputStyle, resize: "none" as const }}
              onChange={e => setDesignNotes(e.target.value)}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => Object.assign(e.target.style, blurStyle)}
            />
            <div style={{
              marginTop: 16, padding: "14px 18px", borderRadius: 11,
              background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <Sparkles style={{ width: 12, height: 12, color: "rgba(0,212,255,0.6)" }} />
                <span style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,212,255,0.5)" }}>What App Squad Creates From This</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["App Name Branding", "App Icon Concept", "Color Palette", "Visual Identity Direction", "Store Listing Graphics", "App Presentation Assets"].map(item => (
                  <span key={item} style={{
                    padding: "4px 10px", borderRadius: 6,
                    background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.1)",
                    fontFamily: "'Inter'", fontSize: 11, color: "rgba(255,255,255,0.38)",
                  }}>{item}</span>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              padding: "18px 0",
              borderRadius: 13,
              fontFamily: "'Space Grotesk'",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.03em",
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.3,
              border: "none",
              background: canSubmit
                ? "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)"
                : "rgba(255,255,255,0.08)",
              color: canSubmit ? "#050505" : "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: canSubmit ? "0 0 40px rgba(245,158,11,0.25)" : "none",
              transition: "all 0.2s",
            }}
          >
            Submit App Identity
            <ArrowRight style={{ width: 17, height: 17 }} />
          </button>

          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "12px 16px", borderRadius: 11,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          }}>
            <Shield style={{ width: 13, height: 13, color: "rgba(255,255,255,0.2)", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontFamily: "'Inter'", fontSize: 11, lineHeight: 1.65, color: "rgba(255,255,255,0.22)", margin: 0 }}>
              App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, or return on investment.
            </p>
          </div>

        </motion.form>
      </div>
    </div>
  );
}
