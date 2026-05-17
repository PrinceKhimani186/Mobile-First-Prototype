import { motion } from "framer-motion";
import { CheckCircle2, Clock, Loader2, LifeBuoy, Gamepad2, Palette, BarChart3, Store, CalendarClock, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_CARDS = [
  { label: "Game Type", value: "Selected", icon: Gamepad2, status: "complete" },
  { label: "Branding", value: "In Review", icon: Palette, status: "active" },
  { label: "Monetization", value: "Pending", icon: BarChart3, status: "pending" },
  { label: "App Store", value: "Not Started", icon: Store, status: "pending" },
  { label: "Timeline", value: "8–12 weeks", icon: CalendarClock, status: "info" },
  { label: "Checklist", value: "2 of 7 Done", icon: ListChecks, status: "info" },
];

const TIMELINE = [
  { stage: "Intake Received", status: "complete", note: "Your project has been queued." },
  { stage: "Game Customization", status: "in-progress", note: "Team is working on your game build." },
  { stage: "Monetization Setup", status: "pending", note: "" },
  { stage: "Testing & QA", status: "pending", note: "" },
  { stage: "Client Review", status: "pending", note: "" },
  { stage: "App Store Submission", status: "pending", note: "" },
  { stage: "Launch Support", status: "pending", note: "" },
];

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-4rem)] py-12"
    >
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
          <div>
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">Client Portal</p>
            <h1 className="text-3xl md:text-4xl font-bold">Your App Launch Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Track the progress of your custom mobile game build.</p>
          </div>
          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/[0.05] hover:border-white/20 shrink-0"
            data-testid="button-support-ticket"
          >
            <LifeBuoy className="w-4 h-4 mr-2 text-primary" />
            Submit Support Ticket
          </Button>
        </div>

        {/* Status Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
        >
          {STATUS_CARDS.map((card) => (
            <motion.div
              key={card.label}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              data-testid={`status-card-${card.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              <div className="glass rounded-xl p-4 flex flex-col gap-3 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</span>
                  <card.icon className={cn(
                    "w-3.5 h-3.5",
                    card.status === "complete" ? "text-emerald-400" :
                    card.status === "active" ? "text-primary" :
                    card.status === "info" ? "text-accent" :
                    "text-muted-foreground/40"
                  )} />
                </div>
                <span className={cn(
                  "text-sm font-semibold leading-tight",
                  card.status === "complete" ? "text-emerald-400" :
                  card.status === "active" ? "text-primary" :
                  card.status === "info" ? "text-foreground" :
                  "text-muted-foreground"
                )}>
                  {card.value}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Timeline */}
          <div className="lg:col-span-3 glass rounded-2xl p-7 md:p-9">
            <h2 className="text-lg font-bold mb-8">Development Roadmap</h2>

            <div className="relative">
              <div className="absolute left-[19px] top-5 bottom-5 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-white/[0.06]" />

              <div className="space-y-8">
                {TIMELINE.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex gap-5 items-start"
                    data-testid={`timeline-stage-${i}`}
                  >
                    <div className="relative z-10 shrink-0">
                      {item.status === "complete" && (
                        <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_12px_-3px_hsl(142_71%_45%_/_0.4)]">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                      )}
                      {item.status === "in-progress" && (
                        <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center relative bg-primary/10 shadow-[0_0_16px_-3px_hsl(217_91%_60%_/_0.5)]">
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        </div>
                      )}
                      {item.status === "pending" && (
                        <div className="w-10 h-10 rounded-full border border-white/10 bg-card/50 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="pt-2.5">
                      <h3 className={cn("text-sm font-semibold", item.status === "pending" ? "text-muted-foreground/50" : "text-foreground")}>
                        {item.stage}
                      </h3>
                      {item.note && (
                        <p className={cn("text-xs mt-1", item.status === "complete" ? "text-emerald-400/70" : "text-primary/80")}>
                          {item.note}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-bold mb-5 text-muted-foreground uppercase tracking-wider">Current Phase</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
                <div>
                  <p className="font-bold text-sm">Game Customization</p>
                  <p className="text-xs text-primary mt-0.5">In Progress</p>
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "28%" }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Stage 2 of 7 — 28% complete</p>
            </div>

            <div className="glass rounded-2xl p-6 flex-1">
              <h3 className="text-sm font-bold mb-5 text-muted-foreground uppercase tracking-wider">Quick Stats</h3>
              <div className="space-y-4">
                {[
                  { label: "Days since intake", value: "3" },
                  { label: "Estimated completion", value: "~9 weeks" },
                  { label: "Open tickets", value: "0" },
                  { label: "Revisions used", value: "0 of 3" },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center text-sm border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                    <span className="text-muted-foreground text-xs">{stat.label}</span>
                    <span className="font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
