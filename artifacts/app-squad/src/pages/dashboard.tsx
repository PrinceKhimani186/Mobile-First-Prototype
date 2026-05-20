import { motion } from "framer-motion";
import { CheckCircle2, Clock, Loader2, LifeBuoy, Gamepad2, Palette, BarChart3, Store, CalendarClock, ListChecks, ArrowRight, Play } from "lucide-react";
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
  { stage: "Intake Received", status: "complete", note: "Your project has been queued.", date: "Completed 3 days ago" },
  { stage: "Game Customization", status: "in-progress", note: "Team is working on your game build.", date: "In Progress" },
  { stage: "Monetization Setup", status: "pending", note: "", date: "Est. 2 weeks" },
  { stage: "Testing & QA", status: "pending", note: "", date: "Est. 3 weeks" },
  { stage: "Client Review", status: "pending", note: "", date: "Est. 4-5 weeks" },
  { stage: "App Store Submission", status: "pending", note: "", date: "Est. 6-8 weeks" },
  { stage: "Launch Support", status: "pending", note: "", date: "Est. 8-10 weeks" },
];

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-4rem)] py-12 relative"
    >
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="container mx-auto px-4 max-w-6xl relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-primary text-sm font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/>
              Client Portal
            </p>
            <h1 className="text-4xl md:text-5xl font-bold">Launch Dashboard</h1>
            <p className="text-muted-foreground text-base mt-3">Track the progress of your custom mobile game build.</p>
          </div>
          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/[0.05] hover:border-white/20 shrink-0 h-12 px-6 rounded-xl"
            data-testid="button-support-ticket"
          >
            <LifeBuoy className="w-5 h-5 mr-2 text-primary" />
            Submit Support Ticket
          </Button>
        </div>

        {/* Status Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
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
              <div className={cn(
                "glass rounded-2xl p-5 flex flex-col justify-between h-28 border-2 transition-all",
                card.status === "active" ? "border-primary/40 bg-primary/5 shadow-[0_0_20px_-5px_hsl(217_91%_60%_/_0.2)] animate-pulse shadow-primary/20" : 
                card.status === "complete" ? "border-emerald-500/20 bg-emerald-500/5" :
                "border-white/5"
              )}
              style={card.status === "active" ? { animationDuration: '3s' } : {}}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{card.label}</span>
                  <card.icon className={cn(
                    "w-5 h-5",
                    card.status === "complete" ? "text-emerald-400" :
                    card.status === "active" ? "text-primary" :
                    card.status === "info" ? "text-accent" :
                    "text-muted-foreground/40"
                  )} />
                </div>
                <span className={cn(
                  "text-lg font-bold leading-tight",
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
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Timeline */}
          <div className="lg:col-span-2 glass rounded-3xl p-8 md:p-12 border-2 border-white/5 shadow-xl">
            <h2 className="text-2xl font-bold mb-10 flex items-center gap-3">
              Development Roadmap
            </h2>

            <div className="relative ml-2">
              <div className="absolute left-[23px] top-6 bottom-6 w-1 bg-gradient-to-b from-primary/80 via-primary/20 to-white/[0.06] rounded-full" />

              <div className="space-y-10">
                {TIMELINE.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex gap-6 items-start relative group"
                    data-testid={`timeline-stage-${i}`}
                  >
                    <div className="relative z-10 shrink-0 mt-1">
                      {item.status === "complete" && (
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_15px_-3px_hsl(142_71%_45%_/_0.5)]">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                      )}
                      {item.status === "in-progress" && (
                        <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center relative bg-primary/10 shadow-[0_0_20px_-3px_hsl(217_91%_60%_/_0.6)]">
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        </div>
                      )}
                      {item.status === "pending" && (
                        <div className="w-12 h-12 rounded-full border-2 border-white/10 bg-background flex items-center justify-center group-hover:border-white/20 transition-colors">
                          <Clock className="w-5 h-5 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 pt-1.5 bg-white/[0.02] rounded-2xl p-4 border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={cn("text-lg font-bold flex items-center gap-3", item.status === "pending" ? "text-muted-foreground/60" : "text-foreground")}>
                            <span className="text-xs font-black text-muted-foreground/40 mt-0.5">{(i + 1).toString().padStart(2, '0')}</span>
                            {item.stage}
                          </h3>
                          {item.note && (
                            <p className={cn("text-sm mt-1.5 font-medium", item.status === "complete" ? "text-emerald-400/80" : "text-primary/90")}>
                              {item.note}
                            </p>
                          )}
                        </div>
                        <span className={cn(
                          "text-xs font-bold px-2.5 py-1 rounded-md whitespace-nowrap",
                          item.status === "complete" ? "bg-emerald-500/10 text-emerald-400" :
                          item.status === "in-progress" ? "bg-primary/10 text-primary" :
                          "bg-white/5 text-muted-foreground/60"
                        )}>
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* SaaS Widget Style Stats */}
            <div className="glass rounded-3xl p-8 border-2 border-white/5 shadow-xl relative overflow-hidden">
               <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <h3 className="text-sm font-bold mb-6 text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                Project Metrics
                <BarChart3 className="w-4 h-4" />
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-background/50 rounded-2xl p-4 border border-white/5">
                  <div className="text-2xl font-bold text-foreground">3</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">Days Elapsed</div>
                </div>
                <div className="bg-background/50 rounded-2xl p-4 border border-white/5">
                  <div className="text-2xl font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">Open Tickets</div>
                </div>
              </div>

              <div className="bg-background/50 rounded-2xl p-5 border border-white/5 mb-6">
                <div className="flex justify-between items-end mb-2">
                   <div>
                     <div className="text-xs text-muted-foreground font-medium mb-1">Revisions Used</div>
                     <div className="text-xl font-bold">0 / 3</div>
                   </div>
                   {/* Sparkline decoration */}
                   <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary/40">
                      <path d="M2 22L15 12L25 18L40 6L58 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </div>
              </div>

              {/* Next Action CTA */}
              <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20 mt-2">
                <div className="flex items-start gap-3">
                   <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                     <Play className="w-4 h-4 text-primary ml-0.5" />
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-primary mb-1">Next Action Required</h4>
                     <p className="text-xs text-foreground/80 leading-relaxed mb-3">Upload your brand assets to proceed to monetization setup.</p>
                     <Button size="sm" className="h-8 text-xs font-bold w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        Upload Assets <ArrowRight className="w-3 h-3 ml-1" />
                     </Button>
                   </div>
                </div>
              </div>

            </div>

            {/* Current Phase Widget */}
            <div className="glass rounded-3xl p-8 border-2 border-white/5 shadow-xl">
              <h3 className="text-sm font-bold mb-6 text-muted-foreground uppercase tracking-wider">Active Phase</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-inner">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
                <div>
                  <p className="font-bold text-base">Game Customization</p>
                  <p className="text-sm text-primary font-medium mt-0.5">In Progress</p>
                </div>
              </div>
              <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_hsl(217_91%_60%_/_0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: "28%" }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-medium text-right">Stage 2 of 7 — 28%</p>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
