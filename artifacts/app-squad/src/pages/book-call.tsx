import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Calendar, CheckCircle2, Clock, Phone, Zap, ArrowRight,
  Shield, Target, Layers, DollarSign, Store, Rocket, ListChecks,
} from "lucide-react";
import { useLocation } from "wouter";
import { sendCallBookedToCRM } from "@/lib/crm";

// ─── Replace with your Calendly scheduling URL ────────────────────────────────
// e.g. "https://calendly.com/yourname/strategy-call"
const CALENDLY_URL = "";
// ─────────────────────────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const COVER_CARDS = [
  { icon: Target, title: "Your App Goals", desc: "We'll review what you're looking to accomplish with your mobile game app." },
  { icon: Layers, title: "Game Template Direction", desc: "We'll look at game styles that match your interests and audience." },
  { icon: DollarSign, title: "Monetization Preparation", desc: "We'll walk through how apps are set up for ad revenue and in-app purchases." },
  { icon: Store, title: "Publishing Assistance", desc: "We'll explain how App Squad guides you through App Store and Google Play submission." },
  { icon: Rocket, title: "Package Recommendation", desc: "We'll recommend the best launch path based on your goals and budget." },
  { icon: ListChecks, title: "Next Steps", desc: "If it's a fit, we'll walk through your agreement, payment, and onboarding timeline." },
];

export default function BookCall() {
  const [, navigate] = useLocation();
  const [booked, setBooked] = useState(false);

  // ── Listen for Calendly "event_scheduled" and update GHL ────────────────────
  useEffect(() => {
    function onCalendlyEvent(e: MessageEvent) {
      if (e.data?.event !== "calendly.event_scheduled") return;

      setBooked(true);

      // Grab contact info saved earlier in the funnel
      const app = (() => {
        try { return JSON.parse(localStorage.getItem("as_application") || "null"); } catch { return null; }
      })();
      const lead = (() => {
        try { return JSON.parse(localStorage.getItem("as_lead") || "null"); } catch { return null; }
      })();

      const name   = app?.name   || lead?.name   || "";
      const email  = app?.email  || lead?.email  || "";
      const phone  = app?.phone  || lead?.phone  || "";
      const source = app?.source || lead?.source || localStorage.getItem("as_source") || "Direct";

      // Calendly passes scheduled start time inside payload
      const scheduledTime: string | undefined =
        e.data?.payload?.event?.start_time ?? undefined;

      sendCallBookedToCRM({ name, email, phone, source, scheduledTime });
    }

    window.addEventListener("message", onCalendlyEvent);
    return () => window.removeEventListener("message", onCalendlyEvent);
  }, []);

  // ── Inject Calendly widget script once ──────────────────────────────────────
  useEffect(() => {
    if (!CALENDLY_URL) return;
    const id = "calendly-widget-script";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen pt-8 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-22" />
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-1/4 w-[600px] h-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(ellipse at center, hsl(35 90% 55% / 0.14) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full opacity-8"
          style={{
            background: "radial-gradient(ellipse at center, hsl(217 85% 58% / 0.1) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="container mx-auto px-5 md:px-8 max-w-5xl relative z-10">
        {/* Header */}
        <FadeUp className="text-center mb-12 md:mb-16">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
            style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.22)" }}
          >
            <Calendar className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 62%)" }} />
            <span
              style={{
                fontFamily: "'Inter'", fontSize: 11, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(35 90% 65%)",
              }}
            >
              Strategy Call
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk'",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14,
            }}
          >
            Book Your App Launch Strategy Call
          </h1>
          <p
            style={{
              fontFamily: "'Inter'", fontSize: 15, lineHeight: 1.7,
              color: "hsl(218 16% 55%)", fontWeight: 300, maxWidth: 560, margin: "0 auto",
            }}
          >
            On this call, our team will review your goals, game interests, budget range, timeline,
            and the best app launch path for your situation.
          </p>
        </FadeUp>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 xl:gap-14 items-start">
          {/* Left — What we'll cover */}
          <div>
            <FadeUp>
              <h2
                style={{
                  fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700,
                  letterSpacing: "-0.02em", marginBottom: 16,
                }}
              >
                What We'll Cover
              </h2>
            </FadeUp>
            <div className="flex flex-col gap-3.5">
              {COVER_CARDS.map((c, i) => {
                const Icon = c.icon;
                return (
                  <FadeUp key={c.title} delay={i * 0.055}>
                    <div
                      className="flex gap-4 p-5 rounded-2xl transition-all duration-300"
                      style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 14%)" }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "hsl(35 90% 55% / 0.22)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "hsl(224 22% 14%)")}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "hsl(35 90% 55% / 0.1)", border: "1px solid hsl(35 90% 55% / 0.2)" }}
                      >
                        <Icon className="w-4 h-4" style={{ color: "hsl(35 90% 62%)" }} />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontFamily: "'Space Grotesk'", fontSize: 14,
                            fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 4,
                          }}
                        >
                          {c.title}
                        </h3>
                        <p
                          style={{
                            fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.65,
                            color: "hsl(218 16% 48%)", fontWeight: 300,
                          }}
                        >
                          {c.desc}
                        </p>
                      </div>
                    </div>
                  </FadeUp>
                );
              })}
            </div>

            <FadeUp delay={0.4} className="mt-5">
              <div
                className="flex gap-3 p-4 rounded-xl"
                style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}
              >
                <Zap className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(35 90% 55%)" }} />
                <p
                  style={{
                    fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65,
                    color: "hsl(218 16% 44%)", fontWeight: 300,
                  }}
                >
                  During your call, our team may walk you through additional market examples and game template options.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.45} className="mt-4">
              <div
                className="flex gap-3 p-4 rounded-xl"
                style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}
              >
                <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(218 16% 34%)" }} />
                <p
                  style={{
                    fontFamily: "'Inter'", fontSize: 11, lineHeight: 1.7,
                    color: "hsl(218 16% 34%)", fontWeight: 300,
                  }}
                >
                  App Squad provides custom mobile game app development, monetization preparation, and app store
                  publishing assistance. App Squad does not guarantee earnings, downloads, rankings, app approvals,
                  ad revenue, in-app purchase revenue, profits, or return on investment. Results vary and depend on
                  marketing, user engagement, platform rules, audience demand, app quality, consistency, and
                  third-party approval processes.
                </p>
              </div>
            </FadeUp>
          </div>

          {/* Right — Booking card */}
          <FadeUp delay={0.1}>
            <div className="lg:sticky lg:top-24">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "hsl(226 32% 8%)",
                  border: "1px solid hsl(224 22% 14%)",
                  boxShadow: "0 32px 64px -20px hsl(228 42% 4% / 0.8)",
                }}
              >
                <div className="px-7 pt-7 pb-6">
                  {booked ? (
                    /* ── Confirmation state ── */
                    <div className="flex flex-col items-center text-center gap-5 py-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: "hsl(142 70% 45% / 0.12)", border: "1px solid hsl(142 70% 45% / 0.3)" }}
                      >
                        <CheckCircle2 className="w-8 h-8" style={{ color: "hsl(142 70% 52%)" }} />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontFamily: "'Space Grotesk'", fontSize: 20,
                            fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8,
                          }}
                        >
                          Call Booked!
                        </h3>
                        <p
                          style={{
                            fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.65,
                            color: "hsl(218 16% 50%)", fontWeight: 300,
                          }}
                        >
                          You'll receive a confirmation email shortly. Our team is looking forward to
                          speaking with you!
                        </p>
                      </div>
                    </div>
                  ) : CALENDLY_URL ? (
                    /* ── Live Calendly embed ── */
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-4 w-full justify-center"
                        style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 40%)" }}>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 55%)" }} />
                          30 minutes
                        </span>
                        <span className="w-px h-4" style={{ background: "hsl(224 22% 16%)" }} />
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 55%)" }} />
                          Phone or video
                        </span>
                      </div>
                      {/* Calendly inline widget */}
                      <div
                        className="calendly-inline-widget w-full rounded-xl overflow-hidden"
                        data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=0b0f14&text_color=f0f4ff&primary_color=f5a623`}
                        style={{ minWidth: 280, height: 630 }}
                      />
                    </div>
                  ) : (
                    /* ── Placeholder (no Calendly URL set yet) ── */
                    <div className="flex flex-col items-center text-center gap-5">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: "hsl(35 90% 55% / 0.12)", border: "1px solid hsl(35 90% 55% / 0.25)" }}
                      >
                        <Calendar className="w-7 h-7" style={{ color: "hsl(35 90% 62%)" }} />
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: "'Inter'", fontSize: 11, fontWeight: 600,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            color: "hsl(35 90% 55%)", marginBottom: 6,
                          }}
                        >
                          Calendly
                        </p>
                        <h3
                          style={{
                            fontFamily: "'Space Grotesk'", fontSize: 19,
                            fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6,
                          }}
                        >
                          Schedule My Strategy Call
                        </h3>
                        <p
                          style={{
                            fontFamily: "'Inter'", fontSize: 13, lineHeight: 1.65,
                            color: "hsl(218 16% 44%)", fontWeight: 300,
                          }}
                        >
                          Your booking widget will appear here once Calendly is connected.
                        </p>
                      </div>

                      <div
                        className="w-full rounded-xl min-h-[180px] flex items-center justify-center"
                        style={{ background: "hsl(226 28% 6%)", border: "1px dashed hsl(224 22% 18%)" }}
                      >
                        <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 28%)" }}>
                          Calendly embed goes here
                        </p>
                      </div>

                      <div
                        className="flex items-center gap-5 w-full justify-center"
                        style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 40%)" }}
                      >
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 55%)" }} />
                          30 minutes
                        </span>
                        <span className="w-px h-4" style={{ background: "hsl(224 22% 16%)" }} />
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 55%)" }} />
                          Phone or video
                        </span>
                      </div>

                      <button
                        className="btn-gold w-full h-12 text-[14px] font-semibold rounded-xl flex items-center justify-center gap-2.5 text-white"
                        disabled
                        style={{ opacity: 0.4, cursor: "not-allowed" }}
                      >
                        Schedule My Strategy Call
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => { navigate("/apply"); window.scrollTo({ top: 0 }); }}
                    className="mt-5 w-full text-center block"
                    style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 32%)", cursor: "pointer" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "hsl(35 90% 60%)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "hsl(218 16% 32%)")}
                  >
                    ← Back to qualification form
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
