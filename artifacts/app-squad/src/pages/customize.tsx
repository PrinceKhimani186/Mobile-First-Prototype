import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight, CheckCircle2, Palette, Upload, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendCustomizationToCRM } from "@/lib/crm";

const STEPS = ["Game Selected", "Customization", "Dashboard"];
const MONETIZATION_OPTIONS = ["Ads", "In-App Purchases", "Both"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 500, color: "hsl(218 16% 46%)", letterSpacing: "0.015em" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
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
  lineHeight: 1.5,
} as React.CSSProperties;

const focusStyle = { borderColor: "hsl(35 90% 55% / 0.5)" };
const blurStyle = { borderColor: "hsl(224 22% 14%)" };

export default function Customize() {
  const [, navigate] = useLocation();
  const [appName, setAppName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [preferredColors, setPreferredColors] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [monetizationPreference, setMonetizationPreference] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit = appName && brandName && monetizationPreference;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const lead = JSON.parse(localStorage.getItem("as_lead") || "{}");
    const application = JSON.parse(localStorage.getItem("as_application") || "{}");
    const source = localStorage.getItem("as_source") || "Direct";
    const clientName = application.name || lead.name || "";
    const email = application.email || lead.email || "";
    const phone = application.phone || lead.phone || "";

    const customizationData = {
      appName,
      brandName,
      preferredColors,
      logoUploadPlaceholder: "pending",
      targetAudience,
      appDescription,
      monetizationPreference,
      notesForDevelopmentTeam: notes,
    };

    localStorage.setItem("as_customization", JSON.stringify(customizationData));

    sendCustomizationToCRM({
      clientName,
      email,
      phone,
      appName,
      brandName,
      preferredColors,
      targetAudience,
      appDescription,
      monetizationPreference,
      notesForDevelopmentTeam: notes,
      source,
    });

    navigate("/onboarding/dashboard");
    window.scrollTo({ top: 0 });
  };

  const tf = (setter: (v: string) => void) => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setter(e.target.value),
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => Object.assign(e.target.style, focusStyle),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => Object.assign(e.target.style, blurStyle),
  });

  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-18" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[350px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.06) 0%, transparent 65%)", filter: "blur(80px)" }} />

      <div className="container mx-auto px-4 max-w-2xl relative z-10">

        {/* Step progress */}
        <div className="flex items-center justify-center gap-0 mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                  i <= 1 ? "text-white" : "text-muted-foreground border border-white/10"
                )}
                  style={i === 0 ? { background: "hsl(35 90% 55% / 0.2)", border: "1px solid hsl(35 90% 55% / 0.35)" } : i === 1 ? { background: "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))" } : {}}>
                  {i === 0 ? <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(35 90% 62%)" }} /> : i + 1}
                </div>
                <span style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: i === 1 ? 600 : 400, color: i === 1 ? "hsl(35 90% 62%)" : i === 0 ? "hsl(35 90% 50%)" : "hsl(218 16% 36%)", marginTop: 5, whiteSpace: "nowrap" }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-16 h-px mx-2 mb-5" style={{ background: i < 1 ? "hsl(35 90% 55% / 0.4)" : "hsl(224 22% 14%)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.22)" }}>
            <Palette className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 62%)" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(35 90% 66%)" }}>
              Client Portal — Step 2
            </span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
            App Customization Details
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 14, lineHeight: 1.75, color: "hsl(218 16% 50%)", fontWeight: 300 }}>
            Tell us about your brand so we can customize your app to match your identity and audience.
          </p>
        </div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Card 1 — Identity */}
            <div className="rounded-2xl p-6" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 16 }}>
                App Identity
              </p>
              <div className="flex flex-col gap-4">
                <Field label="App Name">
                  <input type="text" placeholder="e.g. Pixel Rush" value={appName} style={inputStyle} {...tf(setAppName)} />
                </Field>
                <Field label="Brand Name">
                  <input type="text" placeholder="e.g. Apex Digital" value={brandName} style={inputStyle} {...tf(setBrandName)} />
                </Field>
                <Field label="Preferred Colors">
                  <input type="text" placeholder="e.g. Navy blue, gold, white" value={preferredColors} style={inputStyle} {...tf(setPreferredColors)} />
                </Field>
              </div>
            </div>

            {/* Card 2 — Logo placeholder */}
            <div className="rounded-2xl p-6" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 16 }}>
                Logo / Brand Assets
              </p>
              <div className="flex items-center gap-4 p-5 rounded-xl cursor-not-allowed"
                style={{ background: "hsl(226 28% 6%)", border: "1.5px dashed hsl(224 22% 16%)" }}>
                <Upload className="w-5 h-5 shrink-0" style={{ color: "hsl(218 16% 34%)" }} />
                <div>
                  <p style={{ fontFamily: "'Inter'", fontSize: 13, fontWeight: 500, color: "hsl(218 16% 50%)" }}>Logo upload — coming soon</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 34%)", fontWeight: 300, marginTop: 2 }}>Your team will reach out to collect brand assets before development begins.</p>
                </div>
              </div>
            </div>

            {/* Card 3 — Audience & description */}
            <div className="rounded-2xl p-6" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 16 }}>
                App Vision
              </p>
              <div className="flex flex-col gap-4">
                <Field label="Target Audience">
                  <input type="text" placeholder="e.g. Adults 25–44 interested in casual gaming" value={targetAudience} style={inputStyle} {...tf(setTargetAudience)} />
                </Field>
                <Field label="App Description">
                  <textarea
                    placeholder="Brief description of your app concept and goals..."
                    value={appDescription}
                    rows={3}
                    style={{ ...inputStyle, resize: "none" }}
                    {...tf(setAppDescription)}
                  />
                </Field>
              </div>
            </div>

            {/* Card 4 — Monetization */}
            <div className="rounded-2xl p-6" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 16 }}>
                Monetization Preference <span style={{ color: "hsl(35 90% 60%)" }}>*</span>
              </p>
              <div className="flex flex-col gap-2.5">
                {MONETIZATION_OPTIONS.map(opt => (
                  <div key={opt}
                    onClick={() => setMonetizationPreference(opt)}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: monetizationPreference === opt ? "hsl(35 90% 55% / 0.08)" : "hsl(226 28% 6%)",
                      border: `1px solid ${monetizationPreference === opt ? "hsl(35 90% 55% / 0.4)" : "hsl(224 22% 12%)"}`,
                    }}>
                    <div className={cn("w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all")}
                      style={{ borderColor: monetizationPreference === opt ? "hsl(35 90% 55%)" : "hsl(224 22% 22%)", background: monetizationPreference === opt ? "hsl(35 90% 55%)" : "transparent" }}>
                      {monetizationPreference === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span style={{ fontFamily: "'Inter'", fontSize: 13.5, fontWeight: 500, color: monetizationPreference === opt ? "hsl(35 90% 65%)" : "hsl(218 16% 56%)" }}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 5 — Notes */}
            <div className="rounded-2xl p-6" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 16 }}>
                Notes For Development Team
              </p>
              <textarea
                placeholder="Any additional context, feature requests, or special instructions for the team..."
                value={notes}
                rows={4}
                style={{ ...inputStyle, resize: "none" }}
                onChange={e => setNotes(e.target.value)}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => Object.assign(e.target.style, blurStyle)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-gold h-13 py-4 text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2.5 text-white"
              style={{ opacity: canSubmit ? 1 : 0.32, cursor: canSubmit ? "pointer" : "not-allowed" }}
            >
              Submit Customization
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-2.5 p-3.5 rounded-xl"
              style={{ background: "hsl(226 28% 5%)", border: "1px solid hsl(224 22% 10%)" }}>
              <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "hsl(218 16% 28%)" }} />
              <p style={{ fontFamily: "'Inter'", fontSize: 11, lineHeight: 1.65, color: "hsl(218 16% 30%)", fontWeight: 300 }}>
                App Squad does not guarantee earnings, downloads, rankings, app approvals, ad revenue, in-app purchase revenue, profits, or return on investment.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
