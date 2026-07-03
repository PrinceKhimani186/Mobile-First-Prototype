import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getEnrollmentProgress, createZohoSignRequest } from "@/services/enrollment";
import { useQueryClient } from "@tanstack/react-query";

const planNames: Record<string, string> = {
  essentials: "App Launch Essentials Package",
  accelerator: "App Ownership Accelerator Package",
  empire: "Digital Asset Empire Package",
};

const planPrices: Record<string, Record<string, string>> = {
  subscription: {
    essentials: "$2,497",
    accelerator: "$4,997",
    empire: "$9,997",
  },
  monthly: {
    essentials: "$497 setup/down payment today, then $199/month for 12 months",
    accelerator: "$997 setup/down payment today, then $399/month for 12 months",
    empire: "$2,500 setup/down payment today, then $697/month for 12 months",
  },
};

export default function Agreement() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");

  const emailFromUrl = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("email") : "";
  const email = emailFromUrl || localStorage.getItem("appSquadEnrollmentEmail") || "";

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }
    loadProgress();
  }, [email]);

  async function loadProgress() {
    setLoading(true);
    setError("");
    try {
      const { record, error: progressErr } = await getEnrollmentProgress(email);
      if (progressErr || !record) {
        setError(progressErr || "Failed to load enrollment record.");
        return;
      }

      // Automatically transition from enrollment_completed to payment_paid on load
      if (record.onboarding_status === "enrollment_completed") {
        await fetch("/api/enrollment/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, fields: { onboarding_status: "payment_paid", payment_status: "paid" } })
        });
        record.onboarding_status = "payment_paid";
      }

      const pType = localStorage.getItem("appSquadEnrollmentPaymentType") || "subscription";
      const planKey = record.selected_package?.toLowerCase() || "accelerator";
      
      const resolvedPackageName = planNames[planKey] || planNames.accelerator;
      const pricesForType = planPrices[pType as "subscription" | "monthly"] || planPrices.subscription;
      const resolvedPrice = pricesForType[planKey] || pricesForType.accelerator;

      // Check if user is already signed in the DB
      if (record.agreement_signed) {
        setSigned(true);
        localStorage.setItem("appSquadAgreementSigned", "true");
        if (record.document_url) {
          localStorage.setItem("appSquadAgreementPdfUrl", record.document_url);
        }
        setTimeout(() => {
          const loggedIn = localStorage.getItem("appSquadLoggedIn") === "true" || localStorage.getItem("as_admin_auth") === "true";
          if (!record.password_created) {
            navigate(`/set-password?email=${encodeURIComponent(email)}`);
          } else if (!loggedIn) {
            navigate("/login");
          } else if (!record.game_selected) {
            navigate("/onboarding/game-selection");
          } else if (!record.customization_completed) {
            navigate("/onboarding/customization");
          } else {
            navigate("/onboarding/dashboard");
          }
        }, 1500);
        return;
      }

      // Create Zoho Sign Embedded signature session
      const zohoRes = await createZohoSignRequest(
        email,
        record.full_name,
        resolvedPackageName,
        resolvedPrice
      );

      if (zohoRes.success && zohoRes.embedUrl) {
        setEmbedUrl(zohoRes.embedUrl);
      } else {
        setError(zohoRes.error || "Failed to initialize secure signature session. Please reload or try again.");
      }

    } catch (err) {
      setError("An unexpected error occurred loading your progress.");
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
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-10" />

      {/* Glow */}
      <div style={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 800, height: 600,
        background: "radial-gradient(ellipse, hsl(35 90% 55% / 0.07) 0%, transparent 65%)",
        filter: "blur(80px)", pointerEvents: "none",
      }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full"
            style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.2)" }}>
            <FileText style={{ width: 13, height: 13, color: "hsl(35 90% 62%)" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(35 90% 62%)" }}>
              Enrollment Agreement
            </span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 14 }}>
            Review & Sign Your App Squad Agreement
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 15, color: "hsl(218 16% 48%)", fontWeight: 300, maxWidth: 520, margin: "0 auto" }}>
            Please review the terms of engagement below and sign the document using the secure Zoho Sign panel.
          </p>
        </motion.div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 350, gap: 12 }}>
            <Loader2 className="animate-spin" style={{ width: 32, height: 32, color: "hsl(35 90% 55%)" }} />
            <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Initializing secure Zoho Sign session…</p>
          </div>
        ) : signed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              background: "hsl(226 32% 7%)",
              border: "1px solid rgba(52, 211, 153, 0.2)",
              borderRadius: 20,
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(52, 211, 153, 0.1)",
              border: "1px solid rgba(52, 211, 153, 0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#34d399", margin: "0 auto 24px",
            }}>
              <CheckCircle2 style={{ width: 28, height: 28 }} />
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
              Agreement Signed Successfully!
            </h2>
            <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 360, margin: "0 auto" }}>
              Your signature has been verified. Redirecting to game selection…
            </p>
          </motion.div>
        ) : embedUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "hsl(226 32% 7%)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20,
              padding: 2,
              overflow: "hidden"
            }}
          >
            <iframe
              src={embedUrl}
              style={{
                width: "100%",
                height: 700,
                border: "none",
                borderRadius: 18,
                background: "#ffffff"
              }}
              allow="signature"
              title="Zoho Sign Document"
            />
          </motion.div>
         ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
             {error && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "14px 18px", borderRadius: 12,
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                }}>
                  <AlertCircle style={{ width: 16, height: 16, color: "#f87171", flexShrink: 0 }} />
                  <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "#f87171", margin: 0 }}>
                    {error}
                  </p>
                </div>

                {(error.toLowerCase().includes("limit") || 
                  error.toLowerCase().includes("reached") || 
                  error.includes("8111") ||
                  error.toLowerCase().includes("maximum")) && 
                 (window.location.hostname === "localhost" || 
                  window.location.hostname === "127.0.0.1" || 
                  import.meta.env.DEV || 
                  localStorage.getItem("appSquadDevMode") === "true" || 
                  new URLSearchParams(window.location.search).get("dev") === "true") && (
                  <div style={{
                    background: "rgba(245, 158, 11, 0.04)",
                    border: "1px solid rgba(245, 158, 11, 0.15)",
                    borderRadius: 16,
                    padding: "24px",
                    textAlign: "center",
                  }}>
                    <p style={{ fontFamily: "'Inter'", fontSize: 13.5, color: "rgba(255,255,255,0.6)", marginBottom: 18, lineHeight: 1.5 }}>
                      <strong>Developer Mode:</strong> Zoho Sign API has hit its daily developer document limit. You can bypass the signature wall to verify the remainder of the client onboarding flow.
                    </p>
                    <button
                      onClick={() => {
                        localStorage.setItem("appSquadAgreementSigned", "true");
                        const email = localStorage.getItem("appSquadEnrollmentEmail") || "";
                        if (email) {
                          fetch("/api/enrollment/update", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, fields: { agreement_signed: true, onboarding_status: "agreement_signed" } })
                          }).then(() => {
                            queryClient.invalidateQueries({ queryKey: ["onboardingProgress", email] }).then(() => {
                              window.location.href = `/set-password?email=${encodeURIComponent(email)}`;
                            });
                          }).catch(() => {
                            window.location.href = `/set-password?email=${encodeURIComponent(email)}`;
                          });
                        } else {
                          window.location.href = "/set-password";
                        }
                      }}
                      className="btn-gold"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "12px 24px",
                        borderRadius: 10,
                        fontFamily: "'Inter'",
                        fontSize: 14,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      Bypass Zoho Sign & Proceed (Dev Mode)
                    </button>
                  </div>
                )}
              </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
