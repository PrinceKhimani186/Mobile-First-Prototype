import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#industries", label: "Industries" },
  { href: "#showcase", label: "AI Content" },
  { href: "#strategy-call", label: "Strategy Call" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = LINKS.map(l => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    setIsOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-[hsl(228_38%_4%_/_0.85)] backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_0_hsl(228_20%_14%_/_0.5)]"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <button
          onClick={() => scrollTo("#home")}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_16px_-3px_hsl(217_85%_58%_/_0.5)]">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            D<span className="text-primary">&amp;</span>B<span className="text-muted-foreground font-medium"> AI Marketing</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map(link => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                active === link.href
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop CTA */}
        <button
          onClick={() => scrollTo("#strategy-call")}
          className="hidden md:flex btn-primary h-9 px-5 text-sm font-semibold rounded-xl text-white items-center gap-2"
        >
          Book Call
          <Zap className="w-3.5 h-3.5" />
        </button>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setIsOpen(!isOpen)}
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
            className="md:hidden overflow-hidden bg-[hsl(228_38%_4%_/_0.98)] backdrop-blur-xl border-b border-white/[0.06]"
          >
            <nav className="flex flex-col px-4 py-3 gap-1">
              {LINKS.map(link => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-sm font-medium transition-all text-left cursor-pointer",
                    active === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                  )}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => scrollTo("#strategy-call")}
                className="btn-primary mt-2 h-11 px-5 text-sm font-semibold rounded-xl text-white flex items-center justify-center gap-2"
              >
                Book Strategy Call
                <Zap className="w-4 h-4" />
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
