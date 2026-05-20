import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Check, ShieldCheck, Briefcase, Star, Gem, Target, Store, DollarSign, Wallet, CreditCard, Rocket, Building, Calendar, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: 1,
    title: "What's your primary goal?",
    subtitle: "Select the option that best describes why you want to launch a mobile game app.",
    options: [
      { label: "Side hustle", desc: "Build a new revenue stream alongside your current work", icon: Briefcase },
      { label: "Brand extension", desc: "Create a game that expands your existing brand", icon: Star },
      { label: "Digital product ownership", desc: "Own and grow a digital asset over time", icon: Gem },
      { label: "Content creator game", desc: "Engage your audience with a branded experience", icon: Target },
      { label: "Local business engagement", desc: "Drive customer loyalty through gamification", icon: Store },
    ],
  },
  {
    id: 2,
    title: "What is your development budget?",
    subtitle: "Select the range that best reflects what you are prepared to invest.",
    options: [
      { label: "Under $500", desc: "Starter tier", icon: DollarSign },
      { label: "$500 – $1,000", desc: "Entry level", icon: Wallet },
      { label: "$1,000 – $3,000", desc: "Standard build", icon: CreditCard },
      { label: "$3,000 – $5,000", desc: "Advanced build", icon: Building },
      { label: "$5,000+", desc: "Full custom", icon: Gem },
    ],
  },
  {
    id: 3,
    title: "When are you looking to start?",
    subtitle: "Understanding your timeline helps us plan the right build path for you.",
    options: [
      { label: "Immediately", desc: "Ready to move forward this week", icon: Rocket },
      { label: "This month", desc: "Targeting a start within 30 days", icon: Calendar },
      { label: "30 – 60 days", desc: "Planning ahead", icon: Target },
      { label: "Just researching", desc: "Gathering information for now", icon: Search },
    ],
  },
  {
    id: 4,
    title: "One last thing",
    subtitle: "Please confirm you understand App Squad's service model before continuing.",
    options: [],
  },
];

export default function Apply() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [understood, setUnderstood] = useState(false);

  const progress = (step / STEPS.length) * 100;
  const currentStepData = STEPS[step - 1];

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [step]: option });
    setTimeout(() => {
      if (step < STEPS.length) setStep(step + 1);
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col py-12 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(217_91%_60%_/_0.1)_0%,transparent_60%)] pointer-events-none" />
      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Apply To Launch Your Custom Game App</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">Complete this short application to see if we're the right fit.</p>
        </div>

        {/* Progress */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-muted-foreground font-medium mb-4">
            <span>Step {step} of {STEPS.length}</span>
            <span className="text-primary">{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_hsl(217_91%_60%_/_0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <div className="flex justify-between mt-4">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2",
                  s.id < step ? "bg-primary border-primary text-primary-foreground" : 
                  s.id === step ? "border-primary text-primary" : "border-white/10 text-muted-foreground/40"
                )}
              >
                {s.id < step ? <Check className="w-4 h-4" /> : s.id}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="glass rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden min-h-[480px] shadow-2xl border-2 border-white/5 mx-auto max-w-2xl bg-card/80 backdrop-blur-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col h-full"
            >
              {/* Breadcrumb for previous steps */}
              {step > 1 && (
                <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-white/10 text-xs text-muted-foreground font-medium">
                   {Object.entries(answers).filter(([k]) => parseInt(k) < step).map(([k, v], idx) => (
                     <span key={k} className="flex items-center gap-2">
                       <span className="bg-white/5 px-2 py-1 rounded-md text-foreground/80">{v}</span>
                       {idx < Object.entries(answers).length - 1 && <span className="text-white/20">→</span>}
                     </span>
                   ))}
                </div>
              )}

              <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">{currentStepData.title}</h2>
              <p className="text-base text-muted-foreground mb-8">{currentStepData.subtitle}</p>

              {step < 4 ? (
                <div className="grid gap-4">
                  {currentStepData.options.map((option) => {
                    const isSelected = answers[step] === option.label;
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.label}
                        onClick={() => handleSelect(option.label)}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "relative p-5 text-left rounded-2xl border-2 transition-all duration-300 group",
                          isSelected
                            ? "bg-primary/10 border-primary text-foreground shadow-[0_0_25px_-5px_hsl(217_91%_60%_/_0.3)]"
                            : "bg-white/[0.02] border-white/10 text-muted-foreground hover:bg-white/[0.05] hover:border-white/30 hover:text-foreground"
                        )}
                        data-testid={`option-${option.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={cn("p-3 rounded-xl transition-colors", isSelected ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground group-hover:text-foreground")}>
                             {Icon && <Icon className="w-6 h-6" />}
                          </div>
                          <div className="flex-1">
                            <span className="text-lg font-bold block mb-1">{option.label}</span>
                            <span className="text-sm text-muted-foreground block">{option.desc}</span>
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-4",
                            isSelected ? "border-primary bg-primary" : "border-white/20"
                          )}>
                            {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-8 mt-4">
                  <div className="flex items-start gap-5 bg-primary/5 p-6 rounded-2xl border-2 border-primary/20 shadow-inner">
                    <ShieldCheck className="w-8 h-8 text-primary shrink-0 mt-1" />
                    <div className="flex flex-col gap-3">
                      <Checkbox
                        id="terms"
                        checked={understood}
                        onCheckedChange={(c) => setUnderstood(c as boolean)}
                        className="w-6 h-6 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        data-testid="checkbox-terms"
                      />
                      <label htmlFor="terms" className="text-base text-foreground/90 leading-relaxed cursor-pointer font-medium">
                        I understand App Squad does not guarantee earnings, downloads, app store rankings, approvals, or profits. App results depend entirely on marketing, user engagement, and platform approval.
                      </label>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    disabled={!understood}
                    onClick={() => setLocation("/schedule-call")}
                    className="btn-primary w-full h-13 text-base font-semibold rounded-xl text-white disabled:opacity-25 disabled:shadow-none mt-auto"
                    data-testid="button-schedule-demo"
                  >
                    Continue To Schedule Call
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
