import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/presentation", label: "Presentation" },
  { href: "/apply", label: "Apply" },
  { href: "/book-call", label: "Book Call" },
  { href: "/scheduled-leads", label: "For Scheduled Leads" },
];

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="App Squad logo mark"
            className="h-9 w-9 object-contain object-top brightness-110 group-hover:brightness-130 transition-all duration-200 drop-shadow-[0_0_8px_hsl(217_91%_60%_/_0.45)]"
          />
          <span className="font-display text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            App<span className="text-primary">Squad</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={cn(
                  "px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer",
                  location === link.href
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                )}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        <Link href="/start" className="hidden md:flex">
          <span className="btn-gold h-9 px-5 text-[13px] font-semibold rounded-xl flex items-center gap-2 text-white cursor-pointer">
            Watch Presentation
            <Zap className="w-3.5 h-3.5" />
          </span>
        </Link>

        <button
          className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-white/[0.06]"
          >
            <nav className="flex flex-col px-4 py-3 gap-1">
              {LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                  <span
                    className={cn(
                      "block px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer",
                      location === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
              <Link href="/start" onClick={() => setIsOpen(false)}>
                <span className="btn-gold mt-2 h-11 text-[14px] font-semibold rounded-xl flex items-center justify-center gap-2 text-white cursor-pointer">
                  Watch Presentation
                  <Zap className="w-4 h-4" />
                </span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
