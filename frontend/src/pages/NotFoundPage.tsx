import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div id="bauhaus-404-container" className="relative min-h-screen w-full flex items-center justify-center bg-background text-foreground p-6 md:p-12 font-sans selection:bg-foreground selection:text-background">
      {/* Structural Grid Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06] grid grid-cols-6 grid-rows-6">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="border-t border-l border-foreground" />
        ))}
      </div>

      {/* Main Poster Layout — A Strict Bauhaus Composition Frame */}
      <main className="relative z-10 w-full max-w-3xl border-2 border-foreground bg-card p-8 md:p-12 shadow-none flex flex-col justify-between aspect-[3/4] md:aspect-[4/3] min-h-[500px] transition-colors duration-200">
        
        {/* Top Header Segment */}
        <div className="flex justify-between items-start border-b-2 border-foreground pb-6 w-full">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Form Follows Function
            </div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-foreground font-mono">
              Marko / Sys.Err
            </h1>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="size-2 bg-bauhaus-red rounded-none" />
            <div className="size-2 bg-bauhaus-blue rounded-full" />
            <div className="size-2 bg-bauhaus-yellow w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[7px] border-b-current" />
          </div>
        </div>

        {/* Middle Section: Geometric Bauhaus Abstract Artwork & 404 Typography */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 my-8 items-center w-full">
          
          {/* Left Column: Overlapping Geometric Shapes */}
          <div className="relative aspect-square w-full max-w-[240px] mx-auto md:mx-0 border-2 border-foreground bg-muted/20 p-6 flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Reference Grid lines */}
              <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity="0.3" />
              <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity="0.3" />
              
              {/* Bauhaus red square */}
              <rect x="25" y="45" width="80" height="80" className="fill-bauhaus-red stroke-foreground" strokeWidth="2.5" />
              {/* Bauhaus yellow triangle */}
              <polygon points="120,30 75,120 165,120" className="fill-bauhaus-yellow stroke-foreground" strokeWidth="2.5" />
              {/* Bauhaus blue circle */}
              <circle cx="120" cy="115" r="40" className="fill-bauhaus-blue stroke-foreground" strokeWidth="2.5" />
            </svg>
          </div>

          {/* Right Column: Information Details */}
          <div className="flex flex-col justify-center gap-3 text-left">
            <div className="text-7xl md:text-8xl font-heading font-black tracking-tighter text-foreground leading-none select-none">
              404
            </div>
            <h2 className="text-lg font-bold uppercase tracking-widest text-foreground font-mono">
              [Lost in Space]
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs font-mono">
              The coordinates provided do not reference a defined path in this learning environment. Sector lookup failed.
            </p>
            
            <div className="pt-3">
              <button
                id="return-dashboard-btn"
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background font-bold uppercase tracking-widest text-[10px] rounded-none border border-foreground hover:bg-background hover:text-foreground transition-all duration-200 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer segment */}
        <div className="border-t-2 border-foreground pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 w-full text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>
            Ref: Weimar 1919 / Dessau 1925
          </span>
          <span>
            Status: Connection Interrupted
          </span>
        </div>
      </main>
    </div>
  );
}
