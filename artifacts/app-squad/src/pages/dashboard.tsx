import { motion } from "framer-motion";
import { CheckCircle2, Clock, Check, LifeBuoy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TIMELINE = [
  { stage: "Intake Received", status: "complete" },
  { stage: "Game Customization", status: "in-progress" },
  { stage: "Monetization Setup", status: "pending" },
  { stage: "Testing", status: "pending" },
  { stage: "Client Review", status: "pending" },
  { stage: "App Store Submission", status: "pending" },
  { stage: "Launch Support", status: "pending" },
];

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[calc(100vh-4rem)] py-12"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Your App Launch Dashboard</h1>
            <p className="text-muted-foreground">Track the progress of your custom mobile game build.</p>
          </div>
          <Button variant="outline" className="border-white/10 hover:bg-white/5">
            <LifeBuoy className="w-4 h-4 mr-2" />
            Submit Support Ticket
          </Button>
        </div>

        {/* Status Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          <Card className="bg-card border-white/5 p-4 flex flex-col justify-between h-24">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Game Type</span>
            <div className="flex items-center text-sm font-medium text-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
              Selected
            </div>
          </Card>
          <Card className="bg-card border-white/5 p-4 flex flex-col justify-between h-24">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Branding</span>
            <div className="flex items-center text-sm font-medium text-primary">
              <Clock className="w-4 h-4 mr-2" />
              In Review
            </div>
          </Card>
          <Card className="bg-card border-white/5 p-4 flex flex-col justify-between h-24">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Monetization</span>
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              Pending
            </div>
          </Card>
          <Card className="bg-card border-white/5 p-4 flex flex-col justify-between h-24">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">App Store</span>
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              Not Started
            </div>
          </Card>
          <Card className="bg-card border-white/5 p-4 flex flex-col justify-between h-24">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Timeline</span>
            <div className="flex items-center text-sm font-medium text-foreground">
              8-12 weeks
            </div>
          </Card>
          <Card className="bg-card border-white/5 p-4 flex flex-col justify-between h-24">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Checklist</span>
            <div className="flex items-center text-sm font-medium text-foreground">
              <span className="text-primary mr-1">2</span> of 7 Complete
            </div>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="bg-card/50 border-white/5 p-8 md:p-12 rounded-3xl">
          <h2 className="text-xl font-bold mb-8">Development Roadmap</h2>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-white/10" />

            <div className="space-y-10 relative">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="relative z-10 shrink-0 bg-card">
                    {item.status === "complete" && (
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary shadow-[0_0_15px_-3px_hsl(var(--primary))]">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                    {item.status === "in-progress" && (
                      <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center relative">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                        <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                      </div>
                    )}
                    {item.status === "pending" && (
                      <div className="w-10 h-10 rounded-full border border-white/20 bg-background flex items-center justify-center" />
                    )}
                  </div>
                  
                  <div className="pt-2 flex-1">
                    <h3 className={`text-lg font-medium ${item.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                      {item.stage}
                    </h3>
                    {item.status === "in-progress" && (
                      <p className="text-sm text-primary mt-1">Currently working on this phase</p>
                    )}
                    {item.status === "complete" && (
                      <p className="text-sm text-muted-foreground mt-1">Completed successfully</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}