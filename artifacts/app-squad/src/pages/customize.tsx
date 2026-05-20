import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Upload, Check, ArrowRight, Image as ImageIcon } from "lucide-react";
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
      className="min-h-[calc(100vh-4rem)] py-12 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(217_91%_60%_/_0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="container mx-auto px-4 max-w-3xl relative z-10">

        {/* Visual Progress Stepper */}
        <div className="flex items-center justify-between mb-16 relative">
          <div className="absolute top-5 left-8 right-8 h-1 bg-white/10 rounded-full z-0" />
          <div className="absolute top-5 left-8 right-[66%] h-1 bg-primary rounded-full z-0 shadow-[0_0_10px_hsl(217_91%_60%_/_0.5)]" />
          
          {PROGRESS_STEPS.map((label, i) => {
            const isCompleted = i === 0;
            const isActive = i === 1;
            return (
              <div key={label} className="relative z-10 flex flex-col items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all shadow-xl bg-background",
                  isCompleted ? "border-primary bg-primary text-primary-foreground" :
                  isActive ? "border-primary text-primary shadow-[0_0_20px_-3px_hsl(217_91%_60%_/_0.6)]" :
                  "border-white/20 text-muted-foreground"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span className={cn(
                  "text-sm font-bold whitespace-nowrap hidden sm:block",
                  isActive ? "text-foreground" : isCompleted ? "text-primary" : "text-muted-foreground/50"
                )}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Customize Your App Brand</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Provide the creative direction for your game's UI and branding identity.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl border-2 border-white/5 bg-card/60 backdrop-blur-xl">

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="appName" className="text-base font-semibold">App Name</Label>
              <Input id="appName" placeholder="e.g. Zen Match 3" className="bg-background/50 border-white/10 h-14 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl" required data-testid="input-app-name" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="brandName" className="text-base font-semibold">Developer / Brand Name</Label>
              <Input id="brandName" placeholder="e.g. Acme Studios" className="bg-background/50 border-white/10 h-14 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl" required data-testid="input-brand-name" />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Brand Logo / App Icon</Label>
            <div className="border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer group bg-background/50" data-testid="dropzone-logo">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all shadow-inner">
                <ImageIcon className="w-8 h-8 text-primary" />
              </div>
              <p className="text-base font-bold mb-2">Drag your logo here or click to browse</p>
              <p className="text-sm text-muted-foreground">High-res SVG, PNG, or JPG (Max 10MB)</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="colors" className="text-base font-semibold">Preferred Aesthetic & Colors</Label>
              <Input id="colors" placeholder="e.g. Dark mode, neon purple accents" className="bg-background/50 border-white/10 h-14 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl" data-testid="input-colors" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="audience" className="text-base font-semibold">Target Audience Focus</Label>
              <Input id="audience" placeholder="e.g. Adults 25–45, puzzle fans" className="bg-background/50 border-white/10 h-14 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl" data-testid="input-audience" />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-semibold">App Store Description Concept</Label>
            <Textarea id="description" placeholder="Describe your game's unique hook and value proposition for the app store listing..." className="bg-background/50 border-white/10 min-h-[140px] text-base resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl p-4" data-testid="textarea-description" />
          </div>

          {/* Monetization Radio */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Primary Monetization Strategy</Label>
            <RadioGroup defaultValue="both" className="grid sm:grid-cols-3 gap-4">
              {[
                { id: "ads", label: "Ads Only", desc: "Ad network revenue" },
                { id: "iap", label: "In-App Purchases", desc: "Upgrades and unlocks" },
                { id: "both", label: "Hybrid Model", desc: "Ads + IAP combined" },
              ].map((option) => (
                <div key={option.id}>
                  <RadioGroupItem value={option.id} id={`mono-${option.id}`} className="peer sr-only" />
                  <Label
                    htmlFor={`mono-${option.id}`}
                    className="flex flex-col items-center justify-center p-5 border-2 border-white/10 rounded-xl bg-background/50 hover:bg-white/[0.05] cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/[0.08] peer-data-[state=checked]:shadow-[0_0_20px_-5px_hsl(217_91%_60%_/_0.4)] transition-all text-center h-full"
                    data-testid={`radio-monetization-${option.id}`}
                  >
                    <span className="font-bold text-base mb-1">{option.label}</span>
                    <span className="text-sm text-muted-foreground">{option.desc}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-semibold">Extra Notes for the Engineering Team</Label>
            <Textarea id="notes" placeholder="Any specific feature requests, layout preferences, or gameplay ideas..." className="bg-background/50 border-white/10 min-h-[100px] text-base resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl p-4" data-testid="textarea-notes" />
          </div>

          <div className="pt-6 border-t border-white/[0.08]">
            <button type="submit" className="btn-primary w-full h-13 text-base font-semibold rounded-xl text-white flex items-center justify-center gap-2" data-testid="button-submit-brand">
              Submit Brand Details & Proceed
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
