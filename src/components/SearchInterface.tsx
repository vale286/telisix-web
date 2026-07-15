"use client";
import React, { useState, useEffect } from "react";
import { Phone, Link as LinkIcon, Scan, AlertTriangle, CheckCircle2, ShieldAlert, Terminal, Activity, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Tooltip = ({ children, content, position = "top" }: { children: React.ReactNode, content: string, position?: "top" | "bottom" }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-1" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: position === "top" ? 5 : -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === "top" ? 5 : -5 }}
            className={cn(
              "absolute z-50 left-1/2 -translate-x-1/2 w-48 p-2 bg-[#0a1128]/95 border border-cyan-glow/50 rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.2)] text-[10px] text-cyan-glow font-mono leading-relaxed pointer-events-none backdrop-blur-md",
              position === "top" ? "bottom-full mb-2" : "top-full mt-2"
            )}
          >
            {content}
            <div className={cn(
              "absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0a1128] border-cyan-glow/50 rotate-45",
              position === "top" ? "-bottom-1 border-b border-r" : "-top-1 border-t border-l"
            )}></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function SearchInterface() {
  const [activeTab, setActiveTab] = useState<"phone" | "link">("phone");
  const [inputValue, setInputValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || isScanning) return;
    
    setIsScanning(true);
    setScanResult(null);
    setScanProgress(0);

    // Simulate progress animation while waiting for API
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) return 90; // Hold at 90% until API responds
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    try {
      const endpoint = activeTab === "phone" ? "/scan-phone" : "/scan-url";
      const payload = activeTab === "phone" 
        ? { phone_number: inputValue } 
        : { url_string: inputValue };

      const basePath = process.env.NODE_ENV === "production"
        ? "/api/backend"
        : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/backend");

      const response = await fetch(`${basePath}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Read the error detail from FastAPI
        const errorData = await response.json().catch(() => ({}));
        console.log("FastAPI Bad Request Details:", errorData);
        throw new Error(errorData.detail || `API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Adapt the FastAPI response to our frontend state structure
      if (activeTab === "phone") {
        setScanResult({
          riskLevel: data.threat_level,
          score: data.score,
          location: data.osint_data.location,
          carrier: data.osint_data.carrier,
          reports: data.osint_data.flags.length,
          tags: data.osint_data.flags,
          details: data.osint_data.details
        });
      } else {
        setScanResult({
          riskLevel: data.threat_level,
          score: data.score,
          domainAge: data.threat_intel.domain_age,
          registrar: "WHOIS Hidden", // Mapped generically since backend didn't provide this field
          ssl: data.threat_intel.ssl_status,
          tags: data.threat_intel.flags,
          details: data.threat_intel.details
        });
      }
    } catch (error: any) {
      console.error("Scan error:", error);
      // Fallback UI state for connection errors or validation errors
      setScanResult({
        riskLevel: "ERROR",
        score: 0,
        location: "-",
        carrier: "-",
        domainAge: "-",
        registrar: "-",
        ssl: "-",
        reports: 0,
        tags: ["Request Failed"],
        details: error.message || "Failed to connect to the TELISIX intelligence network. Ensure FastAPI backend is running on port 8000."
      });
    } finally {
      clearInterval(interval);
      setScanProgress(100);
      // Give a small delay before hiding the progress bar
      setTimeout(() => setIsScanning(false), 500);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 px-4 relative z-10">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-panel rounded-2xl p-6 sm:p-8 relative"
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-glow opacity-50 rounded-tl-2xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-glow opacity-50 rounded-tr-2xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-glow opacity-50 rounded-bl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-glow opacity-50 rounded-br-2xl"></div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-glass-border pb-4 relative">
          <button
            onClick={() => { setActiveTab("phone"); setInputValue(""); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-mono text-sm tracking-widest uppercase transition-all duration-300 relative",
              activeTab === "phone" ? "text-cyan-glow text-glow" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Phone className="w-4 h-4" />
            Phone Lookup
            {activeTab === "phone" && (
              <motion.div 
                layoutId="activeTabIndicator" 
                className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-cyan-glow shadow-[0_0_8px_#00f0ff]" 
              />
            )}
          </button>
          
          <button
            onClick={() => { setActiveTab("link"); setInputValue(""); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-mono text-sm tracking-widest uppercase transition-all duration-300 relative",
              activeTab === "link" ? "text-cyan-glow text-glow" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <LinkIcon className="w-4 h-4" />
            Link Scanner
            {activeTab === "link" && (
              <motion.div 
                layoutId="activeTabIndicator" 
                className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-cyan-glow shadow-[0_0_8px_#00f0ff]" 
              />
            )}
          </button>
        </div>

        {/* Input Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleScan}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    activeTab === "phone" 
                      ? "Enter Phone Number (e.g., +62 812...)" 
                      : "Paste Suspicious Link (URL)"
                  }
                  className="w-full bg-[#0a1128]/80 border border-glass-border focus:border-cyan-glow focus:outline-none rounded-xl px-6 py-4 text-white placeholder-slate-500 transition-colors shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-30">
                  {activeTab === "phone" ? <Phone className="w-5 h-5 text-cyan-glow" /> : <LinkIcon className="w-5 h-5 text-cyan-glow" />}
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isScanning}
                className={cn(
                  "glass-panel-glow text-cyan-glow font-bold tracking-widest px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all group overflow-hidden relative",
                  isScanning ? "opacity-50 cursor-not-allowed bg-cyan-glow/5" : "bg-cyan-glow/10 hover:bg-cyan-glow/20 active:scale-95"
                )}
              >
                {!isScanning && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-glow/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>}
                {isScanning ? (
                  <Activity className="w-5 h-5 animate-pulse" />
                ) : (
                  <Scan className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                )}
                <span className="text-glow font-mono">{isScanning ? "SCANNING..." : "SCAN"}</span>
              </button>
            </motion.form>
          </AnimatePresence>
          
          {/* Clickable Example Suggestions */}
          <div className="mt-3 flex items-center gap-2 flex-wrap z-0">
            <span className="text-xs font-mono text-slate-500">Try examples:</span>
            {activeTab === "link" ? (
              <>
                <button type="button" onClick={() => setInputValue("http://claim-prize-now.com")} className="text-xs font-mono text-cyan-glow bg-cyan-glow/10 border border-cyan-glow/30 px-2 py-0.5 rounded hover:bg-cyan-glow/20 transition-colors shadow-sm cursor-pointer">
                  http://claim-prize-now.com
                </button>
                <button type="button" onClick={() => setInputValue("https://github.com")} className="text-xs font-mono text-cyan-glow bg-cyan-glow/10 border border-cyan-glow/30 px-2 py-0.5 rounded hover:bg-cyan-glow/20 transition-colors shadow-sm cursor-pointer">
                  https://github.com
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setInputValue("+628111111111")} className="text-xs font-mono text-cyan-glow bg-cyan-glow/10 border border-cyan-glow/30 px-2 py-0.5 rounded hover:bg-cyan-glow/20 transition-colors shadow-sm cursor-pointer">
                +628111111111
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 border-t border-glass-border pt-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2 text-cyan-glow font-mono text-sm">
                <span className="flex items-center gap-2"><Activity className="w-4 h-4 animate-pulse" /> INITIATING DEEP SCAN...</span>
                <span>{scanProgress > 100 ? 100 : scanProgress}%</span>
              </div>
              <div className="w-full h-1 bg-[#0a1128] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-cyan-glow shadow-[0_0_10px_#00f0ff]"
                  animate={{ width: `${scanProgress > 100 ? 100 : scanProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <div className="mt-4 font-mono text-xs text-slate-400 flex flex-col gap-1">
                <span className="animate-pulse text-cyan-dark">&gt; Intercepting signal...</span>
                {scanProgress > 30 && <span className="animate-pulse text-cyan-dark">&gt; Querying global threat database...</span>}
                {scanProgress > 70 && <span className="animate-pulse text-cyan-dark">&gt; Analyzing heuristic patterns...</span>}
              </div>
            </motion.div>
          )}

          {scanResult && !isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 border-t border-glass-border pt-6"
            >
              <div className={cn(
                "p-6 rounded-xl border relative",
                scanResult.riskLevel === "CRITICAL" ? "bg-red-950/20 border-red-500/50" : 
                scanResult.riskLevel === "HIGH" ? "bg-orange-950/20 border-orange-500/50" : 
                "bg-green-950/20 border-green-500/50"
              )}>
                {/* Result Content */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                     {scanResult.riskLevel === "CRITICAL" ? <ShieldAlert className="w-8 h-8 text-red-500" /> : 
                      scanResult.riskLevel === "HIGH" ? <AlertTriangle className="w-8 h-8 text-orange-500" /> : 
                      <CheckCircle2 className="w-8 h-8 text-green-500" />}
                     <div>
                       <h3 className="text-xl font-bold font-mono tracking-wider text-white">THREAT LEVEL: <span className={
                         scanResult.riskLevel === "CRITICAL" ? "text-red-500 text-glow" : 
                         scanResult.riskLevel === "HIGH" ? "text-orange-500 text-glow" : "text-green-500 text-glow"
                       }>{scanResult.riskLevel}</span></h3>
                       <div className="text-xs text-slate-400 font-mono mt-1 flex items-center">
                         Confidence Score: {scanResult.score}/100
                         <Tooltip content="Indicates the probability of a threat. A score closer to 100 means high certainty of malicious activity.">
                           <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-glow transition-colors cursor-help" />
                         </Tooltip>
                       </div>
                     </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {activeTab === "phone" ? (
                    <>
                      <div className="bg-[#040814]/50 p-3 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Location</span>
                        <span className="text-sm text-slate-200 font-mono">{scanResult.location}</span>
                      </div>
                      <div className="bg-[#040814]/50 p-3 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center mb-1">
                          Carrier
                          <Tooltip content="The telecommunications network providing the service." position="bottom">
                            <HelpCircle className="w-3 h-3 text-slate-500 hover:text-cyan-glow transition-colors cursor-help" />
                          </Tooltip>
                        </span>
                        <span className="text-sm text-slate-200 font-mono flex items-center gap-1 flex-wrap">
                          {scanResult.carrier}
                          {scanResult.carrier?.toLowerCase().includes("voip") && (
                            <Tooltip content="Voice over Internet Protocol: A virtual internet phone number. Highly favored by scammers as it hides their real physical location." position="bottom">
                              <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded cursor-help">VoIP</span>
                            </Tooltip>
                          )}
                        </span>
                      </div>
                      <div className="bg-[#040814]/50 p-3 rounded-lg border border-white/5 sm:col-span-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center mb-1">
                          Reports
                          <Tooltip content="Open-Source Intelligence: Footprints gathered from public records, forums, social media, and databases." position="bottom">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-glow transition-colors cursor-help" />
                          </Tooltip>
                        </span>
                        <span className="text-sm text-red-400 font-mono">{scanResult.reports} {scanResult.reports === 1 ? "flag" : "flags"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-[#040814]/50 p-3 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Domain Age</span>
                        <span className="text-sm text-red-400 font-mono">{scanResult.domainAge}</span>
                      </div>
                      <div className="bg-[#040814]/50 p-3 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center mb-1">
                          Registrar
                          <Tooltip content="The company where this website domain was purchased. Scammers often use registrars that hide their true identity (WHOIS Hidden)." position="bottom">
                            <HelpCircle className="w-3 h-3 text-slate-500 hover:text-cyan-glow transition-colors cursor-help" />
                          </Tooltip>
                        </span>
                        <span className="text-sm text-slate-200 font-mono">{scanResult.registrar}</span>
                      </div>
                      <div className="bg-[#040814]/50 p-3 rounded-lg border border-white/5 sm:col-span-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">SSL Status</span>
                        <span className="text-sm text-red-400 font-mono">{scanResult.ssl}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex gap-2 flex-wrap">
                    {scanResult.tags.map((tag: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#040814]/80 p-4 rounded-lg border border-glass-border">
                  <div className="flex items-start gap-3">
                    <Terminal className="w-5 h-5 text-cyan-glow mt-0.5 opacity-70 flex-shrink-0" />
                    <p className="text-sm text-slate-300 font-mono leading-relaxed">{scanResult.details}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
