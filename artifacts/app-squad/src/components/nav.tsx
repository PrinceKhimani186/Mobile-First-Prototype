import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/training", label: "Training" },
  { href: "/apply", label: "Apply" },
  { href: "/game-selection", label: "Game Selection" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group" data-testid="link-home-logo">
          <img
            src="/logo.png"
            alt="App Squad logo mark"
            className="h-9 w-9 object-contain object-top brightness-110 group-hover:brightness-130 transition-all duration-200 drop-shadow-[0_0_8px_hsl(217_91%_60%_/_0.45)]"
            data-testid="img-logo"
          />
          <span className="font-display text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            App<span className="text-primary">Squad</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
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

        <button
          className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          data-testid="button-mobile-menu"
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
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
