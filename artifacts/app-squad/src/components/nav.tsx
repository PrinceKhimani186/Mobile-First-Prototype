import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Zap, Code2, ChevronDown, LogIn, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ADMIN_STORAGE_KEY = "as_admin_auth";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/presentation", label: "Presentation" },
  { href: "/apply", label: "Apply" },
  { href: "/book-call", label: "Book Call" },
  { href: "/partner-program", label: "Partner Program" },
];

const DEV_LINKS = [
  { href: "/enrollment",                label: "Enrollment" },
  { href: "/onboarding/access",         label: "Onboarding Access" },
  { href: "/onboarding/game-selection", label: "Game Selection" },
  { href: "/onboarding/customization",  label: "Customization Form" },
  { href: "/onboarding/dashboard",      label: "Client Dashboard" },
];

function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(ADMIN_STORAGE_KEY) === "true");

  useEffect(() => {
    const sync = () => setIsAdmin(localStorage.getItem(ADMIN_STORAGE_KEY) === "true");
    window.addEventListener("as_admin_auth_change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("as_admin_auth_change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem("appSquadLoggedIn");
    localStorage.removeItem("appSquadUserEmail");
    localStorage.removeItem("appSquadAgreementSigned");
    localStorage.removeItem("appSquadGameSelected");
    localStorage.removeItem("appSquadCustomizationCompleted");
    localStorage.removeItem("appSquadEnrollmentEmail");
    window.dispatchEvent(new Event("as_admin_auth_change"));
  };

  return { isAdmin, logout };
}

function DevDropdown({ location }: { location: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = DEV_LINKS.some(l => location === l.href);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer border",
          isActive
            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
            : "text-amber-500/70 border-amber-500/20 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30"
        )}
      >
        <Code2 className="w-3 h-3" />
        Dev Access
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50"
            style={{ background: "hsl(226 32% 7%)", border: "1px solid hsl(35 90% 55% / 0.22)", boxShadow: "0 16px 48px -12px hsl(228 42% 4% / 0.9)" }}
          >
            <div className="px-3 pt-2.5 pb-1.5">
              <p style={{ fontFamily: "'Inter'", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(35 90% 55%)" }}>
                Onboarding Flow
              </p>
            </div>
            {DEV_LINKS.map((link, i) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                <span
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium transition-all cursor-pointer",
                    location === link.href
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                  )}
                >
                  <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 text-[9px] font-bold"
                    style={{ background: "hsl(224 22% 12%)", color: "hsl(35 90% 55%)" }}>
                    {i + 1}
                  </span>
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="px-3 pb-2.5 pt-1">
              <p style={{ fontFamily: "'Inter'", fontSize: 9, lineHeight: 1.5, color: "hsl(218 16% 30%)" }}>
                Internal routes — for CRM integration dev use.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { isAdmin, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
          {isAdmin && (
            <>
              <span className="mx-1.5 w-px h-4 bg-white/10" />
              <DevDropdown location={location} />
            </>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          ) : (
            <Link href="/login">
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer">
                <LogIn className="w-3.5 h-3.5" />
                Admin Login
              </span>
            </Link>
          )}
          <Link href="/start">
            <span className="btn-gold h-9 px-5 text-[13px] font-semibold rounded-xl flex items-center gap-2 text-white cursor-pointer">
              Watch Presentation
              <Zap className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

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

              {isAdmin && (
                <>
                  <div className="flex items-center gap-2 px-1 mt-2 mb-1">
                    <div className="flex-1 h-px" style={{ background: "hsl(35 90% 55% / 0.18)" }} />
                    <span className="flex items-center gap-1.5" style={{ fontFamily: "'Inter'", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(35 90% 50%)" }}>
                      <Code2 className="w-2.5 h-2.5" />
                      Dev / Onboarding
                    </span>
                    <div className="flex-1 h-px" style={{ background: "hsl(35 90% 55% / 0.18)" }} />
                  </div>

                  {DEV_LINKS.map((link, i) => (
                    <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                      <span
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                          location === link.href
                            ? "bg-amber-500/15 text-amber-400"
                            : "text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10"
                        )}
                      >
                        <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                          style={{ background: "hsl(224 22% 12%)", color: "hsl(35 90% 55%)" }}>
                          {i + 1}
                        </span>
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </>
              )}

              <div className="flex flex-col gap-2 mt-2">
                {isAdmin ? (
                  <button
                    onClick={() => { setIsOpen(false); handleLogout(); }}
                    className="flex items-center justify-center gap-2 h-11 text-[14px] font-semibold rounded-xl border border-white/10 text-white/50 cursor-pointer bg-transparent"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <span className="flex items-center justify-center gap-2 h-11 text-[14px] font-semibold rounded-xl border border-white/10 text-white/50 cursor-pointer">
                      <LogIn className="w-4 h-4" />
                      Admin Login
                    </span>
                  </Link>
                )}
                <Link href="/start" onClick={() => setIsOpen(false)}>
                  <span className="btn-gold h-11 text-[14px] font-semibold rounded-xl flex items-center justify-center gap-2 text-white cursor-pointer">
                    Watch Presentation
                    <Zap className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
