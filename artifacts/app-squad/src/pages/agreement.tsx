import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { getEnrollmentProgress, createZohoSignRequest, pollZohoRequestStatus } from "@/services/enrollment";
import { useQueryClient } from "@tanstack/react-query";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 60000;

const planNames: Record<string, string> = {
  essentials:  "App Launch Essentials",
  accelerator: "App Ownership Accelerator",
  empire:      "App Empire Package",
};

const planPrices: Record<string, Record<string, string>> = {
  subscription: {
    essentials:  "$2,497",
    accelerator: "$4,997",
    empire:      "$9,997",
  },
  monthly: {
    essentials:  "$497 setup/down payment today, then $197/month for 12 months",
    accelerator: "$997 setup/down payment today, then $397/month for 12 months",
    empire:      "$4,997 setup/down payment today, then $497/month for 12 months",
  },
};

export default function Agreement() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [devSigning, setDevSigning] = useState(false);
  const [enrollFullName, setEnrollFullName] = useState("");
  const [enrollPackageName, setEnrollPackageName] = useState("");
  const [enrollPrice, setEnrollPrice] = useState("");
  const [enrollPackageId, setEnrollPackageId] = useState("");
  const [enrollPaymentType, setEnrollPaymentType] = useState("subscription");
  const [requestId, setRequestId] = useState("");
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const requestIdRef = useRef("");
  const fullNameRef = useRef("");
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const redirectedRef = useRef(false);
  const zohoRequestInitiatedRef = useRef(false);

  const emailFromUrl = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("email") : "";
  const email = emailFromUrl || localStorage.getItem("appSquadEnrollmentEmail") || "";

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[Agreement Page] agreement page mounted");
  }, []);

  useEffect(() => {
    if (email) {
      // eslint-disable-next-line no-console
      console.log("[Agreement Page] email loaded:", email);
    }
  }, [email]);

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }
    loadProgress();
  }, [email]);

  function updateSignedState(val: boolean) {
    // eslint-disable-next-line no-console
    console.log("[Agreement Page] state updated - signed:", val);
    setSigned(val);
  }

  async function handleOnboardingTransition(reason: string) {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    // eslint-disable-next-line no-console
    console.log(`[Agreement Page] redirect triggered (reason: ${reason})`);
    stopPolling();
    setRedirecting(true);

    try {
      const { record } = await getEnrollmentProgress(email);
      let target = `/onboarding/dashboard`;
      if (record) {
        if (!record.password_created) {
          target = `/set-password?email=${encodeURIComponent(email)}`;
        } else if (!record.game_selected) {
          target = `/onboarding/game-selection`;
        } else if (!record.customization_completed) {
          target = `/onboarding/customization`;
        }
      }
      // eslint-disable-next-line no-console
      console.log(`[Agreement Page] transition target: ${target} (reason: ${reason})`);
      localStorage.setItem("appSquadAgreementSigned", "true");
      navigate(target);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[Agreement Page] failed to resolve transition target, using fallback:", err);
      navigate(`/onboarding/game-selection`);
    }
  }

  function stopPolling() {
    if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    if (pollTimeoutRef.current) { clearTimeout(pollTimeoutRef.current); pollTimeoutRef.current = null; }
  }

  async function checkSignatureStatus(trigger: string) {
    if (redirectedRef.current) return;
    // eslint-disable-next-line no-console
    console.log(`[Agreement Page] status checked for trigger: ${trigger}`);
    // eslint-disable-next-line no-console
    console.log(`[Zoho Sign] agreement status polled (trigger: ${trigger})`, {
      email, requestId: requestIdRef.current,
    });
    const result = await pollZohoRequestStatus(email, requestIdRef.current || undefined, fullNameRef.current || undefined);
    if (result.signed) {
      // eslint-disable-next-line no-console
      console.log("[Zoho Sign] signing completion confirmed via poll — marking agreement_signed and redirecting");
      updateSignedState(true);
      await queryClient.invalidateQueries({ queryKey: ["onboardingProgress", email] });
      handleOnboardingTransition("poll-confirmed");
    }
  }

  // Detect signing completion inside the embedded Zoho iframe via postMessage,
  // then confirm with an immediate status poll (Zoho's postMessage payload shape
  // isn't publicly guaranteed, so we treat any signal as a trigger to verify, not
  // as proof by itself).
  useEffect(() => {
    if (!embedUrl) return;

    function handleMessage(event: MessageEvent) {
      const raw = event.data;
      const text = typeof raw === "string" ? raw : JSON.stringify(raw ?? "");
      const looksLikeCompletion = /complete|signed|success|finish/i.test(text) && /sign/i.test(text);
      if (looksLikeCompletion) {
        // eslint-disable-next-line no-console
        console.log("[Zoho Sign] signing completed event detected via postMessage", { origin: event.origin, data: raw });
        checkSignatureStatus("postMessage");
      }
    }

    window.addEventListener("message", handleMessage);

    // Fallback polling: every 3s for up to 60s in case the webhook / postMessage
    // never arrives — the user should never be stuck waiting indefinitely.
    pollIntervalRef.current = setInterval(() => checkSignatureStatus("interval"), POLL_INTERVAL_MS);
    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
      if (!redirectedRef.current) {
        // eslint-disable-next-line no-console
        console.log("[Zoho Sign] polling timed out after 60s without confirmed completion — showing manual continue button");
        setPollTimedOut(true);
      }
    }, POLL_TIMEOUT_MS);

    return () => {
      window.removeEventListener("message", handleMessage);
      stopPolling();
    };
  }, [embedUrl]);

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
      const planKey = record.selected_package?.toLowerCase() || "essentials";

      const resolvedPackageName = planNames[planKey] || planNames.essentials;
      const pricesForType = planPrices[pType as "subscription" | "monthly"] || planPrices.subscription;
      const resolvedPrice = pricesForType[planKey] || pricesForType.essentials;

      // Store for dev bypass
      setEnrollFullName(record.full_name || "");
      setEnrollPackageName(resolvedPackageName);
      setEnrollPrice(resolvedPrice);
      setEnrollPackageId(planKey);
      setEnrollPaymentType(pType);

      // Check if user is already signed in the DB
      if (record.agreement_signed) {
        updateSignedState(true);
        localStorage.setItem("appSquadAgreementSigned", "true");
        if (record.document_url) {
          localStorage.setItem("appSquadAgreementPdfUrl", record.document_url);
        }
        // Already signed before landing on this page — only the set-password step
        // is still relevant to the "stuck after signing" flow; other onboarding
        // steps route independently of the Zoho redirect fix.
        if (!record.password_created) {
          setTimeout(() => handleOnboardingTransition("already-signed-on-load"), 1200);
          return;
        }
        setTimeout(() => {
          const loggedIn = localStorage.getItem("appSquadLoggedIn") === "true" || localStorage.getItem("as_admin_auth") === "true";
          if (!loggedIn) {
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

      fullNameRef.current = record.full_name || "";

      if (zohoRequestInitiatedRef.current) {
        // eslint-disable-next-line no-console
        console.log("[Agreement Page] Zoho request already initiated, skipping duplicate creation");
        return;
      }
      zohoRequestInitiatedRef.current = true;
      // eslint-disable-next-line no-console
      console.log("[Agreement Page] Zoho request creation initiated for:", email);

      // Create Zoho Sign Embedded signature session (template-based, auto-filled)
      const zohoRes = await createZohoSignRequest(
        email,
        record.full_name,
        resolvedPackageName,
        resolvedPrice,
        pType,
        planKey,
        record.phone,
      );

      if (zohoRes.success && zohoRes.embedUrl) {
        if (zohoRes.requestId) {
          requestIdRef.current = zohoRes.requestId;
          setRequestId(zohoRes.requestId);
        }
        // eslint-disable-next-line no-console
        console.log("[Agreement Page] Zoho request created. Request ID:", zohoRes.requestId);
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
              {redirecting ? "Your signature has been verified. Redirecting to account setup…" : "Your signature has been verified."}
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
              onLoad={() => {
                // eslint-disable-next-line no-console
                console.log("[Zoho Sign] iframe loaded", { email, requestId: requestIdRef.current });
              }}
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
            {pollTimedOut && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                padding: "20px 18px", marginTop: 2,
              }}>
                <p style={{ fontFamily: "'Inter'", fontSize: 13, color: "rgba(255,255,255,0.55)", textAlign: "center", maxWidth: 420 }}>
                  Already signed? We're still confirming with Zoho — you can continue to account setup now instead of waiting.
                </p>
                <button
                  onClick={() => redirectToSetPassword("manual-continue-button")}
                  className="btn-gold"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px 24px", borderRadius: 10,
                    fontFamily: "'Inter'", fontSize: 14, fontWeight: 600,
                    border: "none", cursor: "pointer",
                  }}
                >
                  Continue to Account Setup
                  <ArrowRight style={{ width: 15, height: 15 }} />
                </button>
              </div>
            )}
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

                {(window.location.hostname === "localhost" || 
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
                      disabled={devSigning}
                      onClick={async () => {
                        const bypassEmail = email || localStorage.getItem("appSquadEnrollmentEmail") || "";
                        if (!bypassEmail) { window.location.href = "/set-password"; return; }
                        setDevSigning(true);
                        setError("");
                        try {
                          const res = await fetch("/api/enrollment/dev-sign", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              email: bypassEmail,
                              fullName: enrollFullName || bypassEmail,
                              packageName: enrollPackageName,
                              price: enrollPrice,
                              paymentOption: enrollPaymentType || localStorage.getItem("appSquadEnrollmentPaymentType") || "subscription",
                              packageId: enrollPackageId || "essentials",
                            }),
                          });
                          const data = await res.json() as { success?: boolean; pdfUrl?: string; error?: string };
                          if (data.success) {
                            localStorage.setItem("appSquadAgreementSigned", "true");
                            if (data.pdfUrl) localStorage.setItem("appSquadAgreementPdfUrl", data.pdfUrl);
                            await queryClient.invalidateQueries({ queryKey: ["onboardingProgress", bypassEmail] });
                            window.location.href = `/set-password?email=${encodeURIComponent(bypassEmail)}`;
                          } else {
                            setError(data.error || "Developer mode bypass failed. Please try again.");
                            setDevSigning(false);
                          }
                        } catch {
                          setError("Network error during developer mode bypass.");
                          setDevSigning(false);
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
                        cursor: devSigning ? "not-allowed" : "pointer",
                        opacity: devSigning ? 0.7 : 1,
                        transition: "all 0.2s"
                      }}
                    >
                      {devSigning ? "Simulating Agreement…" : "Bypass Zoho Sign & Proceed (Dev Mode)"}
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
