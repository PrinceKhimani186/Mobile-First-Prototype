import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Upload, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const PROGRESS_STEPS = ["Game Selected", "Brand Details", "Monetization", "Review"];

export default function Customize() {
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-4rem)] py-12"
    >
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-12 gap-0 overflow-x-auto pb-2">
          {PROGRESS_STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all shrink-0",
                  i === 0 ? "bg-primary/20 border-primary text-primary" :
                  i === 1 ? "bg-primary border-primary text-primary-foreground" :
                  "border-white/20 text-muted-foreground"
                )}>
                  {i === 0 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  i === 1 ? "text-foreground" : i === 0 ? "text-primary" : "text-muted-foreground"
                )}>
                  {label}
                </span>
              </div>
              {i < PROGRESS_STEPS.length - 1 && (
                <div className={cn(
                  "w-12 sm:w-20 h-px mx-2 mb-5 shrink-0",
                  i === 0 ? "bg-primary/50" : "bg-white/10"
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Customize Your App Brand</h1>
          <p className="text-muted-foreground text-sm">Provide the creative direction for your game's UI and branding identity.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 glass p-6 md:p-9 rounded-3xl shadow-2xl">

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="appName" className="text-sm font-medium">App Name</Label>
              <Input id="appName" placeholder="e.g. Zen Match 3" className="bg-white/[0.04] border-white/10 h-11 focus:border-primary/50 transition-colors" required data-testid="input-app-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandName" className="text-sm font-medium">Developer / Brand Name</Label>
              <Input id="brandName" placeholder="e.g. Acme Studios" className="bg-white/[0.04] border-white/10 h-11 focus:border-primary/50 transition-colors" required data-testid="input-brand-name" />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Logo Upload</Label>
            <div className="border-2 border-dashed border-white/10 hover:border-primary/40 transition-all rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group bg-white/[0.02]" data-testid="dropzone-logo">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">SVG, PNG, or JPG — max 5MB</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="colors" className="text-sm font-medium">Preferred Colors</Label>
              <Input id="colors" placeholder="e.g. Dark mode, neon purple accents" className="bg-white/[0.04] border-white/10 h-11 focus:border-primary/50 transition-colors" data-testid="input-colors" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience" className="text-sm font-medium">Target Audience</Label>
              <Input id="audience" placeholder="e.g. Adults 25–45, puzzle fans" className="bg-white/[0.04] border-white/10 h-11 focus:border-primary/50 transition-colors" data-testid="input-audience" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">App Description (App Store)</Label>
            <Textarea id="description" placeholder="Describe your game's unique hook and value proposition..." className="bg-white/[0.04] border-white/10 min-h-[110px] resize-none focus:border-primary/50 transition-colors" data-testid="textarea-description" />
          </div>

          {/* Monetization Radio */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Monetization Preference</Label>
            <RadioGroup defaultValue="both" className="grid sm:grid-cols-3 gap-3">
              {[
                { id: "ads", label: "Ads Only", desc: "Ad network revenue" },
                { id: "iap", label: "In-App Purchases", desc: "Upgrades and unlocks" },
                { id: "both", label: "Hybrid", desc: "Ads + IAP combined" },
              ].map((option) => (
                <div key={option.id}>
                  <RadioGroupItem value={option.id} id={`mono-${option.id}`} className="peer sr-only" />
                  <Label
                    htmlFor={`mono-${option.id}`}
                    className="flex flex-col items-center justify-center p-4 border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/[0.07] peer-data-[state=checked]:shadow-[0_0_16px_-4px_hsl(217_91%_60%_/_0.4)] transition-all text-center"
                    data-testid={`radio-monetization-${option.id}`}
                  >
                    <span className="font-semibold text-sm">{option.label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">{option.desc}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes for Development Team</Label>
            <Textarea id="notes" placeholder="Any specific feature requests, layout preferences, or gameplay ideas..." className="bg-white/[0.04] border-white/10 min-h-[90px] resize-none focus:border-primary/50 transition-colors" data-testid="textarea-notes" />
          </div>

          <div className="pt-2 border-t border-white/[0.06]">
            <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold glow-blue transition-all" data-testid="button-submit-brand">
              Submit Brand Details
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
