import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Zap, ArrowRight, CheckCircle2, User, Mail, Phone,
  ChevronRight, Loader2, AlertCircle, X, Sparkles, Crown, Rocket,
  Upload, FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initEnrollment, uploadDocument, updatePackage } from "@/services/enrollment";

// ── Plan definitions ─────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "essentials",
    name: "Essentials",
    tag: "Purchased Plan - Essentials",
    icon: Zap,
    color: "hsl(218 76% 60%)",
    glow: "hsl(218 76% 60% / 0.18)",
    border: "hsl(218 76% 60% / 0.3)",
    description: "Everything you need to launch your first mobile game app.",
    features: [
      "Custom mobile game app",
      "App store submission",
      "Brand & design review",
      "3-month post-launch support",
    ],
    popular: false,
  },
  {
    id: "accelerator",
    name: "Ownership Accelerator",
    tag: "Purchased Plan - Ownership Accelerator",
    icon: Sparkles,
    color: "hsl(35 90% 55%)",
    glow: "hsl(35 90% 55% / 0.18)",
    border: "hsl(35 90% 55% / 0.35)",
    description: "Accelerate your digital asset ownership with premium features.",
    features: [
      "Everything in Essentials",
      "Priority development queue",
      "Advanced monetization setup",
      "6-month post-launch support",
      "Revenue optimization session",
    ],
    popular: true,
  },
  {
    id: "empire",
    name: "Digital Asset Empire",
    tag: "Purchased Plan - Digital Asset Empire",
    icon: Crown,
    color: "hsl(280 70% 65%)",
    glow: "hsl(280 70% 65% / 0.18)",
    border: "hsl(280 70% 65% / 0.3)",
    description: "Build a portfolio of digital assets with full-service support.",
    features: [
      "Everything in Ownership Accelerator",
      "Multiple app launches",
      "Dedicated account manager",
      "12-month post-launch support",
      "Marketing & growth strategy",
      "VIP onboarding experience",
    ],
    popular: false,
  },
] as const;

type PlanId = typeof PLANS[number]["id"];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  businessType: string;
  preferredContact: string;
}

const inputBase: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  padding: "12px 14px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.9)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const selectBase: React.CSSProperties = {
  ...inputBase,
  appearance: "none" as const,
  WebkitAppearance: "none" as const,
  cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.35)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 36,
};

function InputField({
  label, type = "text", value, onChange, placeholder, required,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: "block", fontFamily: "'Inter'", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.07em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)", marginBottom: 7,
      }}>
        {label}{required && <span style={{ color: "hsl(35 90% 60%)", marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          ...inputBase,
          borderColor: focused ? "hsl(35 90% 55% / 0.5)" : "rgba(255,255,255,0.1)",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options, placeholder, required,
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: "block", fontFamily: "'Inter'", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.07em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)", marginBottom: 7,
      }}>
        {label}{required && <span style={{ color: "hsl(35 90% 60%)", marginLeft: 3 }}>*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{
          ...selectBase,
          borderColor: focused ? "hsl(35 90% 55% / 0.5)" : "rgba(255,255,255,0.1)",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <option value="" disabled style={{ background: "#0a0a0f", color: "rgba(255,255,255,0.4)" }}>
          {placeholder}
        </option>
        {options.map(opt => (
          <option key={opt} value={opt} style={{ background: "#0a0a0f", color: "rgba(255,255,255,0.9)" }}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function DocumentUploadField({
  file, onFile, required,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  required?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFileChange(f: File | null) {
    if (f) onFile(f);
  }

  return (
    <div>
      <label style={{
        display: "block", fontFamily: "'Inter'", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.07em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)", marginBottom: 7,
      }}>
        Required Document{required && <span style={{ color: "hsl(35 90% 60%)", marginLeft: 3 }}>*</span>}
      </label>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        style={{ display: "none" }}
        onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
      />
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          handleFileChange(e.dataTransfer.files?.[0] ?? null);
        }}
        style={{
          borderRadius: 10,
          padding: "16px 14px",
          border: `1px dashed ${dragging ? "hsl(35 90% 55% / 0.7)" : file ? "hsl(35 90% 55% / 0.4)" : "rgba(255,255,255,0.15)"}`,
          background: dragging
            ? "hsl(35 90% 55% / 0.06)"
            : file
            ? "hsl(35 90% 55% / 0.04)"
            : "rgba(255,255,255,0.02)",
          cursor: "pointer",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {file ? (
          <>
            <FileText style={{ width: 18, height: 18, color: "hsl(35 90% 62%)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "hsl(35 90% 68%)", margin: 0, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {file.name}
              </p>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>
                {(file.size / 1024).toFixed(0)} KB — click to change
              </p>
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onFile(null); if (fileRef.current) fileRef.current.value = ""; }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 2, display: "flex" }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </>
        ) : (
          <>
            <Upload style={{ width: 18, height: 18, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                Click or drag & drop to upload
              </p>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "rgba(255,255,255,0.25)", margin: "3px 0 0" }}>
                PDF, Word, JPG, PNG (max 10 MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const CONTACT_OPTIONS = ["Email", "Phone", "WhatsApp"];

export default function Enrollment() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", email: "", phone: "",
    company: "", country: "", businessType: "", preferredContact: "",
  });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [submittingStep1, setSubmittingStep1] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const planParam = params.get("plan");
    if (planParam) {
      const planMap: Record<string, PlanId> = {
        essentials: "essentials",
        accelerator: "accelerator",
        empire: "empire",
      };
      const matched = planMap[planParam.toLowerCase()];
      if (matched) setSelectedPlan(matched);
    }

    if (params.get("payment") === "cancelled") {
      toast({
        title: "Payment cancelled",
        description: "You can continue whenever you're ready.",
        variant: "destructive",
      });
    }

    if (params.has("plan") || params.has("payment")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

  function validateStep1() {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) return "Please enter a valid email address.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (!form.country.trim()) return "Country is required.";
    if (!form.businessType.trim()) return "Business type is required.";
    if (!docFile) return "Please upload your required document.";
    return "";
  }

  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setFormError(err); return; }
    setFormError("");
    setSubmittingStep1(true);

    try {
      const normalizedEmail = form.email.trim().toLowerCase();

      // Step A: upload document (blocking — must succeed before saving)
      let documentName = "";
      let documentUrl = "";
      if (docFile) {
        const uploadResult = await uploadDocument(docFile, normalizedEmail);
        if (!uploadResult.ok) {
          setFormError(uploadResult.error ?? "Unable to upload document.");
          return;
        }
        documentName = uploadResult.documentName ?? docFile.name;
        documentUrl = uploadResult.documentUrl ?? "";
      }

      // Step B: save to Supabase (blocking — must succeed before proceeding)
      const saveResult = await initEnrollment({
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        email: normalizedEmail,
        phone: form.phone,
        companyName: form.company,
        country: form.country,
        businessType: form.businessType,
        preferredContact: form.preferredContact,
        documentName,
        documentUrl,
      });

      if (!saveResult.ok) {
        setFormError(saveResult.error ?? "Unable to save your information.");
        return;
      }

      // Step C: save session data for downstream use
      localStorage.setItem("appSquadEnrollment", JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: normalizedEmail,
        phone: form.phone,
        company: form.company,
        country: form.country,
        businessType: form.businessType,
        preferredContact: form.preferredContact,
        selectedPlan,
      }));
      localStorage.setItem("appSquadEnrollmentEmail", normalizedEmail);

      // Step D: proceed to plan selection
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmittingStep1(false);
    }
  }

  async function handleEnroll() {
    if (!selectedPlan) return;
    const plan = PLANS.find(p => p.id === selectedPlan)!;
    setLoading(true);
    setCheckoutError("");

    try {
      const normalizedEmail = form.email.trim().toLowerCase();
      const origin = window.location.origin;
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

      // Save selected plan to Supabase (non-blocking — Stripe webhook is source of truth)
      updatePackage(normalizedEmail, selectedPlan).catch(() => {});

      localStorage.setItem("appSquadEnrollmentEmail", normalizedEmail);

      const res = await fetch("/api/enrollment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: normalizedEmail,
          phone: form.phone,
          selectedPlan,
          planName: plan.name,
          planTag: plan.tag,
          successUrl: `${origin}${base}/set-password?payment=success`,
          cancelUrl: `${origin}${base}/enrollment?payment=cancelled`,
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? "Unable to start checkout. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setCheckoutError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050507",
      position: "relative",
      overflowX: "hidden",
      paddingBottom: 80,
    }}>
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div style={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 800, height: 600,
        background: "radial-gradient(ellipse, hsl(35 90% 55% / 0.07) 0%, transparent 65%)",
        filter: "blur(80px)", pointerEvents: "none",
      }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-14">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full"
            style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.2)" }}>
            <Rocket style={{ width: 13, height: 13, color: "hsl(35 90% 62%)" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(35 90% 62%)" }}>
              App Launch Enrollment
            </span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 14 }}>
            Start Your App Ownership Journey
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 15, color: "hsl(218 16% 48%)", fontWeight: 300, maxWidth: 480, margin: "0 auto" }}>
            Complete your details and secure your place today.
          </p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2].map(n => (
            <div key={n} className="flex items-center gap-3">
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700,
                background: step >= n ? "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))" : "hsl(226 32% 10%)",
                border: step >= n ? "none" : "1px solid rgba(255,255,255,0.1)",
                color: step >= n ? "white" : "rgba(255,255,255,0.3)",
                transition: "all 0.3s",
              }}>
                {step > n ? <CheckCircle2 style={{ width: 15, height: 15 }} /> : n}
              </div>
              <span style={{
                fontFamily: "'Inter'", fontSize: 12, fontWeight: 500,
                color: step >= n ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
              }}>
                {n === 1 ? "Your Details" : "Choose Plan"}
              </span>
              {n < 2 && (
                <ChevronRight style={{ width: 14, height: 14, color: "rgba(255,255,255,0.2)" }} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: User info ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
            >
              <div style={{
                background: "hsl(226 32% 7%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "36px 32px",
              }}>
                <div className="flex items-center gap-3 mb-8">
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: "hsl(35 90% 55% / 0.12)",
                    border: "1px solid hsl(35 90% 55% / 0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <User style={{ width: 18, height: 18, color: "hsl(35 90% 62%)" }} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
                      Your Information
                    </h2>
                    <p style={{ fontFamily: "'Inter'", fontSize: 12.5, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                      We'll use this to set up your account.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleStep1Submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="First Name" value={form.firstName}
                      onChange={v => { setForm(f => ({ ...f, firstName: v })); setFormError(""); }}
                      placeholder="Prince" required />
                    <InputField label="Last Name" value={form.lastName}
                      onChange={v => { setForm(f => ({ ...f, lastName: v })); setFormError(""); }}
                      placeholder="Khimani" required />
                  </div>
                  <InputField label="Email Address" type="email" value={form.email}
                    onChange={v => { setForm(f => ({ ...f, email: v })); setFormError(""); }}
                    placeholder="you@example.com" required />
                  <InputField label="Phone Number" type="tel" value={form.phone}
                    onChange={v => { setForm(f => ({ ...f, phone: v })); setFormError(""); }}
                    placeholder="+1 (555) 000-0000" required />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="Company Name (optional)" value={form.company}
                      onChange={v => setForm(f => ({ ...f, company: v }))}
                      placeholder="Your company name" />
                    <InputField label="Country" value={form.country}
                      onChange={v => { setForm(f => ({ ...f, country: v })); setFormError(""); }}
                      placeholder="United States" required />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="Business Type" value={form.businessType}
                      onChange={v => { setForm(f => ({ ...f, businessType: v })); setFormError(""); }}
                      placeholder="e.g. E-commerce, Agency…" required />
                    <SelectField
                      label="Preferred Contact"
                      value={form.preferredContact}
                      onChange={v => setForm(f => ({ ...f, preferredContact: v }))}
                      options={CONTACT_OPTIONS}
                      placeholder="Select one…"
                    />
                  </div>

                  <DocumentUploadField
                    file={docFile}
                    onFile={f => { setDocFile(f); setFormError(""); }}
                    required
                  />

                  {formError && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 14px", borderRadius: 10,
                        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                      }}>
                      <AlertCircle style={{ width: 14, height: 14, color: "#f87171", flexShrink: 0 }} />
                      <p style={{ fontFamily: "'Inter'", fontSize: 12.5, color: "#f87171", margin: 0 }}>
                        {formError}
                      </p>
                    </motion.div>
                  )}

                  <button type="submit"
                    disabled={submittingStep1}
                    style={{
                      width: "100%", height: 50, borderRadius: 14, border: "none",
                      background: submittingStep1
                        ? "hsl(35 90% 55% / 0.4)"
                        : "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))",
                      color: "white", fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 600,
                      cursor: submittingStep1 ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 8, marginTop: 4,
                    }}
                  >
                    {submittingStep1 ? (
                      <>
                        <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                        Saving…
                      </>
                    ) : (
                      <>
                        Continue to Plan Selection
                        <ArrowRight style={{ width: 15, height: 15 }} />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <p style={{ textAlign: "center", fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 30%)", marginTop: 20, lineHeight: 1.65 }}>
                This page is for clients who have completed a strategy call with the App Squad team.{" "}
                <button onClick={() => navigate("/apply")}
                  style={{ color: "hsl(35 90% 58%)", cursor: "pointer", textDecoration: "underline", background: "none", border: "none", fontFamily: "'Inter'", fontSize: 12 }}>
                  Apply here
                </button>{" "}
                if you haven't started yet.
              </p>
            </motion.div>
          )}

          {/* ── Step 2: Plan selection ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}
            >
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {PLANS.map(plan => {
                  const Icon = plan.icon;
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <motion.button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      whileHover={{ y: -2 }}
                      style={{
                        position: "relative",
                        padding: "24px 20px",
                        borderRadius: 18,
                        border: isSelected
                          ? `2px solid ${plan.color}`
                          : plan.popular
                            ? `1px solid ${plan.border}`
                            : "1px solid rgba(255,255,255,0.08)",
                        background: isSelected
                          ? plan.glow
                          : plan.popular
                            ? "hsl(226 32% 8%)"
                            : "hsl(226 32% 7%)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                        boxShadow: isSelected ? `0 0 32px -8px ${plan.glow}` : "none",
                      }}
                    >
                      {plan.popular && (
                        <div style={{
                          position: "absolute", top: -1, right: 16,
                          background: "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))",
                          color: "white", fontFamily: "'Space Grotesk'", fontSize: 10, fontWeight: 700,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          padding: "3px 10px", borderRadius: "0 0 8px 8px",
                        }}>
                          Most Popular
                        </div>
                      )}

                      {isSelected && (
                        <div style={{
                          position: "absolute", top: 14, right: 14,
                          width: 22, height: 22, borderRadius: "50%",
                          background: plan.color,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <CheckCircle2 style={{ width: 13, height: 13, color: "white" }} />
                        </div>
                      )}

                      <div style={{
                        width: 42, height: 42, borderRadius: 12, marginBottom: 14,
                        background: `${plan.color}18`,
                        border: `1px solid ${plan.color}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon style={{ width: 20, height: 20, color: plan.color }} />
                      </div>

                      <h3 style={{
                        fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 700,
                        letterSpacing: "-0.02em", marginBottom: 8, color: "rgba(255,255,255,0.95)",
                      }}>
                        {plan.name}
                      </h3>
                      <p style={{
                        fontFamily: "'Inter'", fontSize: 12.5, color: "rgba(255,255,255,0.4)",
                        lineHeight: 1.6, marginBottom: 16,
                      }}>
                        {plan.description}
                      </p>

                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
                        {plan.features.map(f => (
                          <li key={f} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <CheckCircle2 style={{ width: 13, height: 13, color: plan.color, flexShrink: 0 }} />
                            <span style={{ fontFamily: "'Inter'", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                              {f}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </motion.button>
                  );
                })}
              </div>

              {checkoutError && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
                    padding: "12px 16px", borderRadius: 12,
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                  }}>
                  <AlertCircle style={{ width: 14, height: 14, color: "#f87171", flexShrink: 0 }} />
                  <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "#f87171", margin: 0, flex: 1 }}>
                    {checkoutError}
                  </p>
                  <button onClick={() => setCheckoutError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", padding: 2 }}>
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { setStep(1); setSelectedPlan(null); setCheckoutError(""); }}
                  style={{
                    flex: "0 0 auto", height: 50, paddingInline: 24, borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                    color: "rgba(255,255,255,0.5)", fontFamily: "'Space Grotesk'", fontSize: 14,
                    fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                >
                  ← Back
                </button>

                <button
                  onClick={handleEnroll}
                  disabled={!selectedPlan || loading}
                  style={{
                    flex: 1, height: 50, borderRadius: 14, border: "none",
                    background: selectedPlan && !loading
                      ? "linear-gradient(135deg, hsl(38 95% 54%), hsl(24 90% 50%))"
                      : "hsl(35 90% 55% / 0.25)",
                    color: selectedPlan && !loading ? "white" : "rgba(255,255,255,0.3)",
                    fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 600,
                    cursor: selectedPlan && !loading ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 8, transition: "all 0.2s",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                      Redirecting…
                    </>
                  ) : (
                    <>
                      {selectedPlan ? `Proceed with ${PLANS.find(p => p.id === selectedPlan)!.name}` : "Select a Plan to Continue"}
                      {selectedPlan && <ArrowRight style={{ width: 15, height: 15 }} />}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
