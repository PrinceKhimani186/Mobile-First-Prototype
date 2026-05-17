import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Upload, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Customize() {
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[calc(100vh-4rem)] py-12"
    >
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12 text-sm font-medium overflow-x-auto pb-4">
          <div className="flex items-center text-primary whitespace-nowrap">
            <span>Game Selected</span>
            <ChevronRight className="w-4 h-4 mx-2" />
          </div>
          <div className="flex items-center text-foreground whitespace-nowrap">
            <span>Brand Details</span>
            <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
          </div>
          <div className="flex items-center text-muted-foreground whitespace-nowrap">
            <span>Monetization</span>
            <ChevronRight className="w-4 h-4 mx-2" />
          </div>
          <div className="text-muted-foreground whitespace-nowrap">Review</div>
        </div>

        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">Customize Your App Brand</h1>
          <p className="text-muted-foreground">Provide the creative direction for your game's user interface and branding.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-card/30 p-6 md:p-8 rounded-3xl border border-white/5 shadow-xl">
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="appName">App Name</Label>
              <Input id="appName" placeholder="e.g. Zen Match 3" className="bg-background/50 h-12" required />
            </div>
            <div className="space-y-3">
              <Label htmlFor="brandName">Developer / Brand Name</Label>
              <Input id="brandName" placeholder="e.g. Acme Studios" className="bg-background/50 h-12" required />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Logo Upload</Label>
            <div className="border-2 border-dashed border-white/10 hover:border-primary/50 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-background/20 cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">SVG, PNG, or JPG (max. 5MB)</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="colors">Preferred Colors</Label>
              <Input id="colors" placeholder="e.g. Dark mode, Neon purple accents" className="bg-background/50 h-12" required />
            </div>
            <div className="space-y-3">
              <Label htmlFor="audience">Target Audience</Label>
              <Input id="audience" placeholder="e.g. Adults 25-45, puzzle fans" className="bg-background/50 h-12" required />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description">App Description (App Store)</Label>
            <Textarea 
              id="description" 
              placeholder="Describe your game's unique hook..." 
              className="bg-background/50 min-h-[120px] resize-none" 
              required 
            />
          </div>

          <div className="space-y-4">
            <Label>Monetization Preference</Label>
            <RadioGroup defaultValue="both" className="grid sm:grid-cols-3 gap-4">
              {[
                { id: "ads", label: "Ads Only" },
                { id: "iap", label: "In-App Purchases" },
                { id: "both", label: "Both (Hybrid)" },
              ].map((option) => (
                <div key={option.id}>
                  <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                  <Label
                    htmlFor={option.id}
                    className="flex flex-col items-center justify-center p-4 border border-white/10 rounded-xl bg-background/50 hover:bg-white/5 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all"
                  >
                    <span className="font-medium text-center">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes">Notes for Development Team</Label>
            <Textarea 
              id="notes" 
              placeholder="Any specific feature requests or layout preferences..." 
              className="bg-background/50 min-h-[100px] resize-none" 
            />
          </div>

          <div className="pt-6 border-t border-white/10">
            <Button type="submit" size="lg" className="w-full h-14 text-lg">
              Submit Brand Details
            </Button>
          </div>

        </form>
      </div>
    </motion.div>
  );
}