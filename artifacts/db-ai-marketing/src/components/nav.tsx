import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", type: "anchor", anchor: "home", path: "/" },
  { label: "AI Campaigns", type: "anchor", anchor: "showcase", path: "/" },
  { label: "Services", type: "anchor", anchor: "services", path: "/" },
  { label: "Packages", type: "anchor", anchor: "packages", path: "/" },
  { label: "Apply", type: "route", path: "/apply" },
  { label: "Strategy Call", type: "route", path: "/strategy-call" },
];

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location, navigate] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLink = (link: (typeof NAV_LINKS)[0]) => {
    setIsOpen(false);
    if (link.type === "route") {
      navigate(link.path);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (location === "/") {
      document.getElementById(link.anchor!)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById(link.anchor!)?.scrollIntoView({ behavior: "smooth" });
      }, 180);
    }
  };

  const isActive = (link: (typeof NAV_LINKS)[0]) => {
    if (link.type === "route") return location === link.path;
    return location === "/";
  };

  const magentaGlow = "hsl(330 65% 52% / 0.12)";
  const magentaBorder = "hsl(330 65% 52% / 0.28)";

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "backdrop-blur-xl border-b shadow-[0_1px_0_0_hsl(345_10%_10%_/_0.5)]"
          : "bg-transparent"
      )}
      style={scrolled ? { background: "hsl(345 8% 4% / 0.88)", borderBottomColor: "hsl(345 10% 11%)" } : undefined}
    >
      <div className="container mx-auto px-5 md:px-8 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <button onClick={() => { navigate("/"); window.scrollTo({ top: 0 }); }} className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(340 72% 46%), hsl(300 60% 42%))", boxShadow: "0 0 16px -4px hsl(330 65% 52% / 0.5)" }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>
            D<span style={{ color: "hsl(330 65% 60%)" }}>&amp;</span>B
            <span style={{ fontFamily: "'Inter'", fontWeight: 400, fontSize: 14, color: "hsl(30 8% 45%)", marginLeft: 4 }}>AI Marketing</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => handleLink(link)}
              className="px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer"
              style={{
                fontFamily: "'Inter'",
                fontWeight: isActive(link) ? 600 : 400,
                background: isActive(link) ? magentaGlow : "transparent",
                border: isActive(link) ? `1px solid ${magentaBorder}` : "1px solid transparent",
                color: isActive(link) ? "hsl(330 65% 68%)" : "hsl(30 8% 48%)",
              }}
              onMouseEnter={e => { if (!isActive(link)) (e.currentTarget as HTMLElement).style.color = "hsl(30 15% 80%)"; }}
              onMouseLeave={e => { if (!isActive(link)) (e.currentTarget as HTMLElement).style.color = "hsl(30 8% 48%)"; }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop CTA */}
        <button
          onClick={() => { navigate("/apply"); window.scrollTo({ top: 0 }); }}
          className="hidden lg:flex btn-primary h-9 px-5 text-[13px] rounded-xl items-center gap-2"
        >
          Apply Now
          <Zap className="w-3.5 h-3.5" />
        </button>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 -mr-2 transition-colors cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          style={{ color: "hsl(30 8% 48%)" }}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden border-b"
            style={{ background: "hsl(345 8% 4% / 0.98)", backdropFilter: "blur(20px)", borderBottomColor: "hsl(345 10% 11%)" }}
          >
            <nav className="flex flex-col px-5 py-3 gap-1">
              {NAV_LINKS.map(link => (
                <button
                  key={link.label}
                  onClick={() => handleLink(link)}
                  className="block px-4 py-3 rounded-xl text-[13px] font-medium transition-all text-left cursor-pointer"
                  style={{
                    fontFamily: "'Inter'",
                    fontWeight: isActive(link) ? 600 : 400,
                    background: isActive(link) ? magentaGlow : "transparent",
                    color: isActive(link) ? "hsl(330 65% 68%)" : "hsl(30 8% 52%)",
                  }}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => { navigate("/apply"); window.scrollTo({ top: 0 }); setIsOpen(false); }}
                className="btn-primary mt-2 h-11 text-[14px] rounded-xl text-white flex items-center justify-center gap-2"
              >
                Apply Now
                <Zap className="w-4 h-4" />
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
