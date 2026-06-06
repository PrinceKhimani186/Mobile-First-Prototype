import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, Circle, Gamepad2, Palette,
  Store, Rocket, Layers, TestTube2, LifeBuoy, User,
  Eye, PhoneCall, PackageCheck, Wand2,
} from "lucide-react";
import { updateProjectStatusInCRM } from "@/lib/crm";

const CALENDLY_URL = "https://calendly.com/appguyofficial/30min";

interface TimelineStage {
  label: string;
  icon: React.ElementType;
  status: "complete" | "active" | "pending";
  pct: number;
  description?: string;
  cta?: { label: string; href: string };
}

const buildTimeline = (hasGameSelection: boolean, hasCustomization: boolean): TimelineStage[] => [
  {
    label: "Project Received",
    icon: CheckCircle2,
    status: "complete",
    pct: 10,
  },
  {
    label: "Brand Review",
    icon: Palette,
    status: hasGameSelection ? "complete" : "active",
    pct: 20,
  },
  {
    label: "Customization",
    icon: Wand2,
    status: hasCustomization ? "complete" : hasGameSelection ? "active" : "pending",
    pct: 35,
  },
  {
    label: "Development",
    icon: Layers,
    status: hasCustomization ? "active" : "pending",
    pct: 60,
    description: "Our development team is building your app.",
  },
  {
    label: "Testing",
    icon: TestTube2,
    status: "pending",
    pct: 75,
  },
  {
    label: "Demo Ready For Review",
    icon: Eye,
    status: "pending",
    pct: 85,
    description: "Your app demo is ready for review. Please review functionality, branding, and overall experience before publishing.",
  },
  {
    label: "Publish Strategy Call",
    icon: PhoneCall,
    status: "pending",
    pct: 90,
    description: "Before publishing your app, we need to complete a Publish Strategy Call to review App Store & Google Play requirements, developer account setup, store assets, and your launch timeline.",
    cta: { label: "Schedule Publish Strategy Call", href: CALENDLY_URL },
  },
  {
    label: "Store Submission",
    icon: Store,
    status: "pending",
    pct: 95,
    description: "Your app is being prepared and submitted to the selected app marketplaces.",
  },
  {
    label: "App Launch",
    icon: Rocket,
    status: "pending",
    pct: 100,
    description: "Congratulations — your app is live and available for download.",
  },
];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
      <p style={{ fontFamily: "'Inter'", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 6 }}>{label}</p>
      <p style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2, color: "hsl(220 20% 90%)" }}>{value || "—"}</p>
      {sub && <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(218 16% 40%)", marginTop: 3, fontWeight: 300 }}>{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [gameSelection, setGameSelection] = useState<{ selectedGameType: string; gameCategory: string; templateName: string } | null>(null);
  const [customization, setCustomization] = useState<{ appName: string; tagline?: string; monetization?: string } | null>(null);

  useEffect(() => {
    const lead = JSON.parse(localStorage.getItem("as_lead") || "{}");
    const application = JSON.parse(localStorage.getItem("as_application") || "{}");
    const game = JSON.parse(localStorage.getItem("as_game_selection") || "null");
    const custom = JSON.parse(localStorage.getItem("as_customization") || "null");
    const src = localStorage.getItem("as_source") || "Direct";

    const name = application.name || lead.name || "";
    const em = application.email || lead.email || "";
    const ph = application.phone || lead.phone || "";

    setClientName(name);
    setEmail(em);
    setPhone(ph);
    setSource(src);
    setGameSelection(game);
    setCustomization(custom);

    updateProjectStatusInCRM({
      clientName: name,
      email: em,
      stage: custom ? "customization_submitted" : game ? "game_selected" : "intake_received",
      status: "dashboard_viewed",
      source: src,
    });
  }, []);

  const timeline = buildTimeline(!!gameSelection, !!customization);

  // Progress = percentage of the last completed/active stage
  const activeStage = [...timeline].reverse().find(s => s.status === "complete" || s.status === "active");
  const progressPct = activeStage?.pct ?? 10;

  const completedCount = timeline.filter(t => t.status === "complete").length;

  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-18" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, hsl(217 85% 58% / 0.06) 0%, transparent 65%)", filter: "blur(90px)" }} />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "hsl(142 76% 55%)" }} />
            <span style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(142 76% 55%)" }}>
              Client Portal — Live
            </span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>
            {clientName ? `Welcome back, ${clientName.split(" ")[0]}.` : "App Launch Dashboard"}
          </h1>
          <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "hsl(218 16% 48%)", fontWeight: 300 }}>
            {completedCount} of {timeline.length} launch stages complete.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left — stats + timeline */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Client stats */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="Client Name" value={clientName || "Not set"} />
                <StatCard label="Game Type" value={gameSelection?.selectedGameType || "Pending"} sub={gameSelection?.gameCategory} />
                <StatCard label="App Name" value={customization?.appName || "Pending"} />
                <StatCard label="Tagline" value={customization?.tagline || "Pending"} />
                <StatCard label="Monetization" value={customization?.monetization || "Pending"} />
                <StatCard label="Source" value={source || "Direct"} />
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="rounded-2xl p-6" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 38%)", marginBottom: 20 }}>
                App Launch Timeline
              </p>

              <div className="flex flex-col gap-0">
                {timeline.map((stage, i) => {
                  const Icon = stage.icon;
                  const isLast = i === timeline.length - 1;
                  const isComplete = stage.status === "complete";
                  const isActive = stage.status === "active";

                  return (
                    <div key={stage.label} className="flex gap-4">
                      {/* Line + icon */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
                          style={{
                            background: isComplete ? "hsl(142 76% 55% / 0.12)" : isActive ? "hsl(35 90% 55% / 0.12)" : "hsl(226 28% 7%)",
                            border: `1.5px solid ${isComplete ? "hsl(142 76% 55% / 0.4)" : isActive ? "hsl(35 90% 55% / 0.4)" : "hsl(224 22% 14%)"}`,
                          }}>
                          <Icon className="w-3.5 h-3.5" style={{
                            color: isComplete ? "hsl(142 76% 55%)" : isActive ? "hsl(35 90% 62%)" : "hsl(218 16% 32%)"
                          }} />
                        </div>
                        {!isLast && (
                          <div className="w-px flex-1 mt-1 mb-1" style={{
                            background: isComplete ? "hsl(142 76% 55% / 0.2)" : "hsl(224 22% 12%)",
                          }} />
                        )}
                      </div>

                      {/* Label + description + CTA */}
                      <div className="pb-5 pt-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p style={{
                            fontFamily: "'Inter'",
                            fontSize: 13.5,
                            fontWeight: stage.status === "pending" ? 300 : 500,
                            color: isComplete ? "hsl(220 20% 82%)" : isActive ? "hsl(35 90% 65%)" : "hsl(218 16% 36%)",
                          }}>
                            {stage.label}
                          </p>
                          {isComplete && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "hsl(142 76% 55% / 0.1)", color: "hsl(142 76% 55%)", border: "1px solid hsl(142 76% 55% / 0.25)" }}>
                              Complete
                            </span>
                          )}
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "hsl(35 90% 55% / 0.12)", color: "hsl(35 90% 62%)", border: "1px solid hsl(35 90% 55% / 0.28)" }}>
                              In Progress
                            </span>
                          )}
                          <span style={{
                            fontFamily: "'Inter'", fontSize: 10, fontWeight: 500,
                            color: isComplete ? "hsl(142 76% 55% / 0.6)" : isActive ? "hsl(35 90% 55% / 0.6)" : "hsl(218 16% 26%)",
                            marginLeft: "auto",
                          }}>
                            {stage.pct}%
                          </span>
                        </div>

                        {isActive && stage.description && (
                          <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.6, color: "hsl(218 16% 44%)", fontWeight: 300, marginBottom: stage.cta ? 10 : 0 }}>
                            {stage.description}
                          </p>
                        )}

                        {isActive && stage.cta && (
                          <a
                            href={stage.cta.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 7,
                              padding: "9px 16px",
                              borderRadius: 9,
                              fontFamily: "'Space Grotesk'",
                              fontSize: 12,
                              fontWeight: 600,
                              letterSpacing: "0.02em",
                              background: "linear-gradient(135deg, hsl(38 95% 54%) 0%, hsl(24 90% 50%) 100%)",
                              color: "#050505",
                              textDecoration: "none",
                              boxShadow: "0 0 24px rgba(245,158,11,0.2)",
                              transition: "opacity 0.15s",
                            }}
                          >
                            <PhoneCall style={{ width: 12, height: 12 }} />
                            {stage.cta.label}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right — progress ring + contact + support */}
          <div className="flex flex-col gap-4">

            {/* Progress ring */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-6 text-center" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsl(218 16% 36%)", marginBottom: 16 }}>
                Launch Progress
              </p>

              <div className="relative flex items-center justify-center mb-4">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="hsl(224 22% 12%)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="38" fill="none"
                    stroke="url(#prog)" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - progressPct / 100)}`}
                    transform="rotate(-90 50 50)"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                  <defs>
                    <linearGradient id="prog" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(38 95% 54%)" />
                      <stop offset="100%" stopColor="hsl(24 90% 50%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span style={{ fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
                    {progressPct}%
                  </span>
                </div>
              </div>

              <p style={{ fontFamily: "'Inter'", fontSize: 12, color: "hsl(218 16% 44%)", fontWeight: 300 }}>
                {completedCount} of {timeline.length} stages complete
              </p>

              {/* Stage breakdown */}
              <div style={{ marginTop: 16, borderTop: "1px solid hsl(224 22% 11%)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                {timeline.map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: s.status === "complete" ? "hsl(142 76% 55%)" : s.status === "active" ? "hsl(38 95% 54%)" : "hsl(224 22% 18%)",
                    }} />
                    <p style={{
                      fontFamily: "'Inter'", fontSize: 10.5,
                      color: s.status === "complete" ? "hsl(218 16% 52%)" : s.status === "active" ? "hsl(35 90% 62%)" : "hsl(218 16% 28%)",
                      fontWeight: s.status === "pending" ? 300 : 400,
                      flex: 1, textAlign: "left",
                    }}>{s.label}</p>
                    <p style={{ fontFamily: "'Inter'", fontSize: 10, color: s.status === "pending" ? "hsl(218 16% 22%)" : "hsl(218 16% 40%)" }}>{s.pct}%</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact info */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
              className="rounded-2xl p-5" style={{ background: "hsl(226 32% 8%)", border: "1px solid hsl(224 22% 13%)" }}>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-3.5 h-3.5" style={{ color: "hsl(218 16% 38%)" }} />
                <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(218 16% 38%)" }}>
                  Client Info
                </p>
              </div>
              {[
                { label: "Name", value: clientName },
                { label: "Email", value: email },
                { label: "Phone", value: phone },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5 mb-3 last:mb-0">
                  <p style={{ fontFamily: "'Inter'", fontSize: 10, color: "hsl(218 16% 34%)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</p>
                  <p style={{ fontFamily: "'Inter'", fontSize: 13, color: value ? "hsl(218 16% 60%)" : "hsl(218 16% 28%)", fontWeight: 300 }}>{value || "Not provided"}</p>
                </div>
              ))}
            </motion.div>

            {/* Support note */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
              className="rounded-2xl p-5" style={{ background: "hsl(226 28% 6%)", border: "1px solid hsl(224 22% 11%)" }}>
              <div className="flex items-center gap-2 mb-3">
                <LifeBuoy className="w-3.5 h-3.5" style={{ color: "hsl(217 85% 60%)" }} />
                <p style={{ fontFamily: "'Inter'", fontSize: 11, fontWeight: 600, color: "hsl(217 85% 65%)" }}>
                  App Squad Support
                </p>
              </div>
              <p style={{ fontFamily: "'Inter'", fontSize: 12, lineHeight: 1.65, color: "hsl(218 16% 38%)", fontWeight: 300 }}>
                Your team will reach out to confirm next steps and collect any remaining materials before development begins.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
