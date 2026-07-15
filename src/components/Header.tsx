"use client";
import React from "react";
import { Shield, Network, LayoutDashboard, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Header() {
  const pathname = usePathname();
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full flex flex-col sm:flex-row items-center justify-between p-6 glass-panel border-x-0 border-t-0 rounded-none z-50 sticky top-0 gap-4 sm:gap-0"
    >
      <div className="flex items-center gap-5">
        <div className="relative flex items-center justify-center w-14 h-14">
          {/* Stylized Logo: Shield with interconnected network and '6' */}
          <Shield className="w-12 h-12 text-cyan-glow opacity-80" strokeWidth={1.5} />
          <Network className="w-5 h-5 text-gold absolute -mt-2" strokeWidth={2} />
          <span className="absolute mt-3 text-cyan-glow font-bold text-lg text-glow font-mono">6</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-widest text-white drop-shadow-md">
            TELI<span className="text-cyan-glow text-glow">SIX</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-cyan-dark uppercase tracking-[0.2em] mt-1 font-mono">
            Cybersecurity & Scam Analysis Platform
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-[#040814]/50 p-1.5 rounded-full border border-glass-border">
        <Link 
          href="/" 
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs tracking-widest uppercase transition-all duration-300",
            pathname === "/" ? "bg-cyan-glow/20 text-cyan-glow text-glow shadow-[inset_0_0_10px_rgba(0,240,255,0.2)] border border-cyan-glow/30" : "text-slate-400 hover:text-slate-200 border border-transparent"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Scanner
        </Link>
        <Link 
          href="/academy" 
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs tracking-widest uppercase transition-all duration-300",
            pathname === "/academy" ? "bg-cyan-glow/20 text-cyan-glow text-glow shadow-[inset_0_0_10px_rgba(0,240,255,0.2)] border border-cyan-glow/30" : "text-slate-400 hover:text-slate-200 border border-transparent"
          )}
        >
          <GraduationCap className="w-4 h-4" />
          Academy
        </Link>
      </div>

      {/* Optional: Add profile or status indicator on the right */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse"></div>
        <span className="text-xs text-cyan-glow font-mono uppercase tracking-wider text-glow">System Online</span>
      </div>
    </motion.header>
  );
}
