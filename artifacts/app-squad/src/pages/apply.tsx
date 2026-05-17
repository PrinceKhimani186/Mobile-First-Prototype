import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: 1,
    title: "What's your primary goal?",
    subtitle: "Select the option that best describes why you want to launch a mobile game app.",
    options: [
      { label: "Side hustle", desc: "Build a new revenue stream alongside your current work" },
      { label: "Brand extension", desc: "Create a game that expands your existing brand" },
      { label: "Digital product ownership", desc: "Own and grow a digital asset over time" },
      { label: "Content creator game", desc: "Engage your audience with a branded experience" },
      { label: "Local business engagement", desc: "Drive customer loyalty through gamification" },
    ],
  },
  {
    id: 2,
    title: "What is your development budget?",
    subtitle: "Select the range that best reflects what you are prepared to invest.",
    options: [
      { label: "Under $500", desc: "Starter tier" },
      { label: "$500 – $1,000", desc: "Entry level" },
      { label: "$1,000 – $3,000", desc: "Standard build" },
      { label: "$3,000 – $5,000", desc: "Advanced build" },
      { label: "$5,000+", desc: "Full custom" },
    ],
  },
  {
    id: 3,
    title: "When are you looking to start?",
    subtitle: "Understanding your timeline helps us plan the right build path for you.",
    options: [
      { label: "Immediately", desc: "Ready to move forward this week" },
      { label: "This month", desc: "Targeting a start within 30 days" },
      { label: "30 – 60 days", desc: "Planning ahead" },
      { label: "Just researching", desc: "Gathering information for now" },
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
    }, 380);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Apply To Launch Your Custom Game App</h1>
          <p className="text-muted-foreground text-sm">Complete this short application to see if we're the right fit.</p>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between text-xs text-muted-foreground font-medium mb-3">
            <span>Step {step} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "text-xs font-medium transition-colors",
                  s.id < step ? "text-primary" : s.id === step ? "text-foreground" : "text-muted-foreground/40"
                )}
              >
                {s.id < step ? <Check className="w-3.5 h-3.5 inline" /> : s.id}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="glass rounded-3xl p-6 md:p-10 relative overflow-hidden min-h-[420px] shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="flex flex-col"
            >
              <h2 className="text-xl font-bold mb-1">{currentStepData.title}</h2>
              <p className="text-sm text-muted-foreground mb-7">{currentStepData.subtitle}</p>

              {step < 4 ? (
                <div className="grid gap-3">
                  {currentStepData.options.map((option) => {
                    const isSelected = answers[step] === option.label;
                    return (
                      <motion.button
                        key={option.label}
                        onClick={() => handleSelect(option.label)}
                        whileTap={{ scale: 0.99 }}
                        className={cn(
                          "relative p-4 text-left rounded-xl border transition-all duration-200",
                          isSelected
                            ? "bg-primary/10 border-primary text-foreground shadow-[0_0_20px_-5px_hsl(217_91%_60%_/_0.4)]"
                            : "bg-white/[0.02] border-white/[0.08] text-muted-foreground hover:bg-white/[0.05] hover:border-white/20 hover:text-foreground"
                        )}
                        data-testid={`option-${option.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold block">{option.label}</span>
                            <span className="text-xs text-muted-foreground mt-0.5 block">{option.desc}</span>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-4",
                            isSelected ? "border-primary bg-primary" : "border-white/20"
                          )}>
                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-7 mt-2">
                  <div className="flex items-start gap-4 bg-white/[0.03] p-5 rounded-xl border border-white/[0.08]">
                    <Checkbox
                      id="terms"
                      checked={understood}
                      onCheckedChange={(c) => setUnderstood(c as boolean)}
                      className="mt-0.5 w-5 h-5 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      data-testid="checkbox-terms"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      I understand App Squad does not guarantee earnings, downloads, app store rankings, approvals, or profits. App results depend entirely on marketing, user engagement, and platform approval.
                    </label>
                  </div>
                  <Button
                    size="lg"
                    disabled={!understood}
                    onClick={() => setLocation("/game-selection")}
                    className="w-full h-12 text-base font-semibold glow-blue disabled:opacity-30 disabled:shadow-none transition-all"
                    data-testid="button-schedule-demo"
                  >
                    Continue To Schedule Demo
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
