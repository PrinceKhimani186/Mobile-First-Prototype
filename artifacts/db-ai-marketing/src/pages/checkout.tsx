import { motion } from "framer-motion";
import { Zap, FileText, CreditCard } from "lucide-react";
import { useLocation } from "wouter";

export default function Checkout() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-5"
      style={{ background: "hsl(345 8% 4%)" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse at center, hsl(330 65% 40% / 0.18) 0%, transparent 65%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 text-center max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: "linear-gradient(135deg, hsl(340 72% 46%), hsl(300 60% 44%))", boxShadow: "0 0 32px -8px hsl(330 65% 52% / 0.4)" }}>
            <Zap className="w-7 h-7 text-white" />
          </div>

          <p className="label-text mb-5">Partnership Onboarding</p>

          <h1 className="section-headline mb-5 leading-[1.05]">
            Start Your AI Marketing Partnership
          </h1>

          <p className="body-premium mb-10 max-w-md mx-auto">
            Your package, contract, onboarding payment, and monthly plan will be confirmed after your strategy call.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <button className="btn-primary h-13 px-8 text-[14px] rounded-xl flex items-center gap-2.5 justify-center py-3.5">
              <CreditCard className="w-4 h-4 opacity-80" />
              Complete Onboarding Payment
            </button>
            <button className="btn-ghost h-13 px-8 text-[14px] rounded-xl flex items-center gap-2.5 justify-center py-3.5">
              <FileText className="w-4 h-4 opacity-70" />
              Review Agreement
            </button>
          </div>

          <p style={{ fontFamily: "'Inter'", fontSize: 11, color: "hsl(30 8% 30%)", lineHeight: 1.7 }}>
            This page is for qualified clients following a completed strategy call.{" "}
            <button
              onClick={() => { navigate("/apply"); window.scrollTo({ top: 0 }); }}
              className="cursor-pointer transition-colors"
              style={{ color: "hsl(330 55% 55%)", textDecoration: "underline" }}
            >
              Apply here
            </button>{" "}
            if you haven't started yet.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
