import { Link } from "wouter";
import { Zap } from "lucide-react";

export function Nav() {
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

        <Link href="/start">
          <span className="btn-gold h-9 px-5 text-[13px] font-semibold rounded-xl flex items-center gap-2 text-white cursor-pointer">
            Watch Presentation
            <Zap className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </header>
  );
}
