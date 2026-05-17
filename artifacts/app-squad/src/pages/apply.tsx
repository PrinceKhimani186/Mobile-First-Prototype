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
    title: "Your Goal",
    options: [
      "Side hustle",
      "Brand extension",
      "Digital product ownership",
      "Content creator game",
      "Local business engagement"
    ]
  },
  {
    id: 2,
    title: "Budget",
    options: [
      "Under $500",
      "$500 to $1,000",
      "$1,000 to $3,000",
      "$3,000 to $5,000",
      "$5,000+"
    ]
  },
  {
    id: 3,
    title: "Timeline",
    options: [
      "Immediately",
      "This month",
      "30 to 60 days",
      "Just researching"
    ]
  },
  {
    id: 4,
    title: "Understanding",
    options: []
  }
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

  const handleComplete = () => {
    setLocation("/game-selection");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col py-12 md:py-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">Apply To Launch Your Custom Game App</h1>
          <p className="text-muted-foreground">Complete this short application to see if we're a good fit.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="h-2 w-full bg-card border border-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <div className="flex justify-between text-sm mt-2 text-muted-foreground font-medium">
            <span>Step {step} of {STEPS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-card/30 border border-white/5 rounded-3xl p-6 md:p-10 relative overflow-hidden min-h-[400px] shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              <h2 className="text-2xl font-bold mb-8 text-center">{currentStepData.title}</h2>

              {step < 4 ? (
                <div className="grid gap-4">
                  {currentStepData.options.map((option) => {
                    const isSelected = answers[step] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={cn(
                          "relative p-6 text-left rounded-2xl border transition-all duration-300",
                          isSelected 
                            ? "bg-primary/10 border-primary text-foreground shadow-[0_0_20px_-5px_hsl(var(--primary))]" 
                            : "bg-card border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium">{option}</span>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                            isSelected ? "border-primary bg-primary" : "border-white/20"
                          )}>
                            {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between items-center text-center space-y-8 mt-4">
                  <div className="flex items-start gap-4 bg-black/40 p-6 rounded-2xl border border-white/5">
                    <Checkbox 
                      id="terms" 
                      checked={understood} 
                      onCheckedChange={(c) => setUnderstood(c as boolean)}
                      className="mt-1 w-6 h-6 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor="terms" className="text-left text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      I understand App Squad does not guarantee earnings, downloads, app store rankings, approvals, or profits. App results depend entirely on marketing, user engagement, and platform approval.
                    </label>
                  </div>
                  <Button 
                    size="lg" 
                    disabled={!understood}
                    onClick={handleComplete}
                    className="w-full h-14 text-lg"
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